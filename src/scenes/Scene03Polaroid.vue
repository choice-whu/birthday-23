<template>
  <div class="scene-03">
    <PaperBg variant="parchment">
      <Bunting variant="corner" />

      <!-- 左上角手账主标题与阶段提示 -->
      <div class="scene-header">
        <h2 class="title-main">{{ SITE_CONFIG.scene3.title }}</h2>
        <p v-if="currentSubPrompt" class="title-sub">{{ currentSubPrompt }}</p>
      </div>

      <!-- 拍立得相纸：快门吐出 -> 飞至左侧放大显影 -> 换装 & 椭圆剪刀裁切 -->
      <div
        v-if="step !== 'shutter'"
        ref="polaroidEl"
        class="polaroid-card"
        :class="{
          'is-ejected': step === 'ejected',
          'is-expanded': step !== 'ejected',
        }"
        @click="onClickEjected"
      >
        <div ref="photoWinEl" class="photo-window">
          <img
            :src="assetUrl('assets/photos/her_face_square.webp')"
            alt="佳奇圆脸特写"
            class="face-photo"
          />

          <!-- 暗灰化学显影遮罩（不透明渐变显影，不用实时 CSS blur） -->
          <div class="develop-veil" :style="{ opacity: developVeilOpacity }" />

          <!-- 换装磁吸目标光圈提示（拖动对应贴纸时亮起） -->
          <div
            v-if="step === 'dress' || step === 'cut'"
            class="snap-ring head-ring"
            :class="{ active: draggingKind === 'hat' }"
          />
          <div
            v-if="step === 'dress' || step === 'cut'"
            class="snap-ring eye-ring"
            :class="{ active: draggingKind === 'glasses' }"
          />

          <!-- 已佩戴的帽子/头饰与墨镜/腮红 -->
          <img
            v-if="wornHat === 'crown_gold'"
            :src="assetUrl('assets/art/crown_gold.webp')"
            alt="金色皇冠"
            class="worn-hat hat-crown"
          />
          <img
            v-else-if="wornHat === 'hat_pink_dots'"
            :src="assetUrl('assets/art/hat_pink_dots.webp')"
            alt="粉色波点帽"
            class="worn-hat hat-dots"
          />
          <div v-else-if="wornHat" class="worn-hat" :class="`hat-${wornHat}`">
            <AccessoryArt :id="wornHat" />
          </div>

          <img
            v-if="wornGlasses === 'glasses_heart'"
            :src="assetUrl('assets/art/glasses_heart.webp')"
            alt="爱心墨镜"
            class="worn-glasses glasses-heart"
          />
          <div v-else-if="wornGlasses" class="worn-glasses" :class="`glasses-${wornGlasses}`">
            <AccessoryArt :id="wornGlasses" />
          </div>
        </div>

        <div class="polaroid-foot">
          <span v-if="step === 'ejected'">点击查看</span>
          <span v-else-if="step === 'developing'">显影中…</span>
          <span v-else>guaiguai · 23</span>
        </div>

        <!-- 换装完毕后，在相纸上方显现椭圆虚线裁切轨与小剪刀 -->
        <svg
          v-if="step === 'cut' && !cutComplete"
          class="cut-oval-svg"
          viewBox="0 0 380 460"
          aria-hidden="true"
        >
          <ellipse
            cx="190"
            cy="170"
            rx="148"
            ry="160"
            fill="none"
            stroke="rgba(58, 44, 34, 0.52)"
            stroke-width="3.2"
            stroke-dasharray="9 7"
          />
          <!-- 已剪过轨迹高亮 -->
          <path
            v-for="seg in coveredArcs"
            :key="seg.idx"
            :d="seg.d"
            fill="none"
            stroke="#C83E3B"
            stroke-width="4.5"
            stroke-linecap="round"
          />
        </svg>

        <!-- 可沿椭圆拖动的剪刀图标 -->
        <div
          v-if="step === 'cut' && !cutComplete"
          class="scissors-node"
          :style="{
            left: `${scissorLocalPos.x}px`,
            top: `${scissorLocalPos.y}px`,
            transform: `translate(-50%, -50%) rotate(${scissorAngleDeg}deg)`,
          }"
        >
          <svg viewBox="0 0 48 48" class="scissors-svg" aria-hidden="true">
            <circle cx="14" cy="14" r="6" fill="none" stroke="#241D18" stroke-width="3" />
            <circle cx="14" cy="34" r="6" fill="none" stroke="#241D18" stroke-width="3" />
            <line x1="19" y1="17" x2="43" y2="30" stroke="#4D4540" stroke-width="3.6" stroke-linecap="round" />
            <line x1="19" y1="31" x2="43" y2="18" stroke="#2C2623" stroke-width="3.6" stroke-linecap="round" />
            <circle cx="26" cy="24" r="2.2" fill="#C83E3B" />
          </svg>
        </div>
      </div>

      <!-- 剪完之后在原地浮出的换装大头贴（与幕 4 交接无缝衔接） -->
      <div v-if="cutComplete" class="cutout-result">
        <DressedAvatar
          :hat-id="wornHat"
          :glasses-id="wornGlasses"
          :show-stick="false"
          :sticker-outline="true"
        />
      </div>

      <!-- 右侧复古 Polaroid OneStep 相机（剪裁开始后优雅淡出） -->
      <div
        v-show="cameraVisible"
        ref="cameraWrapEl"
        class="camera-wrap"
        :class="{ clickable: step === 'shutter' }"
        @click="onPressShutter"
      >
        <img
          :src="assetUrl('assets/art/polaroid_camera.webp')"
          alt="Polaroid OneStep"
          class="camera-img"
        />
        <div v-if="step === 'shutter'" class="shutter-pulse" />
        <HandHint v-if="!isUnderlay && step === 'shutter'" mode="bob" class="shutter-hand" />
      </div>

      <HandHint v-if="!isUnderlay && step === 'ejected'" mode="bob" class="ejected-hand" />

      <!-- 右侧自由散落的无框 8 件女生专属配饰贴纸（无白框、无文字引导） -->
      <div v-if="cameraVisible && (step === 'dress' || step === 'cut')" class="scattered-accessories">
        <div
          v-for="item in SITE_CONFIG.scene3.stickers"
          :key="item.id"
          class="scatter-sticker"
          :data-sticker-id="item.id"
          :class="{
            equipped: wornHat === item.id || wornGlasses === item.id,
            'gold-guide': mistakes.glowKey.value === 'dress' && ((item.kind === 'hat' && !wornHat) || (item.kind === 'glasses' && !wornGlasses)),
          }"
          :style="{
            left: `${SCATTER_SPOTS[item.id].x}px`,
            top: `${SCATTER_SPOTS[item.id].y}px`,
            width: `${SCATTER_SPOTS[item.id].w}px`,
            transform: `rotate(${SCATTER_SPOTS[item.id].rot}deg)`,
          }"
          @pointerdown="(e) => startStickerDrag(item, e)"
        >
          <img v-if="item.src" :src="assetUrl(item.src)" :alt="item.label" class="scatter-img" />
          <div v-else class="scatter-svg-wrap">
            <AccessoryArt :id="item.id" />
          </div>
          <HandHint v-if="dressHintSticker === item.id" class="dress-hand" mode="bob" />
        </div>
      </div>

      <!-- 拖动中的贴纸跟随浮层 -->
      <div
        v-if="dragGhost"
        class="drag-ghost"
        :style="{ left: `${dragGhost.x}px`, top: `${dragGhost.y}px` }"
      >
        <img v-if="dragGhost.src" :src="assetUrl(dragGhost.src)" alt="" class="ghost-img" />
        <div v-else class="ghost-pixel">
          <AccessoryArt :id="dragGhost.id" />
        </div>
      </div>

      <!-- 剪刀拖拽捕获透明热区（仅剪裁阶段激活，不影响更换贴纸） -->
      <div
        v-if="!isUnderlay && step === 'cut' && !cutComplete"
        ref="cutHitEl"
        class="cut-hit-zone"
      />
      <HandHint
        v-if="!isUnderlay && step === 'cut' && !cutComplete && !isDraggingScissors"
        mode="bob"
        class="cut-hand"
        :style="{ left: `${256 + scissorLocalPos.x - 20}px`, top: `${148 + scissorLocalPos.y - 30}px` }"
      />

      <!-- 闪光灯白闪 -->
      <div class="flash-overlay" :style="{ opacity: flashOpacity }" aria-hidden="true" />

      <HintBubble :text="mistakes.bubbleText.value" />
    </PaperBg>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import AccessoryArt from '../components/AccessoryArt.vue'
