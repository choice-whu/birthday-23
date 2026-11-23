<template>
  <div class="scene-04">
    <PaperBg variant="parchment">
      <Bunting variant="corner" />

      <!-- 顶部阶段提示文案（随关灯自动切换浅色） -->
      <div class="top-prompt" :class="{ 'is-dark': step === 'cheers' && !cheered }">
        <span v-if="step === 'place'">{{ SITE_CONFIG.scene4.placePrompt }}</span>
        <span v-else-if="step === 'light'">{{ SITE_CONFIG.scene4.lightOffPrompt }}</span>
        <span v-else-if="step === 'cheers' && !cheered">{{ SITE_CONFIG.scene4.cheersPrompt }}</span>
      </div>

      <!-- 左下方奶油抹面蛋糕（含手绘彩虹糖霜 HAPPY BIRTHDAY） -->
      <div ref="cakeGroupEl" class="cake-group">
        <img
          :src="assetUrl('assets/art/cake_white.webp')"
          alt="奶油蛋糕"
          class="cake-white-img"
        />

        <!-- 手绘奶油字 HAPPY / BIRTHDAY（还原 frames/frame_020.0.jpg） -->
        <svg class="cake-icing-svg" viewBox="0 0 420 340" aria-hidden="true">
          <g font-family="LongCang, Georgia, serif" font-weight="700" font-size="38">
            <text x="116" y="74" fill="#8C2831" transform="rotate(-12 116 74)">H</text>
            <text x="158" y="84" fill="#638756" transform="rotate(-4 158 84)">A</text>
            <text x="206" y="88" fill="#E6C86E" transform="rotate(3 206 88)">P</text>
            <text x="252" y="84" fill="#8C2831" transform="rotate(8 252 84)">P</text>
            <text x="296" y="72" fill="#2F4D6D" transform="rotate(14 296 72)">Y</text>
          </g>
          <g font-family="LongCang, Georgia, serif" font-weight="700" font-size="42">
            <text x="72" y="168" fill="#7D202A" transform="rotate(4 72 168)">B</text>
            <text x="108" y="218" fill="#2F4D6D" transform="rotate(-5 108 218)">I</text>
            <text x="148" y="182" fill="#E6C86E" transform="rotate(6 148 182)">R</text>
            <text x="188" y="246" fill="#7D202A" transform="rotate(-3 188 246)">T</text>
            <text x="234" y="186" fill="#638756" transform="rotate(3 234 186)">H</text>
            <text x="266" y="248" fill="#2F4D6D" transform="rotate(-6 266 248)">D</text>
            <text x="306" y="188" fill="#E6C86E" transform="rotate(5 306 188)">A</text>
            <text x="342" y="168" fill="#2F4D6D" transform="rotate(-8 342 168)">Y</text>
          </g>
        </svg>

        <!-- 蛋糕顶部插槽提示光圈（拖动头像时显示） -->
        <div v-if="step === 'place'" class="topper-slot" :class="{ active: isDraggingTopper, 'gold-guide': mistakes.glowKey.value === 'place' }">
          <span class="slot-hole" />
        </div>
      </div>

      <!-- 关灯后的深棕暖黄聚光暗场（置于蛋糕下方/上方协调聚光，还原 frames/frame_024.5.jpg） -->
      <div
        v-if="lightProgress > 0.01"
        class="dark-spotlight"
        :style="{ opacity: lightProgress }"
        aria-hidden="true"
      />

      <!-- 戴皇冠/帽+墨镜大头贴立牌（在右侧等待拖入 -> 插到蛋糕顶上） -->
      <div
        ref="topperEl"
        class="topper-wrapper"
        :class="{
          'is-planted': topperPlanted,
          'is-draggable': step === 'place',
        }"
        :style="topperStyle"
      >
        <DressedAvatar
          :hat-id="hatId"
          :glasses-id="glassesId"
          :show-stick="true"
          :sticker-outline="true"
        />
      </div>

      <HandHint v-if="!isUnderlay && step === 'place' && !isDraggingTopper" mode="bob" class="topper-hand" />

      <!-- 第二步：右侧吊顶拉线开关（点击或下拉关灯） -->
      <div
        v-if="step === 'light'"
        ref="cordEl"
        class="pull-cord-wrap"
        @click="onPullLightCord"
      >
        <div class="cord-line" />
        <div class="cord-bead" />
        <HandHint v-if="!isUnderlay" mode="press" class="cord-hand" />
      </div>

      <!-- 第三步：两只起泡啤酒杯 + 碰杯干杯 -->
      <div v-if="step === 'cheers'" ref="cheersStageEl" class="cheers-stage">
        <!-- 等待被碰的右侧酒杯 -->
        <div
          class="mug mug-right"
          :style="{
            left: `${rightMugPos.x}px`,
            top: `${rightMugPos.y}px`,
            transform: `rotate(${rightMugPos.rot}deg)`,
          }"
        >
          <img :src="assetUrl('assets/art/beer_glass.webp')" alt="干杯" class="mug-img" />
        </div>

        <!-- 左侧可按住上推碰撞的酒杯 -->
        <div
          ref="leftMugEl"
          class="mug mug-left"
          :class="{ 'is-draggable': !cheered }"
          :style="{
            left: `${leftMugPos.x}px`,
            top: `${leftMugPos.y}px`,
            transform: `rotate(${leftMugPos.rot}deg)`,
          }"
        >
          <img :src="assetUrl('assets/art/beer_glass.webp')" alt="推杯干杯" class="mug-img" />
        </div>

        <HandHint
          v-if="!isUnderlay && !cheered && !isDraggingMug"
          mode="drag-right"
          class="mug-hand"
        />

        <!-- 碰杯泡沫飞溅与璀璨星光粒子（精确定位于酒杯碰撞口上方，避开立牌人脸与右侧文案） -->
        <svg v-if="cheered" class="clink-sparkles" viewBox="0 0 320 240" aria-hidden="true">
          <!-- 碰杯撞击声波涟漪 -->
          <circle class="clink-ring" cx="104" cy="154" r="24" fill="none" stroke="#FFF2B2" stroke-width="2.6" />
          <circle class="clink-ring delayed" cx="104" cy="154" r="40" fill="none" stroke="rgba(248, 210, 88, 0.72)" stroke-width="1.8" />

          <!-- 金色啤酒泡沫飞溅水滴 -->
          <g class="clink-foam" fill="#FFF7D6" stroke="#D99B38" stroke-width="1.2">
            <path d="M104 140 Q100 112 86 96 Q100 98 112 126 Z" />
            <path d="M120 138 Q138 106 164 102 Q148 114 128 132 Z" />
            <circle cx="82" cy="84" r="4.8" />
            <circle cx="136" cy="76" r="4" />
            <circle cx="174" cy="92" r="5" />
            <circle cx="196" cy="112" r="3.6" />
            <circle cx="156" cy="128" r="4.2" />
          </g>

          <!-- 四角闪亮星芒与暖粉散景光点 -->
          <g class="clink-stars" fill="#F8D258">
            <path d="M158 34 L163 48 L177 53 L163 58 L158 72 L153 58 L139 53 L153 48 Z" />
            <path d="M252 68 L256 79 L267 83 L256 87 L252 98 L248 87 L237 83 L248 79 Z" />
            <path d="M276 154 L280 164 L290 168 L280 172 L276 182 L272 172 L262 168 L272 164 Z" />
            <circle cx="198" cy="54" r="4" />
            <circle cx="222" cy="116" r="3.5" />
            <circle cx="238" cy="186" r="3.2" />
            <circle cx="48" cy="128" r="3.2" />
          </g>

          <g class="clink-stars" fill="#F48AA0" opacity="0.9">
            <circle cx="182" cy="84" r="3.4" />
            <circle cx="228" cy="64" r="3.8" />
            <circle cx="256" cy="136" r="3.4" />
            <circle cx="212" cy="164" r="3.6" />
          </g>
        </svg>

        <!-- 碰杯成功后右侧浮现干杯祝词 -->
        <div v-if="cheered" class="toast-headline">
          <h2 class="toast-en">{{ SITE_CONFIG.scene4.toastHeadline }}</h2>
          <p class="toast-cn">{{ SITE_CONFIG.scene4.toastSub }}</p>
        </div>
      </div>

      <div v-if="!isUnderlay && cheered" ref="nextWrapEl" class="next-wrap">
        <NextButton :label="SITE_CONFIG.scene4.nextLabel" @click="onGoNext" />
      </div>

      <HintBubble :text="mistakes.bubbleText.value" />
    </PaperBg>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import Bunting from '../components/Bunting.vue'
