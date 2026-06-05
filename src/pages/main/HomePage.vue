<script setup lang="ts">
// HomePage — design ca93697e (首页-切换设备, 375×812 artboard).
//
// Viewport strategy (user decision 2026-05 revised): the 375×812 canvas is
// fixed size and centered horizontally via `margin: 0 auto`. Any viewport
// wider than 375px shows the page-background gradient on both sides;
// narrower viewports are clipped horizontally (acceptable edge case for
// iPhone SE and legacy devices). Supersedes the earlier B3 proportional-scale
// strategy which caused desktop spacer bloat.
//
// Mascot strategy: the 3D 乐宝机器人形象 uses icon-robot-set-home.png.
//
// Tab-icon strategy (user decision D6-a): the bottom tab icons are Sketch
// symbolInstence without extractable path/imageRef; mdi icons are retained.

import { ref, computed, onBeforeMount } from 'vue';
import { storeToRefs } from 'pinia';

import { router } from 'src/router';
import { i18nSubPath } from 'src/utils/common';
import { useAuthStore } from 'stores/auth';
import { useDeviceStore } from 'stores/device';
import { useMessagesStore } from 'stores/messages';
import { useTracker } from 'src/composables/useTracker';
import DeviceSwitchPanel from 'components/home/DeviceSwitchPanel.vue';

import iconMsgHomeUrl from 'src/assets/lanhu/home/icon-msg-home.png';
import iconDeviceChangeUrl from 'src/assets/lanhu/home/icon-device-change.png';
import iconRobotSetUrl from 'src/assets/lanhu/home/icon-robot-set-home.png';
import iconTopicUrl from 'src/assets/lanhu/home/icon-topic.png';
import iconArrowRightUrl from 'src/assets/lanhu/home/icon-arrow-right-home.png';
import imgLebotHomeUrl from 'src/assets/lanhu/home/img-lebot-home.png';
import imgChatBubbleHomeUrl from 'src/assets/lanhu/home/img-chat-bubble-home.png';

const iconMascotUrl = imgLebotHomeUrl;

const i18n = i18nSubPath('pages.main.HomePage');
const { accessToken } = storeToRefs(useAuthStore());
const deviceStore = useDeviceStore();
const { currentDevice, virtualDevices } = storeToRefs(deviceStore);
const { trackClick, trackConversion } = useTracker();

/** Whether the user has at least one device — controls empty-state vs normal view */
const hasDevices = computed(() => virtualDevices.value.length > 0);

/** 当前儿童姓名（用于欢迎气泡等个性化展示），无儿童信息时回退为默认称呼 */
const childName = computed(() => {
  return currentDevice.value?.childInfo?.name || i18n('labels.defaultChildName');
});

/** 当前设备名称（如"小新的乐宝"） */
const currentDeviceName = computed(() => {
  const name = currentDevice.value?.childInfo?.name;
  return name ? i18n('deviceSwitch.deviceNameFormat', { name }) : i18n('labels.robotName');
});

const messagesStore = useMessagesStore();
const { unreadCount } = storeToRefs(messagesStore);
const hasUnreadMessages = computed(() => unreadCount.value > 0);

// 设备切换弹窗
const showDeviceSwitch = ref(false);

// Companion days — mock (D3 default). Replace with a computed diff from the
// user's profile bind date when the backend exposes it.
const companionDays = computed<number>(() => 263);

// Topic chips — static mock (D4 default); backend-driven later.
// Design order: Row1=画画/猫咪/过家家酒, Row2=奥特曼/妈妈/托托 + ...
const topics = computed<string[]>(() => [
  i18n('topics.draw'),
  i18n('topics.kitty'),
  i18n('topics.housePlay'),
  i18n('topics.ultraman'),
  i18n('topics.mom'),
  i18n('topics.toto'),
]);

onBeforeMount(() => {
  if (!accessToken.value?.length) {
    void router.push('/stack/auth?from=/main/home');
  } else {
    // Fetch messages to keep unread badge in sync
    void messagesStore.fetchMessages();
  }
});

function goChat() {
  trackConversion('first_chat');
  void router.push('/stack/chat');
}

function goChatHistory() {
  trackClick('btn_click_chat_history');
  void router.push('/stack/chat/history');
}

function pickTopic(topic: string) {
  trackClick('btn_click_topic_chip', { routeQuery: topic });
  void router.push({ path: '/stack/chat', query: { topic } });
}

function goMessages() {
  trackClick('btn_click_messages');
  void router.push('/stack/messages');
}

function goDeviceSwitch() {
  trackClick('btn_click_device_switch');
  showDeviceSwitch.value = true;
}

function goRobotSettings() {
  trackClick('btn_click_robot_settings');
  void router.push('/stack/device-config');
}

