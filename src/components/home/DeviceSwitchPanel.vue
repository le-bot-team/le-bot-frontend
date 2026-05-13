<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { i18nSubPath } from 'src/utils/common';
import { useDeviceStore } from 'stores/device';

/* 设计稿图标 — 容器2653 (蓝湖 ca93697e) */
import boyDeviceUrl from 'src/assets/lanhu/home/img-lebot-example.png';     // img_lebot_example w32 h32
import girlDeviceUrl from 'src/assets/lanhu/home/img-lebot2-example.png';   // img_lebot2_example w32 h32
import arrowRightUrl from 'src/assets/lanhu/home/icon-arrow-right-home.png'; // 路径 w7 h12
import addIconUrl from 'src/assets/lanhu/home/btn-add-lebot-home.png';      // btn_add_lebot_home w12 h12

defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  'update:show': [value: boolean];
  'add-device': [];
}>();

const i18n = i18nSubPath('pages.main.HomePage');
const deviceStore = useDeviceStore();
const { devices, currentDevice } = storeToRefs(deviceStore);

/** 根据设备性别返回对应头像 — 设计稿 img_lebot_example(男孩) / img_lebot2_example(女孩) */
function getAvatarFor(device: { childInfo?: { gender?: string } | null }): string {
  if (device.childInfo?.gender === 'girl') return girlDeviceUrl;
  return boyDeviceUrl;
}

/**
 * 设备显示名称 — 设计稿格式："小新的乐宝"、"小葵的乐宝"
 * 优先使用 childInfo.name + "的乐宝"，fallback 到 device.name
 */
function getDeviceDisplayName(device: { name?: string | null; childInfo?: { name?: string } | null }): string {
  const childName = device.childInfo?.name;
  return childName ? `${childName}的乐宝` : (device.name || '未命名设备');
}

function close() {
  emit('update:show', false);
}

function selectDevice(deviceId: string) {
  deviceStore.setCurrentDevice(deviceId);
  close();
}

function handleAddDevice() {
  emit('add-device');
  close();
}
</script>

<template>
  <Teleport to="body">
    <Transition name="device-switch">
      <div v-if="show" class="device-switch-overlay" @click.self="close">
        <!-- 容器 2653: w375 h324, 白色面板 -->
        <div class="device-switch-panel">
          <!-- 标题 "切换设备": font 17px Medium #151717 lh24 left20 top520 -->
          <div class="device-switch-header">
            <span class="device-switch-title">{{ i18n('deviceSwitch.title') }}</span>
          </div>

          <!-- 设备列表: 矩形2023/2024 w335 h64 圆角12 #F2F4F8 -->
          <div class="device-switch-list">
            <div
              v-for="device in devices"
              :key="device.id"
              class="device-switch-item"
              :class="{ 'device-switch-item--active': device.id === currentDevice?.id }"
              role="button"
              @click="selectDevice(device.id)"
            >
              <!-- 头像: img_lebot_example w32 h32 -->
              <div class="device-switch-avatar">
                <img :src="getAvatarFor(device)" alt="" />
              </div>
              <!-- 设备名: "小新的乐宝" font 15px Regular #151717 lh22 -->
              <span class="device-switch-name">{{ getDeviceDisplayName(device) }}</span>
              <!-- 右箭头: 路径 w7 h12 -->
              <div class="device-switch-arrow">
                <img :src="arrowRightUrl" alt="" />
              </div>
            </div>
          </div>

          <!-- 添加乐宝按钮: 矩形2025 w335 h56 浅绿边框胶囊 + btn_add_lebot_home w12h12 + "添加乐宝" 15px Medium #1FCBF8 -->
          <div class="device-switch-add" role="button" @click="handleAddDevice">
            <img :src="addIconUrl" alt="" class="device-switch-add-icon-img" />
            <span class="device-switch-add-text">{{ i18n('deviceSwitch.addDevice') }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
/* ===== 遮罩层: 矩形2002 w375 h812 opacity50 ===== */
.device-switch-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5); /* 设计稿 opacity-50 */
  display: flex;
  align-items: flex-end;
  justify-content: center; /* 水平居中 */
}

