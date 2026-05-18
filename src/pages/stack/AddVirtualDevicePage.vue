<script setup lang="ts">
// AddVirtualDevicePage — multi-step guided flow for adding a virtual device.
// Step 1: Fill child info (required, no skip) → device named "{name}的乐宝"
// Step 2: Activate virtual device (auto API call)
// Step 3: Add voiceprint (required, no skip) — defaults to child's name + "self"
// Step 4: AI personality setup (default enabled, can skip)
// Step 5: Done

import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import boyAvatar from 'src/assets/lanhu/child-edit/boy-avatar.png';
import girlAvatar from 'src/assets/lanhu/child-edit/girl-avatar.png';
import RecordPanel from 'components/settings/voiceprint/RecordPanel.vue';
import BirthdayPicker from 'components/BirthdayPicker.vue';
import PersonalityEditor from 'components/PersonalityEditor.vue';
import { blobToDataUrl, i18nSubPath } from 'src/utils/common';
import { register } from 'src/utils/api/voiceprint';
import { activateAndAddVirtualDeviceWithChild } from 'src/utils/device';
import { useDeviceStore } from 'stores/device';
import { useAuthStore } from 'stores/auth';
import { useFamilyGroupStore } from 'stores/family-group';
import type { FamilyMember, FamilyUserRole } from 'stores/family-group/types';
import { router } from 'src/router';
import type { ChildInfo } from 'stores/device/types';
import { useProfileStore } from 'stores/profile';
import { useTracker } from 'src/composables/useTracker';

const i18n = i18nSubPath('pages.stack.AddVirtualDevicePage');
const $q = useQuasar();
const deviceStore = useDeviceStore();
const familyGroupStore = useFamilyGroupStore();
const profileStore = useProfileStore();

// 用户在 SetupProfilePanel 填写的中文"关系" → FamilyUserRole 枚举映射
const relationshipRoleMap: Record<string, FamilyUserRole> = {
  '爸爸': 'father',
  '妈妈': 'mother',
  '爷爷': 'grandpa',
  '奶奶': 'grandma',
  '外公': 'maternal_grandfather',
  '外婆': 'maternal_grandma',
  '朋友': 'friend',
  '其他亲属': 'other',
};

// 中文"关系" → 性别（用于成员信息展示）
const relationshipGenderMap: Record<string, 'male' | 'female'> = {
  '爸爸': 'male',
  '爷爷': 'male',
  '外公': 'male',
  '妈妈': 'female',
  '奶奶': 'female',
  '外婆': 'female',
};
const { trackClick, trackConversion } = useTracker();
useAuthStore();

const step = ref(0);

// --- Step 1: Child info ---
const childGender = ref<'boy' | 'girl'>('boy');
const childName = ref('');
const childBirthday = ref('');

const deviceDisplayName = computed(() => {
  const name = childName.value.trim();
  return name ? `${name}${i18n('step1.labels.deviceNameSuffix')}` : '';
});

const step1Valid = computed(() => childName.value.trim().length > 0 && childBirthday.value.trim().length > 0);

function selectGender(gender: 'boy' | 'girl') {
  childGender.value = gender;
}

function goStep2() {
  if (!step1Valid.value) {
    $q.notify({ message: i18n('notifications.fieldsRequired'), type: 'warning' });
    return;
  }
  trackConversion('device_activated');
  step.value = 1;
  // Auto-trigger activation
  void activateDevice();
}

// --- Step 2: Activate ---
const isActivating = ref(false);
const activateError = ref<string | null>(null);
const activatedDeviceId = ref<string | null>(null);

