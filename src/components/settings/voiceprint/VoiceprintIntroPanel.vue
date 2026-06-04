<script setup lang="ts">
// VoiceprintIntroPanel — design e545d325 (什么是声纹 intro)
// Explains why voiceprint recording is needed before entering the RecordPanel.
import icon1 from 'src/assets/lanhu/voiceprint/icon-1.webp';
import icon2 from 'src/assets/lanhu/voiceprint/icon-2.webp';
import icon3 from 'src/assets/lanhu/voiceprint/icon-3.webp';
import { i18nSubPath } from 'src/utils/common';

defineProps<{
  name: string | number;
}>();
const emit = defineEmits<{
  next: [];
}>();

const i18n = i18nSubPath('components.settings.voiceprint.VoiceprintIntroPanel');

const sections = [
  { icon: icon1, titleKey: 'labels.whatIsVoiceprint', descKey: 'labels.whatIsVoiceprintDesc' },
  { icon: icon2, titleKey: 'labels.voiceprintPurpose', descKey: 'labels.voiceprintPurposeDesc' },
  { icon: icon3, titleKey: 'labels.voiceprintPrivacy', descKey: 'labels.voiceprintPrivacyDesc' },
];
</script>

<template>
  <q-tab-panel :name="name" class="voiceprint-record-stage q-pa-none">
    <div class="voiceprint-record-page-title">
      {{ i18n('labels.title') }}
    </div>

    <div v-for="(section, index) in sections" :key="index" class="voiceprint-record-section">
      <img :src="section.icon" alt="" aria-hidden="true" class="voiceprint-intro-section-icon" />
      <div class="voiceprint-record-section-body">
        <p class="voiceprint-record-section-title">{{ i18n(section.titleKey) }}</p>
        <p class="voiceprint-record-section-desc">{{ i18n(section.descKey) }}</p>
      </div>
    </div>

    <button class="auth-btn-primary voiceprint-record-cta" type="button" @click="emit('next')">
      {{ i18n('labels.continue') }}
    </button>
  </q-tab-panel>
</template>

<style scoped>
/* All structural styles live in src/css/app.scss under
   "===== Voiceprint Recording module patterns, designs =====". */
.voiceprint-intro-section-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  object-fit: contain;
}
</style>
