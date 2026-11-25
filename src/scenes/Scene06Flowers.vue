<template>
  <div class="scene-06">
    <PaperBg variant="parchment">
      <Bunting variant="corner" />

      <!-- 阶段一：5 束代表性花束的《Florence》情绪共鸣微解谜 -->
      <template v-if="phase === 'puzzles'">
        <div class="scene-header">
          <h2 class="title-main">{{ SITE_CONFIG.scene6.stage1Title }}</h2>
          <div class="puzzle-steps">
            <span
              v-for="(pf, idx) in puzzleFlowers"
              :key="pf.id"
              class="step-pill"
              :class="{
                current: idx === puzzleIdx,
                done: idx < puzzleIdx || (idx === puzzleIdx && currentSolved),
              }"
            >
              {{ idx + 1 }} / 5
            </span>
          </div>
        </div>

        <div class="puzzle-card">
          <div class="washi-tape tape-left" aria-hidden="true" />
          <div class="washi-tape tape-right" aria-hidden="true" />

          <div
            ref="flowerStageEl"
            class="flower-visual"
            :class="{
              'is-sway': currentPuzzle.puzzleType === 'smooth' && currentSolved,
              'is-smooth-target': currentPuzzle.puzzleType === 'smooth' && !currentSolved,
            }"
          >
            <div class="flower-wad-box">
              <img
                :src="assetUrl(currentPuzzle.src)"
                :alt="currentPuzzle.title"
                class="flower-hero-img"
                :style="currentPuzzle.puzzleType === 'smooth' ? { opacity: flatFlowerOpacity } : undefined"
              />
              <CrumpledFlower
                v-if="currentPuzzle.puzzleType === 'smooth' && !currentSolved"
                :src="assetUrl(currentPuzzle.src)"
                :progress="smoothProgress"
              />
              <div v-else-if="!currentSolved" class="flower-dim-veil" />
            </div>

            <!-- 解谜 3（跨年烟花菊）：向上划出绚丽金色手绘烟花粒子 -->
            <svg
              v-if="currentPuzzle.puzzleType === 'fireworks' && currentSolved"
              class="fireworks-burst"
              viewBox="0 0 340 400"
              aria-hidden="true"
            >
              <g class="fw-burst-a" transform="translate(92, 92)">
                <circle cx="0" cy="0" r="5" fill="#FFE07D" />
                <g stroke="#F8D258" stroke-width="2.6" stroke-linecap="round">
                  <line x1="0" y1="-12" x2="0" y2="-44" />
                  <line x1="0" y1="12" x2="0" y2="44" />
                  <line x1="-12" y1="0" x2="-44" y2="0" />
                  <line x1="12" y1="0" x2="44" y2="0" />
                  <line x1="-9" y1="-9" x2="-31" y2="-31" />
                  <line x1="9" y1="-9" x2="31" y2="-31" />
                  <line x1="-9" y1="9" x2="-31" y2="31" />
                  <line x1="9" y1="9" x2="31" y2="31" />
                </g>
              </g>
              <g class="fw-burst-b" transform="translate(242, 74)">
                <circle cx="0" cy="0" r="4.5" fill="#F48AA0" />
                <g stroke="#FCE072" stroke-width="2.4" stroke-linecap="round">
                  <line x1="0" y1="-10" x2="0" y2="-36" />
                  <line x1="0" y1="10" x2="0" y2="36" />
                  <line x1="-10" y1="0" x2="-36" y2="0" />
                  <line x1="10" y1="0" x2="36" y2="0" />
                  <line x1="-7" y1="-7" x2="-25" y2="-25" />
                  <line x1="7" y1="-7" x2="25" y2="-25" />
                  <line x1="-7" y1="7" x2="-25" y2="25" />
                  <line x1="7" y1="7" x2="25" y2="25" />
                </g>
              </g>
              <g class="fw-burst-c" transform="translate(178, 52)">
                <circle cx="0" cy="0" r="4" fill="#FFF7CE" />
                <g stroke="#F48AA0" stroke-width="2.2" stroke-linecap="round">
                  <line x1="0" y1="-9" x2="0" y2="-28" />
                  <line x1="9" y1="0" x2="28" y2="0" />
                  <line x1="-9" y1="0" x2="-28" y2="0" />
                  <line x1="0" y1="9" x2="0" y2="28" />
                </g>
              </g>
            </svg>

            <!-- 解谜完成后围绕花束飘出的粉红小爱心 -->
            <div v-if="currentSolved" class="bloom-hearts" aria-hidden="true">
              <span class="mini-heart h1">♥</span>
              <span class="mini-heart h2">♥</span>
              <span class="mini-heart h3">♥</span>
            </div>
          </div>

          <!-- 右侧：花束标题 + 互动微解谜区 + 通关批注 -->
          <div class="puzzle-body">
            <div class="flower-meta">
              <span class="flower-index">No.{{ String(currentPuzzle.id).padStart(2, '0') }}</span>
              <h3 class="flower-name">{{ currentPuzzle.title }}</h3>
            </div>

            <!-- 互动区 1/5：第一束表白 · 两半心跳折线拼合 -->
            <div v-if="currentPuzzle.puzzleType === 'heartbeat'" class="mechanic-box">
              <p class="mechanic-tip">
                {{ currentSolved ? '怦然心动，粉白玫瑰为你绽放啦' : '让两半跳动的心电图碎片在一起叭' }}
              </p>
              <div class="dual-track">
                <div
                  ref="hbLeftEl"
                  class="drag-piece ecg-piece"
                  :class="{ merged: currentSolved }"
                  :style="{ left: `${dualLeftX}px` }"
                >
                  <svg viewBox="0 0 130 74" class="ecg-svg">
                    <path
                      d="M6 42 L44 42 L56 18 L70 62 L84 12 L98 42 L128 42"
                      fill="none"
                      stroke="#C83E3B"
                      stroke-width="4"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <div
                  ref="hbRightEl"
                  class="drag-piece ecg-piece"
                  :class="{ merged: currentSolved }"
                  :style="{ left: `${dualRightX}px` }"
                >
                  <svg viewBox="0 0 130 74" class="ecg-svg">
                    <path
                      d="M2 42 L34 42 L46 20 L60 58 L74 26 L86 42 L124 42"
                      fill="none"
                      stroke="#E84A7F"
                      stroke-width="4"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <HandHint v-if="!isUnderlay && !currentSolved" mode="drag-right" class="track-hand" />
              </div>
            </div>

            <!-- 互动区 2/5：第二束“对不齐鸭” · 轻抚抹平折痕 -->
            <div v-else-if="currentPuzzle.puzzleType === 'smooth'" class="mechanic-box">
              <p class="mechanic-tip">
                {{
                  currentSolved
                    ? '褶皱抚平啦，还记得吗：对不齐鸭，对不齐鸭~'
                    : '我们当然也会有争吵的时候，替我把褶皱抚平吧~'
                }}
              </p>
              <div class="smooth-meter">
                <div class="smooth-bar" :style="{ width: `${Math.round(smoothProgress * 100)}%` }" />
              </div>
              <HandHint v-if="!isUnderlay && !currentSolved" mode="bob" class="smooth-hand" />
            </div>

            <!-- 互动区 3/5：第四束跨年烟花菊 · 往上划点亮烟花 -->
            <div v-else-if="currentPuzzle.puzzleType === 'fireworks'" class="mechanic-box">
              <p v-if="currentSolved" class="mechanic-tip">零点烟花为你绽放！</p>
              <div ref="fwSwipeEl" class="swipe-up-zone" :class="{ solved: currentSolved }">
                <div class="swipe-up-arrow" :style="{ transform: `translateY(${fireworkLiftY}px)` }">
                  ↑ 往上划动放烟花
                </div>
              </div>
            </div>

            <!-- 互动区 4/5：第五束结束漫长寒假的红玫瑰 · 把小时候的两个我们拖到一起 -->
            <div v-else-if="currentPuzzle.puzzleType === 'distance'" class="mechanic-box">
              <p class="mechanic-tip">
                {{ currentSolved ? '漫长的寒假终于结束啦，飞奔抱紧你！' : '把两端的「小时候的我们」拖到一起拥抱吧~' }}
              </p>
              <div class="dual-track distance-track">
                <div class="dashed-road">
                  <span v-if="!currentSolved">漫长寒假 · 异地</span>
                </div>
                <div
                  ref="distLeftEl"
                  class="drag-piece person-avatar boy"
                  :class="{ merged: currentSolved }"
                  :style="{ left: `${dualLeftX}px` }"
                >
                  <img
                    :src="assetUrl('assets/photos/his_child_cut.webp')"
                    alt="小时候的 choice"
                    class="child-avatar-img"
                  />
                  <span class="avatar-name">{{ SITE_CONFIG.profile.myName }}</span>
                </div>
                <div
                  ref="distRightEl"
                  class="drag-piece person-avatar girl"
                  :class="{ merged: currentSolved }"
                  :style="{ left: `${dualRightX}px` }"
                >
                  <img
                    :src="assetUrl('assets/photos/her_cake_sticker.webp')"
                    alt="小时候的 guaiguai"
                    class="child-avatar-img"
                  />
                  <span class="avatar-name">{{ SITE_CONFIG.profile.herNick }}</span>
                </div>
                <div v-if="currentSolved" class="reunion-heart">♥</div>
              </div>
            </div>

            <!-- 互动区 5/5：第六束周年纪念日 · 拼合 2 块纪念卡碎片 -->
            <div v-else-if="currentPuzzle.puzzleType === 'card'" class="mechanic-box">
              <p class="mechanic-tip">
                {{ currentSolved ? '啪！一周年纪念卡拼好啦' : '把两块一周年纪念卡碎片拖动对齐' }}
              </p>
              <div class="dual-track card-track">
                <div
                  ref="cardLeftEl"
                  class="drag-piece card-frag frag-l"
                  :class="{ merged: currentSolved }"
                  :style="{ left: `${dualLeftX}px` }"
                >
                  <strong>一周年</strong>
                  <span>{{ SITE_CONFIG.profile.togetherDate }}</span>
                </div>
                <div
                  ref="cardRightEl"
                  class="drag-piece card-frag frag-r"
                  :class="{ merged: currentSolved }"
                  :style="{ left: `${dualRightX}px` }"
                >
                  <strong>纪念卡 ♥</strong>
                  <span>{{ SITE_CONFIG.profile.anniversaryDate }}</span>
                </div>
              </div>
            </div>

            <!-- 过关后揭晓真实送花备注与下一步按钮 -->
            <div v-if="currentSolved" class="remark-reveal">
              <p class="remark-text">“{{ currentPuzzle.remark }}”</p>
              <button type="button" class="puzzle-next-btn" @click="advancePuzzle">
                {{ puzzleIdx < puzzleFlowers.length - 1 ? '下一束 →' : '看看我们的十一束花架 →' }}
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- 阶段二：手绘木质花架图鉴（无白色卡片框，11 束鲜花错落有致地摆放在木架两层） -->
      <template v-else>
        <div class="gallery-header">
          <h2 class="title-main">{{ SITE_CONFIG.scene6.stage2Title }}</h2>
        </div>

        <div ref="flowerStandEl" class="flower-stand-stage">
          <!-- 手绘木质双层花架 SVG（彩铅木纹支柱 + 上下原木搁板 + 角落垂蔓绿叶装饰） -->
          <svg class="wood-stand-svg" viewBox="0 0 1192 556" aria-hidden="true">
            <defs>
              <filter id="stand-pencil" x="-2%" y="-2%" width="104%" height="104%">
                <feTurbulence type="fractalNoise" baseFrequency="0.024" numOctaves="2" seed="9" result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
              </filter>
              <linearGradient id="wood-plank-top" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#DEB687" />
                <stop offset="55%" stop-color="#CCA06D" />
                <stop offset="100%" stop-color="#B08150" />
              </linearGradient>
              <linearGradient id="wood-post" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#C89B6B" />
                <stop offset="60%" stop-color="#B48454" />
                <stop offset="100%" stop-color="#8C6038" />
              </linearGradient>
            </defs>

            <g filter="url(#stand-pencil)">
              <!-- 地面柔影 -->
              <ellipse cx="596" cy="534" rx="540" ry="12" fill="rgba(78, 56, 38, 0.11)" />

              <!-- 左右实木花架立柱（带微斜梯形手绘感） -->
              <polygon points="74,24 94,24 80,536 58,536" fill="url(#wood-post)" stroke="#6D4B2D" stroke-width="2.6" stroke-linejoin="round" />
              <polygon points="1098,24 1118,24 1134,536 1112,536" fill="url(#wood-post)" stroke="#6D4B2D" stroke-width="2.6" stroke-linejoin="round" />
              <!-- 内侧辅助纵柱 -->
              <polygon points="104,34 118,34 112,526 98,526" fill="#A6794C" stroke="#6D4B2D" stroke-width="2" />
              <polygon points="1074,34 1088,34 1094,526 1080,526" fill="#A6794C" stroke="#6D4B2D" stroke-width="2" />

              <!-- 顶部细横梁 -->
              <path d="M56 30 Q596 24 1136 30 L1134 44 Q596 39 58 44 Z" fill="url(#wood-plank-top)" stroke="#6D4B2D" stroke-width="2.4" stroke-linejoin="round" />

              <!-- 第一层木搁板（放置 01~05 束花） -->
              <g>
                <polygon points="88,224 1104,224 1116,238 76,238" fill="#E6C397" stroke="#6D4B2D" stroke-width="2.4" stroke-linejoin="round" />
                <rect x="74" y="238" width="1044" height="16" rx="3" fill="url(#wood-plank-top)" stroke="#6D4B2D" stroke-width="2.4" />
                <line x1="120" y1="246" x2="430" y2="247" stroke="#9B6E43" stroke-width="1.5" opacity="0.55" />
                <line x1="640" y1="246" x2="1020" y2="245" stroke="#9B6E43" stroke-width="1.5" opacity="0.55" />
                <!-- 搁板三角木托架 -->
                <polygon points="94,254 128,254 94,284" fill="#9D6F43" stroke="#6D4B2D" stroke-width="2" />
                <polygon points="1098,254 1064,254 1098,284" fill="#9D6F43" stroke="#6D4B2D" stroke-width="2" />
              </g>

              <!-- 第二层木搁板（放置 06~11 束花） -->
              <g>
                <polygon points="82,474 1110,474 1124,488 68,488" fill="#E6C397" stroke="#6D4B2D" stroke-width="2.4" stroke-linejoin="round" />
                <rect x="66" y="488" width="1060" height="17" rx="3" fill="url(#wood-plank-top)" stroke="#6D4B2D" stroke-width="2.4" />
                <line x1="150" y1="496" x2="540" y2="498" stroke="#9B6E43" stroke-width="1.5" opacity="0.55" />
                <line x1="710" y1="497" x2="1040" y2="496" stroke="#9B6E43" stroke-width="1.5" opacity="0.55" />
                <polygon points="88,505 124,505 88,530" fill="#9D6F43" stroke="#6D4B2D" stroke-width="2" />
                <polygon points="1104,505 1068,505 1104,530" fill="#9D6F43" stroke="#6D4B2D" stroke-width="2" />
              </g>

              <!-- 顶部角落垂下的一两簇小绿植与麻绳点缀 -->
              <g fill="#7EA66E" stroke="#4F6E43" stroke-width="1.6">
                <path d="M98 42 Q88 74 72 96" fill="none" stroke="#5E7A4B" stroke-width="2" />
                <ellipse cx="88" cy="60" rx="8" ry="4.5" transform="rotate(-35 88 60)" />
                <ellipse cx="78" cy="80" rx="7" ry="4" transform="rotate(25 78 80)" />
                <path d="M1088 42 Q1100 72 1114 94" fill="none" stroke="#5E7A4B" stroke-width="2" />
                <ellipse cx="1098" cy="62" rx="8" ry="4.5" transform="rotate(30 1098 62)" />
                <ellipse cx="1108" cy="80" rx="7" ry="4" transform="rotate(-25 1108 80)" />
              </g>
            </g>
          </svg>

          <!-- 11 束鲜花贴纸（直接摆在两层木架上，错落自然，无白色卡片边框） -->
          <button
            v-for="item in shelfItems"
            :key="item.flower.id"
            type="button"
            class="shelf-bouquet"
            :style="{
              left: `${item.x}px`,
              top: `${item.y}px`,
              width: `${item.w}px`,
              height: `${item.h}px`,
              '--tilt': `${item.rot}deg`,
            }"
            @click="openModal(item.flower.id)"
          >
            <img
              :src="assetUrl(item.flower.src)"
              :alt="item.flower.title"
              class="shelf-bouquet-img"
            />
            <!-- 别在木搁板沿上的牛皮纸小木牌（零截断） -->
            <span class="shelf-tag" :style="{ transform: `rotate(${item.tagRot}deg)` }">
              {{ item.label }}
            </span>
          </button>
        </div>

        <div v-if="!isUnderlay" ref="nextWrapEl" class="next-wrap">
          <NextButton :label="SITE_CONFIG.scene6.nextLabel" @click="onGoNext" />
        </div>
      </template>

      <!-- 点击花架任意一束弹出的高清细节卡片与批注弹窗（暖卡纸衬底凸显白色手剪边） -->
      <div v-if="activeModalFlower" class="flower-modal-backdrop" @click.self="closeModal">
        <div class="flower-modal">
          <button type="button" class="modal-close" aria-label="关闭" @click="closeModal">✕</button>
          <div class="modal-photo-box">
            <img :src="assetUrl(activeModalFlower.src)" :alt="activeModalFlower.title" class="modal-img" />
          </div>
          <div class="modal-info">
            <span class="modal-badge">第 {{ activeModalFlower.id }} / 11 束花</span>
            <h3 class="modal-title">{{ activeModalFlower.title }}</h3>
            <p class="modal-remark">{{ activeModalFlower.remark }}</p>
            <div class="modal-pager">
              <button type="button" class="pager-btn" @click="stepModal(-1)">‹ 上一束</button>
              <button type="button" class="pager-btn" @click="stepModal(1)">下一束 ›</button>
            </div>
          </div>
        </div>
      </div>

      <HintBubble :text="mistakes.bubbleText.value" />
    </PaperBg>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import Bunting from '../components/Bunting.vue'
