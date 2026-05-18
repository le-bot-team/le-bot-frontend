<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const showPicker = ref(false);
const internalValue = ref(props.modelValue ?? '');

watch(
  () => props.modelValue,
  (v) => {
    internalValue.value = v ?? '';
  },
);

const onConfirm = () => {
  emit('update:modelValue', internalValue.value);
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
      placeholder="YYYY/MM/DD"
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
          <q-btn v-close-popup flat label="Cancel" />
          <q-btn v-close-popup color="primary" flat label="OK" @click="onConfirm" />
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
