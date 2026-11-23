<template>
  <div class="scene-05">
    <PaperBg variant="parchment">
      <Bunting variant="corner" />

      <!-- 左上角标题与阶段提示 -->
      <div class="scene-header">
        <h2 class="title-main">{{ SITE_CONFIG.scene5.title }}</h2>
        <p class="title-sub">{{ subPrompt }}</p>
      </div>

      <!-- 右上角无边框手写显影低语（去除了网页胶囊与按钮栏） -->
      <div v-if="unrolled" class="film-whisper">
        已显影 {{ developedCount }} / 8
      </div>

      <!-- 手绘胶卷暗盒与胶片共用顶边，接住幕 4 飞入的暗盒 -->
      <img
        ref="canisterEl"
        :src="assetUrl('assets/art/film_canister.webp')"
        alt="FUJIFILM 200 胶卷暗盒"
        class="film-canister"
      />

      <!-- 从胶卷暗盒右侧缝隙抽出的长条胶片窗（每次精准完整展示 4 格，绝不半格截断） -->
      <div class="film-viewport" :style="{ width: `${revealWidth}px` }">
        <div
          class="film-track"
          :style="{ transform: `translateX(${-panX}px)` }"
        >
          <!-- 8 格真实竖版 3:4 日常照 -->
          <div
            v-for="(item, idx) in framesState"
            :key="item.id"
            class="film-slot"
            :class="{ 'is-developed': item.developed }"
          >
            <!-- 上方手绘粗犷炭笔齿孔边（可左右惯性拖动整卷胶片） -->
            <svg
              class="sprocket-svg top-rail"
              viewBox="0 0 222 30"
              aria-hidden="true"
            >
              <path
                d="M0 4 Q32 0.8 68 3 Q112 5.4 158 2.2 Q192 0.8 222 3 L222 28 Q174 30 124 27.6 Q66 26.2 0 29 Z"
                fill="#24201C"
                stroke="#14110F"
                stroke-width="2"
              />
              <path d="M6 3.5 Q56 1.5 110 3.6 Q165 5 216 2.5" fill="none" stroke="rgba(255,250,240,0.14)" stroke-width="1" stroke-dasharray="14 6 4 8" />
              <path d="M4 27 Q76 28.5 144 26.8 Q186 28.2 218 27" fill="none" stroke="#120F0D" stroke-width="1.6" />
              <text x="9" y="20" class="svg-code">{{ String(idx + 1).padStart(2, '0') }}A</text>
              <rect x="43" y="8" width="17" height="12" rx="3.5" fill="#FAF3E8" transform="rotate(-1.8 52 14)" />
              <rect x="73" y="9" width="16" height="11" rx="3" fill="#FAF3E8" transform="rotate(1.6 82 14)" />
              <rect x="103" y="8" width="17" height="12" rx="3.5" fill="#FAF3E8" transform="rotate(-1.4 112 14)" />
              <rect x="134" y="9" width="16" height="11" rx="3" fill="#FAF3E8" transform="rotate(1.5 142 14)" />
              <rect x="163" y="8" width="17" height="12" rx="3.5" fill="#FAF3E8" transform="rotate(-1.6 172 14)" />
              <rect x="193" y="9" width="16" height="11" rx="3" fill="#FAF3E8" transform="rotate(1.4 201 14)" />
            </svg>

            <!-- 竖版 3:4 照片显影窗口（纯擦拭显影 + 底层清晰图与顶层预模糊图叠层渐显） -->
            <div
              :ref="(el) => setPhotoRef(idx, el)"
              class="photo-aperture"
              :class="{
                'is-interactive': unrolled && !item.developed,
                'is-pannable': unrolled && item.developed,
              }"
            >
              <img :src="assetUrl(item.src)" :alt="item.title" class="frame-img" />
              <img
                :src="assetUrl(item.blurSrc)"
                alt=""
                class="frame-img preblur"
                :style="{ opacity: 1 - item.clarity }"
              />
              <!-- 显影完成瞬间的柔光微闪 -->
              <div class="develop-flash" :class="{ active: item.justFlashed }" />

              <!-- 仅在第一张当前可见的未显影照片上保留温和小手擦拭提示 -->
              <HandHint
                v-if="!isUnderlay && unrolled && idx === firstVisibleUndevelopedIdx"
                mode="bob"
                class="wipe-hand"
              />
            </div>

            <!-- 下方手绘粗犷炭笔齿孔边 -->
            <svg
              class="sprocket-svg bottom-rail"
              viewBox="0 0 222 30"
              aria-hidden="true"
            >
              <path
                d="M0 2 Q56 0 112 2.4 Q168 4.4 222 1.2 L222 28.4 Q166 29.6 112 27.2 Q56 26 0 28.5 Z"
                fill="#24201C"
                stroke="#14110F"
                stroke-width="2"
              />
              <path d="M4 3 Q72 1.2 148 3 Q188 1.5 218 2.2" fill="none" stroke="#120F0D" stroke-width="1.5" />
              <rect x="11" y="9" width="17" height="11" rx="3" fill="#FAF3E8" transform="rotate(1.6 20 14)" />
              <rect x="42" y="8" width="16" height="12" rx="3.5" fill="#FAF3E8" transform="rotate(-1.5 50 14)" />
              <rect x="72" y="9" width="16" height="11" rx="3" fill="#FAF3E8" transform="rotate(1.2 80 14)" />
              <rect x="102" y="8" width="17" height="12" rx="3.5" fill="#FAF3E8" transform="rotate(-1.4 110 14)" />
              <rect x="132" y="9" width="16" height="11" rx="3" fill="#FAF3E8" transform="rotate(1.5 140 14)" />
              <rect x="162" y="8" width="16" height="12" rx="3" fill="#FAF3E8" transform="rotate(-1.6 169 14)" />
              <text x="190" y="20" class="svg-code">200</text>
            </svg>

            <!-- 胶片正下方的手写回忆标题与故事（零按钮/零滑块，纯纸面手写感） -->
            <div
              v-if="unrolled"
              class="slot-caption"
              :class="{ visible: item.developed || item.clarity > 0.35 }"
            >
              <h3 class="slot-title">{{ item.title }}</h3>
              <p class="slot-text">{{ item.caption }}</p>
            </div>
          </div>

          <!-- 第 9 格：空白问号格（明天 · ？，参考 frames/frame_035.0.jpg） -->
          <div class="film-slot blank-slot">
            <svg
              class="sprocket-svg top-rail"
              viewBox="0 0 222 30"
              aria-hidden="true"
            >
              <path
                d="M0 4 Q32 0.8 68 3 Q112 5.4 158 2.2 Q192 0.8 222 3 L222 28 Q174 30 124 27.6 Q66 26.2 0 29 Z"
                fill="#24201C"
                stroke="#14110F"
                stroke-width="2"
              />
              <text x="9" y="20" class="svg-code">09?</text>
              <rect x="43" y="8" width="17" height="12" rx="3.5" fill="#FAF3E8" transform="rotate(-1.5 52 14)" />
              <rect x="73" y="9" width="16" height="11" rx="3" fill="#FAF3E8" transform="rotate(1.4 82 14)" />
              <rect x="103" y="8" width="17" height="12" rx="3.5" fill="#FAF3E8" transform="rotate(-1.2 112 14)" />
              <rect x="134" y="9" width="16" height="11" rx="3" fill="#FAF3E8" transform="rotate(1.3 142 14)" />
              <rect x="163" y="8" width="17" height="12" rx="3.5" fill="#FAF3E8" transform="rotate(-1.5 172 14)" />
              <rect x="193" y="9" width="16" height="11" rx="3" fill="#FAF3E8" transform="rotate(1.2 201 14)" />
            </svg>

            <div class="photo-aperture blank-aperture">
              <div class="blank-paper">
                <span class="question-mark">?</span>
              </div>
            </div>

            <svg
              class="sprocket-svg bottom-rail"
              viewBox="0 0 222 30"
              aria-hidden="true"
            >
              <path
                d="M0 2 Q56 0 112 2.4 Q168 4.4 222 1.2 L222 28.4 Q166 29.6 112 27.2 Q56 26 0 28.5 Z"
                fill="#24201C"
                stroke="#14110F"
                stroke-width="2"
              />
              <rect x="11" y="9" width="17" height="11" rx="3" fill="#FAF3E8" transform="rotate(1.5 20 14)" />
              <rect x="42" y="8" width="16" height="12" rx="3.5" fill="#FAF3E8" transform="rotate(-1.4 50 14)" />
              <rect x="72" y="9" width="16" height="11" rx="3" fill="#FAF3E8" transform="rotate(1.1 80 14)" />
              <rect x="102" y="8" width="17" height="12" rx="3.5" fill="#FAF3E8" transform="rotate(-1.2 110 14)" />
              <rect x="132" y="9" width="16" height="11" rx="3" fill="#FAF3E8" transform="rotate(1.4 140 14)" />
              <rect x="162" y="8" width="16" height="12" rx="3.5" fill="#FAF3E8" transform="rotate(-1.4 169 14)" />
              <text x="184" y="20" class="svg-code">NEXT</text>
            </svg>

            <div v-if="unrolled" class="slot-caption visible">
              <h3 class="slot-title">{{ SITE_CONFIG.scene5.blankFrame.title }}</h3>
              <p class="slot-text">{{ SITE_CONFIG.scene5.blankFrame.caption }}</p>
            </div>
          </div>

          <!-- 胶卷尾端手绘梯形黑胶片拉手（初始露出暗盒外，按住往右抽出底片） -->
          <div ref="leaderEl" class="film-leader" :class="{ 'is-unrolled': unrolled }">
            <svg viewBox="0 0 130 292" class="leader-svg" aria-hidden="true">
              <path
                d="M0 2 L122 2 L122 148 C122 168, 100 180, 82 180 L60 180 C38 180, 24 208, 22 252 L20 290 L0 290 Z"
                fill="#2E2925"
                stroke="#181513"
                stroke-width="3"
                stroke-linejoin="round"
              />
              <rect x="12" y="9" width="16" height="12" rx="3" fill="#FAF3E8" />
              <rect x="42" y="9" width="16" height="12" rx="3" fill="#FAF3E8" />
              <rect x="72" y="9" width="16" height="12" rx="3" fill="#FAF3E8" />
              <rect x="100" y="9" width="15" height="12" rx="3" fill="#FAF3E8" />
              <circle cx="94" cy="148" r="6" fill="#FAF3E8" opacity="0.88" />
            </svg>
            <span v-if="!unrolled" class="leader-label">拉出胶卷</span>
          </div>
        </div>

        <template v-if="unrolled">
          <div class="film-rail-hit rail-top" aria-hidden="true" @pointerdown="onRailPointerDown" />
          <div class="film-rail-hit rail-bottom" aria-hidden="true" @pointerdown="onRailPointerDown" />
        </template>
      </div>

      <!-- 初始拉出胶卷的手势指引 -->
      <HandHint
        v-if="!isUnderlay && !unrolled && !isPullingLeader"
        mode="drag-right"
        class="leader-hand"
      />

      <!-- 全部 8 格显影完成后显现下一幕按钮 -->
      <div v-if="!isUnderlay && developedCount === 8" ref="nextWrapEl" class="next-wrap">
        <NextButton :label="SITE_CONFIG.scene5.nextLabel" @click="onGoNext" />
      </div>

      <HintBubble :text="mistakes.bubbleText.value" />
    </PaperBg>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import Bunting from '../components/Bunting.vue'