import CrumpledFlower from '../components/CrumpledFlower.vue'
import HandHint from '../components/HandHint.vue'
import HintBubble from '../components/HintBubble.vue'
import NextButton from '../components/NextButton.vue'
import PaperBg from '../components/PaperBg.vue'
import { useMistakes } from '../components/useMistakes'
import { SITE_CONFIG, type FlowerConfig, type SceneId } from '../config'
import { animateProp, handOverProp } from '../director/handoff'
import type { HandoffProp, TransitionMode } from '../director/types'
import { assetUrl } from '../engine/audio'
import { clamp } from '../engine/coords'
import { playHeartbeat, playPetalRustle, playStamp, playTap, playWindChime } from '../engine/sfx'
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
const flowersList = SITE_CONFIG.scene6.flowers
const puzzleFlowers = flowersList.filter(
  (f): f is FlowerConfig & { puzzleType: NonNullable<FlowerConfig['puzzleType']> } =>
    Boolean(f.puzzleType),
)

// 11 束花在手绘双层木架上的自然错落摆放坐标与木牌短名（绝不出现省略号截断）
const SHELF_LAYOUT = [
  // 上层搁板（y=224..238 附近）：5 束大小与倾角各异
  { id: 1, x: 112, y: 38, w: 174, h: 196, rot: -4, tagRot: -2, label: '01 表白' },
  { id: 2, x: 318, y: 58, w: 162, h: 174, rot: 3.5, tagRot: 1.8, label: '02 对不齐鸭' },
  { id: 3, x: 506, y: 42, w: 166, h: 192, rot: -2.5, tagRot: -1.5, label: '03 陪你过生日' },
  { id: 4, x: 718, y: 38, w: 162, h: 194, rot: 4.2, tagRot: 2, label: '04 跨年烟花菊' },
  { id: 5, x: 902, y: 46, w: 168, h: 186, rot: -3, tagRot: -2.2, label: '05 寒假红玫瑰' },
  // 下层搁板（y=474..488 附近）：6 束与上层错位排列，稳稳落在实木立柱内侧，木牌间距充裕
  { id: 6, x: 112, y: 294, w: 144, h: 186, rot: 2.8, tagRot: 1.6, label: '06 周年纪念' },
  { id: 7, x: 270, y: 292, w: 158, h: 188, rot: -3.5, tagRot: -2, label: '07 白雪公主' },
  { id: 8, x: 448, y: 290, w: 144, h: 190, rot: 3.8, tagRot: 1.5, label: '08 暑假重逢' },
  { id: 9, x: 610, y: 294, w: 146, h: 186, rot: -2.5, tagRot: -1.8, label: '09 不要分开' },
  { id: 10, x: 794, y: 296, w: 146, h: 184, rot: 3.4, tagRot: 2.2, label: '10 只想让你开心' },
  { id: 11, x: 960, y: 292, w: 136, h: 188, rot: -3.8, tagRot: -1.6, label: '11 比赛顺利' },
]