import DressedAvatar from '../components/DressedAvatar.vue'
import HandHint from '../components/HandHint.vue'
import HintBubble from '../components/HintBubble.vue'
import NextButton from '../components/NextButton.vue'
import PaperBg from '../components/PaperBg.vue'
import { useMistakes } from '../components/useMistakes'
import { SITE_CONFIG, type SceneId } from '../config'
import { animateProp, claimProp, handOverProp } from '../director/handoff'
import type { HandoffProp, TransitionMode } from '../director/types'
import { assetUrl } from '../engine/audio'
import { progressState } from '../engine/progress'
import { playClink, playTap } from '../engine/sfx'
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
const cakeGroupEl = ref<HTMLElement | null>(null)
const topperEl = ref<HTMLElement | null>(null)
const cordEl = ref<HTMLElement | null>(null)
const cheersStageEl = ref<HTMLElement | null>(null)
const leftMugEl = ref<HTMLElement | null>(null)
const nextWrapEl = ref<HTMLElement | null>(null)

const hatId = ref<string>(progressState.accessories.hatId || 'crown_gold')
const glassesId = ref<string>(progressState.accessories.glassesId || 'glasses_heart')

const step = ref<'place' | 'light' | 'cheers'>('place')
const topperPlanted = ref(false)
const isDraggingTopper = ref(false)
const lightProgress = ref(0)
const cheered = ref(false)
const isDraggingMug = ref(false)

