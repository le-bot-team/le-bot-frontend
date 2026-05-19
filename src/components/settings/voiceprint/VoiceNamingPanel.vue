<script setup lang="ts">
// VoiceNamingPanel — shared "这是谁的声音" panel.
// Visual baseline: lanhu design d2a7b5f3 (DetailPage). Reused by both the
// voiceprint settings DetailPage (edit mode) and the recording flow
// SubmitPanel (register / addVoice). See plan VoiceNaming Unified Panel.
import { BottomSheet } from 'quasar';
import { computed } from 'vue';

import {
  RELATIONSHIP_MAPPINGS,
  RELATIONSHIP_OPTIONS,
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
    nameEditable?: boolean;
    relationshipEditable?: boolean;
  }>(),
  {
    avatarSrc: undefined,
    audioSrc: undefined,
    primaryDisabled: false,
    loading: false,
    secondaryVariant: 'weak',
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

const relationshipText = computed(() => RELATIONSHIP_MAPPINGS[props.relationship]);

const chooseRelationship = (): void => {
  if (!props.relationshipEditable) {
    return;
  }
  BottomSheet.create({
    title: props.relationshipSheetTitle,
    grid: false,
    actions: RELATIONSHIP_OPTIONS.map((o) => ({
      label: o.label,
      id: o.value,
    })),
  })
    .onOk((action) => {
      emit('update:relationship', action.id as VprRelationship);
    })
    .onCancel(() => {
      // no-op
    });
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
      <div id="voice-naming-question-label" class="voice-naming-question">{{ whoseVoiceLabel }}</div>
      <div class="voice-naming-input-box">
        <input
          v-model="nameModel"
          class="voice-naming-input"
          type="text"
          maxlength="20"
          :placeholder="namePlaceholder"
          aria-labelledby="voice-naming-question-label"
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
        <span class="voice-naming-input voice-naming-input--readonly">
          {{ relationshipText }}
        </span>
        <q-icon class="voice-naming-relationship-chevron" name="expand_more" size="18px" />
      </button>
    </template>

    <!-- Audio preview (only rendered when audioSrc is available) -->
    <audio v-if="audioSrc" class="voice-naming-audio" controls :src="audioSrc" />

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
      class="voice-naming-secondary-btn"
      :class="[`voice-naming-secondary-btn--${secondaryVariant}`]"
      type="button"
      :disabled="loading"
      @click="emit('secondary')"
    >
      {{ secondaryLabel }}
    </button>
  </div>
</template>

<style scoped>
/* All structural styles live in src/css/app.scss under
   "===== VoiceNamingPanel (shared) patterns =====". */
</style>
