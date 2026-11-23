<template>
  <div ref="rootEl" class="scene-01">
    <!-- 左半边整层（牛皮纸 + 礼单同步沿中央手撕轮廓裁切，拆开后自带有机白纸芯毛边） -->
    <div ref="leftHalfEl" class="tear-half half-left" :style="{ clipPath: leftClip }">
      <Scene01Sheet />
      <svg v-if="tearProgress > 0" class="half-deckle-svg" viewBox="0 0 1280 720" aria-hidden="true">
        <polyline :points="leftFibers" class="deckle-shadow" />
        <polyline :points="leftFibers" class="deckle-core" />
      </svg>
    </div>

    <!-- 右半边整层 -->
    <div ref="rightHalfEl" class="tear-half half-right" :style="{ clipPath: rightClip }">
      <Scene01Sheet />
      <svg v-if="tearProgress > 0" class="half-deckle-svg" viewBox="0 0 1280 720" aria-hidden="true">
        <polyline :points="rightFibers" class="deckle-shadow" />
        <polyline :points="rightFibers" class="deckle-core" />
      </svg>
    </div>

    <!-- 只在尚未撕开的纸上画压痕 -->
    <svg
      v-if="phase === 'tear'"
      class="tear-guide-svg"
      viewBox="0 0 1280 720"
      aria-hidden="true"
    >
      <polyline
        :points="remainingSeam"
        fill="none"
        stroke="rgba(68, 46, 30, 0.62)"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-dasharray="8 7"
      />
    </svg>

    <div
      v-if="phase === 'tear'"
      class="kraft-whisper tear-whisper"
      :class="{ 'gold-guide': mistakes.glowKey.value === 'tear' }"
    >
      {{ SITE_CONFIG.scene1.step2Hint }}
    </div>

    <HandHint
      v-if="phase === 'tear' && !isDraggingTear"
      mode="drag-down"
      class="tear-hand-hint"
    />

    <!-- 第一步：红白条纹丝带与蝴蝶结（还原 frames/frame_001.0.jpg） -->
    <svg
      v-if="phase === 'ribbon' || phase === 'untying'"
      ref="ribbonSvgEl"
      class="ribbon-overlay"
      :class="{
        'gentle-shake': mistakes.shakingKey.value === 'ribbon',
        'gold-guide': mistakes.glowKey.value === 'ribbon',
      }"
      viewBox="0 0 1280 720"
      aria-hidden="true"
    >
      <!-- 纵向礼盒丝带（穿过礼单与上方） -->
      <g stroke-linecap="round" fill="none">
        <line x1="680" y1="0" x2="778" y2="720" stroke="rgba(43,35,29,0.22)" stroke-width="14" transform="translate(3,4)" />
        <line x1="680" y1="0" x2="778" y2="720" stroke="#FAF2E8" stroke-width="13" />
        <line x1="680" y1="0" x2="778" y2="720" stroke="#B63032" stroke-width="9" />
        <line x1="680" y1="0" x2="778" y2="720" stroke="#FFFDF9" stroke-width="3.2" />
        <line x1="680" y1="0" x2="778" y2="720" stroke="#C83E3B" stroke-width="1.4" />
      </g>

      <!-- 横向礼盒丝带 -->
      <g stroke-linecap="round" fill="none">
        <line x1="440" y1="262" x2="848" y2="222" stroke="rgba(43,35,29,0.2)" stroke-width="14" transform="translate(2,4)" />
        <line x1="440" y1="262" x2="848" y2="222" stroke="#FAF2E8" stroke-width="13" />
        <line x1="440" y1="262" x2="848" y2="222" stroke="#B63032" stroke-width="9" />
        <line x1="440" y1="262" x2="848" y2="222" stroke="#FFFDF9" stroke-width="3.2" />
        <line x1="440" y1="262" x2="848" y2="222" stroke="#C83E3B" stroke-width="1.4" />
      </g>

      <!-- 蝴蝶结两只大耳朵（拉动或抽结解开时真实向中心收拢抽松） -->
      <g
        ref="bowLoopsEl"
        :style="{
          transform: `translate(712px, 232px) scale(${bowScaleX}, ${bowScaleY}) translate(-712px, -232px)`,
        }"
      >
        <!-- 左耳 -->
        <path
          d="M712 232 C645 148, 558 182, 578 242 C594 288, 668 258, 712 232 Z"
          fill="none"
          stroke="#B63032"
          stroke-width="12"
          stroke-linejoin="round"
        />
        <path
          d="M712 232 C645 148, 558 182, 578 242 C594 288, 668 258, 712 232 Z"
          fill="none"
          stroke="#FFFDF9"
          stroke-width="4"
          stroke-linejoin="round"
        />
        <!-- 右耳 -->
        <path
          d="M712 232 C768 156, 862 170, 844 232 C828 282, 756 254, 712 232 Z"
          fill="none"
          stroke="#B63032"
          stroke-width="12"
          stroke-linejoin="round"
        />
        <path
          d="M712 232 C768 156, 862 170, 844 232 C828 282, 756 254, 712 232 Z"
          fill="none"
          stroke="#FFFDF9"
          stroke-width="4"
          stroke-linejoin="round"
        />
      </g>

      <!-- 左侧垂落丝带尾 -->
      <path
        :d="`M712 232 Q718 ${420 + bowUnravel * 45} 718 ${625 + bowUnravel * 60}`"
        fill="none"
        stroke="#B63032"
        stroke-width="10"
        stroke-linecap="round"
      />
      <path
        :d="`M712 232 Q718 ${420 + bowUnravel * 45} 718 ${625 + bowUnravel * 60}`"
        fill="none"
        stroke="#FFFDF9"
        stroke-width="3.2"
        stroke-linecap="round"
      />

      <!-- 右侧可交互拉动的丝带尾端 -->
      <g>
        <path
          :d="`M712 232 Q${768 + ribbonPull.dx * 0.45} ${365 + ribbonPull.dy * 0.4} ${tailTip.x} ${tailTip.y}`"
          fill="none"
          stroke="rgba(43,35,29,0.22)"
          stroke-width="13"
          stroke-linecap="round"
          transform="translate(2,3)"
        />
        <path
          :d="`M712 232 Q${768 + ribbonPull.dx * 0.45} ${365 + ribbonPull.dy * 0.4} ${tailTip.x} ${tailTip.y}`"
          fill="none"
          stroke="#B63032"
          stroke-width="11"
          stroke-linecap="round"
        />
        <path
          :d="`M712 232 Q${768 + ribbonPull.dx * 0.45} ${365 + ribbonPull.dy * 0.4} ${tailTip.x} ${tailTip.y}`"
          fill="none"
          stroke="#FFFDF9"
          stroke-width="3.6"
          stroke-linecap="round"
        />
      </g>

      <!-- 中心绳结 -->
      <circle cx="712" cy="232" :r="Math.max(4, 10 - bowUnravel * 5)" fill="#B63032" stroke="#FFFDF9" stroke-width="3" />
    </svg>

    <!-- 第一步直接写在牛皮纸上的手写引导小字与卡通手势 -->
    <div v-if="phase === 'ribbon'" class="kraft-whisper step1-whisper">
      {{ SITE_CONFIG.scene1.step1Hint }}
    </div>

    <HandHint
      v-if="phase === 'ribbon' && !isDraggingRibbon"
      mode="drag-right"
      class="ribbon-hand-hint"
      :style="{ left: `${tailTip.x - 16}px`, top: `${tailTip.y - 12}px` }"
    />

    <!-- 全局交互捕获层 -->
    <div ref="hitLayerEl" class="hit-layer" />

    <!-- 宠溺提示气泡 -->
    <HintBubble :text="mistakes.bubbleText.value" />
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import HandHint from '../components/HandHint.vue'
import HintBubble from '../components/HintBubble.vue'
import { useMistakes } from '../components/useMistakes'
import { SITE_CONFIG, type SceneId } from '../config'
import type { TransitionMode } from '../director/types'
import { unlockAndPlayBgm } from '../engine/audio'
import { clamp } from '../engine/coords'
import { playPaperTearFinish, playPaperTearTick, playRibbonUntie } from '../engine/sfx'
import { attachStageDrag } from '../engine/useDrag'
import Scene01Sheet from './Scene01Sheet.vue'

