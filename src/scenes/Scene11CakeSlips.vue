<template>
  <div class="scene-11">
    <PaperBg variant="parchment">
      <div class="journal-spine-shadow" aria-hidden="true" />
      <Bunting variant="corner" />

      <!-- 阶段顶栏提示（熄灯前显示） -->
      <header v-if="phase !== 'lit'" class="scene-header">
        <h2 class="scene-title">
          {{ phase === 'stack' ? '把祝福纸条叠成一个生日蛋糕吧' : '划亮火柴，点亮 23 岁的第一束烛光' }}
        </h2>
        <p class="scene-sub">
          {{
            phase === 'stack'
              ? '按大小规律从散落纸条里挑出来，拖到左侧堆出一座生日蛋糕～'
              : matchboxOpened
                ? SITE_CONFIG.scene11.matchStrikeHint
                : '盒子里有火柴~'
          }}
        </p>
      </header>

      <!-- 左侧：手撕纸条金字塔蛋糕画板 -->
      <div
        ref="cakeBoardEl"
        class="cake-board"
        :class="{ 'board-lit': phase === 'lit' }"
      >
        <!-- 蛋糕下方手绘黑色丝带花体卷曲 -->
        <svg class="cake-flourish" viewBox="0 0 360 44" aria-hidden="true">
          <path
            d="M32 22 C88 8, 124 34, 180 18 C222 6, 244 36, 286 16 C312 6, 330 22, 344 14"
            fill="none"
            stroke="#241D18"
            stroke-width="2.4"
            stroke-linecap="round"
          />
          <path
            d="M150 26 C158 38, 178 38, 184 22"
            fill="none"
            stroke="#241D18"
            stroke-width="2.2"
            stroke-linecap="round"
          />
        </svg>

        <!-- 蛋糕周围手绘黑色小星芒 -->
        <svg v-if="allStacked" class="cake-sparkles" viewBox="0 0 536 620" aria-hidden="true">
          <g stroke="#241D18" stroke-width="2" stroke-linecap="round">
            <line x1="88" y1="154" x2="88" y2="172" />
            <line x1="79" y1="163" x2="97" y2="163" />
            <line x1="448" y1="146" x2="448" y2="162" />
            <line x1="440" y1="154" x2="456" y2="154" />
            <path d="M52 332 Q58 320 64 332 Q58 344 52 332 Z" fill="none" />
            <path d="M472 308 L478 320 L484 308" fill="none" />
          </g>
        </svg>

        <!-- 未放置时仅显示铅笔手绘蛋糕轮廓剪影（隐藏“第X层”直白文字以增加解密感） -->
        <svg v-if="!allStacked" class="cake-pencil-silhouette" viewBox="0 0 536 580" aria-hidden="true">
          <path
            d="M20 562 L40 448 L96 446 L96 346 L24 342 L34 226 L138 224 L138 148 L166 146 L166 78 L368 78 L368 146 L402 148 L402 224 L506 232 L498 344 L472 346 L472 448 L516 452 L516 562 Z"
            fill="rgba(255, 250, 240, 0.34)"
            stroke="rgba(138, 109, 83, 0.38)"
            stroke-width="2"
            stroke-dasharray="7 6"
            stroke-linejoin="round"
          />
          <text x="268" y="330" text-anchor="middle" class="silhouette-hint">把祝福纸条在这里叠成蛋糕</text>
        </svg>

        <!-- 逻辑吸附槽位（默认透明保持悬念，仅放错后给当前正确层级微弱金光指引） -->
        <div
          v-for="slot in PYRAMID_SLOTS"
          :key="`slot-${slot.idx}`"
          class="pyramid-slot-guide"
          :class="{
            'is-placed': placed[slot.idx],
            'gold-guide': mistakes.glowKey.value === 'stack' && !placed[slot.idx] && canPlaceSlip(slot.idx),
          }"
          :style="{
            left: `${slot.x}px`,
            top: `${slot.y}px`,
            width: `${slot.width}px`,
            height: `${slot.height}px`,
            transform: `rotate(${slot.rot}deg)`,
          }"
        />

        <!-- 6 张纸条全叠好后出现的顶端淡紫色蜡烛 -->
        <div
          v-if="allStacked"
          class="cake-candle"
          :class="{ 'is-hover-wick': candleHover && !candleLit, 'is-lit': candleLit }"
        >
          <div v-if="phase === 'light' && !candleLit" class="wick-target-ring" />

          <!-- 烛火 -->
          <svg
            v-if="candleLit"
            class="candle-flame"
            viewBox="0 0 40 52"
            aria-hidden="true"
          >
            <ellipse cx="20" cy="30" rx="14" ry="18" fill="rgba(255, 198, 86, 0.36)" />
            <path
              d="M20 4 C28 16, 31 28, 28 38 C26 44, 14 44, 12 38 C9 28, 12 16, 20 4 Z"
              fill="#FF9824"
            />
            <path
              d="M20 13 C25 22, 26 30, 24 36 C22.5 40, 17.5 40, 16 36 C14 30, 15 22, 20 13 Z"
              fill="#FFE98A"
            />
            <ellipse cx="20" cy="34" rx="2.6" ry="4.5" fill="#FFFDF4" />
          </svg>

          <!-- 蜡烛芯与紫色糖霜条纹蜡烛棒 -->
          <svg class="candle-body-svg" viewBox="0 0 36 88" aria-hidden="true">
            <path d="M18 4 Q19 10 18 16" stroke="#2C1F17" stroke-width="2.4" stroke-linecap="round" fill="none" />
            <rect
              x="9"
              y="16"
              width="18"
              height="68"
              rx="5"
              fill="#C7AFDF"
              stroke="#2C1F17"
              stroke-width="2.2"
            />
            <path
              d="M10 30 L26 24 M10 46 L26 40 M10 62 L26 56 M10 77 L26 71"
              stroke="#9D7CC2"
              stroke-width="3"
              stroke-linecap="round"
            />
            <path
              d="M13 20 L13 78"
              stroke="rgba(255,255,255,0.45)"
              stroke-width="2.2"
              stroke-linecap="round"
            />
          </svg>
        </div>
      </div>

      <!-- 所有 6 张手撕彩色祝福纸条（右侧待选堆与左侧已贴金字塔共用 DOM，无缝飞入吸附） -->
      <div
        v-for="(slip, idx) in slips"
        :key="`slip-${idx}`"
        :ref="(el) => setSlipEl(idx, el)"
        class="stage-slip"
        :class="{
          'is-placed': placed[idx],
          'is-dragging': draggingSlipIdx === idx,
          'is-lit-card': phase === 'lit',
        }"
        :style="{
          left: `${slipPositions[idx].x}px`,
          top: `${slipPositions[idx].y}px`,
          width: `${PYRAMID_SLOTS[idx].width}px`,
          height: `${PYRAMID_SLOTS[idx].height}px`,
          transform: `rotate(${slipPositions[idx].rot}deg) scale(${draggingSlipIdx === idx ? 1.03 : 1})`,
          zIndex: draggingSlipIdx === idx ? 38 : placed[idx] ? 12 + idx : slipZOrders[idx],
        }"
      >
        <TornPaper
          :seed="210 + idx * 37"
          :color="slip.color"
          :width="PYRAMID_SLOTS[idx].width"
          :height="PYRAMID_SLOTS[idx].height"
          :variant="idx"
          :rotation="0"
        >
          <div
            class="slip-inner"
            :class="{
              'has-gift-cat': slip.doodle === 'gift-cat',
              'has-smile-cat': slip.doodle === 'smile-cat',
              'is-compact': PYRAMID_SLOTS[idx].width <= 275,
            }"
          >
            <!-- 第2层左小猫抱礼涂鸦 -->
            <svg
              v-if="slip.doodle === 'gift-cat'"
              class="doodle-gift-cat"
              viewBox="0 0 64 60"
              aria-hidden="true"
            >
              <g stroke="#1E1612" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round">
                <path d="M14 26 L16 14 L25 22 Q32 19 39 22 L48 14 L50 26 C53 33 50 45 32 46 C14 45 11 33 14 26 Z" fill="#FFF8EE" />
                <circle cx="25" cy="30" r="1.7" fill="#1E1612" />
                <circle cx="39" cy="30" r="1.7" fill="#1E1612" />
                <path d="M29 35 Q32 38 35 35" />
                <rect x="20" y="42" width="24" height="14" rx="2" fill="#F9E3A6" />
                <line x1="32" y1="42" x2="32" y2="56" />
                <line x1="20" y1="49" x2="44" y2="49" />
                <path d="M28 42 Q32 36 36 42" />
              </g>
            </svg>

            <!-- 第3层左黄色小猫笑脸涂鸦 -->
            <svg
              v-else-if="slip.doodle === 'smile-cat'"
              class="doodle-smile-cat"
              viewBox="0 0 54 46"
              aria-hidden="true"
            >
              <g stroke="#1E1612" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22 L14 10 L23 18 Q28 16 33 18 L42 10 L44 22 C46 30 41 38 28 38 C15 38 10 30 12 22 Z" fill="#FFFDF5" />
                <circle cx="22" cy="25" r="1.5" fill="#1E1612" />
                <circle cx="34" cy="25" r="1.5" fill="#1E1612" />
                <path d="M25 29 Q28 33 31 29" />
              </g>
            </svg>

            <p class="slip-text" :class="`slip-text-${idx}`">{{ slip.text }}</p>
          </div>
        </TornPaper>
      </div>

      <!-- 阶段二 / 三：复古闭合火柴盒（点击推开抽屉出现火柴，再到侧边磷皮擦条向右划燃） -->
      <template v-if="phase === 'strike' || phase === 'light'">
        <div class="match-desk-card">
          <template v-if="matchboxOpened">
            <div class="desk-badge">{{ phase === 'strike' ? 'STEP 2 · 划亮火柴' : 'STEP 3 · 点燃蜡烛' }}</div>
            <p class="desk-tip">
              {{ phase === 'strike' ? '拿出火柴棒！按住顺着棕色磷皮擦条向右划出火花' : '火柴已点燃！拖着火苗去碰蛋糕顶端的蜡烛芯' }}
            </p>
          </template>

          <!-- 复古安全火柴盒舞台（盒套 + 推拉内屉） -->
          <div class="matchbox-stage">
            <!-- 内层木质火柴抽屉（点击火柴盒后向右滑出，露出整齐排列的备用火柴） -->
            <div class="matchbox-drawer" :class="{ 'is-open': matchboxOpened }">
              <div class="drawer-cavity">
                <div v-for="m in 4" :key="`spare-${m}`" class="spare-match">
                  <span class="spare-wood" />
                  <span class="spare-head" />
                </div>
              </div>
              <span class="drawer-lip" />
            </div>

            <!-- 外层复古火柴盒外壳 -->
            <div
              class="matchbox-prop"
              :class="{ 'is-closed': !matchboxOpened }"
              @click="openMatchbox"
            >
              <div class="matchbox-striker">
                <span class="striker-label">{{ matchboxOpened ? '向右划燃 ➔' : '复古擦火面' }}</span>
              </div>
              <div class="matchbox-vintage-cover">
                <div class="vintage-inner-border">
                  <div class="vintage-top-row">
                    <span>CHINA · SAFETY</span>
                    <span class="vintage-star">✦ 23 ✦</span>
                    <span>SPECIAL</span>
                  </div>
                  <div class="vintage-center-emblem">
                    <svg class="swallow-crest" viewBox="0 0 120 44" aria-hidden="true">
                      <circle cx="60" cy="22" r="18" fill="none" stroke="#C83E3B" stroke-width="1.8" stroke-dasharray="3 2" />
                      <path d="M40 24 Q54 14 60 22 Q68 12 82 20 Q68 24 60 27 Q52 24 40 24 Z" fill="#1F3552" />
                      <polygon points="60,8 62,14 68,14 63,18 65,24 60,20 55,24 57,18 52,14 58,14" fill="#F2B84B" />
                    </svg>
                    <span class="vintage-cn">安全火柴</span>
                  </div>
                  <div class="vintage-bottom-row">平安喜乐 · 点亮二十三岁</div>
                </div>
              </div>
            </div>
          </div>

          <HandHint v-if="!isUnderlay && !matchboxOpened" mode="bob" class="match-open-hand" />
          <HandHint
            v-if="!isUnderlay && matchboxOpened && phase === 'strike' && !matchDragging"
            mode="drag-right"
            class="match-hand-hint"
          />
        </div>

        <!-- 推开火柴盒后才现身的可拖拽木质火柴 -->
        <div
          v-if="matchboxOpened"
          ref="matchStickEl"
          class="matchstick-wrap"
          :class="{ 'is-dragging': matchDragging, 'is-lit': matchLit }"
          :style="{
            left: `${matchPos.x}px`,
            top: `${matchPos.y}px`,
            transform: `rotate(${matchPos.rot}deg)`,
          }"
        >
          <svg class="matchstick-svg" viewBox="0 0 166 56" aria-hidden="true">
            <rect x="6" y="30" width="128" height="9" rx="3" fill="rgba(43,35,29,0.18)" />
            <rect
              x="4"
              y="26"
              width="128"
              height="9"
              rx="3"
              fill="#E5C08D"
              stroke="#5A3A24"
              stroke-width="1.8"
            />
            <line x1="18" y1="29.5" x2="106" y2="29.5" stroke="rgba(120,76,40,0.32)" stroke-width="1.3" />
            <ellipse
              cx="138"
              cy="30.5"
              rx="14"
              ry="8.5"
              :fill="matchLit ? '#3A231B' : '#C83E3B'"
              stroke="#2C1F17"
              stroke-width="2"
            />
            <g v-if="matchLit" class="match-flame-g">
              <ellipse cx="141" cy="18" rx="14" ry="15" fill="rgba(255, 196, 82, 0.36)" />
              <path
                d="M140 2 C148 11, 150 20, 147 27 C144 31, 136 31, 133 27 C130 20, 133 11, 140 2 Z"
                fill="#FF8C24"
              />
              <path
                d="M140 9 C144 15, 145 21, 143 25 C142 27.5, 138 27.5, 137 25 C135 21, 136 15, 140 9 Z"
                fill="#FFE98A"
              />
            </g>
          </svg>
        </div>
      </template>

      <!-- 阶段四：全屏暖褐烛光聚光灯与祝福字（无抖音灰气泡） -->
      <div v-if="phase === 'lit'" class="candlelight-overlay">
        <div class="spotlight-veil" />
        <div class="candle-halo" />

        <div class="lit-top-flank left-flank">{{ SITE_CONFIG.scene11.litTopLeft }}</div>
        <div class="lit-top-flank right-flank">{{ SITE_CONFIG.scene11.litTopRight }}</div>

        <div class="lit-right-column">
          <span class="lit-kicker">23rd Birthday Candlelight</span>
          <p class="lit-blessing">{{ SITE_CONFIG.scene11.litRightText }}</p>
        </div>

        <div class="next-btn-wrap">
          <NextButton :label="SITE_CONFIG.scene11.nextLabel" @click="finishScene" />
        </div>
      </div>

      <HintBubble :text="mistakes.bubbleText.value" />
    </PaperBg>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, type ComponentPublicInstance } from 'vue'
