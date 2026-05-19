<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

import { STACK_NAVIGATIONS } from 'components/navigations';
import { bus } from 'src/boot/bus';
import { router } from 'src/router';

const { dark } = useQuasar();
const route = useRoute();

const title = computed(
  () => STACK_NAVIGATIONS.find((navigation) => navigation.route === route.name?.toString())?.label,
);

const isChatRoute = computed(() => route.name === 'chat');
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
        <q-btn flat icon="arrow_back_ios_new" round @click="router.go(-1)" />
      </div>
      <q-toolbar-title class="text-center">
        {{ title }}
      </q-toolbar-title>
      <div v-if="isChatRoute" class="absolute-right column justify-center full-height q-pr-sm">
        <div class="row no-wrap">
          <q-btn flat icon="volume_off" round size="sm" @click="bus.emit('chat:mute')" />
          <q-btn flat icon="phone" round size="sm" @click="bus.emit('chat:call')" />
        </div>
      </div>
    </q-toolbar>
  </q-header>
</template>

<style scoped></style>