async function activateDevice() {
  if (isActivating.value) return;
  isActivating.value = true;
  activateError.value = null;

  try {
    const childInfo: ChildInfo = {
      name: childName.value.trim(),
      gender: childGender.value,
      birthday: childBirthday.value.trim(),
    };
    const device = await activateAndAddVirtualDeviceWithChild(childInfo, deviceDisplayName.value);
    activatedDeviceId.value = device.id;
    // Auto advance after short delay
    setTimeout(() => {
      step.value = 2;
    }, 1000);
  } catch (err) {
    console.error('Failed to activate virtual device:', err);
    activateError.value = err instanceof Error ? err.message : i18n('notifications.activateFailed');
  } finally {
    isActivating.value = false;
  }
}

// --- Step 3: Voiceprint ---
const isRegisteringVoiceprint = ref(false);

async function onVoiceprintRecorded(data: Blob) {
  if (!activatedDeviceId.value) return;
  isRegisteringVoiceprint.value = true;
  try {
    const authStore = useAuthStore();
    const { accessToken } = storeToRefs(authStore);
    if (!accessToken.value) {
      $q.notify({ type: 'warning', message: i18n('notifications.tokenMissing') });
      isRegisteringVoiceprint.value = false;
      return;
    }

    const dataUrl = await blobToDataUrl(data);
    const audioBase64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
    const childAge = childBirthday.value
      ? Math.max(1, new Date().getFullYear() - new Date(childBirthday.value).getFullYear())
      : 8;
    const result = (
      await register(
        accessToken.value,
        audioBase64,
        childName.value.trim(),
        childAge,
        'self' as const,
      )
    ).data;

    if (result.success) {
      trackConversion('voiceprint_registered');
      step.value = 3;
    } else {
      $q.notify({
        type: 'negative',
        message: result.message || '声纹注册失败',
      });
    }
  } catch (error) {
    console.error('Error during voiceprint registration:', error);
    $q.notify({ type: 'negative', message: '声纹注册失败' });
  } finally {
    isRegisteringVoiceprint.value = false;
  }
}

// --- Step 4: AI personality ---
function onPersonalitySubmit(payload: { enabled: boolean; traits: string; goals: string }) {
  if (!activatedDeviceId.value) return;
  deviceStore.setCurrentDevice(activatedDeviceId.value);
  deviceStore.updateCurrentDeviceConfig({ aiPersonality: payload });
  step.value = 4;
}

function onPersonalitySkip() {
  // Default: enabled but no traits/goals
  if (activatedDeviceId.value) {
    deviceStore.setCurrentDevice(activatedDeviceId.value);
    deviceStore.updateCurrentDeviceConfig({
      aiPersonality: { enabled: true },
    });
  }
  step.value = 4;
}

function onPersonalityDisable() {
  if (activatedDeviceId.value) {
    deviceStore.setCurrentDevice(activatedDeviceId.value);
    deviceStore.updateCurrentDeviceConfig({
      aiPersonality: { enabled: false },
    });
  }
  step.value = 4;
}

// --- Step 5: Done ---
function createFamilyGroupForDevice() {
  if (!activatedDeviceId.value || !childName.value.trim()) return;

  const now = new Date().toISOString();
  const childInfo: ChildInfo = {
    name: childName.value.trim(),
    gender: childGender.value,
    birthday: childBirthday.value.trim(),
  };

  // Create a local family group entry (will sync with backend when API is ready)
  const profile = profileStore.profile;
  const newGroup = {
    id: `local-${activatedDeviceId.value}`,
    name: `${childInfo.name}的家庭组`,
    childName: childInfo.name,
    deviceId: activatedDeviceId.value,
    creatorId: profile?.id ?? '',
    createdAt: now,
    members: [
      {
        id: `member-child-${Date.now()}`,
        memberType: 'child' as const,
        childInfo,
        deviceId: activatedDeviceId.value,
        isCreator: false,
        joinedAt: now,
      },
      // Add current user as creator member
      // birthday/relationship 来自 SetupProfilePanel 填写并同步到 profile 的信息
      ...(profile
        ? [{
            id: `member-user-${profile.id}`,
            memberType: 'user' as const,
            userId: profile.id,
            nickname: profile.nickname ?? profile.id,
            avatar: profile.avatar,
            role: relationshipRoleMap[profile.relationship ?? ''],
            gender: relationshipGenderMap[profile.relationship ?? ''],
            birthday: profile.birthday,
            isCreator: true,
            joinedAt: now,
          }]
        : []),
    ] as FamilyMember[],
  };

  familyGroupStore.addGroup(newGroup);
  familyGroupStore.setCurrentGroup(newGroup.id);
}

