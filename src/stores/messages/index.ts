import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useAuthStore } from 'stores/auth';
import type { ActivityDetail, MessageItem } from 'src/types/api/message';
import {
  deleteMessage as apiDeleteMessage,
  fetchActivities as apiFetchActivities,
  fetchActivityDetail as apiFetchActivityDetail,
  fetchMessageDetail as apiFetchMessageDetail,
  fetchMessages as apiFetchMessages,
  markMessageRead as apiMarkMessageRead,
} from 'src/utils/api/message';

export const useMessagesStore = defineStore('messages', () => {
  const messages = ref<MessageItem[]>([]);
  const activities = ref<ActivityDetail[]>([]);
  const loading = ref(false);

  /** Number of unread messages */
  const unreadCount = computed(() => messages.value.filter((m) => !m.isRead).length);

  /** Fetch messages list (optionally filtered by type) */
  const fetchMessages = async (type?: string) => {
    const auth = useAuthStore();
    if (!auth.accessToken) return;
    loading.value = true;
    try {
      const { data } = await apiFetchMessages(auth.accessToken, type);
      if (data.success) {
        messages.value = data.data.messages;
      }
    } catch (e) {
      console.error('[MessagesStore] fetchMessages failed', e);
    } finally {
      loading.value = false;
    }
  };

  /** Fetch a single message detail */
  const fetchMessageDetail = async (id: string): Promise<MessageItem | null> => {
    const auth = useAuthStore();
    if (!auth.accessToken) return null;
    try {
      const { data } = await apiFetchMessageDetail(auth.accessToken, id);
      if (data.success) {
        // Update local cache
        const idx = messages.value.findIndex((m) => m.id === id);
        if (idx !== -1) messages.value[idx] = data.data.message;
        return data.data.message;
      }
    } catch (e) {
      console.error('[MessagesStore] fetchMessageDetail failed', e);
    }
    return null;
  };

  /** Delete a message by ID */
  const deleteMessage = async (id: string): Promise<boolean> => {
    const auth = useAuthStore();
    if (!auth.accessToken) return false;
    try {
      const { data } = await apiDeleteMessage(auth.accessToken, id);
      if (data.success) {
        messages.value = messages.value.filter((m) => m.id !== id);
        return true;
      }
    } catch (e) {
      console.error('[MessagesStore] deleteMessage failed', e);
    }
    return false;
  };

  /** Mark a message as read */
  const markAsRead = async (id: string) => {
    const auth = useAuthStore();
    if (!auth.accessToken) return;
    try {
      const { data } = await apiMarkMessageRead(auth.accessToken, id);
      if (data.success) {
        const msg = messages.value.find((m) => m.id === id);
        if (msg) msg.isRead = true;
      }
    } catch (e) {
      console.error('[MessagesStore] markAsRead failed', e);
    }
  };

  /** Fetch activities list */
  const fetchActivities = async () => {
    const auth = useAuthStore();
    if (!auth.accessToken) return;
    try {
      const { data } = await apiFetchActivities(auth.accessToken);
      if (data.success) {
        activities.value = data.data.activities;
      }
    } catch (e) {
      console.error('[MessagesStore] fetchActivities failed', e);
    }
  };

  /** Fetch a single activity detail */
  const fetchActivityDetail = async (id: string): Promise<ActivityDetail | null> => {
    const auth = useAuthStore();
    if (!auth.accessToken) return null;
    try {
      const { data } = await apiFetchActivityDetail(auth.accessToken, id);
      if (data.success) {
        return data.data.activity;
      }
    } catch (e) {
      console.error('[MessagesStore] fetchActivityDetail failed', e);
    }
    return null;
  };

  /** Reset store state (called on logout) */
  const resetState = () => {
    messages.value = [];
    activities.value = [];
    loading.value = false;
  };

  return {
    messages,
    activities,
    loading,
    unreadCount,
    fetchMessages,
    fetchMessageDetail,
    deleteMessage,
    markAsRead,
    fetchActivities,
    fetchActivityDetail,
    resetState,
  };
});
