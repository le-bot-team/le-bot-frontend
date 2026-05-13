<script setup lang="ts">
// OnboardingGuidePage — 4-step onboarding guide with mask overlay.

import { ref, computed } from 'vue';

import { router } from 'src/router';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.OnboardingGuidePage');

const currentStep = ref(0);
const totalSteps = 4;

const steps = computed(() => [
  { title: i18n('steps.step1Title'), desc: i18n('steps.step1Desc') },
  { title: i18n('steps.step2Title'), desc: i18n('steps.step2Desc') },
  { title: i18n('steps.step3Title'), desc: i18n('steps.step3Desc') },
  { title: i18n('steps.step4Title'), desc: i18n('steps.step4Desc') },
]);

const isLastStep = computed(() => currentStep.value === totalSteps - 1);

function next() {
  if (isLastStep.value) {
    finish();
  } else {
    currentStep.value++;
  }
}

function skip() {
  finish();
}

function finish() {
  router.replace('/main/home').catch(console.error);
}
</script>

<template>
  <div class="onboarding-page">
    <div class="onboarding-page__step-content">
      <div class="onboarding-page__step-title">{{ steps[currentStep]?.title }}</div>
      <div class="onboarding-page__step-desc">{{ steps[currentStep]?.desc }}</div>
    </div>

    <div class="onboarding-page__dots">
      <div
        v-for="i in totalSteps"
        :key="i"
        class="onboarding-page__dot"
        :class="{ 'onboarding-page__dot--active': i - 1 === currentStep }"
      />
    </div>

    <div class="column items-center q-gutter-y-md">
      <button class="onboarding-page__next" @click="next">
        {{ isLastStep ? i18n('labels.start') : i18n('labels.next') }}
      </button>
      <button v-if="!isLastStep" class="onboarding-page__skip" @click="skip">
        {{ i18n('labels.skip') }}
      </button>
    </div>
  </div>
</template>

<style scoped></style>
