<template>
  <div class="viewport-shell" @pointerdown.capture="onFirstAnyTouch" @touchend.capture="onFirstAnyTouch">
    <div id="stage" ref="stageEl" class="stage-canvas">
      <Director
        ref="directorRef"
        :initial-scene="initialScene"
        @scene-change="onSceneChange"
      />

      <!-- 右上角极简手绘墨水音符静音开关（全局常驻，无emoji与文字框） -->
      <button
        type="button"
        class="mute-btn"
        :class="{ 'is-muted': audioState.muted }"
        :aria-label="audioState.muted ? '开启音乐与音效' : '静音'"
        :title="audioState.muted ? '开启音乐与音效' : '静音'"
        @click.stop="onToggleMute"
      >
        <svg viewBox="0 0 36 36" class="mute-svg" aria-hidden="true">
          <g :opacity="audioState.muted ? 0.44 : 0.92">
            <!-- 手绘双八分音符 -->
            <path
              d="M14 25 L14 11.5 L25 9.5 L25 22.5"
              fill="none"
              stroke="#2C2119"
              stroke-width="2.3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M14 15.2 L25 13.2"
              fill="none"
              stroke="#2C2119"
              stroke-width="2.1"
              stroke-linecap="round"
            />
            <ellipse cx="11.5" cy="25.2" rx="3.4" ry="2.5" transform="rotate(-18 11.5 25.2)" fill="#2C2119" />
            <ellipse cx="22.5" cy="22.8" rx="3.4" ry="2.5" transform="rotate(-18 22.5 22.8)" fill="#2C2119" />
          </g>
          <!-- 静音斜杠 -->
          <line
            v-if="audioState.muted"
            x1="8"
            y1="28"
            x2="28"
            y2="8"
            stroke="#C83E3B"
            stroke-width="2.5"
            stroke-linecap="round"
          />
        </svg>
      </button>

      <!-- 通关全部后才解锁的「幕选择」手账目录按钮（默认不打扰首轮沉浸体验） -->
      <button
        v-if="progressState.unlockedAll"
        type="button"
        class="chapters-btn"
        @click.stop="showChapters = true"
      >
        目录
      </button>

      <!-- 仅在本地开发环境（import.meta.env.DEV）挂载调试跳关工具，正式打包完全剥离 -->
      <div v-if="isDev" class="dev-dock">
        <button type="button" class="dev-toggle" @click.stop="devOpen = !devOpen">
          DEV {{ currentScene }}/12
        </button>
        <div v-if="devOpen" class="dev-panel" @pointerdown.stop>
          <div class="dev-row">
            <button type="button" class="dev-chip" @click="jumpDev(1)">幕 1 · 拆礼</button>
            <button type="button" class="dev-chip" @click="jumpDev(2)">幕 2 · 蛋糕</button>
            <button type="button" class="dev-chip" @click="jumpDev(3)">幕 3 · 拍立得</button>
            <button type="button" class="dev-chip" @click="jumpDev(4)">幕 4 · 干杯</button>
          </div>
          <div class="dev-row">
            <button type="button" class="dev-chip" @click="jumpDev(5)">幕 5 · 胶卷</button>
            <button type="button" class="dev-chip" @click="jumpDev(6)">幕 6 · 十一束花</button>
            <button type="button" class="dev-chip" @click="jumpDev(7)">幕 7 · 地图</button>
          </div>
          <div class="dev-row">
            <button type="button" class="dev-chip" @click="jumpDev(8)">幕 8 · 刮刮乐</button>
            <button type="button" class="dev-chip" @click="jumpDev(9)">幕 9 · 老虎机</button>
            <button type="button" class="dev-chip" @click="jumpDev(10)">幕 10 · 童年同框</button>
          </div>
          <div class="dev-row">
            <button type="button" class="dev-chip" @click="jumpDev(11)">幕 11 · 纸条蛋糕</button>
            <button type="button" class="dev-chip" @click="jumpDev(12)">幕 12 · 叮咚礼物</button>
          </div>
          <div class="dev-row">
            <button type="button" class="dev-chip" @click="toggleForcePortrait()">
              {{ stageState.forcePortrait ? '取消竖屏旋转' : '模拟手机竖屏' }}
            </button>
            <button type="button" class="dev-chip" @click="onResetProgress">重置进度</button>
          </div>
          <div class="dev-row">
            <button type="button" class="dev-chip" @click="playWindChime()">试听风铃音效</button>
            <button type="button" class="dev-chip" @click="unlockAndPlayBgm()">播放 BGM</button>
          </div>
        </div>
      </div>

      <!-- 解锁后的手账目录弹窗 -->
      <div v-if="showChapters" class="chapters-backdrop" @click.self="showChapters = false">
        <div class="chapters-modal">
          <div class="chapters-head">
            <h3>{{ SITE_CONFIG.profile.age }} 岁生日手账目录</h3>
            <button type="button" class="chapters-close" @click="showChapters = false">✕</button>
          </div>
          <div class="chapters-grid">
            <button
              v-for="(title, idx) in SITE_CONFIG.sceneTitles"
              :key="idx"
              type="button"
              class="chapter-item"
              :class="{ current: currentScene === idx + 1 }"
              @click="selectChapter((idx + 1) as SceneId)"
            >
              {{ title }}
            </button>
          </div>
        </div>
      </div>

      <!-- 首屏装订加载条 -->
      <PreloadScreen :progress="preloadProgress" :done="preloadDone" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import PreloadScreen from './components/PreloadScreen.vue'
