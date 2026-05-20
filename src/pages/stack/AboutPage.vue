<script setup lang="ts">
// AboutPage — design 897ffb14 (关于我们, 375×812 artboard).
//
// Layout: neutral page bg with a centered 公司简介 title (16px Regular,
// top=120) followed by a long body paragraph (14px Regular rgba(99,104,104,1)
// lineHeight 24, left=28, top=152, 319×462). Styles live in app.scss
// (`.about-*`).

import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.AboutPage');
</script>

<template>
  <q-page class="about-page">
    <div class="about-section-title">
      {{ i18n('labels.companyDescriptionTitle') }}
    </div>
    <div class="about-body">
      {{ i18n('labels.companyDescription') }}
    </div>
  </q-page>
</template>

<style scoped></style>
