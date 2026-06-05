<script setup lang="ts">
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import { Cropper, RectangleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

import {
  parentAvatarsByGender,
  type ParentAvatar,
  type ParentGender,
} from 'src/utils/defaultAvatars';
import { i18nSubPath } from 'src/utils/common';

const props = defineProps<{
  src?: string | undefined;
}>();
defineEmits(useDialogPluginComponent.emitsObject);

const i18n = i18nSubPath('components.CropperDialog');

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { notify } = useQuasar();

// Active tab: 'default' | 'upload'
const activeTab = ref<'default' | 'upload'>(props.src ? 'upload' : 'default');

// Gender filter for default avatars
const genderFilter = ref<ParentGender>('man');
const genderTabs = computed(() => [
  { key: 'man' as const, label: i18n('labels.man') },
  { key: 'woman' as const, label: i18n('labels.woman') },
]);
const filteredAvatars = computed<ParentAvatar[]>(() =>
  parentAvatarsByGender(genderFilter.value),
);

// Cropper state (for upload tab)
const image = ref(props.src);
const imageFiles = ref<File | null>(null);
const cropper = ref<typeof Cropper>();

// Selected default avatar
const selectedDefaultAvatar = ref<string | undefined>(props.src);

const onSelectDefaultAvatar = (avatar: ParentAvatar) => {
  selectedDefaultAvatar.value = avatar.url;
};

const isSelected = (avatar: ParentAvatar) => selectedDefaultAvatar.value === avatar.url;

const onConfirm = () => {
  // If on default tab and a default is selected, use it directly
  if (activeTab.value === 'default' && selectedDefaultAvatar.value) {
    onDialogOK(selectedDefaultAvatar.value);
    return;
  }

  // Otherwise, use cropped image
  const croppedImage = cropper.value?.getResult()?.canvas?.toDataURL('image/jpeg', 0.85);
  if (croppedImage) {
    onDialogOK(croppedImage);
  } else if (selectedDefaultAvatar.value) {
    // Fallback: if no crop result but a default is selected
    onDialogOK(selectedDefaultAvatar.value);
  } else {
    notify({
      type: 'negative',
      message: i18n('notifications.noImageToProcess'),
    });
  }
};

const onFileChange = (file: File | null) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    if (!event.target?.result || typeof event.target.result !== 'string') {
      return;
    }
    image.value = event.target.result;
  };
  reader.readAsDataURL(file);
};

const onRejected = () => {
  notify({
    type: 'negative',
    message: i18n('notifications.invalidFile'),
  });
};
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="cropper-dialog">
      <div class="cropper-dialog__title">{{ i18n('labels.title') }}</div>

      <!-- Tab switcher: Default / Upload -->
      <div class="cropper-dialog__tabs">
        <button
          type="button"
          class="cropper-dialog__tab"
          :class="{ 'cropper-dialog__tab--active': activeTab === 'default' }"
          @click="activeTab = 'default'"
        >
          {{ i18n('labels.tabDefault') }}
        </button>
        <button
          type="button"
          class="cropper-dialog__tab"
          :class="{ 'cropper-dialog__tab--active': activeTab === 'upload' }"
          @click="activeTab = 'upload'"
        >
          {{ i18n('labels.tabUpload') }}
        </button>
      </div>

      <!-- Default avatar tab -->
      <div v-if="activeTab === 'default'" class="cropper-dialog__default-panel">
        <!-- Gender sub-tabs -->
        <div class="cropper-dialog__gender-tabs">
          <button
            v-for="g in genderTabs"
            :key="g.key"
            type="button"
            class="cropper-dialog__gender-tab"
            :class="{ 'cropper-dialog__gender-tab--active': genderFilter === g.key }"
            @click="genderFilter = g.key"
          >
            {{ g.label }}
          </button>
        </div>

        <!-- Avatar grid -->
        <div class="cropper-dialog__avatar-grid">
          <button
            v-for="avatar in filteredAvatars"
            :key="`${avatar.gender}${avatar.index}`"
            type="button"
            class="cropper-dialog__avatar-option"
            :class="{ 'cropper-dialog__avatar-option--selected': isSelected(avatar) }"
            @click="onSelectDefaultAvatar(avatar)"
          >
            <img :src="avatar.url" :alt="`${avatar.gender} ${avatar.index}`" />
          </button>
        </div>

        <!-- Preview of selected default avatar -->
        <div class="cropper-dialog__preview-row">
          <div class="cropper-dialog__preview-circle">
            <img
              v-if="selectedDefaultAvatar"
              :src="selectedDefaultAvatar"
              class="cropper-dialog__preview-img"
              alt="selected avatar"
            />
          </div>
        </div>
      </div>

      <!-- Upload / crop tab -->
      <template v-if="activeTab === 'upload'">
        <q-file
          class="cropper-dialog__file q-mx-md"
          accept="image/*"
          :label="i18n('labels.chooseImage')"
          name="avatarFile"
          outlined
          dense
          v-model="imageFiles"
          @rejected="onRejected"
          @update:model-value="onFileChange"
        />

        <div class="cropper-dialog__canvas q-ma-sm">
          <q-responsive :ratio="1">
            <div v-if="!image" class="cropper-dialog__empty">
              <div class="cropper-dialog__empty-text">
                {{ i18n('labels.noImage') }}
              </div>
              <q-icon class="cropper-dialog__empty-icon" name="north" />
            </div>
            <Cropper ref="cropper" :src="image" :stencil-component="RectangleStencil" />
          </q-responsive>
        </div>

        <div class="cropper-dialog__toolbar">
          <q-btn
            icon="mdi-flip-horizontal"
            padding="0.5rem"
            size="0.75rem"
            outline
            @click="cropper?.flip(true, false)"
          />
          <q-btn
            icon="mdi-flip-vertical"
            padding="0.5rem"
            size="0.75rem"
            outline
            @click="cropper?.flip(false, true)"
          />
          <q-btn
            icon="mdi-rotate-left"
            padding="0.5rem"
            size="0.75rem"
            outline
            @click="cropper?.rotate(-90)"
          />
          <q-btn
            icon="mdi-rotate-right"
            padding="0.5rem"
            size="0.75rem"
            outline
            @click="cropper?.rotate(90)"
          />
          <q-btn
            icon="mdi-magnify-minus-outline"
            padding="0.5rem"
            size="0.75rem"
            outline
            @click="cropper?.zoom(0.5)"
          />
          <q-btn
            icon="mdi-magnify-plus-outline"
            padding="0.5rem"
            size="0.75rem"
            outline
            @click="cropper?.zoom(2)"
          />
        </div>
      </template>

      <div class="cropper-dialog__actions">
        <button type="button" class="cropper-dialog__btn cropper-dialog__btn--cancel" @click="onDialogCancel">
          {{ i18n('labels.cancel') }}
        </button>
        <button type="button" class="cropper-dialog__btn cropper-dialog__btn--confirm" @click="onConfirm">
          {{ i18n('labels.confirm') }}
        </button>
      </div>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.cropper-dialog {
  max-width: 90vw;
  min-width: 320px;
  border-radius: var(--dialog-radius, 16px);
  overflow: hidden;
}

