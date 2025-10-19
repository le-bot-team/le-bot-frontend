<script setup lang="ts">
defineProps<{
  name: string | number;
}>();
</script>

<template>
  <q-tab-panel class="q-gutter-y-md" :name="name"> </q-tab-panel>
</template>

<style scoped></style>
