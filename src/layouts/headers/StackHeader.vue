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
const i18n = useI18n();

const title = computed(() => {
  // Priority 1: route.meta.title (i18n key)
  const metaTitle = route.meta?.title as string | undefined;
  if (metaTitle && i18n.te(metaTitle)) {
    return i18n.t(metaTitle);
  }
  // Priority 2: STACK_NAVIGATIONS lookup
  return STACK_NAVIGATIONS.find((navigation) => navigation.route === route.name?.toString())?.label;
});

const hideBackButton = computed(() => !!route.meta?.hideBackButton);

const headerActions = computed(
  () => (route.meta?.headerActions as Array<{ icon: string; event: string; ariaLabel: string }>) || [],
);

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    void router.push('/main/home');
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
      <div v-if="headerActions.length" class="absolute-right column justify-center full-height q-pr-sm">
        <div class="row no-wrap">
          <q-btn
            v-for="action in headerActions"
            :key="action.event"
            flat
            :icon="action.icon"
            round
            size="sm"
            :aria-label="action.ariaLabel"
            @click="bus.emit(action.event as any)"
          />
        </div>
      </div>
    </q-toolbar>
  </q-header>
</template>

<style scoped></style>
