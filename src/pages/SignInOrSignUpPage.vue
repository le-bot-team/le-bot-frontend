<script setup lang="ts">
import { ref } from 'vue';

import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.SignInOrSignUpPage');

const emailPhoneRegexList = [/^\+?[1-9]\d{1,14}$/, /^[^\s@]+@[^\s@]+\.[^\s@]+$/];

const avatar = ref<string>();
const codeOrPassword = ref<string>();
const emailOrPhone = ref<string>();
// const isSignedUp = ref(false);
const signInMethod = ref<'code' | 'password'>('code');

const verifyPhoneOrEmail = () => {
  if (!emailPhoneRegexList.some((regex) => regex.test(emailOrPhone.value ?? ''))) {
    return false;
  }
  // Pseudo verification logic
  // if (emailOrPhone.value === '12312341234' || emailOrPhone.value === 'foo@bar.com') {
  //   isSignedUp.value = true;
  //   return true;
  // } else {
  //   isSignedUp.value = false;
  //   return false;
  // }
};
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
        <q-input
          class="full-width"
          clearable
          :label="i18n('labels.phoneOrEmail')"
          name="emailOrPhoneInput"
          outlined
          :rules="[
            (value) =>
              emailPhoneRegexList.some((regex) => regex.test(value ?? '')) ||
              i18n('errors.invalidPhoneOrEmail'),
          ]"
          v-model="emailOrPhone"
        />
        <q-slide-transition>
          <div class="full-width row">
            <q-input
              class="col-grow"
              clearable
              :label="i18n(`labels.${signInMethod}`)"
              name="passwordInput"
              type="password"
              outlined
              v-model="codeOrPassword"
            />
            <q-btn
              v-if="signInMethod === 'code'"
              class="q-ml-md"
              color="primary"
              icon-right="send"
              :label="i18n('labels.sendCode')"
              no-caps
            />
          </div>
        </q-slide-transition>
        <q-btn
          class="q-mt-lg full-width"
          color="primary"
          :label="i18n(`labels.${signInMethod === 'code' ? 'signInOrSignUp' : 'signIn'}`)"
          no-caps
          size="lg"
          @click="verifyPhoneOrEmail"
        />
        <q-slide-transition>
          <q-btn
            class="q-mt-sm full-width"
            flat
            :label="i18n(`labels.${signInMethod === 'code' ? 'usePassword' : 'useCode'}`)"
            no-caps
            size="lg"
            @click="signInMethod = signInMethod === 'code' ? 'password' : 'code'"
          />
        </q-slide-transition>
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
