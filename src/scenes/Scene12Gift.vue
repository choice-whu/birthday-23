<template>
  <div class="scene-12">
    <PaperBg variant="parchment">
      <Bunting variant="party" />

      <!-- 舞台内 1280×720 专属彩带画布（避免手机横屏 rotate(+90deg) 下全屏视口偏移） -->
      <canvas
        ref="confettiCanvasEl"
        width="1280"
        height="720"
        class="stage-confetti-canvas"
        aria-hidden="true"
      />

      <h2 v-if="!opened" class="arrival-ding">{{ SITE_CONFIG.scene12.dingDong }}</h2>

      <div v-if="opened" class="letter-decor" aria-hidden="true">
        <div class="sparkles sparkles-left"><i /><i /><i /></div>
        <img :src="assetUrl('assets/art/crown_gold.webp')" alt="" class="crown-sticker" />
        <div class="sparkles sparkles-right"><i /><i /><i /></div>
      </div>

      <!-- 拆封前点舞台中央的礼盒，拆封后礼盒让位给信笺 -->
      <button
        type="button"
        class="gift-box-stage"
        :class="{ 'is-opened': opened, 'is-wiggling': !opened && !isUnderlay }"
        :disabled="opened"
        :aria-label="opened ? '生日紫礼盒已拆开' : '点击拆开紫色生日礼盒'"
        @click="openGift"
      >
        <div class="gift-glow" :class="{ 'is-active': opened }" />
        <img
          :src="assetUrl('assets/art/gift_box.webp')"
          alt="紫色丝带生日礼盒"
          class="gift-box-img"
        />
        <HandHint v-if="!opened && !isUnderlay" mode="bob" class="gift-hand-hint" />
        <span v-if="opened" class="gift-opened-tag">23 岁专属礼盒<br />· 已拆封 ✨</span>
      </button>

      <!-- 拆封后：一封长信 / 现实礼物线索 / 双模式终章信笺 -->
      <section v-if="opened" class="finale-card" :class="`mode-${endingMode}`">
        <!-- 右上角朱红金色火漆印章 -->
        <div class="wax-seal" aria-hidden="true">
          <div class="seal-ring">
            <span class="seal-num">23</span>
            <span class="seal-heart">♥</span>
          </div>
        </div>

        <!-- 实物线索单模式标题（无长信时） -->
        <div v-if="endingMode === 'physical_clue'" class="clue-solo-head">
          <span class="solo-badge">Birthday Treasure</span>
          <h2 class="letter-title">23 岁快乐，现实里还有一份礼物在等你 ✨</h2>
        </div>

        <!-- 长信模式 / 双模式正文 -->
        <template v-if="showLetter">
          <h2 class="letter-title">{{ SITE_CONFIG.scene12.letterTitle }}</h2>
          <div class="letter-paragraphs">
            <p v-for="(para, idx) in SITE_CONFIG.scene12.letterParagraphs" :key="idx" class="letter-para">
              {{ para }}
            </p>
          </div>
        </template>

        <!-- 现实礼物寻宝线索条 -->
        <div v-if="showPhysicalClue" class="physical-clue-box">
          <span class="clue-badge">🎁 现实里的礼物线索</span>
          <p class="clue-text">{{ SITE_CONFIG.scene12.physicalClueText }}</p>
        </div>

        <p class="letter-sign">{{ SITE_CONFIG.scene12.letterSign }}</p>
      </section>
    </PaperBg>
  </div>
</template>

<script setup lang="ts">
import confetti from 'canvas-confetti'
import { computed, onBeforeUnmount, ref } from 'vue'
import Bunting from '../components/Bunting.vue'
import HandHint from '../components/HandHint.vue'
import PaperBg from '../components/PaperBg.vue'
import { SITE_CONFIG } from '../config'
import { claimProp } from '../director/handoff'
import { assetUrl } from '../engine/audio'
import { markUnlockedAll } from '../engine/progress'
import { playRibbonUntie, playWindChime } from '../engine/sfx'

withDefaults(
  defineProps<{
    isUnderlay?: boolean
  }>(),
  { isUnderlay: false },
)

const endingMode = SITE_CONFIG.scene12.endingMode
const showLetter = computed(() => endingMode === 'love_letter' || endingMode === 'both')
const showPhysicalClue = computed(() => endingMode === 'physical_clue' || endingMode === 'both')

const opened = ref(false)
const confettiCanvasEl = ref<HTMLCanvasElement | null>(null)

let confettiTimer: number | null = null
let chimeTimer: number | null = null

