<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { ref } from 'vue';

import CropperDialog from 'components/CropperDialog.vue';
import { retrieveProfileInfo, updateProfileInfo } from 'src/utils/api/profile';
import { useAuthStore } from 'stores/auth';
import { useProfileStore } from 'stores/profile';

defineProps<{
  name: string | number;
}>();
const emit = defineEmits<{
  finish: [];
  previous: [];
}>();

const { dialog, notify } = useQuasar();
const { accessToken } = storeToRefs(useAuthStore());
const { updateProfile } = useProfileStore();

const avatar = ref<string>();
const nickname = ref<string>();
const birthday = ref<string>();
const relationship = ref<string>();

const isSending = ref(false);

// Relationship options: order matches design grid (3-col layout, L-to-R, top-to-bottom)
const relationOptions = ['妈妈', '爸爸', '奶奶', '爷爷', '外婆', '外公', '朋友', '其他亲属'];

const showRelationSheet = ref(false);
const showBirthdayPicker = ref(false);
const birthdayInput = ref<HTMLInputElement>();

const editAvatar = () => {
  dialog({
    component: CropperDialog,
    componentProps: {
      src: avatar.value,
    },
    persistent: true,
  }).onOk((data) => {
    avatar.value = data;
  });
};

const openBirthdayPicker = () => {
  showBirthdayPicker.value = !showBirthdayPicker.value;
  if (showBirthdayPicker.value) {
    // Focus hidden date input after render
    setTimeout(() => birthdayInput.value?.showPicker?.(), 100);
  }
};

const onBirthdayChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  birthday.value = target.value;
  showBirthdayPicker.value = false;
};

const selectRelationship = (val: string) => {
  relationship.value = val;
  showRelationSheet.value = false;
};

const confirm = async () => {
  if (!accessToken.value || isSending.value) return;
  isSending.value = true;
  try {
    const { data } = await updateProfileInfo(accessToken.value, {
      avatar: avatar.value,
      nickname: nickname.value,
      birthday: birthday.value,
      relationship: relationship.value,
    });
    if (!data.success) {
      notify({
        type: 'negative',
        message: data.message || '保存失败',
      });
      isSending.value = false;
      return;
    }

    const profileRes = await retrieveProfileInfo(accessToken.value);
    if (!profileRes.data.success) {
      notify({
        type: 'negative',
        message: profileRes.data.message || '获取资料失败',
      });
      isSending.value = false;
      return;
    }
    updateProfile(profileRes.data.data);
    emit('finish');
  } catch (err) {
    notify({
      type: 'negative',
      message: (err as Error).message || '未知错误',
    });
  }
  isSending.value = false;
};

const skip = () => {
  // Skip profile setup, go directly to finish
  emit('finish');
};
</script>

