<template>
  <div ref="rootEl" class="scene-02">
    <PaperBg variant="parchment">
      <!-- 顶部彩旗（左侧派对主弧线 + 右侧角落点缀，还原 frames/frame_004.0.jpg） -->
      <Bunting variant="party" />
      <Bunting variant="corner" />

      <!-- 杂志剪贴风 Happy Birthday 拼贴标题 -->
      <div ref="titleEl" class="collage-title" aria-label="Happy Birthday">
        <div class="collage-row">
          <span
            v-for="(ch, idx) in row1Chars"
            :key="`r1-${idx}`"
            class="cutout-char"
            :style="{ transform: `rotate(${ch.rot}deg)` }"
          >
            {{ ch.char }}
          </span>
        </div>
        <div class="collage-row">
          <span
            v-for="(ch, idx) in row2Chars"
            :key="`r2-${idx}`"
            class="cutout-char"
            :style="{ transform: `rotate(${ch.rot}deg)` }"
          >
            {{ ch.char }}
          </span>
        </div>
      </div>

      <!-- 左侧 23 岁抱花童年立牌与草莓蛋糕主视觉（供幕 1 撕开直接裸露） -->
      <div ref="cakeStageEl" class="cake-stage">
        <img :src="assetUrl('assets/art/number_23.webp')" alt="23" class="art-23" />
        <img :src="assetUrl('assets/photos/her_cake_cut.webp')" alt="佳奇 guaiguai" class="portrait-cake" />
        <img :src="assetUrl('assets/art/hat_blue_stripes.webp')" alt="生日帽" class="hat-stripes" />
        <img :src="assetUrl('assets/art/cake_strawberry.webp')" alt="草莓奶油蛋糕" class="cake-strawberry" />

        <!-- 随熄灭蜡烛数实时减弱的暖黄烛光氛围晕 -->
        <div
          class="candles-ambient-glow"
          :style="{ opacity: (litCount / 5) * 0.85 }"
          aria-hidden="true"
        />

        <!-- 蛋糕顶 5 根独立可吹灭蜡烛（SVG 动画 + 烟雾） -->
        <svg class="candles-svg" viewBox="0 0 220 110" aria-hidden="true">
          <g v-for="(c, i) in candles" :key="i" :transform="`translate(${c.x}, ${c.y})`">
            <circle
              v-if="c.lit"
              cx="8"
              cy="16"
              r="19"
              fill="rgba(255, 206, 86, 0.34)"
              class="flame-halo"
            />
            <rect x="3" y="28" width="10" height="44" rx="2" :fill="c.body" stroke="#7A563C" stroke-width="1.4" />
            <line x1="3" y1="38" x2="13" y2="34" stroke="#FFFDF8" stroke-width="2.4" />
            <line x1="3" y1="50" x2="13" y2="46" stroke="#FFFDF8" stroke-width="2.4" />
            <line x1="3" y1="62" x2="13" y2="58" stroke="#FFFDF8" stroke-width="2.4" />
            <line x1="8" y1="28" x2="8" y2="21" stroke="#3D2B1F" stroke-width="1.6" />

            <!-- 跳动火苗（受手指拂动影响微倾） -->
            <g
              v-if="c.lit"
              class="flame-tilt"
              :style="{ transform: `rotate(${c.lean}deg)`, transformOrigin: '8px 22px' }"
            >
              <g class="flame-flicker" :style="{ animationDelay: `${i * 0.17}s` }">
                <path d="M8 3 C13 11, 14 19, 8 22 C2 19, 3 11, 8 3 Z" fill="#FF9F2E" />
                <path d="M8 9 C10.8 13, 11 18.5, 8 20.5 C5 18.5, 5.2 13, 8 9 Z" fill="#FFF3A8" />
              </g>
            </g>

            <!-- 吹灭后袅袅升起的青烟 -->
            <path
              v-if="c.smoke"
              d="M8 20 Q2 12 9 4 Q15 -4 8 -14"
              fill="none"
              stroke="rgba(160, 145, 132, 0.72)"
              stroke-width="2.6"
              stroke-linecap="round"
              class="smoke-wisp"
            />
          </g>
        </svg>
      </div>

      <!-- 右侧文案区：许愿 -> 吹蜡烛 -> 打字机祝福 -->
      <div ref="copyEl" class="wish-copy">
        <template v-if="phase === 'wish'">
          <h2 class="wish-title">{{ SITE_CONFIG.scene2.wishTitle }}</h2>
        </template>

        <template v-else-if="phase === 'blow'">
          <h2 class="wish-title">{{ SITE_CONFIG.scene2.blowTitle }}</h2>
        </template>

        <template v-else>
          <p class="typewriter-wrap">
            <Typewriter
              :text="SITE_CONFIG.scene2.typewriterText"
              :speed-ms="82"
              :active="phase === 'done'"
              @done="typewriterDone = true"
            />
          </p>
        </template>
      </div>

      <HandHint
        v-if="!isUnderlay && phase === 'wish' && !isHoldingWish"
        mode="press"
        class="wish-hand"
      />
      <HandHint
        v-if="!isUnderlay && phase === 'blow' && !isSwipingBlow"
        mode="drag-right"
        class="blow-hand"
      />

      <!-- 吹蜡烛时手指轻拂带出的柔和风痕 -->
      <svg
        v-if="breezePathMain"
        class="breeze-trail-svg"
        viewBox="0 0 1280 720"
        aria-hidden="true"
      >
        <path
          :d="breezePathMain"
          fill="none"
          stroke="rgba(255, 250, 238, 0.72)"
          stroke-width="6"
          stroke-linecap="round"
        />
        <path
          v-if="breezePathEcho"
          :d="breezePathEcho"
          fill="none"
          stroke="rgba(255, 238, 200, 0.45)"
          stroke-width="3"
          stroke-linecap="round"
        />
      </svg>

      <!-- 舞台内专属 Confetti 画布（竖屏旋转 +90deg 时彩纸重力方向仍精准朝向蛋糕下方） -->
      <canvas ref="confettiCanvasEl" width="1280" height="720" class="stage-confetti" aria-hidden="true" />

      <!-- 长按闭眼许愿：上下弧形眼皮遮罩（还原 frames/frame_005.2.jpg） -->
      <svg
        v-if="eyelidProgress > 0.005"
        class="eyelids-svg"
        viewBox="0 0 1280 720"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path :d="topEyelidPath" fill="#18120E" />
        <path :d="bottomEyelidPath" fill="#18120E" />
      </svg>

      <!-- 全黑闭眼许愿：闪烁的许愿星点与温柔耳语 -->
      <Transition name="whisper-fade">
        <div v-if="eyelidProgress >= 0.88" class="wish-sky-wrap" aria-hidden="true">
          <svg class="wish-stars-svg" viewBox="0 0 1280 720">
            <g
              v-for="(star, idx) in wishStars"
              :key="idx"
              :transform="`translate(${star.x}, ${star.y}) scale(${star.s})`"
              class="wish-star"
              :style="{ animationDelay: `${star.delay}s` }"
            >
              <path
                d="M0,-12 Q1,-1 12,0 Q1,1 0,12 Q-1,1 -12,0 Q-1,-1 0,-12 Z"
                fill="#FCE6B8"
                opacity="0.82"
              />
            </g>
          </svg>
          <div v-if="eyelidProgress >= 0.96 && wishDone" class="wish-whisper">
            ✨ 愿望收好啦，松手睁开眼睛吧~
          </div>
        </div>
      </Transition>

      <!-- 交互捕获层（许愿长按 & 拂火苗吹蜡烛） -->
      <div v-if="!isUnderlay && phase !== 'done'" ref="hitEl" class="hit-layer" />

      <!-- 下一幕按钮 -->
      <div v-if="!isUnderlay && phase === 'done'" ref="nextWrapEl" class="next-wrap">
        <NextButton :label="SITE_CONFIG.scene2.nextLabel" @click="onGoNext" />
      </div>

      <HintBubble :text="mistakes.bubbleText.value" />
    </PaperBg>
  </div>