const shelfItems = computed(() =>
  SHELF_LAYOUT.map((cfg) => ({
    ...cfg,
    flower: flowersList.find((f) => f.id === cfg.id) ?? flowersList[0],
  })),
)

const phase = ref<'puzzles' | 'gallery'>('puzzles')
const puzzleIdx = ref(0)
const currentSolved = ref(false)
const activeModalId = ref<number | null>(null)

const dualLeftX = ref(24)
const dualRightX = ref(300)
const smoothProgress = ref(0)
const fireworkLiftY = ref(0)

const flowerStageEl = ref<HTMLElement | null>(null)
const hbLeftEl = ref<HTMLElement | null>(null)
const hbRightEl = ref<HTMLElement | null>(null)
const fwSwipeEl = ref<HTMLElement | null>(null)
const distLeftEl = ref<HTMLElement | null>(null)
const distRightEl = ref<HTMLElement | null>(null)
const cardLeftEl = ref<HTMLElement | null>(null)
const cardRightEl = ref<HTMLElement | null>(null)
const flowerStandEl = ref<HTMLElement | null>(null)
const nextWrapEl = ref<HTMLElement | null>(null)

const currentPuzzle = computed(() => puzzleFlowers[puzzleIdx.value] ?? puzzleFlowers[0])

const activeModalFlower = computed(() =>
  activeModalId.value === null ? null : flowersList.find((f) => f.id === activeModalId.value) ?? null,
)

