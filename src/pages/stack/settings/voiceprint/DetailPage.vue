<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Dialog, useQuasar } from 'quasar';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import DeletePersonDialog from 'components/settings/voiceprint/DeletePersonDialog.vue';
import DeleteVoiceDialog from 'components/settings/voiceprint/DeleteVoiceDialog.vue';
import { RELATIONSHIP_MAPPINGS } from 'components/vpr-relationships';

import { router } from 'src/router';
import type { PersonDetail } from 'src/types/api/voiceprint';
import { getPerson } from 'src/utils/api/voiceprint';
import { i18nSubPath } from 'src/utils/common';
import { useAuthStore } from 'stores/auth';

const { accessToken } = storeToRefs(useAuthStore());
const { notify } = useQuasar();
const route = useRoute();

const i18n = i18nSubPath('pages.stack.settings.voiceprint.DetailPage');

const personId = ref<string>();
const personDetail = ref<PersonDetail>();

const promptDeletePerson = () => {
  if (!personId.value) {
    return;
  }
  Dialog.create({
    component: DeletePersonDialog,
    componentProps: {
      personId: personId.value,
      personName: personDetail.value?.person_name,
    },
  }).onOk(() => setTimeout(() => router.go(-1), 2000));
};

const promptDeleteVoice = (voiceId: string, createdAt: string) => {
  if (!personId.value) {
    return;
  }
  Dialog.create({
    component: DeleteVoiceDialog,
    componentProps: {
      personId: personId.value,
      personName: personDetail.value?.person_name,
      voiceId,
      createdAt,
    },
  }).onOk(() => {
    if (accessToken.value) {
      void updatePersonDetail(accessToken.value).catch();
    }
  });
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
      <q-card-section v-if="personDetail">
        <q-list bordered separator>
          <q-item v-for="voiceprint in personDetail.voices" :key="voiceprint.voice_id">
            <q-item-section>
              <q-item-label>
                {{ new Date(voiceprint.created_at).toLocaleString() }}
              </q-item-label>
              <q-item-label caption>
                {{ voiceprint.voice_id }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                color="negative"
                dense
                icon="delete"
                @click="promptDeleteVoice(voiceprint.voice_id, voiceprint.created_at)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-section>
        <q-btn
          class="full-width"
          color="primary"
          :label="i18n('labels.addVoiceprint')"
          no-caps
          :to="`/stack/settings/voiceprint/new?personId=${personId}`"
        />
      </q-card-section>
    </q-card>
    <q-btn
      color="negative"
      :label="i18n('labels.deletePerson')"
      no-caps
      @click="promptDeletePerson"
    />
  </q-page>
</template>

<style scoped></style>
