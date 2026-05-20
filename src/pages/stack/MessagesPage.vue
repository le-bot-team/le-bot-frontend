<script setup lang="ts">
// MessagesPage — 消息列表页 (design 5f6208e5 默认态 / a75fd4bb 编辑态)
//
// 交互流程:
//   1. 默认态(5f6208e5): 导航栏右侧显示 [删除图标 icon_delete_nav 24×24]
//   2. 点击删除图标 → 进入编辑态(a75fd4bb): 右侧变"完成"文字, 每条消息右侧出现 ⊖ 删除按钮
//   3. 点击某条的 ⊖ → 弹出确认对话框 → 确认后删除该条
//   4. 点击"完成" → 退出编辑态回到默认
//
// Layout: neutral page bg + 335×72 白色圆角卡片(间距12px)
// Styles live in app.scss (`.messages-*`)

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

import { i18nSubPath } from 'src/utils/common';
import ConfirmDialog from 'src/components/ConfirmDialog.vue';
import iconDeleteNav from 'src/assets/lanhu/slices/icon-delete-nav.png';
import iconNotification from 'src/assets/lanhu/messages/icon-2.webp';
import iconMood from 'src/assets/lanhu/messages/icon-3.webp';
import iconMember from 'src/assets/lanhu/messages/icon-4.webp';

const i18n = i18nSubPath('pages.stack.MessagesPage');
const router = useRouter();
const $q = useQuasar();

// Nav bar delete icon — design 5f6208e5: icon_delete_nav (24×24px) in msg_icon_set container
// Message type icons — design 5f6208e5 切图 (src/assets/lanhu/messages/)
// 共3种消息图标:
//   icon-2.webp → 绿色铃铛 — 通知/新消息类
//   icon-3.webp → 蓝色悲伤  — 情绪类
//   icon-4.webp → 黄色星星  — 用户/会员类

type MessageType = 'notification' | 'mood' | 'member';

interface MessageItem {
  id: string;
  type: MessageType;
  iconSrc: string;
  title: string;
  content: string;
  date: string;
  unread?: boolean;
}

/** Edit mode: false=默认态(显示删除图标), true=编辑态(显示完成+每条删除按钮) */
const isEditing = ref(false);

// Mock data (D-mock). Replace with backend API when ready.
// Content strings sampled from raw design JSON.
const messages = ref<MessageItem[]>([
  // 1. 通知/新消息类 (绿色铃铛 iconNotification)
  {
    id: '1',
    type: 'notification',
    iconSrc: iconNotification,
    title: i18n('items.m1Title'),
    content: i18n('items.m1Content'),
    date: '2025-5-12',
    unread: true,
  },
  // 2. 情绪类 (蓝色悲伤 iconMood)
  {
    id: '2',
    type: 'mood',
    iconSrc: iconMood,
    title: i18n('items.m2Title'),
    content: i18n('items.m2Content'),
    date: '2025-5-12',
    unread: true,
  },
  // 3. 通知类 (绿色铃铛 iconNotification)
  {
    id: '3',
    type: 'notification',
    iconSrc: iconNotification,
    title: i18n('items.m3Title'),
    content: i18n('items.m3Content'),
    date: '2025-5-12',
  },
  // 4. 用户会员类 (黄色星星 iconMember)
  {
    id: '4',
    type: 'member',
    iconSrc: iconMember,
    title: i18n('items.m4Title'),
    content: i18n('items.m4Content'),
    date: '2025-5-12',
  },
]);

/** Exit edit mode — triggered by tapping "Done" */
function exitEditMode() {
  isEditing.value = false;
}

/** Enter edit mode — triggered by tapping the nav delete icon */
function enterEditMode() {
  isEditing.value = true;
}

function onItemClick(item: MessageItem) {
  // In edit mode, row click is disabled — only delete buttons work.
  if (isEditing.value) return;

  switch (item.type) {
    case 'member':
      router.push('/stack/messages/activity').catch(console.error);
      break;
    case 'notification':
    case 'mood':
    default:
      router.push(`/stack/messages/${item.id}`).catch(console.error);
      break;
  }
}

function onDeleteClick(item: MessageItem) {
  $q.dialog({
    component: ConfirmDialog,
    componentProps: {
      title: i18n('labels.deleteConfirm'),
      confirmLabel: i18n('labels.confirm'),
      cancelLabel: i18n('labels.cancel'),
      confirmType: 'danger',
    },
  }).onOk(() => {
    const idx = messages.value.findIndex((m) => m.id === item.id);
    if (idx !== -1) {
      messages.value.splice(idx, 1);
    }
    // Auto-exit edit mode when no messages left
    if (messages.value.length === 0) {
      isEditing.value = false;
    }
  });
}
</script>

<template>
  <q-page class="messages-page">
    <!-- ===== Edit action bar ===== -->
    <div class="messages-nav">
      <!-- Default state (5f6208e5): show delete icon -->
      <button
        v-if="!isEditing"
        type="button"
        class="messages-nav__action messages-nav__delete-icon"
        :aria-label="i18n('labels.delete') ?? 'Delete'"
        @click="enterEditMode"
      >
        <img :src="iconDeleteNav" alt="" class="messages-nav__delete-img" />
      </button>

      <!-- Editing state (a75fd4bb): show "完成" text button -->
      <button
        v-else
        type="button"
        class="messages-nav__action messages-nav__done"
        @click="exitEditMode"
      >
        {{ i18n('labels.done') }}
      </button>
    </div>

    <!-- Message list (容器2646, w=335) -->
    <div v-if="messages.length" class="messages-card">
      <div
        v-for="item in messages"
        :key="item.id"
        class="messages-row"
        :role="isEditing ? undefined : 'button'"
        :tabindex="isEditing ? undefined : 0"
        @click="onItemClick(item)"
        @keydown.enter="onItemClick(item)"
        @keydown.space.prevent="onItemClick(item)"
      >
        <img :src="item.iconSrc" alt="" class="messages-row__icon" />
        <div class="messages-row__main">
          <div class="messages-row__title">{{ item.title }}</div>
          <div class="messages-row__content">{{ item.content }}</div>
        </div>
        <div class="messages-row__aside">
          <div class="messages-row__date">{{ item.date }}</div>
          <!-- Unread dot (hidden in edit mode) -->
          <span v-if="item.unread && !isEditing" class="messages-row__dot" aria-hidden="true" />
          <!-- Delete button per row (a75fd4bb 组394: 20×20 circle + minus icon) -->
          <button
            v-if="isEditing"
            type="button"
            class="messages-row__delete"
            :aria-label="i18n('labels.delete') ?? 'Delete'"
            @click.stop="onDeleteClick(item)"
          >
            <svg width="12" height="2" viewBox="0 0 12 2" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="12" height="2" rx="1" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="messages-empty">
      {{ i18n('labels.empty') }}
    </div>
  </q-page>
</template>

<style scoped></style>
