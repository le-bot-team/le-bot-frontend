<script setup lang="ts">
/**
 * PersonalityEditor — shared AI personality configuration editor.
 * Reused by both PersonalityDetailPage (device config) and AddVirtualDevicePage (onboarding Step 4).
 *
 * Props:
 *   - enabled / traits / goals: initial values
 *   - submitLabel: text for the submit/next button
 *
 * Emits:
 *   - submit({ enabled, traits, goals }): when the submit button is clicked
 *   - disable(): when the toggle is turned off
 */
import { computed, ref } from 'vue';
import { i18nSubPath } from 'src/utils/common';

const i18n = i18nSubPath('pages.stack.PersonalityDetailPage');

const props = withDefaults(
  defineProps<{
    enabled?: boolean;
    traits?: string;
    goals?: string;
    submitLabel?: string;
  }>(),
  {
    enabled: true,
    traits: '',
    goals: '',
    submitLabel: '',
  },
);

const emit = defineEmits<{
  submit: [payload: { enabled: boolean; traits: string; goals: string }];
  disable: [];
}>();

const enabled = ref<boolean>(props.enabled);
const traits = ref<string>(props.traits);
const goals = ref<string>(props.goals);

// 预设个性标签 (与 i18n 对应)
const traitTagKeys = ['trait_a', 'trait_b', 'trait_c', 'trait_d', 'trait_e', 'trait_f'] as const;
const traitTagValues = traitTagKeys.map((key) => i18n(`traitTags.${key}`));

// 预设发展方向标签 (与 i18n 对应)
const goalTagKeys = ['goal_a', 'goal_b', 'goal_c', 'goal_d', 'goal_e', 'goal_f'] as const;
const goalTagValues = goalTagKeys.map((key) => i18n(`goalTags.${key}`));

// 已选中的标签
const selectedTraitTags = ref<string[]>([]);
const selectedGoalTags = ref<string[]>([]);

// 从已保存的 traits/goals 中解析出已选中的标签
function parseSelectedTags() {
  if (props.traits) {
    const savedTraits = props.traits.split(/[,，;；\n]/).map(t => t.trim()).filter(Boolean);
    selectedTraitTags.value = traitTagValues.filter(tag => savedTraits.includes(tag));
  }
  if (props.goals) {
    const savedGoals = props.goals.split(/[,，;；\n]/).map(t => t.trim()).filter(Boolean);
    selectedGoalTags.value = goalTagValues.filter(tag => savedGoals.includes(tag));
  }
}

parseSelectedTags();

const canSubmit = computed(
  () => enabled.value && (traits.value.trim().length > 0 || goals.value.trim().length > 0 || selectedTraitTags.value.length > 0 || selectedGoalTags.value.length > 0),
);

function onToggle(v: boolean) {
  if (v) return;
  enabled.value = false;
  emit('disable');
}

function toggleTraitTag(tag: string) {
  const idx = selectedTraitTags.value.indexOf(tag);
  if (idx >= 0) {
    selectedTraitTags.value.splice(idx, 1);
  } else {
    selectedTraitTags.value.push(tag);
  }
  updateTraitsFromTags();
}

function toggleGoalTag(tag: string) {
  const idx = selectedGoalTags.value.indexOf(tag);
  if (idx >= 0) {
    selectedGoalTags.value.splice(idx, 1);
  } else {
    selectedGoalTags.value.push(tag);
  }
  updateGoalsFromTags();
}

function updateTraitsFromTags() {
  // 合并标签和手动输入的内容
  const manualTraits = traits.value
    .split(/[,，;；\n]/)
    .map(t => t.trim())
    .filter(t => {
      // 排除预设标签
      const isPreset = traitTagValues.includes(t) || selectedTraitTags.value.includes(t);
      return t.length > 0 && !isPreset;
    });
  traits.value = [...selectedTraitTags.value, ...manualTraits].join(',');
}

function updateGoalsFromTags() {
  const manualGoals = goals.value
    .split(/[,，;；\n]/)
    .map(t => t.trim())
    .filter(t => {
      const isPreset = goalTagValues.includes(t) || selectedGoalTags.value.includes(t);
      return t.length > 0 && !isPreset;
    });
  goals.value = [...selectedGoalTags.value, ...manualGoals].join(',');
}

function onSubmit() {
  if (!canSubmit.value) return;
  emit('submit', {
    enabled: enabled.value,
    traits: traits.value,
    goals: goals.value,
  });
}
</script>

<template>
  <section class="device-personality-card">
    <div class="device-personality-row">
      <span>{{ i18n('labels.toggleLabel') }}</span>
      <q-toggle v-model="enabled" color="accent" @update:model-value="onToggle" />
    </div>
  </section>
  <p class="device-personality-tip">{{ i18n('labels.tip') }}</p>

  <template v-if="enabled">
    <label class="device-personality-section-title">
      {{ i18n('labels.traitsTitle') }}
    </label>
    <!-- 预设个性标签 -->
    <div class="personality-tags-container">
      <button
        v-for="(tag, index) in traitTagValues"
        :key="traitTagKeys[index]"
        type="button"
        class="personality-tag"
        :class="{ 'personality-tag--selected': selectedTraitTags.includes(tag) }"
        @click="toggleTraitTag(tag)"
      >
        {{ tag }}
      </button>
    </div>
    <textarea
      v-model="traits"
      class="device-personality-textarea"
      :placeholder="i18n('labels.traitsPlaceholder')"
    />

    <label class="device-personality-section-title">
      {{ i18n('labels.goalsTitle') }}
    </label>
    <!-- 预设发展方向标签 -->
    <div class="personality-tags-container">
      <button
        v-for="(tag, index) in goalTagValues"
        :key="goalTagKeys[index]"
        type="button"
        class="personality-tag"
        :class="{ 'personality-tag--selected': selectedGoalTags.includes(tag) }"
        @click="toggleGoalTag(tag)"
      >
        {{ tag }}
      </button>
    </div>
    <textarea
      v-model="goals"
      class="device-personality-textarea"
      :placeholder="i18n('labels.goalsPlaceholder')"
    />
  </template>

  <button
    type="button"
    class="device-personality-submit"
    :disabled="!canSubmit"
    @click="onSubmit"
  >
    {{ submitLabel || i18n('labels.submit') }}
  </button>
</template>

<style scoped lang="scss">
.personality-tags-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between; /* 设计稿一行3个标签, 均匀分布 */
  row-gap: 8px; /* 设计稿行间距 48px - 标签高40px = 8px */
  margin-bottom: 2px; /* 设计稿: 标签底部到textarea间距=11px, 用12px更合适 */
  width: 100%;
  max-width: var(--device-card-max-w);
  align-self: center;
}

.personality-tag {
  width: 100px; /* 设计稿精确宽度 w-100px */
  height: 40px; /* 设计稿精确高度 h-40px */
  padding: 0;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 400;
  line-height: 22px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--clr-white);
  color: var(--clr-text-secondary);
  border: 1px solid var(--clr-input-border);
  flex-shrink: 0;

  &:hover {
    border-color: var(--clr-accent);
    color: var(--clr-accent);
  }

  &--selected {
    background: var(--clr-primary);
    color: var(--clr-white);
    border-color: var(--clr-primary);
  }
}
</style>