</template>

<script setup lang="ts">
import confetti from 'canvas-confetti'
import gsap from 'gsap'
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import Bunting from '../components/Bunting.vue'
import HandHint from '../components/HandHint.vue'
import HintBubble from '../components/HintBubble.vue'
import NextButton from '../components/NextButton.vue'
import PaperBg from '../components/PaperBg.vue'
import Typewriter from '../components/Typewriter.vue'
import { useMistakes } from '../components/useMistakes'
import { SITE_CONFIG, type SceneId } from '../config'
import { animateProp, handOverProp } from '../director/handoff'
import type { HandoffProp, TransitionMode } from '../director/types'
import { assetUrl } from '../engine/audio'
import { clamp } from '../engine/coords'
import { createBreathDetector, isMicSupported, type BreathDetector } from '../engine/mic'
import { playBlowOut, playTap, playWindChime } from '../engine/sfx'
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

const mistakes = useMistakes()
const rootEl = ref<HTMLElement | null>(null)
const titleEl = ref<HTMLElement | null>(null)
const cakeStageEl = ref<HTMLElement | null>(null)
const copyEl = ref<HTMLElement | null>(null)
const nextWrapEl = ref<HTMLElement | null>(null)
const hitEl = ref<HTMLElement | null>(null)
const confettiCanvasEl = ref<HTMLCanvasElement | null>(null)