import Bunting from '../components/Bunting.vue'
import DressedAvatar from '../components/DressedAvatar.vue'
import HandHint from '../components/HandHint.vue'
import HintBubble from '../components/HintBubble.vue'
import PaperBg from '../components/PaperBg.vue'
import { useMistakes } from '../components/useMistakes'
import { SITE_CONFIG, type SceneId } from '../config'
import { animateProp, claimProp, handOverProp } from '../director/handoff'
import type { HandoffProp, TransitionMode } from '../director/types'
import { assetUrl } from '../engine/audio'
import { getStageCoords } from '../engine/coords'
import { setAccessoriesProgress } from '../engine/progress'
import { playScissors, playShutter, playTap, playWindChime } from '../engine/sfx'
import { stageState } from '../engine/stage'
import { attachStageDrag } from '../engine/useDrag'

type StickerItem = (typeof SITE_CONFIG.scene3.stickers)[number]

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
const polaroidEl = ref<HTMLElement | null>(null)
const photoWinEl = ref<HTMLElement | null>(null)
const cameraWrapEl = ref<HTMLElement | null>(null)
const cutHitEl = ref<HTMLElement | null>(null)

const step = ref<'shutter' | 'ejected' | 'developing' | 'dress' | 'cut'>('shutter')
const cameraVisible = ref(true)
const flashOpacity = ref(0)
const developVeilOpacity = ref(0.92)

