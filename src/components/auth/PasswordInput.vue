<script setup lang="ts">
import { i18nSubPath } from 'src/utils/common';
import { ref } from 'vue';

const modelValue = defineModel<string | undefined>();
const showPassword = ref(false);
const isFocusedPassword = ref(false);

const i18n = i18nSubPath('components.auth.PasswordInput');
</script>

<template>
  <div class="input-group">
    <div class="input-with-action">
      <input
        class="design-input design-input--flex"
        :type="showPassword ? 'text' : 'password'"
        v-model="modelValue"
        :placeholder="i18n('labels.title')"
        autocomplete="current-password"
        @focus="isFocusedPassword = true"
        @blur="isFocusedPassword = false"
      />
      <button
        v-if="isFocusedPassword || modelValue?.length"
        type="button"
        class="action-icon"
        @click="showPassword = !showPassword"
        aria-label="Toggle password visibility"
      >
        <svg v-if="showPassword" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 4C4 4 1 10 1 10C1 10 4 16 10 16C16 16 19 10 19 10C19 10 16 4 10 4Z"
            stroke="#9398A9"
            stroke-width="1.5"
          />
          <circle cx="10" cy="10" r="3" stroke="#9398A9" stroke-width="1.5" />
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 4C4 4 1 10 1 10C1 10 4 16 10 16C16 16 19 10 19 10C19 10 16 4 10 4Z"
            stroke="#9398A9"
            stroke-width="1.5"
          />
          <line x1="3" y1="3" x2="17" y2="17" stroke="#9398A9" stroke-width="1.5" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ===== Design tokens ===== */
.input-group {
  width: 311px;
  height: 48px;
  position: relative;
  border: 1px solid var(--clr-input-border, rgba(147, 152, 169, 0.2));
  border-radius: var(--input-radius, 8px);
  transition: border-color 0.2s;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
}

.input-group:focus-within {
  border-color: var(--clr-link);
}

.input-with-action {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}

.design-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: var(--clr-input-bg);
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  color: var(--clr-text);
  padding: 13px 16px;
  box-sizing: border-box;
}

.design-input::placeholder {
  font-weight: 400;
  color: var(--clr-placeholder);
}

/* Hide browser-native password reveal/clear buttons */
.design-input::-ms-reveal,
.design-input::-ms-clear,
.design-input::-webkit-password-toggle {
  display: none;
}

.design-input--flex {
  width: calc(100% - 40px);
}

/* ===== Eye icon ===== */
.action-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border: none;
  background: none;
  padding: 0;
}
</style>