const flatFlowerOpacity = computed(() => clamp((smoothProgress.value - 0.88) / 0.12, 0, 1))

let cleanups: (() => void)[] = []
let smoothFinish: gsap.core.Tween | null = null

function clearPuzzleHandlers() {
  while (cleanups.length) {
    cleanups.pop()?.()
  }
}

function solveCurrentPuzzle() {
  if (currentSolved.value) return
  currentSolved.value = true
  mistakes.clear()
  clearPuzzleHandlers()

  const kind = currentPuzzle.value.puzzleType
  if (kind === 'heartbeat') {
    gsap.to(dualLeftX, { value: 94, duration: 0.25, ease: 'back.out(2)' })
    gsap.to(dualRightX, { value: 212, duration: 0.25, ease: 'back.out(2)' })
    playHeartbeat()
  } else if (kind === 'smooth') {
    smoothProgress.value = 1
    playPetalRustle()
    playWindChime()
  } else if (kind === 'fireworks') {
    fireworkLiftY.value = 0
    playWindChime()
  } else if (kind === 'distance') {
    // 小时候的 choice 与小时候的 guaiguai 依偎在一起
    gsap.to(dualLeftX, { value: 136, duration: 0.28, ease: 'back.out(1.8)' })
    gsap.to(dualRightX, { value: 216, duration: 0.28, ease: 'back.out(1.8)' })
    playHeartbeat()
    playWindChime()
  } else if (kind === 'card') {
    gsap.to(dualLeftX, { value: 92, duration: 0.24, ease: 'back.out(2)' })
    gsap.to(dualRightX, { value: 216, duration: 0.24, ease: 'back.out(2)' })
    playStamp()
  }
}

