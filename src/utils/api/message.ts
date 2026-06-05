import { api } from 'boot/axios';

import type {
  DeleteMessageResponse,
  FetchActivitiesResponse,
  FetchActivityDetailResponse,
  FetchMessageDetailResponse,
  FetchMessagesResponse,
  MarkMessageReadResponse,
} from 'src/types/api/message';

/** Fetch all messages (optionally filtered by type) */
export const fetchMessages = async (accessToken: string, type?: string) =>
  await api.get<FetchMessagesResponse>('/messages', {
    params: type ? { type } : undefined,
    headers: { 'x-access-token': accessToken },
  });

/** Fetch a single message by ID */
export const fetchMessageDetail = async (accessToken: string, id: string) =>
  await api.get<FetchMessageDetailResponse>(`/messages/${id}`, {
    headers: { 'x-access-token': accessToken },
  });

/** Delete a message by ID */
export const deleteMessage = async (accessToken: string, id: string) =>
  await api.delete<DeleteMessageResponse>(`/messages/${id}`, {
    headers: { 'x-access-token': accessToken },
  });

/** Mark a message as read */
export const markMessageRead = async (accessToken: string, id: string) =>
  await api.patch<MarkMessageReadResponse>(
    `/messages/${id}/read`,
    {},
    { headers: { 'x-access-token': accessToken } },
  );

/** Fetch activity list */
export const fetchActivities = async (accessToken: string) =>
  await api.get<FetchActivitiesResponse>('/messages/activities', {
    headers: { 'x-access-token': accessToken },
  });

/** Fetch a single activity detail */
export const fetchActivityDetail = async (accessToken: string, id: string) =>
  await api.get<FetchActivityDetailResponse>(`/messages/activities/${id}`, {
    headers: { 'x-access-token': accessToken },
  });
