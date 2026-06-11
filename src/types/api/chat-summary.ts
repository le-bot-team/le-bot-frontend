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

/** A single highlight bullet with quote and context */
export interface SummaryBullet {
  quote: string;
  context: string;
}

/** Supported emotion types */
export type EmotionType = 'happy' | 'curious' | 'excited' | 'calm' | 'frustrated';

/** Emotion distribution map (values are 0-1 ratios) */
export type EmotionMap = Partial<Record<EmotionType, number>>;

export interface ChatSummaryData {
  date: string;
  topics: string[];
  summaryParagraphs: string[];
  summaryBullets: SummaryBullet[];
  growthSignal: string;
  emotions: EmotionMap;
  capabilities: string[];
  interactionMinutes: number;
}

export interface ChatSummaryResponse {
  success: boolean;
  data: ChatSummaryData | null;
  message?: string;
}
