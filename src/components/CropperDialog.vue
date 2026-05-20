<script setup lang="ts">
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { ref } from 'vue';
import { Cropper, RectangleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

import { i18nSubPath } from 'src/utils/common';

const props = defineProps<{
  src?: string | undefined;
}>();
defineEmits(useDialogPluginComponent.emitsObject);

const i18n = i18nSubPath('components.CropperDialog');

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { notify } = useQuasar();

const image = ref(props.src);
const imageFiles = ref<File | null>(null);
const cropper = ref<typeof Cropper>();

const onConfirm = () => {
  const croppedImage = cropper.value?.getResult()?.canvas?.toDataURL('image/jpeg', 0.85);
  if (croppedImage) {
    onDialogOK(croppedImage);
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
