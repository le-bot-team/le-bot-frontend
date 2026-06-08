<script setup lang="ts">
// VoiceNamingPanel — shared "这是谁的声音" panel.
// Visual baseline: lanhu design d2a7b5f3 (DetailPage). Reused by both the
// voiceprint settings DetailPage (edit mode) and the recording flow
// SubmitPanel (register / addVoice). See plan VoiceNaming Unified Panel.
import { computed, onUnmounted, ref, watch } from 'vue';

import {
  getRelationshipLabel,
  getRelationshipOptions,
  type VprRelationship,
} from 'components/vpr-relationships';

const props = withDefaults(
  defineProps<{
    name: string;
    relationship: VprRelationship;
    avatarSrc?: string | undefined;
    audioSrc?: string | undefined;
    whoseVoiceLabel: string;
    namePlaceholder: string;
    relationshipLabel: string;
    relationshipSheetTitle: string;
    primaryLabel: string;
    primaryDisabled?: boolean;
    loading?: boolean;
    secondaryLabel: string;
    secondaryVariant?: 'weak' | 'danger';
    showSecondary?: boolean;
    nameEditable?: boolean;
    relationshipEditable?: boolean;
  }>(),
  {
    avatarSrc: undefined,
    audioSrc: undefined,
    primaryDisabled: false,
    loading: false,
    secondaryVariant: 'weak',
    showSecondary: true,
    nameEditable: true,
    relationshipEditable: true,
  },
);

const emit = defineEmits<{
  'update:name': [value: string];
  'update:relationship': [value: VprRelationship];
  primary: [];
  secondary: [];
}>();

const nameModel = computed({
  get: () => props.name,
  set: (v: string) => emit('update:name', v),
});

const relationshipText = computed(() => getRelationshipLabel(props.relationship));

// Relationship bottom-sheet state — mirrors SetupProfilePanel grid-chip UX.
const showRelationSheet = ref(false);

const relationOptions = computed(() => getRelationshipOptions());

const onEscape = (e: KeyboardEvent): void => {
  if (e.key === 'Escape') showRelationSheet.value = false;
};
watch(showRelationSheet, (open) => {
  if (open) {
    window.addEventListener('keydown', onEscape);
  } else {
    window.removeEventListener('keydown', onEscape);
  }
});
onUnmounted(() => window.removeEventListener('keydown', onEscape));

const chooseRelationship = (): void => {
  if (!props.relationshipEditable) {
    return;
  }
  showRelationSheet.value = true;
};

const selectRelationship = (val: VprRelationship): void => {
  emit('update:relationship', val);
  showRelationSheet.value = false;
};
</script>

<template>
  <div class="voice-naming-panel">
    <!-- Central avatar or fallback icon (88×88, design d2a7b5f3) -->
    <img v-if="avatarSrc" class="voice-naming-avatar" :src="avatarSrc" alt="" aria-hidden="true" />
    <div v-else class="voice-naming-avatar voice-naming-avatar--icon">
      <q-icon name="record_voice_over" size="80px" color="primary" />
    </div>

    <!-- Name block -->
    <template v-if="nameEditable">
      <div class="voice-naming-question">{{ whoseVoiceLabel }}</div>
      <div class="voice-naming-input-box">
        <input
          v-model="nameModel"
          class="voice-naming-input"
          type="text"
          maxlength="20"
          :placeholder="namePlaceholder"
          :aria-label="whoseVoiceLabel"
        />
      </div>
    </template>

    <!-- Relationship block -->
    <template v-if="relationshipEditable">
      <div class="voice-naming-question">{{ relationshipLabel }}</div>
      <button
        class="voice-naming-input-box voice-naming-input-box--clickable"
        type="button"
        @click="chooseRelationship"
      >
        <span
          class="voice-naming-input voice-naming-input--readonly voice-naming-relationship-value"
        >
          {{ relationshipText }}
        </span>
        <q-icon class="voice-naming-relationship-chevron" name="expand_more" size="18px" />
      </button>
    </template>

    <!-- Audio preview (only rendered when audioSrc is available) -->
    <audio
      v-if="audioSrc"
      class="voice-naming-audio"
      controls
      :src="audioSrc"
      aria-label="Audio preview"
    />

    <div class="voice-naming-spacer" aria-hidden="true" />

    <button
      class="voice-naming-primary-btn"
      type="button"
      :disabled="primaryDisabled || loading"
      @click="emit('primary')"
    >
      {{ primaryLabel }}
    </button>
    <button
      v-if="showSecondary"
      class="voice-naming-secondary-btn"
      :class="[`voice-naming-secondary-btn--${secondaryVariant}`]"
      type="button"
      :disabled="loading"
      @click="emit('secondary')"
    >
      {{ secondaryLabel }}
    </button>
  </div>

  <!-- Relationship bottom sheet — teleported to body; reuses SetupProfilePanel CSS classes. -->
  <Teleport to="body">
    <transition name="vnp-sheet">
      <div
        v-if="showRelationSheet"
        class="setup-profile-relation-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="relationshipSheetTitle"
        @click.self="showRelationSheet = false"
      >
        <div class="setup-profile-relation-sheet">
          <div class="setup-profile-relation-head">
            <span class="setup-profile-relation-title">{{ relationshipSheetTitle }}</span>
          </div>
          <div class="setup-profile-relation-body">
            <button
              v-for="opt in relationOptions"
              :key="opt.value"
              class="setup-profile-relation-chip"
              :class="{ 'setup-profile-relation-chip--active': relationship === opt.value }"
              @click="selectRelationship(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
/* All structural styles live in src/css/app.scss under
   "===== SetupProfilePanel patterns, designs ed71eb82 / fb8d01d5 =====".
   Only the Vue <transition> hooks are scoped. */
.vnp-sheet-enter-active,
.vnp-sheet-leave-active {
  transition: opacity 0.25s ease;
}

.vnp-sheet-enter-from,
.vnp-sheet-leave-to {
  opacity: 0;
}
</style>