function attachDualTrackDrag(
  leftEl: HTMLElement | null,
  rightEl: HTMLElement | null,
  pieceW: number,
  thresholdGap: number,
  minHint: string,
) {
  if (leftEl) {
    let startLX = dualLeftX.value
    cleanups.push(
      attachStageDrag(leftEl, {
        canStart: () => !currentSolved.value,
        onStart() {
          startLX = dualLeftX.value
        },
        onMove(pt) {
          dualLeftX.value = clamp(startLX + pt.dx, 8, dualRightX.value - pieceW + 24)
          if (dualRightX.value - dualLeftX.value <= thresholdGap) {
            solveCurrentPuzzle()
          }
        },
        onEnd() {
          if (!currentSolved.value) {
            mistakes.trigger('puzzle', minHint)
          }
        },
      }),
    )
  }

  if (rightEl) {
    let startRX = dualRightX.value
    cleanups.push(
      attachStageDrag(rightEl, {
        canStart: () => !currentSolved.value,
        onStart() {
          startRX = dualRightX.value
        },
        onMove(pt) {
          dualRightX.value = clamp(startRX + pt.dx, dualLeftX.value + pieceW - 24, 368)
          if (dualRightX.value - dualLeftX.value <= thresholdGap) {
            solveCurrentPuzzle()
          }
        },
        onEnd() {
          if (!currentSolved.value) {
            mistakes.trigger('puzzle', minHint)
          }
        },
      }),
    )
  }
}

