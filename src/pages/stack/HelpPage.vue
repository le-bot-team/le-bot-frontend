<script setup lang="ts">
// HelpPage — design 689263cd (帮助与反馈, 375×812 artboard).
//
// Layout: neutral page bg with a 335×62 top card ("常见问题" + chevron) and a
// 335×310 body card with 5 rows spaced at 62px:
//   客服电话 → 400-900-xxxx (link-blue)
//   邮箱     → service@lebo.com
//   微信客服 → chevron
//   意见反馈 → chevron
//   问题日志上报 → chevron
// Styles live in app.scss (`.help-*`).

import { useQuasar } from 'quasar';
import { computed } from 'vue';

import { useRouter } from 'vue-router';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.HelpPage');
const $q = useQuasar();
const router = useRouter();

type RowKind = 'value' | 'link' | 'chevron';

interface HelpRow {
  key: string;
  label: string;
  kind: RowKind;
  value?: string;
}

const rows = computed<HelpRow[]>(() => [
  { key: 'phone', label: i18n('labels.phone'), kind: 'link', value: i18n('labels.phoneValue') },
  { key: 'email', label: i18n('labels.email'), kind: 'value', value: i18n('labels.emailValue') },
  { key: 'wechat', label: i18n('labels.wechat'), kind: 'chevron' },
  { key: 'feedback', label: i18n('labels.feedback'), kind: 'chevron' },
  { key: 'logReport', label: i18n('labels.logReport'), kind: 'chevron' },
]);

function onFaq() {
  router.push('/stack/help/faq').catch(console.error);
}

function onRowClick(row: HelpRow) {
  if (row.kind === 'link') {
    const dialable = row.value?.replace(/[^\d+]/g, '');
    if (dialable && dialable.length >= 3) {
      window.open(`tel:${dialable}`, '_self');
    } else {
      $q.notify({ message: row.value ?? '', type: 'info' });
    }
  } else if (row.kind === 'value') {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(row.value ?? '').then(
        () => $q.notify({ message: i18n('notifications.copied'), type: 'positive' }),
        () => $q.notify({ message: i18n('notifications.copyFailed'), type: 'negative' }),
      );
    } else {
      $q.notify({ message: i18n('notifications.copyFailed'), type: 'negative' });
    }
  } else if (row.kind === 'chevron') {
    if (row.key === 'feedback') {
      router.push('/stack/help/feedback').catch(console.error);
    } else {
      $q.notify({ message: i18n('notifications.comingSoon'), type: 'info' });
    }
  }
}
</script>

<template>
  <q-page class="help-page">
    <button type="button" class="help-card-head" @click="onFaq">
      <span class="help-row__label">{{ i18n('labels.faq') }}</span>
      <q-icon class="help-row__chevron" name="chevron_right" size="12px" />
    </button>

    <div class="help-card-body">
      <div
        v-for="row in rows"
        :key="row.key"
        class="help-row"
        role="button"
        tabindex="0"
        @click="onRowClick(row)"
        @keydown.enter="onRowClick(row)"
        @keydown.space.prevent="onRowClick(row)"
      >
        <span class="help-row__label">{{ row.label }}</span>
        <span v-if="row.kind === 'link'" class="help-row__value help-row__value--link">
          {{ row.value }}
        </span>
        <span v-else-if="row.kind === 'value'" class="help-row__value">
          {{ row.value }}
        </span>
        <q-icon v-else class="help-row__chevron" name="chevron_right" size="12px" />
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
