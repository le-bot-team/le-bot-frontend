<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';

import {
  emailChallenge,
  emailCode,
  emailPassword,
  phoneChallenge,
  phoneCode,
  phonePassword,
} from 'src/utils/api/auth';
import { i18nSubPath } from 'src/utils/common';
import { useAuthStore } from 'stores/auth';

defineProps<{
  name: string | number;
}>();
const emit = defineEmits<{
  finish: [];
  next: [isNew: boolean, type: 'email' | 'phone', emailOrPhone: string, code: string];
}>();

const i18n = i18nSubPath('components.auth.SignInOrSignUpPanel');
const { accessToken, isNeverSendCode, remainedSendCodeCooldownSeconds } =
  storeToRefs(useAuthStore());
const { notify } = useQuasar();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const processFunctionsMatrix = {
  code: {
    email: emailCode,
    phone: phoneCode,
  },
  password: {
    email: emailPassword,
    phone: phonePassword,
  },
};
const sendCodeFunctionsMatrix = {
  email: emailChallenge,
  phone: phoneChallenge,
};

const codeOrPassword = ref<string>();
const emailOrPhone = ref<string>();
const processMethod = ref<'code' | 'password'>('code');

const codeError = computed(
  () => processMethod.value === 'code' && codeOrPassword.value?.length !== 6,
);
const processType = computed(() => {
  if (emailRegex.test(emailOrPhone.value ?? '')) {
    return 'email';
  } else if (phoneRegex.test(emailOrPhone.value ?? '')) {
    return 'phone';
  }
  return null;
});

const processSignInOrSignUp = async () => {
  if (!emailOrPhone.value?.length || !codeOrPassword.value?.length || !processType.value?.length) {
    return;
  }

  const processFunction = processFunctionsMatrix[processMethod.value][processType.value];
  if (!processFunction) {
    return;
  }

  try {
    const { data } = await processFunction(emailOrPhone.value, codeOrPassword.value);
    if (!data.success) {
      notify({
        type: 'negative',
        message: data.message ?? i18n('notifications.unknownError'),
      });
      return;
    }

    accessToken.value = data.data.accessToken;

    if (data.data.isNew) {
      emit('next', true, processType.value, emailOrPhone.value, codeOrPassword.value);
    } else if (data.data.noPassword) {
      emit('next', false, processType.value, emailOrPhone.value, codeOrPassword.value);
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

const sendCode = async () => {
  if (!processType.value || !emailOrPhone.value?.length) {
    return;
  }

  try {
    const result = await sendCodeFunctionsMatrix[processType.value](emailOrPhone.value);
    if (!result.data.success) {
      notify({
        type: 'negative',
        message: result.data.message ?? i18n('notifications.unknownError'),
      });
      return;
    }
    notify({
      type: 'positive',
      message: i18n('notifications.codeSent'),
    });
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
      :label="i18n('labels.phoneOrEmail')"
      lazy-rules
      name="emailOrPhoneInput"
      outlined
      :rules="[() => !emailOrPhone?.length || !!processType || i18n('errors.invalidPhoneOrEmail')]"
      v-model="emailOrPhone"
    />
    <q-input
      class="full-width"
      clearable
      counter
      :label="i18n(`labels.${processMethod}`)"
      lazy-rules
      :maxlength="processMethod === 'code' ? 6 : undefined"
      :name="processMethod"
      :type="processMethod === 'password' ? 'password' : undefined"
      outlined
      :rules="[() => !codeOrPassword?.length || !codeError || i18n('errors.invalidCode')]"
      v-model="codeOrPassword"
    >
      <template v-slot:append>
        <q-btn
          v-if="processMethod === 'code'"
          dense
          :disable="!processType"
          flat
          :label="
            isNeverSendCode
              ? i18n('labels.sendCode')
              : remainedSendCodeCooldownSeconds
                ? i18n('labels.resendCodeCooldown', {
                    seconds: remainedSendCodeCooldownSeconds,
                  })
                : i18n('labels.resendCode')
          "
          no-caps
          @click="sendCode"
        />
      </template>
    </q-input>
    <q-btn
      class="q-mt-lg full-width"
      color="primary"
      :disable="!processType || !codeOrPassword?.length || codeError"
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
