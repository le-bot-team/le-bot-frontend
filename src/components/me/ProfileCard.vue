<script setup lang="ts">
import { useQuasar } from 'quasar';

import { i18nSubPath } from 'src/utils/common';
import { useProfileStore } from 'stores/profile';

const i18n = i18nSubPath('components.me.ProfileCard');

const { profile } = useProfileStore();
const { dark } = useQuasar();
</script>

<template>
  <q-card flat>
    <q-item class="q-py-md" clickable :to="profile ? '/stack/profile' : '/stack/auth?from=/main/me'">
      <q-item-section avatar>
        <q-avatar
          class="cursor-pointer"
          style="border: 1px solid #c2c2c2"
          :text-color="dark.isActive ? 'grey-5' : 'grey-8'"
        >
          <q-img v-if="profile?.avatar" :src="profile?.avatar" />
          <q-icon v-else name="person" size="lg" />
        </q-avatar>
      </q-item-section>
      <q-item-section v-if="profile">
        <q-item-label class="text-h6">
          {{ profile.nickname }}
        </q-item-label>
        <q-item-label caption>
          ID: {{ profile.id }}
        </q-item-label>
      </q-item-section>
      <q-item-section v-else>
        <q-item-label class="text-h6">
          {{ i18n('labels.signInOrSignUp') }}
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-icon name="chevron_right"/>
      </q-item-section>
    </q-item>
  </q-card>
</template>

<style scoped></style>
