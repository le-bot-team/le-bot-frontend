<script setup lang="ts">
import { ref } from 'vue';

import SignInOrSignUpPanel from 'components/auth/SignInOrSignUpPanel.vue';

import { i18nSubPath } from 'src/utils/common';
import NewPasswordPanel from 'components/auth/NewPasswordPanel.vue';

const i18n = i18nSubPath('pages.AuthPage');

const avatar = ref<string>('');
const code = ref<string>('');
const emailOrPhone = ref<string>('');
const isNew = ref<boolean>(false);
const panelIndex = ref<number>(1);
const processType = ref<'email' | 'phone'>();
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
            @finish="panelIndex = -1"
            @next="
              (_isNew, _type, _emailOrPhone, _code) => {
                isNew = _isNew;
                processType = _type;
                emailOrPhone = _emailOrPhone;
                code = _code;
                panelIndex = 1;
              }
            "
          />
          <new-password-panel
            :code="code"
            :email-or-phone="emailOrPhone"
            :is-new="isNew"
            :name="1"
            :type="processType"
          />
        </q-tab-panels>
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
