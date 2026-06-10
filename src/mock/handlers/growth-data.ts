/**
 * Growth Data Mock Handler
 *
 * 为成长数据中心页面提供 Mock 数据，确保无后端时仍可正常渲染。
 * 返回与当前页面完全一致的静态 Mock 数据。
 */

import type MockAdapter from 'axios-mock-adapter';

import type { MockSetupFn } from 'src/mock/utils';
import type { GrowthWeeklyReportData } from 'src/types/api/growth-data';

const MOCK_REPORT: GrowthWeeklyReportData = {
  weekStart: '2025-05-12',
  weekEnd: '2025-05-18',
  accompanyHours: 105,
  weeklyInteractionMinutes: 276,
  bestCapability: '社交理解力',
  emotionAverage: '开心',
  dailyInteraction: [
    { date: '5.12', minutes: 60 },
    { date: '5.13', minutes: 35 },
    { date: '5.14', minutes: 30 },
    { date: '5.15', minutes: 25 },
    { date: '5.16', minutes: 75 },
    { date: '5.17', minutes: 10 },
    { date: '5.18', minutes: 45 },
  ],
  capabilities: [
    { name: '社交理解力', value: 38, max: 50 },
    { name: '逻辑思维力', value: 32, max: 50 },
    { name: '语言表达力', value: 20, max: 50 },
    { name: '创造想象力', value: 22, max: 50 },
    { name: '知识整合度', value: 30, max: 50 },
  ],
  emotionTimeline: [
    { date: '5.12', emotion: 'happy' },
    { date: '5.13', emotion: 'delighted' },
    { date: '5.14', emotion: 'delighted' },
    { date: '5.15', emotion: 'calm' },
    { date: '5.16', emotion: 'worried' },
    { date: '5.17', emotion: 'calm' },
    { date: '5.18', emotion: 'sad' },
  ],
  hotTopics: [
    { name: '过家家', percentage: 37 },
    { name: '植物大战僵尸', percentage: 20 },
    { name: '奥特曼', percentage: 19 },
    { name: '画画', percentage: 11 },
    { name: '其他', percentage: 13 },
  ],
  summaries: {
    chatSummary: '本周高频话题为"过家家"，占 37%。建议多引导进行创意角色扮演，丰富想象空间。',
    capabilitySummary:
      '知识拓展：通过绘本或科学实验引导其关注现实世界的物理现象，平衡幻想与现实认知。乐宝后续将从知识整合等方向跟儿童进行聊天，引导儿童完成能力的提升。',
    interactionSummary: '本周互动时长达 276 分钟，相比上周有所提升，继续保持~',
    emotionSummary: '近期情绪状态都很好哦，继续保持~',
  },
};

export const setupGrowthDataMock: MockSetupFn = (mock: MockAdapter) => {
  // GET /growth/weekly-report — 成长周报数据
  // 添加 ?empty=true 参数可触发空状态（用于开发调试）
  mock.onGet('/growth/weekly-report').reply((config) => {
    const isEmpty = config.params?.empty === 'true';
    if (isEmpty) {
      return [200, { success: true, data: null }];
    }
    return [200, { success: true, data: MOCK_REPORT }];
  });
};
