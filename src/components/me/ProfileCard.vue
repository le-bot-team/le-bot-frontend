<script setup lang="ts">
import { i18nSubPath } from 'src/utils/common';
import { useProfileStore } from 'stores/profile';
import { storeToRefs } from 'pinia';

const i18n = i18nSubPath('components.me.ProfileCard');

const { profile } = storeToRefs(useProfileStore());
</script>

<template>
  <q-item
    class="profile-card-item"
    clickable
    :to="profile ? '/stack/profile' : '/stack/auth?from=/main/me'"
  >
    <q-item-section avatar>
      <div class="me-avatar profile-card-avatar">
        <q-img v-if="profile?.avatar" :src="profile.avatar" />
        <q-icon v-else color="grey-6" name="person" size="40px" />
      </div>
    </q-item-section>
    <q-item-section v-if="profile">
      <q-item-label class="profile-card-nickname">
        {{ profile.nickname }}
      </q-item-label>
      <q-item-label class="profile-card-id">
        {{ i18n('labels.idAccount', { id: profile.id }) }}
      </q-item-label>
    </q-item-section>
    <q-item-section v-else>
      <q-item-label class="profile-card-nickname">
        {{ i18n('labels.signInOrSignUp') }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<style scoped lang="scss">
.profile-card-item {
  padding: 12px 8px;
  background: transparent;
}

.profile-card-avatar {
  width: var(--profile-avatar-size);
  height: var(--profile-avatar-size);
}

.profile-card-nickname {
  font-family: var(--font-family);
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
  color: var(--clr-text);
}

.profile-card-id {
  font-family: var(--font-family);
  font-size: var(--font-size-terms);
  font-weight: 400;
  line-height: 16px;
  color: var(--clr-caption);
  margin-top: 4px;
}
</style>
