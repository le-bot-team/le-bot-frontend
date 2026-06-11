import type MockAdapter from 'axios-mock-adapter';

import { mockSuccess } from 'src/mock/utils';
import type { ChatSummaryData } from 'src/types/api/chat-summary';

/**
 * Pool of mock summaries keyed by day-of-month (modulo) to give different
 * content on different dates.  Dates whose day % 5 === 0 return null (no data)
 * so the empty state can be verified during development.
 */
const SUMMARY_POOL: Record<number, ChatSummaryData> = {
  1: {
    date: '',
    topics: ['安全自护', '社交沟通'],
    summaryParagraphs: [
      '今天小家伙接到了一个来自社区的健康回访电话，虽然一开始有点小困惑，但他很快学会了追问对方是谁，这份小小的警惕心真是长大了不少呢！',
    ],
    summaryBullets: [
      { quote: '你到底想干嘛？', context: '面对陌生来电，主动追问对方目的' },
      { quote: '你是谁？', context: '用简短问题确认对方身份，边界感萌芽' },
    ],
    growthSignal:
      '孩子开始对陌生人建立边界意识，会主动追问"你是谁""你想干嘛"，这是社会性发展的重要里程碑。',
    emotions: { happy: 0.1, curious: 0.35, excited: 0.0, calm: 0.3, frustrated: 0.25 },
    capabilities: ['边界感建立', '语言逻辑', '主动沟通'],
    interactionMinutes: 12,
  },
  2: {
    date: '',
    topics: ['恐龙', '太空', '自然科学'],
    summaryParagraphs: [
      '今天绵绵对恐龙和太空表现出浓厚的兴趣，不停地问乐宝关于恐龙灭绝和火箭发射的问题。',
    ],
    summaryBullets: [
      { quote: '恐龙为什么灭绝了？', context: '主动提出科学问题，展现强烈好奇心' },
      { quote: '火箭是怎么飞到月球的？', context: '对宇宙现象产生兴趣，开始构建科学认知' },
    ],
    growthSignal: '绵绵正在发展对自然科学的早期兴趣，通过提问和想象构建自己对宇宙的理解。',
    emotions: { happy: 0.3, curious: 0.45, excited: 0.15, calm: 0.1, frustrated: 0.0 },
    capabilities: ['科学探索', '主动提问', '想象力'],
    interactionMinutes: 18,
  },
  3: {
    date: '',
    topics: ['幼儿园', '好朋友', '合作游戏'],
    summaryParagraphs: ['绵绵今天聊了很多幼儿园的事情，分享了和好朋友一起玩积木的经历。'],
    summaryBullets: [
      {
        quote: '我和小明一起搭了一个超大的城堡！',
        context: '能描述合作游戏经历，社交能力发展良好',
      },
      { quote: '我画了一幅画，是今天的太阳', context: '用绘画记录日常，表达能力在提升' },
    ],
    growthSignal: '绵绵的社交圈正在扩大，能通过叙述和创作来处理和表达日常经历。',
    emotions: { happy: 0.45, curious: 0.15, excited: 0.2, calm: 0.2, frustrated: 0.0 },
    capabilities: ['社交协作', '语言表达', '创造力'],
    interactionMinutes: 15,
  },
  4: {
    date: '',
    topics: ['公主故事', '颜色认知', '叙事能力'],
    summaryParagraphs: ['今天绵绵沉浸在公主和魔法的世界里，给乐宝讲了一个关于彩虹城堡的故事。'],
    summaryBullets: [
      { quote: '公主穿着粉色加金色的裙子', context: '对颜色搭配有明确偏好，审美在发展' },
      { quote: '然后公主打开了门，发现了一道彩虹', context: '能组织有逻辑结构的虚构故事' },
    ],
    growthSignal: '绵绵的叙事能力在快速发展，已经能组织有逻辑结构的虚构故事。',
    emotions: { happy: 0.4, curious: 0.2, excited: 0.25, calm: 0.15, frustrated: 0.0 },
    capabilities: ['叙事能力', '审美发展', '想象力'],
    interactionMinutes: 20,
  },
};

/**
 * Register mock handlers for the chat summary module:
 *   GET /chat/summary?deviceId=...&date=YYYY-MM-DD
 */
export function setupChatSummaryMock(mock: MockAdapter): void {
  mock.onGet('/chat/summary').reply((config) => {
    const dateStr = (config.params?.date as string | undefined) ?? '';

    // Parse the date to determine which mock data to return
    const dayNum = parseInt(dateStr.split('-')[2] ?? '1', 10);

    // Every 5th day returns null (no data) for empty-state testing
    if (dayNum % 5 === 0) {
      return [200, mockSuccess(null)];
    }

    // Pick a summary from the pool (cycle through 1–4)
    const key = ((dayNum - 1) % 4) + 1;
    const template = SUMMARY_POOL[key]!;
    const data: ChatSummaryData = { ...template, date: dateStr };

    return [200, mockSuccess(data)];
  });
}