const phase = ref<'wish' | 'blow' | 'done'>('wish')
const isHoldingWish = ref(false)
const wishDone = ref(false)
const eyelidProgress = ref(0)
const isSwipingBlow = ref(false)
const typewriterDone = ref(false)

const breezePoints = ref<{ x: number; y: number }[]>([])

const wishStars = [
  { x: 185, y: 145, s: 0.72, delay: 0.1 },
  { x: 310, y: 235, s: 0.48, delay: 0.5 },
  { x: 420, y: 120, s: 0.95, delay: 0.2 },
  { x: 540, y: 210, s: 0.55, delay: 0.9 },
  { x: 755, y: 155, s: 0.85, delay: 0.35 },
  { x: 920, y: 125, s: 0.62, delay: 0.7 },
  { x: 1085, y: 190, s: 0.9, delay: 0.15 },
  { x: 240, y: 520, s: 0.65, delay: 0.6 },
  { x: 385, y: 590, s: 0.88, delay: 0.25 },
  { x: 560, y: 540, s: 0.52, delay: 1.0 },
  { x: 790, y: 575, s: 0.78, delay: 0.45 },
  { x: 965, y: 525, s: 0.68, delay: 0.85 },
  { x: 1120, y: 585, s: 0.56, delay: 0.3 },
  { x: 150, y: 365, s: 0.5, delay: 0.75 },
  { x: 1135, y: 350, s: 0.65, delay: 0.4 },
]

function buildSmoothCurve(pts: { x: number; y: number }[], offsetY = 0): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x.toFixed(1)} ${(pts[0].y + offsetY).toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const cur = pts[i]
    const mx = ((prev.x + cur.x) / 2).toFixed(1)
    const my = (((prev.y + cur.y) / 2) + offsetY).toFixed(1)
    d += ` Q ${prev.x.toFixed(1)} ${(prev.y + offsetY).toFixed(1)} ${mx} ${my}`
  }
  const last = pts[pts.length - 1]
  d += ` L ${last.x.toFixed(1)} ${(last.y + offsetY).toFixed(1)}`
  return d
}

const breezePathMain = computed(() => buildSmoothCurve(breezePoints.value, 0))
const breezePathEcho = computed(() => buildSmoothCurve(breezePoints.value, -12))

const row1Chars = [
  { char: 'H', rot: -6 },
  { char: 'a', rot: 4 },
  { char: 'p', rot: -3 },
  { char: 'p', rot: 5 },
  { char: 'y', rot: -5 },
]

