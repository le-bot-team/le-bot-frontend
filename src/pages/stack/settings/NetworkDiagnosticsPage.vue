<script setup lang="ts">
// NetworkDiagnosticsPage — step-by-step network diagnosis (Template A).

import { ref } from 'vue';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.settings.NetworkDiagnosticsPage');

interface DiagStep {
  key: string;
  label: string;
  status: 'pending' | 'running' | 'success' | 'fail';
}

const steps = ref<DiagStep[]>([
  { key: 'dns', label: i18n('labels.dns'), status: 'pending' },
  { key: 'tcp', label: i18n('labels.tcp'), status: 'pending' },
  { key: 'ws', label: i18n('labels.ws'), status: 'pending' },
]);

const isRunning = ref(false);
const result = ref<'good' | 'bad' | null>(null);

function startDiagnosis() {
  isRunning.value = true;
  result.value = null;
  steps.value.forEach((s) => (s.status = 'pending'));

  let i = 0;
  const interval = setInterval(() => {
    if (i < steps.value.length) {
      steps.value[i]!.status = 'running';
      const idx = i;
      setTimeout(() => {
        steps.value[idx]!.status = Math.random() > 0.2 ? 'success' : 'fail';
      }, 800);
      i++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        isRunning.value = false;
        const allSuccess = steps.value.every((s) => s.status === 'success');
        result.value = allSuccess ? 'good' : 'bad';
      }, 1000);
    }
  }, 1200);
}
</script>

<template>
  <q-page class="settings-sub-page">
    <div class="settings-sub-page__card">
      <div v-for="step in steps" :key="step.key" class="settings-sub-page__row">
        <span class="settings-sub-page__row-label">{{ step.label }}</span>
        <span>
          <q-spinner v-if="step.status === 'running'" size="20px" color="cyan" />
          <q-icon
            v-else-if="step.status === 'success'"
            name="check_circle"
            color="positive"
            size="20px"
          />
          <q-icon v-else-if="step.status === 'fail'" name="cancel" color="negative" size="20px" />
          <q-icon
            v-else
            name="radio_button_unchecked"
            style="color: var(--clr-caption)"
            size="20px"
          />
        </span>
      </div>
    </div>

    <div
      v-if="result"
      class="q-mt-md"
      :style="{
        color: result === 'good' ? 'var(--clr-link)' : 'var(--clr-danger-bg)',
        textAlign: 'center',
      }"
    >
      {{ result === 'good' ? i18n('labels.resultGood') : i18n('labels.resultBad') }}
    </div>

    <div class="q-mt-md">
      <button class="btn-max" :disabled="isRunning" @click="startDiagnosis">
        <q-spinner v-if="isRunning" size="20px" color="white" />
        <template v-else>{{ i18n('labels.startDiagnosis') }}</template>
      </button>
    </div>
  </q-page>
</template>

<style scoped>
.btn-max {
  width: var(--btn-width);
  height: var(--btn-height);
  border: none;
  border-radius: var(--btn-radius);
  background: var(--clr-btn-primary-bg);
  color: var(--clr-white);
  font-family: var(--font-family);
  font-size: var(--font-size-btn);
  font-weight: 500;
  cursor: pointer;
}

.btn-max:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