import HandHint from '../components/HandHint.vue'
import HintBubble from '../components/HintBubble.vue'
import NextButton from '../components/NextButton.vue'
import PaperBg from '../components/PaperBg.vue'
import { useMistakes } from '../components/useMistakes'
import { SITE_CONFIG, type SceneId } from '../config'
import { animateProp, claimProp, handOverProp } from '../director/handoff'
import type { HandoffProp, TransitionMode } from '../director/types'
import { assetUrl } from '../engine/audio'
import { clamp, getStageCoords } from '../engine/coords'
import { playPetalRustle, playTap, playWindChime } from '../engine/sfx'
import { stageState } from '../engine/stage'
import { attachStageDrag } from '../engine/useDrag'

const props = withDefaults(
  defineProps<{
    isUnderlay?: boolean
  }>(),
  { isUnderlay: false },
)

const emit = defineEmits<{
  complete: [mode: TransitionMode]
}>()

const SLOT_W = 222
const TOTAL_SLOTS = 9
const VISIBLE_SLOTS = 4
const VIEWPORT_W = SLOT_W * VISIBLE_SLOTS // 888px，每次精准展示 4 格完整底片
const maxPanX = (TOTAL_SLOTS - VISIBLE_SLOTS) * SLOT_W // 1110px

const mistakes = useMistakes()
const canisterEl = ref<HTMLElement | null>(null)
const leaderEl = ref<HTMLElement | null>(null)
const nextWrapEl = ref<HTMLElement | null>(null)
const photoEls = new Map<number, HTMLElement>()