function setupCurrentPuzzle() {
  clearPuzzleHandlers()
  if (props.isUnderlay || phase.value !== 'puzzles' || currentSolved.value) return

  const kind = currentPuzzle.value.puzzleType
  if (kind === 'heartbeat') {
    dualLeftX.value = 18
    dualRightX.value = 304
    attachDualTrackDrag(hbLeftEl.value, hbRightEl.value, 118, 152, '把左右两半心跳折线拖到一起合拢哦~')
  } else if (kind === 'smooth') {
    smoothProgress.value = 0
    if (flowerStageEl.value) {
      let travel = 0
      let lastSfx = 0
      cleanups.push(
        attachStageDrag(flowerStageEl.value, {
          canStart: () => !currentSolved.value && smoothFinish === null,
          onMove(pt) {
            if (smoothFinish) return
            travel += Math.hypot(pt.stepDx, pt.stepDy)
            smoothProgress.value = Math.min(travel / 175, 1) * 0.92
            if (travel - lastSfx > 75) {
              lastSfx = travel
              playPetalRustle()
            }
            if (travel >= 175) {
              smoothFinish = gsap.to(smoothProgress, {
                value: 1,
                duration: 0.24,
                ease: 'sine.out',
                onComplete() {
                  smoothFinish = null
                  solveCurrentPuzzle()
                },
              })
            }
          },
          onEnd(pt) {
            if (!currentSolved.value && pt.dist < 16) {
              mistakes.trigger('puzzle', '用手在纸团花束上反复轻抚几下就能把花束展平啦~')
            }
          },
        }),
      )
    }
  } else if (kind === 'fireworks') {
    fireworkLiftY.value = 0
    const targets = [fwSwipeEl.value, flowerStageEl.value].filter((x): x is HTMLElement => Boolean(x))
    for (const el of targets) {
      cleanups.push(
        attachStageDrag(el, {
          canStart: () => !currentSolved.value,
          onMove(pt) {
            fireworkLiftY.value = clamp(pt.dy, -70, 14)
            if (pt.dy <= -58) {
              solveCurrentPuzzle()
            }
          },
          onEnd(pt) {
            if (!currentSolved.value) {
              gsap.to(fireworkLiftY, { value: 0, duration: 0.3 })
              if (pt.dy > -58) {
                mistakes.trigger('puzzle', '按住往上划动一大截就能点亮烟花啦~')
              }
            }
          },
        }),
      )
    }
  } else if (kind === 'distance') {
    dualLeftX.value = 16
    dualRightX.value = 332
    attachDualTrackDrag(distLeftEl.value, distRightEl.value, 86, 114, '把两边小时候的我们拖到中间靠在一起抱抱吧~')
  } else if (kind === 'card') {
    dualLeftX.value = 20
    dualRightX.value = 304
    attachDualTrackDrag(cardLeftEl.value, cardRightEl.value, 120, 152, '把两块一周年纪念卡拖到一起对齐拼好吧~')
  }
}

function advancePuzzle() {
  playTap()
  if (puzzleIdx.value < puzzleFlowers.length - 1) {
    puzzleIdx.value += 1
    currentSolved.value = false
    void nextTick().then(() => setupCurrentPuzzle())
  } else {
    clearPuzzleHandlers()
    phase.value = 'gallery'
  }
}

function openModal(id: number) {
  playTap()
  activeModalId.value = id
}

function closeModal() {
  playTap()
  activeModalId.value = null
}

function stepModal(delta: number) {
  if (activeModalId.value === null) return
  playTap()
  const idx = flowersList.findIndex((f) => f.id === activeModalId.value)
  const next = (idx + delta + flowersList.length) % flowersList.length
  activeModalId.value = flowersList[next].id
}

function onGoNext() {
  playTap()
  emit('complete', 'prop-handoff')
}

function play() {
  void nextTick().then(() => {
    if (phase.value === 'puzzles') {
      setupCurrentPuzzle()
    }
  })
}

async function outro(_nextScene: SceneId): Promise<HandoffProp[]> {
  clearPuzzleHandlers()
  playPetalRustle()

  if (flowerStandEl.value) {
    gsap.to(flowerStandEl.value, { y: -40, opacity: 0, duration: 0.45, ease: 'power2.in' })
  }
  if (nextWrapEl.value) {
    gsap.to(nextWrapEl.value, { opacity: 0, duration: 0.25 })
  }

  // 一镜到底 6→7：底部滑出一张“武汉出发”复古地图卷轴
  handOverProp({
    id: 'wuhan_map_scroll',
    kind: 'html',
    x: 410,
    y: 740,
    width: 460,
    height: 150,
    rotation: -2,
    zIndex: 45,
    html: `<div style="width:100%;height:100%;border-radius:10px;background:#274C5E;border:3px solid #EAD7B1;box-shadow:0 16px 36px rgba(24,18,14,0.38);display:flex;align-items:center;justify-content:center;gap:18px;color:#EAD7B1;font-family:var(--font-hand);font-size:32px;"><span style="width:14px;height:14px;border-radius:50%;background:#C83E3B;border:2px solid #fff;"></span><span>从武汉出发 · 去看看我们走过的地方</span></div>`,
  })

  await animateProp('wuhan_map_scroll', {
    y: 280,
    rotation: 0,
    scale: 1.06,
    duration: 0.62,
    ease: 'power2.out',
  })

  return []
}

onMounted(() => {
  if (!props.isUnderlay && phase.value === 'puzzles') {
    setupCurrentPuzzle()
  }
})

onBeforeUnmount(() => {
  smoothFinish?.kill()
  clearPuzzleHandlers()
})

defineExpose({
  play,
  outro,
})
</script>

<style scoped>
.scene-06 {
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
  display: flex;
  align-items: center;
  gap: 24px;
  z-index: 20;
}

.title-main {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 42px;
  font-weight: 400;
  color: var(--ink);
}

.puzzle-steps {
  display: flex;
  gap: 8px;
}

.step-pill {
  padding: 4px 12px;
  border-radius: 999px;
  border: 1.5px solid rgba(138, 109, 83, 0.32);
  background: rgba(255, 250, 241, 0.72);
  font-family: monospace;
  font-size: 13px;
  color: var(--ink-soft);
}

.step-pill.current {
  border-color: var(--accent-red);
  background: #FFF0EE;
  color: var(--accent-red);
  font-weight: 700;
}

.step-pill.done {
  border-color: #6B945E;
  background: #EFF7EC;
  color: #46693B;
}

