<script setup lang="ts">
import { ref, watch } from 'vue';

import { i18nSubPath } from 'src/utils/common';

const props = defineProps<{
  modelValue?: string;
  disabled?: boolean;
  placeholder?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const i18n = i18nSubPath('components.BirthdayPicker');

const showPicker = ref(false);
const internalValue = ref(props.modelValue ?? '');

watch(
  () => props.modelValue,
  (v) => {
    internalValue.value = v ?? '';
  },
);

// Reset internalValue when dialog opens to stay in sync with modelValue
watch(showPicker, (open) => {
  if (open) {
    internalValue.value = props.modelValue ?? '';
  }
});

const onConfirm = () => {
  emit('update:modelValue', internalValue.value);
  showPicker.value = false;
};

const onCancel = () => {
  showPicker.value = false;
};
</script>

<template>
  <div class="birthday-picker">
    <input
      class="birthday-picker__input"
      type="text"
      readonly
      :value="modelValue"
      :disabled="disabled"
      :placeholder="placeholder || i18n('labels.placeholder')"
      @click="!disabled && (showPicker = true)"
    />
    <q-dialog v-model="showPicker">
      <q-card style="min-width: 280px">
        <q-card-section>
          <q-date
            v-model="internalValue"
            mask="YYYY/MM/DD"
            minimal
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="i18n('labels.cancel')" @click="onCancel" />
          <q-btn color="primary" flat :label="i18n('labels.confirm')" @click="onConfirm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.birthday-picker {
  width: 100%;
  height: 100%;
}

.birthday-picker__input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  color: var(--clr-text);
  padding: 13px 16px;
  box-sizing: border-box;
  cursor: pointer;
}

.birthday-picker__input::placeholder {
  font-weight: 400;
  color: var(--clr-caption);
}

.birthday-picker__input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
