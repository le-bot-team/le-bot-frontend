---
name: family-member-management-flow
overview: 设计并整理家庭成员管理的完整流程：包括初始成员组成（APP用户+儿童）、邀请二维码流程、以及各角色的数据模型和交互逻辑。
design:
  styleKeywords:
    - Clean Minimalism
    - Mobile First
    - Card-based Layout
    - Brand Primary Accent
    - Rounded Corners
    - Smooth Transitions
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 20px
      weight: 600
    subheading:
      size: 16px
      weight: 500
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#20CCF9"
      - "#0DB4E0"
---

## 产品概述

设计并整理 leBot 前端项目中**家庭组成员管理的完整业务流程**，明确成员类型、来源方式、以及各角色在系统中的生命周期。

## 核心功能

### 成员模型定义

家庭组包含以下三种成员类型：

**1. 创建者/户主（Owner）— APP 注册用户**

- 通过邮箱验证码注册并完成个人资料设置的用户
- 在 SetupProfilePanel 中填写：头像、昵称、生日、与孩子的关系
- 自动成为家庭组的创建者和管理者
- 拥有邀请成员、管理儿童信息、删除成员等权限

**2. 儿童（Child）— 虚拟设备关联**

- 不具备独立 APP 账号，作为虚拟设备的使用者存在
- 在 ChildEditPage（创建模式）中填写：性别、姓名、生日
- 与虚拟设备（DeviceInfo）通过 childInfo 字段关联
- 数据当前仅前端存储，后端暂不处理
- 一个家庭组可包含多个儿童（每个儿童对应一个虚拟设备）

**3. 被邀请成员（Invited Member）— 二维码扫码加入**

- 已注册 APP 的其他用户，通过扫描创建者分享的二维码加入家庭组
- 加入时需选择自己在该家庭中的身份角色（如：爸爸/妈妈/爷爷/奶奶等）
- 加入后可在 MemberPage 查看个人信息，支持被创建者移除

### 完整业务流程

```
阶段一：注册与初始化
  新用户注册(邮箱+验证码) 
    → 设置密码 
    → 完善个人信息(昵称/生日/与孩子关系)  ← 此时用户成为 Owner
    → 添加虚拟设备/填写儿童信息(性别/姓名/生日) ← 此时创建 FamilyGroup，Child 关联 Device
    → 进入家庭组列表页

阶段二：邀请成员
  Owner 进入家庭组详情页 
    → 点击"邀请成员" 
    → 系统生成邀请二维码(含 groupId + inviteCode + 过期时间) 
    → 分享二维码图片或直接分享到微信

阶段三：扫码加入
  其他已注册用户打开 APP 扫描二维码 / 点击分享链接
    → 解析邀请信息(groupId, inviterInfo)
    → 确认加入弹窗(显示家庭组名称、邀请人、选择自己的角色)
    → 确认后加入家庭组
    → 成为该家庭组的普通成员

阶段四：成员管理
  Owner 可查看所有成员列表
  → 点击儿童卡片: 编辑儿童信息(性别/姓名/生日)
  → 点击成人卡片: 查看成员详情(称呼/性别/身份/生日/声纹)/删除成员
  → 继续邀请新成员(重复阶段二)
```

### 关键约束与边界条件

- 一个用户可以同时属于多个不同的家庭组
- 邀请二维码应有有效期（建议 7 天），过期需重新生成
- 家庭组成员数量上限（建议不超过 10 人）
- 创建者不可自行退出/删除自己，只能转移管理员权限
- 被邀请成员可主动退出家庭组
- 删除儿童信息时同步解除其与虚拟设备的关联

## 技术栈

