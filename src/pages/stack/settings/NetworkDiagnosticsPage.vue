<script setup lang="ts">
// NetworkDiagnosticsPage — step-by-step network diagnosis (Template A).

import { onBeforeUnmount, ref } from 'vue';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.settings.NetworkDiagnosticsPage');

interface DiagStep {
  key: string;
  status: 'pending' | 'running' | 'success' | 'fail';
}

const steps = ref<DiagStep[]>([
  { key: 'dns', status: 'pending' },
  { key: 'tcp', status: 'pending' },
  { key: 'ws', status: 'pending' },
]);

const isRunning = ref(false);
const result = ref<'good' | 'bad' | null>(null);

let intervalId: ReturnType<typeof setInterval> | null = null;
const timeoutIds = new Set<ReturnType<typeof setTimeout>>();

function cleanup() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  for (const id of timeoutIds) {
    clearTimeout(id);
  }
  timeoutIds.clear();
}

onBeforeUnmount(cleanup);

// NOTE: This is a simulated diagnosis for UI demonstration purposes.
// TODO: Replace with real network checks (DNS resolution, TCP connectivity, WebSocket handshake).
function startDiagnosis() {
  if (isRunning.value) return;
  cleanup();
  isRunning.value = true;
  result.value = null;
  steps.value.forEach((s) => (s.status = 'pending'));

  let i = 0;
  intervalId = setInterval(() => {
    if (i < steps.value.length) {
      steps.value[i]!.status = 'running';
      const idx = i;
      const tid = setTimeout(() => {
        timeoutIds.delete(tid);
        // Simulated result — replace with actual network probe
        steps.value[idx]!.status = 'success';
      }, 800);
      timeoutIds.add(tid);
      i++;
    } else {
      clearInterval(intervalId!);
      intervalId = null;
      const tid = setTimeout(() => {
        timeoutIds.delete(tid);
        isRunning.value = false;
        const allSuccess = steps.value.every((s) => s.status === 'success');
        result.value = allSuccess ? 'good' : 'bad';
      }, 1000);
      timeoutIds.add(tid);
    }
  }, 1200);
}
</script>

<template>
  <q-page class="settings-sub-page">
    <div class="settings-sub-page__card">
      <div v-for="step in steps" :key="step.key" class="settings-sub-page__row">
        <span class="settings-sub-page__row-label">{{ i18n('labels.' + step.key) }}</span>
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
      <button type="button" class="btn-max" :disabled="isRunning" @click="startDiagnosis">
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