const framesState = reactive(
  SITE_CONFIG.scene5.frames.map((f) => ({
    ...f,
    clarity: 0,
    developed: false,
    justFlashed: false,
  })),
)

const unrolled = ref(false)
const isPullingLeader = ref(false)
const revealWidth = ref(136)
const panX = ref(TOTAL_SLOTS * SLOT_W)

const developedCount = computed(() => framesState.filter((f) => f.developed).length)

const firstVisibleIdx = computed(() => clamp(Math.round(panX.value / SLOT_W), 0, TOTAL_SLOTS - VISIBLE_SLOTS))

const firstVisibleUndevelopedIdx = computed(() => {
  if (!unrolled.value) return -1
  const start = firstVisibleIdx.value
  const end = Math.min(7, start + VISIBLE_SLOTS - 1)
  for (let i = start; i <= end; i++) {
    if (!framesState[i].developed) return i
  }
  return -1
})

const subPrompt = computed(() => {
  if (!unrolled.value) return SITE_CONFIG.scene5.pullHint
  if (developedCount.value < 8) {
    return '轻轻擦拭模糊的底片，就会慢慢对焦清晰啦~'
  }
  return '每一格都显影啦！最后一格“？”，留给我们的明天~'
})

let detachLeaderDrag: (() => void) | null = null
const detachPhotoDrags: (() => void)[] = []
let railDragCleanup: (() => void) | null = null
let lastTickStep = 0

