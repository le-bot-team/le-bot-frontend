<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';

import { router } from 'src/router';
import type { PersonInfo } from 'src/types/api/voiceprint';
import { retrievePersonsInfo } from 'src/utils/api/voiceprint';
import { i18nSubPath } from 'src/utils/common';
import { useAuthStore } from 'stores/auth';

const i18n = i18nSubPath('pages.stack.settings.VoiceprintPage');

const { accessToken } = storeToRefs(useAuthStore());

const persons = ref<PersonInfo[]>([]);

onMounted(async () => {
  if (!accessToken.value) {
    await router.push('/stack/auth?from=/stack/settings/voiceprint');
    return;
  }
  try {
    const { data: response } = await retrievePersonsInfo(accessToken.value);
    if (response.success) {
      console.log(response);
      persons.value = response.data.persons;
    } else {
      console.error('Failed to fetch persons:', response.message);
    }
  } catch (error) {
    console.error('Error fetching persons:', error);
  }
});
</script>

<template>
  <q-page class="column q-gutter-y-lg q-pa-md">
    <q-card>
      <q-list>
        <q-item v-for="(person, index) in persons" :key="index">
          <q-item-section>
            <q-item-label>{{ person.person_name }}</q-item-label>
            <q-item-label caption>{{ person.person_id }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn dense flat icon="mdi-chevron-right" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
    <q-btn
      color="primary"
      :label="i18n('labels.addNewVoiceprint')"
      no-caps
      to="/stack/settings/voiceprint/new"
    />
  </q-page>
</template>

<style scoped></style>
