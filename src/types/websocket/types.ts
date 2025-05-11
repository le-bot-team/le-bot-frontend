export enum WsAction {}

export enum CozeWsEventType {
  // Upstream events
  chatUpdate = 'chat.update',
  inputAudioBufferAppend = 'input_audio_buffer.append',
  inputAudioBufferComplete = 'input_audio_buffer.complete',
  inputAudioBufferClear = 'input_audio_buffer.clear',
  conversationMessageCreate = 'conversation.message.create',
  conversationClear = 'conversation.clear',
  conversationChatSubmitToolOutputs = 'conversation.chat.submit_tool_outputs',
  conversationChatCancel = 'conversation.chat.cancel',
  // Downstream events
  chatCreated = 'chat.created',
  chatUpdated = 'chat.updated',
  conversationChatCreated = 'conversation.chat.created',
  conversationChatInProgress = 'conversation.chat.in_progress',
  conversationMessageDelta = 'conversation.message.delta',
  conversationAudioDelta = 'conversation.audio.delta',
  conversationMessageCompleted = 'conversation.message.completed',
  conversationAudioCompleted = 'conversation.audio.completed',
  conversationChatCompleted = 'conversation.chat.completed',
  conversationChatFailed = 'conversation.chat.failed',
  error = 'error',
  inputAudioBufferCompleted = 'input_audio_buffer.completed',
  inputAudioBufferCleared = 'input_audio_buffer.cleared',
  conversationCleared = 'conversation.cleared',
  conversationChatCanceled = 'conversation.chat.canceled',
  conversationAudioTranscriptUpdate = 'conversation.audio_transcript.update',
  conversationAudioTranscriptCompleted = 'conversation.audio_transcript.completed',
  conversationChatRequiresAction = 'conversation.chat.requires_action',
  inputAudioBufferSpeechStarted = 'input_audio_buffer.speech_started',
  inputAudioBufferSpeechStopped = 'input_audio_buffer.speech_stopped',
}

export interface CozeWsResponse {
  id: string;
  event_type: CozeWsEventType;
}

export interface WsResponse {
  action: WsAction;
  data: unknown;
}

export type WsHandler<T> = (message: T) => Promise<void> | void;
