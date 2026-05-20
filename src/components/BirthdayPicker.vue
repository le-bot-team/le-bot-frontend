<script setup lang="ts">
/**
 * BirthdayPicker — date picker for selecting a child's birthday.
 * Renders a native-style date input with optional placeholder and default year.
 */
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    defaultYear?: number;
  }>(),
  {
    modelValue: '',
    placeholder: '',
    defaultYear: 2020,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const inputRef = ref<HTMLInputElement | null>(null);

const displayValue = computed(() => {
  if (props.modelValue) {
    const parts = props.modelValue.split('-');
    const y = parts[0] ?? '';
    const m = parts[1] ?? '';
    const d = parts[2] ?? '';
    return `${y}年${parseInt(m)}月${parseInt(d)}日`;
  }
  return '';
});

function openPicker() {
  const el = inputRef.value;
  if (!el) return;
  // showPicker() not available on Safari 14; the input covers the full area
  // so native click-to-open works as fallback without needing el.click()
  if (typeof el.showPicker === 'function') {
    el.showPicker();
  }
}

function onDateChange(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}

// Default max date: today (local timezone); default value hint for picker
const today = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
});
const defaultDate = computed(() => `${props.defaultYear}-06-01`);
</script>

<template>
  <div class="birthday-picker" @click="openPicker">
    <span v-if="displayValue" class="birthday-picker__value">{{ displayValue }}</span>
    <span v-else class="birthday-picker__placeholder">{{ placeholder }}</span>
    <input
      ref="inputRef"
      type="date"
      class="birthday-picker__input"
      :value="modelValue || defaultDate"
      :max="today"
      min="2000-01-01"
      @change="onDateChange"
    />
  </div>
</template>

<style scoped>
.birthday-picker {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1px solid var(--clr-input-border, #e0e0e0);
  border-radius: 12px;
  background: var(--clr-white, #fff);
  cursor: pointer;
}

.birthday-picker__value {
  font-size: 15px;
  color: var(--clr-text-primary, #151717);
}

.birthday-picker__placeholder {
  font-size: 15px;
  color: var(--clr-text-placeholder, #9398a9);
}

.birthday-picker__input {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  /* Allow click-through to trigger native picker */
}
</style>