const wornHat = ref<string | undefined>(undefined)
const wornGlasses = ref<string | undefined>(undefined)
const bothEquipped = computed(() => Boolean(wornHat.value && wornGlasses.value))

const draggingKind = ref<'hat' | 'glasses' | null>(null)
const dragGhost = ref<{ id: string; kind: 'hat' | 'glasses'; src: string; x: number; y: number } | null>(null)

// 椭圆裁切轨迹参数（对应 polaroid-card 内相对坐标，包裹脸部与皇冠且不压到底部文字）
const OVAL_CX = 163
const OVAL_CY = 140
const OVAL_RX = 148
const OVAL_RY = 160
const SEGMENTS = 24
const coveredBuckets = reactive(new Set<number>())
const scissorTheta = ref(0.15)
const isDraggingScissors = ref(false)
const cutComplete = ref(false)

// polaroid 居中偏移（svg viewBox 380x460 居于 326x398 上方，left: -27px, top: -30px）
const scissorLocalPos = computed(() => ({
  x: OVAL_CX + OVAL_RX * Math.cos(scissorTheta.value),
  y: OVAL_CY + OVAL_RY * Math.sin(scissorTheta.value),
}))
const scissorAngleDeg = computed(() => (scissorTheta.value * 180) / Math.PI + 90)

const coveredArcs = computed(() => {
  const list: { idx: number; d: string }[] = []
  const stepAngle = (Math.PI * 2) / SEGMENTS
  for (const idx of coveredBuckets) {
    const a0 = idx * stepAngle - Math.PI
    const a1 = a0 + stepAngle + 0.04
    const x0 = 190 + OVAL_RX * Math.cos(a0)
    const y0 = 170 + OVAL_RY * Math.sin(a0)
    const x1 = 190 + OVAL_RX * Math.cos(a1)
    const y1 = 170 + OVAL_RY * Math.sin(a1)
    list.push({ idx, d: `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${OVAL_RX} ${OVAL_RY} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}` })
  }
  return list
})

