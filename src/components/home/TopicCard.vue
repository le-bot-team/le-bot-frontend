<script setup lang="ts">
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('components.home.TopicCard');

const pseudoTopics = [
  { name: 'Drawing', tag: 'general' },
  { name: 'Kitten', tag: 'general' },
  { name: 'Music', tag: 'general' },
  { name: 'Travel', tag: 'general' },
  { name: 'TicTakToe', tag: 'general' },
  { name: 'Recipes', tag: 'general' },
];
</script>

<template>
  <q-card bordered flat>
    <q-card-section class="column q-gutter-y-md">
      <div class="row items-center justify-between">
        <div class="text-h6">
          {{ i18n('labels.title') }}
        </div>
        <q-btn
          dense
          flat
          icon-right="mdi-chevron-right"
          :label="i18n('labels.chatHistory')"
          no-caps
        />
      </div>
      <div class="row">
        <q-chip v-for="(topic, index) in pseudoTopics" :key="index" clickable icon="mdi-pound-box">
          {{ topic.name }}
        </q-chip>
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped></style>
