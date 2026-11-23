<template>
  <div class="scene-09">
    <PaperBg variant="parchment">
      <Bunting variant="corner" />

      <!-- 左上角标题 -->
      <div class="scene-header">
        <h2 class="title-main">{{ SITE_CONFIG.scene9.title }}</h2>
      </div>

      <!-- 左侧粉色 LOVE JACKPOT 老虎机 + 右侧机械红球摇杆 -->
      <div
        ref="machineStageEl"
        class="slot-machine-stage"
        :class="{ 'gentle-shake': mistakes.shakingKey.value === 'lever' }"
      >
        <!-- 老虎机柜体手绘插画（606/422 等比 344x494） -->
        <img
          :src="assetUrl('assets/art/slot_machine.webp')"
          alt="LOVE JACKPOT 老虎机"
          class="slot-body-img"
        />

        <!-- 精准嵌入白色凹槽框内的 3 列滚动滚轮（♥♥♥，未中时可作弊拨成 ♥） -->
        <div class="reels-window" :class="{ 'has-cheat': cheatReelIdx !== null }">
          <div
            v-for="(reelY, rIdx) in reelOffsets"
            :key="rIdx"
            class="reel-col"
            :class="{ 'is-cheatable': cheatReelIdx === rIdx }"
            @pointerdown="(e) => onReelPointerDown(rIdx, e)"
          >
            <div class="reel-strip" :style="{ transform: `translateY(${reelY}px)` }">
              <div v-for="(sym, sIdx) in REEL_STRIP" :key="sIdx" class="reel-cell">
                <svg viewBox="0 0 44 44" class="reel-icon">
                  <path
                    v-if="sym === 'heart'"
                    d="M22 36 C12 28, 6 22, 6 15 C6 10, 10 7, 14.5 7 C17.8 7, 20.4 9, 22 11.8 C23.6 9, 26.2 7, 29.5 7 C34 7, 38 10, 38 15 C38 22, 32 28, 22 36 Z"
                    fill="#D92E42"
                    stroke="#8F1625"
                    stroke-width="1.6"
                  />
                  <polygon
                    v-else-if="sym === 'star'"
                    points="22,6 26.6,15.6 37,17.2 29.4,24.6 31.2,35 22,30.1 12.8,35 14.6,24.6 7,17.2 17.4,15.6"
                    fill="#F2B84B"
                    stroke="#A67418"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                  />
                  <polygon
                    v-else-if="sym === 'diamond'"
                    points="22,6 35,22 22,38 9,22"
                    fill="#8CC3E8"
                    stroke="#3C769C"
                    stroke-width="1.6"
                    stroke-linejoin="round"
                  />
                  <g v-else>
                    <circle cx="17" cy="18" r="6.5" fill="#4BA868" />
                    <circle cx="27" cy="18" r="6.5" fill="#4BA868" />
                    <circle cx="22" cy="12" r="6.5" fill="#4BA868" />
                    <path d="M22 20 L22 35" stroke="#2D7344" stroke-width="3" stroke-linecap="round" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
          <HandHint
            v-if="!isUnderlay && cheatReelIdx !== null"
            mode="bob"
            class="cheat-hand"
            :style="{ left: `${cheatReelIdx * 33 + 10}%` }"
          />
        </div>

        <div v-if="cheatToast" class="cheat-banner">{{ cheatToast }}</div>

        <!-- 机柜右侧交互式红球拉杆 -->
        <div
          ref="leverEl"
          class="slot-lever-zone"
          :class="{ disabled: isSpinning || wonCount >= 3 }"
        >
          <div class="lever-socket" />
          <div class="lever-arm-wrap" :style="leverArmStyle">
            <div class="lever-rod" />
            <div class="lever-ball" />
          </div>
          <HandHint
            v-if="!isUnderlay && wonCount < 3 && cheatReelIdx === null && !isSpinning && !isDraggingLever"
            mode="drag-down"
            class="lever-hand"
          />
        </div>
      </div>

      <!-- 底部中心拉杆 / 作弊操作引导（提示气泡展开时暂隐以免重叠） -->
      <p v-if="wonCount < 3 && !mistakes.bubbleText.value" class="lever-hint">
        {{
          cheatReelIdx !== null
            ? '差一点点？偷偷拨动发光滚轮把它改成 ♥ 作弊中奖吧 🤫'
            : `${SITE_CONFIG.scene9.leverHint}（已收获 ${wonCount} / 3 张券）`
        }}
      </p>

      <!-- 右侧吐出的 3 张 choice 签发专属兑换券（参考 frames/frame_080.5.jpg） -->
      <div class="coupons-stage">
        <div
          v-for="(coupon, cIdx) in visibleCoupons"
          :key="coupon.id"
          class="coupon-ticket"
          :class="`theme-${coupon.theme}`"
          :style="{ transform: `rotate(${couponTilts[cIdx]}deg)` }"
        >
          <div class="coupon-main">
            <span class="coupon-brand">LOVE JACKPOT · NO.0{{ coupon.id }}</span>
            <h3 class="coupon-title">{{ coupon.title }}</h3>
            <p class="coupon-desc">{{ coupon.desc }}</p>
            <span class="coupon-meta">{{ coupon.meta }}</span>
          </div>
          <div class="coupon-stub">
            <span>{{ SITE_CONFIG.profile.myName }}</span>
            <span>VIP</span>
          </div>
        </div>
      </div>

      <!-- 右上角「已到账 · choice 签发」红色双圆盖章与底部文案 -->
      <div v-if="wonCount >= 3 && !isSpinning" ref="stampEl" class="issued-stamp">
        <div class="stamp-inner">
          <strong>已到账</strong>
          <span>{{ SITE_CONFIG.profile.myName }} 签发</span>
        </div>
      </div>

      <p v-if="wonCount >= 3 && !isSpinning" class="issued-caption">
        券已到账，随时找我兑换。
      </p>

      <div v-if="!isUnderlay && wonCount >= 3 && !isSpinning" ref="nextWrapEl" class="next-wrap">
        <NextButton :label="SITE_CONFIG.scene9.nextLabel" @click="onGoNext" />
      </div>

      <HintBubble :text="mistakes.bubbleText.value" />
    </PaperBg>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
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
import { clamp } from '../engine/coords'
import { playCoinDrop, playGentleShake, playSlotSpin, playSlotWin, playStamp, playTap } from '../engine/sfx'
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