// 8 件配饰散落在右侧手账羊皮纸上的自由坐标（无底框、避开右上相机）
const SCATTER_SPOTS: Record<string, { x: number; y: number; w: number; rot: number }> = {
  crown_gold: { x: 656, y: 242, w: 102, rot: -10 },
  flower_wreath: { x: 646, y: 374, w: 124, rot: 7 },
  hat_pink_dots: { x: 782, y: 408, w: 92, rot: -8 },
  bow_red: { x: 916, y: 436, w: 112, rot: 10 },
  glasses_heart: { x: 1054, y: 434, w: 114, rot: -6 },
  pixel_sunglasses: { x: 658, y: 540, w: 112, rot: 5 },
  glasses_round: { x: 828, y: 564, w: 112, rot: -8 },
  blush_stars: { x: 994, y: 552, w: 124, rot: 6 },
}

const dressHintSticker = computed(() => {
  if (props.isUnderlay || step.value !== 'dress' || draggingKind.value) return
  if (!wornHat.value) return 'hat_pink_dots'
  if (!wornGlasses.value) return 'glasses_heart'
})

const currentSubPrompt = computed(() => {
  if (step.value === 'ejected') return SITE_CONFIG.scene3.developHint
  if (step.value === 'developing') return '相纸正在慢慢显影…'
  if (step.value === 'dress') return SITE_CONFIG.scene3.dressPrompt
  return step.value === 'cut' ? SITE_CONFIG.scene3.cutPrompt : ''
})

let detachCutDrag: (() => void) | null = null
let activeStickerClean: (() => void) | null = null
let lastScissorSfxBucket = -1

function onPressShutter() {
  if (props.isUnderlay || step.value !== 'shutter') return
  playShutter()
  flashOpacity.value = 0.92
  gsap.to(flashOpacity, { value: 0, duration: 0.3, ease: 'power2.out' })
  step.value = 'ejected'
  developVeilOpacity.value = 0.94
}

function onClickEjected() {
  if (props.isUnderlay || step.value !== 'ejected') return
  playTap()
  step.value = 'developing'
  gsap.to(developVeilOpacity, {
    value: 0,
    duration: 1.15,
    ease: 'power2.out',
    onComplete: () => {
      step.value = 'dress'
    },
  })
}

function startStickerDrag(item: StickerItem, downEvent: PointerEvent) {
  if (props.isUnderlay || (step.value !== 'dress' && step.value !== 'cut') || cutComplete.value) return
  downEvent.stopPropagation()
  activeStickerClean?.()

  const startPt = getStageCoords(downEvent.clientX, downEvent.clientY, stageState.stageEl)
  draggingKind.value = item.kind
  dragGhost.value = {
    id: item.id,
    kind: item.kind,
    src: item.src,
    x: startPt.x,
    y: startPt.y,
  }
  mistakes.clear('dress')

  const onMove = (e: PointerEvent) => {
    const pt = getStageCoords(e.clientX, e.clientY, stageState.stageEl)
    if (dragGhost.value) {
      dragGhost.value.x = pt.x
      dragGhost.value.y = pt.y
    }
  }

  const cleanup = () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onCancel)
    draggingKind.value = null
    dragGhost.value = null
    activeStickerClean = null
  }

  const onUp = (e: PointerEvent) => {
    const pt = getStageCoords(e.clientX, e.clientY, stageState.stageEl)
    const distMoved = Math.hypot(pt.x - startPt.x, pt.y - startPt.y)

    // 头顶区约 (424, 178)，眼睛区约 (442, 336)
    const target = item.kind === 'hat' ? { x: 424, y: 185 } : { x: 440, y: 332 }
    const distToTarget = Math.hypot(pt.x - target.x, pt.y - target.y)
    // 也允许落在整个拍立得区域上半部/下半部磁吸
    const insidePolaroid = pt.x >= 240 && pt.x <= 595 && pt.y >= 110 && pt.y <= 490

    if (distMoved < 12) {
      mistakes.trigger('dress', '按住贴纸拖到左边寿星头上或眼睛上就能戴上啦~')
    } else if (distToTarget <= 145 || insidePolaroid) {
      playTap()
      if (item.kind === 'hat') {
        wornHat.value = item.id
      } else {
        wornGlasses.value = item.id
      }
      setAccessoriesProgress({ hatId: wornHat.value, glassesId: wornGlasses.value })

      if (wornHat.value && wornGlasses.value && step.value === 'dress') {
        step.value = 'cut'
        void nextTick().then(() => setupCutInteraction())
      } else if (!wornHat.value || !wornGlasses.value) {
        mistakes.clear('dress')
      }
    } else {
      mistakes.trigger('dress', '拖到左边照片里她的头顶或眼睛上试试~')
    }
    cleanup()
  }

  const onCancel = () => cleanup()

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onCancel)
  activeStickerClean = cleanup
}

