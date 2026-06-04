/**
 * OnboardingFlowStore — 虚拟乐宝添加引导流程状态持久化
 *
 * Tracks the 5-step AddVirtualDevicePage flow so that if the app is killed
 * mid-flow, the user can resume from the exact step they left off.
 *
 * Also tracks subsequent add-device flows (when user already has devices)
 * via the `isSubsequent` flag, enabling orphan-device cleanup on abandonment.
 *
 * Steps (matching AddVirtualDevicePage `step` ref):
 *   0 = Fill child info
 *   1 = Activate virtual device (auto API call)
 *   2 = Voiceprint intro (why record voiceprint)
 *   3 = Record voiceprint
 *   4 = AI personality setup
 *   5 = Done (family group creation + navigation)
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ChildInfo } from 'stores/device/types';

/** 7-day expiry for an in-progress onboarding flow */
const FLOW_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export const useOnboardingFlowStore = defineStore(
  'onboarding-flow',
  () => {
    // ─── State ──────────────────────────────────────────────
    const active = ref(false);
    const step = ref(0);
    const childInfo = ref<ChildInfo | null>(null);
    const activatedDeviceId = ref<string | null>(null);
    const voiceprintRegistered = ref(false);
    const aiPersonality = ref<{ enabled: boolean; traits?: string; goals?: string } | null>(null);
    const startedAt = ref<string | null>(null);
    /** True when this flow is for adding a 2nd+ device (user already has devices) */
    const isSubsequent = ref(false);

    // ─── Actions ────────────────────────────────────────────

    /** Start a brand-new onboarding flow (called on first mount) */
    function startFlow(subsequent = false) {
      active.value = true;
      step.value = 0;
      childInfo.value = null;
      activatedDeviceId.value = null;
      voiceprintRegistered.value = false;
      aiPersonality.value = null;
      startedAt.value = new Date().toISOString();
      isSubsequent.value = subsequent;
    }

    /** Persist child info and advance to step 1 (activation) */
    function setChildInfo(info: ChildInfo) {
      childInfo.value = info;
      step.value = 1;
    }

    /** Persist activated device ID and advance to step 2 (voiceprint intro) */
    function setDeviceActivated(deviceId: string) {
      activatedDeviceId.value = deviceId;
      step.value = 2;
    }

    /** Mark voiceprint as registered and advance to step 4 (personality) */
    function setVoiceprintRegistered() {
      voiceprintRegistered.value = true;
      step.value = 4;
    }

    /** Persist AI personality config and advance to step 5 (done) */
    function setAiPersonality(config: { enabled: boolean; traits?: string; goals?: string }) {
      aiPersonality.value = config;
      step.value = 5;
    }

    /** Flow fully completed or dismissed — clear all persisted state */
    function completeFlow() {
      active.value = false;
      step.value = 0;
      childInfo.value = null;
      activatedDeviceId.value = null;
      voiceprintRegistered.value = false;
      aiPersonality.value = null;
      startedAt.value = null;
      isSubsequent.value = false;
    }

    /** Check if the in-progress flow has exceeded the 7-day expiry window */
    function isExpired(): boolean {
      if (!startedAt.value) return false;
      return Date.now() - new Date(startedAt.value).getTime() > FLOW_EXPIRY_MS;
    }

    return {
      active,
      step,
      childInfo,
      activatedDeviceId,
      voiceprintRegistered,
      aiPersonality,
      startedAt,
      isSubsequent,
      startFlow,
      setChildInfo,
      setDeviceActivated,
      setVoiceprintRegistered,
      setAiPersonality,
      completeFlow,
      isExpired,
    };
  },
  { persist: true },
);
