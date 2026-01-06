<script setup lang="ts">
import { useQuasar } from 'quasar';

import { i18nSubPath } from 'src/utils/common';

defineProps<{
  avatar?: string;
  nickname?: string;
  gender?: 'male' | 'female';
  age?: number;
  weeklyInteract: number;
  bestCapability: string;
  hotTopic: string;
}>();

const i18n = i18nSubPath('components.growthData.OverviewCard');

const { dark } = useQuasar();
</script>

<template>
  <q-card flat>
    <q-card-section class="q-gutter-y-md">
      <div class="row items-center q-gutter-x-md">
        <q-avatar
          class="cursor-pointer"
          size="4rem"
          style="border: 1px solid #c2c2c2"
          :text-color="dark.isActive ? 'grey-5' : 'grey-8'"
        >
          <q-img v-if="avatar" :src="avatar" />
          <q-icon v-else name="person" size="lg" />
        </q-avatar>
        <div class="column">
          <div class="text-h6">
            {{ nickname ?? i18n('labels.unknown') }}
          </div>
          <div class="text-grey row items-center q-gutter-x-md">
            <div>
              {{ gender ? i18n(`labels.${gender}`) : i18n('labels.unknown') }}
            </div>
            <div>
              {{ age ? i18n('labels.age', { age }) : i18n('labels.unknown') }}
            </div>
          </div>
        </div>
      </div>
      <q-card class="bg-teal-1 column text-center" flat>
        <div class="row">
          <div class="col-4 column justify-center">
            <div class="text-h6">
              {{ i18n('labels.hours', { hours: weeklyInteract }) }}
            </div>
            <div class="text-caption text-grey">
              {{ i18n('labels.weeklyInteract') }}
            </div>
          </div>
          <div class="col-4 row">
            <div class="self-center bg-teal-3" style="border-radius: 1px; width: 2px; height: 50%" />
            <div class="col-grow column justify-center">
              <div class="text-h6">
                {{ bestCapability }}
              </div>
              <div class="text-caption text-grey">
                {{ i18n('labels.bestCapability') }}
              </div>
            </div>
            <div class="self-center bg-teal-3" style="border-radius: 1px; width: 2px; height: 50%" />
          </div>
          <div class="col-4 column justify-center">
            <div class="text-h6">
              {{ hotTopic }}
            </div>
            <div class="text-caption text-grey">
              {{ i18n('labels.hotTopic') }}
            </div>
          </div>
        </div>
      </q-card>
    </q-card-section>
    <div
      class="absolute-top-right bg-light-blue-2 text-light-blue items-center row q-py-xs q-px-sm q-gutter-x-xs"
      style="border-radius: 0 4px 0 4px"
    >
      <q-icon name="mdi-heart-multiple" />
      <div>
        {{ i18n('labels.accompanyTime', { hours: 0 }) }}
      </div>
    </div>
  </q-card>
</template>

<style scoped></style>
