<script setup lang="ts">

/**
 * BirthdayPicker — Mobile-friendly birthday selector with three custom selects.
 *
 * Replaces native <input type="date"> with year/month/day dropdowns in a bottom sheet.
 * Props are backward-compatible with the previous native-input implementation.
 */
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    disabled?: boolean;
    /** Default year shown when no value is selected */
    defaultYear?: number;
    /** Minimum selectable year */
    minYear?: number;
    /** Maximum selectable year (defaults to current year) */
    maxYear?: number;
  }>(),
  {
    modelValue: '',
    placeholder: '请选择生日',
    disabled: false,
    defaultYear: new Date().getFullYear() - 30,
    minYear: 1900,
    maxYear: new Date().getFullYear(),
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

// --- Option arrays ---

const monthOptions = [
  { label: '1月', value: '01' },
  { label: '2月', value: '02' },
  { label: '3月', value: '03' },
  { label: '4月', value: '04' },
  { label: '5月', value: '05' },
  { label: '6月', value: '06' },
  { label: '7月', value: '07' },
  { label: '8月', value: '08' },
  { label: '9月', value: '09' },
  { label: '10月', value: '10' },
  { label: '11月', value: '11' },
  { label: '12月', value: '12' },
];

const yearOptions = computed(() => {
  const years = [];
  for (let y = props.maxYear; y >= props.minYear; y--) {
    years.push({ label: `${y}年`, value: String(y) });
  }
  return years;
});

const dayOptions = Array.from({ length: 31 }, (_, i) => {
  const d = String(i + 1).padStart(2, '0');
  return { label: `${i + 1}日`, value: d };
});

// --- Internal state (initialized to defaults, synced when modelValue changes) ---

const parseDate = (val: string) => {
  if (val && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
    return {
      year: val.slice(0, 4),
      month: val.slice(5, 7),
      day: val.slice(8, 10),
    };
  }
  return {
    year: String(props.defaultYear),
    month: '01',
    day: '01',
  };
};

const { year: initYear, month: initMonth, day: initDay } = parseDate(props.modelValue);

const selectedYear = ref<string>(initYear);
const selectedMonth = ref<string>(initMonth);
const selectedDay = ref<string>(initDay);

// Sync from modelValue (e.g. parent resets the field)
watch(
  () => props.modelValue,
  (val) => {
    if (val === '') {
      // Reset to defaults when parent clears the value
      selectedYear.value = String(props.defaultYear);
      selectedMonth.value = '01';
      selectedDay.value = '01';
      return;
    }
    const { year, month, day } = parseDate(val);
    selectedYear.value = year;
    selectedMonth.value = month;
    selectedDay.value = day;
  },
);

// --- Computed ---

const showPlaceholder = computed(() => !props.modelValue);

// Days available for the selected year/month (handles leap years) — used for committed state
const daysInMonth = computed(() => {
  const y = parseInt(selectedYear.value || '2000', 10);
  const m = parseInt(selectedMonth.value || '1', 10);
  return new Date(y, m, 0).getDate();
});

// Days available based on BUFFERED year/month (used while picker is open)
const bufDaysInMonth = computed(() => {
  const y = parseInt(bufYear.value || '2000', 10);
  const m = parseInt(bufMonth.value || '1', 10);
  return new Date(y, m, 0).getDate();
});

const bufAvailableDayOptions = computed(() => {
  return dayOptions.filter((d) => parseInt(d.value, 10) <= bufDaysInMonth.value);
});

// Clamp selectedDay when month/year changes
watch([selectedYear, selectedMonth], () => {
  const maxDay = daysInMonth.value;
  if (parseInt(selectedDay.value, 10) > maxDay) {
    selectedDay.value = String(maxDay).padStart(2, '0');
  }
});

// --- Buffered selection while picker is open (committed on confirm, discarded on cancel) ---

const bufYear = ref(selectedYear.value);
const bufMonth = ref(selectedMonth.value);
const bufDay = ref(selectedDay.value);

// Clamp buffered day when year/month changes
watch([bufYear, bufMonth], () => {
  const y = parseInt(bufYear.value || '2000', 10);
  const m = parseInt(bufMonth.value || '1', 10);
  const maxDay = new Date(y, m, 0).getDate();
  if (parseInt(bufDay.value, 10) > maxDay) {
    bufDay.value = String(maxDay).padStart(2, '0');
  }
});

// --- Scroll position: index of the active item in each column (uses buffer refs) ---

const yearScrollIndex = computed(() => {
  const idx = yearOptions.value.findIndex((o) => o.value === bufYear.value);
  return idx >= 0 ? idx : 0;
});

const monthScrollIndex = computed(() => {
  const idx = monthOptions.findIndex((o) => o.value === bufMonth.value);
  return idx >= 0 ? idx : 0;
});

const dayScrollIndex = computed(() => {
  const idx = bufAvailableDayOptions.value.findIndex((o) => o.value === bufDay.value);
  return idx >= 0 ? idx : 0;
});

// Refs for scroll areas to programmatically scroll to the active item
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yearScrollRef = ref<any>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const monthScrollRef = ref<any>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dayScrollRef = ref<any>();

// After menu opens, initialize buffers and scroll each column to show the selected item
const onMenuShow = () => {
  // Initialize buffer from current selection
  bufYear.value = selectedYear.value;
  bufMonth.value = selectedMonth.value;
  bufDay.value = selectedDay.value;
  const ITEM_HEIGHT = 37; // px, matches .birthday-picker__option height + padding
  setTimeout(() => {
    yearScrollRef.value?.setScrollPosition('vertical', yearScrollIndex.value * ITEM_HEIGHT, 0);
    monthScrollRef.value?.setScrollPosition('vertical', monthScrollIndex.value * ITEM_HEIGHT, 0);
    dayScrollRef.value?.setScrollPosition('vertical', dayScrollIndex.value * ITEM_HEIGHT, 0);
  }, 50);
};

// --- Emit & close ---

const onYearChange = (val: string) => { bufYear.value = val; };
const onMonthChange = (val: string) => { bufMonth.value = val; };
const onDayChange = (val: string) => { bufDay.value = val; };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const menuRef = ref<any>();

function onConfirm() {
  selectedYear.value = bufYear.value;
  selectedMonth.value = bufMonth.value;
  selectedDay.value = bufDay.value;
  // Validate: don't allow future dates
  const composed = new Date(
    parseInt(selectedYear.value, 10),
    parseInt(selectedMonth.value, 10) - 1,
    parseInt(selectedDay.value, 10),
  );
  if (composed.getTime() > Date.now()) {
    // Clamp to today
    const today = new Date();
    selectedYear.value = String(today.getFullYear());
    selectedMonth.value = String(today.getMonth() + 1).padStart(2, '0');
    selectedDay.value = String(today.getDate()).padStart(2, '0');
  }
  if (selectedYear.value && selectedMonth.value && selectedDay.value) {
    emit('update:modelValue', `${selectedYear.value}-${selectedMonth.value}-${selectedDay.value}`);
  }
  menuRef.value?.hide();
}

function onCancel() {
  // Discard buffered changes
  bufYear.value = selectedYear.value;
  bufMonth.value = selectedMonth.value;
  bufDay.value = selectedDay.value;
  menuRef.value?.hide();
}
</script>

<template>
  <div
    class="birthday-picker"
    :class="{ 'birthday-picker--disabled': disabled }"
  >
    <!-- Visual shell: border + background -->
    <div class="birthday-picker__shell" />

    <!-- Value text + arrow -->
    <span
      class="birthday-picker__value"
      :class="{ 'birthday-picker__value--placeholder': showPlaceholder }"
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

    <!-- Hidden button triggers the bottom sheet -->
    <q-btn
      class="birthday-picker__trigger"
      flat
      no-caps
      unelevated
      :disable="disabled"
    />

    <!-- Bottom sheet -->
    <q-menu
      ref="menuRef"
      anchor="center middle"
      self="center middle"
      class="birthday-picker__sheet"
      transition-show="slide-up"
      transition-hide="slide-down"
      @show="onMenuShow"
    >
      <!-- Header with cancel + title + confirm -->
      <div class="birthday-picker__picker-header">
        <button class="birthday-picker__header-btn birthday-picker__header-btn--cancel" @click="onCancel">
          取消
        </button>
        <span class="birthday-picker__picker-title">选择生日</span>
        <button class="birthday-picker__header-btn birthday-picker__header-btn--confirm" @click="onConfirm">
          确定
        </button>
      </div>

      <!-- Year / Month / Day columns -->
      <div class="birthday-picker__picker-body">
        <!-- Year -->
        <div class="birthday-picker__col">
          <div class="birthday-picker__col-label">年</div>
          <q-scroll-area
            ref="yearScrollRef"
            class="birthday-picker__scroll"
            :thumb-style="{ width: '4px', opacity: '0.3' }"
            visible
          >
            <div class="birthday-picker__options">
              <div
                v-for="opt in yearOptions"
                :key="opt.value"
                class="birthday-picker__option"
                :class="{ 'birthday-picker__option--active': bufYear === opt.value }"
                @click="onYearChange(opt.value)"
              >
                {{ opt.label }}
              </div>
            </div>
          </q-scroll-area>
        </div>

        <!-- Month -->
        <div class="birthday-picker__col">
          <div class="birthday-picker__col-label">月</div>
          <q-scroll-area
            ref="monthScrollRef"
            class="birthday-picker__scroll"
            :thumb-style="{ width: '4px', opacity: '0.3' }"
            visible
          >
            <div class="birthday-picker__options">
              <div
                v-for="opt in monthOptions"
                :key="opt.value"
                class="birthday-picker__option"
                :class="{ 'birthday-picker__option--active': bufMonth === opt.value }"
                @click="onMonthChange(opt.value)"
              >
                {{ opt.label }}
              </div>
            </div>
          </q-scroll-area>
        </div>

        <!-- Day -->
        <div class="birthday-picker__col">
          <div class="birthday-picker__col-label">日</div>
          <q-scroll-area
            ref="dayScrollRef"
            class="birthday-picker__scroll"
            :thumb-style="{ width: '4px', opacity: '0.3' }"
            visible
          >
            <div class="birthday-picker__options">
              <div
                v-for="opt in bufAvailableDayOptions"
                :key="opt.value"
                class="birthday-picker__option"
                :class="{ 'birthday-picker__option--active': bufDay === opt.value }"
                @click="onDayChange(opt.value)"
              >
                {{ opt.label }}
              </div>
            </div>
          </q-scroll-area>
        </div>
      </div>
    </q-menu>
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

.birthday-picker__shell {
  position: absolute;
  inset: 0;
  border-radius: 8px;
  border: 1px solid rgba(147, 152, 169, 0.2);
  background: var(--clr-card-bg);
  pointer-events: none;
}

// Invisible button on top that triggers the Q-menu
.birthday-picker__trigger {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  min-height: unset;
  padding: 0;
  border-radius: 8px;
  opacity: 0;
  z-index: 1;
}

.birthday-picker__value {
  position: relative;
  z-index: 0;
  font-family: var(--font-family), sans-serif;
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

// ---- Bottom sheet ----

:deep(.q-menu__container) {
  pointer-events: auto;
}

.birthday-picker__sheet {
  width: 320px;
  max-width: 90vw;
  border-radius: 16px;
  background: var(--clr-card-bg);
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
}

.birthday-picker__picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  border-bottom: 1px solid rgba(147, 152, 169, 0.15);
}

.birthday-picker__picker-title {
  font-family: var(--font-family), sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--clr-text-primary);
}

.birthday-picker__header-btn {
  font-family: var(--font-family), sans-serif;
  font-size: 15px;
  font-weight: 500;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;

  &--cancel {
    color: var(--clr-caption);
  }

  &--confirm {
    color: var(--clr-primary);
  }
}

.birthday-picker__picker-body {
  display: flex;
  height: 260px;
  overflow: hidden;
}

.birthday-picker__col {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(147, 152, 169, 0.1);

  &:last-child {
    border-right: none;
  }
}

.birthday-picker__col-label {
  padding: 10px 0 6px;
  text-align: center;
  font-family: var(--font-family), sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--clr-caption);
  flex-shrink: 0;
}

.birthday-picker__scroll {
  flex: 1;

  :deep(.q-scrollarea__content) {
    width: 100%;
  }
}

.birthday-picker__options {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 0;
}

.birthday-picker__option {
  width: 100%;
  text-align: center;
  padding: 8px 0;
  font-family: var(--font-family), sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: var(--clr-text);
  cursor: pointer;
  transition: color 0.15s;

  &:hover {
    color: var(--clr-primary);
  }

  &--active {
    font-weight: 600;
    color: var(--clr-primary);
  }
}
</style>
