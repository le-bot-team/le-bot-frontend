<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useRoute } from 'vue-router';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { STACK_NAVIGATIONS } from 'components/navigations';

import { bus } from 'src/boot/bus';
import { router } from 'src/router';
import { useDeviceStore } from 'stores/device';
import { useChatStore } from 'stores/chat';

/**
 * Optional action button declared on a route via `meta.headerActions`.
 * `icon` is a CSS modifier suffix that maps to a global
 * `.stack-header-action--<suffix>` class defined in app.scss.
 * `event` is emitted on the global bus when the button is tapped
 * (see src/boot/bus.ts for the registered event map).
 */
interface HeaderActionMeta {
  icon: string;
  event: 'chat:mute' | 'chat:call' | 'chat:text-toggle';
  ariaLabel?: string;
  ariaLabelKey?: string;
}

const { dark } = useQuasar();
const i18n = useI18n();
const route = useRoute();
const deviceStore = useDeviceStore();
const { currentDevice, virtualDevices } = storeToRefs(deviceStore);
const chatStore = useChatStore();

// Mute state synced from ChatPage via bus (initialized from persisted store)
const isMuted = ref(chatStore.isMuted);

// Text mode toggle state synced from VoiceCallPage via bus
const isTextMode = ref(true);

// Reset header action states when navigating away from relevant routes.
watch(
  () => route.name,
  (newName, oldName) => {
    if (oldName === 'chat-voice-call' && newName !== 'chat-voice-call') {
      isTextMode.value = true;
    }
    if (oldName === 'chat' && newName !== 'chat') {
      isMuted.value = chatStore.isMuted;
    }
  },
);

// Title resolution priority:
//   1. Chat page: show current device name (e.g. "xx的乐宝"), fallback to i18n default
//   2. `route.meta.title` as an i18n key (e.g. "pages.stack.ChatPage.labels.pageTitle")
//   3. STACK_NAVIGATIONS label lookup (legacy path)
const title = computed(() => {
  // Chat page: dynamic device name
  if (route.name === 'chat' || route.name === 'chat-voice-call') {
    const childName = currentDevice.value?.childInfo?.name;
    if (childName)
      return i18n.t('pages.main.HomePage.deviceSwitch.deviceNameFormat', { name: childName });
    const deviceName = currentDevice.value?.name;
    if (deviceName) return deviceName;
  }
  const metaTitle = route.meta?.title as string | undefined;
  if (metaTitle && i18n.te(metaTitle)) return i18n.t(metaTitle);
  return (
    STACK_NAVIGATIONS.find((navigation) => navigation.route === route.name?.toString())?.label ?? ''
  );
});

const headerActions = computed<HeaderActionMeta[]>(
  () => (route.meta?.headerActions as HeaderActionMeta[] | undefined) ?? [],
);

function onActionTap(action: HeaderActionMeta) {
  bus.emit(action.event);
}

function onMuteStateChange(muted: boolean) {
  isMuted.value = muted;
}

function onTextModeChange(show: boolean) {
  isTextMode.value = show;
}

onMounted(() => {
  bus.on('chat:mute-state', onMuteStateChange);
  bus.on('chat:text-mode-state', onTextModeChange);
});

onBeforeUnmount(() => {
  bus.off('chat:mute-state', onMuteStateChange);
  bus.off('chat:text-mode-state', onTextModeChange);
});

// Hide the back button when:
//   1. Route meta explicitly sets hideBackButton, OR
//   2. On add-virtual-device page with no virtual devices yet (first device flow)
// Use storeToRefs-unwrapped `virtualDevices` to guarantee reactivity tracking.
const hideBackButton = computed(() => {
  if (route.meta?.hideBackButton) return true;
  if (route.name === 'add-virtual-device' && virtualDevices.value.length === 0) return true;
  return false;
});

function goBack() {
  // If there's no in-app history (deep link / fresh tab), fall back to home.
  if (window.history.length <= 1) {
    void router.replace('/main/home');
  } else {
    router.go(-1);
  }
}
</script>

<template>
  <q-header
    bordered
    class="bg-transparent"
    :class="{
      'text-dark': !dark.isActive,
    }"
  >
    <q-toolbar>
      <div v-if="!hideBackButton" class="absolute-left column justify-center full-height q-pl-sm">
        <q-btn flat icon="arrow_back_ios_new" round @click="goBack" />
      </div>
      <q-toolbar-title class="text-center">
        {{ title }}
      </q-toolbar-title>
      <div
        v-if="headerActions.length"
        class="absolute-right column justify-center full-height q-pr-md"
      >
        <div class="row items-center stack-header-actions">
          <button
            v-for="action in headerActions"
            :key="action.icon"
            type="button"
            class="stack-header-action"
            :class="[
              `stack-header-action--${action.icon}`,
              action.icon === 'chat-mute' && isMuted ? 'stack-header-action--chat-mute-muted' : '',
              action.icon === 'chat-text-toggle' && !isTextMode
                ? 'stack-header-action--chat-text-toggle-off'
                : '',
            ]"
            :aria-label="
              action.ariaLabelKey && i18n.te(action.ariaLabelKey)
                ? i18n.t(action.ariaLabelKey)
                : (action.ariaLabel ?? action.icon)
            "
            @click="onActionTap(action)"
          />
        </div>
      </div>
    </q-toolbar>
  </q-header>
</template>

<style scoped>
.q-header {
  padding-top: env(safe-area-inset-top, 0px);
}
</style>