const row2Chars = [
  { char: 'B', rot: -5 },
  { char: 'i', rot: 6 },
  { char: 'r', rot: -4 },
  { char: 't', rot: 3 },
  { char: 'h', rot: -5 },
  { char: 'd', rot: 4 },
  { char: 'a', rot: -3 },
  { char: 'y', rot: 6 },
]

// 5 根蜡烛在 .candles-svg 内的坐标及对应的舞台中心坐标（精准对齐简化版草莓蛋糕顶面）
const candles = reactive([
  { x: 36, y: 18, body: '#E86C7E', stageX: 430, stageY: 464, lit: true, smoke: false, lean: 0 },
  { x: 68, y: 10, body: '#F2B84B', stageX: 454, stageY: 458, lit: true, smoke: false, lean: 0 },
  { x: 102, y: 15, body: '#6EA8D8', stageX: 479, stageY: 462, lit: true, smoke: false, lean: 0 },
  { x: 136, y: 11, body: '#A8C97F', stageX: 504, stageY: 459, lit: true, smoke: false, lean: 0 },
  { x: 168, y: 19, body: '#C48CE0', stageX: 528, stageY: 465, lit: true, smoke: false, lean: 0 },
])

const litCount = computed(() => candles.filter((c) => c.lit).length)

// 上下弧形眼皮路径（还原 frames/frame_005.2.jpg）
const topEyelidPath = computed(() => {
  const p = clamp(eyelidProgress.value, 0, 1)
  const yMid = 368 * p
  const ySide = 368 * Math.max(0, p - 0.16 * Math.sin(Math.PI * p))
  const yCtrl = 2 * yMid - ySide
  return `M0,0 L1280,0 L1280,${ySide.toFixed(1)} Q640,${yCtrl.toFixed(1)} 0,${ySide.toFixed(1)} Z`
})

const bottomEyelidPath = computed(() => {
  const p = clamp(eyelidProgress.value, 0, 1)
  const yMid = 720 - 368 * p
  const ySide = 720 - 368 * Math.max(0, p - 0.16 * Math.sin(Math.PI * p))
  const yCtrl = 2 * yMid - ySide
  return `M0,720 L1280,720 L1280,${ySide.toFixed(1)} Q640,${yCtrl.toFixed(1)} 0,${ySide.toFixed(1)} Z`
})

let wishRaf = 0
let holdBlowTimer: ReturnType<typeof setTimeout> | null = null
let sequentialTimer: ReturnType<typeof setTimeout> | null = null
let breezeClearTimer: ReturnType<typeof setTimeout> | null = null
let detachDrag: (() => void) | null = null
let breathDetector: BreathDetector | null = null
let stageConfetti: ReturnType<typeof confetti.create> | null = null
let confettiActive = false

function stopWishAnim() {
  if (wishRaf) {
    cancelAnimationFrame(wishRaf)
    wishRaf = 0
  }
}

function stopBlowTimers() {
  if (holdBlowTimer) {
    clearTimeout(holdBlowTimer)
    holdBlowTimer = null
  }
  if (sequentialTimer) {
    clearTimeout(sequentialTimer)
    sequentialTimer = null
  }
}

function extinguishCandle(idx: number) {
  const c = candles[idx]
  if (!c || !c.lit) return
  c.lit = false
  c.smoke = true
  playBlowOut()
  if (candles.every((item) => !item.lit)) {
    finishBlowPhase()
  }
}

function blowAllSequentially() {
  stopBlowTimers()
  const remaining = candles.map((c, idx) => (c.lit ? idx : -1)).filter((idx) => idx >= 0)
  if (remaining.length === 0) return
  remaining.forEach((cIdx, step) => {
    sequentialTimer = setTimeout(() => {
      extinguishCandle(cIdx)
    }, step * 85)
  })
}