function setPhotoRef(idx: number, el: unknown) {
  if (el instanceof HTMLElement) {
    photoEls.set(idx, el)
  } else {
    photoEls.delete(idx)
  }
}

function finalizeUnroll() {
  if (unrolled.value) return
  unrolled.value = true
  isPullingLeader.value = false
  detachLeaderDrag?.()
  playWindChime()
  gsap.to(revealWidth, {
    value: VIEWPORT_W,
    duration: 0.48,
    ease: 'power2.out',
  })
  gsap.to(panX, {
    value: 0,
    duration: 0.56,
    ease: 'power2.out',
    onComplete: () => {
      setupPhotoInteractions()
    },
  })
}

function rubberClampPan(raw: number): number {
  if (raw < 0) return raw * 0.32
  if (raw > maxPanX) return maxPanX + (raw - maxPanX) * 0.32
  return raw
}

function snapPanToSlot(slotStartIdx: number, dur = 0.44) {
  const targetSlot = clamp(Math.round(slotStartIdx), 0, TOTAL_SLOTS - VISIBLE_SLOTS)
  gsap.to(panX, {
    value: targetSlot * SLOT_W,
    duration: dur,
    ease: 'power3.out',
  })
}

function releasePanWithMomentum(velPxPerMs: number) {
  const projected = panX.value - velPxPerMs * 185
  const clamped = clamp(projected, 0, maxPanX)
  const overscrolled = panX.value < 0 || panX.value > maxPanX
  snapPanToSlot(clamped / SLOT_W, overscrolled ? 0.52 : 0.46)
}

function setFrameClarity(idx: number, nextClarity: number) {
  const item = framesState[idx]
  if (!item || item.developed) return
  item.clarity = clamp(nextClarity, 0, 1)
  if (item.clarity >= 0.72) {
    item.clarity = 1
    item.developed = true
    item.justFlashed = true
    setTimeout(() => {
      item.justFlashed = false
    }, 360)
    playWindChime()
    mistakes.clear('focus')

    // 当前 4 格可视窗口内的未显影照片全部洗完后，丝滑自动翻至下一组未显影格（最终停在第 9 格「?」）
    const start = firstVisibleIdx.value
    const end = Math.min(7, start + VISIBLE_SLOTS - 1)
    const anyLeftHere = framesState.slice(start, end + 1).some((f) => !f.developed)
    if (!anyLeftHere) {
      const nextUndev = framesState.findIndex((f) => !f.developed)
      if (nextUndev >= 0) {
        snapPanToSlot(nextUndev)
      } else {
        snapPanToSlot(TOTAL_SLOTS - VISIBLE_SLOTS) // 锁定 06A, 07A, 08A, 09? 四整格
      }
    }
  }
}