import Bunting from '../components/Bunting.vue'
import HandHint from '../components/HandHint.vue'
import HintBubble from '../components/HintBubble.vue'
import NextButton from '../components/NextButton.vue'
import PaperBg from '../components/PaperBg.vue'
import TornPaper from '../components/TornPaper.vue'
import { useMistakes } from '../components/useMistakes'
import { SITE_CONFIG, type SceneId } from '../config'
import { animateProp, claimProp, handOverProp } from '../director/handoff'
import type { HandoffProp, TransitionMode } from '../director/types'
import { clamp } from '../engine/coords'
import {
  playDoorbell,
  playGentleShake,
  playMatchStrike,
  playPaperTearTick,
  playWindChime,
} from '../engine/sfx'
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

interface PyramidSlotSpec {
  idx: number
  x: number
  y: number
  width: number
  height: number
  rot: number
  layerLabel: string
  widthLabel: string
}

const BOARD_ORIGIN = { x: 68, y: 42 }

// 6 张手撕彩纸从宽到窄的金字塔槽位（加厚内衬留足剧烈撕裂幅度余量）
const PYRAMID_SLOTS: PyramidSlotSpec[] = [
  { idx: 0, x: 18, y: 448, width: 500, height: 126, rot: -1.1, layerLabel: '一', widthLabel: '最宽底座' },
  { idx: 1, x: 58, y: 344, width: 420, height: 102, rot: 1.2, layerLabel: '二', widthLabel: '红纸条' },
  { idx: 2, x: 12, y: 230, width: 262, height: 112, rot: -3.4, layerLabel: '三', widthLabel: '黄纸条' },
  { idx: 3, x: 278, y: 238, width: 236, height: 104, rot: 2.9, layerLabel: '三', widthLabel: '粉纸条' },
  { idx: 4, x: 129, y: 148, width: 278, height: 82, rot: -1.4, layerLabel: '四', widthLabel: '绿纸条' },
  { idx: 5, x: 159, y: 78, width: 218, height: 72, rot: 1.7, layerLabel: '五', widthLabel: '顶层短条' },
]