function finishBlowPhase() {
  if (phase.value === 'done') return
  phase.value = 'done'
  isSwipingBlow.value = false
  breezePoints.value = []
  stopBlowTimers()
  breathDetector?.stop()
  breathDetector = null
  mistakes.clear()

  confettiActive = true
  try {
    if (!confettiCanvasEl.value) return
    const fire = stageConfetti = confetti.create(confettiCanvasEl.value, { resize: false, useWorker: false })
    void fire({
      particleCount: 55,
      spread: 68,
      origin: { x: 0.34, y: 0.72 },
      colors: ['#C83E3B', '#F2B84B', '#E86C7E', '#6EA8D8', '#A8C97F'],
    })
    setTimeout(() => {
      if (!confettiActive) return
      void fire({
        particleCount: 45,
        spread: 74,
        origin: { x: 0.62, y: 0.66 },
        colors: ['#F2B84B', '#E84A7F', '#FAF3E8', '#9A82C4'],
      })
    }, 260)
  } catch {
    // headless or restricted canvas fallback
  }
}

async function enterBlowPhase() {
  phase.value = 'blow'
  mistakes.clear('wish')
  if (isMicSupported()) {
    breathDetector = createBreathDetector(() => {
      blowAllSequentially()
    })
    await breathDetector.start()
  }
}

function setupInteraction() {
  detachDrag?.()
  if (!hitEl.value || props.isUnderlay) return

  let wishStartTime = 0
  let wishStartProg = 0

  detachDrag = attachStageDrag(hitEl.value, {
    onStart(pt) {
      if (phase.value === 'wish') {
        isHoldingWish.value = true
        wishDone.value = false
        mistakes.clear('wish')
        gsap.killTweensOf(eyelidProgress)
        wishStartTime = performance.now()
        wishStartProg = eyelidProgress.value

        const step = (now: number) => {
          const elapsed = now - wishStartTime
          const next = clamp(wishStartProg + elapsed / 1500, 0, 1)
          eyelidProgress.value = next
          if (next >= 1) {
            wishRaf = 0
            if (!wishDone.value) {
              wishDone.value = true
              playWindChime()
            }
            return
          }
          wishRaf = requestAnimationFrame(step)
        }
        wishRaf = requestAnimationFrame(step)
        return
      }

      if (phase.value === 'blow') {
        isSwipingBlow.value = true
        mistakes.clear('blow')
        breezePoints.value = [{ x: pt.x, y: pt.y }]
        if (breezeClearTimer) clearTimeout(breezeClearTimer)
        // 保底呼气：长按 850ms 无位移也可依次吹灭全部蜡烛
        stopBlowTimers()
        holdBlowTimer = setTimeout(() => {
          blowAllSequentially()
        }, 850)

        candles.forEach((c, idx) => {
          if (c.lit && Math.hypot(pt.x - c.stageX, pt.y - c.stageY) <= 58) {
            extinguishCandle(idx)
          }
        })
      }
    },

    onMove(pt) {
      if (phase.value !== 'blow') return
      if (pt.dist > 18) {
        if (holdBlowTimer) {
          clearTimeout(holdBlowTimer)
          holdBlowTimer = null
        }
      }

      const nextTrail = [...breezePoints.value, { x: pt.x, y: pt.y }]
      breezePoints.value = nextTrail.slice(-14)
      if (breezeClearTimer) clearTimeout(breezeClearTimer)
      breezeClearTimer = setTimeout(() => {
        breezePoints.value = []
      }, 240)

      candles.forEach((c, idx) => {
        if (!c.lit) return
        const dist = Math.hypot(pt.x - c.stageX, pt.y - c.stageY)
        if (dist <= 62) {
          extinguishCandle(idx)
        } else if (dist <= 130) {
          c.lean = clamp((pt.stepDx || 1) * 2.4, -22, 22)
        } else {
          c.lean = 0
        }
      })
    },

    onEnd() {
      if (phase.value === 'wish') {
        isHoldingWish.value = false
        stopWishAnim()
        if (wishDone.value) {
          gsap.to(eyelidProgress, {
            value: 0,
            duration: 0.58,
            ease: 'power2.out',
            onComplete: () => {
              void enterBlowPhase()
            },
          })
        } else {
          gsap.to(eyelidProgress, {
            value: 0,
            duration: 0.3,
            ease: 'power2.out',
          })
          mistakes.trigger('wish', '按住久一点，闭上眼睛把愿望认真许完哦~')
        }
        return
      }

      if (phase.value === 'blow') {
        isSwipingBlow.value = false
        stopBlowTimers()
        candles.forEach((c) => {
          c.lean = 0
        })
        if (litCount.value > 0 && litCount.value === 5) {
          mistakes.trigger('blow', '用手指在蜡烛火苗上横着划过（或长按一下）就能吹灭哦~')
        }
      }
    },

    onCancel() {
      isHoldingWish.value = false
      isSwipingBlow.value = false
      stopWishAnim()
      stopBlowTimers()
      gsap.to(eyelidProgress, { value: 0, duration: 0.25 })
    },
  })
}

