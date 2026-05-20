<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { STACK_NAVIGATIONS } from 'components/navigations';
import { bus } from 'src/boot/bus';
import { router } from 'src/router';

const { dark } = useQuasar();
const route = useRoute();
const { t, te } = useI18n();

const title = computed(() => {
  // Priority 1: route.meta.title (i18n key)
  const metaTitle = route.meta?.title as string | undefined;
  if (metaTitle && te(metaTitle)) {
    return t(metaTitle);
  }
  // Priority 2: STACK_NAVIGATIONS lookup
  return STACK_NAVIGATIONS.find((navigation) => navigation.route === route.name?.toString())?.label;
});

const isChatRoute = computed(() => route.name === 'chat');

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/main/home');
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
      <div class="absolute-left column justify-center full-height q-pl-sm">
        <q-btn flat icon="arrow_back_ios_new" round @click="goBack" />
      </div>
      <q-toolbar-title class="text-center">
        {{ title }}
      </q-toolbar-title>
      <div v-if="isChatRoute" class="absolute-right column justify-center full-height q-pr-sm">
        <div class="row no-wrap">
          <q-btn flat icon="volume_off" round size="sm" aria-label="Mute" @click="bus.emit('chat:mute')" />
          <q-btn flat icon="phone" round size="sm" aria-label="Call" @click="bus.emit('chat:call')" />
        </div>
      </div>
    </q-toolbar>
  </q-header>
</template>

<style scoped></style>
