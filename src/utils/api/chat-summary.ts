import { api } from 'boot/axios';

import type { ChatSummaryResponse } from 'src/types/api/chat-summary';

/**
 * Fetch the AI-generated chat summary for a specific device and date.
 *
 * GET /chat/summary?deviceId=...&date=YYYY-MM-DD
 */
export const fetchChatSummary = async (
  accessToken: string,
  deviceId: string,
  date: string,
) => {
  return await api.get<ChatSummaryResponse>('/chat/summary', {
    params: { deviceId, date },
    headers: { 'x-access-token': accessToken },
  });
};
