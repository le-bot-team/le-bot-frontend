/**
 * Chat Summary API types.
 *
 * Endpoint: GET /api/v1/chat/summary
 * Returns an AI-generated summary of the child's conversations for a given date.
 */

export interface ChatSummaryRequest {
  deviceId: string;
  date: string; // YYYY-MM-DD
}

export interface ChatSummaryData {
  date: string;
  topics: string[];
  summaryParagraphs: string[];
  summaryBullets: string[];
  growthSignal: string;
}

export interface ChatSummaryResponse {
  success: boolean;
  data: ChatSummaryData | null;
  message?: string;
}
