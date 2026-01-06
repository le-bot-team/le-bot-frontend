<script setup lang="ts">
import { reactive } from 'vue';

import { logoutAccount } from 'src/utils/account';
import { i18nSubPath } from 'src/utils/common';
import { useProfileStore } from 'stores/profile';

const i18n = i18nSubPath('pages.stack.SettingsPage');

const { profile } = useProfileStore();

const menuGroups = reactive<{ disabled?: boolean; icon: string; label: string; to?: string }[][]>([
  [
    {
      icon: profile ? 'mdi-account-circle-outline' : 'mdi-login',
      label: profile ? i18n('labels.profileSettings') : i18n('labels.signInOrSignUp'),
      to: profile ? '/stack/profile?edit=true' : '/stack/auth?from=/stack/settings',
    },
    {
      disabled: !profile,
      icon: 'mdi-account-voice',
      label: i18n('labels.voiceprintSettings'),
      to: '/stack/settings/voiceprint',
    },
    {
      icon: 'mdi-map-marker-outline',
      label: i18n('labels.deliveryAddresses'),
      to: '/stack/settings/address',
    },
    {
      icon: 'mdi-web',
      label: i18n('labels.languageSettings'),
      to: '/stack/settings/language',
    },
  ],
  [
    {
      icon: 'mdi-bell-cog-outline',
      label: i18n('labels.messageSettings'),
      to: '/stack/settings/message',
    },
    {
      icon: 'mdi-cog-outline',
      label: i18n('labels.generalSettings'),
      to: '/stack/settings/general',
    },
    {
      icon: 'mdi-drama-masks',
      label: i18n('labels.privacySettings'),
      to: '/stack/settings/privacy',
    },
    {
      icon: 'mdi-security',
      label: i18n('labels.permissionManagement'),
      to: '/stack/settings/permission',
    },
  ],
  [
    {
      icon: 'mdi-broom',
      label: i18n('labels.clearCache'),
      to: '/stack/settings/clear-cache',
    },
    {
      icon: 'mdi-wifi-check',
      label: i18n('labels.networkDiagnostics'),
      to: '/stack/settings/network',
    },
    {
      icon: 'mdi-database',
      label: i18n('labels.storageSpace'),
      to: '/stack/settings/storage',
    },
  ],
  [
    {
      icon: 'mdi-information-outline',
      label: i18n('labels.appVersion'),
      to: '/stack/settings/version',
    },
    {
      icon: 'mdi-file-document-multiple-outline',
      label: i18n('labels.privacyPolicy'),
      to: '/stack/settings/policy',
    },
    {
      icon: 'mdi-file-sign',
      label: i18n('labels.termsOfService'),
      to: '/stack/settings/tos',
    },
  ],
]);
</script>

<template>
  <q-page class="column q-gutter-y-lg q-pa-md">
    <q-card v-for="(menuGroup, groupIndex) in menuGroups" :key="groupIndex" bordered flat>
      <q-list>
        <q-item
          v-for="(menu, menuIndex) in menuGroup"
          :key="menuIndex"
          :disable="menu.disabled"
          :to="menu.to"
        >
          <q-item-section avatar>
            <q-icon :name="menu.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ menu.label }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
    <q-btn v-if="profile" color="red" :label="i18n('labels.logout')" @click="logoutAccount" />
    <div class="text-center text-caption text-grey">
      {{ i18n('labels.internetICPCode', { code: '沪ICP备00000000号-1' }) }}
    </div>
  </q-page>
</template>

<style scoped></style>
