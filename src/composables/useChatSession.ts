import { uid } from 'quasar';
import { computed, ref, shallowRef, watch, type Ref } from 'vue';

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
import { useChatStore, type PersistedChatMessage } from 'stores/chat';
import { getChatHistoryDB, type ChatDateEntry } from 'src/utils/chat/chatHistoryDB';

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
  /** Whether older messages are available in IndexedDB */
  hasMoreHistory: Ref<boolean>;
  /** Whether older messages are currently being loaded */
  isLoadingHistory: Ref<boolean>;
  /** Connect to the chat server */
  connect: (token: string, deviceId?: string, sessionId?: string) => Promise<void>;
  /** Disconnect from the chat server */
  disconnect: () => void;
  /** Manually trigger a wake (button press equivalent of GPIO) */
  wake: () => Promise<void>;
  /** End the current recording turn (button release — sends inputAudioComplete immediately) */
  endTurn: () => void;
  /** Manually interrupt the current session */
  interrupt: () => void;
  /** Clear the conversation context */
  clearContext: () => void;
  /** Load older messages from IndexedDB (pagination) */
  loadMore: () => Promise<void>;
  /** Return a list of calendar dates that have messages */
  getDateList: () => Promise<ChatDateEntry[]>;
  /** Load messages for a specific day from IndexedDB */
  loadDateMessages: (dateTimestamp: number) => Promise<ChatMessage[]>;
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

  // --- IndexedDB history storage ---
  const chatDB = getChatHistoryDB();
  const hasMoreHistory = ref(false);
  const isLoadingHistory = ref(false);
  const PAGE_SIZE = 50;

  // --- Core state ---
  const state = ref<ChatState>(ChatState.Idle);

  // Restore messages from persisted store on mount (fast cache — latest 150)
  // NOTE: This cache is device-agnostic (localStorage), so it may contain
  // messages from a different device. We use it only as initial render data;
  // connect() will overwrite with the correct device's messages from IndexedDB.
  const restoredMessages: ChatMessage[] = chatStore.persistedMessages.map((pm) => {
    const msg: ChatMessage = {
      id: pm.id,
      role: pm.role,
      text: pm.text,
      audioChunks: [],
      isFinished: pm.isFinished,
      isStreaming: false, // restored messages are no longer streaming
      timestamp: pm.timestamp,
    };
    if (pm.chatId !== undefined) msg.chatId = pm.chatId;
    if (pm.conversationId !== undefined) msg.conversationId = pm.conversationId;
    return msg;
  });
  const messages = ref<ChatMessage[]>(restoredMessages);

  // Track whether the localStorage→IndexedDB migration has already been done
  // (only needed once, for the very first session after the IndexedDB upgrade).
  let localStorageMigrated = false;

  // Sync messages → localStorage (capped at 150) + IndexedDB (full history)
  watch(
    messages,
    (msgs) => {
      const persisted: PersistedChatMessage[] = msgs
        .filter((m) => m.text.trim().length > 0 || m.isFinished)
        .map(toPersisted);
      // Write to IndexedDB (full history)
      void chatDB.addMessages(persisted);
      // Keep localStorage as fast cache (latest 150 only)
      chatStore.setPersistedMessages(persisted);
    },
    { deep: true },
  );
  const isConnected = computed(() => wsClient.connectionState.value === 'connected');

  let currentRequestId = '';
  let waitingResponseSince = 0; // Timestamp in ms, 0 = not set
  let waitingResponseTimer: ReturnType<typeof setInterval> | undefined;

  // --- Per-turn player instance management ---
  // Each assistant response turn gets its own player instance
  const currentTurnPlayerRef = shallowRef(player);
  let currentTurnPlayer = player;

  // Reactive isAudioPlaying that tracks the current player
  const isAudioPlaying = computed(() => currentTurnPlayerRef.value.isPlaying.value);

  // ==========================================================================
  // WebSocket event handlers — mirrors Go's websocket.MessageHandler interface
  // ==========================================================================

  function setupWsHandlers() {
    wsClient.onAction(WsAction.establishConnection, () => {
      console.log('[useChatSession] Connection established');
      sendUpdateConfig();
      // After reconnect, if we're in Idle state, restart wake word listening
      // (it may have been skipped during transitionToIdle due to dead connection)
      if (state.value === ChatState.Idle) {
        wakeWord.start();
      }
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
    console.log('[useChatSession] outputAudioStream received, chatId:', message.data.chatId);
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
      msg.audioChunks = []; // Release intermediate blobs to free memory
    }

    currentTurnPlayer.setAudioComplete(true);

    // State transition: WaitingResponse → Active (matches Go client)
    if (state.value === ChatState.WaitingResponse) {
      transitionToActive();
    }
  }

  function handleOutputTextStream(message: WsOutputTextStreamResponseSuccess) {
    console.log('[useChatSession] outputTextStream received:', message.data);
    chatStore.conversationId = message.data.conversationId;

    if (message.data.role === 'assistant') {
      const msg = findOrCreateAssistantMessage(message.data.chatId, message.data.conversationId);
      // outputTextStream sends incremental delta text — append, not overwrite
      msg.text += message.data.text;
      msg.isStreaming = true;
    } else if (message.data.role === 'user') {
      const msg = findOrCreateUserMessage(message.data.chatId, message.data.conversationId);
      msg.text += message.data.text;

      // Voice interrupt: if server recognized user speech (len >= 2), stop playback
      // Mirrors Go's HandleOutputTextStream with role=="user" && len(text)>=2
      if (message.data.text.length >= 2) {
        console.log('[useChatSession] Voice interrupt — user speech detected during playback');
        currentTurnPlayer.stopPlayback();
      }
    }
  }

  function handleOutputTextComplete(message: WsOutputTextCompleteResponseSuccess) {
    console.log('[useChatSession] outputTextComplete received:', message.data);
    chatStore.conversationId = message.data.conversationId;

    if (message.data.role === 'assistant') {
      const msg = findOrCreateAssistantMessage(message.data.chatId, message.data.conversationId);
      // Stream deltas (+=) already accumulated the full text including tokens
      // that outputTextComplete may omit (e.g. leading emoji).
      // Fallback: if no stream was received (text is empty), use complete text.
      if (msg.text.length === 0) {
        msg.text = message.data.text;
      }
      msg.isStreaming = false;
    } else if (message.data.role === 'user') {
      const msg = findOrCreateUserMessage(message.data.chatId, message.data.conversationId);
      // Same: prefer accumulated stream text; fallback to complete text if empty
      if (msg.text.length === 0) {
        msg.text = message.data.text;
      }
      msg.isFinished = true;
      msg.isStreaming = false;

      // After user text is finalized with sufficient length, prepare for assistant response
      if (msg.text.length >= 2) {
        // Create a new player for the upcoming assistant turn
        currentTurnPlayer.destroy();
        currentTurnPlayer = useChatPlayer();
        currentTurnPlayerRef.value = currentTurnPlayer;
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
    currentTurnPlayerRef.value = currentTurnPlayer;
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
    currentTurnPlayerRef.value = currentTurnPlayer;
    setupPlayerCallbacks();

    // Restart wake word listener — but only if the connection is actually alive.
    // If the connection dropped (half-open socket), skip restarting wake word
    // to avoid waking into a dead connection. The heartbeat will force a
    // reconnect, and the establishConnection handler will re-setup state.
    if (isConnected.value && wsClient.isAlive()) {
      wakeWord.start();
    } else {
      console.log('[useChatSession] Skipping wakeWord restart — connection not healthy');
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

  async function connect(token: string, deviceId?: string, sessionId?: string): Promise<void> {
    // Immediately clear messages so the UI does not show another device's history
    messages.value = [];
    hasMoreHistory.value = false;

    // Initialize IndexedDB for chat history, scoped to the current device
    const effectiveDeviceId = deviceId ?? 'default';
    try {
      await chatDB.init(effectiveDeviceId);

      // One-time migration: on the very first connect after IndexedDB was introduced,
      // seed the default device's store from localStorage. Skip for all subsequent
      // connects and for non-default devices to avoid cross-device pollution.
      if (!localStorageMigrated && restoredMessages.length > 0 && effectiveDeviceId === 'default') {
        const persisted: PersistedChatMessage[] = restoredMessages.map(toPersisted);
        await chatDB.addMessages(persisted);
        localStorageMigrated = true;
      }

      // Load latest 150 messages exclusively from this device's IndexedDB store
      const latest = await chatDB.getLatest(150);
      if (latest.length > 0) {
        messages.value = latest.map(toChatMessage);
        hasMoreHistory.value = await chatDB.hasOlder(latest[0]!.timestamp);
      }
    } catch (err) {
      console.warn('[useChatSession] IndexedDB init failed, using localStorage only:', err);
    }

    // Setup WS handlers before connecting — useWsClient queues them as
    // pendingHandlers and applies them inside connect() to the new WsWrapper
    setupWsHandlers();

    // Connect WebSocket with optional deviceId for virtual device binding
    const deviceParam = deviceId ? `&deviceId=${encodeURIComponent(deviceId)}` : '';
    const sessionParam = sessionId ? `&sessionId=${encodeURIComponent(sessionId)}` : '';
    const wsUrl = `${process.env.LE_BOT_BACKEND_WS_BASE_URL}/api/v1/chat/ws?token=${encodeURIComponent(token)}${deviceParam}${sessionParam}`;
    wsClient.connect(wsUrl);

    // Initialize microphone
    await recorder.initMedia();

    // Setup recorder chunk handler — sends audio to server
    recorder.onChunk((base64: string) => {
      if (state.value === ChatState.WaitingResponse || state.value === ChatState.Active) {
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

    // Revoke all audio URLs (prevent memory leaks)
    messages.value.forEach((msg) => {
      if (msg.audioUrl) URL.revokeObjectURL(msg.audioUrl);
    });

    // Persist messages to store before clearing local ref
    // (the watcher already keeps them in sync, but ensure final state is saved)
    const persisted: PersistedChatMessage[] = messages.value
      .filter((m) => m.text.trim().length > 0 || m.isFinished)
      .map((m) => {
        const p = toPersisted(m);
        p.isStreaming = false;
        return p;
      });
    chatStore.setPersistedMessages(persisted);

    messages.value = [];
  }

  async function wake(): Promise<void> {
    if (!isConnected.value) {
      console.warn('[useChatSession] Cannot wake — not connected');
      return;
    }

    // Heartbeat-aware health check: if the connection is half-open (readyState
    // OPEN but no data received within heartbeat timeout), force reconnect and
    // wait for it to come back before proceeding.
    if (!wsClient.isAlive()) {
      console.warn(
        '[useChatSession] Connection appears dead (heartbeat timeout) — forcing reconnect',
      );
      // Proactively close the socket; the onclose handler triggers auto-reconnect in 3 s.
      wsClient.forceReconnect();
      // Give the reconnect cycle time to complete (3 s reconnect delay + margin)
      await sleep(4000);
      if (!isConnected.value) {
        console.warn('[useChatSession] Reconnect did not complete in time');
        return;
      }
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
    chatStore.clearMessages();
    messages.value = [];
    hasMoreHistory.value = false;
    void chatDB.clear();
  }

  async function loadMore(): Promise<void> {
    if (isLoadingHistory.value || !hasMoreHistory.value) return;
    isLoadingHistory.value = true;
    try {
      const oldest = messages.value[0];
      if (!oldest) return;
      const older = await chatDB.getOlder(oldest.timestamp, PAGE_SIZE);
      if (older.length > 0) {
        const chatMsgs = older.map(toChatMessage);
        messages.value = [...chatMsgs, ...messages.value];
      }
      if (older.length < PAGE_SIZE) {
        hasMoreHistory.value = false;
      } else {
        hasMoreHistory.value = await chatDB.hasOlder(older[0]!.timestamp);
      }
    } catch (err) {
      console.error('[useChatSession] loadMore failed', err);
    } finally {
      isLoadingHistory.value = false;
    }
  }

  async function getDateList(): Promise<ChatDateEntry[]> {
    return chatDB.getDateList();
  }

  async function loadDateMessages(dateTimestamp: number): Promise<ChatMessage[]> {
    const d = new Date(dateTimestamp);
    d.setHours(0, 0, 0, 0);
    const start = d.getTime();
    d.setHours(23, 59, 59, 999);
    const end = d.getTime();
    const msgs = await chatDB.getByDateRange(start, end);
    return msgs.map(toChatMessage);
  }

  function destroy() {
    disconnect();
    chatDB.destroy();
  }

  // ==========================================================================
  // Message helpers
  // ==========================================================================

  function findOrCreateAssistantMessage(chatId: string, conversationId: string): ChatMessage {
    let msg = messages.value.findLast((m) => m.role === 'assistant' && !m.isFinished);
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
    let msg = messages.value.findLast((m) => m.role === 'user' && !m.isFinished);
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

  /**
   * End the current recording turn immediately (called on button release).
   * Sends inputAudioComplete to signal the server that audio input is done.
   * Does NOT transition to Idle — waits for server response (TTS playback).
   */
  function endTurn(): void {
    if (state.value !== ChatState.WaitingResponse && state.value !== ChatState.Active) {
      return;
    }
    // Stop recording
    recorder.stopRecording();
    // Send inputAudioComplete to server
    wsClient.sendAction(new WsInputAudioCompleteRequest(''));
    console.log('[useChatSession] endTurn — sent inputAudioComplete');
  }

  return {
    state,
    messages,
    isConnected,
    isMediaReady: recorder.isMediaReady,
    isWakeWordSupported: wakeWord.isSupported,
    isWakeWordListening: wakeWord.isListening,
    isRecording: recorder.isRecording,
    isAudioPlaying,
    hasMoreHistory,
    isLoadingHistory,
    connect,
    disconnect,
    wake,
    endTurn,
    interrupt,
    clearContext,
    loadMore,
    getDateList,
    loadDateMessages,
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

/** Strip non-serializable fields and undefined optionals for safe localStorage persistence */
function toPersisted(m: ChatMessage): PersistedChatMessage {
  const base: PersistedChatMessage = {
    id: m.id,
    role: m.role,
    text: m.text,
    isFinished: m.isFinished,
    isStreaming: m.isStreaming,
    timestamp: m.timestamp,
  };
  if (m.chatId !== undefined) base.chatId = m.chatId;
  if (m.conversationId !== undefined) base.conversationId = m.conversationId;
  return base;
}

/** Restore a PersistedChatMessage back to a full ChatMessage (for IndexedDB reads). */
function toChatMessage(pm: PersistedChatMessage): ChatMessage {
  const msg: ChatMessage = {
    id: pm.id,
    role: pm.role,
    text: pm.text,
    audioChunks: [],
    isFinished: pm.isFinished,
    isStreaming: false,
    timestamp: pm.timestamp,
  };
  if (pm.chatId !== undefined) msg.chatId = pm.chatId;
  if (pm.conversationId !== undefined) msg.conversationId = pm.conversationId;
  return msg;
}
