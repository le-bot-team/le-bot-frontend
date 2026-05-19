<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

import { useProfileStore } from 'stores/profile';
import { useAuthStore } from 'stores/auth';
import { useDeviceStore } from 'stores/device';
import { i18nSubPath } from 'src/utils/common';
import { deactivateAccount } from 'src/utils/api/profile';
import ConfirmDialog from 'src/components/ConfirmDialog.vue';

const i18n = i18nSubPath('pages.stack.ProfilePage');

const router = useRouter();
const $q = useQuasar();

const profileStore = useProfileStore();
const { profile } = storeToRefs(profileStore);
const { updateProfile } = profileStore;

const authStore = useAuthStore();
const { accessToken } = storeToRefs(authStore);

const deviceStore = useDeviceStore();

// ID account display text (e.g. "ID账号：LB55667788")
const idAccountText = computed(() =>
  profile.value?.id ? i18n('labels.idAccount', { id: profile.value.id }) : '',
);

// Menu rows — single card per design 448a71c7 (编辑资料):
// 昵称, 生日, 手机号, 修改密码
type FieldKey = 'nickname' | 'birthday';

interface EditableRow {
  key: FieldKey;
  label: string;
  value?: string;
  editable: true;
}

interface NavigationRow {
  key: string;
  label: string;
  value?: string;
  to: string;
}

type ProfileRow = EditableRow | NavigationRow;

const profileRows = computed<ProfileRow[]>(() => [
  {
    key: 'nickname',
    label: i18n('labels.nickname'),
    value: profile.value?.nickname ?? '',
    editable: true,
  },
  {
    key: 'birthday',
    label: i18n('labels.birthday'),
    value: profile.value?.birthday ?? '',
    editable: true,
  },
  {
    key: 'phone',
    label: i18n('labels.phone'),
    value: profile.value?.phone ?? '',
    to: '/stack/profile/change-phone',
  },
  {
    key: 'changePassword',
    label: i18n('labels.changePassword'),
    to: '/stack/profile/change-password',
  },
]);

const goEditField = (key: FieldKey) => {
  void router.push({ path: '/stack/profile/edit', query: { field: key } });
};

const onRowClick = (row: ProfileRow) => {
  if ('to' in row) {
    void router.push(row.to);
  } else {
    goEditField(row.key);
  }
};

const onDeactivate = () => {
  $q.dialog({
    component: ConfirmDialog,
    componentProps: {
      title: i18n('labels.deactivateTitle'),
      body: i18n('labels.deactivateConfirm'),
      confirmType: 'danger',
      confirmLabel: i18n('labels.deactivateConfirmOk'),
    },
  }).onOk(() => {
    const token = accessToken.value;
    if (!token) {
      $q.notify({ type: 'negative', message: i18n('notifications.notLoggedIn') });
      return;
    }
    deactivateAccount(token)
      .then(({ data }) => {
        if (data.success) {
          $q.notify({ type: 'positive', message: i18n('notifications.deactivateSuccess') });
          accessToken.value = '';
          updateProfile(undefined);
          deviceStore.updateDevices([]);
          void router.replace('/main/home');
        } else {
          $q.notify({ type: 'negative', message: data.message });
        }
      })
      .catch(() => {
        $q.notify({ type: 'negative', message: i18n('notifications.deactivateFailed') });
      });
  });
};
</script>

<template>
  <q-page class="profile-page column items-center q-pa-lg q-gutter-y-lg">
    <div class="profile-container column items-center q-gutter-y-lg">
      <!-- Avatar: 72×72 with 3px white border (圆形 33, design 448a71c7) -->
      <div class="me-avatar profile-avatar">
        <q-img v-if="profile?.avatar" :src="profile.avatar" />
        <q-icon v-else color="grey-5" name="person" size="40px" />
      </div>

      <!-- ID account text below avatar (design 448a71c7: 14px Regular, rgba(99,104,104,1)) -->
      <div v-if="idAccountText" class="profile-id-text">
        {{ idAccountText }}
      </div>

      <!-- Single card with all 4 menu rows (design 448a71c7: 矩形 1903, 335×248, radius 12) -->
      <div class="me-card full-width">
        <q-list separator>
          <q-item
            v-for="row in profileRows"
            :key="row.key"
            class="profile-row"
            clickable
            @click="onRowClick(row)"
          >
            <q-item-section>
              <q-item-label class="profile-row-label">
                {{ row.label }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row items-center no-wrap q-gutter-x-sm">
                <span
                  v-if="row.value !== undefined"
                  class="profile-row-value"
                  :class="{ 'profile-row-value--empty': !row.value }"
                >
                  {{ row.value || i18n('labels.notSet') }}
                </span>
                <q-icon color="grey-6" name="chevron_right" />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Deactivate button (矩形 1907: 335×56, rgba(255,93,93,1), radius 28) -->
      <button class="me-btn-danger" type="button" @click="onDeactivate">
        {{ i18n('labels.removeAccount') }}
      </button>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
// Design 448a71c7 artboard fill: rgba(241,248,248,1) ≈ --clr-page-bg-neutral
// No glow effects on this page (unlike MePage).
.profile-page {
  background: var(--clr-page-bg-neutral);
  min-height: 100%;
}

.profile-container {
  width: 100%;
  max-width: 480px;
}

.profile-avatar {
  // ProfilePage preserves 72×72 ring (verified against raw JSON 圆形 33 of 448a71c7).
  // Global --profile-avatar-size is 64px (MePage-first); override locally.
  width: 72px;
  height: 72px;
}

// ID account text below avatar (design 448a71c7: "ID账号：LB55667788")
// 14px Regular, rgba(99,104,104,1), center-aligned
.profile-id-text {
  font-family: var(--font-family);
  font-size: var(--font-size-small); // 14px
  font-weight: 400;
  line-height: 24px;
  color: var(--clr-text-secondary); // rgba(83,89,89,1) — closest to design rgba(99,104,104,1)
  text-align: center;
}

.profile-row {
  min-height: var(--menu-row-height);
}

.profile-row-label {
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  font-weight: 400;
  line-height: var(--line-height-body);
  color: var(--clr-text);
}

.profile-row-value {
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  font-weight: 400;
  line-height: var(--line-height-body);
  color: var(--clr-caption); // rgba(147,152,169,1) — matches design placeholder color
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &--empty {
    color: var(--clr-caption);
    font-style: italic;
  }
}
</style>
