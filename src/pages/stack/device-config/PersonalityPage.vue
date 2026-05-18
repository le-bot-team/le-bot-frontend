<script setup lang="ts">
import { ref } from 'vue';

import { router } from 'src/router';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.PersonalityPage');

const enabled = ref(false);

function onToggle(value: boolean) {
  enabled.value = value;
  if (value) {
    void router.push('/stack/device-config/personality/detail');
  }
}
</script>

<template>
  <q-page class="column q-pa-md q-gutter-y-md">
    <q-item>
      <q-item-section>
        <q-item-label>{{ i18n('labels.toggleLabel') }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-toggle :model-value="enabled" @update:model-value="onToggle" />
      </q-item-section>
    </q-item>
    <div class="text-caption text-grey q-px-md">{{ i18n('labels.tip') }}</div>
  </q-page>
</template>
