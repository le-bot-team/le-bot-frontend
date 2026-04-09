import { uid } from 'quasar';
import { computed, ref, type Ref } from 'vue';

import { useChatPlayer } from 'src/composables/useChatPlayer';
import { useChatRecorder } from 'src/composables/useChatRecorder';
import { useSilenceDetector } from 'src/composables/useSilenceDetector';
import { useWakeWord } from 'src/composables/useWakeWord';
import { useWsClient } from 'src/composables/useWsClient';
import { CHAT_TIMEOUTS, ChatState, type ChatMessage } from 'src/types/chat/types';
import {
  WsAction,
  WsCancelOutputRequest,
  WsClearContextRequest,
  WsInputAudioCompleteRequest,
  WsInputAudioStreamRequest,
  WsUpdateConfigRequest,
} from 'src/types/websocket/types';
import type {
  WsCancelOutputResponseSuccess,
  WsChatCompleteResponseError,
  WsChatCompleteResponseSuccess,
  WsOutputAudioCompleteResponseSuccess,
  WsOutputAudioStreamResponseSuccess,
  WsOutputTextCompleteResponseSuccess,
  WsOutputTextStreamResponseSuccess,
  WsUpdateConfigResponseSuccess,
} from 'src/types/websocket/types';
import { useChatStore } from 'stores/chat';

import { pcmToWav } from 'src/utils/audio';

export interface UseChatSessionReturn {
  /** Current chat state machine state */
  state: Ref<ChatState>;
  /** All messages in the current conversation */
  messages: Ref<ChatMessage[]>;
  /** Whether the WebSocket is connected */
  isConnected: Ref<boolean>;
  /** Whether microphone is ready */
  isMediaReady: Ref<boolean>;
  /** Whether the browser supports wake word detection */
  isWakeWordSupported: boolean;
  /** Whether the wake word listener is active */
  isWakeWordListening: Ref<boolean>;
  /** Whether audio is currently being recorded */
  isRecording: Ref<boolean>;
  /** Whether assistant audio is currently playing */
  isAudioPlaying: Ref<boolean>;
  /** Connect to the chat server */
  connect: (token: string) => Promise<void>;
  /** Disconnect from the chat server */
  disconnect: () => void;
  /** Manually trigger a wake (button press equivalent of GPIO) */
  wake: () => Promise<void>;
  /** Manually interrupt the current session */
  interrupt: () => void;
  /** Clear the conversation context */
  clearContext: () => void;
  /** Clean up all resources (call in onBeforeUnmount) */
  destroy: () => void;
}

/**
 * Core chat session orchestrator — the Vue equivalent of leBotChatClient's cmd/app.go.
 *
 * Manages the entire conversation lifecycle:
 * - Three-state machine: Idle → WaitingResponse → Active → Idle
 * - WebSocket connection and message routing
 * - Audio recording, playback, and silence detection
 * - Wake word detection (Web Speech API)
 * - Smart interruption (voice and manual)
 * - Session management (requestId, timeouts, cancel cooldown)
 */
