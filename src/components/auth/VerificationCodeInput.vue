<script setup lang="ts">
import { emailChallenge } from 'src/utils/api/auth';
import { i18nSubPath } from 'src/utils/common';
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useAuthStore } from 'stores/auth';

const props = defineProps<{
  email?: string | undefined;
}>();
const modelValue = defineModel<string | undefined>();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const i18n = i18nSubPath('components.auth.VerificationCodeInput');

const { isNeverSendCode, remainedSendCodeCooldownSeconds } = storeToRefs(useAuthStore());
const { notify } = useQuasar();

const isSendingCode = ref(false);

const isValidEmail = computed(() => emailRegex.test(props.email ?? ''));

const sendCode = async () => {
  if (!isValidEmail.value || !props.email?.length) {
    return;
  }

  isSendingCode.value = true;
  try {
    const result = await emailChallenge(props.email);
    if (!result.data.success) {
      notify({
        type: 'warning',
        message: i18n('notifications.sendCodeFailed'),
        caption: result.data.message,
      });
      isSendingCode.value = false;
      return;
    }
    notify({
      type: 'positive',
      message: i18n('notifications.sendCodeSuccess'),
    });
  } catch (error) {
    notify({
      type: 'negative',
      message: i18n('notifications.sendCodeError'),
      caption: (error as Error).message,
    });
  }
  isSendingCode.value = false;
};
</script>

<template>
  <q-input
    class="full-width"
    clearable
    counter
    :label="i18n(`labels.title`)"
    lazy-rules
    maxlength="6"
    outlined
    :rules="[() => !modelValue?.length || modelValue.length === 6 || i18n('errors.invalidCode')]"
    v-model="modelValue"
  >
    <template v-slot:append>
      <q-btn
        color="primary"
        dense
        :disable="!isValidEmail"
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
        :loading="isSendingCode"
        no-caps
        @click="sendCode"
      />
    </template>
  </q-input>
</template>

<style scoped></style>
