/**
 * Telemetry 启动插件
 *
 * 在 Quasar 应用启动时：
 * 1. 初始化 TelemetryStore
 * 2. 初始化 TelemetryEngine
 * 3. 注册 v-track 全局指令
 * 4. 注册路由守卫（自动采集页面事件）
 * 5. 监听 App 可见性变化（前后台切换）
 */

import { defineBoot } from '#q-app/wrappers';

import type { EngineState } from 'src/utils/telemetry/engine';
import type { PageEnterMeta } from 'src/types/api/telemetry';

import { vTrackDirective } from 'src/directives/track';
import { getTelemetryEngine } from 'src/utils/telemetry/engine';
import { useTelemetryStore } from 'stores/telemetry';
import { router } from 'src/router';

// ---------------------------------------------------------------------------
// 路由守卫状态
// ---------------------------------------------------------------------------

/** 当前页面进入时间（用于计算停留时长） */
let currentPageEnterTime = 0;
/** 当前页面路径 */
let currentPagePath = '';
/** 前一页面路径 */
let previousPagePath = '';

// ---------------------------------------------------------------------------
// Boot 插件
// ---------------------------------------------------------------------------

export default defineBoot(async ({ app }) => {
  // 1. 注册 v-track 全局指令
  app.directive('track', vTrackDirective);

  // 2. 初始化 TelemetryStore
  const telemetryStore = useTelemetryStore();
  telemetryStore.init();

  // 3. 初始化 TelemetryEngine
  const engine = getTelemetryEngine();

  // 提供 EngineState 的获取函数
  const getEngineState = (): EngineState => ({
    sessionId: telemetryStore.sessionId,
    deviceFingerprint: telemetryStore.deviceFingerprint,
    deviceId: telemetryStore.currentDeviceId,
    accessToken: telemetryStore.accessToken,
  });

  await engine.init(getEngineState);

  // 4. 注册路由守卫
  router.afterEach((to, from) => {
    // 忽略同一路由的 hash/query 变化
    if (to.path === from.path && from.path !== '') return;

    // 刷新活动时间
    telemetryStore.refreshActivity();

    // 上报上一页面离开事件
    if (currentPagePath && currentPageEnterTime > 0) {
      const duration = Date.now() - currentPageEnterTime;
      void engine.trackEvent(
        'page_leave',
        from.name?.toString() || from.path,
        from.path,
        '',
        undefined,
        duration,
      );
    }

    // 记录当前页面进入
    currentPageEnterTime = Date.now();
    previousPagePath = currentPagePath;
    currentPagePath = to.path;

    // 上报当前页面进入事件
    const enterMeta: PageEnterMeta = {
      enterTime: currentPageEnterTime,
      path: to.path,
      name: to.name?.toString() || null,
    };
    void engine.trackPageEnter(enterMeta, previousPagePath);
  });

  // 5. 监听 App 可见性变化
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Check session expiration BEFORE refreshing activity
      const wasExpired = telemetryStore.isSessionExpired;

      // Refresh activity (updates lastActivity + persists)
      telemetryStore.refreshActivity();

      // If session was expired, the refreshActivity already created a new session.
      // Emit app_resume event for the new session.
      if (wasExpired) {
        void engine.trackAppResume();
      }
    }
  });

  if (process.env.DEV) {
    console.debug('[Telemetry] Boot plugin initialized');
  }
});
