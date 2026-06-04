<script setup lang="ts">
// AddVirtualDevicePage — multi-step guided flow for adding a virtual device.
// Step 1: Fill child info (required, no skip) → device named "{name}的乐宝"
// Step 2: Activate virtual device (auto API call)
// Step 3: Add voiceprint (required, no skip) — defaults to child's name + "self"
// Step 4: AI personality setup (default enabled, can skip)
// Step 5: Done

import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

import ConfirmDialog from 'components/ConfirmDialog.vue';
import RecordPanel from 'components/settings/voiceprint/RecordPanel.vue';
import VoiceprintIntroPanel from 'components/settings/voiceprint/VoiceprintIntroPanel.vue';
import ChildInfoForm from 'components/ChildInfoForm.vue';
import PersonalityEditor from 'components/PersonalityEditor.vue';
import { blobToDataUrl, i18nSubPath } from 'src/utils/common';
import { register } from 'src/utils/api/voiceprint';
import { activateAndAddVirtualDeviceWithChild, unbindAndRemoveDevice } from 'src/utils/device';
import { useDeviceStore } from 'stores/device';
import { useAuthStore } from 'stores/auth';
import { useFamilyGroupStore } from 'stores/family-group';
import { useOnboardingFlowStore } from 'stores/onboarding-flow';
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
const onboardingFlow = useOnboardingFlowStore();

// Relationship role → FamilyUserRole mapping (identity for known roles, fallback for unknown)
const relationshipRoleMap: Partial<Record<string, FamilyUserRole>> = {
  father: 'father',
  mother: 'mother',
  grandpa: 'grandpa',
  grandma: 'grandma',
  maternal_grandfather: 'maternal_grandfather',
  maternal_grandma: 'maternal_grandma',
  friend: 'friend',
  other: 'other',
};

// Relationship role → gender mapping
const relationshipGenderMap: Partial<Record<string, 'male' | 'female'>> = {
  father: 'male',
  grandpa: 'male',
  maternal_grandfather: 'male',
  mother: 'female',
  grandma: 'female',
  maternal_grandma: 'female',
};
const { trackClick, trackConversion } = useTracker();

const step = ref(0);
const autoAdvanceTimer = ref<number | null>(null);

// ─── In-page back button ───────────────────────────────────────
// Only visible when user already has virtual devices (subsequent add flow).
// Mirrors the same goBack logic as StackHeader for consistent behavior.
const canGoBack = computed(() => deviceStore.virtualDevices.length > 0);

function goBack() {
  if (window.history.length <= 1) {
    void router.replace('/main/home');
  } else {
    router.go(-1);
  }
}

// ─── Orphan device cleanup ─────────────────────────────────
// When the user abandons the flow after device activation, the activated
// device becomes an "orphan" — it exists on the backend and in the local
// store but has no voiceprint, no family group, and incomplete config.
//
// cleanupIncompleteDevice() rolls back the orphan by calling unbind and
// removing it from the store.  This is triggered when:
//   1. The user explicitly confirms leaving via the onBeforeRouteLeave dialog
//   2. An orphaned device from a previous abandoned session is detected on mount
async function cleanupIncompleteDevice() {
  if (!activatedDeviceId.value) return;
  const deviceId = activatedDeviceId.value;

  // Clear local state immediately (prevents re-entry / double-cleanup)
  activatedDeviceId.value = null;
  onboardingFlow.completeFlow();

  try {
    await unbindAndRemoveDevice(deviceId);
    $q.notify({ message: i18n('notifications.deviceRolledBack'), type: 'info' });
  } catch (err) {
    console.error('Failed to unbind orphaned device:', err);
    // API may have failed (network/offline), but ensure local store is clean
    deviceStore.removeDevice(deviceId);
    const group = familyGroupStore.groups.find((g) => g.deviceId === deviceId);
    if (group) familyGroupStore.removeGroup(group.id);
  }
}

/**
 * Clean up an orphaned device left over from a previous abandoned session.
 * Called on mount when the persisted onboarding flow references a device
 * that still exists in the store but the flow was never completed.
 */
async function cleanupOrphanedDevice(deviceId: string) {
  try {
    await unbindAndRemoveDevice(deviceId);
    $q.notify({ message: i18n('notifications.deviceRolledBack'), type: 'info' });
  } catch (err) {
    console.error('Failed to clean up orphaned device from previous session:', err);
    // Ensure local store is clean even if API fails
    deviceStore.removeDevice(deviceId);
    const group = familyGroupStore.groups.find((g) => g.deviceId === deviceId);
    if (group) familyGroupStore.removeGroup(group.id);
  }
}