// 6 张手撕纸条在右侧页错乱散落堆叠（增大翻找与判断宽窄的解密乐趣，每张核心抓握区保持可触达）
const PILE_HOME = [
  { x: 690, y: 468, rot: 4.5 },
  { x: 738, y: 332, rot: -5.2 },
  { x: 684, y: 236, rot: 7.4 },
  { x: 960, y: 244, rot: -8.6 },
  { x: 842, y: 162, rot: -4.8 },
  { x: 724, y: 406, rot: 10.2 },
]

// 顶端蜡烛芯在全舞台 1280×720 的坐标（cakeBoard 68,42 + candle left 250 + 18 = 336, top 8 + 42 + 4 = 54）
const CANDLE_WICK_STAGE = { x: 336, y: 54 }
const MATCH_HOME = { x: 742, y: 292, rot: -8 }

const slips = SITE_CONFIG.scene11.slips
const mistakes = useMistakes()

const phase = ref<'stack' | 'strike' | 'light' | 'lit'>('stack')
const placed = reactive<boolean[]>([false, false, false, false, false, false])
const slipPositions = reactive(PILE_HOME.map((p) => ({ ...p })))
const slipZOrders = reactive([16, 17, 18, 19, 20, 21])
let nextTopZ = 22
const draggingSlipIdx = ref<number | null>(null)

