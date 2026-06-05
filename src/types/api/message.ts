/**
 * Message module type definitions.
 */

/** Message type discriminator */
export type MessageType = 'notification' | 'activity' | 'emotion';

/** Emotion severity level */
export type EmotionLevel = 'good' | 'bad';

/** Activity lifecycle status */
export type ActivityStatus = 'ongoing' | 'upcoming' | 'ended';

/** A single message item in the message list */
export interface MessageItem {
  id: string;
  type: MessageType;
  title: string;
  content: string;
  /** Optional icon URL override (falls back to type-based default) */
  iconUrl?: string;
  isRead: boolean;
  createdAt: string;
  // Activity-specific fields
  activityImage?: string;
  // Emotion-specific fields
  emotionLevel?: EmotionLevel;
  relatedChildId?: string;
  relatedChildName?: string;
}

/** Activity detail (rich content for activity messages) */
export interface ActivityDetail {
  id: string;
  title: string;
  image: string;
  content: string;
  startDate: string;
  endDate: string;
  status: ActivityStatus;
}

// ─── API Response Types (uniform { success, data/message } pattern) ───

export type FetchMessagesResponse =
  | { success: false; message: string }
  | { success: true; data: { messages: MessageItem[] } };

export type FetchMessageDetailResponse =
  | { success: false; message: string }
  | { success: true; data: { message: MessageItem } };

export type DeleteMessageResponse =
  | { success: false; message: string }
  | { success: true; data?: undefined };

export type MarkMessageReadResponse =
  | { success: false; message: string }
  | { success: true; data?: undefined };

export type FetchActivitiesResponse =
  | { success: false; message: string }
  | { success: true; data: { activities: ActivityDetail[] } };

export type FetchActivityDetailResponse =
  | { success: false; message: string }
  | { success: true; data: { activity: ActivityDetail } };