// ─── Browser back-button guard ─────────────────────────────────
// When no virtual devices exist yet (first-device flow), intercept the browser
// back button via popstate and force the user to stay on this page.
// Capture the current hash on mount so we can synchronously restore it.
const currentPageHash = window.location.hash;

function onPopStateGuard() {
  if (deviceStore.virtualDevices.length === 0) {
    // Synchronously restore the hash to prevent navigation away.
    // Using pushState directly avoids async router re-entrancy issues.
    window.history.pushState(null, '', currentPageHash);
  }
}

// ─── Onboarding flow resume logic ─────────────────────────────
onMounted(() => {
  window.addEventListener('popstate', onPopStateGuard);

  // Determine whether this is a subsequent add-device flow (user already has devices).
  // Unlike the first-device flow, subsequent flows do NOT block navigation via the
  // router guard, but they DO use the onboarding-flow store to track progress so that
  // orphaned devices can be cleaned up if the flow is abandoned.
  const hasExistingDevices = deviceStore.virtualDevices.length > 0;

  if (onboardingFlow.active && !onboardingFlow.isExpired()) {
    // ── Resume an in-progress flow (first or subsequent) ──

    // Restore child info first (safe to do regardless of path)
    if (onboardingFlow.childInfo) {
      childGender.value = onboardingFlow.childInfo.gender;
      childName.value = onboardingFlow.childInfo.name;
      childBirthday.value = onboardingFlow.childInfo.birthday;
    }

    // Check if a device was activated in the previous session
    if (onboardingFlow.activatedDeviceId) {
      activatedDeviceId.value = onboardingFlow.activatedDeviceId;

      // Does the activated device still exist in the store?
      const existingDevice = deviceStore.devices.find(
        (d) => d.id === onboardingFlow.activatedDeviceId,
      );

      if (!existingDevice) {
        // Device gone from store (e.g. API didn't return it, or store was cleared).
        // Cannot resume — clear stale flow and start fresh.
        activatedDeviceId.value = null;
        onboardingFlow.completeFlow();
        onboardingFlow.startFlow(hasExistingDevices);
        $q.notify({ message: i18n('notifications.resumingFlow'), type: 'info' });
        return;
      }

      // Device exists in store — resume the flow from the activation step.
      // The idempotency guard in activateDevice() will skip the API call
      // since activatedDeviceId is already set.
      step.value = Math.max(onboardingFlow.step, 2); // at least voiceprint intro (step 2)
      $q.notify({ message: i18n('notifications.resumingFlow'), type: 'info' });
      return;
    }

    // No device activated yet — always resume at step 0 (child info form).
    // If step >= 1 but no device was activated, the app was killed after persisting
    // step but before/during the activation API call. Reset to step 0 so the user
    // can re-submit (which triggers activation again). Child info is already
    // restored above, so the form will be pre-filled.
    step.value = 0;
    $q.notify({ message: i18n('notifications.resumingFlow'), type: 'info' });
  } else if (onboardingFlow.active && onboardingFlow.isExpired()) {
    // ── Expired flow — clean up any orphaned device from the abandoned session ──
    const orphanDeviceId = onboardingFlow.activatedDeviceId;
    onboardingFlow.completeFlow();

    if (orphanDeviceId) {
      const orphanDevice = deviceStore.devices.find((d) => d.id === orphanDeviceId);
      if (orphanDevice) {
        // Device still in store but flow expired — auto-cleanup the orphan
        void cleanupOrphanedDevice(orphanDeviceId);
      }
    }

    $q.notify({ message: i18n('notifications.flowExpired'), type: 'warning' });
    onboardingFlow.startFlow(hasExistingDevices);
  } else {
    // ── Fresh start ──
    onboardingFlow.startFlow(hasExistingDevices);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('popstate', onPopStateGuard);
  if (autoAdvanceTimer.value !== null) {
    window.clearTimeout(autoAdvanceTimer.value);
    autoAdvanceTimer.value = null;
  }
});

// Prevent double-triggering when the async dialog is already showing
let isShowingLeaveDialog = false;

onBeforeRouteLeave((_to, _from, next) => {
  // If device was activated but flow not completed (step < 5 means not at "done" step)
  if (activatedDeviceId.value && step.value > 0 && step.value < 5) {
    // Guard against re-entry while dialog is already open
    if (isShowingLeaveDialog) {
      next(false);
      return;
    }

    // Block navigation first, then show the Quasar dialog (mobile-friendly)
    next(false);
    isShowingLeaveDialog = true;

    $q.dialog({
      component: ConfirmDialog,
      componentProps: {
        title: i18n('notifications.leaveConfirmTitle'),
        body: i18n('notifications.leaveConfirmBody'),
        confirmType: 'danger' as const,
        confirmLabel: i18n('notifications.leaveConfirmAction'),
      },
    })
      .onOk(() => {
        // User confirmed leaving — rollback the incomplete device to avoid orphans.
        // Fire-and-forget: cleanup runs in the background.
        void cleanupIncompleteDevice();
        isShowingLeaveDialog = false;
        next();
      })
      .onCancel(() => {
        isShowingLeaveDialog = false;
        // Navigation already blocked by next(false) above
      })
      .onDismiss(() => {
        isShowingLeaveDialog = false;
      });
    return;
  }
  next();
});

// --- Step 1: Child info ---
const childGender = ref<'boy' | 'girl'>('boy');
const childName = ref('');
const childBirthday = ref('');

const deviceDisplayName = computed(() => {
  const name = childName.value.trim();
  return name ? `${name}${i18n('step1.labels.deviceNameSuffix')}` : '';
});

const step1Valid = computed(
  () => childName.value.trim().length > 0 && childBirthday.value.trim().length > 0,
);

function goStep2() {
  if (!step1Valid.value) {
    $q.notify({ message: i18n('notifications.fieldsRequired'), type: 'warning' });
    return;
  }
  // Persist child info before advancing
  onboardingFlow.setChildInfo({
    name: childName.value.trim(),
    gender: childGender.value,
    birthday: childBirthday.value.trim(),
  });
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

  // Idempotency guard: if device was already activated (e.g. restored from store),
  // skip the API call and advance directly to the next step.
  if (activatedDeviceId.value) {
    step.value = 2; // voiceprint intro
    return;
  }

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
    onboardingFlow.setDeviceActivated(device.id);
    trackConversion('device_activated');
    // Auto advance after short delay
    autoAdvanceTimer.value = window.setTimeout(() => {
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
      ? (() => {
          const birth = new Date(childBirthday.value);
          const now = new Date();
          let age = now.getFullYear() - birth.getFullYear();
          const monthDiff = now.getMonth() - birth.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
            age--;
          }
          return Math.max(1, age);
        })()
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
      onboardingFlow.setVoiceprintRegistered();
      trackConversion('voiceprint_registered');
      step.value = 4; // personality step
    } else {
      $q.notify({
        type: 'negative',
        message: result.message || i18n('notifications.voiceprintFailed'),
      });
    }
  } catch (error) {
    console.error('Error during voiceprint registration:', error);
    $q.notify({ type: 'negative', message: i18n('notifications.voiceprintFailed') });
  } finally {
    isRegisteringVoiceprint.value = false;
  }
}