const matchboxOpened = ref(false)
const matchPos = reactive({ ...MATCH_HOME })
const matchDragging = ref(false)
const matchLit = ref(false)
const candleLit = ref(false)
const candleHover = ref(false)

const cakeBoardEl = ref<HTMLElement | null>(null)
const matchStickEl = ref<HTMLElement | null>(null)
const slipEls = new Map<number, HTMLElement>()

const allStacked = computed(() => placed.every(Boolean))

let slipDrags: (() => void)[] = []
let matchDragCleanup: (() => void) | null = null
let finishing = false

function setSlipEl(idx: number, el: Element | ComponentPublicInstance | null) {
  const htmlEl = el instanceof HTMLElement ? el : (el as { $el?: HTMLElement } | null)?.$el ?? null
  if (htmlEl) {
    slipEls.set(idx, htmlEl)
  } else {
    slipEls.delete(idx)
  }
}

function canPlaceSlip(idx: number): boolean {
  if (idx === 0) return true
  if (idx === 1) return placed[0]
  if (idx === 2 || idx === 3) return placed[0] && placed[1]
  if (idx === 4) return placed[0] && placed[1] && placed[2] && placed[3]
  if (idx === 5) return placed[0] && placed[1] && placed[2] && placed[3] && placed[4]
  return false
}

function clearDrags() {
  while (slipDrags.length) {
    slipDrags.pop()?.()
  }
  matchDragCleanup?.()
  matchDragCleanup = null
}

function openMatchbox() {
  if (props.isUnderlay || matchboxOpened.value) return
  matchboxOpened.value = true
  playPaperTearTick(0.9)
  void nextTick().then(() => setupMatchDrag())
}

