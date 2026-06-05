<script setup lang="ts">
/**
 * MemberCard — 可复用的成员卡片组件
 *
 * 展示单个家庭成员的摘要信息（头像 + 名称 + 元信息），
 * 支持点击跳转和创建者标识。
 */

import type { FamilyMember } from 'stores/family-group/types';
import boyAvatarUrl from 'src/assets/lanhu/child-edit/boy-avatar.png';
import girlAvatarUrl from 'src/assets/lanhu/child-edit/girl-avatar.png';

const props = defineProps<{
  member: FamilyMember;
}>();

const emit = defineEmits<{
  (e: 'click', member: FamilyMember): void;
}>();

/** 根据成员类型获取头像（优先 childInfo.avatar，fallback 性别默认头像） */
function getAvatar(): string {
  if (props.member.memberType === 'child' && props.member.childInfo) {
    return (
      props.member.childInfo.avatar ||
      (props.member.childInfo.gender === 'girl' ? girlAvatarUrl : boyAvatarUrl)
    );
  }
  return props.member.avatar || boyAvatarUrl;
}

/** 获取元信息文本 */
function getMetaText(): string {
  if (props.member.memberType === 'child' && props.member.childInfo) {
    const gender = props.member.childInfo.gender === 'girl' ? '女' : '男';
    const birthday = props.member.childInfo.birthday;
    let age = '';
    if (birthday) {
      const birth = new Date(birthday);
      if (!isNaN(birth.getTime())) {
        const now = new Date();
        let ageNum = now.getFullYear() - birth.getFullYear();
        if (
          now.getMonth() < birth.getMonth() ||
          (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
        )
          ageNum--;
        age = ` ${Math.max(0, ageNum)}岁`;
      }
    }
    return `${gender}${age}`;
  }

  // 成人显示角色
  const roleMap: Record<string, string> = {
    father: '爸爸',
    mother: '妈妈',
    grandpa: '爷爷',
    grandma: '奶奶',
    paternal_grandmother: '奶奶(祖母)',
    maternal_grandfather: '外公',
    maternal_grandma: '外婆',
    friend: '朋友',
    other: '其他',
  };
  return roleMap[props.member.role ?? ''] ?? '-';
}
</script>

<template>
  <button class="member-card" type="button" @click="emit('click', member)">
    <img :src="getAvatar()" alt="" class="member-card__avatar" />
    <div class="member-card__body">
      <span class="member-card__name">
        {{ member.memberType === 'child' ? member.childInfo?.name : member.nickname }}
      </span>
      <span class="member-card__meta">{{ getMetaText() }}</span>
    </div>
    <!-- 创建者标识 -->
    <q-icon
      v-if="member.isCreator && member.memberType !== 'child'"
      name="star"
      size="14px"
      class="member-card__badge"
    />
    <q-icon v-else name="chevron_right" size="16px" class="member-card__arrow" />
  </button>
</template>

<style scoped lang="scss">
.member-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 20px;
  background: var(--clr-white);
  border: 1.5px solid rgba(200, 200, 210, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover,
  &:active {
    border-color: rgba(32, 204, 249, 0.4);
  }
}

.member-card__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.member-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  text-align: left;
}

.member-card__name {
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 400;
  color: var(--clr-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-card__meta {
  font-size: 13px;
  color: var(--clr-caption);
}

.member-card__badge,
.member-card__arrow {
  flex-shrink: 0;
}

.member-card__badge {
  color: #ffb800;
}

.member-card__arrow {
  color: #c4c4cc;
}
</style>
