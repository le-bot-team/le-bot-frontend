<script setup lang="ts">
// MessageDetailPage — message detail view.

import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.messages.MessageDetailPage');
const route = useRoute();

const messageId = computed(() => route.params.id as string);

// Mock message detail — replace with API
const message = computed(() => {
  const details: Record<string, { title: string; content: string; date: string; icon: string }> = {
    '1': {
      title: '新的通知',
      content: '您有一条新的通知，请前往查看。这条通知是关于您设备更新的提醒，请及时查看。',
      date: '2025-5-12',
      icon: 'mdi-bell',
    },
    '2': {
      title: '情绪不佳',
      content: '监测到长期情绪不佳，建议与乐宝进行更多互动以改善心情。',
      date: '2025-5-12',
      icon: 'mdi-emoticon-sad',
    },
    '3': {
      title: '通知标题',
      content: '这里是通知的内容说明，详细描述了通知的具体事项。',
      date: '2025-5-12',
      icon: 'mdi-information',
    },
    '4': {
      title: '新用户会员已发放',
      content: '可在会员中心查看哦！欢迎加入乐宝大家庭。',
      date: '2025-5-12',
      icon: 'mdi-gift',
    },
  };
  return (
    details[messageId.value] ?? {
      title: '消息详情',
      content: '暂无内容',
      date: '',
      icon: 'mdi-email',
    }
  );
});
</script>

<template>
  <q-page class="settings-sub-page">
    <div class="settings-sub-page__card q-pa-md">
      <!-- Message header -->
      <div class="row items-center q-gutter-x-md q-mb-md">
        <q-icon :name="message.icon" size="36px" style="color: var(--clr-link)" />
        <div>
          <div
            style="
              font-family: var(--font-family);
              font-size: 17px;
              font-weight: 500;
              color: var(--clr-text);
            "
          >
            {{ message.title || i18n('labels.title') }}
          </div>
          <div style="font-family: var(--font-family); font-size: 12px; color: var(--clr-caption)">
            {{ message.date }}
          </div>
        </div>
      </div>

      <!-- Message body -->
      <div
        style="
          font-family: var(--font-family);
          font-size: 14px;
          line-height: 22px;
          color: var(--clr-weak);
          white-space: pre-line;
        "
      >
        {{ message.content }}
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
