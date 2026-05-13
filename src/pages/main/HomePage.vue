<script setup lang="ts">
// HomePage — design ca93697e (首页-切换设备, 375×812 artboard).
//
// Viewport strategy (user decision 2026-05 revised): the 375×812 canvas is
// fixed size and centered horizontally via `margin: 0 auto`. Any viewport
// wider than 375px shows the page-background gradient on both sides;
// narrower viewports scroll horizontally (acceptable edge case for iPhone SE
// and legacy devices). Supersedes the earlier B3 proportional-scale strategy
// which caused desktop spacer bloat.
//
// Mascot strategy: the 3D 乐宝机器人形象 uses icon-robot-set-home.png.
//
// Tab-icon strategy (user decision D6-a): the bottom tab icons are Sketch
// symbolInstence without extractable path/imageRef; mdi icons are retained.

import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount } from 'vue';

import { router } from 'src/router';
import { i18nSubPath } from 'src/utils/common';
import { useAuthStore } from 'stores/auth';
import { useDeviceStore } from 'stores/device';
import DeviceSwitchPanel from 'components/home/DeviceSwitchPanel.vue';

// Mascot placeholder: 设计稿中"乐宝正面"为shape占位符，暂无透明背景PNG切图。
// 待设计师提供后替换 iconMascotUrl 为真实图片路径。
const iconMascotUrl = ''; // 占位：无可用透明背景mascot图片

import iconMsgHomeUrl from 'src/assets/lanhu/home/icon-msg-home.png';
import iconDeviceChangeUrl from 'src/assets/lanhu/home/icon-device-change.png';
import iconRobotSetUrl from 'src/assets/lanhu/home/icon-device-change-home.png';
import iconTopicUrl from 'src/assets/lanhu/home/icon-topic.png';
import iconArrowRightUrl from 'src/assets/lanhu/home/icon-arrow-right-home.png';

const i18n = i18nSubPath('pages.main.HomePage');
const { accessToken } = storeToRefs(useAuthStore());
const deviceStore = useDeviceStore();
const { currentDevice } = storeToRefs(deviceStore);

/** 当前设备名称（如"小新的乐宝"） */
const currentDeviceName = computed(() => {
  const childName = currentDevice.value?.childInfo?.name;
  return childName ? `${childName}的乐宝` : i18n('labels.robotName');
});

// 未读消息状态（mock数据，后续接入后端替换为真实数据）
const unreadMessages = ref([
  { id: '1', unread: true },
  { id: '2', unread: true },
]);
const hasUnreadMessages = computed(() => unreadMessages.value.some(m => m.unread));

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
    router.push('/stack/auth?from=/main/home').catch((err) => console.error(err));
  }
});

function goChat() {
  router.push('/stack/chat').catch((err) => console.error(err));
}

function goChatHistory() {
  // Chat history route not implemented yet; fall back to ChatPage for now.
  router.push('/stack/chat').catch((err) => console.error(err));
}

function pickTopic(topic: string) {
  router.push({ path: '/stack/chat', query: { topic } }).catch((err) => console.error(err));
}

function goMessages() {
  router.push('/stack/messages').catch((err) => console.error(err));
}

function goDeviceSwitch() {
  showDeviceSwitch.value = true;
}

function goRobotSettings() {
  router.push('/stack/device-config').catch((err) => console.error(err));
}

function handleAddDevice() {
  router.push('/stack/add-virtual-device').catch((err) => console.error(err));
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

      <!-- Top navigation (robot name + companion days + icons) -->
      <div class="home-topnav">
        <!-- 左上：标题 + 设备切换 -->
        <div class="home-title-row">
          <div class="home-robot-name">{{ currentDeviceName }}</div>
          <div
            class="home-device-change"
            role="button"
            :aria-label="i18n('labels.deviceChange')"
            @click="goDeviceSwitch"
          >
            <img :src="iconDeviceChangeUrl" alt="device" class="home-icon-img" />
          </div>
        </div>

        <!-- 右上：设置图标 -->
        <div
          class="home-icon-robot-set"
          role="button"
          :aria-label="i18n('labels.robotSettings')"
          @click="goRobotSettings"
        >
          <img :src="iconRobotSetUrl" alt="robot-set" class="home-icon-img" />
        </div>

        <!-- 右上：消息图标（最右侧） -->
        <div
          class="home-icon-msg"
          role="button"
          :aria-label="i18n('labels.messages')"
          @click="goMessages"
        >
          <img :src="iconMsgHomeUrl" alt="msg" class="home-icon-img" />
          <!-- 未读红点：有未读消息时显示 -->
          <span v-if="hasUnreadMessages" class="home-icon-msg-dot" aria-hidden="true" />
        </div>

        <!-- 陪伴天数 - 导航栏下方 -->
        <div class="home-companion-days">
          {{ i18n('labels.companionDays', { days: companionDays }) }}
        </div>
      </div>

      <!-- Mascot (3D 乐宝机器人形象) — 占位：待设计师提供透明背景PNG -->
      <div
        class="home-hero-mascot"
        role="button"
        :aria-label="i18n('labels.mascotPlaceholder')"
        @click="goChat"
      >
        <div v-if="!iconMascotUrl" class="home-mascot-placeholder">
          <span class="home-mascot-placeholder-text">乐宝</span>
        </div>
        <img v-else :src="iconMascotUrl" alt="乐宝" class="home-mascot-img" />
      </div>
      <!-- 设计稿气泡文案 -->
      <div class="home-hero-bubble">
        <p class="home-bubble-line1">{{ i18n('labels.bubbleLine1') }}</p>
        <p class="home-bubble-line2">{{ i18n('labels.bubbleLine2') }}</p>
      </div>

      <!-- 高频话题 -->
      <section class="home-topics">
        <header class="home-topics-head">
          <div class="home-topics-title">{{ i18n('labels.hotTopicsTitle') }}</div>
          <div class="home-topics-history" role="button" @click="goChatHistory">
            <span>{{ i18n('labels.chatHistory') }}</span>
            <span class="home-topics-history-icon">
              <img :src="iconArrowRightUrl" alt="next" class="home-icon-img" />
            </span>
          </div>
        </header>
        <div class="home-topics-chips">
          <div
            v-for="topic in topics"
            :key="topic"
            class="home-topic-chip"
            role="button"
            @click="pickTopic(topic)"
          >
            <span class="home-topic-chip-icon">
              <img :src="iconTopicUrl" alt="" class="home-icon-img" />
            </span>
            {{ topic }}
          </div>
          <!-- More indicator matching design ... -->
          <span class="home-topics-more" role="button" @click="goChatHistory">...</span>
        </div>
      </section>
    </div>

    <!-- 设备切换弹窗 -->
    <DeviceSwitchPanel
      v-model:show="showDeviceSwitch"
      @add-device="handleAddDevice"
    />
  </q-page>
</template>

<style lang="scss" scoped></style>