function igniteMatch() {
  if (matchLit.value || phase.value !== 'strike') return
  matchLit.value = true
  phase.value = 'light'
  matchPos.rot = -24
  playMatchStrike()
}

function igniteCandle() {
  if (candleLit.value) return
  candleLit.value = true
  candleHover.value = false
  phase.value = 'lit'
  clearDrags()
  playWindChime()
}

function getMatchHeadStage() {
  const rad = (matchPos.rot * Math.PI) / 180
  return {
    x: matchPos.x + 83 + 56 * Math.cos(rad),
    y: matchPos.y + 28 + 56 * Math.sin(rad),
  }
}

function setupMatchDrag() {
  matchDragCleanup?.()
  matchDragCleanup = null
  if (props.isUnderlay || !matchboxOpened.value || !matchStickEl.value) return
  if (phase.value !== 'strike' && phase.value !== 'light') return

  let sx = matchPos.x
  let sy = matchPos.y

  matchDragCleanup = attachStageDrag(matchStickEl.value, {
    canStart: () => phase.value === 'strike' || phase.value === 'light',
    onStart: () => {
      gsap.killTweensOf(matchPos)
      matchDragging.value = true
      sx = matchPos.x
      sy = matchPos.y
    },
    onMove: (payload) => {
      matchPos.x = clamp(sx + payload.dx, 64, 1100)
      matchPos.y = clamp(sy + payload.dy, 48, 645)

      if (phase.value === 'strike') {
        matchPos.rot = -4
        if (payload.dx > 60) {
          igniteMatch()
        }
      }

      if (matchLit.value && phase.value === 'light') {
        const head = getMatchHeadStage()
        const d = Math.hypot(head.x - CANDLE_WICK_STAGE.x, head.y - CANDLE_WICK_STAGE.y)
        candleHover.value = d <= 135
        if (d <= 86) {
          igniteCandle()
        }
      }
    },
    onEnd: () => {
      matchDragging.value = false
      candleHover.value = false
      if (phase.value === 'strike') {
        gsap.to(matchPos, {
          x: MATCH_HOME.x,
          y: MATCH_HOME.y,
          rot: MATCH_HOME.rot,
          duration: 0.34,
          ease: 'back.out(1.4)',
        })
      }
    },
  })
}

function setupSlipDrags() {
  clearDrags()
  if (props.isUnderlay || phase.value !== 'stack') return

  slips.forEach((_slip, idx) => {
    const el = slipEls.get(idx)
    if (!el) return
    let sx = slipPositions[idx].x
    let sy = slipPositions[idx].y

    slipDrags.push(
      attachStageDrag(el, {
        canStart: () => phase.value === 'stack' && !placed[idx],
        onStart: () => {
          gsap.killTweensOf(slipPositions[idx])
          draggingSlipIdx.value = idx
          slipZOrders[idx] = nextTopZ++
          sx = slipPositions[idx].x
          sy = slipPositions[idx].y
        },
        onMove: (payload) => {
          slipPositions[idx].x = clamp(sx + payload.dx, 24, 1210 - PYRAMID_SLOTS[idx].width * 0.6)
          slipPositions[idx].y = clamp(sy + payload.dy, 36, 650)
          slipPositions[idx].rot = clamp(PILE_HOME[idx].rot + payload.dx * 0.01, -6, 6)
        },
        onEnd: () => {
          draggingSlipIdx.value = null
          const slot = PYRAMID_SLOTS[idx]
          const slipCenterX = slipPositions[idx].x + slot.width / 2
          const slipCenterY = slipPositions[idx].y + slot.height / 2
          const targetCenterX = BOARD_ORIGIN.x + slot.x + slot.width / 2
          const targetCenterY = BOARD_ORIGIN.y + slot.y + slot.height / 2
          const distToTarget = Math.hypot(slipCenterX - targetCenterX, slipCenterY - targetCenterY)
          const droppedInCakeZone = slipCenterX <= 650 || distToTarget <= 185

          if (!droppedInCakeZone) {
            gsap.to(slipPositions[idx], {
              x: PILE_HOME[idx].x,
              y: PILE_HOME[idx].y,
              rot: PILE_HOME[idx].rot,
              duration: 0.32,
              ease: 'power2.out',
            })
            return
          }

          if (!canPlaceSlip(idx)) {
            playGentleShake()
            mistakes.trigger('stack', SITE_CONFIG.scene11.wrongOrderBubble)
            gsap.to(slipPositions[idx], {
              x: PILE_HOME[idx].x,
              y: PILE_HOME[idx].y,
              rot: PILE_HOME[idx].rot,
              duration: 0.38,
              ease: 'back.out(1.4)',
            })
            return
          }

          mistakes.clear('stack')
          placed[idx] = true
          playPaperTearTick(0.85)
          gsap.to(slipPositions[idx], {
            x: BOARD_ORIGIN.x + slot.x,
            y: BOARD_ORIGIN.y + slot.y,
            rot: slot.rot,
            duration: 0.28,
            ease: 'back.out(1.5)',
          })

          if (placed.every(Boolean)) {
            clearDrags()
            setTimeout(() => {
              if (phase.value !== 'stack') return
              matchboxOpened.value = false
              phase.value = 'strike'
              playWindChime()
            }, 260)
          }
        },
      }),
    )
  })
}

