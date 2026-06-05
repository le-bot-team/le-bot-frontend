<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

import { i18nSubPath } from 'src/utils/common';
import { useMessagesStore } from 'stores/messages';

import iconDeleteNav from 'src/assets/messages-slices/icon_delete_nav.png';
import btnDeleteMsg from 'src/assets/messages-delete-slices/btn_delete_msg.png';
import imgGoodNewsMsg from 'src/assets/messages-slices/img_good_news_msg.png';
import imgBadMoodMsg from 'src/assets/messages-slices/img_bad_mood_msg.png';
import imgNormalInforMsg from 'src/assets/messages-slices/img_normal_infor_msg.png';

import type { MessageItem, MessageType } from 'src/types/api/message';

const i18n = i18nSubPath('pages.stack.MessagesPage');
const router = useRouter();
const $q = useQuasar();
const store = useMessagesStore();

const isEditing = ref(false);

/** Map message type to its default icon asset */
function iconForType(type: MessageType): string {
  switch (type) {
    case 'notification':
      return imgNormalInforMsg;
    case 'emotion':
      return imgBadMoodMsg;
    case 'activity':
      return imgGoodNewsMsg;
  }
}

/** Format ISO date string to short display (e.g. "06/05") */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

/** Toggle editing mode */
function toggleEditing() {
  isEditing.value = !isEditing.value;
}

/** Handle row click based on message type and editing state */
function onRowClick(msg: MessageItem) {
  if (isEditing.value) return;
  // Mark as read on click
  void store.markAsRead(msg.id);

  switch (msg.type) {
    case 'notification':
      void router.push(`/stack/messages/${msg.id}`);
      break;
    case 'activity':
      void router.push('/stack/messages/activity');
      break;
    case 'emotion':
      void router.push('/stack/growth-data');
      break;
  }
}

/** Delete a message with confirmation dialog */
function onDeleteMessage(msg: MessageItem) {
  $q.dialog({
    title: i18n('labels.deleteConfirmTitle'),
    message: i18n('labels.deleteConfirm'),
    cancel: { label: i18n('labels.cancel') },
    ok: { label: i18n('labels.confirm'), color: 'negative' },
    persistent: true,
  }).onOk(() => {
    void store.deleteMessage(msg.id);
  });
}

onMounted(() => {
  void store.fetchMessages();
});
</script>

<template>
  <q-page class="messages-page">
    <!-- Custom nav bar: title + delete/done action -->
    <div class="messages-nav">
      <span class="messages-nav__title">{{ i18n('labels.title') }}</span>
      <button v-if="!isEditing" type="button" class="messages-nav__action" @click="toggleEditing">
        <span class="messages-nav__delete-icon">
          <img :src="iconDeleteNav" class="messages-nav__delete-img" alt="delete" />
        </span>
      </button>
      <button
        v-else
        type="button"
        class="messages-nav__action messages-nav__done"
        @click="toggleEditing"
      >
        {{ i18n('labels.done') }}
      </button>
    </div>

    <!-- Message list -->
    <div v-if="store.messages.length" class="messages-card">
      <div
        v-for="msg in store.messages"
        :key="msg.id"
        class="messages-row"
        :class="{ 'messages-row--editing': isEditing }"
        @click="onRowClick(msg)"
      >
        <!-- Delete button (editing mode) -->
        <button
          v-if="isEditing"
          type="button"
          class="messages-row__delete"
          @click.stop="onDeleteMessage(msg)"
        >
          <img :src="btnDeleteMsg" width="20" height="20" alt="remove" />
        </button>

        <!-- Icon -->
        <img class="messages-row__icon" :src="msg.iconUrl || iconForType(msg.type)" alt="" />

        <!-- Main content -->
        <div class="messages-row__main">
          <span class="messages-row__title">{{ msg.title }}</span>
          <span class="messages-row__content">{{ msg.content }}</span>
        </div>

        <!-- Aside: date + unread dot -->
        <div class="messages-row__aside">
          <span class="messages-row__date">{{ formatDate(msg.createdAt) }}</span>
          <span v-if="!msg.isRead" class="messages-row__dot" />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="messages-empty">
      {{ i18n('labels.empty') }}
    </div>
  </q-page>
</template>

<style scoped></style>