// 每格高度 102px（严格匹配白色凹槽内高 ~104px），index 0 和 index 8 均为空降定格的红心 ♥
const CELL_H = 102
const REEL_STRIP = ['heart', 'star', 'diamond', 'clover', 'star', 'diamond', 'clover', 'star', 'heart'] as const
const couponTilts = [-1.8, 1.3, -1.1]

const mistakes = useMistakes()
const machineStageEl = ref<HTMLElement | null>(null)
const leverEl = ref<HTMLElement | null>(null)
const stampEl = ref<HTMLElement | null>(null)
const nextWrapEl = ref<HTMLElement | null>(null)

const reelOffsets = reactive([0, 0, 0])
const leverPull = ref(0) // 0..1
const isDraggingLever = ref(false)
const isSpinning = ref(false)
const wonCount = ref(0)
const cheatReelIdx = ref<number | null>(null)
const cheatToast = ref('')
let cheatBannerTimer: number | null = null

const visibleCoupons = computed(() =>
  SITE_CONFIG.scene9.coupons.slice(0, wonCount.value),
)

const leverArmStyle = computed(() => {
  const p = clamp(leverPull.value, 0, 1)
  return {
    transform: `scaleY(${(1 - p * 0.72).toFixed(3)}) translateY(${(p * 34).toFixed(1)}px)`,
  }
})

let detachLeverDrag: (() => void) | null = null
let reelSwipeClean: (() => void) | null = null

function awardCoupon(fromCheat = false) {
  playSlotWin()
  wonCount.value += 1
  if (fromCheat) {
    if (cheatBannerTimer !== null) window.clearTimeout(cheatBannerTimer)
    cheatToast.value =
      wonCount.value === 2 ? '作弊成功！强行凑齐 ♥♥♥ ✨' : '偏心判你全中！♥♥♥ ✨'
    cheatBannerTimer = window.setTimeout(() => {
      cheatToast.value = ''
    }, 2200)
  }
  if (wonCount.value >= 3) {
    setTimeout(() => playStamp(), 180)
  }
}

function cheatReelToHeart(rIdx: number) {
  if (props.isUnderlay || isSpinning.value || cheatReelIdx.value !== rIdx) return
  cheatReelIdx.value = null
  mistakes.clear('lever')
  playTap()
  gsap.to(reelOffsets, {
    [rIdx]: -8 * CELL_H,
    duration: 0.36,
    ease: 'back.out(1.7)',
    onComplete: () => {
      awardCoupon(true)
    },
  })
}