function finishScissorsCut() {
  if (cutComplete.value) return
  cutComplete.value = true
  isDraggingScissors.value = false
  detachCutDrag?.()
  playScissors()
  playWindChime()
  setAccessoriesProgress({ hatId: wornHat.value, glassesId: wornGlasses.value })
  setTimeout(() => {
    emit('complete', 'prop-handoff')
  }, 420)
}

function setupCutInteraction() {
  detachCutDrag?.()
  if (!cutHitEl.value || props.isUnderlay) return

  // 椭圆中心对应舞台坐标 (256 + 163, 148 + 162) = (419, 310)
  const STAGE_CX = 256 + OVAL_CX
  const STAGE_CY = 148 + OVAL_CY
  let cuttingActive = false

  detachCutDrag = attachStageDrag(cutHitEl.value, {
    onStart(pt) {
      const dist = Math.hypot(pt.x - STAGE_CX, pt.y - STAGE_CY)
      if (dist > 250) {
        cuttingActive = false
        return
      }
      cuttingActive = true
      isDraggingScissors.value = true
      updateCutAngle(pt.x, pt.y)
    },
    onMove(pt) {
      if (!cuttingActive || cutComplete.value) return
      updateCutAngle(pt.x, pt.y)
    },
    onEnd() {
      cuttingActive = false
      isDraggingScissors.value = false
      if (!cutComplete.value && coveredBuckets.size > 0 && coveredBuckets.size < 21) {
        mistakes.trigger('cut', '沿着椭圆虚线再剪完整一圈就下来啦~')
      }
    },
    onCancel() {
      cuttingActive = false
      isDraggingScissors.value = false
    },
  })

  function updateCutAngle(sx: number, sy: number) {
    const theta = Math.atan2((sy - STAGE_CY) / OVAL_RY, (sx - STAGE_CX) / OVAL_RX)
    scissorTheta.value = theta
    const bucket = Math.floor(((theta + Math.PI) / (Math.PI * 2)) * SEGMENTS) % SEGMENTS
    const prevCount = coveredBuckets.size
    coveredBuckets.add(bucket)
    // 允许相邻桶平滑补全，避免快速滑动跳格
    if (prevCount > 0) {
      const prevBucket = (bucket - 1 + SEGMENTS) % SEGMENTS
      const nextBucket = (bucket + 1) % SEGMENTS
      if (coveredBuckets.has(prevBucket) || coveredBuckets.has(nextBucket)) {
        coveredBuckets.add(bucket)
      }
    }
    if (coveredBuckets.size >= 3 && cameraVisible.value) {
      cameraVisible.value = false
    }
    if (coveredBuckets.size > prevCount && coveredBuckets.size % 2 === 0 && bucket !== lastScissorSfxBucket) {
      lastScissorSfxBucket = bucket
      playScissors()
    }
    if (coveredBuckets.size >= 21) {
      finishScissorsCut()
    }
  }
}

async function intro(handoffProps: HandoffProp[]) {
  const cam = handoffProps.find((p) => p.id === 'polaroid_camera')
  if (cam) {
    claimProp('polaroid_camera')
  }
  cameraVisible.value = true
}

function play() {
  cameraVisible.value = true
}