function finishScene() {
  if (finishing) return
  finishing = true
  emit('complete', 'prop-handoff')
}

async function intro(handoffProps: HandoffProp[]) {
  const claimed = slips.map((_s, i) => claimProp(`slip_fly_${i}`)).filter(Boolean)
  if (claimed.length > 0 || handoffProps.length > 0) {
    const els = slips.map((_s, i) => slipEls.get(i)).filter(Boolean) as HTMLElement[]
    if (els.length > 0) {
      gsap.from(els, {
        y: -26,
        opacity: 0.45,
        duration: 0.36,
        stagger: 0.04,
        ease: 'power2.out',
      })
    }
  }
}

function play() {
  void nextTick().then(() => {
    if (phase.value === 'stack') {
      setupSlipDrags()
    } else if (phase.value === 'strike' || phase.value === 'light') {
      setupMatchDrag()
    }
  })
}

async function outro(_nextScene: SceneId): Promise<HandoffProp[]> {
  clearDrags()
  playDoorbell()

  if (cakeBoardEl.value) {
    gsap.to(cakeBoardEl.value, { opacity: 0, duration: 0.28, ease: 'power2.out' })
  }
  const allSlipNodes = Array.from(slipEls.values())
  if (allSlipNodes.length > 0) {
    gsap.to(allSlipNodes, { opacity: 0, duration: 0.28, ease: 'power2.out' })
  }
  const litOverlay = document.querySelector('.scene-11 .candlelight-overlay')
  if (litOverlay) {
    gsap.to(litOverlay, { opacity: 0, duration: 0.26 })
  }

  // 一镜到底 11→12：叮咚门铃响起，手绘紫礼盒从右侧滑入舞台中央
  handOverProp({
    id: 'purple_gift_box',
    kind: 'image',
    src: 'assets/art/gift_box.webp',
    x: 1300,
    y: 141,
    width: 462,
    height: 498,
    rotation: 6,
    opacity: 1,
    zIndex: 48,
  })

  await animateProp('purple_gift_box', {
    x: 409,
    rotation: -1.5,
    duration: 0.56,
    ease: 'back.out(1.25)',
  })

  return []
}

onMounted(() => {
  void nextTick().then(() => {
    if (!props.isUnderlay && phase.value === 'stack') {
      setupSlipDrags()
    }
  })
})

onBeforeUnmount(() => {
  clearDrags()
})

defineExpose({
  intro,
  play,
  outro,
})
</script>

<style scoped>
.scene-11 {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  overflow: hidden;
}

/* 手账跨页中缝与左侧页晕影 */
.journal-spine-shadow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  background: linear-gradient(
    90deg,
    rgba(138, 109, 83, 0.08) 0%,
    rgba(138, 109, 83, 0.02) 45%,
    rgba(92, 75, 62, 0.14) 49.4%,
    rgba(255, 252, 245, 0.18) 50.2%,
    transparent 55%
  );
}

.scene-header {
  position: absolute;
  left: 694px;
  top: 38px;
  width: 516px;
  z-index: 15;
}

.scene-title {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 32px;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.25;
}

.scene-sub {
  margin: 6px 0 0;
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--ink-soft);
}

/* 左侧蛋糕金字塔画板 */
.cake-board {
  position: absolute;
  left: 68px;
  top: 42px;
  width: 536px;
  height: 644px;
  z-index: 10;
}

.cake-board.board-lit {
  z-index: 25;
}

.cake-flourish {
  position: absolute;
  left: 88px;
  top: 580px;
  width: 360px;
  height: 44px;
  pointer-events: none;
  z-index: 6;
}

.cake-sparkles {
  position: absolute;
  inset: 0;
  width: 536px;
  height: 620px;
  pointer-events: none;
  z-index: 7;
}

.cake-pencil-silhouette {
  position: absolute;
  inset: 0;
  width: 536px;
  height: 580px;
  pointer-events: none;
  z-index: 4;
}

.silhouette-hint {
  font-family: var(--font-hand);
  font-size: 22px;
  fill: rgba(138, 109, 83, 0.72);
}

.pyramid-slot-guide {
  position: absolute;
  border: 2px dashed transparent;
  border-radius: 6px;
  background: transparent;
  opacity: 0;
  pointer-events: none;
  transition: border-color 0.25s ease, background 0.25s ease, opacity 0.25s ease;
}

.pyramid-slot-guide.is-placed {
  opacity: 0;
}

.pyramid-slot-guide.gold-guide {
  opacity: 1;
  border-color: var(--gold-glow);
  box-shadow: 0 0 0 4px rgba(242, 184, 75, 0.34);
  background: rgba(255, 246, 214, 0.56);
}

/* 顶端淡紫蜡烛 */
.cake-candle {
  position: absolute;
  left: 250px;
  top: 8px;
  width: 36px;
  height: 88px;
  z-index: 28;
  pointer-events: none;
  animation: candle-pop 0.4s cubic-bezier(0.22, 1.3, 0.36, 1);
}

.candle-body-svg {
  width: 36px;
  height: 88px;
  display: block;
}