function onReelPointerDown(rIdx: number, downEv: PointerEvent) {
  if (props.isUnderlay || isSpinning.value || cheatReelIdx.value !== rIdx) return
  downEv.stopPropagation()
  reelSwipeClean?.()

  const startY = downEv.clientY
  const baseOffset = reelOffsets[rIdx]
  let cheated = false

  const cleanup = () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
    reelSwipeClean = null
  }

  const onMove = (e: PointerEvent) => {
    const dy = e.clientY - startY
    reelOffsets[rIdx] = baseOffset + clamp(dy * 0.7, -96, 20)
    if (!cheated && Math.abs(dy) >= 14) {
      cheated = true
      cleanup()
      cheatReelToHeart(rIdx)
    }
  }

  const onUp = () => {
    cleanup()
    if (!cheated) {
      cheatReelToHeart(rIdx)
    }
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
  reelSwipeClean = cleanup
}

function triggerSpinPull() {
  if (props.isUnderlay || isSpinning.value || wonCount.value >= 3) return
  const wasWaitingCheat = cheatReelIdx.value !== null
  cheatReelIdx.value = null
  isSpinning.value = true
  isDraggingLever.value = false
  mistakes.clear('lever')
  playSlotSpin()

  // 拉杆弹簧回弹
  gsap.to(leverPull, { value: 0, duration: 0.48, ease: 'elastic.out(1.2, 0.45)' })

  // 3 根滚轮先各自归 0
  reelOffsets[0] = 0
  reelOffsets[1] = 0
  reelOffsets[2] = 0

  // 第 1 张必中；第 2 张差右侧一格、第 3 张差中间一格，允许点/拨发光滚轮“作弊”改成 ♥
  let stopCells: [number, number, number] = [8, 8, 8]
  let missReel: number | null = null
  if (!wasWaitingCheat) {
    if (wonCount.value === 1) {
      stopCells = [8, 8, 7]
      missReel = 2
    } else if (wonCount.value === 2) {
      stopCells = [8, 5, 8]
      missReel = 1
    }
  }

  const durations = [0.68, 0.88, 1.08]
  let finished = 0

  durations.forEach((dur, idx) => {
    gsap.to(reelOffsets, {
      [idx]: -stopCells[idx] * CELL_H,
      duration: dur,
      ease: 'back.out(1.1)',
      onComplete: () => {
        finished += 1
        if (finished === 3) {
          isSpinning.value = false
          if (missReel === null) {
            awardCoupon(false)
          } else {
            playGentleShake()
            cheatReelIdx.value = missReel
            mistakes.trigger(
              'lever',
              missReel === 2
                ? '差一格就 ♥♥♥ 啦！偷偷戳一下右边发光的滚轮作弊改成 ♥ 吧 🤫'
                : '又只差中间一格？偷偷拨一下中间发光的滚轮改成 ♥，今天你说了算 🤫',
            )
          }
        }
      },
    })
  })
}

function setupLeverInteraction() {
  detachLeverDrag?.()
  if (!leverEl.value || props.isUnderlay) return

  detachLeverDrag = attachStageDrag(leverEl.value, {
    canStart: () => !isSpinning.value && wonCount.value < 3,
    onStart() {
      isDraggingLever.value = true
      gsap.killTweensOf(leverPull)
      mistakes.clear('lever')
    },
    onMove(pt) {
      const ratio = clamp(pt.dy / 96, 0, 1)
      leverPull.value = ratio
      if (ratio >= 0.72) {
        triggerSpinPull()
      }
    },
    onEnd(pt) {
      isDraggingLever.value = false
      if (isSpinning.value || wonCount.value >= 3) return
      if (pt.dist < 14 || leverPull.value >= 0.55) {
        triggerSpinPull()
      } else {
        gsap.to(leverPull, { value: 0, duration: 0.35, ease: 'elastic.out(1, 0.55)' })
        mistakes.trigger('lever', '按住红色摇杆球往下拉到底，或轻点红球就可以啦~')
      }
    },
    onCancel() {
      isDraggingLever.value = false
      gsap.to(leverPull, { value: 0, duration: 0.25 })
    },
  })
}

function onGoNext() {
  playTap()
  emit('complete', 'prop-handoff')
}

async function intro(handoffProps: HandoffProp[]) {
  const coin = handoffProps.find((p) => p.id === 'love_coin')
  if (coin) {
    claimProp('love_coin')
  }
  playCoinDrop()
  if (machineStageEl.value) {
    gsap.fromTo(
      machineStageEl.value,
      { x: -160, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.52, ease: 'back.out(1.25)' },
    )
  }
}

function play() {
  setupLeverInteraction()
}