// 悬浮立牌坐标（由幕 3 飞抵 (858, 224) 或插在蛋糕顶 (334, 154)）
const topperPos = reactive({ x: 858, y: 224, scale: 0.84, rot: 2 })
const leftMugPos = reactive({ x: 326, y: 458, rot: -4 })
const rightMugPos = reactive({ x: 526, y: 394, rot: 10 })

const topperStyle = computed(() => ({
  left: `${topperPos.x}px`,
  top: `${topperPos.y}px`,
  width: '268px',
  height: '268px',
  transform: `rotate(${topperPos.rot}deg) scale(${topperPos.scale})`,
}))

let detachTopperDrag: (() => void) | null = null
let detachMugDrag: (() => void) | null = null

function setupTopperDrag() {
  detachTopperDrag?.()
  if (!topperEl.value || props.isUnderlay) return

  let startX = topperPos.x
  let startY = topperPos.y

  detachTopperDrag = attachStageDrag(topperEl.value, {
    canStart: () => step.value === 'place' && !topperPlanted.value,
    onStart() {
      isDraggingTopper.value = true
      startX = topperPos.x
      startY = topperPos.y
      mistakes.clear('place')
    },
    onMove(pt) {
      topperPos.x = startX + pt.dx
      topperPos.y = startY + pt.dy
    },
    onEnd(pt) {
      isDraggingTopper.value = false
      // 蛋糕顶部中心坐标约在 (446, 368)，头像中心约为 topperPos + 134
      const centerX = topperPos.x + 134
      const centerY = topperPos.y + 134
      const dist = Math.hypot(centerX - 446, centerY - 280)
      if (dist <= 165 || (pt.x >= 220 && pt.x <= 660 && pt.y >= 120 && pt.y <= 470)) {
        topperPlanted.value = true
        playTap()
        detachTopperDrag?.()
        gsap.to(topperPos, {
          x: 312,
          y: 132,
          scale: 0.82,
          rot: -2,
          duration: 0.42,
          ease: 'back.out(1.7)',
          onComplete: () => {
            step.value = 'light'
          },
        })
      } else {
        gsap.to(topperPos, {
          x: 858,
          y: 224,
          duration: 0.48,
          ease: 'elastic.out(1, 0.58)',
        })
        mistakes.trigger('place', '拖着寿星插到左边蛋糕顶上的小洞里哦~')
      }
    },
    onCancel() {
      isDraggingTopper.value = false
      gsap.to(topperPos, { x: 858, y: 224, duration: 0.3 })
    },
  })
}

