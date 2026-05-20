/**
 * TelemetryStore — 遥测系统 Pinia Store
 *
 * 管理 sessionId、设备指纹、当前设备 ID 等遥测运行时状态。
 * 为 TelemetryEngine 提供 EngineState 数据。
 */

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { getDeviceFingerprint } from 'src/utils/telemetry/fingerprint';
import { useAuthStore } from 'stores/auth';
import { useDeviceStore } from 'stores/device';

// ---------------------------------------------------------------------------
// Session 管理
// ---------------------------------------------------------------------------

/** Session 过期时间：30 分钟无活动视为新会话 */
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

const SESSION_STORAGE_KEY = 'lebot_telemetry_session';

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useTelemetryStore = defineStore(
  'telemetry',
  () => {
    // ----- State -----

    /** 会话 ID（单次访问期间不变） */
    const sessionId = ref<string>('');

    /** 会话开始时间 */
    const sessionStart = ref<number>(0);

    /** 最后活动时间 */
    const lastActivity = ref<number>(0);

    /** 设备指纹 */
    const deviceFingerprint = ref<string>('');

    // ----- Computed -----

    /** 当前设备 ID（来自 deviceStore） */
    const currentDeviceId = computed<string | null>(() => {
      const deviceStore = useDeviceStore();
      return deviceStore.currentDevice?.id ?? null;
    });

    /** 当前 accessToken（来自 authStore） */
    const accessToken = computed<string>(() => {
      const authStore = useAuthStore();
      return authStore.accessToken ?? '';
    });

    /** 会话是否过期 */
    const isSessionExpired = computed(() => {
      return Date.now() - lastActivity.value > SESSION_TIMEOUT_MS;
    });

    // ----- Actions -----

    /** 初始化遥测 Store */
    function init(): void {
      // 生成设备指纹
      if (!deviceFingerprint.value) {
        deviceFingerprint.value = getDeviceFingerprint();
      }

      // 恢复或创建 session
      restoreOrCreateSession();
    }

    /** 刷新 session（每次用户活动时调用） */
    function refreshActivity(): void {
      // Check expiration based on the PREVIOUS lastActivity before updating
      const expired = Date.now() - lastActivity.value > SESSION_TIMEOUT_MS;

      // Update activity timestamp
      lastActivity.value = Date.now();

      // Persist updated lastActivity to sessionStorage
      persistLastActivity();

      // If session was expired, create a new one
      if (expired) {
        createNewSession();
      }
    }

    /** Persist lastActivity to sessionStorage */
    function persistLastActivity(): void {
      try {
        const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.lastActivity = lastActivity.value;
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(parsed));
        }
      } catch {
        // sessionStorage not available, ignore
      }
    }

    /** 创建新会话 */
    function createNewSession(): void {
      sessionId.value = generateSessionId();
      sessionStart.value = Date.now();
      lastActivity.value = Date.now();

      // 持久化到 sessionStorage（标签页隔离）
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
          sessionId: sessionId.value,
          sessionStart: sessionStart.value,
          lastActivity: lastActivity.value,
        }));
      } catch {
        // sessionStorage 不可用时忽略
      }
    }

    // ----- 内部方法 -----

    /** 恢复或创建 session */
    function restoreOrCreateSession(): void {
      try {
        const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.sessionId && parsed.sessionStart) {
            // 检查是否过期
            if (Date.now() - parsed.lastActivity < SESSION_TIMEOUT_MS) {
              sessionId.value = parsed.sessionId;
              sessionStart.value = parsed.sessionStart;
              lastActivity.value = parsed.lastActivity;
              return;
            }
          }
        }
      } catch {
        // 恢复失败，创建新 session
      }

      createNewSession();
    }

    /** 生成 session ID */
    function generateSessionId(): string {
      // 使用时间戳 + 随机数生成
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).slice(2, 10);
      return `sess_${timestamp}_${random}`;
    }

    return {
      sessionId,
      sessionStart,
      lastActivity,
      deviceFingerprint,
      currentDeviceId,
      accessToken,
      isSessionExpired,
      init,
      refreshActivity,
      createNewSession,
    };
  },
  {
    // 仅持久化设备指纹，session 用 sessionStorage 管理
    persist: {
      pick: ['deviceFingerprint'],
    },
  },
);