// --- Step 4: AI personality ---
function onPersonalitySubmit(payload: { enabled: boolean; traits: string; goals: string }) {
  if (!activatedDeviceId.value) return;
  deviceStore.setCurrentDevice(activatedDeviceId.value);
  deviceStore.updateCurrentDeviceConfig({ aiPersonality: payload });
  onboardingFlow.setAiPersonality(payload);
  step.value = 5; // done step
}

function onPersonalitySkip() {
  // Default: enabled but no traits/goals
  const config = { enabled: true };
  if (activatedDeviceId.value) {
    deviceStore.setCurrentDevice(activatedDeviceId.value);
    deviceStore.updateCurrentDeviceConfig({ aiPersonality: config });
  }
  onboardingFlow.setAiPersonality(config);
  step.value = 5; // done step
}

function onPersonalityDisable() {
  const config = { enabled: false };
  if (activatedDeviceId.value) {
    deviceStore.setCurrentDevice(activatedDeviceId.value);
    deviceStore.updateCurrentDeviceConfig({ aiPersonality: config });
  }
  onboardingFlow.setAiPersonality(config);
  step.value = 5; // done step
}

// --- Step 5: Done ---
/** Create a family group only if one doesn't already exist for this device (idempotency) */
function createFamilyGroupIfMissing() {
  if (!activatedDeviceId.value || !childName.value.trim()) return;
  // Skip if a group already exists for this device
  if (familyGroupStore.groups.some((g) => g.deviceId === activatedDeviceId.value)) return;
  createFamilyGroupForDevice();
}

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
    name: i18n('step5.familyGroupName', { name: childInfo.name }),
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
        ? [
            {
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
            },
          ]
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
  createFamilyGroupIfMissing();
  onboardingFlow.completeFlow();
  router.replace('/stack/chat').catch(console.error);
}

