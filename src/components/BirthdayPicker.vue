<script setup lang="ts">
/**
 * BirthdayPicker — Mobile-friendly birthday selector.
 *
 * Uses native <input type="date"> which:
 * - Mobile: triggers system-native wheel picker (best UX)
 * - Desktop: triggers system-native date picker
 * - Prevents future dates via :max
 */
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    disabled?: boolean;
  }>(),
  {
    modelValue: '',
    placeholder: '请选择生日',
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

// Today's date in YYYY-MM-DD for :max attribute
const today = new Date().toISOString().split('T')[0];

// Ref to the native input element
const nativeInput = ref<HTMLInputElement>();

// Click on trigger → focus the hidden native input
const openPicker = () => {
  if (props.disabled) return;
  nativeInput.value?.click();
};

// Emit with YYYY-MM-DD (native input already returns this format)
const onChange = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  if (val) {
    emit('update:modelValue', val);
  }
};
</script>

<template>
  <div
    class="birthday-picker"
    :class="{ 'birthday-picker--disabled': disabled }"
    @click="openPicker"
  >
    <!-- Visual shell: border + background, stays behind everything -->
    <div class="birthday-picker__shell" />

    <!-- Value text + arrow: visual layer above input -->
    <span
      class="birthday-picker__value"
      :class="{ 'birthday-picker__value--placeholder': !modelValue }"
    >
      {{ modelValue || placeholder }}
    </span>
    <svg
      class="birthday-picker__arrow"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        d="M2 4L6 8L10 4"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <!-- Hidden native date input: sits on top to capture clicks -->
    <input
      ref="nativeInput"
      type="date"
      class="birthday-picker__native"
      :value="modelValue"
      :max="today"
      :disabled="disabled"
      @change="onChange"
    />
  </div>
</template>

<style scoped lang="scss">
.birthday-picker {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 48px;
  padding: 0 16px;
  box-sizing: border-box;
  cursor: pointer;

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// Visual shell — border and background, positioned below input but above nothing
.birthday-picker__shell {
  position: absolute;
  inset: 0;
  border-radius: 8px;
  border: 1px solid rgba(147, 152, 169, 0.2);
  background: var(--clr-card-bg);
  pointer-events: none;
}

// Native date input — invisible, on top, captures all clicks
.birthday-picker__native {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  color: transparent;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  z-index: 1;
  border-radius: 8px;

  &::-webkit-calendar-picker-indicator {
    opacity: 0;
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
}

.birthday-picker__value {
  position: relative;
  z-index: 0;
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  color: var(--clr-text);
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &--placeholder {
    font-weight: 400;
    color: var(--clr-caption);
  }
}

.birthday-picker__arrow {
  position: relative;
  z-index: 0;
  color: var(--clr-caption);
  flex-shrink: 0;
  pointer-events: none;
}
</style>
