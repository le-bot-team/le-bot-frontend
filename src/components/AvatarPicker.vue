<script setup lang="ts">
/**
 * AvatarPicker — 儿童头像选择器
 *
 * 支持两种方式：
 * 1. 上传自定义头像（调用 POST /upload/avatar，后端未就绪时 fallback 为 base64 预览）
 * 2. 选择系统默认头像（来自 src/assets/default-avatars/，通过 shared utility 加载）
 *
 * Props:
 *   modelValue: string | undefined — 当前选中的头像 URL 或路径
 *   gender: 'boy' | 'girl' — 用于过滤默认头像列表
 */

import { computed, ref, watch } from 'vue';

import { uploadAvatar } from 'src/utils/api/upload';
import { useAuthStore } from 'stores/auth';
import { i18nSubPath } from 'src/utils/common';
import {
  childAvatarsByGender,
  type DefaultAvatar,
  type ChildGender,
} from 'src/utils/defaultAvatars';

const i18n = i18nSubPath('pages.stack.family-group.ChildEditPage.avatar');

const props = defineProps<{
  modelValue: string | undefined;
  gender: ChildGender;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined];
}>();

const authStore = useAuthStore();

/** 当前 tab: 'default' | 'upload' */
const activeTab = ref<'default' | 'upload'>('default');

/** 上传状态 */
const isUploading = ref(false);
const uploadError = ref('');

/** file input ref */
const fileInputRef = ref<HTMLInputElement | null>(null);

/** 按性别过滤的默认头像列表 */
const filteredAvatars = computed<DefaultAvatar[]>(() => childAvatarsByGender(props.gender));

/** 当前预览头像（选中值或空） */
const currentAvatar = computed(() => props.modelValue);

/** 性别切换时自动切 tab */
watch(
  () => props.gender,
  () => {
    activeTab.value = 'default';
  },
);

/** 选择默认头像 */
function selectDefault(avatar: DefaultAvatar) {
  uploadError.value = '';
  emit('update:modelValue', avatar.url);
}

/** 判断某个默认头像是否被选中 */
function isSelected(avatar: DefaultAvatar): boolean {
  return props.modelValue === avatar.url;
}

/** 触发文件选择 */
function triggerFileInput() {
  fileInputRef.value?.click();
}

/** 处理文件选择 */
async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  // 验证文件类型和大小
  if (!file.type.startsWith('image/')) {
    uploadError.value = i18n('errors.invalidType');
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    uploadError.value = i18n('errors.tooLarge');
    return;
  }

  uploadError.value = '';
  isUploading.value = true;

  try {
    // 尝试调用后端上传接口
    const token = authStore.accessToken;
    if (token) {
      const res = await uploadAvatar(file, token);
      if (res.data.success && res.data.data?.url) {
        emit('update:modelValue', res.data.data.url);
        return;
      }
    }

    // Fallback: 后端未就绪时使用 base64 data URI 预览
    const base64 = await fileToBase64(file);
    emit('update:modelValue', base64);
  } catch {
    // 上传失败也 fallback 为 base64
    const base64 = await fileToBase64(file);
    emit('update:modelValue', base64);
  } finally {
    isUploading.value = false;
    // 重置 input 以便重复选择同一文件
    input.value = '';
  }
}

/** File 转 base64 data URI */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** 清除已选头像 */
function clearAvatar() {
  emit('update:modelValue', undefined);
}
</script>

