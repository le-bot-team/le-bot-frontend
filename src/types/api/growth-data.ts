/**
 * Growth Data API types.
 *
 * Endpoint: GET /api/v1/growth/weekly-report
 * Returns a weekly growth report for a specific device, including
 * interaction stats, capability radar, emotion timeline, hot topics,
 * and AI-generated summaries.
 */

// ─── Emotion enum (shared with page rendering) ──────────────────────────────────

export type EmotionType = 'happy' | 'delighted' | 'calm' | 'worried' | 'sad';

// ─── Request ────────────────────────────────────────────────────────────────────

export interface GrowthWeeklyReportRequest {
  deviceId: string;
  weekStart: string; // YYYY-MM-DD (Monday)
}

// ─── Response data ──────────────────────────────────────────────────────────────

export interface DailyInteraction {
  /** Display date, e.g. "5.12" */
  date: string;
  /** Interaction duration in minutes */
  minutes: number;
}

export interface CapabilityScore {
  /** Capability name, e.g. "社交理解力" */
  name: string;
  /** Current score */
  value: number;
  /** Maximum possible score */
  max: number;
}

export interface EmotionEntry {
  /** Display date, e.g. "5.12" */
  date: string;
  /** Dominant emotion for the day */
  emotion: EmotionType;
}

export interface HotTopicEntry {
  /** Topic name, e.g. "过家家" */
  name: string;
  /** Percentage share (0-100) */
  percentage: number;
}

export interface GrowthSummaries {
  /** AI summary for chat topics */
  chatSummary: string;
  /** AI summary for capability development */
  capabilitySummary: string;
  /** AI summary for interaction duration */
  interactionSummary: string;
  /** AI summary for emotion trends */
  emotionSummary: string;
}

export interface GrowthWeeklyReportData {
  /** Week start date YYYY-MM-DD */
  weekStart: string;
  /** Week end date YYYY-MM-DD */
  weekEnd: string;
  /** Total accompany hours since device activation */
  accompanyHours: number;
  /** Total interaction minutes this week */
  weeklyInteractionMinutes: number;
  /** Best capability name this week */
  bestCapability: string;
  /** Average emotion label this week */
  emotionAverage: string;
  /** Daily interaction duration (7 days) */
  dailyInteraction: DailyInteraction[];
  /** 5-dimension capability scores */
  capabilities: CapabilityScore[];
  /** Daily dominant emotion (7 days) */
  emotionTimeline: EmotionEntry[];
  /** Hot topic distribution */
  hotTopics: HotTopicEntry[];
  /** AI-generated summary texts */
  summaries: GrowthSummaries;
}

// ─── Standard response wrapper ──────────────────────────────────────────────────

export interface GrowthWeeklyReportResponse {
  success: boolean;
  data: GrowthWeeklyReportData | null;
  message?: string;
}