- **前端框架**: Vue 3 Composition API + Quasar Framework (已有项目基础)
- **状态管理**: Pinia (遵循现有 stores/device 和 stores/profile 的模式)
- **类型系统**: TypeScript (类型定义放在 src/types/api/ 和 src/stores/*/types.ts)
- **API 层**: Axios 封装 (遵循现有 src/utils/api/*.ts 的函数式导出模式)
- **国际化**: i18nSubPath 工具函数 (遵循现有多语言方案)

## 技术架构

### 数据流设计

```
┌──────────────────────────────────────────────────────┐
│                    FamilyGroupStore                   │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐ │
│  │ groups[] │  │ currentGroup│  │ members[]          │ │
│  │ (列表数据)│  │ (当前选中) │  │ (当前组成员列表)     │ │
│  └────┬─────┘  └─────┬────┘  └──────────┬──────────┘ │
│       │              │                    │           │
│       ▼              ▼                    ▼           │
│  ┌─────────────────────────────────────────────────┐ │
│  │            family-group API Layer               │ │
│  │  fetchGroups / fetchDetail / fetchMembers      │ │
│  │  generateInviteQR / acceptInvite / removeMember │ │
│  │  updateChildInfo / addChild / removeChild       │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
         ▲                           ▲
         │                           │
  ┌──────┴──────┐             ┌──────┴──────┐
  │   Pages     │             │ Components  │
  │ FamilyGroup │             │ (复用现有)   │
  │ Detail      │             │ BirthdayPicker│
  │ Invite      │             │ CropperDialog │
  │ Member      │             └──────────────┘
  │ ChildEdit   │
  └─────────────┘
```

### 核心类型体系设计

```typescript
// === 成员角色枚举 ===
type FamilyMemberRole = 
  | 'owner'          // 创建者(APP注册用户)
  | 'father' | 'mother' | 'grandpa' | 'grandma'  // 家庭角色
  | 'friend' | 'other';  // 其他亲属/朋友

// === 成员实体 ===
interface FamilyMember {
  id: string;
  userId?: string;        // 有APP账号的成员才有userId
  nickname: string;       // 显示名称
  avatar?: string;        // 头像
  role: FamilyMemberRole;
  gender?: 'male' | 'female';
  birthday?: string;
  
  // 区分成员类型的关键字段
  memberType: 'user' | 'child';     // user=有APP账号, child=儿童
  
  // 仅 child 类型
  childInfo?: { name: string; gender: 'boy' | 'girl'; birthday: string };
  deviceId?: string;                // 关联的虚拟设备ID
  
  // 仅 user 类型
  hasVoiceprint?: boolean;          // 是否录入声纹
  voiceprintPersonId?: string;
  
  joinedAt: string;                 // 加入时间
}

// === 家庭组 ===
interface FamilyGroup {
  id: string;
  name: string;                     // 通常以儿童名字命名, 如"小新的家庭组"
  ownerId: string;
  createdAt: string;
  memberCount: number;
  childDeviceId?: string;           // 主关联设备ID
}

// === 邀请信息 ===
interface InviteCode {
  code: string;
  groupId: string;
  groupName: string;
  inviterNickname: string;
  inviterAvatar?: string;
  expiresAt: string;
  qrImageUrl?: string;              // 二维码图片URL
}
```

### API 接口规划（待后端实现）

| 函数名 | 方法 | 路径 | 功能 |
| --- | --- | --- | --- |
| `fetchFamilyGroups` | GET | `/family-groups/mine` | 获取我的家庭组列表 |
| `fetchGroupDetail` | GET | `/family-groups/:id` | 获取家庭组详情 |
| `fetchGroupMembers` | GET | `/family-groups/:id/members` | 获取成员列表 |
| `createFamilyGroup` | POST | `/family-groups` | 创建家庭组(添加儿童时自动触发) |
| `generateInviteCode` | POST | `/family-groups/:id/invite` | 生成邀请码+二维码 |
| `acceptInvite` | POST | `/family-groups/:id/join` | 接受邀请加入 |
| `removeMember` | DELETE | `/family-groups/:id/members/:memberId` | 移除成员 |
| `leaveGroup` | POST | `/family-groups/:id/leave` | 主动退出 |
| `updateChildInfo` | PUT | `/family-groups/:id/children/:childId` | 更新儿童信息 |


## 实施要点

### 目录结构

```
src/
├── types/api/
│   └── family-group.ts          # [NEW] 家庭组相关API请求/响应类型定义
├── utils/api/
│   └── family-group.ts          # [NEW] 家庭组API调用层
├── stores/
│   └── family-group/
│       ├── index.ts             # [NEW] FamilyGroup Store (Pinia)
│       └── types.ts             # [NEW] FamilyGroup/Member/InviteCode 类型
├── pages/stack/family-group/
│   ├── DetailPage.vue           # [MODIFY] 替换Mock为Store数据
│   ├── MemberPage.vue           # [MODIFY] 替换Mock为Store数据
│   ├── InvitePage.vue           # [MODIFY] 接入真实二维码生成+分享功能
│   ├── ChildEditPage.vue        # [MODIFY] 创建完成后调用createFamilyGroup API
│   └── JoinConfirmDialog.vue    # [NEW] 扫码确认加入弹窗组件
├── components/family-group/
│   └── MemberCard.vue           # [NEW] 可复用的成员卡片组件
├── router/routes.ts             # [MODIFY] 新增扫码加入路由(可选全局监听)
└── i18n/zh-CN/index.ts          # [MODIFY] 补充家庭组相关i18n文案
```

### 关键实施注意事项

1. **向后兼容**: 当前页面均为 Mock 数据，接入真实数据时应保持页面结构不变，仅替换数据源
2. **ChildInfo 复用**: ChildInfo 类型已在 `stores/device/types.ts` 定义，FamilyGroup 中的儿童信息应与之保持一致或直接引用
3. **二维码策略**: 当前 InvitePage 使用 mdi-qrcode 占位图标，后续需对接后端生成的 QR 图片 URL 或使用前端 qrcode 库本地生成
4. **扫码入口**: 除了 InvitePage 的分享场景，还需要考虑全局扫码入口（启动页/首页扫码按钮），用于被邀请用户打开 APP 后扫码加入
5. **权限控制**: Owner 和普通成员的操作权限不同（删除成员、邀请成员等操作仅 Owner 可见）
6. **关系映射**: SetupProfilePanel 中的 relationship 字段（"妈妈"/"爸爸"等）应映射到 FamilyMember.role 字段，确保一致性

## 设计风格

基于 Quasar Framework 的移动端优先设计风格，延续项目已有的简洁、现代的视觉语言。整体采用浅色背景 + 白色卡片的层次化布局，配合品牌主色作为强调色。

## 页面规划

### 页面一：家庭组详情页（DetailPage）改进

- **顶部导航栏**: 返回按钮 + "家庭组"标题（复用 StackHeader）
- **成员列表区域**: 白色圆角卡片纵向排列，每张卡片展示成员头像(圆形)、名称、元信息（儿童显示"男/女 X岁"，成人显示角色标签）、右箭头指示器
- Owner 卡片增加小皇冠/管理员标识
- 儿童卡片用差异化配色区分于成人
- 卡片点击区域完整覆盖，带轻微按压反馈
- **底部固定操作区**: "邀请成员"主按钮（品牌色填充，圆角28px），仅在 Owner 角色下可见
- **空状态**: 无成员时显示引导提示 + "添加儿童"快捷入口

### 页面二：邀请成员页（InvitePage）完善

- **标题区**: "扫码加入家庭组"居中显示
- **二维码展示区**: 240x240 圆角白色容器，内嵌真实二维码图片（替代当前占位图标），下方显示有效期倒计时提示
- **分享提示**: "直接分享到微信聊天"
- **分享操作栏**: 分享按钮 + 复制链接按钮 + "重新生成"刷新按钮（次要操作）

### 页面三：扫码加入确认弹窗（JoinConfirmDialog）— 全局组件

- **半透明遮罩层**: 点击外部不关闭（重要操作需明确意图）
- **内容卡片**: 居中白色圆角卡片
- 邀请人信息行（头像 + 昵称 + "邀请您加入"文字）
- 家庭组名称（加粗大字）
- 角色选择区：网格排列的角色选项（妈妈/爸爸/奶奶/爷爷/外婆/外公/朋友/其他亲属），单选 Chip 样式，复用 SetupProfilePanel 的关系选择交互
- 底部双按钮："取消"（次按钮）+ "确认加入"（主按钮，品牌色）
- **动画**: 从底部滑入的过渡动画（300ms ease-out）

### 页面四：成员信息页（MemberPage）完善

- **顶部**: 成员大头像（80px圆形）+ 昵称 + 角色标签 Badge
- **信息卡片**: 结构化展示——称呼、性别、身份角色、生日、加入时间
- **声纹信息行**（如有声纹）：可点击跳转声纹详情
- **危险操作区**: 底部红色"移除成员"按钮（仅 Owner 可见），点击后弹出二次确认 Dialog

### 页面五：儿童编辑页（ChildEditPage）改进

- 保持现有的三步问答式布局不变（性别选择 → 姓名 → 生日）
- **创建模式增强**: 提交成功后除了 notify 提示，还需触发 FamilyGroup 创建逻辑
- **编辑模式增强**: 保存后同步更新 FamilyGroupStore 中的 childInfo 数据