async function outro(_nextScene: SceneId): Promise<HandoffProp[]> {
  detachCutDrag?.()
  activeStickerClean?.()

  if (polaroidEl.value) {
    gsap.to(polaroidEl.value, {
      y: 520,
      rotation: 16,
      opacity: 0,
      duration: 0.48,
      ease: 'power2.in',
    })
  }

  // 原地交接：把剪出的带帽墨镜大头贴接进 PropLayer，直接停飞到幕 4 右上方悬停位置
  handOverProp({
    id: 'dressed_avatar',
    kind: 'dressed-avatar',
    x: 274,
    y: 166,
    width: 290,
    height: 290,
    rotation: -2,
    zIndex: 44,
    meta: {
      hatId: wornHat.value,
      glassesId: wornGlasses.value,
      showStick: true,
    },
  })

  await animateProp('dressed_avatar', {
    x: 858,
    y: 224,
    width: 268,
    height: 268,
    rotation: 2,
    scale: 0.84,
    duration: 0.65,
    ease: 'power2.inOut',
  })

  return []
}

onMounted(() => {
  if (!props.isUnderlay && step.value === 'cut') {
    setupCutInteraction()
  }
})

onBeforeUnmount(() => {
  detachCutDrag?.()
  activeStickerClean?.()
})

defineExpose({
  intro,
  play,
  outro,
})
</script>

<style scoped>
.scene-03 {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  overflow: hidden;
}

.scene-header {
  position: absolute;
  left: 72px;
  top: 46px;
  z-index: 10;
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
  font-size: 21px;
  color: var(--ink-soft);
}

.camera-wrap {
  position: absolute;
  left: 826px;
  top: 74px;
  width: 344px;
  height: 336px;
  z-index: 15;
}

.camera-wrap.clickable {
  cursor: pointer;
}

.camera-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 12px 24px rgba(43, 35, 29, 0.2));
}

.shutter-pulse {
  position: absolute;
  left: 60px;
  top: 186px;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 3px solid rgba(200, 62, 59, 0.85);
  animation: shutter-ring 1.3s ease-out infinite;
  pointer-events: none;
}

@keyframes shutter-ring {
  0% { transform: scale(0.8); opacity: 0.95; }
  100% { transform: scale(1.65); opacity: 0; }
}

.shutter-hand {
  position: absolute;
  left: 68px;
  top: 220px;
}

.polaroid-card {
  position: absolute;
  background: #FFFDF9;
  border-radius: 4px;
  box-shadow: 0 14px 32px rgba(43, 35, 29, 0.24);
  border: 1px solid rgba(182, 150, 122, 0.35);
  transition: left 0.62s cubic-bezier(0.22, 1.12, 0.36, 1),
    top 0.62s cubic-bezier(0.22, 1.12, 0.36, 1),
    width 0.62s cubic-bezier(0.22, 1.12, 0.36, 1),
    height 0.62s cubic-bezier(0.22, 1.12, 0.36, 1),
    transform 0.62s cubic-bezier(0.22, 1.12, 0.36, 1);
  z-index: 14;
}

.polaroid-card.is-ejected {
  left: 888px;
  top: 392px;
  width: 214px;
  height: 262px;
  padding: 12px 12px 44px;
  transform: rotate(2deg);
  cursor: pointer;
}

.polaroid-card.is-expanded {
  left: 256px;
  top: 148px;
  width: 326px;
  height: 398px;
  padding: 18px 18px 72px;
  transform: rotate(-2deg);
}

.photo-window {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #E8E1D6;
  overflow: visible;
}

.face-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.develop-veil {
  position: absolute;
  inset: 0;
  background: #2C2723;
  pointer-events: none;
  z-index: 3;
}

.snap-ring {
  position: absolute;
  left: 52%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2.5px dashed rgba(242, 184, 75, 0);
  pointer-events: none;
  transition: border-color 0.2s ease, background 0.2s ease;
  z-index: 4;
}

.head-ring {
  top: 2%;
  width: 62%;
  height: 38%;
}

.eye-ring {
  left: 60%;
  top: 59%;
  width: 62%;
  height: 26%;
}

