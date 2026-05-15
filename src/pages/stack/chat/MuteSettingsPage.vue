<script setup lang="ts">
// MuteSettingsPage — mute settings for chat page, design inspired by Doubao.

import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.chat.MuteSettingsPage');
const { notify } = useQuasar();

const muteMode = ref(false);
const muteNotifications = ref(true);
const autoMute = ref(false);
const autoMuteStart = ref('22:00');
const autoMuteEnd = ref('07:00');

function toggleMuteMode() {
  notify({
    type: 'info',
    message: muteMode.value
      ? i18n('notifications.muteEnabled')
      : i18n('notifications.muteDisabled'),
  });
}

function toggleNotifications() {
  notify({
    type: 'info',
    message: muteNotifications.value
      ? '已开启静音通知'
      : '已关闭静音通知',
  });
}

function toggleAutoMute() {
  notify({
    type: 'info',
    message: autoMute.value
      ? '已开启定时静音'
      : '已关闭定时静音',
  });
}
</script>

<template>
  <q-page class="mute-settings-page">
    <!-- Mute Mode Section -->
    <div class="mute-settings-section">
      <div class="mute-settings-header">
        <span class="mute-settings-header__title">{{ i18n('labels.muteMode') }}</span>
      </div>
      <div class="mute-settings-row">
        <div class="mute-settings-row__content">
          <span class="mute-settings-row__label">{{ i18n('labels.muteMode') }}</span>
          <span class="mute-settings-row__desc">{{ i18n('labels.muteModeDesc') }}</span>
        </div>
        <q-toggle v-model="muteMode" color="primary" dense @update:model-value="toggleMuteMode" />
      </div>
    </div>

    <!-- Notifications Section -->
    <div class="mute-settings-section">
      <div class="mute-settings-header">
        <span class="mute-settings-header__title">{{ i18n('labels.muteNotifications') }}</span>
      </div>
      <div class="mute-settings-row">
        <div class="mute-settings-row__content">
          <span class="mute-settings-row__label">{{ i18n('labels.muteNotifications') }}</span>
          <span class="mute-settings-row__desc">{{ i18n('labels.muteNotificationsDesc') }}</span>
        </div>
        <q-toggle v-model="muteNotifications" color="primary" dense @update:model-value="toggleNotifications" />
      </div>
    </div>

    <!-- Auto Mute Section -->
    <div class="mute-settings-section">
      <div class="mute-settings-header">
        <span class="mute-settings-header__title">{{ i18n('labels.autoMute') }}</span>
      </div>
      <div class="mute-settings-row">
        <div class="mute-settings-row__content">
          <span class="mute-settings-row__label">{{ i18n('labels.autoMute') }}</span>
          <span class="mute-settings-row__desc">{{ i18n('labels.autoMuteDesc') }}</span>
        </div>
        <q-toggle v-model="autoMute" color="primary" dense @update:model-value="toggleAutoMute" />
      </div>

      <!-- Time Settings -->
      <div v-if="autoMute" class="mute-settings-time">
        <div class="mute-settings-time__item">
          <span class="mute-settings-time__label">{{ i18n('labels.startTime') }}</span>
          <input type="time" v-model="autoMuteStart" class="mute-settings-time__input" />
        </div>
        <div class="mute-settings-time__item">
          <span class="mute-settings-time__label">{{ i18n('labels.endTime') }}</span>
          <input type="time" v-model="autoMuteEnd" class="mute-settings-time__input" />
        </div>
      </div>
    </div>

    <!-- Tip -->
    <div class="mute-settings-tip">
      <q-icon name="info_outline" size="16px" />
      <span>开启静音模式后，乐宝将不再主动说话，但您仍可随时唤醒对话。</span>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.mute-settings-page {
  padding: var(--spacing-md);
  background: var(--clr-page-bg-neutral);
  min-height: calc(100vh - 50px);
}

.mute-settings-section {
  margin-bottom: 24px;
  background: var(--clr-card-bg);
  border-radius: var(--card-radius);
  padding: 0 16px;
}

.mute-settings-header {
  padding: var(--spacing-sm) 0;
  margin-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--clr-divider);
}

.mute-settings-header__title {
  font-family: var(--font-family);
  font-size: var(--font-size-caption);
  font-weight: 500;
  color: var(--clr-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mute-settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--clr-divider);
}

.mute-settings-row:last-child {
  border-bottom: none;
}

.mute-settings-row__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mute-settings-row__label {
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  font-weight: 500;
  color: var(--clr-text);
}

.mute-settings-row__desc {
  font-family: var(--font-family);
  font-size: var(--font-size-caption);
  color: var(--clr-placeholder);
}

.mute-settings-time {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 0;
  border-top: 1px dashed var(--clr-divider);
  margin-top: var(--spacing-sm);
}

.mute-settings-time__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.mute-settings-time__label {
  font-family: var(--font-family);
  font-size: var(--font-size-small);
  color: var(--clr-text-secondary);
}

.mute-settings-time__input {
  padding: var(--spacing-xs);
  border: 1px solid var(--clr-divider);
  border-radius: var(--input-radius);
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  color: var(--clr-text);
  background: var(--clr-page-bg-neutral);
  text-align: center;
}

.mute-settings-time__input:focus {
  outline: none;
  border-color: var(--clr-link);
  background: var(--clr-white);
}

.mute-settings-tip {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: rgba(216, 244, 255, 1); // 设计规范浅青背景
  border-radius: var(--card-radius);
  margin-top: 24px;
}

.mute-settings-tip .q-icon {
  color: var(--clr-link);
  flex-shrink: 0;
  margin-top: 2px;
}

.mute-settings-tip span {
  font-family: var(--font-family);
  font-size: var(--font-size-caption);
  color: var(--clr-link);
  line-height: 1.5;
}
</style>
