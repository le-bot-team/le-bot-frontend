/**
 * useTracker — 命令式遥测事件上报 Composable
 *
 * 提供在组件内部灵活上报自定义事件的能力，
 * 适用于 v-track 指令无法覆盖的复杂场景：
 * - API 调用成功/失败
 * - 异步流程完成
 * - 复合交互（如多步骤表单完成）
 * - 转化漏斗节点
 */

import type { ConversionNode } from 'src/types/api/telemetry';

import { getTelemetryEngine } from 'src/utils/telemetry/engine';
import { useTelemetryStore } from 'stores/telemetry';

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

export function useTracker() {
  const telemetryStore = useTelemetryStore();
  const engine = getTelemetryEngine();

  /**
   * 上报点击事件
   *
   * @param eventName 事件名称
   * @param data 事件数据
   */
  function trackClick(eventName: string, data?: Record<string, unknown>): void {
    telemetryStore.refreshActivity();
    void engine.trackClick(eventName, data);
  }

  /**
   * 上报自定义业务事件
   *
   * @param eventName 事件名称
   * @param data 事件数据
   */
  function trackCustom(eventName: string, data?: Record<string, unknown>): void {
    telemetryStore.refreshActivity();
    void engine.trackCustom(eventName, data);
  }

  /**
   * 上报转化节点事件（不受采样率影响，始终全量）
   *
   * @param node 转化节点枚举值
   * @param data 附加数据
   */
  function trackConversion(node: ConversionNode, data?: Record<string, unknown>): void {
    telemetryStore.refreshActivity();
    void engine.trackConversion(node, data);
  }

  /**
   * 上报 App 恢复前台事件
   */
  function trackAppResume(): void {
    telemetryStore.createNewSession(); // 恢复前台创建新 session
    void engine.trackAppResume();
  }

  return {
    trackClick,
    trackCustom,
    trackConversion,
    trackAppResume,
  };
}