function onGoNext() {
  playTap()
  emit('complete', 'prop-handoff')
}

function play(opts?: { resumed?: boolean }) {
  phase.value = 'wish'
  wishDone.value = false
  eyelidProgress.value = 0
  typewriterDone.value = false
  candles.forEach((c) => {
    c.lit = true
    c.smoke = false
    c.lean = 0
  })
  if (opts?.resumed) {
    // 断点恢复到第 2 幕直接就位可交互
  }
  setupInteraction()
}

async function outro(_nextScene: SceneId): Promise<HandoffProp[]> {
  detachDrag?.()
  stopWishAnim()
  stopBlowTimers()
  breathDetector?.stop()

  const targets = [cakeStageEl.value, titleEl.value, copyEl.value, nextWrapEl.value].filter(Boolean)
  if (targets.length > 0) {
    gsap.to(targets, {
      y: 72,
      opacity: 0,
      duration: 0.45,
      ease: 'power2.in',
    })
  }

  // 一镜到底 2→3：桌角滑入复古 Polaroid OneStep 拍立得相机
  handOverProp({
    id: 'polaroid_camera',
    kind: 'image',
    src: 'assets/art/polaroid_camera.webp',
    x: 1320,
    y: 74,
    width: 344,
    height: 336,
    rotation: 4,
    zIndex: 42,
  })
  playTap()
  await animateProp('polaroid_camera', {
    x: 826,
    y: 74,
    rotation: 0,
    duration: 0.62,
    ease: 'power2.out',
  })

  return []
}

onBeforeUnmount(() => {
  detachDrag?.()
  stopWishAnim()
  stopBlowTimers()
  if (breezeClearTimer) clearTimeout(breezeClearTimer)
  breathDetector?.stop()
  confettiActive = false
  try {
    stageConfetti?.reset()
  } catch {
    // ignore
  }
})

defineExpose({
  play,
  outro,
})
</script>

<style scoped>
.scene-02 {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  overflow: hidden;
}

.collage-title {
  position: absolute;
  left: 392px;
  top: 108px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  z-index: 8;
}

.collage-row {
  display: flex;
  gap: 5px;
}

.cutout-char {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  padding: 2px 7px;
  background: #FFFDF8;
  border: 1px solid rgba(138, 109, 83, 0.25);
  box-shadow: 0 2px 5px rgba(43, 35, 29, 0.16);
  font-family: var(--font-serif-en);
  font-weight: 800;
  font-size: 27px;
  color: #1F1814;
  line-height: 1.05;
}

.cake-stage {
  position: absolute;
  left: 250px;
  top: 196px;
  width: 470px;
  height: 520px;
}

.art-23 {
  position: absolute;
  left: 54px;
  top: 24px;
  width: 326px;
  height: auto;
  z-index: 2;
  filter: drop-shadow(0 6px 12px rgba(43, 35, 29, 0.12));
}

.portrait-cake {
  position: absolute;
  left: 66px;
  top: 96px;
  width: 342px;
  height: auto;
  z-index: 4;
  filter: drop-shadow(0 8px 18px rgba(43, 35, 29, 0.18));
}