const emit = defineEmits<{
  'prepare-underlay': [scene: SceneId]
  complete: [mode: TransitionMode]
}>()

const mistakes = useMistakes()
const rootEl = ref<HTMLElement | null>(null)
const leftHalfEl = ref<HTMLElement | null>(null)
const rightHalfEl = ref<HTMLElement | null>(null)
const ribbonSvgEl = ref<SVGSVGElement | null>(null)
const hitLayerEl = ref<HTMLElement | null>(null)

const phase = ref<'ribbon' | 'untying' | 'tear' | 'opening' | 'done'>('ribbon')
const isDraggingRibbon = ref(false)
const isDraggingTear = ref(false)
const tearProgress = ref(0)
const ribbonPull = reactive({ dx: 0, dy: 0 })
const bowUnravel = ref(0)

// 丝带右尾默认落点（参考 frame_001.0.jpg 右下角）
const TAIL_BASE_X = 838
const TAIL_BASE_Y = 492

const tailTip = computed(() => ({
  x: TAIL_BASE_X + ribbonPull.dx,
  y: TAIL_BASE_Y + ribbonPull.dy,
}))

const bowScaleX = computed(() => {
  const pull = Math.hypot(ribbonPull.dx, ribbonPull.dy)
  const dragCompress = clamp(1 - pull / 260, 0.72, 1)
  return dragCompress * (1 - bowUnravel.value * 0.84)
})

