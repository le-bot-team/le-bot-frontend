/**
 * Growth Data API 客户端
 *
 * 获取成长数据中心周报数据，复用现有 axios 实例。
 */

import { api } from 'boot/axios';

import type { GrowthWeeklyReportResponse } from 'src/types/api/growth-data';

/**
 * 获取指定设备某周的成长报告。
 *
 * GET /growth/weekly-report?deviceId=...&weekStart=YYYY-MM-DD
 *
 * @param accessToken 用户访问令牌
 * @param deviceId    设备 ID
 * @param weekStart   周一日期 YYYY-MM-DD
 * @returns 成长周报数据
 */
export const fetchGrowthWeeklyReport = async (
  accessToken: string,
  deviceId: string,
  weekStart: string,
) =>
  await api.get<GrowthWeeklyReportResponse>('/growth/weekly-report', {
    params: { deviceId, weekStart },
    headers: { 'x-access-token': accessToken },
  });