function onRailPointerDown(downEv: PointerEvent) {
  if (props.isUnderlay || !unrolled.value) return
  downEv.stopPropagation()
  railDragCleanup?.()
  gsap.killTweensOf(panX)

  const startStage = getStageCoords(downEv.clientX, downEv.clientY, stageState.stageEl)
  const startPan = panX.value
  let lastX = startStage.x
  let lastT = performance.now()
  let velX = 0

  const onMove = (e: PointerEvent) => {
    const pt = getStageCoords(e.clientX, e.clientY, stageState.stageEl)
    const now = performance.now()
    const dt = Math.max(8, now - lastT)
    const instVel = (pt.x - lastX) / dt
    velX = velX * 0.55 + instVel * 0.45
    lastX = pt.x
    lastT = now
    panX.value = rubberClampPan(startPan - (pt.x - startStage.x))
  }

  const cleanup = () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
    railDragCleanup = null
  }

  const onUp = () => {
    cleanup()
    releasePanWithMomentum(velX)
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
  railDragCleanup = cleanup
}

function setupLeaderDrag() {
  detachLeaderDrag?.()
  if (!leaderEl.value || props.isUnderlay || unrolled.value) return

  let pullStartW = revealWidth.value
  let startPan = panX.value

  detachLeaderDrag = attachStageDrag(leaderEl.value, {
    canStart: () => !unrolled.value,
    onStart() {
      isPullingLeader.value = true
      pullStartW = revealWidth.value
      startPan = panX.value
      lastTickStep = 0
      mistakes.clear('leader')
    },
    onMove(pt) {
      const delta = clamp(pt.dx, 0, VIEWPORT_W - 136)
      revealWidth.value = pullStartW + delta
      panX.value = Math.max(0, startPan - delta * 1.15)

      const step = Math.floor(delta / 56)
      if (step > lastTickStep) {
        lastTickStep = step
        playTap()
      }
      if (revealWidth.value >= 340) {
        finalizeUnroll()
      }
    },
    onEnd() {
      isPullingLeader.value = false
      if (unrolled.value) return
      if (revealWidth.value >= 280) {
        finalizeUnroll()
      } else {
        gsap.to(revealWidth, { value: 136, duration: 0.4, ease: 'elastic.out(1, 0.6)' })
        gsap.to(panX, { value: TOTAL_SLOTS * SLOT_W, duration: 0.4, ease: 'power2.out' })
        mistakes.trigger('leader', '按住黑色胶片拉舌往右多拉一点，底片就出来啦~')
      }
    },
    onCancel() {
      isPullingLeader.value = false
      if (!unrolled.value) {
        gsap.to(revealWidth, { value: 136, duration: 0.3 })
        gsap.to(panX, { value: TOTAL_SLOTS * SLOT_W, duration: 0.3 })
      }
    },
  })
}

function setupPhotoInteractions() {
  while (detachPhotoDrags.length) {
    detachPhotoDrags.pop()?.()
  }
  if (props.isUnderlay || !unrolled.value) return

  framesState.forEach((item, idx) => {
    const el = photoEls.get(idx)
    if (!el) return
    let lastSoundMilestone = 0
    let startPan = panX.value
    let lastX = 0
    let lastT = 0
    let velX = 0
    let isPanning = false

    const clean = attachStageDrag(el, {
      canStart: () => unrolled.value,
      onStart(pt) {
        gsap.killTweensOf(panX)
        startPan = panX.value
        lastX = pt.x
        lastT = performance.now()
        velX = 0
        isPanning = item.developed
        lastSoundMilestone = Math.floor(item.clarity * 3)
      },
      onMove(pt) {
        if (!item.developed) {
          // 轻快不累手节奏：轻拂约 60px（1~2 下）即对焦完毕
          const stroke = Math.hypot(pt.stepDx, pt.stepDy)
          if (stroke > 0) {
            setFrameClarity(idx, item.clarity + stroke / 78)
            const ms = Math.floor(item.clarity * 3)
            if (ms > lastSoundMilestone && !item.developed) {
              lastSoundMilestone = ms
              playTap()
            }
          }
        } else if (isPanning) {
          // 已显影的照片支持顺滑惯性左右划动翻卷浏览
          const now = performance.now()
          const dt = Math.max(8, now - lastT)
          velX = velX * 0.55 + ((pt.x - lastX) / dt) * 0.45
          lastX = pt.x
          lastT = now
          panX.value = rubberClampPan(startPan - pt.dx)
        }
      },
      onEnd(pt) {
        if (!item.developed && pt.dist < 10) {
          mistakes.trigger('focus', '在照片上轻轻划一两下就对焦清晰啦~')
        } else if (isPanning && (Math.abs(pt.dx) > 12 || Math.abs(velX) > 0.15)) {
          releasePanWithMomentum(velX)
        }
      },
    })
    detachPhotoDrags.push(clean)
  })
}

