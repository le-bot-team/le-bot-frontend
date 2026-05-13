<script setup lang="ts">
/**
 * FamilyGroupInvitePage — 邀请成员页
 *
 * 展示邀请二维码，支持分享功能。
 * 二维码数据从 FamilyGroupStore.currentGroup.inviteCode 读取。
 * 后续接入后端生成的 QR 图片或前端本地生成。
 */

import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useQuasar } from 'quasar';

import { i18nSubPath } from 'src/utils/common';
import { useFamilyGroupStore } from 'stores/family-group';
import { generateInviteCode } from 'src/utils/api/family-group';
import { useAuthStore } from 'stores/auth';

const i18n = i18nSubPath('pages.stack.family-group.InvitePage');
const $q = useQuasar();
const route = useRoute();
const familyGroupStore = useFamilyGroupStore();
const authStore = useAuthStore();

// 同步当前 groupId
const groupId = computed(() => route.query.groupId as string | undefined);
if (groupId.value) familyGroupStore.setCurrentGroup(groupId.value);

const currentGroup = familyGroupStore.currentGroup;
const inviteCode = computed(() => currentGroup?.inviteCode);

/** 是否正在加载/刷新 */
const isGenerating = ref(false);

/** 倒计时剩余秒数 */
const countdownSeconds = ref(0);
let countdownTimer: ReturnType<typeof setInterval> | null = null;

/**
 * 生成/刷新邀请码
 */
async function generateOrRefresh() {
  if (!currentGroup || isGenerating.value) return;

  const token = authStore.accessToken;
  if (!token) {
    $q.notify({ message: i18n('errors.notLoggedIn'), type: 'negative' });
    return;
  }

  isGenerating.value = true;

  try {
    const res = await generateInviteCode(currentGroup.id, token);
    if (res.data?.success && res.data.data?.inviteCode) {
      familyGroupStore.setInviteCode(res.data.data.inviteCode);
      startCountdown(res.data.data.inviteCode.expiresAt);
    } else {
      $q.notify({
        message: res.data && !res.data.success ? res.data.message : i18n('errors.generateFailed'),
        type: 'negative',
      });
    }
  } catch (err) {
    console.error('Failed to generate invite code:', err);
    $q.notify({ message: i18n('errors.generateFailed'), type: 'negative' });
  } finally {
    isGenerating.value = false;
  }
}

/** 启动倒计时 */
function startCountdown(expiresAt: string) {
  if (countdownTimer) clearInterval(countdownTimer);

  function tick() {
    const remaining = new Date(expiresAt).getTime() - Date.now();
    countdownSeconds.value = Math.max(0, Math.ceil(remaining / 1000));
    if (countdownSeconds.value <= 0 && countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  tick();
  countdownTimer = setInterval(tick, 1000);
}

function onShare() {
  // TODO: 接入系统分享能力 (Web Share API / 微信 SDK)
  // 当前先提示
  $q.notify({ message: i18n('notifications.shareTodo'), type: 'info' });

  // 分享逻辑示例:
  // const shareData = {
  //   title: `${currentGroup?.childName}的家庭组`,
  //   text: `邀请你加入 ${currentGroup?.name}`,
  //   url: inviteCode.value?.qrImageUrl,
  // };
  // if (navigator.share) navigator.share(shareData);
}

onMounted(() => {
  // 如果已有有效邀请码则启动倒计时；否则自动生成
  if (familyGroupStore.isInviteCodeValid && inviteCode.value) {
    startCountdown(inviteCode.value.expiresAt);
  } else {
    void generateOrRefresh();
  }
});
</script>

<template>
  <q-page class="family-group-page family-group-page--invite">
    <!-- 标题 -->
    <p class="family-invite-title">
      {{ i18n('labels.scanToJoin', { childName: familyGroupStore.currentGroup?.childName ?? '' }) }}
    </p>

    <!-- 二维码展示区 -->
    <div class="family-invite-qr-frame">
      <!-- 有真实 QR 图时展示图片 -->
      <img
        v-if="inviteCode?.qrImageUrl"
        :src="inviteCode.qrImageUrl"
        alt="QR Code"
        class="family-invite-qr-image"
      />
      <!-- 无 QR 时展示占位 -->
      <div v-else class="family-invite-qr-placeholder" aria-label="qr-code">
        <q-icon v-if="isGenerating" name="mdi-loading" size="64px" color="primary" class="q-ma-sm q-animated-spin" />
        <q-icon v-else name="mdi-qrcode" size="160px" color="#C4C4CC" />
      </div>
    </div>

    <!-- 有效期倒计时 / 刷新 -->
    <div class="family-invite-expiry">
      <span v-if="countdownSeconds > 0">
        {{ i18n('labels.expiry', { time: formatDuration(countdownSeconds) }) }}
      </span>
      <button
        type="button"
        class="family-invite-refresh-btn"
        :disabled="isGenerating"
        @click="generateOrRefresh"
      >
        <q-icon name="refresh" size="16px" />
      </button>
    </div>

    <!-- 分享提示 -->
    <p class="family-invite-share-tip">{{ i18n('labels.shareTip') }}</p>

    <!-- 分享按钮 -->
    <button
      class="family-group-add-btn"
      type="button"
      @click="onShare"
      :disabled="!inviteCode"
    >
      {{ i18n('labels.share') }}
    </button>
  </q-page>
</template>

<style scoped lang="scss">
.family-group-page--invite {
  align-items: center;
  padding-top: 0;
}

.family-invite-title {
  margin-top: 48px;
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 500;
  color: var(--clr-text-primary);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 311px;
}

.family-invite-expiry {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 13px;
  color: var(--clr-caption);
}

.family-invite-refresh-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.04);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.family-invite-qr-image {
  width: 200px;
  height: 200px;
  object-fit: contain;
}
</style>

<script lang="ts">
/** 格式化剩余秒数为可读字符串 */
function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00:00';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}
</script>