const bowScaleY = computed(() => {
  const pull = Math.hypot(ribbonPull.dx, ribbonPull.dy)
  const dragCompress = clamp(1 - pull / 260, 0.72, 1)
  return dragCompress * (1 - bowUnravel.value * 0.92)
})

function seamNoise(t: number, salt: number): number {
  const i0 = Math.floor(t)
  const f = t - i0
  const u = f * f * (3 - 2 * f)
  const h = (n: number) => {
    const v = Math.sin(n * 127.1 + salt * 311.7) * 43758.5453
    return (v - Math.floor(v)) * 2 - 1
  }
  return h(i0) * (1 - u) + h(i0 + 1) * u
}

// 中央多倍频有机手撕撕裂轮廓（0..720 全贯穿，约 110 个不规则纤维折点）
const TEAR_POINTS = Array.from({ length: 113 }, (_, idx) => {
  const t = idx / 112
  const y = Math.round(t * 720)
  const macro = seamNoise(t * 4.2, 11) * 14 + Math.sin(t * Math.PI * 2.5) * 6
  const med = seamNoise(t * 17.5, 29) * 6.5
  const fine = Math.sin(idx * 41.3 + 7.1) * 2.6
  const dx = idx === 0 || idx === 112 ? 0 : macro + med + fine
  return { x: Math.round(640 + dx), y }
})

const tearFront = computed(() => tearProgress.value * 720)

function splitEdge(side: -1 | 1) {
  const spread = Math.min(tearProgress.value * 2.2, 1) * 137
  return TEAR_POINTS.map(({ x, y }, index) => {
    const peel = clamp((tearFront.value - y) / 235, 0, 1)
    const fiber = Math.sin(index * 2.7 + side) * 3.5
    return { x: x + side * ((spread + fiber) * peel - 1), y }
  })
}

const leftEdge = computed(() => splitEdge(-1))
const rightEdge = computed(() => splitEdge(1))
const leftClip = computed(() => `polygon(0px 0px, ${leftEdge.value.map(({ x, y }) => `${x}px ${y}px`).join(', ')}, 0px 720px)`)
const rightClip = computed(() => `polygon(${rightEdge.value.map(({ x, y }) => `${x}px ${y}px`).join(', ')}, 1280px 720px, 1280px 0px)`)
const leftFibers = computed(() => leftEdge.value.filter(({ y }) => y < tearFront.value).map(({ x, y }) => `${x},${y}`).join(' '))
const rightFibers = computed(() => rightEdge.value.filter(({ y }) => y < tearFront.value).map(({ x, y }) => `${x},${y}`).join(' '))
const remainingSeam = computed(() => TEAR_POINTS.filter(({ y }) => y >= tearFront.value).map(({ x, y }) => `${x},${y}`).join(' '))

