<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';

import { router } from 'src/router';
import type { Person } from 'src/types/api/voiceprint';
import { getPersons } from 'src/utils/api/voiceprint';
import { i18nSubPath } from 'src/utils/common';
import { useAuthStore } from 'stores/auth';

const i18n = i18nSubPath('pages.stack.settings.VoiceprintPage');
const { accessToken } = storeToRefs(useAuthStore());
const { notify } = useQuasar();
const persons = ref<Person[]>([]);
const loading = ref(true);

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
      notify({ type: 'warning', message: i18n('notifications.fetchFailed'), caption: response.message });
    }
  } catch (error) {
    notify({ type: 'negative', message: i18n('notifications.fetchError'), caption: (error as Error).message });
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <q-page class="voiceprint-page">
    <q-spinner-dots v-if="loading" class="voiceprint-loading" size="40px" color="primary" />
    <template v-else>
      <div class="me-card voiceprint-card">
        <button
          v-for="person in persons"
          :key="person.person_id"
          class="voiceprint-row"
          type="button"
          @click="goDetail(person.person_id)"
        >
          <div class="voiceprint-row__left">
            <span>{{ i18n('labels.personVoiceprint', { name: person.name || '' }) }}</span>
            <span v-if="person.is_temporal" class="voiceprint-row__temporal-tag">
              {{ i18n('labels.temporalTag') }}
            </span>
          </div>
          <q-icon class="voiceprint-row__chevron" name="chevron_right" size="12px" />
        </button>
        <p v-if="persons.length === 0" class="voiceprint-empty">
          {{ i18n('labels.emptyState') }}
        </p>
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
    </template>
  </q-page>
</template>

<style scoped></style>