<template>
  <q-tab-panel :name="name" class="auth-panel">
    <!-- Avatar: 87x87px circular, fill rgba(229,229,239,1), 3px white border -->
    <div class="avatar-shell" @click="editAvatar">
      <div class="avatar-circle">
        <img v-if="avatar" :src="avatar" class="avatar-img" alt="头像" />
        <div v-else class="avatar-placeholder">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="10" r="6" stroke="#9398A9" stroke-width="1.5" />
            <path
              d="M4 26C4 20.477 9.373 16 16 16C22.627 16 28 20.477 28 26"
              stroke="#9398A9"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Nickname -->
    <div class="field-row">
      <label class="field-label">昵称</label>
      <div class="input-group">
        <input class="design-input" v-model="nickname" placeholder="请输入昵称" maxlength="20" />
      </div>
    </div>

    <!-- Birthday -->
    <div class="field-row">
      <label class="field-label">生日</label>
      <div class="input-group input-group--clickable" @click="openBirthdayPicker">
        <span class="field-value" :class="{ 'field-value--placeholder': !birthday }">
          {{ birthday || '请选择生日' }}
        </span>
        <span class="field-action-arrow">
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path
              d="M1 1L6 6L1 11"
              stroke="#9398A9"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </div>
      <!-- Hidden date input -->
      <input
        ref="birthdayInput"
        type="date"
        class="date-hidden"
        @change="onBirthdayChange"
        :max="new Date().toISOString().split('T')[0]"
      />
    </div>

    <!-- Relationship -->
    <div class="field-row">
      <label class="field-label">您与孩子的关系</label>
      <div class="input-group input-group--clickable" @click="showRelationSheet = true">
        <span class="field-value" :class="{ 'field-value--placeholder': !relationship }">
          {{ relationship || '请选择' }}
        </span>
        <span class="field-action-arrow">
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path
              d="M1 1L6 6L1 11"
              stroke="#9398A9"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </div>
    </div>

    <!-- Primary button -->
    <button class="btn-max" :disabled="isSending" @click="confirm">完成</button>

    <!-- Weak skip button -->
    <button class="btn-weak" @click="skip">跳过</button>

    <!-- Relationship bottom sheet (grid layout per design) -->
    <transition name="sheet">
      <div
        v-if="showRelationSheet"
        class="relation-overlay"
        @click.self="showRelationSheet = false"
      >
        <div class="relation-sheet">
          <div class="sheet-head">
            <span class="sheet-title">选择关系</span>
          </div>
          <div class="sheet-body">
            <button
              v-for="opt in relationOptions"
              :key="opt"
              class="relation-chip"
              :class="{ 'relation-chip--active': relationship === opt }"
              @click="selectRelationship(opt)"
            >
              {{ opt }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </q-tab-panel>
</template>

<style scoped>
/* ===== Design tokens ===== */
.auth-panel {
  --clr-text: rgba(21, 23, 23, 1);
  --clr-placeholder: rgba(147, 152, 169, 1);
  --clr-link: rgba(32, 204, 249, 1);
  --clr-error: rgba(255, 93, 93, 1);
  --clr-weak: rgba(99, 104, 104, 1);
  --clr-white: rgba(255, 255, 255, 1);
  --font-family: 'AlibabaPuHuiTi', 'PingFang SC', 'Microsoft YaHei', sans-serif;

  font-family: var(--font-family);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 0 32px;
}

/* ===== Avatar ===== */
.avatar-shell {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
  cursor: pointer;
}

.avatar-circle {
  width: 87px;
  height: 87px;
  border-radius: 50%;
  background: rgba(229, 229, 239, 1);
  border: 3px solid rgba(255, 255, 255, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
}

/* ===== Field row ===== */
.field-row {
  width: 311px;
  margin-bottom: 12px;
}

.field-label {
  display: block;
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  color: var(--clr-placeholder);
  margin-bottom: 8px;
}

/* ===== Input group ===== */
.input-group {
  width: 311px;
  height: 48px;
  position: relative;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 0 16px;
  background: var(--clr-input-bg, rgba(255, 255, 255, 1));
}

.input-group:focus-within {
  outline: none;
}

.input-group--clickable {
  cursor: pointer;
  user-select: none;
}

/* ===== Design input (inside input-group with padding) ===== */
.design-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  color: var(--clr-text);
  padding: 0;
  box-sizing: border-box;
}

.design-input::placeholder {
  font-weight: 400;
  color: var(--clr-placeholder);
}

/* ===== Field value (for clickable rows) ===== */
.field-value {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  color: var(--clr-text);
}

.field-value--placeholder {
  font-weight: 400;
  color: var(--clr-placeholder);
}

.field-action-arrow {
  flex-shrink: 0;
  width: 7px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
}

/* Hidden date input */
.date-hidden {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

/* ===== Max button ===== */
.btn-max {
  width: 311px;
  height: 56px;
  border: none;
  border-radius: 28px;
  background: rgba(18, 14, 44, 1);
  color: var(--clr-white);
  font-family: var(--font-family);
  font-size: 17px;
  font-weight: 500;
  line-height: 24px;
  cursor: pointer;
  margin-top: 48px;
  transition: opacity 0.2s;
}

.btn-max:hover {
  opacity: 0.9;
}

.btn-max:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-max:active {
  transform: none;
}

/* ===== Weak button ===== */
.btn-weak {
  width: 311px;
  height: 56px;
  border: 1.5px solid rgba(212, 246, 170, 1);
  border-radius: 28px;
  background: rgba(255, 255, 255, 1);
  color: var(--clr-weak);
  font-family: var(--font-family);
  font-size: 17px;
  font-weight: 400;
  line-height: 24px;
  cursor: pointer;
  margin-top: 8px;
}

.btn-weak:active {
  transform: none;
}

/* ===== Relation bottom sheet ===== */
.relation-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.relation-sheet {
  width: 375px;
  max-height: 60vh;
  background: #fff;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.25s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.sheet-head {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(147, 152, 169, 0.15);
  position: relative;
}

.sheet-title {
  font-size: 17px;
  font-weight: 500;
  line-height: 24px;
  color: var(--clr-text);
}

.sheet-body {
  padding: 16px 0 28px;
  display: grid;
  grid-template-columns: repeat(3, 100px);
  gap: 12px;
  justify-content: center;
  overflow-y: auto;
}

/* ===== Relation chip (grid layout per design) ===== */
.relation-chip {
  width: 100px;
  height: 40px;
  border-radius: 20px;
  border: 1px solid rgba(147, 152, 169, 0.2);
  background: rgba(255, 255, 255, 1);
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 400;
  line-height: 22px;
  color: rgba(21, 23, 23, 1);
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.relation-chip:hover {
  background: rgba(32, 204, 249, 0.04);
}

.relation-chip--active {
  background: rgba(18, 14, 44, 1);
  border-color: rgba(18, 14, 44, 1);
  color: rgba(255, 255, 255, 1);
}

/* ===== Sheet transition ===== */
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s ease;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
</style>