function handleAddDevice() {
  trackConversion('device_activated');
  void router.push('/stack/add-virtual-device');
}
</script>

<template>
  <q-page class="home-page">
    <div class="home-canvas">
      <!-- Hero decorations (layered under everything else) -->
      <div class="home-hero" aria-hidden="true">
        <div class="home-hero-glow-warm" />
        <div class="home-hero-glow-amber" />
      </div>

      <!-- ============ 有设备: 正常首页 ============ -->
      <template v-if="hasDevices">
        <!-- Top navigation (robot name + companion days + icons) -->
        <div class="home-topnav">
          <!-- 左上：标题 + 设备切换 -->
          <div class="home-title-row">
            <div class="home-robot-name">{{ currentDeviceName }}</div>
            <button
              type="button"
              class="home-device-change"
              :aria-label="i18n('labels.deviceChange')"
              @click="goDeviceSwitch"
            >
              <img :src="iconDeviceChangeUrl" alt="" class="home-icon-img" />
            </button>
          </div>

          <!-- 右上：设置图标 -->
          <button
            type="button"
            class="home-icon-robot-set"
            :aria-label="i18n('labels.robotSettings')"
            @click="goRobotSettings"
          >
            <img :src="iconRobotSetUrl" alt="" class="home-icon-img" />
          </button>

          <!-- 右上：消息图标（最右侧） -->
          <button
            type="button"
            class="home-icon-msg"
            :aria-label="i18n('labels.messages')"
            @click="goMessages"
          >
            <img :src="iconMsgHomeUrl" alt="" class="home-icon-img" />
            <!-- 未读红点：有未读消息时显示 -->
            <span v-if="hasUnreadMessages" class="home-icon-msg-dot" aria-hidden="true" />
          </button>

          <!-- 陪伴天数 - 导航栏下方 -->
          <div class="home-companion-days">
            {{ i18n('labels.companionDays', { days: companionDays }) }}
          </div>
        </div>

        <!-- Mascot (3D 乐宝机器人形象) — 占位：待设计师提供透明背景PNG -->
        <button
          type="button"
          class="home-hero-mascot"
          :aria-label="i18n('labels.mascotPlaceholder')"
          @click="goChat"
        >
          <div v-if="!iconMascotUrl" class="home-mascot-placeholder">
            <span class="home-mascot-placeholder-text">乐宝</span>
          </div>
          <img v-else :src="iconMascotUrl" alt="" class="home-mascot-img" />
        </button>
        <!-- 设计稿气泡：使用 img_chat_bubble_home.png 图片 + 文字叠加 -->
        <div class="home-hero-bubble">
          <img :src="imgChatBubbleHomeUrl" alt="" class="home-bubble-bg" />
          <div class="home-bubble-text">
            <p class="home-bubble-line1">{{ i18n('labels.bubbleLine1', { name: childName }) }}</p>
            <p class="home-bubble-line2">{{ i18n('labels.bubbleLine2') }}</p>
          </div>
        </div>

        <!-- 高频话题 -->
        <section class="home-topics">
          <header class="home-topics-head">
            <div class="home-topics-title">{{ i18n('labels.hotTopicsTitle') }}</div>
            <button type="button" class="home-topics-history" @click="goChatHistory">
              <span>{{ i18n('labels.chatHistory') }}</span>
              <span class="home-topics-history-icon">
                <img :src="iconArrowRightUrl" alt="" class="home-icon-img" />
              </span>
            </button>
          </header>
          <div class="home-topics-chips">
            <button
              v-for="topic in topics"
              :key="topic"
              type="button"
              class="home-topic-chip"
              @click="pickTopic(topic)"
            >
              <span class="home-topic-chip-icon">
                <img :src="iconTopicUrl" alt="" class="home-icon-img" />
              </span>
              {{ topic }}
            </button>
            <!-- More indicator matching design ... -->
            <button
              type="button"
              class="home-topics-more"
              @click="goChatHistory"
              :aria-label="i18n('labels.chatHistory')"
            >
              ...
            </button>
          </div>
        </section>
      </template>

      <!-- ============ 无设备: 空状态引导 ============ -->
      <template v-else>
        <div class="home-empty">
          <img :src="iconMascotUrl" alt="" class="home-empty-mascot" />
          <div class="home-empty-title">{{ i18n('labels.noDeviceTitle') }}</div>
          <div class="home-empty-subtitle">{{ i18n('labels.noDeviceSubtitle') }}</div>
          <button type="button" class="home-empty-btn" @click="handleAddDevice">
            {{ i18n('labels.addDevice') }}
          </button>
        </div>
      </template>
    </div>

    <!-- 设备切换弹窗 -->
    <DeviceSwitchPanel v-model:show="showDeviceSwitch" @add-device="handleAddDevice" />
  </q-page>
</template>

<style lang="scss" scoped></style>
