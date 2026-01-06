<script setup lang="ts">
import OverviewCard from 'components/growth-data/OverviewCard.vue';
</script>

<template>
  <q-page class="column q-gutter-y-lg q-pa-md">
    <overview-card
      nickname="Mian Mian"
      gender="female"
      :age="5"
      :weekly-interact="0"
      best-capability="Social"
      hot-topic="Story" />
  </q-page>
  <div
    class="absolute-full"
    style="
      background: linear-gradient(
        180deg,
        rgba(220, 245, 255, 1) 0%,
        rgba(253, 255, 229, 1) 50%,
        rgba(255, 255, 255, 1) 100%
      );
      z-index: -100;
    "
  />
</template>

<style scoped></style>