async function outro(_nextScene: SceneId): Promise<HandoffProp[]> {
  detachLeverDrag?.()
  playTap()

  if (nextWrapEl.value) {
    gsap.to(nextWrapEl.value, { opacity: 0, duration: 0.22 })
  }
  if (stampEl.value) {
    gsap.to(stampEl.value, { opacity: 0, scale: 0.85, duration: 0.3 })
  }
  if (machineStageEl.value) {
    gsap.to(machineStageEl.value, { x: -120, opacity: 0, duration: 0.46, ease: 'power2.in' })
  }

  // 一镜到底 9→10：老虎机吐出两张童年旧照碎片并飞向幕 10 初始左右位置
  handOverProp({
    id: 'child_boy_frag',
    kind: 'image',
    src: 'assets/photos/his_child_cut.webp',
    x: 240,
    y: 440,
    width: 240,
    height: 240,
    rotation: -12,
    opacity: 0.9,
    zIndex: 48,
  })
  handOverProp({
    id: 'child_girl_frag',
    kind: 'image',
    src: 'assets/photos/her_cake_sticker.webp',
    x: 310,
    y: 440,
    width: 240,
    height: 240,
    rotation: 12,
    opacity: 0.9,
    zIndex: 48,
  })

  await Promise.all([
    animateProp('child_boy_frag', {
      x: 214,
      y: 212,
      width: 214,
      height: 236,
      rotation: -4,
      opacity: 1,
      duration: 0.62,
      ease: 'power2.out',
    }),
    animateProp('child_girl_frag', {
      x: 850,
      y: 218,
      width: 214,
      height: 236,
      rotation: 4,
      opacity: 1,
      duration: 0.62,
      ease: 'power2.out',
    }),
  ])

  return []
}

onMounted(() => {
  if (!props.isUnderlay) {
    setupLeverInteraction()
  }
})

onBeforeUnmount(() => {
  detachLeverDrag?.()
  reelSwipeClean?.()
  if (cheatBannerTimer !== null) window.clearTimeout(cheatBannerTimer)
})

defineExpose({
  intro,
  play,
  outro,
})
</script>

<style scoped>
.scene-09 {
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

.slot-machine-stage {
  position: absolute;
  left: 146px;
  top: 108px;
  width: 344px;
  height: 494px;
  z-index: 16;
}

.slot-body-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 16px 28px rgba(43, 35, 29, 0.22));
  pointer-events: none;
}

/* 严格套进 slot_machine.webp 白色凹槽窗口 */
.reels-window {
  position: absolute;
  left: 14.5%;
  top: 44.9%;
  width: 70.9%;
  height: 21.1%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
  padding: 2px 4px;
  overflow: hidden;
}

.reel-col {
  position: relative;
  height: 100%;
  overflow: hidden;
  border-right: 1px solid rgba(201, 75, 99, 0.28);
  transition: box-shadow 0.25s ease, background 0.25s ease;
}

.reel-col.is-cheatable {
  cursor: pointer;
  touch-action: none;
  background: rgba(242, 184, 75, 0.24);
  box-shadow: inset 0 0 0 3px #F2B84B;
  animation: cheat-pulse 1.1s ease-in-out infinite alternate;
}

.cheat-hand {
  position: absolute;
  top: 56%;
  pointer-events: none;
}

.cheat-banner {
  position: absolute;
  left: 50%;
  top: 146px;
  transform: translateX(-50%);
  white-space: nowrap;
  padding: 6px 16px;
  border-radius: 999px;
  background: #2C1F17;
  color: #FFE98A;
  font-family: var(--font-hand);
  font-size: 21px;
  box-shadow: 0 6px 16px rgba(43, 35, 29, 0.28);
  z-index: 30;
  animation: coupon-pop 0.32s ease-out;
}

