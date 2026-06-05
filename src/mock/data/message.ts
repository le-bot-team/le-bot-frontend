import type { ActivityDetail, MessageItem } from 'src/types/api/message';

/**
 * Mock messages covering all three types: notification, emotion, activity.
 * Uses slice asset paths as icons.
 */
export const MOCK_MESSAGES: MessageItem[] = [
  {
    id: 'msg-001',
    type: 'notification',
    title: '新的通知',
    content: '您有一条新的通知，请前往查看',
    isRead: false,
    createdAt: '2025-06-05T10:30:00Z',
  },
  {
    id: 'msg-002',
    type: 'emotion',
    title: '情绪不佳',
    content: '监测到长期情绪不佳，建议多与乐宝互动',
    isRead: false,
    createdAt: '2025-06-04T14:20:00Z',
    emotionLevel: 'bad',
    relatedChildId: 'child-001',
    relatedChildName: '小新',
  },
  {
    id: 'msg-003',
    type: 'notification',
    title: '通知标题',
    content: '这里是通知的内容说明',
    isRead: true,
    createdAt: '2025-06-03T09:15:00Z',
  },
  {
    id: 'msg-004',
    type: 'activity',
    title: '新用户会员已发放',
    content: '可在会员中心查看哦！',
    isRead: true,
    createdAt: '2025-06-01T16:00:00Z',
  },
];

/**
 * Mock activity details for the activity messages page.
 */
export const MOCK_ACTIVITIES: ActivityDetail[] = [
  {
    id: 'act-001',
    title: '会员日，优惠限今日',
    image: '',
    content:
      '乐宝会员日专属福利来啦！今日购买乐宝机器人底座配饰享8折优惠，还有更多限量周边等你来抢。活动期间下单即送精美贴纸套装一份，数量有限，先到先得！',
    startDate: '2025-06-01T00:00:00Z',
    endDate: '2025-06-01T23:59:59Z',
    status: 'ended',
  },
  {
    id: 'act-002',
    title: '夏日亲子互动挑战',
    image: '',
    content:
      '参加夏日亲子互动挑战，每天与乐宝完成一个趣味任务，连续打卡7天即可获得限量版乐宝外壳。任务包括：讲故事、唱歌、画画等，让陪伴更有意义！',
    startDate: '2025-06-10T00:00:00Z',
    endDate: '2025-06-30T23:59:59Z',
    status: 'upcoming',
  },
  {
    id: 'act-003',
    title: '乐宝新功能上线',
    image: '',
    content:
      '乐宝新增多语言对话功能！现在支持中文、英文、粤语三种语言，可在设置中切换。让孩子在玩乐中学习新语言，开启国际化视野。',
    startDate: '2025-05-20T00:00:00Z',
    endDate: '2025-07-20T23:59:59Z',
    status: 'ongoing',
  },
];
