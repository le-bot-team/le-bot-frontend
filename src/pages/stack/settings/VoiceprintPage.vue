<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { router } from 'src/router';
import type { Person } from 'src/types/api/voiceprint';
import { getPersons } from 'src/utils/api/voiceprint';
import { i18nSubPath } from 'src/utils/common';
import { useAuthStore } from 'stores/auth';

const i18n = i18nSubPath('pages.stack.settings.VoiceprintPage');
const { accessToken } = storeToRefs(useAuthStore());
const persons = ref<Person[]>([]);
const routerInstance = useRouter();

const goDetail = (personId: string) => {
  routerInstance.push(`/stack/settings/voiceprint/detail/${personId}`).catch(console.error);
};

const goNew = () => {
  routerInstance.push('/stack/settings/voiceprint/new').catch(console.error);
};

onMounted(async () => {
  if (!accessToken.value) {
    await router.push('/stack/auth?from=/stack/settings/voiceprint');
    return;
  }
  try {
    const { data: response } = await getPersons(accessToken.value);
    if (response.success) {
      persons.value = response.data;
    } else {
      console.error('Failed to fetch persons:', response.message);
    }
  } catch (error) {
    console.error('Error fetching persons:', error);
  }
});
</script>

<template>
  <q-page class="voiceprint-page">
    <div class="me-card voiceprint-card">
      <div
        v-for="person in persons"
        :key="person.person_id"
        class="voiceprint-row"
        @click="goDetail(person.person_id)"
      >
        <span>{{ i18n('labels.personVoiceprint', { name: person.name }) }}</span>
        <q-icon class="voiceprint-row__chevron" name="chevron_right" size="12px" />
      </div>
    </div>
    <button class="voiceprint-add-btn" type="button" @click="goNew">
      <q-icon name="add" size="14px" />
      {{ i18n('labels.addNewPerson') }}
    </button>
  </q-page>
</template>

<style scoped></style>