function onGoNext() {
  playTap()
  emit('complete', 'prop-handoff')
}

async function intro(handoffProps: HandoffProp[]) {
  const canister = handoffProps.find((p) => p.id === 'film_canister')
  if (canister) {
    claimProp('film_canister')
  }
}

function play() {
  void nextTick().then(() => {
    if (!unrolled.value) {
      setupLeaderDrag()
    } else {
      setupPhotoInteractions()
    }
  })
}

async function outro(_nextScene: SceneId): Promise<HandoffProp[]> {
  detachLeaderDrag?.()
  railDragCleanup?.()
  while (detachPhotoDrags.length) {
    detachPhotoDrags.pop()?.()
  }

  playPetalRustle()

  // 一镜到底 5→6：从第 2 格「表白送花」位置飞出粉色手绘玫瑰花瓣，胶卷向左收起
  const frame2ScreenX = clamp(298 + SLOT_W * 1.4 - panX.value, 320, 940)
  const petalConfigs = [
    { id: 'petal_1', dx: 180, dy: -165, rot: -42, fill: '#F4A3B4' },
    { id: 'petal_2', dx: 360, dy: -90, rot: 28, fill: '#F7C2CE' },
    { id: 'petal_3', dx: 480, dy: 95, rot: -18, fill: '#EE869F' },
    { id: 'petal_4', dx: 290, dy: 185, rot: 54, fill: '#F4A3B4' },
    { id: 'petal_5', dx: 620, dy: -40, rot: -32, fill: '#F7C2CE' },
    { id: 'petal_6', dx: 540, dy: 210, rot: 16, fill: '#E87390' },
  ]

  for (const p of petalConfigs) {
    handOverProp({
      id: p.id,
      kind: 'html',
      x: frame2ScreenX,
      y: 310,
      width: 44,
      height: 44,
      rotation: p.rot,
      opacity: 0.95,
      zIndex: 45,
      html: `<svg viewBox="0 0 40 40" width="44" height="44"><path d="M20 4 C31 8, 36 22, 24 34 C14 36, 5 26, 9 14 C12 8, 16 5, 20 4 Z" fill="${p.fill}" stroke="#C95974" stroke-width="1.4"/></svg>`,
    })
  }

  if (canisterEl.value) {
    gsap.to(canisterEl.value, { x: -160, opacity: 0, duration: 0.45, ease: 'power2.in' })
  }
  gsap.to(revealWidth, { value: 0, duration: 0.42, ease: 'power2.in' })
  if (nextWrapEl.value) {
    gsap.to(nextWrapEl.value, { opacity: 0, duration: 0.25 })
  }

  await Promise.all(
    petalConfigs.map((p, idx) =>
      animateProp(p.id, {
        x: clamp(frame2ScreenX + p.dx, 140, 1140),
        y: clamp(310 + p.dy, 90, 620),
        rotation: p.rot + (idx % 2 === 0 ? 110 : -95),
        scale: 1.28,
        opacity: 0,
        duration: 0.72,
        ease: 'power2.out',
      }),
    ),
  )

  return []
}

onMounted(() => {
  if (!props.isUnderlay) {
    setupLeaderDrag()
  }
})

onBeforeUnmount(() => {
  detachLeaderDrag?.()
  railDragCleanup?.()
  while (detachPhotoDrags.length) {
    detachPhotoDrags.pop()?.()
  }
})