function goToHome() {
  trackClick('btn_click_add_device_back_home');
  if (activatedDeviceId.value) {
    deviceStore.setCurrentDevice(activatedDeviceId.value);
  }
  createFamilyGroupIfMissing();
  onboardingFlow.completeFlow();
  router.replace('/main/home').catch(console.error);
}
</script>

<template>
  <q-page class="add-virtual-device-page">
    <q-tab-panels v-model="step" class="full-height">
      <!-- Step 1: Child info -->
      <q-tab-panel :name="0" class="q-pa-none">
        <div class="step-content-flow">
          <!-- In-page back button (only when user has existing devices) -->
          <button
            v-if="canGoBack"
            type="button"
            class="flow-back-btn"
            :aria-label="i18n('step1.labels.back')"
            @click="goBack"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>

          <ChildInfoForm
            v-model:gender="childGender"
            v-model:name="childName"
            v-model:birthday="childBirthday"
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

      <!-- Step 2: Voiceprint intro (why record voiceprint) -->
      <VoiceprintIntroPanel :name="2" @next="step = 3" />

      <!-- Step 3: Voiceprint (RecordPanel renders its own q-tab-panel) -->
      <RecordPanel :name="3" @next="onVoiceprintRecorded" />

      <!-- Step 4: AI personality -->
      <q-tab-panel :name="4" class="q-pa-none">
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
      <q-tab-panel :name="5" class="q-pa-none">
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

<style scoped lang="scss">
.add-virtual-device-page {
  background: var(--clr-page-bg-neutral);
  // Fill the q-page-container exactly (it already has flex:1 + overflow-y:auto).
  // Do NOT use 100vh — the StackHeader consumes part of the viewport,
  // so 100vh would exceed the container and trigger a scrollbar.
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  // Quasar's q-tab-panels wraps content in .q-tab-panels > .q-panel > .q-tab-panel.
  // Force transparent backgrounds AND propagate full height through the chain
  // so voiceprint-record-stage can use height: 100% + flex to fill the viewport.
  :deep(.q-tab-panels) {
    background: transparent;
    flex: 1 1 0;
    min-height: 0;
  }

  :deep(.q-panel) {
    background: transparent;
    height: 100%;
    overflow: hidden;
  }

  :deep(.q-tab-panel) {
    background: transparent;
    height: 100%;
    overflow: hidden;
  }
}

/* In-page back button — top-left of the flow content area.
 * Sized to match StackHeader's q-btn (40×40 touch target, 24×24 icon)
 * for visual consistency across the app. */
.flow-back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: -4px -8px 4px -8px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--clr-text-primary, #333);
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;

  &:hover {
    background: rgba(0, 0, 0, 0.06);
  }

  &:active {
    background: rgba(0, 0, 0, 0.1);
  }
}

/* Flow layout for form steps — avoids absolute positioning overlap */
.step-content-flow {
  padding: 12px 32px 12px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;

  // Compact overrides for ChildInfoForm when inside the add-device flow
  :deep(.child-edit-info-card) {
    padding: 12px 14px;
    margin-bottom: 16px;
  }

  :deep(.child-edit-info-title) {
    font-size: 15px;
    line-height: 20px;
    margin: 0 0 6px;
  }

  :deep(.child-edit-info-desc) {
    font-size: 13px;
    line-height: 20px;
  }

  :deep(.child-edit-info-icon) {
    width: 26px;
    height: 26px;
  }

  :deep(.child-edit-avatar) {
    width: 72px;
    height: 72px;
  }

  :deep(.child-edit-gender-row) {
    margin-top: 10px;
  }

  :deep(.child-edit-gender-label) {
    margin-top: 4px;
  }

  :deep(.child-edit-label) {
    font-size: 15px;
    line-height: 22px;
  }

  :deep(.child-edit-input) {
    margin-top: 8px;
    height: 42px;
  }
}

/* Bottom actions area — flow layout, pinned to bottom */
.step-bottom-actions {
  margin-top: auto;
  padding-top: 16px;
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

/* Flow-mode skip button (weak visual, relative positioning) */
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