let detachDrag: (() => void) | null = null
let untieTimeline: gsap.core.Timeline | null = null
let lastTickStep = 0

function isNearRibbonTail(x: number, y: number): boolean {
  // 宽容触控区：覆盖丝带右尾、中心蝴蝶结及右侧下垂线
  const distTail = Math.hypot(x - tailTip.value.x, y - tailTip.value.y)
  const distBow = Math.hypot(x - 735, y - 245)
  const nearMidRibbon = x >= 690 && x <= 900 && y >= 220 && y <= 575
  return distTail <= 105 || distBow <= 95 || nearMidRibbon
}

function untieRibbon() {
  phase.value = 'untying'
  playRibbonUntie()
  mistakes.clear('ribbon')
  const ribbon = ribbonSvgEl.value
  if (!ribbon) {
    phase.value = 'tear'
    return
  }

  // 结先松开，尾端继续抽出，最后丝带滑离礼单。
  untieTimeline = gsap.timeline({
    onComplete: () => {
      untieTimeline = null
      phase.value = 'tear'
    },
  })
  untieTimeline
    .to(bowUnravel, { value: 1, duration: 0.56, ease: 'sine.inOut' }, 0)
    .to(ribbonPull, {
      dx: ribbonPull.dx + 142,
      dy: ribbonPull.dy + 72,
      duration: 0.62,
      ease: 'sine.out',
    }, 0)
    .to(ribbon, { x: 166, y: 48, rotation: 6, duration: 0.63, ease: 'sine.inOut' }, 0.36)
    .to(ribbon, { opacity: 0, duration: 0.42, ease: 'sine.inOut' }, 0.57)
}

function finishTearReveal() {
  if (phase.value === 'done') return
  phase.value = 'opening'
  mistakes.clear('tear')
  playPaperTearFinish()

  if (!leftHalfEl.value || !rightHalfEl.value) {
    phase.value = 'done'
    emit('complete', 'tear-reveal')
    return
  }

  const tl = gsap.timeline({
    onComplete: () => {
      phase.value = 'done'
      emit('complete', 'tear-reveal')
    },
  })
  tl.to(
    leftHalfEl.value,
    {
      x: -740,
      y: 44,
      rotation: -12,
      duration: 0.85,
      ease: 'power2.inOut',
    },
    0,
  ).to(
    rightHalfEl.value,
    {
      x: 740,
      y: 44,
      rotation: 12,
      duration: 0.85,
      ease: 'power2.inOut',
    },
    0,
  )
}

