<script setup lang="ts">
import { useQuasar } from 'quasar';
import { reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useProfileStore } from 'stores/profile';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.ProfilePage');

const { profile } = useProfileStore();
const { dark } = useQuasar();
const route = useRoute();

const isEditing = ref<boolean>(route.query.edit === 'true');

const editableItems = reactive([
  {
    clearable: true,
    counter: true,
    label: i18n('labels.nickname'),
    maxlength: 32,
    value: profile?.nickname,
  },
  {
    label: i18n('labels.region'),
    value: profile?.region,
  },
  {
    autogrow: true,
    clearable: true,
    counter: true,
    label: i18n('labels.bio'),
    maxlength: 256,
    value: profile?.bio,
  },
]);
</script>

<template>
  <q-page class="column q-gutter-y-lg q-pa-lg">
    <div class="column items-center q-gutter-y-sm">
      <q-avatar
        class="cursor-pointer"
        size="calc(max(10vw, 5rem))"
        style="border: 1px solid #c2c2c2"
        :text-color="dark.isActive ? 'grey-5' : 'grey-8'"
      >
        <q-img v-if="profile?.avatar" :src="profile?.avatar" />
        <q-icon v-else name="person" size="calc(max(8vw, 4rem))" />
      </q-avatar>
      <div v-if="profile" class="text-grey">ID: {{ profile.id }}</div>
    </div>
    <q-card>
      <div class="column q-gutter-y-md q-py-sm">
        <div
          v-for="(editableItem, index) in editableItems"
          :key="index"
          class="row items-center justify-between q-gutter-x-md q-px-md"
        >
          <div class="text-body1">
            {{ editableItem.label }}
          </div>
          <div class="col-grow" style="max-width: 300px">
            <q-input
              v-if="isEditing"
              :autogrow="editableItem.autogrow"
              :clearable="editableItem.clearable"
              :counter="editableItem.counter"
              dense
              input-class="text-right"
              :maxlength="editableItem.maxlength"
              v-model="editableItem.value"
            />
            <q-item-label
              v-else
              class="text-body2 text-right"
              :class="{ 'text-grey text-italic': !editableItem.value }"
            >
              {{ editableItem.value || i18n('labels.notSet') }}
            </q-item-label>
          </div>
        </div>
      </div>
    </q-card>
    <q-card>
      <q-list separator>
        <q-item>
          <q-item-section>
            <q-item-label class="text-body1">
              {{ i18n('labels.changePassword') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label class="text-body1">
              {{ i18n('labels.bindEmail') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label class="text-body1">
              {{ i18n('labels.bindPhone') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" />
          </q-item-section>
        </q-item>
        <q-item class="text-red">
          <q-item-section>
            <q-item-label class="text-body1">
              {{ i18n('labels.removeAccount') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon color="red" name="chevron_right" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-page>
</template>

<style scoped></style>