function fireBirthdayConfetti() {
  const canvas = confettiCanvasEl.value
  if (!canvas) return
  try {
    const burst = confetti.create(canvas, { resize: false, useWorker: false })
    const palette = ['#9A82C4', '#E84A7F', '#F2B84B', '#A8C97F', '#FAF3E8']

    void burst({
      particleCount: 55,
      spread: 74,
      startVelocity: 38,
      origin: { x: 0.34, y: 0.48 },
      colors: palette,
    })

    confettiTimer = window.setTimeout(() => {
      void burst({
        particleCount: 45,
        angle: 115,
        spread: 68,
        startVelocity: 34,
        origin: { x: 0.72, y: 0.42 },
        colors: palette,
      })
    }, 220)
  } catch {
    // 无 Canvas 环境下静默兜底
  }
}

function openGift() {
  if (opened.value) return
  opened.value = true
  playRibbonUntie()
  markUnlockedAll()

  chimeTimer = window.setTimeout(() => {
    playWindChime()
  }, 160)

  fireBirthdayConfetti()
}

async function intro() {
  claimProp('purple_gift_box')
}

onBeforeUnmount(() => {
  if (confettiTimer !== null) window.clearTimeout(confettiTimer)
  if (chimeTimer !== null) window.clearTimeout(chimeTimer)
})

defineExpose({
  intro,
})
</script>

<style scoped>
.scene-12 {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  overflow: hidden;
}

.stage-confetti-canvas {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  pointer-events: none;
  z-index: 42;
}

/* 礼盒起始位置与幕 11 飞入道具对齐 */
.gift-box-stage {
  position: absolute;
  left: 409px;
  top: 141px;
  width: 462px;
  height: 498px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  z-index: 16;
  transition: left 0.56s cubic-bezier(0.22, 1, 0.36, 1),
    top 0.56s cubic-bezier(0.22, 1, 0.36, 1),
    width 0.56s cubic-bezier(0.22, 1, 0.36, 1),
    height 0.56s cubic-bezier(0.22, 1, 0.36, 1);
}

.gift-box-stage.is-wiggling {
  animation: gift-wiggle 2.2s ease-in-out infinite;
}

.gift-box-stage:not(.is-opened) {
  transform: rotate(-1.5deg);
}

.gift-box-stage.is-opened {
  left: 25px;
  top: 484px;
  width: 138px;
  height: 149px;
  cursor: default;
}

.gift-glow {
  position: absolute;
  left: 50%;
  top: 52%;
  transform: translate(-50%, -50%);
  width: 92%;
  height: 82%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(242, 184, 75, 0.28) 0%, rgba(154, 130, 196, 0.14) 52%, transparent 74%);
  pointer-events: none;
  transition: opacity 0.4s ease;
}

.gift-glow.is-active {
  background: radial-gradient(circle, rgba(242, 184, 75, 0.34) 0%, rgba(232, 74, 127, 0.12) 55%, transparent 74%);
}

.gift-box-img {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 14px 22px rgba(43, 35, 29, 0.2));
}

.gift-hand-hint {
  position: absolute;
  right: 22px;
  bottom: 24px;
}

.gift-opened-tag {
  position: absolute;
  left: 45%;
  bottom: -32px;
  transform: translateX(-50%);
  width: 140px;
  padding: 4px 7px;
  border-radius: 999px;
  background: rgba(255, 252, 245, 0.92);
  border: 1.5px solid rgba(154, 130, 196, 0.45);
  font-family: var(--font-hand);
  font-size: 12px;
  line-height: 1.25;
  color: var(--ink-soft);
  box-shadow: 0 4px 10px rgba(43, 35, 29, 0.08);
}

.arrival-ding {
  position: absolute;
  top: 92px;
  inset-inline: 0;
  margin: 0;
  text-align: center;
  font-family: var(--font-hand);
  font-size: 38px;
  line-height: 1.1;
  color: var(--ink-soft);
}

.letter-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 7% 38%, rgba(232, 74, 127, 0.12), transparent 24%),
    radial-gradient(ellipse at 94% 24%, rgba(242, 184, 75, 0.2), transparent 23%),
    radial-gradient(ellipse at 94% 83%, rgba(154, 130, 196, 0.19), transparent 27%);
  animation: letter-unfold 0.52s ease-out both;
}

.crown-sticker {
  position: absolute;
  top: 120px;
  right: 45px;
  width: 104px;
  height: 83px;
  object-fit: contain;
  transform: rotate(14deg);
  filter: drop-shadow(0 5px 6px rgba(108, 67, 31, 0.16));
}

.sparkles {
  position: absolute;
  width: 84px;
  height: 94px;
  transform: rotate(-12deg);
}

.sparkles-left {
  left: 48px;
  top: 203px;
}

.sparkles-right {
  right: 38px;
  bottom: 139px;
  transform: rotate(19deg);
}

.sparkles i {
  position: absolute;
  left: 12px;
  top: 25px;
  width: 44px;
  aspect-ratio: 1;
  background: #DEA13D;
  clip-path: polygon(50% 0%, 60% 38%, 100% 50%, 60% 60%, 50% 100%, 39% 60%, 0% 50%, 39% 39%);
}