/* 居中打开的手账单束解谜卡片 */
.puzzle-card {
  position: absolute;
  left: 158px;
  top: 120px;
  width: 964px;
  height: 534px;
  background: rgba(255, 253, 248, 0.94);
  border-radius: 12px;
  border: 1.5px solid rgba(182, 150, 122, 0.45);
  box-shadow: 0 18px 42px rgba(43, 35, 29, 0.16);
  display: grid;
  grid-template-columns: 360px 1fr;
  align-items: center;
  padding: 26px 44px;
  gap: 36px;
}

.washi-tape {
  position: absolute;
  top: -12px;
  width: 88px;
  height: 24px;
  background: rgba(242, 184, 75, 0.42);
  border: 1px solid rgba(182, 150, 122, 0.25);
  pointer-events: none;
}

.tape-left {
  left: 42px;
  transform: rotate(-8deg);
}

.tape-right {
  right: 48px;
  transform: rotate(7deg);
}

.flower-visual {
  position: relative;
  width: 340px;
  height: 410px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.42s cubic-bezier(0.22, 1.28, 0.36, 1);
  user-select: none;
}

.flower-visual.is-smooth-target {
  cursor: grab;
  touch-action: none;
}

.flower-visual.is-sway {
  animation: happy-sway 2.2s ease-in-out infinite alternate;
}

@keyframes happy-sway {
  0% { transform: rotate(-3deg) scale(1.02); }
  100% { transform: rotate(3deg) scale(1.02); }
}

.flower-wad-box {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flower-hero-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 12px 22px rgba(43, 35, 29, 0.18));
  pointer-events: none;
}

.flower-dim-veil {
  position: absolute;
  inset: 14px;
  border-radius: 20px;
  background: radial-gradient(circle, rgba(250, 243, 232, 0.28) 0%, rgba(250, 243, 232, 0.08) 100%);
  pointer-events: none;
}

.fireworks-burst {
  position: absolute;
  inset: -16px;
  width: 372px;
  height: 440px;
  pointer-events: none;
  animation: fw-pop 0.65s ease-out forwards;
}

@keyframes fw-pop {
  0% { opacity: 0; transform: scale(0.45); }
  70% { opacity: 1; transform: scale(1.08); }
  100% { opacity: 0.96; transform: scale(1); }
}

