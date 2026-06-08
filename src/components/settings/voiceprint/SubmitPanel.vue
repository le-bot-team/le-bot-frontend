<script setup lang="ts">
// SubmitPanel — voiceprint registration step 2 (naming + submit).
// Visual / interaction layout is delegated to the shared VoiceNamingPanel
// (design d2a7b5f3), aligning with the settings DetailPage.
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import ConfirmDialog from 'src/components/ConfirmDialog.vue';
import VoiceNamingPanel from 'components/settings/voiceprint/VoiceNamingPanel.vue';
import { type VprRelationship } from 'components/vpr-relationships';

import voiceprintAvatarImg from 'src/assets/lanhu/voiceprint/icon-1.webp';
import { addVoice, recognize, register } from 'src/utils/api/voiceprint';
import { blobToDataUrl, i18nSubPath } from 'src/utils/common';
import { useAuthStore } from 'stores/auth';
import type { EmptyResponse, RegisterResponse, RecognitionData } from 'src/types/api/voiceprint';

const props = defineProps<{
  name: string | number;
  data?: Blob | undefined;
  personId?: string | undefined;
  /** Pre-filled default name for the voiceprint (e.g. child's name) */
  defaultName?: string | undefined;
  /** Pre-filled default relationship for the voiceprint */
  defaultRelationship?: VprRelationship | undefined;
}>();
const emit = defineEmits<{
  finish: [];
  previous: [];
}>();

const { accessToken } = storeToRefs(useAuthStore());
const { notify, dialog: $qDialog } = useQuasar();

const i18n = i18nSubPath('components.settings.voiceprint.SubmitPanel');

const audioSrc = ref<string>();
const isLoading = ref<boolean>(false);
const personName = ref<string>(props.defaultName ?? '');
const relationship = ref<VprRelationship>(props.defaultRelationship ?? 'friend');

const isRegisterMode = computed(() => !props.personId?.length);
const primaryDisabled = computed(
  () => !props.data || (isRegisterMode.value && !personName.value.trim().length),
);

// Confidence threshold for duplicate voiceprint detection (0-1 scale).
// Matches at or above this value are considered potential duplicates.
const DUPLICATE_CONFIDENCE_THRESHOLD = 0.8;

/**
 * Run voiceprint recognition against the recorded audio to detect whether
 * this voice already exists in the system. Returns the recognition data when
 * a high-confidence match is found, or `undefined` otherwise.
 */
const checkDuplicateVoiceprint = async (audioBase64: string): Promise<RecognitionData | undefined> => {
  if (!accessToken.value) return undefined;
  try {
    const { data: result } = await recognize(accessToken.value, audioBase64);
    if (result.success && result.data.confidence >= DUPLICATE_CONFIDENCE_THRESHOLD) {
      return result.data;
    }
  } catch {
    // Recognition failure (no match in voiceprint DB) is normal — continue to register
  }
  return undefined;
};

const confirm = async (): Promise<void> => {
  if (!accessToken.value) {
    console.error('No access token available for voiceprint registration.');
    return;
  }
  if (!props.data) {
    console.error('No audio data provided for voiceprint registration.');
    return;
  }
  isLoading.value = true;

  try {
    const dataUrl = await blobToDataUrl(props.data);
    const audioBase64 = dataUrl.substring(dataUrl.indexOf(',') + 1);

    // --- Duplicate voiceprint detection (register mode only) ---
    if (isRegisterMode.value) {
      const duplicate = await checkDuplicateVoiceprint(audioBase64);
      if (duplicate) {
        isLoading.value = false;
        const matchedName = duplicate.name ?? i18n('labels.unknownPerson');
        // Normalize confidence to percentage (handle both 0-1 and 0-100 scales)
        const confidencePct =
          duplicate.confidence > 1
            ? duplicate.confidence
            : duplicate.confidence * 100;
        // Block registration — show alert and return to editing
        await new Promise<void>((resolve) => {
          $qDialog({
            component: ConfirmDialog,
            componentProps: {
              title: i18n('notifications.duplicateVoiceprintTitle'),
              body: i18n('notifications.duplicateVoiceprintBody', {
                name: matchedName,
                confidence: confidencePct.toFixed(2),
              }),
              confirmLabel: i18n('notifications.duplicateConfirmLabel'),
              alert: true,
            },
          })
            .onOk(() => resolve())
            .onDismiss(() => resolve());
        });
        return;
      }
    }

    let result: EmptyResponse | RegisterResponse;
    if (props.personId?.length) {
      result = (
        await addVoice(
          accessToken.value,
          props.personId,
          audioBase64,
        )
      ).data;
    } else {
      const trimmedName = personName.value.trim();
      if (!trimmedName.length) {
        console.error('Person name is required for voiceprint registration.');
        isLoading.value = false;
        return;
      }
      result = (
        await register(
          accessToken.value,
          audioBase64,
          trimmedName,
          0,
          relationship.value,
        )
      ).data;
    }
    if (!result.success) {
      notify({
        type: 'negative',
        message: i18n('notifications.registrationFailed', { message: result.message }),
      });
      isLoading.value = false;
    } else {
      notify({
        type: 'positive',
        message: i18n('notifications.registrationSuccess'),
      });
      // Keep isLoading true to prevent duplicate submissions until finish emits
      setTimeout(() => emit('finish'), 1500);
    }
  } catch (error) {
    console.error('Error during voiceprint registration:', error);
    notify({
      type: 'negative',
      message: i18n('notifications.registrationError'),
    });
    isLoading.value = false;
  }
};

onMounted(() => {
  if (!props.data) {
    emit('previous');
    return;
  }
  audioSrc.value = URL.createObjectURL(props.data);
});
onBeforeUnmount(() => {
  if (audioSrc.value) {
    URL.revokeObjectURL(audioSrc.value);
  }
});
</script>

<template>
  <q-tab-panel :name="name" class="voiceprint-record-stage q-pa-none">
    <voice-naming-panel
      v-model:name="personName"
      v-model:relationship="relationship"
      :avatar-src="voiceprintAvatarImg"
      :audio-src="audioSrc"
      :whose-voice-label="i18n('labels.whoseVoice')"
      :name-placeholder="i18n('labels.whoseVoiceHint')"
      :relationship-label="i18n('labels.relationshipLabel')"
      :relationship-sheet-title="i18n('labels.selectRelationship')"
      :primary-label="i18n('labels.confirm')"
      :primary-disabled="primaryDisabled"
      :loading="isLoading"
      :secondary-label="i18n('labels.previous')"
      secondary-variant="weak"
      :show-secondary="false"
      :name-editable="isRegisterMode"
      :relationship-editable="isRegisterMode"
      @primary="confirm"
      @secondary="emit('previous')"
    />
  </q-tab-panel>
</template>

<style scoped>
/* All structural styles live in src/css/app.scss. */
</style>