function onPullLightCord() {
  if (props.isUnderlay || step.value !== 'light') return
  playTap()
  if (cordEl.value) {
    gsap.to(cordEl.value, {
      y: 28,
      duration: 0.14,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        gsap.to(lightProgress, {
          value: 1,
          duration: 0.65,
          ease: 'power2.inOut',
          onComplete: () => {
            step.value = 'cheers'
            void nextTick().then(() => setupMugDrag())
          },
        })
      },
    })
  } else {
    lightProgress.value = 1
    step.value = 'cheers'
    void nextTick().then(() => setupMugDrag())
  }
}

function triggerCheersSuccess() {
  if (cheered.value) return
  cheered.value = true
  isDraggingMug.value = false
  detachMugDrag?.()
  playClink()
  gsap
    .timeline()
    .to(leftMugPos, { x: 382, y: 416, rot: 15, duration: 0.14, ease: 'power2.out' }, 0)
    .to(rightMugPos, { x: 492, y: 398, rot: -16, duration: 0.14, ease: 'power2.out' }, 0)
    .to(leftMugPos, { x: 368, y: 424, rot: 11, duration: 0.28, ease: 'elastic.out(1.2, 0.45)' }, 0.14)
    .to(rightMugPos, { x: 506, y: 404, rot: -13, duration: 0.28, ease: 'elastic.out(1.2, 0.45)' }, 0.14)
}

function setupMugDrag() {
  detachMugDrag?.()
  if (!leftMugEl.value || props.isUnderlay) return

  let startX = leftMugPos.x
  let startY = leftMugPos.y

  detachMugDrag = attachStageDrag(leftMugEl.value, {
    canStart: () => step.value === 'cheers' && !cheered.value,
    onStart() {
      isDraggingMug.value = true
      startX = leftMugPos.x
      startY = leftMugPos.y
      mistakes.clear('cheers')
    },
    onMove(pt) {
      leftMugPos.x = startX + pt.dx
      leftMugPos.y = startY + pt.dy
      leftMugPos.rot = Math.min(14, -4 + pt.dx * 0.13)
      const dist = Math.hypot(leftMugPos.x - rightMugPos.x, leftMugPos.y - rightMugPos.y)
      if (dist < 250) {
        rightMugPos.rot = -Math.min(11, Math.max(0, (250 - dist) * 0.08))
      }
      if (dist <= 165 || pt.dx >= 78) {
        triggerCheersSuccess()
      }
    },
    onEnd() {
      isDraggingMug.value = false
      if (!cheered.value) {
        const dist = Math.hypot(leftMugPos.x - rightMugPos.x, leftMugPos.y - rightMugPos.y)
        if (dist <= 185) {
          triggerCheersSuccess()
        } else {
          gsap.to(leftMugPos, { x: 326, y: 458, rot: -4, duration: 0.48, ease: 'elastic.out(1, 0.58)' })
          gsap.to(rightMugPos, { rot: 0, duration: 0.3 })
          mistakes.trigger('cheers', '把左边酒杯推过去轻轻撞一下右边酒杯吧~')
        }
      }
    },
    onCancel() {
      isDraggingMug.value = false
      gsap.to(leftMugPos, { x: 326, y: 458, rot: -4, duration: 0.3 })
      gsap.to(rightMugPos, { rot: 0, duration: 0.25 })
    },
  })
}

