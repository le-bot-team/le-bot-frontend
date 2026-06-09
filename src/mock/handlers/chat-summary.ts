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
    topics: ['小白', '红蝎子队', '动感超人', '娜娜子姐姐', '妈妈'],
    summaryParagraphs: [
      '绵绵喜欢编故事，也喜欢扮演角色。绵绵常常把自己想象成"能跳1300尺高""踩着筋斗云"的小英雄，也会为"被关在盒子里的宝宝"着急，为"被海蛇吞掉的医生"想办法救援。',
    ],
    summaryBullets: [
      '喜欢动物：特别是绵绵养的小猫"小丸子"。能细致地描述小丸子的外貌、习惯、甚至它"粉粉的鼻子""黑溜溜的眼睛"。',
      '对家庭生活充满好奇：比如帮妈妈剥大蒜、关心妈妈被蚊子咬、想象妈妈做饭的细节。',
      '对"正义"有初步理解：喜欢扮演警察抓坏蛋，关心"坏人会不会被抓到"。',
    ],
    growthSignal:
      '绵绵正处于象征游戏的高峰期，通过角色扮演和虚构情节，她在学习理解世界、表达情绪、建立道德观念。',
  },
  2: {
    date: '',
    topics: ['恐龙', '太空', '火箭', '星星'],
    summaryParagraphs: [
      '今天绵绵对恐龙和太空表现出浓厚的兴趣，不停地问乐宝关于恐龙灭绝和火箭发射的问题。',
    ],
    summaryBullets: [
      '科学好奇心：主动提问"恐龙为什么灭绝了"，"火箭是怎么飞到月球的"。',
      '想象力丰富：编了一个"小恐龙坐火箭去星星"的故事。',
    ],
    growthSignal:
      '绵绵正在发展对自然科学的早期兴趣，通过提问和想象构建自己对宇宙的理解。',
  },
  3: {
    date: '',
    topics: ['幼儿园', '好朋友', '画画', '积木'],
    summaryParagraphs: [
      '绵绵今天聊了很多幼儿园的事情，分享了和好朋友一起玩积木的经历。',
    ],
    summaryBullets: [
      '社交能力发展：能描述与同伴的合作游戏，有明确的"好朋友"概念。',
      '动手能力：喜欢搭积木，能搭建"城堡"和"大桥"。',
      '表达能力：用画画来记录今天发生的事情。',
    ],
    growthSignal: '绵绵的社交圈正在扩大，能通过叙述和创作来处理和表达日常经历。',
  },
  4: {
    date: '',
    topics: ['公主', '城堡', '魔法棒', '彩虹'],
    summaryParagraphs: [
      '今天绵绵沉浸在公主和魔法的世界里，给乐宝讲了一个关于彩虹城堡的故事。',
    ],
    summaryBullets: [
      '审美发展：对颜色搭配有偏好，喜欢"粉色加金色"的组合。',
      '叙事能力：能讲出有开头、中间和结尾的完整小故事。',
    ],
    growthSignal: '绵绵的叙事能力在快速发展，已经能组织有逻辑结构的虚构故事。',
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
