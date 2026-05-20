<script setup lang="ts">
// StorageSpacePage — storage usage visualization (Template A).

import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.settings.StorageSpacePage');

const totalMB = 512;
const usedMB = 186;
const cacheMB = 146;
const chatMB = 30;
const otherMB = 10;

const usagePercent = Math.round((usedMB / totalMB) * 100);
</script>

<template>
  <q-page class="settings-sub-page">
    <!-- Usage overview -->
    <div class="settings-sub-page__card q-pa-md">
      <div class="column items-center q-gutter-y-sm">
        <q-circular-progress
          :value="usagePercent"
          size="100px"
          :thickness="0.15"
          color="cyan"
          track-color="grey-3"
          show-value
        >
          {{ usagePercent }}%
        </q-circular-progress>
        <div style="font-size: 14px; color: var(--clr-weak)">
          {{ i18n('labels.used') }} {{ usedMB }}M / {{ i18n('labels.total') }} {{ totalMB }}M
        </div>
      </div>
    </div>

    <!-- Breakdown -->
    <div class="settings-sub-page__card q-mt-md">
      <div class="settings-sub-page__row">
        <span class="settings-sub-page__row-label">{{ i18n('labels.cache') }}</span>
        <span class="settings-sub-page__row-value">{{ cacheMB }}M</span>
      </div>
      <div class="settings-sub-page__row">
        <span class="settings-sub-page__row-label">{{ i18n('labels.chatData') }}</span>
        <span class="settings-sub-page__row-value">{{ chatMB }}M</span>
      </div>
      <div class="settings-sub-page__row">
        <span class="settings-sub-page__row-label">{{ i18n('labels.other') }}</span>
        <span class="settings-sub-page__row-value">{{ otherMB }}M</span>
      </div>
      <div class="settings-sub-page__row">
        <span class="settings-sub-page__row-label">{{ i18n('labels.available') }}</span>
        <span class="settings-sub-page__row-value" style="color: var(--clr-link)"
          >{{ totalMB - usedMB }}M</span
        >
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