async function intro(handoffProps: HandoffProp[]) {
  const avatar = handoffProps.find((p) => p.id === 'dressed_avatar')
  if (avatar) {
    hatId.value = avatar.meta?.hatId || progressState.accessories.hatId || 'crown_gold'
    glassesId.value = avatar.meta?.glassesId || progressState.accessories.glassesId || 'glasses_heart'
    topperPos.x = 858
    topperPos.y = 224
    topperPos.scale = 0.84
    topperPos.rot = 2
    claimProp('dressed_avatar')
  }
  if (cakeGroupEl.value) {
    gsap.fromTo(
      cakeGroupEl.value,
      { y: 240, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.58, ease: 'power2.out' },
    )
  }
}

function play() {
  hatId.value = progressState.accessories.hatId || hatId.value || 'crown_gold'
  glassesId.value = progressState.accessories.glassesId || glassesId.value || 'glasses_heart'
  setupTopperDrag()
}

function onGoNext() {
  playTap()
  emit('complete', 'prop-handoff')
}

async function outro(_nextScene: SceneId): Promise<HandoffProp[]> {
  detachTopperDrag?.()
  detachMugDrag?.()

  gsap.to(lightProgress, { value: 0, duration: 0.42 })
  const fadeTargets = [cakeGroupEl.value, topperEl.value, cheersStageEl.value, nextWrapEl.value].filter(Boolean)
  if (fadeTargets.length > 0) {
    gsap.to(fadeTargets, { y: 60, opacity: 0, duration: 0.45, ease: 'power2.in' })
  }

  // 一镜到底 4→5：酒杯旁滚出绿色富士 200 胶卷暗盒平移至幕 5 左侧
  handOverProp({
    id: 'film_canister',
    kind: 'image',
    src: 'assets/art/film_canister.webp',
    x: 560,
    y: 440,
    width: 186,
    height: 304,
    rotation: 78,
    zIndex: 42,
  })
  await animateProp('film_canister', {
    x: 126,
    y: 162,
    rotation: 0,
    duration: 0.64,
    ease: 'power2.out',
  })
  return []
}

onMounted(() => {
  if (!props.isUnderlay) {
    setupTopperDrag()
  }
})

onBeforeUnmount(() => {
  detachTopperDrag?.()
  detachMugDrag?.()
})

defineExpose({
  intro,
  play,
  outro,
})
</script>

<style scoped>
.scene-04 {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  overflow: hidden;
}

.top-prompt {
  position: absolute;
  right: 78px;
  top: 48px;
  z-index: 35;
  font-family: var(--font-hand);
  font-size: 40px;
  color: var(--ink);
  transition: color 0.45s ease;
}

.top-prompt.is-dark {
  color: #FAF3E8;
}

.cake-group {
  position: absolute;
  left: 238px;
  bottom: 24px;
  width: 416px;
  height: 332px;
  z-index: 16;
}

.cake-white-img {
  width: 100%;
  height: auto;
  display: block;
  filter: drop-shadow(0 14px 24px rgba(43, 35, 29, 0.2));
}

