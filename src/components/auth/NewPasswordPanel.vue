<script setup lang="ts">
import { useQuasar } from 'quasar';
import { onMounted, ref } from 'vue';

import { i18nSubPath } from 'src/utils/common';
import { emailPassword, emailReset, phonePassword, phoneReset } from 'src/utils/api/auth';
import { storeToRefs } from 'pinia';
import { useAuthStore } from 'stores/auth';

const props = defineProps<{
  code: string;
  emailOrPhone: string;
  isNew: boolean;
  name: string | number;
  type: 'email' | 'phone' | undefined;
}>();
const emit = defineEmits<{
  finish: [];
  next: [];
  previous: [];
}>();

const functionsMatrix = {
  email: {
    reset: emailReset,
    login: emailPassword,
  },
  phone: {
    reset: phoneReset,
    login: phonePassword,
  },
};

const i18n = i18nSubPath('components.auth.NewPasswordPanel');

const { accessToken } = storeToRefs(useAuthStore());
const { notify } = useQuasar();

const newPassword = ref<string>();

const confirmNewPassword = async () => {
  if (!props.type) {
    return;
  }

  if (newPassword.value === undefined || newPassword.value.length < 8) {
    notify({
      type: 'negative',
      message: i18n('notifications.passwordTooShort'),
    });
    return;
  }
  {
    const { data } = await functionsMatrix[props.type].reset(
      props.emailOrPhone,
      props.code,
      newPassword.value,
    );
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
  const { data } = await emailPassword(props.emailOrPhone, newPassword.value);
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
  if (props.code?.length !== 6) {
    notify({
      type: 'negative',
      message: i18n('notifications.invalidCode'),
    });
    setTimeout(() => {
      emit('previous');
    }, 3000);
  } else if (!props.emailOrPhone?.length) {
    notify({
      type: 'negative',
      message: i18n('notifications.invalidEmailOrPhone'),
    });
    setTimeout(() => {
      emit('previous');
    }, 3000);
  } else if (!props.type) {
    notify({
      type: 'negative',
      message: i18n('notifications.invalidType'),
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
    <q-input
      class="fullwidth"
      clearable
      counter
      :label="i18n('labels.newPassword')"
      name="newPassword"
      type="password"
      outlined
      v-model="newPassword"
    />
    <q-btn
      class="q-mt-lg full-width"
      color="primary"
      :disable="!newPassword?.length"
      :label="i18n('labels.confirmNewPassword')"
      no-caps
      size="lg"
      @click="confirmNewPassword"
    />
  </q-tab-panel>
</template>

<style scoped></style>
