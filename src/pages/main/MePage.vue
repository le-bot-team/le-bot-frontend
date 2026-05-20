<script setup lang="ts">
import ProfileCard from 'components/me/ProfileCard.vue';
import { router } from 'src/router';
import { i18nSubPath } from 'src/utils/common';
import { useTracker } from 'src/composables/useTracker';
import iconMsgHome from 'src/assets/lanhu/me/icon-msg-home.png';
import imgMemberCenter from 'src/assets/lanhu/me/img-member-center.png';
import imgServiceCenter from 'src/assets/lanhu/me/img-service-center.png';
import iconOrder from 'src/assets/lanhu/me/icon-order.png';
import iconChildInfor from 'src/assets/lanhu/me/icon-child-infor.png';
import iconFeedback from 'src/assets/lanhu/me/icon-feedback.png';
import iconAboutUs from 'src/assets/lanhu/me/icon-about-us.png';
import iconSet from 'src/assets/lanhu/me/icon-set.png';

const i18n = i18nSubPath('pages.main.MePage');
const { trackClick } = useTracker();

interface MenuEntry {
  iconSrc?: string;
  icon?: string;
  label: string;
  to: string;
}

const menuList: MenuEntry[] = [
  {
    iconSrc: iconOrder,
    label: i18n('labels.myOrders'),
    // TODO: Replace with '/stack/orders' once OrdersPage is implemented.
    to: '/stack/devices',
  },
  {
    iconSrc: iconChildInfor,
    label: i18n('labels.familyGroup'),
    to: '/stack/family-group',
  },
  {
    iconSrc: iconFeedback,
    label: i18n('labels.helpAndFeedback'),
    // TODO: Replace with '/stack/help' once HelpPage is implemented.
    to: '/stack/about',
  },
  {
    iconSrc: iconAboutUs,
    label: i18n('labels.aboutUs'),
    to: '/stack/about',
  },
  {
    iconSrc: iconSet,
    label: i18n('labels.settings'),
    to: '/stack/settings',
  },
];

// Notification icon routes to the message center (design 5f6208e5).
const onNotificationClick = () => {
  trackClick('btn_click_me_notifications');
  // TODO: Replace with '/stack/messages' once MessagesPage is implemented.
  router.push('/stack/chat/history').catch((err) => console.error(err));
};
</script>

<template>
  <q-page class="me-page row justify-center">
    <div class="me-container column q-pa-lg q-gutter-y-lg">
      <div class="row items-center justify-end me-topbar">
        <q-btn
          :aria-label="i18n('labels.notifications')"
          class="me-notify-btn"
          flat
          round
          @click="onNotificationClick"
        >
          <q-img :src="iconMsgHome" width="24px" height="24px" no-spinner />
        </q-btn>
      </div>

      <profile-card />

      <div class="row q-col-gutter-md">
        <div class="col-6">
          <q-card class="me-highlight-card me-card-member" flat>
            <div class="me-card-text">
              <div class="me-card-title">
                {{ i18n('labels.memberCenter') }}
              </div>
              <div class="me-card-caption">
                {{ i18n('labels.memberCenterDescription') }}
              </div>
            </div>
            <q-img
              class="me-card-icon"
              :src="imgMemberCenter"
              width="48px"
              height="48px"
              no-spinner
            />
          </q-card>
        </div>
        <div class="col-6">
          <q-card class="me-highlight-card me-card-service" flat>
            <div class="me-card-text">
              <div class="me-card-title">
                {{ i18n('labels.serviceCenter') }}
              </div>
              <div class="me-card-caption">
                {{ i18n('labels.serviceCenterDescription') }}
              </div>
            </div>
            <q-img
              class="me-card-icon"
              :src="imgServiceCenter"
              width="48px"
              height="48px"
              no-spinner
            />
          </q-card>
        </div>
      </div>

      <div class="me-card">
        <q-list separator>
          <q-item
            v-for="(menu, index) in menuList"
            :key="index"
            class="me-menu-item"
            clickable
            :to="menu.to"
          >
            <q-item-section avatar>
              <q-img
                v-if="menu.iconSrc"
                :src="menu.iconSrc"
                width="24px"
                height="24px"
                no-spinner
              />
              <q-icon v-else-if="menu.icon" :name="menu.icon" size="24px" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="me-menu-label">
                {{ menu.label }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon color="grey-6" name="chevron_right" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.me-page {
  // Design artboard fill is solid white; two radial glow layers sit above it
  // as absolutely-positioned children (mobile viewport).
  position: relative;
  background: var(--clr-me-page-bg, rgba(255, 255, 255, 1));
  overflow: hidden;
}

.me-container {
  // Mobile-only product — content fills the phone viewport width. Padding
  // comes from q-pa-lg on the container itself.
  width: 100%;
  // Keep foreground content above the glow layers.
  position: relative;
  z-index: 1;
}

.me-topbar {
  min-height: 32px;
}

.me-notify-btn {
  // Tight padding so the 24×24 PNG sits like a status-bar icon.
  padding: 4px;
  min-height: 32px;
  min-width: 32px;
}

.me-highlight-card {
  position: relative;
  height: var(--me-highlight-card-h);
  padding: 12px;
  border-radius: var(--card-radius);
  overflow: hidden;
}

.me-card-member {
  // Vertical gradient from raw JSON 矩形 1897 (stop 0 top, stop 1 bottom).
  background: linear-gradient(
    to bottom,
    var(--clr-me-card-member-bg-top) 0%,
    var(--clr-me-card-member-bg-bottom) 100%
  );
}

.me-card-service {
  // Vertical gradient from raw JSON 矩形 1898 (stop 0 at 1.57%, stop 1 at 100%).
  background: linear-gradient(
    to bottom,
    var(--clr-me-card-service-bg-top) 1.57%,
    var(--clr-me-card-service-bg-bottom) 100%
  );
}

.me-card-text {
  // Title + caption stacked at the top-left corner.
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: calc(100% - var(--me-highlight-icon-size) - 4px);
}

.me-card-icon {
  // Icon anchored to the bottom-right of the card (overlaps caption slightly).
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: var(--me-highlight-icon-size);
  height: var(--me-highlight-icon-size);
}

.me-menu-label {
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  font-weight: 400;
  line-height: var(--line-height-body);
  color: var(--clr-text);
}

.me-menu-item {
  min-height: var(--menu-row-height);
}
</style>
