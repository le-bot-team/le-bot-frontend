<script setup lang="ts">
/**
 * PersonalityEditor — shared AI personality configuration editor.
 * Reused by both PersonalityDetailPage (device config) and AddVirtualDevicePage (onboarding Step 4).
 *
 * Props:
 *   - enabled / traits / goals: initial values
 *   - submitLabel: text for the submit/next button
 *   - showSkip: whether to show a skip button
 *   - skipLabel: text for the skip button
 *
 * Emits:
 *   - submit({ enabled, traits, goals }): when the submit button is clicked
 *   - skip(): when the skip button is clicked
 *   - disable(): when the toggle is turned off
 */
import { computed, ref } from 'vue';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.PersonalityDetailPage');

const props = withDefaults(
  defineProps<{
    enabled?: boolean;
    traits?: string;
    goals?: string;
    submitLabel?: string;
    showSkip?: boolean;
    skipLabel?: string;
  }>(),
  {
    enabled: true,
    traits: '',
    goals: '',
    submitLabel: '',
    showSkip: false,
    skipLabel: '',
  },
);

const emit = defineEmits<{
  submit: [payload: { enabled: boolean; traits: string; goals: string }];
  skip: [];
  disable: [];
}>();

const enabled = ref<boolean>(props.enabled);
const traits = ref<string>(props.traits);
const goals = ref<string>(props.goals);

const canSubmit = computed(
  () => enabled.value && (traits.value.trim().length > 0 || goals.value.trim().length > 0),
);

function onToggle(v: boolean) {
  if (v) return;
  enabled.value = false;
  emit('disable');
}

function onSubmit() {
  if (!canSubmit.value) return;
  emit('submit', {
    enabled: enabled.value,
    traits: traits.value,
    goals: goals.value,
  });
}
</script>

<template>
  <section class="device-personality-card">
    <div class="device-personality-row">
      <span>{{ i18n('labels.toggleLabel') }}</span>
      <q-toggle v-model="enabled" color="accent" @update:model-value="onToggle" />
    </div>
  </section>
  <p class="device-personality-tip">{{ i18n('labels.tip') }}</p>

  <template v-if="enabled">
    <label class="device-personality-section-title">
      {{ i18n('labels.traitsTitle') }}
    </label>
    <textarea
      v-model="traits"
      class="device-personality-textarea"
      :placeholder="i18n('labels.traitsPlaceholder')"
    />

    <label class="device-personality-section-title">
      {{ i18n('labels.goalsTitle') }}
    </label>
    <textarea
      v-model="goals"
      class="device-personality-textarea"
      :placeholder="i18n('labels.goalsPlaceholder')"
    />
  </template>

  <button
    type="button"
    class="device-personality-submit"
    :disabled="!canSubmit"
    @click="onSubmit"
  >
    {{ submitLabel || i18n('labels.submit') }}
  </button>

  <button
    v-if="showSkip"
    type="button"
    class="device-personality-skip-btn"
    @click="$emit('skip')"
  >
    {{ skipLabel }}
  </button>
</template>

<style scoped>
.device-personality-skip-btn {
  width: var(--btn-width, 311px);
  height: var(--btn-height, 56px);
  border: 1.5px solid var(--clr-btn-weak-border-soft);
  border-radius: var(--btn-radius, 28px);
  background: var(--clr-white);
  color: var(--clr-weak);
  font-family: var(--font-family);
  font-size: var(--font-size-btn, 17px);
  font-weight: 400;
  line-height: var(--line-height-btn, 24px);
  cursor: pointer;
  transition: background 0.2s;
  align-self: center;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }
}
</style>
