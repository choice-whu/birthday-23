<template>
  <div class="scene-08">
    <PaperBg variant="parchment">
      <Bunting variant="corner" />

      <!-- 左上角标题 -->
      <div class="scene-header">
        <h2 class="title-main">开一张刮刮乐叭。</h2>
      </div>

      <!-- 右侧操作指引（全部刮开前提示） -->
      <div v-if="!allRevealed" class="side-guide">
        <p class="guide-text">用手指反复刮开灰色涂层</p>
      </div>

      <!-- 中央玫红色《intangible lottery ticket!》三联刮刮乐（参考 frames/frame_060.5.jpg & 069.5.jpg） -->
      <div ref="ticketEl" class="lottery-ticket">
        <div class="ticket-inner-frame">
          <div class="ticket-micro-top">WIN WHAT MONEY CAN'T BUY</div>
          <div class="ticket-brand-pill">23</div>

          <h3 class="ticket-display">
            <span>intangible</span>
            <span>lottery ticket!</span>
          </h3>
          <div class="scratch-sticker">SCRATCH FOR SOMETHING REAL</div>

          <div class="ticket-rule-line">
            <span>SCRATCH OFF EVERY SIDE · ALL LUCKY WISHES COME TRUE</span>
          </div>

          <!-- 3 格独立 Canvas 银灰刮刮层 -->
          <div class="scratch-cols">
            <div
              v-for="(card, idx) in cardsState"
              :key="idx"
              class="scratch-cell"
              :class="{ revealed: card.revealed }"
            >
              <!-- 底层中奖网格纸结果 -->
              <div class="prize-underlay">
                <span class="prize-tag">{{ card.label }}</span>
                <p class="prize-result">{{ card.result }}</p>
              </div>

              <!-- 顶层手绘银灰涂层 Canvas -->
              <canvas
                :ref="(el) => setCanvasRef(idx, el)"
                width="212"
                height="608"
                class="scratch-canvas"
                :class="{ faded: card.revealed }"
              />

              <HandHint
                v-if="!isUnderlay && !allRevealed && idx === firstHiddenIdx && !isScratching"
                mode="bob"
                class="cell-hand"
              />
            </div>
          </div>
        </div>

        <!-- 三格全部刮开后啪地盖上的倾斜黑底金字大印章 -->
        <div v-if="allRevealed" ref="stampBannerEl" class="stamp-banner">
          <strong>全部中奖！</strong>
          <span>这一年，你刮开的都是好运</span>
        </div>
      </div>

      <!-- 舞台内专属 Confetti 画布（竖屏旋转 +90deg 时彩纸重力方向仍精准下落） -->
      <canvas ref="confettiCanvasEl" width="1280" height="720" class="stage-confetti" aria-hidden="true" />

      <div v-if="!isUnderlay && allRevealed" ref="nextWrapEl" class="next-wrap">
        <NextButton :label="SITE_CONFIG.scene8.nextLabel" @click="onGoNext" />
      </div>

      <HintBubble :text="mistakes.bubbleText.value" />
    </PaperBg>
  </div>
</template>

<script setup lang="ts">
import confetti from 'canvas-confetti'
import gsap from 'gsap'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import Bunting from '../components/Bunting.vue'
import HandHint from '../components/HandHint.vue'
import HintBubble from '../components/HintBubble.vue'
import NextButton from '../components/NextButton.vue'
import PaperBg from '../components/PaperBg.vue'
import { useMistakes } from '../components/useMistakes'
import { SITE_CONFIG, type SceneId } from '../config'
import { animateProp, claimProp, handOverProp, measureInStage } from '../director/handoff'
import type { HandoffProp, TransitionMode } from '../director/types'
import { playCoinDrop, playScratch, playStamp, playTap, playWindChime } from '../engine/sfx'
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
const ticketEl = ref<HTMLElement | null>(null)
const stampBannerEl = ref<HTMLElement | null>(null)
const nextWrapEl = ref<HTMLElement | null>(null)
const confettiCanvasEl = ref<HTMLCanvasElement | null>(null)
const canvasMap = new Map<number, HTMLCanvasElement>()

