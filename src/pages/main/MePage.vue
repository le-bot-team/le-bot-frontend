<script setup lang="ts">
import ProfileCard from 'components/me/ProfileCard.vue';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.main.MePage');

const menuList = [
  {
    icon: 'mdi-list-box-outline',
    label: i18n('labels.myOrders'),
    to: '/stack/orders',
  },
  {
    icon: 'mdi-devices',
    label: i18n('labels.sharedDevices'),
    to: '/stack/devices',
  },
  {
    icon: 'mdi-heart-outline',
    label: i18n('labels.helpAndFeedback'),
    to: '/stack/help',
  },
  {
    icon: 'mdi-tag-outline',
    label: i18n('labels.aboutUs'),
    to: '/stack/about',
  },
  {
    icon: 'mdi-cog-outline',
    label: i18n('labels.settings'),
    to: '/stack/settings',
  },
];
</script>

<template>
  <q-page class="flex flex-center row q-pa-lg">
    <div class="col-grow col-sm-10 col-md-8 col-lg-6 col-xl-4 column justify-center q-gutter-y-lg">
      <profile-card />
      <div class="row q-col-gutter-x-md">
        <div class="col-6">
          <q-card class="bg-light-green-4 text-dark" flat>
            <q-card-section class="items-center" horizontal>
              <div class="absolute-right row items-center q-mr-sm">
                <q-icon color="light-green" name="mdi-gift" size="xl" />
              </div>
              <q-card-section class="text-no-wrap">
                <div class="text-h6">
                  {{ i18n('labels.memberCenter') }}
                </div>
                <div class="text-body1">
                  {{ i18n('labels.memberCenterDescription') }}
                </div>
              </q-card-section>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6">
          <q-card class="bg-light-blue-4 text-dark" flat>
            <q-card-section class="items-center" horizontal>
              <div class="absolute-right row items-center q-mr-sm">
                <q-icon color="light-blue" name="mdi-hand-heart" size="xl" />
              </div>
              <q-card-section class="text-no-wrap">
                <div class="text-h6">
                  {{ i18n('labels.serviceCenter') }}
                </div>
                <div class="text-body1">
                  {{ i18n('labels.serviceCenterDescription') }}
                </div>
              </q-card-section>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <q-card flat>
        <q-list>
          <q-item
            v-for="(menu, index) in menuList"
            :key="index"
            class="q-py-md"
            clickable
            :to="menu.to"
          >
            <q-item-section avatar>
              <q-icon :name="menu.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                {{ menu.label }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped></style>
