<script setup lang="ts">
// SubmitPanel — voiceprint registration step 2 (naming + submit).
// Visual / interaction layout is delegated to the shared VoiceNamingPanel
// (design d2a7b5f3), aligning with the settings DetailPage.
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import VoiceNamingPanel from 'components/settings/voiceprint/VoiceNamingPanel.vue';
import { type VprRelationship } from 'components/vpr-relationships';

import { addVoice, register } from 'src/utils/api/voiceprint';
import { blobToDataUrl, i18nSubPath } from 'src/utils/common';
import { useAuthStore } from 'stores/auth';
import type { EmptyResponse } from 'src/types/api/voiceprint';

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
const { notify } = useQuasar();

const i18n = i18nSubPath('components.settings.voiceprint.SubmitPanel');

const audioSrc = ref<string>();
const isLoading = ref<boolean>(false);
const personAge = ref<number>(30);
const personName = ref<string>(props.defaultName ?? '');
const relationship = ref<VprRelationship>(props.defaultRelationship ?? 'friend');

const isRegisterMode = computed(() => !props.personId?.length);
const primaryDisabled = computed(
  () => !props.data || (isRegisterMode.value && !personName.value.trim().length),
);

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
    let result: EmptyResponse;
    if (props.personId?.length) {
      result = (
        await addVoice(
          accessToken.value,
          props.personId,
          dataUrl.substring(dataUrl.indexOf(',') + 1),
        )
      ).data;
    } else {
      const trimmedName = personName.value.trim();
      if (!trimmedName.length) {
        console.error('Person name is required for voiceprint registration.');
        return;
      }
      result = (
        await register(
          accessToken.value,
          dataUrl.substring(dataUrl.indexOf(',') + 1),
          trimmedName,
          personAge.value,
          relationship.value,
        )
      ).data;
    }
    if (!result.success) {
      notify({
        type: 'negative',
        message: i18n('notifications.registrationFailed', { message: result.message }),
      });
    } else {
      notify({
        type: 'positive',
        message: i18n('notifications.registrationSuccess'),
      });
      setTimeout(() => emit('finish'), 1500);
    }
  } catch (error) {
    console.error('Error during voiceprint registration:', error);
    notify({
      type: 'negative',
      message: i18n('notifications.registrationError'),
    });
  } finally {
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