const cardsState = reactive(
  SITE_CONFIG.scene8.cards.map((c) => ({
    ...c,
    revealed: false,
    progress: 0,
  })),
)

const isScratching = ref(false)
const allRevealed = computed(() => cardsState.every((c) => c.revealed))
const firstHiddenIdx = computed(() => cardsState.findIndex((c) => !c.revealed))

let cleanups: (() => void)[] = []
let stageConfetti: ReturnType<typeof confetti.create> | null = null
let confettiActive = false
let lastScratchSfxTime = 0

function setCanvasRef(idx: number, el: unknown) {
  if (el instanceof HTMLCanvasElement) {
    canvasMap.set(idx, el)
  } else {
    canvasMap.delete(idx)
  }
}

function paintScratchFoil(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const { width: w, height: h } = canvas
  ctx.globalCompositeOperation = 'source-over'

  // 哑光金属银灰底色 + 斜向微光质感
  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, '#787C84')
  grad.addColorStop(0.5, '#6B6F76')
  grad.addColorStop(1, '#5D6168')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 4
  for (let y = -w; y < h + w; y += 26) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y - 90)
    ctx.stroke()
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
  ctx.textAlign = 'center'
  ctx.font = 'bold 26px sans-serif'
  ctx.fillText('SCRATCH', w / 2, h / 2 - 8)
  ctx.font = '24px "ZCOOL XiaoWei", sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.78)'
  ctx.fillText('刮开看看', w / 2, h / 2 + 28)
}

function measureClearedRatio(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return 0
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  let cleared = 0
  let sampled = 0
  for (let i = 3; i < data.length; i += 32) {
    sampled += 1
    if (data[i] < 128) cleared += 1
  }
  return sampled > 0 ? cleared / sampled : 0
}

function fireWinCelebration() {
  playStamp()
  confettiActive = true
  void nextTick().then(() => {
    if (stampBannerEl.value) {
      gsap.fromTo(
        stampBannerEl.value,
        { scale: 1.75, opacity: 0, rotation: -12 },
        { scale: 1, opacity: 1, rotation: -6, duration: 0.34, ease: 'back.out(2)' },
      )
    }
    try {
      if (!confettiCanvasEl.value) return
      const fire = stageConfetti = confetti.create(confettiCanvasEl.value, { resize: false, useWorker: false })
      void fire({
        particleCount: 52,
        spread: 74,
        origin: { x: 0.5, y: 0.56 },
        colors: ['#EC2F69', '#F2B84B', '#FFFFFF', '#2B231D'],
      })
    } catch {
      // ignore in headless canvas environments
    }
  })
}

function revealCard(idx: number) {
  const card = cardsState[idx]
  if (!card || card.revealed) return
  card.revealed = true
  card.progress = 1
  playWindChime()
  mistakes.clear('scratch')
  if (cardsState.every((c) => c.revealed)) {
    fireWinCelebration()
  }
}