.cropper-dialog__title {
  font-family: var(--font-family);
  font-size: var(--font-size-subtitle, 17px);
  font-weight: 500;
  line-height: var(--line-height-subtitle, 24px);
  color: var(--clr-text);
  padding: 20px 16px 8px;
}

/* Tab bar */
.cropper-dialog__tabs {
  display: flex;
  margin: 0 16px 12px;
  background: var(--clr-input-bg, rgba(240, 240, 245, 1));
  border-radius: 20px;
  padding: 3px;
  gap: 0;
}

.cropper-dialog__tab {
  flex: 1;
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  padding: 7px 0;
  border-radius: 17px;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--clr-caption, #9398a9);
  transition: all 0.2s;
  white-space: nowrap;

  &--active {
    background: var(--clr-white, #fff);
    color: var(--clr-text, #12102c);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
}

/* Default avatar panel */
.cropper-dialog__default-panel {
  padding: 0 16px 8px;
}

.cropper-dialog__gender-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.cropper-dialog__gender-tab {
  flex: 1;
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 16px;
  border: 1.5px solid var(--clr-border, rgba(220, 220, 230, 1));
  background: transparent;
  color: var(--clr-caption, #9398a9);
  cursor: pointer;
  transition: all 0.15s;

  &--active {
    border-color: var(--clr-primary, #12102c);
    color: var(--clr-text, #12102c);
    background: rgba(18, 14, 44, 0.05);
  }
}

.cropper-dialog__avatar-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.cropper-dialog__avatar-option {
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid transparent;
  background: none;
  padding: 0;
  cursor: pointer;
  transition:
    border-color 0.15s,
    transform 0.15s;

  &:hover {
    transform: scale(1.05);
  }

  &--selected {
    border-color: var(--clr-brand, #12102c);
    box-shadow: 0 0 0 2px rgba(18, 14, 44, 0.2);
  }

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.cropper-dialog__preview-row {
  display: flex;
  justify-content: center;
  margin-bottom: 4px;
}

.cropper-dialog__preview-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 1);
  background: rgba(229, 229, 239, 1);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.cropper-dialog__preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Canvas (crop area) */
.cropper-dialog__canvas {
  border-radius: var(--card-radius, 12px);
  overflow: hidden;
}

.cropper-dialog__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: absolute;
  inset: 0;
}

.cropper-dialog__empty-text {
  font-family: var(--font-family);
  font-size: var(--font-size-subtitle, 17px);
  font-weight: 500;
  color: var(--clr-caption);
  text-align: center;
  font-style: italic;
}

.cropper-dialog__empty-icon {
  color: var(--clr-caption) !important;
  font-size: 6rem;
  position: absolute;
  top: 16px;
}

.cropper-dialog__toolbar {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
}

.cropper-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 16px 20px;
}

.cropper-dialog__btn {
  font-family: var(--font-family);
  font-size: var(--font-size-body, 15px);
  font-weight: 500;
  line-height: var(--line-height-body, 21px);
  padding: 8px 20px;
  border-radius: var(--btn-radius, 22px);
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.cropper-dialog__btn--cancel {
  background: transparent;
  color: var(--clr-caption);
}

.cropper-dialog__btn--confirm {
  background: var(--clr-primary, rgba(18, 14, 44, 1));
  color: var(--clr-white, rgba(255, 255, 255, 1));
}

.cropper-dialog__btn--confirm:hover {
  opacity: 0.9;
}
</style>
