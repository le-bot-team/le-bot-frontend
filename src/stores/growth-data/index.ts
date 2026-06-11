/**
 * Growth Data Store
 *
 * 管理成长数据中心周报数据的状态、加载和错误。
 * 页面通过此 store 获取 API 数据，避免直接调用 API。
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

import { fetchGrowthWeeklyReport } from 'src/utils/api/growth-data';
import type { GrowthWeeklyReportData } from 'src/types/api/growth-data';

import { useAuthStore } from 'stores/auth';
import { useDeviceStore } from 'stores/device';

export const useGrowthDataStore = defineStore('growth-data', () => {
  // ─── State ────────────────────────────────────────────────────────────────────
  const report = ref<GrowthWeeklyReportData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isEmpty = ref(false);

  // ─── Actions ──────────────────────────────────────────────────────────────────

  /**
   * 获取指定周的成长报告。
   *
   * @param weekStart 周一日期 YYYY-MM-DD；若不传则自动使用当前设备 ID。
   */
  async function fetchReport(weekStart: string): Promise<void> {
    const authStore = useAuthStore();
    const deviceStore = useDeviceStore();

    const token = authStore.accessToken;
    const deviceId = deviceStore.currentDeviceId;

    if (!token) {
      error.value = '未登录，无法获取成长数据';
      return;
    }
    if (!deviceId) {
      error.value = '未绑定设备，无法获取成长数据';
      return;
    }

    loading.value = true;
    error.value = null;
    isEmpty.value = false;

    try {
      const response = await fetchGrowthWeeklyReport(token, deviceId, weekStart);
      const body = response.data;

      if (body.success && body.data) {
        report.value = body.data;
      } else if (body.success && !body.data) {
        // API 成功但无数据 → 空状态（非错误）
        report.value = null;
        isEmpty.value = true;
      } else {
        report.value = null;
        error.value = body.message ?? '获取成长报告失败';
      }
    } catch (err: unknown) {
      report.value = null;
      const msg = err instanceof Error ? err.message : '网络请求失败，请稍后重试';
      error.value = msg;
      console.error('[GrowthData] fetchReport error:', err);
    } finally {
      loading.value = false;
    }
  }

  /** 清空当前报告数据（切换设备或登出时调用） */
  function clearReport() {
    report.value = null;
    error.value = null;
    isEmpty.value = false;
    loading.value = false;
  }

  return {
    report,
    loading,
    error,
    isEmpty,
    fetchReport,
    clearReport,
  };
});
