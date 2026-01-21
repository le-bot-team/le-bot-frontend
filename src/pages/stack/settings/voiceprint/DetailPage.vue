<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { router } from 'src/router';
import type { PersonDetail } from 'src/types/api/voiceprint';
import { deletePerson, getPerson } from 'src/utils/api/voiceprint';
import { i18nSubPath } from 'src/utils/common';
import { useAuthStore } from 'stores/auth';
import { RELATIONSHIP_MAPPINGS } from 'components/vpr-relationships';

const { accessToken } = storeToRefs(useAuthStore());
const { notify } = useQuasar();
const route = useRoute();

const i18n = i18nSubPath('pages.stack.settings.voiceprint.DetailPage');

const confirm = ref(false);
const personId = ref<string>();
const personDetail = ref<PersonDetail>();

const confirmDeletePerson = async () => {
  if (!accessToken.value || !personId.value) {
    return;
  }
  try {
    const { data: response } = await deletePerson(accessToken.value, personId.value);
    if (response.success) {
      notify({
        type: 'positive',
        message: i18n('notifications.deletePersonSuccess'),
      });
      setTimeout(() => router.go(-1), 2000);
    } else {
      notify({
        type: 'warning',
        message: i18n('notifications.deletePersonFailed'),
        caption: response.message,
      });
    }
  } catch (error) {
    notify({
      type: 'negative',
      message: i18n('notifications.deletePersonError'),
      caption: (error as Error).message,
    });
  }
};

const updatePersonDetail = async (accessToken: string) => {
  if (!personId.value?.length) {
    return false;
  }
  try {
    const { data: response } = await getPerson(accessToken, personId.value);
    if (response.success) {
      personDetail.value = response.data;
      return true;
    } else {
      notify({
        type: 'warning',
        message: i18n('notifications.fetchPersonDetailFailed'),
        caption: response.message,
      });
      return false;
    }
  } catch (error) {
    notify({
      type: 'negative',
      message: i18n('notifications.fetchPersonDetailError'),
      caption: (error as Error).message,
    });
    return false;
  }
};

onMounted(async () => {
  if (!accessToken.value) {
    await router.push('/stack/auth?from=/stack/settings/voiceprint');
    return;
  }
  if (route.params.personId && typeof route.params.personId === 'string') {
    personId.value = route.params.personId;
  } else {
    router.go(-1);
    return;
  }
  if (!(await updatePersonDetail(accessToken.value))) {
    setTimeout(() => router.go(-1), 2000);
  }
});
</script>

<template>
  <q-page class="column q-gutter-y-md q-pa-md">
    <q-card bordered flat>
      <q-card-section>
        <div class="row justify-between items-center">
          <div class="column q-gutter-y-md">
            <div v-if="personDetail" class="text-body1">
              {{ i18n('labels.name', { name: personDetail.person_name }) }}
            </div>
            <q-skeleton v-else type="text" />
            <div v-if="personDetail" class="text-caption text-grey">
              {{ i18n('labels.id', { id: personDetail.person_id }) }}
            </div>
            <q-skeleton v-else type="text" />
          </div>
          <q-chip
            v-if="personDetail"
            color="primary"
            :label="RELATIONSHIP_MAPPINGS[personDetail.relationship]"
          />
          <q-skeleton v-else type="QChip" />
        </div>
      </q-card-section>
      <div
        v-if="personDetail?.is_temporal"
        class="absolute-top-right bg-orange text-caption q-px-xs"
      >
        {{ i18n('labels.temporary') }}
      </div>
    </q-card>
    <q-card bordered flat>
      <q-card-section>
        <div class="text-body1">
          {{ i18n('labels.voiceprints') }}
        </div>
      </q-card-section>
      <q-separator />
      <div v-if="personDetail">
        <q-list separator>
          <q-item v-for="voiceprint in personDetail.voices" :key="voiceprint.voice_id">
            <q-item-section>
              <q-item-label>{{ new Date(voiceprint.created_at).toLocaleString() }}</q-item-label>
              <q-item-label caption>
                {{ voiceprint.voice_id }}
              </q-item-label>
            </q-item-section>
            <q-item-section side top>
              <q-badge
                :label="i18n('labels.vectorLength', { length: voiceprint.feature_vector.length })"
              />
            </q-item-section>
          </q-item>
        </q-list>
        <div v-if="personDetail.voices.length === 0" class="text-caption text-grey">
          {{ i18n('labels.noVoiceprints') }}
        </div>
      </div>
    </q-card>
    <q-btn color="negative" :label="i18n('labels.deletePerson')" no-caps @click="confirm = true" />
    <q-dialog v-model="confirm">
      <q-card flat>
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">
            {{ i18n('labels.deletePerson') }}
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="text-body1 q-gutter-y-md">
          <div>
            {{ i18n('labels.deletePersonPrompt', { name: personDetail?.person_name }) }}
          </div>
          <div class="text-weight-bold">
            {{ i18n('labels.deletePersonWarning') }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="i18n('labels.confirm')"
            color="negative"
            no-caps
            v-close-popup
            @click="confirmDeletePerson"
          />
          <q-btn color="primary" :label="i18n('labels.cancel')" no-caps v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped></style>
