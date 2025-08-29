<script setup lang="ts">
import { useQuasar } from 'quasar';
import { onMounted, ref } from 'vue';

import { i18nSubPath } from 'src/utils/common';

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

const i18n = i18nSubPath('components.auth.NewPasswordPanel');
const { notify } = useQuasar();

const newPassword = ref<string>();

const confirmNewPassword = () => {
  if ((newPassword.value?.length ?? 0) < 8) {
    notify({
      type: 'negative',
      message: i18n('notifications.passwordTooShort'),
    });
    return;
  }
  emit('finish');
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
      {{ i18n('labels.welcome', { username: 'guest' }) }}
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