function setupAllCanvases() {
  while (cleanups.length) {
    cleanups.pop()?.()
  }

  cardsState.forEach((card, idx) => {
    const canvas = canvasMap.get(idx)
    if (!canvas) return
    paintScratchFoil(canvas)
    if (props.isUnderlay || card.revealed) return

    let prevLocal: { x: number; y: number } | null = null
    let moveCounter = 0

    const eraseAt = (stageX: number, stageY: number, isStart: boolean) => {
      const box = measureInStage(canvas)
      const lx = ((stageX - box.x) / Math.max(1, box.width)) * canvas.width
      const ly = ((stageY - box.y) / Math.max(1, box.height)) * canvas.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.save()
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = '#000000'
      ctx.strokeStyle = '#000000'
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = 84

      if (isStart || !prevLocal) {
        ctx.beginPath()
        ctx.arc(lx, ly, 42, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.moveTo(prevLocal.x, prevLocal.y)
        ctx.lineTo(lx, ly)
        ctx.stroke()
      }
      ctx.restore()
      prevLocal = { x: lx, y: ly }
    }

    const clean = attachStageDrag(canvas, {
      canStart: () => !card.revealed,
      onStart(pt) {
        isScratching.value = true
        moveCounter = 0
        eraseAt(pt.x, pt.y, true)
        const now = performance.now()
        if (now - lastScratchSfxTime > 95) {
          lastScratchSfxTime = now
          playScratch()
        }
      },
      onMove(pt) {
        if (card.revealed) return
        eraseAt(pt.x, pt.y, false)
        const now = performance.now()
        if (now - lastScratchSfxTime > 95) {
          lastScratchSfxTime = now
          playScratch()
        }
        moveCounter += 1
        if (moveCounter % 5 === 0) {
          const ratio = measureClearedRatio(canvas)
          card.progress = ratio
          if (ratio >= 0.55) {
            revealCard(idx)
          }
        }
      },
      onEnd() {
        isScratching.value = false
        prevLocal = null
        if (card.revealed) return
        const ratio = measureClearedRatio(canvas)
        card.progress = ratio
        if (ratio >= 0.55) {
          revealCard(idx)
        } else {
          mistakes.trigger('scratch', '再用手指多刮几下这格灰色涂层吧~')
        }
      },
      onCancel() {
        isScratching.value = false
        prevLocal = null
      },
    })

    cleanups.push(clean)
  })
}

function onGoNext() {
  playTap()
  emit('complete', 'prop-handoff')
}

async function intro(handoffProps: HandoffProp[]) {
  const stub = handoffProps.find((p) => p.id === 'boarding_stub')
  if (stub) {
    claimProp('boarding_stub')
  }
  if (ticketEl.value) {
    gsap.fromTo(
      ticketEl.value,
      { scale: 0.72, rotationY: -82, opacity: 0 },
      { scale: 1, rotationY: 0, opacity: 1, duration: 0.52, ease: 'back.out(1.4)' },
    )
  }
}

function play() {
  void nextTick().then(() => setupAllCanvases())
}

async function outro(_nextScene: SceneId): Promise<HandoffProp[]> {
  while (cleanups.length) {
    cleanups.pop()?.()
  }

  if (nextWrapEl.value) {
    gsap.to(nextWrapEl.value, { opacity: 0, duration: 0.2 })
  }
  if (ticketEl.value) {
    gsap.to(ticketEl.value, { y: 40, opacity: 0, duration: 0.42, ease: 'power2.in' })
  }

  // 一镜到底 8→9：「全部中奖」印章化作金色 LOVE 硬币投进左侧新登场的粉色老虎机
  handOverProp({
    id: 'love_coin',
    kind: 'html',
    x: 604,
    y: 410,
    width: 72,
    height: 72,
    rotation: -8,
    zIndex: 52,
    html: `<div style="width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 35% 30%, #FFF3B0 0%, #F2B84B 55%, #C48118 100%);border:3px solid #8A580B;box-shadow:0 8px 20px rgba(43,35,29,0.35);display:flex;align-items:center;justify-content:center;font-family:var(--font-serif-en);font-weight:800;font-size:18px;color:#7A4906;letter-spacing:0.6px;">LOVE</div>`,
  })

  playCoinDrop()
  await animateProp('love_coin', {
    x: 290,
    y: 536,
    rotation: 22,
    scale: 0.62,
    opacity: 0,
    duration: 0.62,
    ease: 'power2.in',
  })

  return []
}

onMounted(() => {
  void nextTick().then(() => setupAllCanvases())
})

onBeforeUnmount(() => {
  while (cleanups.length) {
    cleanups.pop()?.()
  }
  confettiActive = false
  try {
    stageConfetti?.reset()
  } catch {
    // ignore
  }
})

defineExpose({
  intro,
  play,
  outro,
})
</script>

<style scoped>
.scene-08 {
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

.side-guide {
  position: absolute;
  left: 882px;
  top: 320px;
  z-index: 20;
}

.guide-text {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 32px;
  color: var(--ink-soft);
}

/* 中央玫红复古彩票卡片 */
.lottery-ticket {
  position: absolute;
  left: 446px;
  top: 44px;
  width: 388px;
  height: 632px;
  background: #E92E65;
  border: 6px solid #1E1714;
  box-shadow: 0 22px 48px rgba(43, 35, 29, 0.28);
  transform: rotate(-1.2deg);
  padding: 12px;
  z-index: 16;
}

.ticket-inner-frame {
  position: relative;
  width: 100%;
  height: 100%;
  border: 2px dashed rgba(255, 255, 255, 0.42);
  padding: 14px 12px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ticket-micro-top {
  font-family: monospace;
  font-size: 11px;
  letter-spacing: 0.8px;
  color: rgba(43, 18, 28, 0.72);
}

.ticket-brand-pill {
  margin-top: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.65);
  font-family: Georgia, serif;
  font-size: 12px;
  font-weight: 700;
  color: #FFFDF8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ticket-display {
  margin: 8px 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--font-sans-cn);
  font-weight: 800;
  font-size: 46px;
  line-height: 0.96;
  letter-spacing: -1.5px;
  color: #FFFFFF;
  text-shadow: 0 3px 0 rgba(120, 14, 48, 0.25);
}

.scratch-sticker {
  margin-top: -56px;
  margin-bottom: 38px;
  padding: 2px 8px;
  background: #231D1A;
  color: #FFFFFF;
  font-family: monospace;
  font-size: 9.5px;
  font-weight: 700;
  transform: rotate(-6deg);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.28);
}