function goToChat() {
  trackConversion('first_chat');
  if (activatedDeviceId.value) {
    deviceStore.setCurrentDevice(activatedDeviceId.value);
  }
  createFamilyGroupForDevice();
  router.replace('/stack/chat').catch(console.error);
}

function goToHome() {
  trackClick('btn_click_add_device_back_home');
  if (activatedDeviceId.value) {
    deviceStore.setCurrentDevice(activatedDeviceId.value);
  }
  createFamilyGroupForDevice();
  router.replace('/main/home').catch(console.error);
}
</script>

<template>
  <q-page class="add-virtual-device-page">
    <q-tab-panels v-model="step" class="full-height">
      <!-- Step 1: Child info -->
      <q-tab-panel :name="0" class="q-pa-none">
        <div class="step-content-flow">
          <p class="child-edit-question child-edit-question--first">
            {{ i18n('step1.questions.gender') }}
          </p>
          <div class="child-edit-gender-row">
            <button type="button" class="child-edit-gender-option" @click="selectGender('boy')">
              <span class="child-edit-avatar">
                <img :src="boyAvatar" alt="boy avatar" />
              </span>
              <span
                class="child-edit-gender-label"
                :class="{ 'child-edit-gender-label--active': childGender === 'boy' }"
              >
                {{ i18n('step1.labels.male') }}
              </span>
            </button>
            <button type="button" class="child-edit-gender-option" @click="selectGender('girl')">
              <span class="child-edit-avatar">
                <img :src="girlAvatar" alt="girl avatar" />
              </span>
              <span
                class="child-edit-gender-label"
                :class="{ 'child-edit-gender-label--active': childGender === 'girl' }"
              >
                {{ i18n('step1.labels.female') }}
              </span>
            </button>
          </div>

          <p class="child-edit-question child-edit-question--followup">
            {{ i18n('step1.questions.name') }}
          </p>
          <input
            v-model="childName"
            class="child-edit-input"
            type="text"
            :placeholder="i18n('step1.placeholders.name')"
          />

          <p class="child-edit-question child-edit-question--followup">
            {{ i18n('step1.questions.birthday') }}
          </p>
          <BirthdayPicker
            v-model="childBirthday"
            :placeholder="i18n('step1.placeholders.birthday')"
            :default-year="2020"
          />

          <div class="step-bottom-actions">
            <button
              type="button"
              class="child-edit-primary-btn--flow"
              :disabled="!step1Valid"
              @click="goStep2"
            >
              {{ i18n('step1.labels.next') }}
            </button>
          </div>
        </div>
      </q-tab-panel>

      <!-- Step 2: Activate -->
      <q-tab-panel :name="1" class="q-pa-none">
        <div class="activate-step-inner">
          <template v-if="isActivating">
            <q-icon name="mdi-robot-outline" size="4rem" color="primary" />
            <p class="activate-step-text">{{ i18n('step2.labels.activating') }}</p>
            <q-spinner size="40px" color="primary" />
          </template>
          <template v-else-if="activateError">
            <q-icon name="mdi-alert-circle-outline" size="4rem" color="negative" />
            <p class="activate-step-text activate-step-text--error">{{ activateError }}</p>
            <button type="button" class="child-edit-primary-btn--flow" @click="activateDevice">
              {{ i18n('step2.labels.retry') }}
            </button>
          </template>
          <template v-else>
            <q-icon name="mdi-check-circle" size="4rem" color="positive" />
            <p class="activate-step-text">{{ i18n('step2.labels.success') }}</p>
          </template>
        </div>
      </q-tab-panel>

      <!-- Step 3: Voiceprint (RecordPanel renders its own q-tab-panel) -->
      <RecordPanel
        :name="2"
        @next="onVoiceprintRecorded"
      />

      <!-- Step 4: AI personality -->
      <q-tab-panel :name="3" class="q-pa-none">
        <div class="device-personality-detail-page">
          <PersonalityEditor
            :show-skip="true"
            :skip-label="i18n('step4.labels.skip')"
            :submit-label="i18n('step4.labels.next')"
            @submit="onPersonalitySubmit"
            @skip="onPersonalitySkip"
            @disable="onPersonalityDisable"
          />
        </div>
      </q-tab-panel>

      <!-- Step 5: Done -->
      <q-tab-panel :name="4" class="q-pa-none">
        <div class="done-step-inner">
          <q-icon name="mdi-check-circle" size="4rem" color="positive" />
          <p class="done-step-title">{{ i18n('step5.labels.ready') }}</p>
          <p v-if="deviceDisplayName" class="done-step-device-name">{{ deviceDisplayName }}</p>
          <button type="button" class="child-edit-primary-btn--flow" @click="goToChat">
            {{ i18n('step5.labels.startChat') }}
          </button>
          <button type="button" class="child-edit-skip-btn--flow" @click="goToHome">
            {{ i18n('step5.labels.backToHome') }}
          </button>
        </div>
      </q-tab-panel>
    </q-tab-panels>
    <q-inner-loading :showing="isRegisteringVoiceprint" />
  </q-page>
