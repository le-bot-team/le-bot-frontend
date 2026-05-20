<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed } from 'vue';

import { getMainNavigations } from 'components/navigations';

const { dark } = useQuasar();
const navigations = computed(() => getMainNavigations());
</script>

<template>
  <q-footer class="bg-transparent">
    <q-toolbar :class="{ 'text-dark': !dark.isActive}">
      <q-tabs class="full-width" active-color="primary" dense indicator-color="transparent" no-caps>
        <q-route-tab
          v-for="(navigation, index) in navigations"
          :key="index"
          :disable="!navigation.available"
          exact
          :icon="navigation.icon"
          :label="navigation.label"
          :to="navigation.route"
        />
      </q-tabs>
    </q-toolbar>
  </q-footer>
</template>

<style scoped></style>
