<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import { logoutAccount } from 'src/utils/account';
import { i18nSubPath } from 'src/utils/common';
import { useProfileStore } from 'stores/profile';

const i18n = i18nSubPath('pages.stack.SettingsPage');
const router = useRouter();
const profileStore = useProfileStore();
const { profile } = storeToRefs(profileStore);

interface MenuItem {
  label: string;
  to?: string;
  disabled?: boolean;
  caption?: string;
}

// Design daac9da5: 4 card groups of 3 / 6 / 3 / 4 rows.
const menuGroups = computed<MenuItem[][]>(() => [
  [
    profile.value
      ? {
          label: i18n('labels.profileSettings'),
          to: '/stack/profile/edit',
        }
      : {
          label: i18n('labels.signInOrSignUp'),
          to: '/stack/auth?from=/stack/settings',
        },
    { label: i18n('labels.deliveryAddresses'), to: '/stack/settings/addresses' },
    { label: i18n('labels.languageSettings'), to: '/stack/settings/language' },
  ],
  [
    { label: i18n('labels.messageSettings'), to: '/stack/settings/notifications' },
    {
      label: i18n('labels.voiceprintSettings'),
      to: '/stack/settings/voiceprint',
      disabled: !profile.value,
    },
    { label: i18n('labels.generalSettings'), to: '/stack/settings/general' },
    { label: i18n('labels.privacySettings'), to: '/stack/settings/privacy' },
    { label: i18n('labels.permissionManagement'), to: '/stack/settings/permissions' },
    { label: i18n('labels.sensitiveWordFilter'), to: '/stack/settings/word-filter' },
  ],
  [
    { label: i18n('labels.clearCache'), caption: '146M', to: '/stack/settings/clear-cache' },
    { label: i18n('labels.networkDiagnostics'), to: '/stack/settings/network' },
    { label: i18n('labels.storageSpace'), to: '/stack/settings/storage' },
  ],
  [
    { label: i18n('labels.appVersion'), caption: 'v1.0' },
    { label: i18n('labels.privacyPolicy'), to: '/stack/settings/privacy-policy' },
    { label: i18n('labels.personalInfoList'), to: '/stack/settings/info-list' },
    {
      label: i18n('labels.icpFilingNumber'),
      caption: i18n('labels.internetICPCode', { code: '沪ICP备00000000号-1' }),
      disabled: true,
    },
  ],
]);

const onMenuClick = (item: MenuItem) => {
  if (item.disabled || !item.to) return;
  router.push(item.to).catch(console.error);
};

const onBottomAction = () => {
  if (profile.value) {
    logoutAccount();
  } else {
    router.push('/stack/auth?from=/stack/settings').catch(console.error);
  }
};
</script>

<template>
  <q-page class="settings-page">
    <div v-for="(group, gi) in menuGroups" :key="gi" class="me-card">
      <button
        v-for="(item, mi) in group"
        :key="mi"
        type="button"
        class="settings-menu-row"
        :aria-disabled="item.disabled ? 'true' : undefined"
        @click="onMenuClick(item)"
      >
        <span>{{ item.label }}</span>
        <span class="settings-menu-row__right">
          <span v-if="item.caption" class="settings-menu-row__caption">
            {{ item.caption }}
          </span>
          <q-icon
            v-if="item.to && !item.disabled"
            class="settings-menu-row__chevron"
            name="chevron_right"
            size="12px"
          />
        </span>
      </button>
    </div>

    <button class="me-btn-danger settings-logout" type="button" @click="onBottomAction">
      {{ profile ? i18n('labels.logout') : i18n('labels.signInOrSignUp') }}
    </button>
  </q-page>
</template>

<style scoped></style>