import { SITE_CONFIG, type SceneId } from './config'
import Director from './director/Director.vue'
import {
  audioState,
  bindWeixinAudioBridge,
  ensureBgmOnResume,
  toggleMute,
  unlockAndPlayBgm,
} from './engine/audio'
import { preloadDone, preloadProgress, runPriorityPreload } from './engine/preload'
import { progressState, resetProgress } from './engine/progress'
import { playTap, playWindChime } from './engine/sfx'
import { setupStage, stageState, toggleForcePortrait } from './engine/stage'

const isDev = import.meta.env.DEV
const stageEl = ref<HTMLElement | null>(null)
const directorRef = ref<{ jumpToScene: (id: SceneId) => Promise<void> } | null>(null)

function resolveInitialScene(): SceneId {
  // DEV 模式支持 #scene=2 便捷直达截图与调试，正式包完全不包含该分支
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const m = window.location.hash.match(/scene=(\d+)/)
    if (m) {
      const n = Number(m[1])
      if (n >= 1 && n <= 12) return n as SceneId
    }
  }
  return progressState.scene
}

const initialScene = resolveInitialScene()
const currentScene = ref<SceneId>(initialScene)
const devOpen = ref(false)
const showChapters = ref(false)

let cleanupStage: (() => void) | null = null

function onSceneChange(id: SceneId) {
  currentScene.value = id
}

function onFirstAnyTouch() {
  // 若从断点恢复到第 2 幕及以后，用户首次任意点击舞台也同步续播 BGM
  if (currentScene.value > 1 && !audioState.unlocked) {
    unlockAndPlayBgm()
  } else {
    ensureBgmOnResume()
  }
}

function onToggleMute() {
  if (!toggleMute()) unlockAndPlayBgm()
  playTap()
}

function jumpDev(id: SceneId) {
  void directorRef.value?.jumpToScene(id)
  devOpen.value = false
}

function selectChapter(id: SceneId) {
  showChapters.value = false
  void directorRef.value?.jumpToScene(id)
}

function onResetProgress() {
  resetProgress()
  devOpen.value = false
  void directorRef.value?.jumpToScene(1)
}

onMounted(() => {
  bindWeixinAudioBridge()
  if (stageEl.value) {
    cleanupStage = setupStage(stageEl.value)
  }
  void runPriorityPreload()
})

onBeforeUnmount(() => {
  cleanupStage?.()
})
</script>

<style scoped>
.viewport-shell {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.stage-canvas {
  position: absolute;
  width: 1280px;
  height: 720px;
  transform-origin: center center;
  box-shadow: 0 24px 64px rgba(22, 16, 11, 0.45);
  overflow: hidden;
  border-radius: 2px;
}

.mute-btn {
  position: absolute;
  top: 14px;
  right: 16px;
  z-index: 70;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border-radius: 50%;
  border: 1.5px solid rgba(92, 75, 62, 0.36);
  background: rgba(255, 250, 241, 0.78);
  box-shadow: 0 3px 10px rgba(43, 35, 29, 0.14);
  transition: transform 0.16s ease, background 0.2s ease;
}

.mute-btn:active {
  transform: scale(0.92);
}

.mute-svg {
  width: 24px;
  height: 24px;
  display: block;
}

.chapters-btn {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 70;
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1.5px solid rgba(138, 109, 83, 0.45);
  background: rgba(255, 250, 241, 0.9);
  box-shadow: 0 3px 10px rgba(43, 35, 29, 0.14);
  font-family: var(--font-hand);
  font-size: 20px;
  color: var(--ink);
}

.dev-dock {
  position: absolute;
  left: 14px;
  bottom: 14px;
  z-index: 80;
}

.dev-toggle {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(36, 29, 24, 0.25);
  background: rgba(255, 253, 248, 0.78);
  font-family: monospace;
  font-size: 11px;
  color: var(--ink-soft);
}

.dev-panel {
  margin-top: 6px;
  padding: 10px;
  border-radius: 8px;
  background: rgba(43, 35, 29, 0.92);
  color: #FAF3E8;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.dev-row {
  display: flex;
  gap: 6px;
}

.dev-chip {
  padding: 5px 10px;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.1);
  color: #FAF3E8;
  font-size: 12px;
}

.chapters-backdrop {
  position: absolute;
  inset: 0;
  z-index: 85;
  background: rgba(36, 29, 24, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chapters-modal {
  width: 680px;
  padding: 26px 28px;
  border-radius: 14px;
  background: var(--bg-parchment);
  border: 2px solid rgba(138, 109, 83, 0.5);
  box-shadow: 0 18px 48px rgba(22, 16, 11, 0.36);
}

.chapters-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chapters-head h3 {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 32px;
  font-weight: 400;
}

.chapters-close {
  border: none;
  background: transparent;
  font-size: 20px;
  color: var(--ink-soft);
}

.chapters-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.chapter-item {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(138, 109, 83, 0.35);
  background: #FFFDF8;
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--ink);
  text-align: left;
}

.chapter-item.current {
  border-color: var(--accent-red);
  background: #FFF0EE;
  color: var(--accent-red);
}
</style>