export function useChatSession(): UseChatSessionReturn {
  // --- Sub-composables ---
  const wsClient = useWsClient();
  const recorder = useChatRecorder();
  const player = useChatPlayer();
  const silenceDetector = useSilenceDetector();
  const wakeWord = useWakeWord();
  const chatStore = useChatStore();

  // --- Core state ---
  const state = ref<ChatState>(ChatState.Idle);
  const messages = ref<ChatMessage[]>([]);
  const isConnected = computed(() => wsClient.connectionState.value === 'connected');

  let currentRequestId = '';
  let waitingResponseSince = 0; // Timestamp in ms, 0 = not set
  let waitingResponseTimer: ReturnType<typeof setInterval> | undefined;

  // --- Per-turn player instance management ---
  // Each assistant response turn gets its own player instance
  let currentTurnPlayer = player;

  // ==========================================================================
  // WebSocket event handlers — mirrors Go's websocket.MessageHandler interface
  // ==========================================================================

  function setupWsHandlers() {
    wsClient.onAction(WsAction.establishConnection, () => {
      console.log('[useChatSession] Connection established');
      sendUpdateConfig();
    });

    wsClient.onAction(WsAction.updateConfig, handleUpdateConfig);
    wsClient.onAction(WsAction.outputAudioStream, handleOutputAudioStream);
    wsClient.onAction(WsAction.outputAudioComplete, handleOutputAudioComplete);
    wsClient.onAction(WsAction.outputTextStream, handleOutputTextStream);
    wsClient.onAction(WsAction.outputTextComplete, handleOutputTextComplete);
    wsClient.onAction(WsAction.chatComplete, handleChatComplete);
    wsClient.onAction(WsAction.cancelOutput, handleCancelOutput);
  }

  function sendUpdateConfig() {
    wsClient.sendAction(
      new WsUpdateConfigRequest({
        conversationId: chatStore.conversationId,
        outputText: true,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    );
  }

  function handleUpdateConfig(message: WsUpdateConfigResponseSuccess) {
    chatStore.conversationId = message.data.conversationId;
    console.log('[useChatSession] Config updated, conversationId:', message.data.conversationId);
  }

  async function handleOutputAudioStream(message: WsOutputAudioStreamResponseSuccess) {
    chatStore.conversationId = message.data.conversationId;

    // Reset the waiting response timer on each audio chunk (prevents premature timeout)
    if (state.value === ChatState.WaitingResponse) {
      waitingResponseSince = Date.now();
    }

    // Find or create assistant message
    const msg = findOrCreateAssistantMessage(message.data.chatId, message.data.conversationId);

    // Store raw audio chunk
    const audioBlob = base64ToBlob(message.data.buffer);
    msg.audioChunks.push(audioBlob);

    // Play via Web Audio API
    await currentTurnPlayer.playChunk(message.data.buffer);
  }

  async function handleOutputAudioComplete(message: WsOutputAudioCompleteResponseSuccess) {
    chatStore.conversationId = message.data.conversationId;

    const msg = findOrCreateAssistantMessage(message.data.chatId, message.data.conversationId);

    // Create combined audio URL for the message
    if (msg.audioChunks.length > 0) {
      const combinedBlob = await pcmToWav(new Blob(msg.audioChunks));
      msg.audioUrl = URL.createObjectURL(combinedBlob);
    }

    currentTurnPlayer.setAudioComplete(true);

    // State transition: WaitingResponse → Active (matches Go client)
    if (state.value === ChatState.WaitingResponse) {
      transitionToActive();
    }
  }

  function handleOutputTextStream(message: WsOutputTextStreamResponseSuccess) {
    chatStore.conversationId = message.data.conversationId;

    if (message.data.role === 'assistant') {
      const msg = findOrCreateAssistantMessage(message.data.chatId, message.data.conversationId);
      msg.text = message.data.text;
      msg.isStreaming = true;
    } else if (message.data.role === 'user') {
      const msg = findOrCreateUserMessage(message.data.chatId, message.data.conversationId);
      msg.text = message.data.text;

      // Voice interrupt: if server recognized user speech (len >= 2), stop playback
      // Mirrors Go's HandleOutputTextStream with role=="user" && len(text)>=2
      if (message.data.text.length >= 2) {
        console.log('[useChatSession] Voice interrupt — user speech detected during playback');
        currentTurnPlayer.stopPlayback();
      }
    }
  }

  function handleOutputTextComplete(message: WsOutputTextCompleteResponseSuccess) {
    chatStore.conversationId = message.data.conversationId;

    if (message.data.role === 'assistant') {
      const msg = findOrCreateAssistantMessage(message.data.chatId, message.data.conversationId);
      msg.text = message.data.text;
      msg.isStreaming = false;
    } else if (message.data.role === 'user') {
      const msg = findOrCreateUserMessage(message.data.chatId, message.data.conversationId);
      msg.text = message.data.text;
      msg.isFinished = true;
      msg.isStreaming = false;

      // After user text is finalized with sufficient length, prepare for assistant response
      if (message.data.text.length >= 2) {
        // Create a new player for the upcoming assistant turn
        currentTurnPlayer.destroy();
        currentTurnPlayer = useChatPlayer();
        setupPlayerCallbacks();
      }
    }
  }

  function handleChatComplete(
    message: WsChatCompleteResponseSuccess | WsChatCompleteResponseError,
  ) {
    chatStore.conversationId = message.data.conversationId;

    const msg = findLastAssistantMessage();
    if (msg) {
      msg.isFinished = true;
      msg.isStreaming = false;
    }

    if (!message.success) {
      console.error('[useChatSession] Chat completed with errors:', message.data.errors);
    }
  }

  function handleCancelOutput(message: WsCancelOutputResponseSuccess) {
    console.log('[useChatSession] Cancel output received, type:', message.data.cancelType);

    currentTurnPlayer.stopPlayback();
    currentTurnPlayer.clearBuffer();

    // cancelType "voice" → transition to Active (keep listening for more input)
    // Mirrors Go's HandleCancelOutput behavior
    if (message.data.cancelType === 'voice' && state.value === ChatState.WaitingResponse) {
      transitionToActive();
    }
  }

  // ==========================================================================
  // State machine transitions — mirrors Go's state transitions
  // ==========================================================================

  function transitionToActive() {
    state.value = ChatState.Active;
    waitingResponseSince = 0;

    // Start silence detection
    const analyserNode = recorder.getAnalyserNode();
    if (analyserNode) {
      silenceDetector.reset();
      silenceDetector.start(analyserNode);
    }

    console.log('[useChatSession] State → Active');
  }

  function transitionToWaitingResponse() {
    // Mirrors Go's transitionToWaitingResponse:
    // - Does NOT send inputAudioComplete (audio keeps streaming for interrupt detection)
    // - Records waitingResponseSince
    state.value = ChatState.WaitingResponse;
    waitingResponseSince = Date.now();
    silenceDetector.stop();
    silenceDetector.reset();

    // Prepare a new player for next response
    currentTurnPlayer.destroy();
    currentTurnPlayer = useChatPlayer();
    setupPlayerCallbacks();

    console.log('[useChatSession] State → WaitingResponse (silence detected)');
  }

  function transitionToIdle() {
    state.value = ChatState.Idle;
    waitingResponseSince = 0;

    // Stop recording
    recorder.stopRecording();

    // Stop silence detection
    silenceDetector.stop();
    silenceDetector.reset();

    // Clean up player
    currentTurnPlayer.destroy();
    currentTurnPlayer = useChatPlayer();
    setupPlayerCallbacks();

    // Restart wake word listener
    if (isConnected.value) {
      wakeWord.start();
    }

    // Stop timeout checker
    if (waitingResponseTimer !== undefined) {
      clearInterval(waitingResponseTimer);
      waitingResponseTimer = undefined;
    }

    console.log('[useChatSession] State → Idle');
  }

  // ==========================================================================
  // Session management
  // ==========================================================================

  function startSession() {
    currentRequestId = uid();

    // Send fresh config
    sendUpdateConfig();

    // Start recording
    recorder.startRecording();

    // State → WaitingResponse
    state.value = ChatState.WaitingResponse;
    waitingResponseSince = Date.now();

    // Start the timeout checker (runs periodically like Go's silenceCheckLoop)
    startWaitingResponseTimeoutChecker();

    console.log('[useChatSession] Session started, requestId:', currentRequestId);
  }

  async function interruptCurrentSession() {
    console.log('[useChatSession] Interrupting current session');

    // Stop playback
    currentTurnPlayer.stopPlayback();
    currentTurnPlayer.clearBuffer();

    // Stop silence detection
    silenceDetector.stop();
    silenceDetector.reset();

    // Send cancel to server
    wsClient.sendAction(new WsCancelOutputRequest('manual'));

    // Cancel cooldown (Go: 300ms)
    await sleep(CHAT_TIMEOUTS.cancelCooldownMs);
  }

  function startWaitingResponseTimeoutChecker() {
    if (waitingResponseTimer !== undefined) {
      clearInterval(waitingResponseTimer);
    }

    // Check every 2 seconds (matches Go's SilenceCheckInterval)
    waitingResponseTimer = setInterval(() => {
      if (
        state.value === ChatState.WaitingResponse &&
        waitingResponseSince > 0 &&
        !currentTurnPlayer.isPlaying.value &&
        Date.now() - waitingResponseSince > CHAT_TIMEOUTS.waitingResponseTimeoutMs
      ) {
        // 30s timeout → send inputAudioComplete → Idle
        console.log('[useChatSession] WaitingResponse timeout (30s) — ending session');
        wsClient.sendAction(new WsInputAudioCompleteRequest(''));
        transitionToIdle();
      }
    }, 2000);
  }

  function setupPlayerCallbacks() {
    currentTurnPlayer.onPlaybackFinished(() => {
      // After playback finishes in WaitingResponse, the timeout checker handles the rest.
      // In Active state, this is just a normal response completion — keep listening.
      console.log('[useChatSession] Playback finished');
    });
  }

  // ==========================================================================
  // Public API
  // ==========================================================================

  async function connect(token: string): Promise<void> {
    // Setup WS handlers before connecting
    setupWsHandlers();

    // Connect WebSocket
    const wsUrl = `${process.env.LE_BOT_BACKEND_WS_BASE_URL}/api/v1/chat/ws?token=${token}`;
    wsClient.connect(wsUrl);

    // Initialize microphone
    await recorder.initMedia();

    // Setup recorder chunk handler — sends audio to server
    recorder.onChunk((base64: string) => {
      if (
        state.value === ChatState.WaitingResponse ||
        state.value === ChatState.Active
      ) {
        wsClient.sendAction(new WsInputAudioStreamRequest(base64));

        // Accumulate chunks into current user message
        const userMsg = findLastUnfinishedUserMessage();
        if (userMsg) {
          userMsg.audioChunks.push(base64ToBlob(base64));
        }
      }
    });

    // Setup silence detection callback
    silenceDetector.onSilenceDetected(() => {
      if (state.value === ChatState.Active) {
        console.log('[useChatSession] Silence detected');
        transitionToWaitingResponse();
      }
    });

    // Setup wake word callback
    wakeWord.onWakeDetected(() => {
      console.log('[useChatSession] Wake word detected!');
      wake().catch(console.error);
    });

    // Setup initial player callbacks
    setupPlayerCallbacks();

    // Start wake word listening
    wakeWord.start();
  }

  function disconnect() {
    // Stop everything
    wakeWord.stop();
    silenceDetector.stop();
    recorder.releaseMedia();
    currentTurnPlayer.destroy();
    wsClient.disconnect();

    if (waitingResponseTimer !== undefined) {
      clearInterval(waitingResponseTimer);
      waitingResponseTimer = undefined;
    }

    state.value = ChatState.Idle;

    // Revoke all audio URLs
    messages.value.forEach((msg) => {
      if (msg.audioUrl) URL.revokeObjectURL(msg.audioUrl);
    });
    messages.value = [];
  }

  async function wake(): Promise<void> {
    if (!isConnected.value) {
      console.warn('[useChatSession] Cannot wake — not connected');
      return;
    }

    // Stop wake word listener during session
    wakeWord.stop();

    // If not in Idle, interrupt current session first (like Go's OnGpioWake)
    if (state.value !== ChatState.Idle) {
      await interruptCurrentSession();
    }

    // Create a new user message placeholder for this turn
    const userMsg: ChatMessage = {
      id: uid(),
      role: 'user',
      text: '',
      audioChunks: [],
      isFinished: false,
      isStreaming: true,
      timestamp: Date.now(),
    };
    messages.value.push(userMsg);

    // Start the session
    startSession();
  }

  function interrupt(): void {
    if (state.value === ChatState.Idle) return;

    // Manual interrupt via button — same as GPIO wake during active session
    wake().catch(console.error);
  }

  function clearContext(): void {
    wsClient.sendAction(new WsClearContextRequest());
    chatStore.conversationId = '';
  }

  function destroy() {
    disconnect();
  }

  // ==========================================================================
  // Message helpers
  // ==========================================================================

  function findOrCreateAssistantMessage(chatId: string, conversationId: string): ChatMessage {
    let msg = messages.value.findLast(
      (m) => m.role === 'assistant' && !m.isFinished,
    );
    if (!msg) {
      msg = {
        id: uid(),
        chatId,
        conversationId,
        role: 'assistant',
        text: '',
        audioChunks: [],
        isFinished: false,
        isStreaming: true,
        timestamp: Date.now(),
      };
      messages.value.push(msg);
    } else {
      msg.chatId = chatId;
      msg.conversationId = conversationId;
    }
    return msg;
  }

  function findOrCreateUserMessage(chatId: string, conversationId: string): ChatMessage {
    let msg = messages.value.findLast(
      (m) => m.role === 'user' && !m.isFinished,
    );
    if (!msg) {
      msg = {
        id: uid(),
        chatId,
        conversationId,
        role: 'user',
        text: '',
        audioChunks: [],
        isFinished: false,
        isStreaming: true,
        timestamp: Date.now(),
      };
      messages.value.push(msg);
    } else {
      msg.chatId = chatId;
      msg.conversationId = conversationId;
    }
    return msg;
  }

  function findLastAssistantMessage(): ChatMessage | undefined {
    return messages.value.findLast((m) => m.role === 'assistant' && !m.isFinished);
  }

  function findLastUnfinishedUserMessage(): ChatMessage | undefined {
    return messages.value.findLast((m) => m.role === 'user' && !m.isFinished);
  }

  return {
    state,
    messages,
    isConnected,
    isMediaReady: recorder.isMediaReady,
    isWakeWordSupported: wakeWord.isSupported,
    isWakeWordListening: wakeWord.isListening,
    isRecording: recorder.isRecording,
    isAudioPlaying: currentTurnPlayer.isPlaying,
    connect,
    disconnect,
    wake,
    interrupt,
    clearContext,
    destroy,
  };
}

// ==========================================================================
// Utility functions
// ==========================================================================

function base64ToBlob(base64: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: 'application/octet-stream' });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
