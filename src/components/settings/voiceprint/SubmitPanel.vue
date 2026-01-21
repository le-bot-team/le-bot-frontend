<script setup lang="ts">
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { onBeforeUnmount, onMounted, ref } from 'vue';

import { RELATIONSHIP_OPTIONS } from 'components/vpr-relationships';

import { register } from 'src/utils/api/voiceprint';
import { blobToDataUrl, i18nSubPath } from 'src/utils/common';
import { useAuthStore } from 'stores/auth';

const props = defineProps<{
  name: string | number;
  data?: Blob | undefined;
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
const personName = ref<string>();
const relationship = ref(RELATIONSHIP_OPTIONS[0]);

const confirm = async (): Promise<void> => {
  if (!accessToken.value) {
    console.error('No access token available for voiceprint registration.');
    return;
  }
  if (!props.data) {
    console.error('No audio data provided for voiceprint registration.');
    return;
  }
  if (!personName.value || !personName.value.length) {
    console.error('Person name is required for voiceprint registration.');
    return;
  }
  if (!relationship.value) {
    console.error('Relationship is required for voiceprint registration.');
    return;
  }
  isLoading.value = true;

  try {
    const dataUrl = await blobToDataUrl(props.data);
    const { data: result } = await register(
      accessToken.value,
      dataUrl.substring(dataUrl.indexOf(',') + 1),
      personName.value,
      relationship.value.value,
    );
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
    emit('finish');
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
  <q-tab-panel class="column q-gutter-y-lg" :name="name">
    <q-card>
      <q-card-section class="text-body1">
        {{ i18n('labels.hint') }}
      </q-card-section>
      <q-card-section>
        <audio class="full-width" controls :src="audioSrc" />
      </q-card-section>
    </q-card>
    <div class="column q-gutter-y-sm">
      <div class="text-body1 text-bold">
        {{ i18n('labels.whoseVoice') }}
      </div>
      <q-input clearable :label="i18n('labels.whoseVoiceHint')" outlined v-model="personName" />
    </div>
    <div class="column q-gutter-y-sm">
      <div class="text-body1 text-bold">
        {{ i18n('labels.relationship') }}
      </div>
      <q-select
        :label="i18n('labels.relationshipHint')"
        :options="RELATIONSHIP_OPTIONS"
        outlined
        v-model="relationship"
      />
    </div>
    <q-btn
      color="primary"
      :disable="!data || !personName?.length"
      :label="i18n('labels.confirm')"
      no-caps
      @click="confirm"
    />
    <q-btn
      color="negative"
      :label="i18n('labels.previous')"
      no-caps
      outline
      @click="emit('previous')"
    />
  </q-tab-panel>
</template>

<style scoped></style>
