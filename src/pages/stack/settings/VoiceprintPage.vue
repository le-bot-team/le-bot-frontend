<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { router } from 'src/router';
import type { Person } from 'src/types/api/voiceprint';
import { getPersons } from 'src/utils/api/voiceprint';
import { i18nSubPath } from 'src/utils/common';
import { useAuthStore } from 'stores/auth';

const i18n = i18nSubPath('pages.stack.settings.VoiceprintPage');
const { accessToken } = storeToRefs(useAuthStore());
const persons = ref<Person[]>([]);

const hasTemporal = computed(() => persons.value.some((p) => p.is_temporal));

const goDetail = (personId: string) => {
  router.push(`/stack/settings/voiceprint/detail/${personId}`).catch(console.error);
};

const goNew = () => {
  router.push('/stack/settings/voiceprint/new').catch(console.error);
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
        role="button"
        tabindex="0"
        @click="goDetail(person.person_id)"
        @keydown.enter="goDetail(person.person_id)"
        @keyup.space.prevent="goDetail(person.person_id)"
      >
        <div class="voiceprint-row__left">
          <span>{{ i18n('labels.personVoiceprint', { name: person.name || '' }) }}</span>
          <span v-if="person.is_temporal" class="voiceprint-row__temporal-tag">
            {{ i18n('labels.temporalTag') }}
          </span>
        </div>
        <q-icon class="voiceprint-row__chevron" name="chevron_right" size="12px" />
      </div>
    </div>
    <p v-if="hasTemporal" class="voiceprint-hint">
      {{ i18n('labels.temporalHint') }}
    </p>
    <button class="voiceprint-add-btn" type="button" @click="goNew">
      <q-icon name="add" size="14px" />
      {{ i18n('labels.addNewPerson') }}
    </button>
    <button
      class="voiceprint-add-btn"
      type="button"
      @click="router.push('/stack/settings/voiceprint/test').catch(console.error)"
    >
      <q-icon name="mic" size="14px" />
      {{ i18n('labels.testVoice') }}
    </button>
  </q-page>
</template>

<style scoped></style>
