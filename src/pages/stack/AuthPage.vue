<script setup lang="ts">
import { ref } from 'vue';

import FinishPanel from 'components/auth/FinishPanel.vue';
import NewPasswordPanel from 'components/auth/NewPasswordPanel.vue';
import SetupProfilePanel from 'components/auth/SetupProfilePanel.vue';
import SignInOrSignUpPanel from 'components/auth/SignInOrSignUpPanel.vue';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.main.AuthPage');

const avatar = ref<string>('');
const email = ref<string>('');
const isNew = ref<boolean>(false);
const panelIndex = ref<number>(0);
</script>

<template>
  <q-page class="flex flex-center">
    <div class="full-width row justify-center">
      <div
        class="col-grow col-md-6 col-lg-5 col-xl-4 column items-center justify-center q-gutter-y-sm q-pa-lg"
      >
        <q-avatar
          class="cursor-pointer"
          size="6rem"
          style="border-radius: 10%; border: 1px solid #c2c2c2"
          text-color="grey"
        >
          <q-img v-if="avatar" :src="avatar" />
          <div v-if="!avatar" class="text-color-grey text-font-inter" style="font-size: 2rem">
            Logo
          </div>
        </q-avatar>
        <div class="text-h4 text-weight-medium">
          {{ i18n('labels.title') }}
        </div>
        <div class="text-h6 text-weight-light">
          {{ i18n('labels.description') }}
        </div>
        <q-tab-panels class="full-width col-grow bg-transparent" v-model="panelIndex">
          <sign-in-or-sign-up-panel
            :name="0"
            @finish="panelIndex = 3"
            @next="
              (_isNew, _email, _code) => {
                isNew = _isNew;
                email = _email;
                panelIndex = 1;
              }
            "
          />
          <new-password-panel
            :email="email"
            :is-new="isNew"
            :name="1"
            @finish="panelIndex = 3"
            @next="panelIndex = 2"
          />
          <setup-profile-panel :name="2" @finish="panelIndex = 3" />
          <finish-panel :is-new="isNew" :name="3" :nickname="email" />
        </q-tab-panels>
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
