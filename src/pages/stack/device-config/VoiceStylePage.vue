<template>
  <q-page class="voice-style-page">
    <!-- Top card: current style + rate slider -->
    <section class="voice-style-card voice-style-card--current">
      <div class="voice-style-current-head">
        <img class="voice-style-current-icon" :src="speakerIcon" alt="" />
        <div class="voice-style-current-name">
          {{ i18n(`styles.${selectedKey}`) }}
        </div>
      </div>

      <div class="voice-style-rate-row">
        <span>{{ i18n('labels.rateLabel') }}</span>
        <span class="voice-style-rate-value">{{ rate.toFixed(1) }}x</span>
      </div>

      <input
        class="voice-style-slider"
        type="range"
        min="0.5"
        max="2"
        step="0.1"
        v-model.number="rate"
        :style="{ '--voice-slider-pct': ratePct }"
      />
    </section>

    <div class="voice-style-section-title">
      {{ i18n('labels.sectionTitle') }}
    </div>

    <!-- Bottom card: selectable styles -->
    <section class="voice-style-card" role="radiogroup" :aria-label="i18n('labels.sectionTitle')">
      <div
        v-for="s in styles"
        :key="s.key"
        class="voice-style-list-row"
        role="radio"
        tabindex="0"
        :aria-checked="selectedKey === s.key"
        @click="selectStyle(s.key)"
        @keydown.enter.prevent="selectStyle(s.key)"
        @keydown.space.prevent="selectStyle(s.key)"
      >
        <span>{{ i18n(`styles.${s.key}`) }}</span>
        <img class="voice-style-mark" :src="selectedKey === s.key ? checkIcon : radioIcon" alt="" />
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
// VoiceStylePage — design 4b20baad (乐宝设置-语音风格).
// Two stacked cards over the neutral-bg page: the top card shows the
// current voice + a rate slider; the bottom card is a selectable list of
// style presets. Slider track/thumb colors live as CSS variables in
// app.scss (`--clr-voice-slider-*`); fill ratio is driven by the inline
// `--voice-slider-pct` custom property updated from `rate`.
import { computed, ref, watch } from 'vue';

import speakerIcon from 'src/assets/lanhu/device-config/voice/icon-speaker.png';
import checkIcon from 'src/assets/lanhu/device-config/voice/icon-check.png';
import radioIcon from 'src/assets/lanhu/device-config/voice/icon-radio.png';
import { i18nSubPath } from 'src/utils/common';
import { useDeviceStore } from 'stores/device';

const i18n = i18nSubPath('pages.stack.VoiceStylePage');
const deviceStore = useDeviceStore();

type VoiceStyleKey = 'cuteChild' | 'gentleSister' | 'sunnyBoy' | 'cuteRobot' | 'sweetLady';

const styles: ReadonlyArray<{ key: VoiceStyleKey }> = [
  { key: 'cuteChild' },
  { key: 'gentleSister' },
  { key: 'sunnyBoy' },
  { key: 'cuteRobot' },
  { key: 'sweetLady' },
];

const validKeys = styles.map((s) => s.key as string);

function resolveStyleKey(raw?: string): VoiceStyleKey {
  return validKeys.includes(raw ?? '') ? (raw as VoiceStyleKey) : 'cuteChild';
}

const selectedKey = ref<VoiceStyleKey>(
  resolveStyleKey(deviceStore.currentDevice?.config?.voiceStyle),
);
const rate = ref<number>(deviceStore.currentDevice?.config?.speechRate ?? 1.5);

// Sync selection when currentDevice loads/changes (e.g. after refresh)
const storeVoiceStyle = computed(() => deviceStore.currentDevice?.config?.voiceStyle);
watch(storeVoiceStyle, (newVal) => {
  selectedKey.value = resolveStyleKey(newVal);
});

// Sync rate from store when currentDevice loads/changes
const storeSpeechRate = computed(() => deviceStore.currentDevice?.config?.speechRate);
watch(storeSpeechRate, (newVal) => {
  if (newVal !== undefined) rate.value = newVal;
});

// Slider fill ratio: rate range 0.5..2.0 (span 1.5)
const ratePct = computed(() => `${((rate.value - 0.5) / 1.5) * 100}%`);

function selectStyle(key: VoiceStyleKey) {
  selectedKey.value = key;
  deviceStore.updateCurrentDeviceConfig({ voiceStyle: key });
}

// Persist rate changes to device config (guard against redundant writes)
watch(rate, (newRate) => {
  if (deviceStore.currentDevice?.config?.speechRate === newRate) return;
  deviceStore.updateCurrentDeviceConfig({ speechRate: newRate });
});
</script>
