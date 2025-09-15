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
    <q-card-section class="row justify-start items-center q-gutter-x-md">
      <q-avatar
        class="cursor-pointer"
        style="border: 1px solid #c2c2c2"
        :text-color="dark.isActive ? 'grey-5' : 'grey-8'"
        to="/auth"
      >
        <q-img v-if="profile?.avatar" :src="profile?.avatar" />
        <q-icon v-else name="person" size="lg" />
      </q-avatar>
      <div v-if="profile" class="column">
        <div v-if="profile.nickname?.length">
          {{ profile.nickname }}
        </div>
        <div v-if="profile.id">ID: {{ profile.id }}</div>
      </div>
      <div v-else class="text-h6">
        {{ i18n('labels.signInOrSignUp') }}
      </div>
      <q-space />
      <q-btn flat icon="chevron_right" round :to="profile ? '/profile' : '/auth'" />
    </q-card-section>
  </q-card>
</template>

<style scoped></style>