.bloom-hearts {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.mini-heart {
  position: absolute;
  font-size: 24px;
  color: #E84A7F;
  animation: heart-float 1.6s ease-out infinite;
}

.mini-heart.h1 { left: 24px; top: 36px; animation-delay: 0s; }
.mini-heart.h2 { right: 26px; top: 22px; animation-delay: 0.35s; }
.mini-heart.h3 { right: 38px; bottom: 86px; animation-delay: 0.7s; }

@keyframes heart-float {
  0% { opacity: 0.3; transform: translateY(8px) scale(0.85); }
  50% { opacity: 1; transform: translateY(-10px) scale(1.1); }
  100% { opacity: 0.2; transform: translateY(-20px) scale(0.95); }
}

.puzzle-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.flower-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.flower-index {
  font-family: monospace;
  font-size: 14px;
  color: var(--accent-red);
  letter-spacing: 1px;
}

.flower-name {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 40px;
  font-weight: 400;
  color: var(--ink);
}

.mechanic-box {
  position: relative;
  padding: 16px 20px;
  border-radius: 10px;
  background: rgba(250, 243, 232, 0.85);
  border: 1.5px dashed rgba(138, 109, 83, 0.4);
}

.mechanic-tip {
  margin: 0 0 12px;
  font-family: var(--font-body);
  font-size: 19px;
  color: var(--ink-soft);
}

.dual-track {
  position: relative;
  width: 446px;
  height: 92px;
  border-radius: 10px;
  background: rgba(255, 253, 248, 0.92);
  border: 1px solid rgba(182, 150, 122, 0.35);
}

/* 异地小情侣童年贴纸轨道：加高留出充足头像空间 */
.dual-track.distance-track {
  height: 118px;
}

.drag-piece {
  position: absolute;
  top: 9px;
  height: 74px;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.drag-piece.merged {
  cursor: default;
}

.ecg-piece {
  width: 130px;
}

.ecg-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.track-hand {
  position: absolute;
  left: 96px;
  top: 26px;
}

.smooth-meter {
  width: 100%;
  height: 14px;
  border-radius: 999px;
  background: rgba(182, 150, 122, 0.24);
  overflow: hidden;
}

.smooth-bar {
  height: 100%;
  background: linear-gradient(90deg, #F2B84B 0%, #E84A7F 100%);
  transition: width 0.08s linear;
}

.smooth-hand {
  position: absolute;
  left: -120px;
  top: -10px;
}

.swipe-up-zone {
  height: 92px;
  border-radius: 10px;
  background: rgba(39, 76, 94, 0.08);
  border: 1.5px dashed rgba(39, 76, 94, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.swipe-up-zone.solved {
  background: rgba(242, 184, 75, 0.16);
  border-color: #D89828;
}

.swipe-up-arrow {
  font-family: var(--font-hand);
  font-size: 28px;
  color: var(--ink);
  transition: transform 0.08s linear;
}

.distance-track .dashed-road {
  position: absolute;
  left: 56px;
  right: 56px;
  top: 46%;
  transform: translateY(-50%);
  border-top: 2.5px dashed rgba(200, 62, 59, 0.45);
  text-align: center;
}

.distance-track .dashed-road span {
  position: relative;
  top: -12px;
  padding: 0 8px;
  background: #FFFDF8;
  font-size: 13px;
  color: var(--ink-soft);
}

/* 小时候的 choice & 佳奇 真实贴纸头像 */
.person-avatar {
  top: 6px;
  width: 92px;
  height: 104px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
}

.child-avatar-img {
  max-width: 86px;
  max-height: 78px;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 5px 10px rgba(43, 35, 29, 0.24));
  pointer-events: none;
}

.avatar-name {
  font-family: var(--font-hand);
  font-size: 18px;
  line-height: 1;
  color: var(--ink);
}

.reunion-heart {
  position: absolute;
  left: 206px;
  top: 4px;
  font-size: 28px;
  color: #C83E3B;
  animation: pop-heart 0.45s ease-out;
}

@keyframes pop-heart {
  0% { transform: scale(0.4); opacity: 0; }
  65% { transform: scale(1.25); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.card-frag {
  top: 11px;
  width: 126px;
  height: 70px;
  border-radius: 6px;
  border: 2px solid #D9B78F;
  background: #FFFDF7;
  box-shadow: 0 4px 12px rgba(43, 35, 29, 0.14);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.card-frag.frag-l {
  transform: rotate(-4deg);
}

.card-frag.frag-r {
  transform: rotate(5deg);
}

.card-frag.merged {
  transform: rotate(0deg);
  border-color: #C83E3B;
}

.card-frag strong {
  font-family: var(--font-hand);
  font-size: 22px;
  font-weight: 400;
  color: var(--ink);
}

.card-frag span {
  font-family: monospace;
  font-size: 12px;
  color: var(--accent-red);
}

.remark-reveal {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  animation: fade-in-up 0.4s ease;
}

@keyframes fade-in-up {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

.remark-text {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 29px;
  line-height: 1.45;
  color: var(--ink);
}

.puzzle-next-btn {
  padding: 10px 24px;
  border-radius: 999px;
  border: 2px solid var(--accent-red);
  background: var(--accent-red);
  color: #FFFDF8;
  font-family: var(--font-hand);
  font-size: 25px;
  box-shadow: 0 6px 16px rgba(200, 62, 59, 0.28);
}

/* 阶段二：手绘木质双层花架图鉴（无白色卡片，鲜花直接摆在木搁板上错落陈列） */
.gallery-header {
  position: absolute;
  left: 68px;
  top: 32px;
  z-index: 20;
}

.flower-stand-stage {
  position: absolute;
  left: 44px;
  top: 94px;
  width: 1192px;
  height: 556px;
}

.wood-stand-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.shelf-bouquet {
  position: absolute;
  padding: 0;
  border: none;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  z-index: 6;
  cursor: pointer;
  transform: rotate(var(--tilt, 0deg));
  transition: transform 0.22s cubic-bezier(0.22, 1.25, 0.36, 1), filter 0.2s ease;
}

.shelf-bouquet:hover {
  transform: translateY(-6px) rotate(var(--tilt, 0deg)) scale(1.06);
  z-index: 12;
}

.shelf-bouquet-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 8px 14px rgba(58, 38, 22, 0.24));
  pointer-events: none;
}

/* 钉在木搁板沿下的手写牛皮纸小木牌（简洁直白，零省略号） */
.shelf-tag {
  position: absolute;
  bottom: -24px;
  padding: 2px 10px;
  border-radius: 5px;
  background: #F6EAD5;
  border: 1px solid rgba(138, 109, 83, 0.52);
  box-shadow: 0 3px 8px rgba(43, 35, 29, 0.16);
  font-family: var(--font-hand);
  font-size: 20px;
  line-height: 1.15;
  color: var(--ink);
  white-space: nowrap;
  pointer-events: none;
}

.next-wrap {
  position: absolute;
  right: 44px;
  bottom: 22px;
  z-index: 30;
}

/* 详情弹窗：暖麻布牛皮底衬出花束手剪白边 */
.flower-modal-backdrop {
  position: absolute;
  inset: 0;
  z-index: 60;
  background: rgba(36, 29, 24, 0.56);
  display: flex;
  align-items: center;
  justify-content: center;
}

.flower-modal {
  position: relative;
  width: 760px;
  padding: 28px 34px;
  border-radius: 14px;
  background: var(--bg-parchment);
  border: 2px solid rgba(138, 109, 83, 0.52);
  box-shadow: 0 22px 54px rgba(22, 16, 11, 0.36);
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 28px;
  align-items: center;
}

.modal-close {
  position: absolute;
  right: 16px;
  top: 12px;
  border: none;
  background: transparent;
  font-size: 22px;
  color: var(--ink-soft);
}

.modal-photo-box {
  height: 330px;
  border-radius: 10px;
  background: #EFE2CE;
  border: 1.5px dashed rgba(138, 109, 83, 0.42);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.modal-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 8px 16px rgba(43, 35, 29, 0.22));
}

.modal-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-badge {
  font-family: monospace;
  font-size: 13px;
  color: var(--accent-red);
}

.modal-title {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 38px;
  font-weight: 400;
  color: var(--ink);
}

.modal-remark {
  margin: 0;
  font-family: var(--font-body);
  font-size: 20px;
  line-height: 1.6;
  color: var(--ink-soft);
}

.modal-pager {
  margin-top: 10px;
  display: flex;
  gap: 12px;
}

.pager-btn {
  padding: 6px 16px;
  border-radius: 999px;
  border: 1.5px solid rgba(138, 109, 83, 0.45);
  background: #FFFDF8;
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--ink);
}
</style>