.ticket-rule-line {
  width: 100%;
  margin: 6px 0 12px;
  padding: 4px 0;
  border-top: 1.5px solid rgba(255, 255, 255, 0.52);
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.52);
  text-align: center;
  font-family: monospace;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.88);
}

.scratch-cols {
  width: 100%;
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.scratch-cell {
  position: relative;
  height: 100%;
  border-radius: 3px;
  overflow: hidden;
  background: #FFFDF8;
}

.prize-underlay {
  position: absolute;
  inset: 0;
  padding: 28px 8px 14px;
  background-image:
    linear-gradient(rgba(233, 46, 101, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(233, 46, 101, 0.08) 1px, transparent 1px);
  background-size: 14px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  text-align: center;
}

.prize-tag {
  font-family: var(--font-body);
  font-size: 13px;
  color: #8C6D53;
}

.prize-result {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 23px;
  line-height: 1.3;
  color: #C83E3B;
}

.scratch-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  cursor: crosshair;
  touch-action: none;
  transition: opacity 0.32s ease;
}

.scratch-canvas.faded {
  opacity: 0;
  pointer-events: none;
}

.cell-hand {
  position: absolute;
  left: 24px;
  top: 96px;
}

.stamp-banner {
  position: absolute;
  left: 50%;
  top: 510px;
  width: 306px;
  padding: 14px 18px;
  transform: translate(-50%, -50%) rotate(-6deg);
  background: #231D1A;
  border: 2px solid #F7E9D6;
  box-shadow: 0 12px 26px rgba(18, 12, 8, 0.45);
  color: #FFFDF8;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
  pointer-events: none;
  z-index: 25;
}

.stamp-banner strong {
  font-family: var(--font-sans-cn);
  font-size: 36px;
  font-weight: 800;
  letter-spacing: 2px;
}

.stamp-banner span {
  font-family: var(--font-body);
  font-size: 15px;
  color: #FCE6B8;
}

.stage-confetti {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  pointer-events: none;
  z-index: 32;
}

.next-wrap {
  position: absolute;
  right: 44px;
  bottom: 28px;
  z-index: 35;
}
</style>