.snap-ring.active {
  border-color: rgba(242, 184, 75, 0.95);
  background: rgba(242, 184, 75, 0.16);
}

.worn-hat {
  position: absolute;
  left: 52%;
  height: auto;
  z-index: 6;
  pointer-events: none;
}

.hat-crown {
  top: -12%;
  width: 58%;
  transform: translateX(-50%) rotate(-3deg);
}

.hat-dots {
  top: -34%;
  width: 48%;
  transform: translateX(-50%) rotate(-4deg);
}

.hat-bow_red {
  top: -15%;
  width: 58%;
  transform: translateX(-50%) rotate(-4deg);
}

.hat-flower_wreath {
  top: -7%;
  width: 68%;
  transform: translateX(-50%) rotate(-2deg);
}

.worn-glasses {
  position: absolute;
  left: 60%;
  top: 59%;
  transform: translate(-50%, -50%);
  z-index: 7;
  pointer-events: none;
}

.glasses-heart {
  width: 56%;
  height: auto;
}

.glasses-pixel_sunglasses {
  width: 55%;
}

.glasses-glasses_round {
  width: 56%;
}

.glasses-blush_stars {
  left: 59%;
  top: 66%;
  width: 64%;
}

.polaroid-foot {
  margin-top: 14px;
  text-align: center;
  font-family: var(--font-hand);
  font-size: 25px;
  color: var(--ink-soft);
}

.ejected-hand {
  position: absolute;
  left: 980px;
  top: 530px;
}

/* 自由散落于右页手账上的无框配饰贴纸 */
.scattered-accessories {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 20;
}

.scatter-sticker {
  position: absolute;
  pointer-events: auto;
  cursor: grab;
  user-select: none;
  touch-action: none;
  filter: drop-shadow(0 5px 10px rgba(43, 35, 29, 0.2));
  transition: transform 0.16s ease, filter 0.2s ease, opacity 0.2s ease;
}

.scatter-sticker:hover {
  filter: drop-shadow(0 8px 16px rgba(43, 35, 29, 0.3));
}

.scatter-sticker.equipped {
  filter: drop-shadow(0 0 12px rgba(200, 62, 59, 0.52)) drop-shadow(0 5px 10px rgba(43, 35, 29, 0.2));
  opacity: 0.96;
}

.scatter-sticker.gold-guide {
  filter: drop-shadow(0 0 14px rgba(242, 184, 75, 0.85));
}

.scatter-img {
  width: 100%;
  height: auto;
  display: block;
  pointer-events: none;
}

.scatter-svg-wrap {
  width: 100%;
  pointer-events: none;
}

.dress-hand {
  position: absolute;
  left: 56%;
  top: 61%;
  width: 42px;
  height: 46px;
}

@media (prefers-reduced-motion: reduce) {
  .dress-hand {
    animation: none;
  }
}

.drag-ghost {
  position: absolute;
  width: 130px;
  height: 92px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 55;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ghost-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 6px 12px rgba(43, 35, 29, 0.28));
}

.ghost-pixel {
  width: 118px;
}

.cut-oval-svg {
  position: absolute;
  left: -27px;
  top: -30px;
  width: 380px;
  height: 460px;
  pointer-events: none;
  z-index: 25;
}

.scissors-node {
  position: absolute;
  width: 48px;
  height: 48px;
  pointer-events: none;
  z-index: 26;
}

.scissors-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 3px 6px rgba(43, 35, 29, 0.25));
}

.cut-hit-zone {
  position: absolute;
  left: 160px;
  top: 70px;
  width: 520px;
  height: 540px;
  z-index: 28;
  touch-action: none;
  cursor: grab;
}

.cut-hand {
  position: absolute;
  z-index: 29;
}

.cutout-result {
  position: absolute;
  left: 274px;
  top: 166px;
  width: 290px;
  height: 290px;
  transform: rotate(-2deg);
  z-index: 22;
}

.flash-overlay {
  position: absolute;
  inset: 0;
  background: #FFFFFF;
  pointer-events: none;
  z-index: 75;
}
</style>