onMounted(() => {
  // 一镜到底关键：幕 1 挂载时即通知导演在底层摆好幕 2 蛋糕
  emit('prepare-underlay', 2)

  if (!hitLayerEl.value) return
  let dragMode: 'ribbon' | 'tear' | 'wrong-ribbon' | null = null
  let maxTearDy = 0

  detachDrag = attachStageDrag(hitLayerEl.value, {
    onStart(pt) {
      if (phase.value === 'untying' || phase.value === 'opening' || phase.value === 'done') {
        dragMode = null
        return
      }

      if (phase.value === 'ribbon') {
        // 首次按下即同步触发音频解锁 + BGM 播放（兼容微信/iOS 严格播放限制）
        unlockAndPlayBgm()
        if (isNearRibbonTail(pt.x, pt.y)) {
          dragMode = 'ribbon'
          isDraggingRibbon.value = true
          mistakes.clear('ribbon')
        } else {
          dragMode = 'wrong-ribbon'
          mistakes.trigger('ribbon', SITE_CONFIG.scene1.teaseStep1)
        }
        return
      }

      if (phase.value === 'tear') {
        if (Math.abs(pt.x - 640) <= 170) {
          gsap.killTweensOf(tearProgress)
          tearProgress.value = 0
          dragMode = 'tear'
          isDraggingTear.value = true
          maxTearDy = 0
          lastTickStep = 0
          mistakes.clear('tear')
        } else {
          dragMode = null
          mistakes.trigger('tear', SITE_CONFIG.scene1.step2Hint)
        }
      }
    },

    onMove(pt) {
      if (dragMode === 'ribbon') {
        ribbonPull.dx = clamp(pt.dx, -40, 200)
        ribbonPull.dy = clamp(pt.dy, -40, 180)
        if (pt.dist > 40) {
          dragMode = null
          isDraggingRibbon.value = false
          untieRibbon()
        }
        return
      }

      if (dragMode === 'tear') {
        maxTearDy = Math.max(maxTearDy, pt.dy)
        const progress = clamp(maxTearDy / (720 * 0.6), 0, 1)
        tearProgress.value = progress

        const step = Math.floor(progress * 10)
        if (step > lastTickStep) {
          lastTickStep = step
          playPaperTearTick(progress)
        }

        if (progress >= 1) {
          dragMode = null
          isDraggingTear.value = false
          finishTearReveal()
        }
      }
    },

    onEnd(pt) {
      if (dragMode === 'ribbon') {
        isDraggingRibbon.value = false
        if (pt.dist > 40) {
          untieRibbon()
        } else {
          gsap.to(ribbonPull, {
            dx: 0,
            dy: 0,
            duration: 0.45,
            ease: 'elastic.out(1, 0.58)',
          })
          mistakes.trigger('ribbon', SITE_CONFIG.scene1.teaseStep1)
        }
      } else if (dragMode === 'tear') {
        isDraggingTear.value = false
        if (tearProgress.value >= 1) {
          finishTearReveal()
        } else {
          if (tearProgress.value > 0.04) {
            mistakes.trigger('tear', SITE_CONFIG.scene1.teaseStep2)
          }
          gsap.to(tearProgress, {
            value: 0,
            duration: 0.3,
            ease: 'power2.out',
          })
        }
      }
      dragMode = null
    },

    onCancel() {
      if (dragMode === null) return
      isDraggingRibbon.value = false
      isDraggingTear.value = false
      dragMode = null
      gsap.to(ribbonPull, { dx: 0, dy: 0, duration: 0.3 })
      gsap.to(tearProgress, {
        value: 0,
        duration: 0.3,
      })
    },
  })
})

onBeforeUnmount(() => {
  detachDrag?.()
  untieTimeline?.kill()
})

defineExpose({
  play: () => {},
})
</script>

<style scoped>
.scene-01 {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  overflow: hidden;
}

.tear-half {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  will-change: transform;
  pointer-events: none;
}

.half-deckle-svg {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  pointer-events: none;
  z-index: 12;
}

.deckle-shadow,
.deckle-core {
  fill: none;
  stroke-linejoin: round;
}

.deckle-shadow {
  stroke: rgba(117, 83, 56, 0.32);
  stroke-width: 23;
}

.deckle-core {
  stroke: #FFF9ED;
  stroke-width: 14;
}

.ribbon-overlay {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  pointer-events: none;
  z-index: 15;
}

.tear-guide-svg {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  pointer-events: none;
  z-index: 16;
}

.kraft-whisper {
  position: absolute;
  font-family: var(--font-hand);
  font-size: 29px;
  color: rgba(42, 27, 16, 0.86);
  text-shadow: 0 1px 0 rgba(255, 244, 230, 0.42);
  pointer-events: none;
  white-space: nowrap;
}

.step1-whisper {
  left: 912px;
  top: 432px;
  transform: rotate(-1.5deg);
  z-index: 18;
}

.ribbon-hand-hint {
  position: absolute;
  z-index: 25;
}

.tear-whisper {
  left: 890px;
  top: 320px;
  transform: rotate(-1.2deg);
  z-index: 24;
}

.tear-hand-hint {
  position: absolute;
  left: 652px;
  top: 120px;
  z-index: 25;
}

.hit-layer {
  position: absolute;
  inset: 0;
  z-index: 30;
  touch-action: none;
}
</style>
