<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';

import { emailCode, emailPassword } from 'src/utils/api/auth';
import { i18nSubPath } from 'src/utils/common';
import { useAuthStore } from 'stores/auth';
import VerificationCodeInput from 'components/auth/VerificationCodeInput.vue';
import PasswordInput from 'components/auth/PasswordInput.vue';

defineProps<{
  name: string | number;
}>();
const emit = defineEmits<{
  finish: [];
  next: [isNew: boolean, email: string, code: string];
}>();

const i18n = i18nSubPath('components.auth.SignInOrSignUpPanel');

const { accessToken } = storeToRefs(useAuthStore());
const { notify } = useQuasar();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const processFunctionsMatrix = {
  code: emailCode,
  password: emailPassword,
};

const codeOrPassword = ref<string>();
const email = ref<string>();
const processMethod = ref<'code' | 'password'>('code');

const codeError = computed(
  () => processMethod.value === 'code' && codeOrPassword.value?.length !== 6,
);
const isValidEmail = computed(() => emailRegex.test(email.value ?? ''));

const processSignInOrSignUp = async () => {
  if (!email.value?.length || !codeOrPassword.value?.length || !isValidEmail.value) {
    return;
  }

  const processFunction = processFunctionsMatrix[processMethod.value];
  if (!processFunction) {
    return;
  }

  try {
    const { data } = await processFunction(email.value, codeOrPassword.value);
    if (!data.success) {
      notify({
        type: 'negative',
        message: data.message ?? i18n('notifications.unknownError'),
      });
      return;
    }

    accessToken.value = data.data.accessToken;

    if (data.data.isNew) {
      emit('next', true, email.value, codeOrPassword.value);
    } else if (data.data.noPassword) {
      emit('next', false, email.value, codeOrPassword.value);
    } else {
      emit('finish');
    }
  } catch (error) {
    notify({
      type: 'negative',
      message: (error as Error).message ?? i18n('notifications.unknownError'),
    });
  }
};
</script>

<template>
  <q-tab-panel :name="name">
    <q-input
      class="full-width"
      clearable
      :label="i18n('labels.email')"
      lazy-rules
      name="emailInput"
      outlined
      :rules="[() => !email?.length || isValidEmail || i18n('errors.invalidEmail')]"
      v-model="email"
    />
    <verification-code-input
      v-if="processMethod === 'code'"
      :email="email"
      v-model="codeOrPassword"
    />
    <password-input v-else v-model="codeOrPassword" />
    <q-btn
      class="q-mt-lg full-width"
      color="primary"
      :disable="!isValidEmail || !codeOrPassword?.length || codeError"
      :label="i18n(`labels.${processMethod === 'code' ? 'signInOrSignUp' : 'signIn'}`)"
      no-caps
      size="lg"
      @click="processSignInOrSignUp"
    />
    <q-btn
      class="q-mt-sm full-width"
      flat
      :label="i18n(`labels.${processMethod === 'code' ? 'usePassword' : 'useCode'}`)"
      no-caps
      size="lg"
      @click="processMethod = processMethod === 'code' ? 'password' : 'code'"
    />
  </q-tab-panel>
</template>

<style scoped></style>