.cake-icing-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.topper-slot {
  position: absolute;
  left: 50%;
  top: 66px;
  width: 82px;
  height: 26px;
  transform: translateX(-50%);
  border-radius: 50%;
  border: 2px dashed rgba(200, 62, 59, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.topper-slot.active {
  border-color: #E84A7F;
  background: rgba(242, 184, 75, 0.22);
  transform: translateX(-50%) scale(1.12);
}

.slot-hole {
  width: 12px;
  height: 5px;
  border-radius: 50%;
  background: rgba(138, 109, 83, 0.42);
}

/* 深棕色径向聚光灯暗场（中心全透亮，四周柔暗，还原 frames/frame_024.5.jpg） */
.dark-spotlight {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 20;
  background: radial-gradient(
    circle 320px at 442px 346px,
    rgba(255, 244, 224, 0) 0%,
    rgba(255, 244, 224, 0) 42%,
    rgba(56, 44, 36, 0.82) 74%,
    rgba(36, 29, 24, 0.94) 100%
  );
}

.topper-wrapper {
  position: absolute;
  z-index: 15;
  transform-origin: center center;
}

.topper-wrapper.is-planted {
  z-index: 17;
}

.topper-wrapper.is-draggable {
  cursor: grab;
  touch-action: none;
  z-index: 25;
}

.topper-hand {
  position: absolute;
  left: 966px;
  top: 432px;
}

.pull-cord-wrap {
  position: absolute;
  left: 960px;
  top: 0;
  width: 96px;
  height: 256px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  z-index: 30;
}

.cord-line {
  width: 3px;
  height: 196px;
  background: #5C4B3E;
}

.cord-bead {
  width: 24px;
  height: 30px;
  border-radius: 12px;
  background: linear-gradient(180deg, #FFFDF8 0%, #D9C4AA 100%);
  border: 2px solid #5C4B3E;
  box-shadow: 0 5px 12px rgba(43, 35, 29, 0.25);
}

.cord-hand {
  position: absolute;
  left: 34px;
  top: 224px;
}

.cheers-stage {
  position: absolute;
  inset: 0;
  z-index: 28;
}

.mug {
  position: absolute;
  width: 152px;
  height: 188px;
  transform-origin: center bottom;
}

.mug-left.is-draggable {
  cursor: grab;
  touch-action: none;
  z-index: 32;
}

.mug-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 8px 16px rgba(18, 12, 8, 0.45));
}

.mug-hand {
  position: absolute;
  left: 396px;
  top: 562px;
}

.clink-sparkles {
  position: absolute;
  left: 406px;
  top: 248px;
  width: 310px;
  height: 230px;
  pointer-events: none;
  animation: sparkle-pop 0.6s ease-out;
}

.clink-ring {
  transform-box: fill-box;
  transform-origin: center;
  animation: ring-expand 0.9s ease-out forwards;
}

.clink-ring.delayed {
  animation-delay: 0.1s;
}

.clink-foam {
  animation: foam-burst 0.68s cubic-bezier(0.22, 1.25, 0.36, 1) forwards;
}

.clink-stars {
  animation: sparkle-pop 0.55s ease-out both;
}

@keyframes sparkle-pop {
  0% { opacity: 0; transform: scale(0.72); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes ring-expand {
  0% { transform: scale(0.45); opacity: 0.95; }
  100% { transform: scale(1.7); opacity: 0; }
}

@keyframes foam-burst {
  0% { opacity: 0; transform: translateY(16px) scale(0.6); }
  65% { opacity: 1; transform: translateY(-4px) scale(1.06); }
  100% { opacity: 0.95; transform: translateY(0) scale(1); }
}

.toast-headline {
  position: absolute;
  left: 726px;
  top: 196px;
  color: #FAF3E8;
  pointer-events: none;
  animation: headline-in 0.55s ease-out;
}

.toast-en {
  margin: 0;
  font-family: var(--font-serif-en);
  font-size: 54px;
  font-weight: 400;
  letter-spacing: 0.5px;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
}

.toast-cn {
  margin: 18px 0 0 18px;
  font-family: var(--font-hand);
  font-size: 56px;
  color: #FFF7E6;
}

@keyframes headline-in {
  0% { opacity: 0; transform: translateY(14px); }
  100% { opacity: 1; transform: translateY(0); }
}

.next-wrap {
  position: absolute;
  right: 44px;
  bottom: 34px;
  z-index: 39;
}
</style>