<template>
  <div class="avatar-picker">
    <!-- 顶部预览区：当前选中头像 + 操作按钮 -->
    <div class="avatar-picker__preview">
      <div class="avatar-picker__circle" @click="triggerFileInput">
        <img v-if="currentAvatar" :src="currentAvatar" alt="avatar" class="avatar-picker__img" />
        <div v-else class="avatar-picker__placeholder">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
          </svg>
        </div>
        <div class="avatar-picker__camera-badge">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
            <path d="M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z" />
            <path
              d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
            />
          </svg>
        </div>
      </div>
      <div class="avatar-picker__actions">
        <button
          v-if="currentAvatar"
          type="button"
          class="avatar-picker__clear-btn"
          @click="clearAvatar"
        >
          {{ i18n('clear') }}
        </button>
      </div>
      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        style="display: none"
        @change="onFileSelected"
      />
    </div>

    <!-- Tab 切换 -->
    <div class="avatar-picker__tabs">
      <button
        type="button"
        class="avatar-picker__tab"
        :class="{ 'avatar-picker__tab--active': activeTab === 'default' }"
        @click="activeTab = 'default'"
      >
        {{ i18n('default') }}
      </button>
      <button
        type="button"
        class="avatar-picker__tab"
        :class="{ 'avatar-picker__tab--active': activeTab === 'upload' }"
        @click="
          activeTab = 'upload';
          triggerFileInput();
        "
      >
        {{ i18n('upload') }}
      </button>
    </div>

    <!-- 默认头像网格 -->
    <div v-if="activeTab === 'default'" class="avatar-picker__grid">
      <button
        v-for="avatar in filteredAvatars"
        :key="`${avatar.gender}${avatar.index}`"
        type="button"
        class="avatar-picker__option"
        :class="{ 'avatar-picker__option--selected': isSelected(avatar) }"
        @click="selectDefault(avatar)"
      >
        <img :src="avatar.url" :alt="`${avatar.gender} ${avatar.index}`" />
      </button>
    </div>

    <!-- 上传提示区 -->
    <div v-if="activeTab === 'upload'" class="avatar-picker__upload-zone">
      <p class="avatar-picker__upload-hint">{{ i18n('uploadHint') }}</p>
      <div v-if="isUploading" class="avatar-picker__uploading">
        <q-spinner size="24px" color="primary" />
        <span>{{ i18n('uploading') }}</span>
      </div>
      <p v-if="uploadError" class="avatar-picker__error">{{ uploadError }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.avatar-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar-picker__preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.avatar-picker__circle {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  background: var(--clr-card-bg, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.85;
  }
}

.avatar-picker__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-picker__placeholder {
  color: var(--clr-caption, #9398a9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-picker__camera-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(18, 14, 44, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-picker__actions {
  display: flex;
  gap: 8px;
}

.avatar-picker__clear-btn {
  font-family: var(--font-family);
  font-size: 13px;
  color: var(--clr-caption, #9398a9);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;

  &:hover {
    color: var(--clr-text, #12102c);
  }
}

.avatar-picker__tabs {
  display: flex;
  gap: 0;
  background: var(--clr-card-bg, #f5f5f5);
  border-radius: 20px;
  padding: 3px;
}

.avatar-picker__tab {
  flex: 1;
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  padding: 6px 16px;
  border-radius: 17px;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--clr-caption, #9398a9);
  transition: all 0.2s;
  white-space: nowrap;

  &--active {
    background: var(--clr-white, #fff);
    color: var(--clr-text, #12102c);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
}

.avatar-picker__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 240px;
  padding: 0 4px;
}

.avatar-picker__option {
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid transparent;
  background: none;
  padding: 0;
  cursor: pointer;
  transition:
    border-color 0.15s,
    transform 0.15s;

  &:hover {
    transform: scale(1.05);
  }

  &--selected {
    border-color: var(--clr-brand, #12102c);
    box-shadow: 0 0 0 2px rgba(18, 14, 44, 0.2);
  }

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.avatar-picker__upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
}

.avatar-picker__upload-hint {
  font-family: var(--font-family);
  font-size: 13px;
  color: var(--clr-caption, #9398a9);
  margin: 0;
  text-align: center;
}

.avatar-picker__uploading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--clr-caption, #9398a9);
}

.avatar-picker__error {
  font-family: var(--font-family);
  font-size: 13px;
  color: rgba(255, 93, 93, 1);
  margin: 0;
}
</style>