.hat-stripes {
  position: absolute;
  left: 85px;
  top: -29px;
  width: 108px;
  height: auto;
  transform: rotate(-9deg);
  z-index: 5;
  filter: drop-shadow(0 4px 10px rgba(43, 35, 29, 0.2));
}

.cake-strawberry {
  position: absolute;
  left: 112px;
  bottom: 4px;
  width: 232px;
  height: auto;
  z-index: 6;
  filter: drop-shadow(0 8px 14px rgba(43, 35, 29, 0.16));
}

.candles-ambient-glow {
  position: absolute;
  left: 112px;
  bottom: 140px;
  width: 234px;
  height: 136px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 206, 98, 0.36) 0%, rgba(255, 206, 98, 0) 72%);
  pointer-events: none;
  z-index: 6;
  transition: opacity 0.35s ease;
}

.candles-svg {
  position: absolute;
  left: 154px;
  bottom: 158px;
  width: 148px;
  height: 76px;
  z-index: 7;
  pointer-events: none;
}

.flame-tilt {
  transition: transform 0.12s ease-out;
}

.flame-flicker {
  transform-box: fill-box;
  transform-origin: center bottom;
  animation: flame-sway 0.9s ease-in-out infinite alternate;
}

.flame-halo {
  animation: halo-pulse 1.3s ease-in-out infinite alternate;
}

.smoke-wisp {
  animation: smoke-rise 1.4s ease-out forwards;
}

@keyframes flame-sway {
  0% { transform: scale(0.95, 1) rotate(-3deg); }
  50% { transform: scale(1.06, 1.07) rotate(2deg); }
  100% { transform: scale(0.97, 0.96) rotate(-1.5deg); }
}

@keyframes halo-pulse {
  0% { opacity: 0.45; }
  100% { opacity: 0.85; }
}

@keyframes smoke-rise {
  0% { opacity: 0.85; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-28px); }
}

.wish-copy {
  position: absolute;
  left: 716px;
  top: 294px;
  width: 470px;
  z-index: 8;
}

.wish-title {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 46px;
  font-weight: 400;
  color: var(--ink);
  letter-spacing: 1px;
}

.blow-hint-sub {
  margin: 16px 0 0;
  display: inline-block;
  padding: 5px 14px;
  border-radius: 999px;
  background: rgba(255, 250, 241, 0.86);
  border: 1px solid rgba(182, 150, 122, 0.45);
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--ink-soft);
}

.typewriter-wrap {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 42px;
  line-height: 1.45;
  color: var(--ink);
}

.wish-hand {
  position: absolute;
  left: 726px;
  top: 432px;
}

.blow-hand {
  position: absolute;
  left: 416px;
  top: 474px;
}

.breeze-trail-svg {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  pointer-events: none;
  z-index: 31;
  filter: drop-shadow(0 0 6px rgba(255, 240, 210, 0.7));
}

.stage-confetti {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  pointer-events: none;
  z-index: 32;
}

.eyelids-svg {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  z-index: 35;
  pointer-events: none;
}

.wish-sky-wrap {
  position: absolute;
  inset: 0;
  z-index: 36;
  pointer-events: none;
}

.wish-stars-svg {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
}

.wish-star {
  animation: star-twinkle 1.6s ease-in-out infinite alternate;
}

@keyframes star-twinkle {
  0% { opacity: 0.35; }
  100% { opacity: 1; }
}

.wish-whisper {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  font-family: var(--font-hand);
  font-size: 38px;
  color: #FCE6B8;
  text-shadow: 0 2px 14px rgba(255, 210, 125, 0.4);
  white-space: nowrap;
}

.whisper-fade-enter-active,
.whisper-fade-leave-active {
  transition: opacity 0.35s ease;
}
.whisper-fade-enter-from,
.whisper-fade-leave-to {
  opacity: 0;
}

.hit-layer {
  position: absolute;
  inset: 0;
  z-index: 38;
  touch-action: none;
}

.next-wrap {
  position: absolute;
  right: 44px;
  bottom: 34px;
  z-index: 39;
}
</style>