.wick-target-ring {
  position: absolute;
  left: -1px;
  top: -10px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px dashed rgba(242, 184, 75, 0.9);
  background: rgba(255, 234, 150, 0.25);
  animation: wick-pulse 1.3s ease-in-out infinite;
}

.cake-candle.is-hover-wick .wick-target-ring {
  transform: scale(1.22);
  background: rgba(255, 224, 118, 0.45);
}

.candle-flame {
  position: absolute;
  left: -2px;
  top: -36px;
  width: 40px;
  height: 52px;
  transform-origin: 50% 88%;
  animation: flame-flicker 0.85s ease-in-out infinite alternate;
}

/* 6 张彩色手撕祝福纸条 */
.stage-slip {
  position: absolute;
  cursor: grab;
  user-select: none;
  touch-action: none;
  transition: filter 0.2s ease;
}

.stage-slip.is-dragging {
  cursor: grabbing;
  filter: drop-shadow(0 12px 20px rgba(43, 35, 29, 0.26));
}

.stage-slip.is-placed {
  cursor: default;
  pointer-events: none;
}

.stage-slip.is-lit-card {
  z-index: 26 !important;
  filter: drop-shadow(0 0 18px rgba(255, 210, 130, 0.24));
}

.slip-inner {
  position: relative;
  height: 100%;
  padding: 18px 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slip-inner.is-compact {
  padding: 15px 20px;
}

.slip-inner.has-gift-cat {
  padding-left: 72px;
}

.slip-inner.has-smile-cat {
  padding-right: 54px;
}

.doodle-gift-cat {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 46px;
  pointer-events: none;
}

.doodle-smile-cat {
  position: absolute;
  right: 12px;
  bottom: 10px;
  width: 40px;
  height: 36px;
  pointer-events: none;
}

.slip-text {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 15px;
  line-height: 1.42;
  color: #1c1410;
  text-align: left;
  word-break: break-word;
}

.slip-text-0 {
  font-size: 14px;
  line-height: 1.4;
}

.slip-text-1 {
  font-size: 14.5px;
  line-height: 1.4;
  color: #1f1412;
}

.slip-text-2,
.slip-text-3 {
  font-size: 13.5px;
  line-height: 1.32;
}

.slip-text-4 {
  font-size: 14.5px;
  line-height: 1.36;
}

.slip-text-5 {
  font-size: 14px;
  line-height: 1.3;
  text-align: center;
  white-space: nowrap;
}

/* 右侧复古闭合火柴盒区 */
.match-desk-card {
  position: absolute;
  left: 690px;
  top: 148px;
  width: 522px;
  height: 422px;
  padding: 26px 32px;
  background: rgba(250, 243, 232, 0.9);
  border: 2px dashed rgba(138, 109, 83, 0.42);
  border-radius: 18px;
  box-shadow: 0 10px 26px rgba(43, 35, 29, 0.08);
  z-index: 18;
}

.desk-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(200, 62, 59, 0.1);
  color: var(--accent-red);
  font-family: var(--font-serif-en);
  font-size: 12px;
  letter-spacing: 1.5px;
}

.desk-tip {
  margin: 12px 0 0;
  font-family: var(--font-hand);
  font-size: 23px;
  color: var(--ink);
  line-height: 1.38;
}

.matchbox-stage {
  position: absolute;
  top: 152px;
  left: 32px;
  width: 452px;
  height: 210px;
}

/* 抽屉内盒（闭盒时隐藏于盒套内，点开后向右滑出露出火柴） */
.matchbox-drawer {
  position: absolute;
  left: 6px;
  top: 14px;
  width: 316px;
  height: 146px;
  border-radius: 6px;
  background: #E2BE89;
  border: 2px solid #5A3A24;
  box-shadow: 0 6px 14px rgba(43, 35, 29, 0.16);
  display: flex;
  align-items: center;
  padding: 12px 14px;
  transform: translateX(0);
  transition: transform 0.52s cubic-bezier(0.22, 1.15, 0.36, 1);
  z-index: 2;
}

.matchbox-drawer.is-open {
  transform: translateX(122px);
}