/* ===== 面板: 矩形1900 w375 h324 白色 圆角顶部20 ===== */
.device-switch-panel {
  width: min(480px, 100vw); /* PC端限制宽度，手机端全宽 */
  max-height: 70vh; /* 超长时可滚动 */
  margin: 0 auto;
  background: #ffffff; /* 纯白 */
  border-radius: 20px 20px 0 0; /* 仅顶部圆角 */
  padding: 20px 20px max(28px, env(safe-area-inset-bottom)); /* 左右各20留白使内容w335居中于w375面板 */
  box-sizing: border-box;
  display: flex;
  flex-direction: column; /* 三段式布局: header / list(flex:1) / add-button */
}

/* ===== 标题 "切换设备": left:20 top:520 font:17 Medium #151717 lh24 ===== */
.device-switch-header {
  margin-bottom: 16px; /* 标题到第一个设备项间距 */
}

.device-switch-title {
  font-family: var(--font-family), 'AlibabaPuHuiTi', sans-serif;
  font-size: 17px;
  font-weight: 500; /* Medium */
  color: #151717; /* rgba(21,23,23,1) */
  line-height: 24px;
}

/* ===== 设备列表区: 可滚动 ===== */
.device-switch-list {
  display: flex;
  flex-direction: column;
  gap: 12px; /* 设备项之间间距 */
  margin-bottom: 16px; /* 列表到添加按钮间距 */
  overflow-y: auto; /* 超过3个设备时滚动 */
  flex: 1; /* 占据剩余空间 */
  min-height: 0; /* 允许flex子项收缩触发滚动 */
}

/* ===== 设备项: 矩形2023/2024 w335 h64 #F2F4F8 圆角12 ===== */
.device-switch-item {
  display: flex;
  align-items: center;
  height: 64px; /* 设计稿精确高度 */
  background: #f2f4f8; /* 设计稿背景色 */
  border-radius: 12px;
  padding: 0 16px; /* 左右内边距: (335-32-74-7)/2 ≈ 16 使内容居中 */
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #e8eaef;
  }

  &--active {
    background: #eaf1ff;
  }
}

/* ===== 设备头像: img_lebot_example w32 h32 ===== */
.device-switch-avatar {
  width: 32px; /* 设计稿精确尺寸 */
  height: 32px;
  margin-right: 12px; /* 头像到文字间距 */
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

/* ===== 设备名称: "小新的乐宝" font 15 Regular #151717 lh22 ===== */
.device-switch-name {
  flex: 1;
  font-family: var(--font-family), 'AlibabaPuHuiTi', sans-serif;
  font-size: 15px;
  font-weight: 400; /* Regular */
  color: #151717; /* rgba(21,23,23,1) */
  line-height: 22px;
}

/* ===== 右箭头: 设计稿路径 w7h12(细线), 当前使用icon-arrow-right-home.png(实心)需适当放大保证可见性 ===== */
.device-switch-arrow {
  width: 16px; /* 放大显示使实心箭头清晰可见 */
  height: 16px;
  margin-left: auto;
  flex-shrink: 0;
  opacity: 0.45; /* 降低不透明度匹配设计稿的轻盈感 */

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

/* ===== 添加按钮: 矩形2025 w335 h56 浅绿边框胶囊 ===== */
.device-switch-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px; /* 图标到文字间距 */
  height: 56px; /* 设计稿精确高度 */
  background: #e8f5e9; /* 浅绿背景 */
  border: 1.5px solid #c8e6c9; /* 浅绿边框 */
  border-radius: 28px; /* 半高=胶囊形 */
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #dcedec;
    border-color: #a5d6a7;
  }

  &:active {
    background: #c8e6c9;
  }
}

/* ===== 加号图标: btn_add_lebot_home w12 h12 (青色细线加号) ===== */
.device-switch-add-icon-img {
  width: 12px; /* 设计稿精确尺寸 */
  height: 12px;
  display: block;
  flex-shrink: 0;
}

/* ===== "添加乐宝" 文字: font 15 Medium #1FCBF8 lh22 ===== */
.device-switch-add-text {
  font-family: var(--font-family), 'AlibabaPuHuiTi', sans-serif;
  font-size: 15px;
  font-weight: 500; /* Medium */
  color: #1fcbf8; /* rgba(31.94,203.67,248.93,1) 设计稿精确颜色 */
}

// Transition — 底部滑入动画
.device-switch-enter-active,
.device-switch-leave-active {
  transition: opacity 0.3s ease;

  .device-switch-panel {
    transition: transform 0.3s ease;
  }
}

.device-switch-enter-from,
.device-switch-leave-to {
  opacity: 0;

  .device-switch-panel {
    transform: translateY(100%);
  }
}
</style>
