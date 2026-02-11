<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, onMounted, ref } from 'vue';

import { i18nSubPath } from 'src/utils/common';
import { emailPassword, emailReset } from 'src/utils/api/auth';
import { storeToRefs } from 'pinia';
import { useAuthStore } from 'stores/auth';
import VerificationCodeInput from 'components/auth/VerificationCodeInput.vue';

const props = defineProps<{
  email: string;
  isNew: boolean;
  name: string | number;
}>();
const emit = defineEmits<{
  finish: [];
  next: [];
  previous: [];
}>();

const i18n = i18nSubPath('components.auth.NewPasswordPanel');

const { accessToken } = storeToRefs(useAuthStore());
const { notify } = useQuasar();

const code = ref<string>();
const newPassword = ref<string>();

const codeError = computed(() => code.value?.length !== 6);
const passwordError = computed(
  () => newPassword.value === undefined || newPassword.value.length < 8,
);

const confirmNewPassword = async () => {
  if (!newPassword.value?.length || !code.value?.length) {
    return;
  }
  {
    const { data } = await emailReset(props.email, code.value, newPassword.value);
    if (!data.success) {
      notify({
        type: 'negative',
        message: data.message || i18n('notifications.unknownError'),
      });
      return;
    }
    notify({
      type: 'positive',
      message: i18n('notifications.passwordResetSuccess'),
    });
  }
  const { data } = await emailPassword(props.email, newPassword.value);
  if (!data.success) {
    notify({
      type: 'negative',
      message: data.message || i18n('notifications.unknownError'),
    });
    return;
  }
  accessToken.value = data.data.accessToken;
  notify({
    type: 'positive',
    message: i18n('notifications.loginSuccess'),
  });
  if (props.isNew) {
    emit('next');
  } else {
    emit('finish');
  }
};

onMounted(() => {
  if (!props.email?.length) {
    notify({
      type: 'negative',
      message: i18n('notifications.invalidEmail'),
    });
    setTimeout(() => {
      emit('previous');
    }, 3000);
  }
});
</script>

<template>
  <q-tab-panel class="q-gutter-y-md" :name="name">
    <div class="text-h6 text-center" style="white-space: pre-line">
      {{ i18n(`labels.${isNew ? 'welcomeNew' : 'welcome'}`, { username: 'guest' }) }}
    </div>
    <verification-code-input :email="email" v-model="code" />
    <q-input
      class="fullwidth"
      clearable
      counter
      :label="i18n('labels.newPassword')"
      name="newPassword"
      type="password"
      outlined
      :rules="[
        () => !newPassword?.length || newPassword.length >= 8 || i18n('errors.passwordTooShort'),
      ]"
      v-model="newPassword"
    />
    <q-btn
      class="q-mt-lg full-width"
      color="primary"
      :disable="codeError || passwordError"
      :label="i18n('labels.confirmNewPassword')"
      no-caps
      size="lg"
      @click="confirmNewPassword"
    />
    <q-btn class="q-mt-lg full-width" color="primary" />
  </q-tab-panel>
</template>

<style scoped></style>
