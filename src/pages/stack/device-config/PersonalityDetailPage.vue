<script setup lang="ts">
import { reactive, computed } from 'vue';

import { router } from 'src/router';
import { i18nSubPath } from 'src/utils/common';
import { useDeviceStore } from 'stores/device';

const i18n = i18nSubPath('pages.stack.PersonalityDetailPage');

const deviceStore = useDeviceStore();

const traitTags = ['trait_a', 'trait_b', 'trait_c', 'trait_d', 'trait_e', 'trait_f'] as const;
const goalTags = ['goal_a', 'goal_b', 'goal_c', 'goal_d', 'goal_e', 'goal_f'] as const;

const form = reactive({
  traits: '',
  goals: '',
  selectedTraits: [] as string[],
  selectedGoals: [] as string[],
});

const canSubmit = computed(
  () =>
    form.traits.length > 0 ||
    form.goals.length > 0 ||
    form.selectedTraits.length > 0 ||
    form.selectedGoals.length > 0,
);

function toggleTag(list: string[], tag: string) {
  const idx = list.indexOf(tag);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(tag);
}

function submit() {
  deviceStore.updateCurrentDeviceConfig({
    personality: {
      traits: form.traits,
      goals: form.goals,
      selectedTraits: [...form.selectedTraits],
      selectedGoals: [...form.selectedGoals],
    },
  });
  router.go(-1);
}
</script>

<template>
  <q-page class="column q-pa-md q-gutter-y-md">
    <!-- Trait tags -->
    <div class="text-subtitle2">{{ i18n('labels.traitsTitle') }}</div>
    <div class="row q-gutter-sm">
      <q-chip
        v-for="tag in traitTags"
        :key="tag"
        clickable
        :color="form.selectedTraits.includes(tag) ? 'primary' : 'grey-3'"
        :text-color="form.selectedTraits.includes(tag) ? 'white' : 'dark'"
        @click="toggleTag(form.selectedTraits, tag)"
      >
        {{ i18n(`traitTags.${tag}`) }}
      </q-chip>
    </div>
    <q-input
      v-model="form.traits"
      type="textarea"
      :placeholder="i18n('labels.traitsPlaceholder')"
      outlined
      autogrow
    />

    <!-- Goal tags -->
    <div class="text-subtitle2">{{ i18n('labels.goalsTitle') }}</div>
    <div class="row q-gutter-sm">
      <q-chip
        v-for="tag in goalTags"
        :key="tag"
        clickable
        :color="form.selectedGoals.includes(tag) ? 'primary' : 'grey-3'"
        :text-color="form.selectedGoals.includes(tag) ? 'white' : 'dark'"
        @click="toggleTag(form.selectedGoals, tag)"
      >
        {{ i18n(`goalTags.${tag}`) }}
      </q-chip>
    </div>
    <q-input
      v-model="form.goals"
      type="textarea"
      :placeholder="i18n('labels.goalsPlaceholder')"
      outlined
      autogrow
    />

    <q-btn
      :disable="!canSubmit"
      color="primary"
      :label="i18n('labels.submit')"
      class="full-width"
      @click="submit"
    />
  </q-page>
</template>
