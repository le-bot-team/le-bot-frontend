<script setup lang="ts">
// OnboardingCompletePage — Post-registration landing page.
// User can choose: add a virtual device OR scan to join an existing family group.
</script>

<template>
  <q-page class="onboarding-complete-page">
    <div class="onboarding-complete-container">
      <div class="onboarding-complete-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="32" fill="#E8F9EE" />
          <path
            d="M20 32L28 40L44 24"
            stroke="#34C759"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <h2 class="onboarding-complete-title">注册完成</h2>
      <p class="onboarding-complete-desc">欢迎加入乐宝！请选择下一步操作：</p>

      <div class="onboarding-complete-actions">
        <button class="auth-btn-primary" @click="$router.replace('/main/home')">
          添加虚拟设备
        </button>
        <button class="auth-btn-weak" @click="$router.replace('/main/home')">
          扫码加入家庭组
        </button>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.onboarding-complete-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.onboarding-complete-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  max-width: 375px;
  width: 100%;
}

.onboarding-complete-icon {
  margin-bottom: 24px;
}

.onboarding-complete-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--clr-text, #120e2c);
  margin: 0 0 8px;
}

.onboarding-complete-desc {
  font-size: 15px;
  color: var(--clr-text-secondary, #9398a9);
  margin: 0 0 40px;
}

.onboarding-complete-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}
</style>