@keyframes cheat-pulse {
  from { box-shadow: inset 0 0 0 2.5px rgba(242, 184, 75, 0.85); }
  to { box-shadow: inset 0 0 0 4px #F2B84B, 0 0 14px rgba(242, 184, 75, 0.55); }
}

.reel-col:last-child {
  border-right: none;
}

.reel-strip {
  display: flex;
  flex-direction: column;
  will-change: transform;
}

.reel-cell {
  width: 100%;
  height: 102px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reel-icon {
  width: 46px;
  height: 46px;
  display: block;
}

/* 机柜右侧机械拉杆 */
.slot-lever-zone {
  position: absolute;
  right: -46px;
  top: 196px;
  width: 68px;
  height: 158px;
  cursor: grab;
  touch-action: none;
  z-index: 24;
}

.slot-lever-zone.disabled {
  cursor: default;
  pointer-events: none;
}

.lever-socket {
  position: absolute;
  left: 0;
  bottom: 18px;
  width: 24px;
  height: 52px;
  border-radius: 0 10px 10px 0;
  background: linear-gradient(180deg, #E2DFDA 0%, #B8B2AA 100%);
  border: 2px solid #756B62;
}

.lever-arm-wrap {
  position: absolute;
  left: 14px;
  top: 6px;
  width: 36px;
  height: 120px;
  transform-origin: center bottom;
}

.lever-rod {
  position: absolute;
  left: 13px;
  top: 24px;
  bottom: 0;
  width: 9px;
  border-radius: 5px;
  background: linear-gradient(90deg, #F5F3F0 0%, #B9B2AA 100%);
  border: 1.5px solid #6E655D;
}

.lever-ball {
  position: absolute;
  left: 0;
  top: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 30%, #FF7B85 0%, #D92A3D 65%, #911321 100%);
  border: 2px solid #78121E;
  box-shadow: 0 6px 14px rgba(43, 35, 29, 0.28);
}

.lever-hand {
  position: absolute;
  left: 24px;
  top: -12px;
}

.lever-hint {
  position: absolute;
  left: 556px;
  bottom: 42px;
  margin: 0;
  font-family: var(--font-hand);
  font-size: 28px;
  color: var(--ink-soft);
}

/* 右侧吐出的三张 choice 专属兑换券 */
.coupons-stage {
  position: absolute;
  left: 544px;
  top: 256px;
  width: 696px;
  display: flex;
  gap: 14px;
  z-index: 20;
}

.coupon-ticket {
  width: 220px;
  min-height: 126px;
  border-radius: 8px;
  background: #FFFDF8;
  border: 1.8px solid rgba(182, 150, 122, 0.55);
  box-shadow: 0 10px 24px rgba(43, 35, 29, 0.16);
  display: grid;
  grid-template-columns: 1fr 42px;
  overflow: hidden;
  animation: coupon-pop 0.42s cubic-bezier(0.22, 1.32, 0.36, 1);
}

@keyframes coupon-pop {
  0% { opacity: 0; transform: translateX(-36px) scale(0.84); }
  100% { opacity: 1; }
}

.coupon-main {
  padding: 12px 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.coupon-brand {
  font-family: monospace;
  font-size: 9.5px;
  color: #B26274;
  letter-spacing: 0.4px;
}

.coupon-title {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 23px;
  font-weight: 400;
  color: var(--ink);
  line-height: 1.15;
}

.coupon-desc {
  margin: 0;
  font-family: var(--font-body);
  font-size: 12.5px;
  line-height: 1.38;
  color: var(--ink-soft);
}

.coupon-meta {
  margin-top: auto;
  font-family: monospace;
  font-size: 10px;
  color: var(--accent-red);
}

.coupon-stub {
  border-left: 2px dashed rgba(138, 109, 83, 0.42);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-family: monospace;
  font-size: 11px;
  font-weight: 700;
  color: #7D4E59;
  writing-mode: vertical-rl;
  letter-spacing: 1px;
}

.coupon-ticket.theme-pink .coupon-stub {
  background: #FCE0E7;
}

.coupon-ticket.theme-yellow .coupon-stub {
  background: #FCF0AA;
  color: #7A5C12;
}

/* 「已到账 · choice 签发」双环红章 */
.issued-stamp {
  position: absolute;
  right: 174px;
  top: 108px;
  width: 106px;
  height: 106px;
  border-radius: 50%;
  border: 3px solid #B8293D;
  padding: 4px;
  transform: rotate(-12deg);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: stamp-slam 0.36s cubic-bezier(0.22, 1.4, 0.36, 1);
  pointer-events: none;
  z-index: 25;
}

@keyframes stamp-slam {
  0% { opacity: 0; transform: scale(1.85) rotate(-20deg); }
  100% { opacity: 0.92; transform: scale(1) rotate(-12deg); }
}

.stamp-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1.5px solid #B8293D;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #B8293D;
  gap: 2px;
}

.stamp-inner strong {
  font-family: var(--font-hand);
  font-size: 27px;
  font-weight: 400;
  line-height: 1;
}

.stamp-inner span {
  font-family: var(--font-body);
  font-size: 12px;
}

.issued-caption {
  position: absolute;
  left: 656px;
  top: 432px;
  margin: 0;
  font-family: var(--font-hand);
  font-size: 36px;
  color: var(--ink);
  animation: caption-in 0.45s ease;
}

@keyframes caption-in {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

.next-wrap {
  position: absolute;
  right: 44px;
  bottom: 28px;
  z-index: 35;
}
</style>