defineExpose({
  intro,
  play,
  outro,
})
</script>

<style scoped>
.scene-05 {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  overflow: hidden;
}

.scene-header {
  position: absolute;
  left: 72px;
  top: 40px;
  z-index: 20;
}

.title-main {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 46px;
  font-weight: 400;
  color: var(--ink);
}

.title-sub {
  margin: 8px 0 0;
  font-family: var(--font-body);
  font-size: 20px;
  color: var(--ink-soft);
}

/* 右上角极简手写进度低语 */
.film-whisper {
  position: absolute;
  right: 88px;
  top: 52px;
  font-family: var(--font-hand);
  font-size: 28px;
  color: var(--accent-red);
  z-index: 22;
}

.film-canister {
  position: absolute;
  left: 126px;
  top: 162px;
  width: 186px;
  height: 304px;
  object-fit: contain;
  z-index: 22;
  filter: drop-shadow(0 14px 24px rgba(43, 35, 29, 0.26));
  pointer-events: none;
}

.film-viewport {
  position: absolute;
  left: 294px;
  top: 162px;
  height: 486px;
  overflow: hidden;
  z-index: 16;
}

.film-track {
  display: flex;
  align-items: flex-start;
  width: max-content;
  will-change: transform;
}

.film-slot {
  width: 222px;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sprocket-svg {
  width: 222px;
  height: 30px;
  display: block;
}

.film-rail-hit {
  position: absolute;
  inset-inline: 0;
  height: 38px;
  cursor: grab;
  touch-action: none;
}

.film-rail-hit.rail-top {
  top: 0;
}

.film-rail-hit.rail-bottom {
  top: 266px;
}

.svg-code {
  font-family: monospace;
  font-size: 11px;
  fill: #E8A656;
  letter-spacing: 0.4px;
}

.photo-aperture {
  position: relative;
  width: 222px;
  height: 244px;
  padding: 6px 24px;
  background: #2E2925;
  overflow: hidden;
  touch-action: none;
  user-select: none;
}

.photo-aperture.is-interactive,
.photo-aperture.is-pannable {
  cursor: grab;
}

.frame-img {
  position: absolute;
  left: 24px;
  top: 6px;
  width: 174px;
  height: 232px;
  object-fit: cover;
  border-radius: 3px;
  display: block;
  pointer-events: none;
}

.frame-img.preblur {
  transition: opacity 0.08s linear;
}

.develop-flash {
  position: absolute;
  left: 24px;
  top: 6px;
  width: 174px;
  height: 232px;
  border-radius: 3px;
  background: rgba(255, 250, 236, 0.72);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.34s ease;
}

.develop-flash.active {
  opacity: 1;
}

.wipe-hand {
  position: absolute;
  left: 84px;
  top: 96px;
}

.blank-aperture {
  display: flex;
  align-items: center;
  justify-content: center;
}

.blank-paper {
  width: 174px;
  height: 232px;
  border-radius: 3px;
  background: #FFFDF7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question-mark {
  font-family: var(--font-hand);
  font-size: 88px;
  color: #8A7461;
  transform: rotate(-4deg);
}

.slot-caption {
  width: 202px;
  margin-top: 12px;
  text-align: center;
  opacity: 0.22;
  transform: translateY(4px);
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.slot-caption.visible {
  opacity: 1;
  transform: translateY(0);
}

.slot-title {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 23px;
  font-weight: 400;
  color: var(--ink);
  line-height: 1.2;
}

.slot-text {
  margin: 5px 0 0;
  font-family: var(--font-body);
  font-size: 13.5px;
  color: var(--ink-soft);
  line-height: 1.42;
}

.film-leader {
  position: relative;
  width: 130px;
  height: 292px;
  flex: none;
  cursor: grab;
  touch-action: none;
}

.film-leader.is-unrolled {
  cursor: default;
}

.leader-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.leader-label {
  position: absolute;
  left: 20px;
  top: 86px;
  font-family: var(--font-hand);
  font-size: 22px;
  color: #FAF3E8;
  pointer-events: none;
  white-space: nowrap;
}

.leader-hand {
  position: absolute;
  left: 344px;
  top: 266px;
  z-index: 25;
}

.next-wrap {
  position: absolute;
  right: 44px;
  bottom: 26px;
  z-index: 30;
}
</style>
