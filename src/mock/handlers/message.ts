import type MockAdapter from 'axios-mock-adapter';

import { MOCK_ACTIVITIES, MOCK_MESSAGES } from 'src/mock/data/message';
import { mockError, mockSuccess } from 'src/mock/utils';

import type { ActivityDetail, MessageItem } from 'src/types/api/message';

/**
 * Register mock handlers for the message module:
 *   GET    /messages               — list messages (optional ?type= filter)
 *   GET    /messages/:id           — single message detail
 *   DELETE /messages/:id           — delete message
 *   PATCH  /messages/:id/read      — mark message as read
 *   GET    /messages/activities    — list activities
 *   GET    /messages/activities/:id — single activity detail
 */
export function setupMessageMock(mock: MockAdapter): void {
  // Mutable copies so operations (delete, mark-read) don't leak across HMR cycles
  const messages: MessageItem[] = JSON.parse(JSON.stringify(MOCK_MESSAGES));
  const activities: ActivityDetail[] = JSON.parse(JSON.stringify(MOCK_ACTIVITIES));

  // ── Activities routes (must be registered BEFORE the :id wildcard) ──

  // GET /messages/activities
  mock.onGet('/messages/activities').reply(() => {
    return [200, mockSuccess({ activities: JSON.parse(JSON.stringify(activities)) })];
  });

  // GET /messages/activities/:id
  mock.onGet(/\/messages\/activities\/[\w-]+$/).reply((config) => {
    const id = config.url?.split('/').pop();
    const activity = activities.find((a) => a.id === id);
    if (!activity) return [200, mockError('活动不存在')];
    return [200, mockSuccess({ activity: JSON.parse(JSON.stringify(activity)) })];
  });

  // ── Messages routes ──

  // GET /messages
  mock.onGet('/messages').reply((config) => {
    const type = config.params?.type as string | undefined;
    const filtered = type ? messages.filter((m) => m.type === type) : messages;
    return [200, mockSuccess({ messages: JSON.parse(JSON.stringify(filtered)) })];
  });

  // GET /messages/:id
  mock.onGet(/\/messages\/[\w-]+$/).reply((config) => {
    const id = config.url?.split('/').pop();
    const msg = messages.find((m) => m.id === id);
    if (!msg) return [200, mockError('消息不存在')];
    return [200, mockSuccess({ message: JSON.parse(JSON.stringify(msg)) })];
  });

  // DELETE /messages/:id
  mock.onDelete(/\/messages\/[\w-]+$/).reply((config) => {
    const id = config.url?.split('/').pop();
    const idx = messages.findIndex((m) => m.id === id);
    if (idx === -1) return [200, mockError('消息不存在')];
    messages.splice(idx, 1);
    console.debug(`[Mock Messages] Message deleted: ${id}`);
    return [200, mockSuccess(undefined)];
  });

  // PATCH /messages/:id/read
  mock.onPatch(/\/messages\/[\w-]+\/read$/).reply((config) => {
    // Extract id from URL: /messages/{id}/read
    const parts = config.url?.split('/') ?? [];
    const id = parts[parts.length - 2];
    const msg = messages.find((m) => m.id === id);
    if (!msg) return [200, mockError('消息不存在')];
    msg.isRead = true;
    console.debug(`[Mock Messages] Message marked read: ${id}`);
    return [200, mockSuccess(undefined)];
  });
}
