<script setup lang="ts">
// AddressesPage — delivery address management (Template A).

import { ref } from 'vue';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.settings.AddressesPage');

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

const addresses = ref<Address[]>([
  {
    id: '1',
    name: '张三',
    phone: '138****1234',
    address: '上海市浦东新区张江高科技园区',
    isDefault: true,
  },
]);

function addAddress() {
  // TODO: implement add address
}
</script>

<template>
  <q-page class="settings-sub-page">
    <div v-if="addresses.length" class="settings-sub-page__card">
      <div
        v-for="addr in addresses"
        :key="addr.id"
        class="settings-sub-page__row"
        style="flex-direction: column; align-items: flex-start; gap: 4px; padding: 14px 16px"
      >
        <div class="row items-center q-gutter-x-sm">
          <span style="font-weight: 500; color: var(--clr-text)">{{ addr.name }}</span>
          <span style="color: var(--clr-caption); font-size: 13px">{{ addr.phone }}</span>
          <q-chip
            v-if="addr.isDefault"
            dense
            size="sm"
            style="background: var(--clr-dialog-btn-link-bg); color: white"
            >{{ i18n('labels.default') }}</q-chip
          >
        </div>
        <div style="font-size: 13px; color: var(--clr-weak); line-height: 18px">
          {{ addr.address }}
        </div>
      </div>
    </div>
    <div
      v-else
      class="settings-sub-page__card q-pa-lg"
      style="text-align: center; color: var(--clr-caption)"
    >
      {{ i18n('labels.empty') }}
    </div>
    <div class="q-mt-md">
      <button
        type="button"
        class="btn-max"
        disabled
        @click="addAddress"
      >
        {{ i18n('labels.addAddress') }}
      </button>
    </div>
  </q-page>
</template>

<style scoped>
.btn-max {
  width: var(--btn-width);
  height: var(--btn-height);
  border: none;
  border-radius: var(--btn-radius);
  background: var(--clr-btn-primary-bg);
  color: var(--clr-white);
  font-family: var(--font-family);
  font-size: var(--font-size-btn);
  font-weight: 500;
  cursor: pointer;
}

.btn-max:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