.sparkles i:nth-child(2) {
  left: 58px;
  top: 2px;
  width: 21px;
  background: #CB7593;
}

.sparkles i:nth-child(3) {
  left: 58px;
  top: 74px;
  width: 17px;
  background: #8D7AB6;
}

/* 拆开后终章手账信笺卡片 */
.finale-card {
  position: absolute;
  left: 160px;
  top: 68px;
  width: 960px;
  min-height: 584px;
  padding: 34px 50px 27px;
  background: repeating-linear-gradient(180deg, transparent 0 27px, rgba(151, 105, 79, 0.09) 27px 28px)
    0 76px / 100% 28px repeat, linear-gradient(160deg, #fffdf9, #fff8ee);
  border: 1px solid rgba(138, 109, 83, 0.35);
  border-radius: 8px 10px 12px 8px;
  box-shadow: 0 15px 35px rgba(43, 35, 29, 0.17), 5px 5px 0 -1px #e8c9c3,
    7px 7px 0 -1px #d9b7b2;
  z-index: 20;
  display: flex;
  flex-direction: column;
  animation: letter-unfold 0.52s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.finale-card::before,
.finale-card::after {
  content: '';
  position: absolute;
  width: 98px;
  height: 28px;
  pointer-events: none;
  clip-path: polygon(0 1%, 100% 0, 97% 18%, 100% 34%, 97% 51%, 100% 67%, 97% 83%, 100% 99%,
    0 100%, 3% 82%, 0 66%, 3% 49%, 0 33%, 3% 17%);
}

.finale-card::before {
  left: -26px;
  top: 4px;
  transform: rotate(-23deg);
  background: repeating-linear-gradient(110deg, #E6B9CDDE 0 8px, #F5D7DFE8 8px 14px);
}

.finale-card::after {
  right: -27px;
  bottom: 0;
  transform: rotate(-25deg);
  background: repeating-linear-gradient(110deg, #DDC3E7E0 0 8px, #F2E0F5E8 8px 14px);
}

/* 火漆印章 */
.wax-seal {
  position: absolute;
  right: 36px;
  top: 25px;
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 30%, #e15a56 0%, #b32d2a 68%, #851c19 100%);
  box-shadow: 0 6px 14px rgba(133, 28, 25, 0.34), inset 0 2px 4px rgba(255, 215, 200, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(10deg);
}

.seal-ring {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 1.5px solid rgba(250, 224, 175, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.seal-num {
  font-family: var(--font-serif-en);
  font-size: 17px;
  font-weight: 700;
  color: #fde9c4;
}

.seal-heart {
  font-size: 11px;
  color: #fde9c4;
  margin-top: 2px;
}

.clue-solo-head {
  margin-bottom: 18px;
  padding-right: 72px;
}

.solo-badge {
  display: inline-block;
  margin-bottom: 8px;
  padding: 3px 12px;
  border-radius: 999px;
  background: rgba(232, 74, 127, 0.12);
  color: var(--accent-pink);
  font-family: var(--font-serif-en);
  font-size: 12px;
  letter-spacing: 2px;
}

.letter-title {
  margin: 0 0 14px;
  padding-right: 78px;
  font-family: var(--font-hand);
  font-size: 32px;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.25;
}

.letter-paragraphs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.finale-card.mode-both .letter-paragraphs {
  gap: 8px;
}

.letter-para {
  margin: 0;
  font-family: var(--font-body);
  font-size: 18px;
  line-height: 28px;
  color: var(--ink);
  white-space: pre-line;
}

.finale-card.mode-both .letter-para {
  font-size: 15.5px;
  line-height: 1.52;
}

.physical-clue-box {
  margin-top: 16px;
  padding: 14px 20px;
  border-radius: 10px;
  background: rgba(248, 232, 137, 0.28);
  border: 1.8px dashed rgba(180, 122, 42, 0.55);
}

.finale-card.mode-physical_clue .physical-clue-box {
  margin: 18px 0 28px;
  padding: 26px 28px;
}

.clue-badge {
  display: inline-block;
  font-family: var(--font-hand);
  font-size: 18px;
  color: var(--accent-red);
  margin-bottom: 6px;
}

.clue-text {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 22px;
  line-height: 1.5;
  color: var(--ink);
}

.letter-sign {
  margin: 12px 0 0;
  text-align: right;
  font-family: var(--font-hand);
  font-size: 23px;
  color: var(--ink-soft);
}

@keyframes gift-wiggle {
  0%,
  100% {
    transform: rotate(-1.5deg) translateY(0);
  }
  20% {
    transform: rotate(2.4deg) translateY(-4px);
  }
  40% {
    transform: rotate(-2deg) translateY(0);
  }
  55% {
    transform: rotate(1.6deg) translateY(-2px);
  }
  70% {
    transform: rotate(0deg) translateY(0);
  }
}

@keyframes letter-unfold {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