</template>

<style scoped>
.add-virtual-device-page {
  background: var(--clr-page-bg-neutral);
}

/* Flow layout for form steps — avoids absolute positioning overlap */
.step-content-flow {
  padding: 20px 32px 40px;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

/* Bottom actions area — flow layout, pinned to bottom */
.step-bottom-actions {
  margin-top: auto;
  padding-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

/* Flow-mode primary button (same visual as .child-edit-primary-btn but relative) */
.child-edit-primary-btn--flow {
  width: var(--btn-width, 311px);
  height: var(--btn-height, 56px);
  border: none;
  border-radius: var(--btn-radius, 28px);
  background: var(--clr-btn-primary-bg);
  color: var(--clr-white);
  font-family: var(--font-family);
  font-size: var(--font-size-btn, 17px);
  font-weight: 500;
  line-height: var(--line-height-btn, 24px);
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

/* Flow-mode skip button (same visual as .child-edit-skip-btn but relative) */
.child-edit-skip-btn--flow {
  width: var(--btn-width, 311px);
  height: var(--btn-height, 56px);
  border: 1.5px solid var(--clr-btn-weak-border-soft);
  border-radius: var(--btn-radius, 28px);
  background: var(--clr-white);
  color: var(--clr-weak);
  font-family: var(--font-family);
  font-size: var(--font-size-btn, 17px);
  font-weight: 400;
  line-height: var(--line-height-btn, 24px);
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }
}

.activate-step-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 80px 20px;
  gap: 16px;
}

.activate-step-text {
  font-family: var(--font-family);
  font-size: 16px;
  color: var(--clr-text-primary);
  text-align: center;
}

.activate-step-text--error {
  color: var(--clr-danger-bg, #e53935);
  white-space: pre-line;
}

.voiceprint-step-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Done step */
.done-step-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 80px 20px;
  gap: 12px;
}

.done-step-title {
  font-family: var(--font-family);
  font-size: 20px;
  font-weight: 500;
  color: var(--clr-text-primary);
  text-align: center;
  margin-bottom: 4px;
}

.done-step-device-name {
  font-family: var(--font-family);
  font-size: 16px;
  color: var(--clr-link);
  text-align: center;
  margin-bottom: 16px;
}
</style>
