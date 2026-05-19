<script setup lang="ts">
// BirthdayPicker — A simple year/month/day date picker for profile setup.
// Emits ISO date string (YYYY-MM-DD) via v-model.
// When modelValue is empty, shows placeholder options (no date selected).
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    defaultYear?: number;
  }>(),
  {
    modelValue: '',
    defaultYear: 1995,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

// Parse initial value
const parseDate = (val: string) => {
  if (!val) return null;
  const parts = val.split('-').map(Number);
  if (!parts[0] || !parts[1] || !parts[2]) return null;
  return { y: parts[0], m: parts[1], d: parts[2] };
};

const initial = parseDate(props.modelValue);
const year = ref<number | null>(initial?.y ?? null);
const month = ref<number | null>(initial?.m ?? null);
const day = ref<number | null>(initial?.d ?? null);

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => 1920 + i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);

const daysInMonth = computed(() => {
  if (!year.value || !month.value) return 31;
  return new Date(year.value, month.value, 0).getDate();
});

const days = computed(() => Array.from({ length: daysInMonth.value }, (_, i) => i + 1));

// Clamp day if month/year changes
watch([year, month], () => {
  if (day.value && day.value > daysInMonth.value) {
    day.value = daysInMonth.value;
  }
});

// Emit formatted date when all fields are selected
watch(
  [year, month, day],
  () => {
    if (year.value && month.value && day.value) {
      const m = String(month.value).padStart(2, '0');
      const d = String(day.value).padStart(2, '0');
      emit('update:modelValue', `${year.value}-${m}-${d}`);
    }
  },
);

// Emit immediately if modelValue was provided on mount
if (initial) {
  const m = String(initial.m).padStart(2, '0');
  const d = String(initial.d).padStart(2, '0');
  emit('update:modelValue', `${initial.y}-${m}-${d}`);
}

// Sync from parent
watch(
  () => props.modelValue,
  (val) => {
    const parsed = parseDate(val);
    if (parsed) {
      year.value = parsed.y;
      month.value = parsed.m;
      const maxDay = new Date(parsed.y, parsed.m, 0).getDate();
      day.value = Math.min(parsed.d, maxDay);
    } else {
      year.value = null;
      month.value = null;
      day.value = null;
    }
  },
);
</script>

<template>
  <div class="birthday-picker">
    <select v-model.number="year" class="birthday-picker__select birthday-picker__select--year" :class="{ 'birthday-picker__select--placeholder': !year }" aria-label="Year">
      <option :value="null" disabled hidden>YYYY</option>
      <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
    </select>
    <select v-model.number="month" class="birthday-picker__select birthday-picker__select--month" :class="{ 'birthday-picker__select--placeholder': !month }" aria-label="Month">
      <option :value="null" disabled hidden>MM</option>
      <option v-for="m in months" :key="m" :value="m">{{ String(m).padStart(2, '0') }}</option>
    </select>
    <select v-model.number="day" class="birthday-picker__select birthday-picker__select--day" :class="{ 'birthday-picker__select--placeholder': !day }" aria-label="Day">
      <option :value="null" disabled hidden>DD</option>
      <option v-for="d in days" :key="d" :value="d">{{ String(d).padStart(2, '0') }}</option>
    </select>
  </div>
</template>

<style scoped>
.birthday-picker {
  display: flex;
  gap: 8px;
  width: 100%;
}

.birthday-picker__select {
  flex: 1;
  height: 44px;
  border: 1px solid rgba(147, 152, 169, 0.3);
  border-radius: 8px;
  padding: 0 12px;
  font-size: 15px;
  color: var(--clr-text, #120e2c);
  background: var(--clr-input-bg, #fff);
  appearance: none;
  -webkit-appearance: none;
  outline: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%239398A9' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

.birthday-picker__select--placeholder {
  color: var(--clr-text-secondary, #9398a9);
}

.birthday-picker__select--year {
  flex: 1.4;
}
</style>
