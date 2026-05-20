<script setup lang="ts">
// OrdersPage — design 64595f70 (我的订单, 375×812 artboard).
//
// Layout: top tab row (全部 / 待付款 / 待发货 / 待收货 / 售后) + vertical list
// of order cards. Active tab is 17px Medium; inactive tabs are 14px Regular.
// Each card stacks a product row (88×88 image placeholder + name + variant +
// price) and a trailing action row with rounded-pill buttons. Styles live in
// app.scss (`.orders-*`).

import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';

import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.OrdersPage');
const $q = useQuasar();

type OrderTab = 'all' | 'toPay' | 'toShip' | 'toReceive' | 'afterSale';

interface OrderAction {
  key: string;
  label: string;
  primary?: boolean;
}

interface Order {
  id: string;
  tab: OrderTab;
  imgSrc?: string;
  name: string;
  variant: string;
  price: string;
  actions: OrderAction[];
}

const tabs = computed<{ key: OrderTab; label: string }[]>(() => [
  { key: 'all', label: i18n('labels.tabAll') },
  { key: 'toPay', label: i18n('labels.tabPending') },
  { key: 'toShip', label: i18n('labels.tabShip') },
  { key: 'toReceive', label: i18n('labels.tabRecv') },
  { key: 'afterSale', label: i18n('labels.tabAfter') },
]);

const activeTab = ref<OrderTab>('all');

// Mock orders (D-mock). Product name is from raw design JSON text node.
const orders = computed<Order[]>(() => [
  {
    id: '1',
    tab: 'afterSale',
    name: i18n('items.orderName'),
    variant: i18n('items.variant'),
    price: '¥89',
    actions: [
      { key: 'more', label: i18n('labels.more') },
      { key: 'repurchase', label: i18n('labels.repurchase') },
    ],
  },
  {
    id: '2',
    tab: 'afterSale',
    name: i18n('items.orderName'),
    variant: i18n('items.variant'),
    price: '¥89',
    actions: [
      { key: 'refund', label: i18n('labels.refund') },
      { key: 'review', label: i18n('labels.review'), primary: true },
    ],
  },
]);

const visibleOrders = computed(() =>
  activeTab.value === 'all' ? orders.value : orders.value.filter((o) => o.tab === activeTab.value),
);

function onTabClick(tab: OrderTab) {
  activeTab.value = tab;
}

function onActionClick(_order: Order, action: OrderAction) {
  $q.notify({ message: action.label, type: 'info' });
}
</script>

<template>
  <q-page class="orders-page">
    <div class="orders-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="orders-tab"
        :class="{ 'orders-tab--active': activeTab === tab.key }"
        :aria-pressed="activeTab === tab.key"
        @click="onTabClick(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="visibleOrders.length" class="orders-list">
      <div v-for="order in visibleOrders" :key="order.id" class="orders-card">
        <div class="orders-product">
          <img v-if="order.imgSrc" :src="order.imgSrc" alt="" class="orders-product__img" />
          <div v-else class="orders-product__img" aria-hidden="true" />
          <div class="orders-product__info">
            <div class="orders-product__name">{{ order.name }}</div>
            <div class="orders-product__variant">{{ order.variant }}</div>
            <div class="orders-product__price">{{ order.price }}</div>
          </div>
        </div>
        <div class="orders-actions">
          <button
            v-for="action in order.actions"
            :key="action.key"
            class="orders-action-btn"
            :class="{ 'orders-action-btn--primary': action.primary }"
            type="button"
            @click="onActionClick(order, action)"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>

    <div v-else class="orders-empty">
      {{ i18n('labels.empty') }}
    </div>
  </q-page>
</template>

<style scoped></style>
