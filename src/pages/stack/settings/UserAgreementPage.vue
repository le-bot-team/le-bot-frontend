<script setup lang="ts">
// UserAgreementPage — 用户协议页面

import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.settings.UserAgreementPage');
</script>

<template>
  <q-page class="settings-sub-page">
    <div class="settings-sub-page__card q-pa-md">
      <div class="q-mb-lg">
        <h3 style="font-size: 15px; font-weight: 500; color: var(--clr-text); margin: 0 0 8px">
          {{ i18n('content.title1') }}
        </h3>
        <p style="font-size: 14px; line-height: 22px; color: var(--clr-weak); margin: 0">
          {{ i18n('content.body1') }}
        </p>
      </div>
      <div class="q-mb-lg">
        <h3 style="font-size: 15px; font-weight: 500; color: var(--clr-text); margin: 0 0 8px">
          {{ i18n('content.title2') }}
        </h3>
        <p style="font-size: 14px; line-height: 22px; color: var(--clr-weak); margin: 0">
          {{ i18n('content.body2') }}
        </p>
      </div>
      <div class="q-mb-lg">
        <h3 style="font-size: 15px; font-weight: 500; color: var(--clr-text); margin: 0 0 8px">
          {{ i18n('content.title3') }}
        </h3>
        <p style="font-size: 14px; line-height: 22px; color: var(--clr-weak); margin: 0">
          {{ i18n('content.body3') }}
        </p>
      </div>
      <div class="q-mb-lg">
        <h3 style="font-size: 15px; font-weight: 500; color: var(--clr-text); margin: 0 0 8px">
          {{ i18n('content.title4') }}
        </h3>
        <p style="font-size: 14px; line-height: 22px; color: var(--clr-weak); margin: 0">
          {{ i18n('content.body4') }}
        </p>
      </div>
      <div>
        <h3 style="font-size: 15px; font-weight: 500; color: var(--clr-text); margin: 0 0 8px">
          {{ i18n('content.title5') }}
        </h3>
        <p style="font-size: 14px; line-height: 22px; color: var(--clr-weak); margin: 0">
          {{ i18n('content.body5') }}
        </p>
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