.drawer-cavity {
  flex: 1;
  height: 100%;
  background: #BA905A;
  border-radius: 4px;
  box-shadow: inset 0 3px 8px rgba(43, 28, 16, 0.36);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.spare-match {
  display: flex;
  align-items: center;
  gap: 0;
}

.spare-wood {
  flex: 1;
  height: 6px;
  border-radius: 2px;
  background: #F4D8A8;
  border: 1px solid #8A6238;
}

.spare-head {
  width: 14px;
  height: 9px;
  border-radius: 50%;
  background: #C83E3B;
  border: 1.4px solid #2C1F17;
  margin-left: -2px;
}

.drawer-lip {
  width: 10px;
  height: 82%;
  margin-left: 8px;
  border-left: 2px solid #754E30;
}

/* 复古火柴盒外壳 */
.matchbox-prop {
  position: relative;
  width: 328px;
  height: 174px;
  border-radius: 8px;
  overflow: hidden;
  border: 2.4px solid #3c291e;
  background: #F9EEDB;
  box-shadow: 0 10px 22px rgba(43, 35, 29, 0.18);
  z-index: 4;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.matchbox-prop.is-closed {
  cursor: pointer;
}

.matchbox-prop.is-closed:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 26px rgba(43, 35, 29, 0.24);
}

.matchbox-striker {
  height: 40px;
  background-color: #623925;
  background-image: radial-gradient(rgba(36, 18, 10, 0.62) 1.5px, transparent 1.5px),
    radial-gradient(rgba(164, 102, 72, 0.45) 1.1px, transparent 1.1px);
  background-size: 9px 9px, 7px 7px;
  background-position: 0 0, 4px 4px;
  border-bottom: 2.2px solid #3c291e;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 14px;
}

.striker-label {
  font-family: var(--font-body);
  font-size: 13px;
  color: rgba(255, 240, 218, 0.92);
  letter-spacing: 2px;
}

.matchbox-vintage-cover {
  height: 130px;
  padding: 9px 11px;
  background: #FAF0DC;
}

.vintage-inner-border {
  height: 100%;
  border: 2px solid #B8352E;
  outline: 1px solid rgba(31, 53, 82, 0.55);
  outline-offset: -5px;
  padding: 7px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(255, 252, 245, 0.68);
}

.vintage-top-row {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-serif-en);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
  color: #1F3552;
}

.vintage-star {
  color: #B8352E;
}

.vintage-center-emblem {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.swallow-crest {
  width: 82px;
  height: 34px;
}

.vintage-cn {
  font-family: var(--font-brush);
  font-size: 32px;
  color: #B8352E;
  letter-spacing: 3px;
}

.vintage-bottom-row {
  text-align: center;
  font-family: var(--font-hand);
  font-size: 16px;
  color: #1F3552;
  letter-spacing: 1px;
}

.match-open-hand {
  position: absolute;
  left: 224px;
  bottom: 58px;
  z-index: 12;
}

.match-hand-hint {
  position: absolute;
  left: 112px;
  bottom: 24px;
}

/* 可拖火柴棒 */
.matchstick-wrap {
  position: absolute;
  width: 166px;
  height: 56px;
  cursor: grab;
  user-select: none;
  touch-action: none;
  z-index: 36;
  filter: drop-shadow(0 5px 8px rgba(43, 35, 29, 0.2));
}

.matchstick-wrap.is-dragging {
  cursor: grabbing;
  z-index: 44;
  filter: drop-shadow(0 12px 18px rgba(43, 35, 29, 0.3));
}

.matchstick-svg {
  width: 166px;
  height: 56px;
  display: block;
}

.match-flame-g {
  transform-origin: 140px 26px;
  animation: flame-flicker 0.65s ease-in-out infinite alternate;
}

/* 阶段四：烛光聚光灯遮罩 */
.candlelight-overlay {
  position: absolute;
  inset: 0;
  z-index: 22;
  animation: veil-fade 0.65s ease both;
}

.spotlight-veil {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    circle 330px at 336px 330px,
    rgba(255, 240, 206, 0.03) 0%,
    rgba(255, 224, 170, 0.08) 52%,
    rgba(36, 22, 14, 0.72) 78%,
    rgba(22, 13, 8, 0.89) 100%
  );
}

.candle-halo {
  position: absolute;
  left: 166px;
  top: -40px;
  width: 340px;
  height: 300px;
  pointer-events: none;
  background: radial-gradient(
    circle at 50% 45%,
    rgba(255, 218, 128, 0.34) 0%,
    rgba(255, 176, 78, 0.14) 48%,
    transparent 74%
  );
}

.lit-top-flank {
  position: absolute;
  top: 20px;
  font-family: var(--font-hand);
  font-size: 32px;
  color: #ffeec8;
  text-shadow: 0 2px 14px rgba(255, 196, 86, 0.65), 0 1px 4px rgba(0, 0, 0, 0.55);
  pointer-events: none;
  animation: rise-fade 0.7s ease both;
}

.left-flank {
  left: 170px;
}

.right-flank {
  left: 382px;
}

.lit-right-column {
  position: absolute;
  left: 704px;
  top: 238px;
  width: 484px;
  pointer-events: none;
  animation: rise-fade 0.8s 0.12s ease both;
}

.lit-kicker {
  display: inline-block;
  font-family: var(--font-serif-en);
  font-size: 13px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(242, 184, 75, 0.9);
  margin-bottom: 14px;
}

.lit-blessing {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 34px;
  line-height: 1.55;
  color: #fff4de;
  text-shadow: 0 2px 16px rgba(255, 198, 90, 0.36), 0 2px 6px rgba(0, 0, 0, 0.5);
}

.next-btn-wrap {
  position: absolute;
  right: 54px;
  bottom: 44px;
  z-index: 35;
}

@keyframes candle-pop {
  from {
    transform: translateY(14px) scale(0.75);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes wick-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.75;
  }
  50% {
    transform: scale(1.16);
    opacity: 1;
  }
}

@keyframes flame-flicker {
  from {
    transform: rotate(-3deg) scale(0.97, 1.02);
  }
  to {
    transform: rotate(3deg) scale(1.03, 0.98);
  }
}

@keyframes veil-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes rise-fade {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
