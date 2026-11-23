<template>
  <div class="scene-07">
    <div class="map-ocean-bg">
      <!-- 双比例尺地图镜头层（在华中—江南特写 zoom 5.455 与完整中国 zoom 1 之间平滑缩放） -->
      <div
        class="map-camera"
        :style="{ transform: `translate3d(${cam.x}px, ${cam.y}px, 0) scale(${cam.zoom})` }"
      >
        <img :src="assetUrl('assets/map/china.webp')" alt="中国手绘地图" class="china-map-img" />
        <img
          v-if="labelOpacity > 0"
          :src="assetUrl('assets/map/china-region.webp')"
          alt=""
          class="china-map-detail"
          :style="{ ...regionMapStyle, opacity: labelOpacity }"
        />
      </div>

      <Bunting variant="corner" />

      <!-- 屏幕坐标叠加层，航线线宽保持独立于地图缩放 -->
      <svg class="map-overlay-svg" viewBox="0 0 1280 720" aria-hidden="true">
        <!-- 已飞过的红色虚线弧形航线 -->
        <path
          v-for="seg in routeScreenPaths"
          :key="seg.id"
          :d="seg.d"
          fill="none"
          stroke="#C83E3B"
          stroke-width="3.2"
          stroke-dasharray="9 7"
          stroke-linecap="round"
        />

        <!-- 庐山、南昌等错位标签的纤细牵引线（保证红点精确落在真实地理坐标且文字不打架） -->
        <g v-if="labelOpacity > 0.02" :style="{ opacity: labelOpacity }">
          <line
            v-for="city in cityScreenList"
            :key="`ldr-${city.id}`"
            :x1="city.sx"
            :y1="city.sy"
            :x2="city.lx"
            :y2="city.ly"
            stroke="rgba(250, 243, 232, 0.78)"
            stroke-width="1.6"
            stroke-dasharray="3 3"
          />
        </g>

      </svg>

      <svg class="heart-overlay-svg" viewBox="360 120 560 436" aria-hidden="true">
        <path v-if="heartFilled" :d="HEART_SVG_PATH" fill="rgba(200, 62, 59, 0.24)" />
        <g
          ref="heartStrokeEl"
          :visibility="showHeartPath ? 'visible' : 'hidden'"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-dasharray="1"
          stroke-dashoffset="1"
        >
          <path :d="HEART_SVG_PATH" pathLength="1" stroke="rgba(255, 77, 77, 0.26)" stroke-width="13" />
          <path :d="HEART_SVG_PATH" pathLength="1" stroke="#FF4D4D" stroke-width="6.5" />
        </g>
      </svg>

      <!-- 左下角复古手绘指南针 -->
      <img
        :src="assetUrl('assets/art/compass_rose.webp')"
        alt="指南针"
        class="compass-rose"
      />

      <!-- 起点：武汉 + 6 座旅行城市图钉与错位地名卡 -->
      <div
        v-for="city in allMapNodes"
        :key="city.id"
        class="map-pin-node"
        :class="{
          origin: city.isOrigin,
          visited: visitedCityIds.has(city.id),
          'gold-hint': mistakes.glowKey.value === 'map' && currentTargetCity?.id === city.id,
          clickable: phase === 'explore' && !activeModalCity && !isFlying && !city.isOrigin,
        }"
        :style="{ transform: `translate(${city.sx}px, ${city.sy}px) translate(-50%, -50%)` }"
        @click="onTapCityPin(city.id)"
      >
        <span class="pin-ring" />
        <span class="pin-dot" />
      </div>

      <!-- 随 zoom-out 平滑淡出的地名牌（防止缩成全中国视角时文字重叠） -->
      <div
        v-for="city in allMapNodes"
        :key="`lbl-${city.id}`"
        class="city-label-pill"
        :class="{
          origin: city.isOrigin,
          visited: visitedCityIds.has(city.id),
          clickable: phase === 'explore' && !activeModalCity && !isFlying && !city.isOrigin,
        }"
        :style="{
          transform: `translate(${city.lx}px, ${city.ly}px) translateY(-50%)`,
          opacity: labelOpacity,
        }"
        @click="onTapCityPin(city.id)"
      >
        {{ city.isOrigin ? `出发 · ${city.name}` : city.name }}
      </div>

      <!-- 左上角手账线索便签（华中特写视角期间提示下一站暗号） -->
      <div v-if="phase === 'explore' && currentTargetCity" class="clue-note">
        <span class="red-pushpin" aria-hidden="true" />
        <div class="clue-meta">第 {{ cityStepIdx + 1 }} / {{ cities.length }} 站 · 寻宝暗号</div>
        <p class="clue-text">“{{ currentTargetCity.clue }}”</p>
        <p class="clue-sub">拖着小飞机飞到对的城市（或轻点目的地）</p>
      </div>

      <!-- 可拖拽 / 飞行的复古彩绘小飞机 -->
      <div
        ref="planeEl"
        class="plane-sprite"
        :class="{ 'is-draggable': phase === 'explore' && !activeModalCity && !isFlying }"
        :style="planeStyle"
      >
        <svg viewBox="0 0 88 88" class="plane-svg" aria-hidden="true">
          <!-- 复古红绿手绘小飞机 -->
          <path
            d="M44 10 C48 10, 50 18, 50 30 L78 48 L78 56 L50 47 L50 64 L61 73 L61 79 L44 74 L27 79 L27 73 L38 64 L38 47 L10 56 L10 48 L38 30 C38 18, 40 10, 44 10 Z"
            fill="#FFFDF8"
            stroke="#274C5E"
            stroke-width="3.2"
            stroke-linejoin="round"
          />
          <path d="M12 52 L38 36 M76 52 L50 36" stroke="#C83E3B" stroke-width="4" stroke-linecap="round" />
          <path d="M44 15 L44 68" stroke="#2D8C56" stroke-width="2.4" stroke-linecap="round" />
        </svg>
        <HandHint
          v-if="!isUnderlay && phase === 'explore' && !activeModalCity && cityStepIdx === 0 && !isDraggingPlane"
          mode="bob"
          class="plane-hand"
        />
      </div>

      <!-- 抵达城市后弹出的复古软木板拍立得明信片弹窗（支持多图散落与点选置前） -->
      <div v-if="activeModalCity" class="postcard-backdrop" @click.self="closeCityModal">
        <div class="postcard-board">
          <span class="board-pushpin" aria-hidden="true" />
          <div class="polaroid-fan">
            <div
              v-for="(ph, pIdx) in activeModalCity.photos"
              :key="ph.src"
              class="travel-polaroid"
              :class="{ landscape: ph.w > ph.h }"
              :style="getPolaroidStyle(pIdx, activeModalCity.photos.length)"
              @click="topPhotoIdx = pIdx"
            >
              <img :src="assetUrl(ph.src)" :alt="activeModalCity.name" class="travel-photo" />
            </div>
          </div>

          <div class="postcard-foot">
            <div class="postcard-text">
              <div class="city-date-row">
                <span class="modal-city-name">{{ activeModalCity.name }}</span>
                <span class="modal-city-date">{{ activeModalCity.date }}</span>
              </div>
              <p class="modal-city-note">{{ activeModalCity.note }}</p>
            </div>
            <button type="button" class="city-continue-btn" @click="closeCityModal">
              {{ cityStepIdx >= cities.length - 1 ? '领取登机牌 ✈' : '继续下一站 ✈' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 阶段二 A & B：2 块登机牌碎片拼合 + 按住票根往下撕 -->
      <div
        v-if="phase === 'pass-assemble' || phase === 'pass-tear'"
        class="pass-overlay"
      >
        <h3 class="pass-prompt">
          {{ phase === 'pass-assemble' ? '把两块登机牌拼合完整' : SITE_CONFIG.scene7.boardingPass.tearHint }}
        </h3>

        <div class="pass-arena">
          <!-- 左半主联（乘客 / 出发 / 目的地 / 航班 / 座位） -->
          <div
            ref="passLeftEl"
            class="pass-left"
            :class="{
              draggable: phase === 'pass-assemble',
              assembled: phase === 'pass-tear',
            }"
            :style="{
              left: `${passLeftPos.x}px`,
              top: `${passLeftPos.y}px`,
              transform: `rotate(${passLeftPos.rot}deg)`,
            }"
          >
            <div class="pass-blue-head">BOARDING PASS 登机牌</div>
            <div class="pass-left-body">
              <div class="field">
                <label>乘客 PASSENGER</label>
                <strong>{{ SITE_CONFIG.scene7.boardingPass.passenger }}</strong>
              </div>
              <div class="field-row">
                <div class="field">
                  <label>出发 FROM</label>
                  <strong>{{ SITE_CONFIG.scene7.boardingPass.from }}</strong>
                </div>
                <div class="field">
                  <label>目的地 TO</label>
                  <strong class="hand-big">{{ SITE_CONFIG.scene7.boardingPass.to }}</strong>
                </div>
              </div>
              <div class="field-row">
                <div class="field">
                  <label>座位 SEAT</label>
                  <strong>{{ SITE_CONFIG.scene7.boardingPass.seat }}</strong>
                </div>
                <div class="field">
                  <label>登机口 GATE</label>
                  <strong>随时</strong>
                </div>
                <div class="field">
                  <label>航班 FLIGHT</label>
                  <strong>{{ SITE_CONFIG.scene7.boardingPass.flight }}</strong>
                </div>
              </div>
            </div>
            <div class="perf-edge right-perf" />
          </div>

          <!-- 右半副券票根（可拼合 & 可按住往下撕） -->
          <div
            ref="passRightEl"
            class="pass-right"
            :class="{ draggable: true, assembled: phase === 'pass-tear' }"
            :style="{
              left: `${passRightPos.x}px`,
              top: `${passRightPos.y}px`,
              transform: `rotate(${passRightPos.rot}deg)`,
            }"
          >
            <div class="perf-edge left-perf" />
            <div class="pass-blue-head stub-head">ONE WAY →</div>
            <div class="pass-right-body">
              <svg viewBox="0 0 84 84" class="stub-plane-svg" aria-hidden="true">
                <path
                  d="M58 14 L52 34 L72 48 L67 54 L46 46 L36 62 L44 70 L39 74 L28 65 L19 72 L15 67 L22 57 L13 46 L17 41 L25 49 L41 39 L33 18 L39 13 L53 33 Z"
                  fill="#0D63A5"
                />
              </svg>
              <div class="stub-seat">
                <span>座位 SEAT</span>
                <strong>{{ SITE_CONFIG.scene7.boardingPass.seat }}</strong>
              </div>
            </div>
            <HandHint
              v-if="!isUnderlay && phase === 'pass-tear' && !isTearingStub"
              mode="drag-down"
              class="stub-tear-hand"
            />
          </div>
        </div>
      </div>

      <!-- 撕下后别在右下角的登机牌副券（将一镜到底 7→8 飞到中央翻转变刮刮乐） -->
      <div v-if="stubPinned" ref="pinnedStubEl" class="pinned-stub">
        <div class="pass-blue-head stub-head">ONE WAY →</div>
        <div class="pass-right-body compact">
          <svg viewBox="0 0 84 84" class="stub-plane-svg small" aria-hidden="true">
            <path
              d="M58 14 L52 34 L72 48 L67 54 L46 46 L36 62 L44 70 L39 74 L28 65 L19 72 L15 67 L22 57 L13 46 L17 41 L25 49 L41 39 L33 18 L39 13 L53 33 Z"
              fill="#0D63A5"
            />
          </svg>
          <span class="compact-seat">{{ SITE_CONFIG.scene7.boardingPass.seat }}</span>
        </div>
      </div>

      <!-- 完整中国地图中央巨型红心发光标语 -->
      <div v-if="heartFilled" class="heart-caption-wrap">
        <h2 class="heart-caption">{{ SITE_CONFIG.scene7.heartCaption }}</h2>
      </div>

      <div v-if="!isUnderlay && heartFilled" ref="nextWrapEl" class="next-wrap">
        <NextButton :label="SITE_CONFIG.scene7.nextLabel" @click="onGoNext" />
      </div>

      <HintBubble :text="mistakes.bubbleText.value" />
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import Bunting from '../components/Bunting.vue'
import HandHint from '../components/HandHint.vue'
import HintBubble from '../components/HintBubble.vue'
import NextButton from '../components/NextButton.vue'
import { useMistakes } from '../components/useMistakes'
import { SITE_CONFIG, type CityStopConfig, type SceneId } from '../config'
import { animateProp, claimProp, handOverProp } from '../director/handoff'
import type { HandoffProp, TransitionMode } from '../director/types'
import { assetUrl } from '../engine/audio'
import { clamp } from '../engine/coords'
import {
  playGentleShake,
  playPaperTearFinish,
  playPaperTearTick,
  playPetalRustle,
  playStamp,
  playTap,
  playWindChime,
} from '../engine/sfx'
import { attachStageDrag } from '../engine/useDrag'
import mapMeta from '../map-meta.json'

const props = withDefaults(
  defineProps<{
    isUnderlay?: boolean
  }>(),
  { isUnderlay: false },
)

const emit = defineEmits<{
  complete: [mode: TransitionMode]
}>()

const HEART_START = { x: 640, y: 535 }
const HEART_CURVES = [
  [500, 445, 360, 330, 395, 218],
  [428, 124, 558, 118, 640, 218],
  [722, 118, 852, 124, 885, 218],
  [920, 330, 780, 445, 640, 535],
] as const
const HEART_SVG_PATH = `M ${HEART_START.x} ${HEART_START.y} ${HEART_CURVES.map((curve) => `C ${curve.join(' ')}`).join(' ')} Z`
const region = mapMeta.region
const regionMapStyle = {
  left: `${region.x}px`,
  top: `${region.y}px`,
  width: `${mapMeta.width / region.zoom}px`,
  height: `${mapMeta.height / region.zoom}px`,
}

const mistakes = useMistakes()
const origin = SITE_CONFIG.scene7.origin
const cities = SITE_CONFIG.scene7.cities

const cam = reactive({
  zoom: region.zoom,
  x: -region.x * region.zoom,
  y: -region.y * region.zoom,
})
const labelOpacity = ref(1)

const phase = ref<'explore' | 'pass-assemble' | 'pass-tear' | 'heart'>('explore')
const cityStepIdx = ref(0)
const visitedCityIds = reactive(new Set<string>(['origin']))
const routeSegments = reactive<{ id: string; x0: number; y0: number; x1: number; y1: number }[]>([])

// 飞机位置存储在华中特写参考坐标系中，再随镜头投影到屏幕坐标
const planeZoomPos = reactive<{ x: number; y: number }>({ x: origin.x, y: origin.y })
const planeAngle = ref(45)
const isDraggingPlane = ref(false)
const isFlying = ref(false)
const activeModalCity = ref<CityStopConfig | null>(null)
const topPhotoIdx = ref(0)

// 登机牌拼合与撕票状态
const passLeftPos = reactive({ x: 38, y: 42, rot: -4 })
const passRightPos = reactive({ x: 468, y: 74, rot: 5 })
const isTearingStub = ref(false)
const stubPinned = ref(false)

// 巨型发光红心动画状态
const showHeartPath = ref(false)
const heartFilled = ref(false)

const planeEl = ref<HTMLElement | null>(null)
const passLeftEl = ref<HTMLElement | null>(null)
const passRightEl = ref<HTMLElement | null>(null)
const pinnedStubEl = ref<HTMLElement | null>(null)
const heartStrokeEl = ref<SVGGElement | null>(null)
const nextWrapEl = ref<HTMLElement | null>(null)

function toScreen(zx: number, zy: number): { x: number; y: number } {
  const bx = region.x + zx / region.zoom
  const by = region.y + zy / region.zoom
  return {
    x: bx * cam.zoom + cam.x,
    y: by * cam.zoom + cam.y,
  }
}

function planeTransform(x: number, y: number, angle: number): string {
  return `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${angle}deg)`
}

const currentTargetCity = computed(() => cities[cityStepIdx.value] ?? null)

const planeScreen = computed(() => toScreen(planeZoomPos.x, planeZoomPos.y))
const planeStyle = computed(() => ({
  transform: planeTransform(planeScreen.value.x, planeScreen.value.y, planeAngle.value),
}))

const cityScreenList = computed(() =>
  cities.map((c) => {
    const p = toScreen(c.x, c.y)
    // 庐山与南昌纵向距离仅 68px，分别向左、右错开标注并与真实红点虚线牵引
    const customOffset: Record<string, [number, number]> = {
      lushan: [-74, -6],
      nanchang: [26, 8],
    }
    const off = customOffset[c.id] ?? c.labelOffset
    return {
      ...c,
      isOrigin: false,
      sx: p.x,
      sy: p.y,
      lx: p.x + off[0],
      ly: p.y + off[1],
    }
  }),
)

const allMapNodes = computed(() => {
  const o = toScreen(origin.x, origin.y)
  return [
    {
      id: 'origin',
      name: origin.name,
      isOrigin: true,
      sx: o.x,
      sy: o.y,
      lx: o.x - 108,
      ly: o.y + 8,
    },
    ...cityScreenList.value,
  ]
})

const routeScreenPaths = computed(() =>
  routeSegments.map((seg) => {
    const p0 = toScreen(seg.x0, seg.y0)
    const p1 = toScreen(seg.x1, seg.y1)
    const mx = (p0.x + p1.x) / 2
    const my = (p0.y + p1.y) / 2 - 42
    return {
      id: seg.id,
      d: `M ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`,
    }
  }),
)

function getPolaroidStyle(idx: number, total: number) {
  const tilts = [-8, 5, -4, 7]
  const spread = total <= 2 ? 236 : 148
  const centerIdx = (total - 1) / 2
  const offsetX = (idx - centerIdx) * spread
  const offsetY = Math.abs(idx - centerIdx) * 8 - 8
  const z = topPhotoIdx.value === idx ? 20 : idx + 2
  return {
    transform: `translate(${offsetX.toFixed(0)}px, ${offsetY.toFixed(0)}px) rotate(${tilts[idx % tilts.length]}deg)`,
    zIndex: z,
  }
}

let detachPlaneDrag: (() => void) | null = null
let cleanPassHandlers: (() => void)[] = []
let heartTimeline: gsap.core.Timeline | null = null

function clearPassHandlers() {
  while (cleanPassHandlers.length) {
    cleanPassHandlers.pop()?.()
  }
}

function arriveAtCity(city: CityStopConfig) {
  if (isFlying.value || activeModalCity.value) return
  const target = currentTargetCity.value
  if (!target || city.id !== target.id) {
    playGentleShake()
    mistakes.trigger('map', `这站还没到呢，先再看看左上角线索：${target?.clue ?? ''}`)
    gsap.to(planeZoomPos, {
      x: lastCityPos().x,
      y: lastCityPos().y,
      duration: 0.42,
      ease: 'elastic.out(1, 0.58)',
    })
    return
  }

  mistakes.clear('map')
  isFlying.value = true
  const start = lastCityPos()
  const ctrlX = (start.x + city.x) / 2
  const ctrlY = (start.y + city.y) / 2 - 48
  const prog = { t: 0 }

  planeAngle.value = (Math.atan2(city.y - start.y, city.x - start.x) * 180) / Math.PI + 90
  playPetalRustle()

  gsap.to(prog, {
    t: 1,
    duration: 0.65,
    ease: 'power2.inOut',
    onUpdate() {
      const u = 1 - prog.t
      planeZoomPos.x = u * u * start.x + 2 * u * prog.t * ctrlX + prog.t * prog.t * city.x
      planeZoomPos.y = u * u * start.y + 2 * u * prog.t * ctrlY + prog.t * prog.t * city.y
    },
    onComplete() {
      planeZoomPos.x = city.x
      planeZoomPos.y = city.y
      routeSegments.push({
        id: `seg-${city.id}`,
        x0: start.x,
        y0: start.y,
        x1: city.x,
        y1: city.y,
      })
      visitedCityIds.add(city.id)
      isFlying.value = false
      topPhotoIdx.value = 0
      activeModalCity.value = city
      playTap()
    },
  })
}

function lastCityPos(): { x: number; y: number } {
  if (cityStepIdx.value <= 0) return { x: origin.x, y: origin.y }
  const prev = cities[cityStepIdx.value - 1]
  return { x: prev.x, y: prev.y }
}

function onTapCityPin(cityId: string) {
  if (props.isUnderlay || phase.value !== 'explore' || activeModalCity.value || isFlying.value) return
  if (cityId === 'origin') return
  const city = cities.find((c) => c.id === cityId)
  if (city) {
    arriveAtCity(city)
  }
}

function closeCityModal() {
  if (!activeModalCity.value) return
  playTap()
  activeModalCity.value = null
  if (cityStepIdx.value < cities.length - 1) {
    cityStepIdx.value += 1
  } else {
    enterBoardingPassAssemble()
  }
}

function enterBoardingPassAssemble() {
  phase.value = 'pass-assemble'
  detachPlaneDrag?.()
  passLeftPos.x = 34
  passLeftPos.y = 40
  passLeftPos.rot = -4
  passRightPos.x = 472
  passRightPos.y = 76
  passRightPos.rot = 5
  void nextTick().then(() => setupPassAssembleDrag())
}

function setupPassAssembleDrag() {
  clearPassHandlers()
  if (props.isUnderlay || phase.value !== 'pass-assemble') return

  const checkAssemble = () => {
    const gapX = passRightPos.x - (passLeftPos.x + 410)
    const gapY = Math.abs(passRightPos.y - passLeftPos.y)
    if (Math.abs(gapX) <= 52 && gapY <= 52) {
      clearPassHandlers()
      playStamp()
      gsap.to(passLeftPos, { x: 54, y: 46, rot: 0, duration: 0.25, ease: 'back.out(2)' })
      gsap.to(passRightPos, {
        x: 466,
        y: 46,
        rot: 0,
        duration: 0.25,
        ease: 'back.out(2)',
        onComplete: () => {
          phase.value = 'pass-tear'
          void nextTick().then(() => setupStubTearDrag())
        },
      })
    }
  }

  if (passLeftEl.value) {
    let sx = passLeftPos.x
    let sy = passLeftPos.y
    cleanPassHandlers.push(
      attachStageDrag(passLeftEl.value, {
        canStart: () => phase.value === 'pass-assemble',
        onStart() {
          sx = passLeftPos.x
          sy = passLeftPos.y
        },
        onMove(pt) {
          passLeftPos.x = clamp(sx + pt.dx, -20, 260)
          passLeftPos.y = clamp(sy + pt.dy, 0, 120)
          checkAssemble()
        },
        onEnd() {
          if (phase.value === 'pass-assemble') checkAssemble()
        },
      }),
    )
  }

  if (passRightEl.value) {
    let sx = passRightPos.x
    let sy = passRightPos.y
    cleanPassHandlers.push(
      attachStageDrag(passRightEl.value, {
        canStart: () => phase.value === 'pass-assemble',
        onStart() {
          sx = passRightPos.x
          sy = passRightPos.y
        },
        onMove(pt) {
          passRightPos.x = clamp(sx + pt.dx, 320, 560)
          passRightPos.y = clamp(sy + pt.dy, 0, 120)
          checkAssemble()
        },
        onEnd() {
          if (phase.value === 'pass-assemble') checkAssemble()
        },
      }),
    )
  }
}

function setupStubTearDrag() {
  clearPassHandlers()
  if (props.isUnderlay || !passRightEl.value || phase.value !== 'pass-tear') return

  let startY = passRightPos.y
  let lastTick = 0

  cleanPassHandlers.push(
    attachStageDrag(passRightEl.value, {
      canStart: () => phase.value === 'pass-tear',
      onStart() {
        isTearingStub.value = true
        startY = passRightPos.y
        lastTick = 0
      },
      onMove(pt) {
        const pullDown = Math.max(0, pt.dy)
        passRightPos.y = startY + pullDown
        passRightPos.rot = Math.min(10, pullDown * 0.14)
        if (pullDown - lastTick >= 16) {
          lastTick = pullDown
          playPaperTearTick(clamp(pullDown / 60, 0, 1))
        }
        if (pullDown > 52) {
          finishStubTear()
        }
      },
      onEnd(pt) {
        isTearingStub.value = false
        if (phase.value !== 'pass-tear') return
        if (pt.dy > 50) {
          finishStubTear()
        } else {
          gsap.to(passRightPos, { y: 46, rot: 0, duration: 0.35, ease: 'elastic.out(1, 0.55)' })
          mistakes.trigger('tear', '按住右边“ONE WAY →”票根往下拉撕开哦~')
        }
      },
      onCancel() {
        isTearingStub.value = false
        if (phase.value === 'pass-tear') {
          gsap.to(passRightPos, { y: 46, rot: 0, duration: 0.25 })
        }
      },
    }),
  )
}

function finishStubTear() {
  if (phase.value !== 'pass-tear') return
  clearPassHandlers()
  isTearingStub.value = false
  stubPinned.value = true
  playPaperTearFinish()
  phase.value = 'heart'
  runZoomOutAndHeartFlight()
}

function sampleHeartPath() {
  const points = [{ ...HEART_START, distance: 0 }]
  let start = HEART_START
  const samplesPerCurve = 40
  for (const [x1, y1, x2, y2, x3, y3] of HEART_CURVES) {
    for (let step = 1; step <= samplesPerCurve; step++) {
      const t = step / samplesPerCurve
      const u = 1 - t
      const x = u ** 3 * start.x + 3 * u ** 2 * t * x1 + 3 * u * t ** 2 * x2 + t ** 3 * x3
      const y = u ** 3 * start.y + 3 * u ** 2 * t * y1 + 3 * u * t ** 2 * y2 + t ** 3 * y3
      const previous = points[points.length - 1]
      points.push({ x, y, distance: previous.distance + Math.hypot(x - previous.x, y - previous.y) })
    }
    start = { x: x3, y: y3 }
  }
  return points
}

function runZoomOutAndHeartFlight() {
  const plane = planeEl.value
  const stroke = heartStrokeEl.value
  const timeline = gsap.timeline()
  heartTimeline = timeline
  timeline
    .to(cam, { zoom: 1, x: 0, y: 0, duration: 1.25, ease: 'power2.inOut' }, 0)
    .to(labelOpacity, { value: 0, duration: 0.45, ease: 'power1.out' }, 0)

  if (!plane || !stroke) {
    timeline.call(() => { heartFilled.value = true })
    return
  }

  // 轨迹与飞机共用同一条曲线，采样时无需读取 SVG 的布局或路径几何。
  const points = sampleHeartPath()
  const lastIndex = points.length - 1
  const angleBetween = (a: typeof HEART_START, b: typeof HEART_START) => Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 90
  const start = points[0]
  const pose = {
    x: region.x + planeZoomPos.x / region.zoom,
    y: region.y + planeZoomPos.y / region.zoom,
    angle: planeAngle.value,
  }
  const updatePlane = () => {
    plane.style.transform = planeTransform(pose.x, pose.y, pose.angle)
  }
  const nearestAngle = (from: number, to: number) => from + gsap.utils.wrap(-180, 180, to - from)
  const flight = { progress: 0 }
  const endAngle = angleBetween(points[lastIndex - 1], points[lastIndex])
  let segment = 1

  timeline
    .to(pose, {
      x: start.x,
      y: start.y,
      angle: nearestAngle(pose.angle, angleBetween(start, points[1])),
      duration: 0.38,
      ease: 'sine.inOut',
      onUpdate: updatePlane,
    })
    .to(flight, {
      progress: 1,
      duration: 2.1,
      ease: 'power1.inOut',
      onStart() { showHeartPath.value = true },
      onUpdate() {
        const distance = flight.progress * points[lastIndex].distance
        while (segment < lastIndex && points[segment].distance < distance) segment++
        const a = points[segment - 1]
        const b = points[segment]
        const fraction = (distance - a.distance) / (b.distance - a.distance)
        pose.x = a.x + (b.x - a.x) * fraction
        pose.y = a.y + (b.y - a.y) * fraction
        pose.angle = angleBetween(a, b)
        stroke.setAttribute('stroke-dashoffset', (1 - flight.progress).toFixed(4))
        updatePlane()
      },
      onComplete() {
        heartFilled.value = true
        playWindChime()
      },
    })
    .to(pose, { angle: nearestAngle(endAngle, 45), duration: 0.45, ease: 'power2.out', onUpdate: updatePlane })
}

function setupPlaneDrag() {
  detachPlaneDrag?.()
  if (!planeEl.value || props.isUnderlay || phase.value !== 'explore') return

  let startZX = planeZoomPos.x
  let startZY = planeZoomPos.y

  detachPlaneDrag = attachStageDrag(planeEl.value, {
    canStart: () => phase.value === 'explore' && !activeModalCity.value && !isFlying.value,
    onStart() {
      isDraggingPlane.value = true
      startZX = planeZoomPos.x
      startZY = planeZoomPos.y
      mistakes.clear('map')
    },
    onMove(pt) {
      planeZoomPos.x = startZX + pt.dx
      planeZoomPos.y = startZY + pt.dy
      if (Math.hypot(pt.stepDx, pt.stepDy) > 2) {
        planeAngle.value = (Math.atan2(pt.stepDy, pt.stepDx) * 180) / Math.PI + 90
      }
    },
    onEnd(pt) {
      isDraggingPlane.value = false
      if (pt.dist < 14) {
        gsap.to(planeZoomPos, { x: lastCityPos().x, y: lastCityPos().y, duration: 0.25 })
        return
      }
      const scr = toScreen(planeZoomPos.x, planeZoomPos.y)
      let hitCity: CityStopConfig | null = null
      let bestDist = 72
      for (const c of cityScreenList.value) {
        const d = Math.hypot(scr.x - c.sx, scr.y - c.sy)
        if (d <= bestDist) {
          bestDist = d
          hitCity = cities.find((raw) => raw.id === c.id) ?? null
        }
      }
      if (hitCity) {
        arriveAtCity(hitCity)
      } else {
        gsap.to(planeZoomPos, {
          x: lastCityPos().x,
          y: lastCityPos().y,
          duration: 0.44,
          ease: 'elastic.out(1, 0.58)',
        })
        mistakes.trigger('map', `把小飞机拖到地图上的城市红点（或直接点城市名）哦~`)
      }
    },
    onCancel() {
      isDraggingPlane.value = false
      gsap.to(planeZoomPos, { x: lastCityPos().x, y: lastCityPos().y, duration: 0.3 })
    },
  })
}

function onGoNext() {
  playTap()
  emit('complete', 'prop-handoff')
}

async function intro(handoffProps: HandoffProp[]) {
  const scroll = handoffProps.find((p) => p.id === 'wuhan_map_scroll')
  if (scroll) {
    claimProp('wuhan_map_scroll')
  }
}

function play() {
  void nextTick().then(() => {
    if (phase.value === 'explore') {
      setupPlaneDrag()
    }
  })
}

async function outro(_nextScene: SceneId): Promise<HandoffProp[]> {
  detachPlaneDrag?.()
  clearPassHandlers()
  playWindChime()

  stubPinned.value = false
  if (nextWrapEl.value) {
    gsap.to(nextWrapEl.value, { opacity: 0, duration: 0.24 })
  }

  // 一镜到底 7→8：撕下的登机牌副券飞到画面中央并 180° 翻转准备变成刮刮乐
  handOverProp({
    id: 'boarding_stub',
    kind: 'html',
    x: 942,
    y: 500,
    width: 162,
    height: 188,
    rotation: 5,
    zIndex: 48,
    html: `<div style="width:100%;height:100%;border-radius:10px;background:#FFFDF6;border:2px solid #0D63A5;overflow:hidden;box-shadow:0 16px 36px rgba(15,24,36,0.4);"><div style="height:40px;background:#0D63A5;color:#fff;font-family:monospace;font-size:15px;display:flex;align-items:center;justify-content:center;">ONE WAY →</div><div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:140px;color:#0D63A5;font-family:monospace;font-size:14px;"><strong>${SITE_CONFIG.scene7.boardingPass.seat}</strong><span style="margin-top:6px;">LUCKY TICKET</span></div></div>`,
  })

  await animateProp('boarding_stub', {
    x: 490,
    y: 205,
    width: 300,
    height: 310,
    rotation: 0,
    scale: 1.05,
    duration: 0.65,
    ease: 'power2.inOut',
  })

  return []
}

onMounted(() => {
  if (!props.isUnderlay && phase.value === 'explore') {
    setupPlaneDrag()
  }
})

onBeforeUnmount(() => {
  heartTimeline?.kill()
  detachPlaneDrag?.()
  clearPassHandlers()
})

defineExpose({
  intro,
  play,
  outro,
})
</script>

<style scoped>
.scene-07 {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  overflow: hidden;
}

.map-ocean-bg {
  position: relative;
  width: 1280px;
  height: 720px;
  background: #274C5E;
  overflow: hidden;
}

.map-camera {
  position: absolute;
  left: 0;
  top: 0;
  width: 1280px;
  height: 720px;
  transform-origin: 0 0;
  will-change: transform;
}

.china-map-img {
  width: 1280px;
  height: 720px;
  display: block;
}

.china-map-detail {
  position: absolute;
  display: block;
}

.map-overlay-svg {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  pointer-events: none;
  z-index: 12;
}

.heart-overlay-svg {
  position: absolute;
  left: 360px;
  top: 120px;
  width: 560px;
  height: 436px;
  contain: paint;
  pointer-events: none;
  z-index: 12;
}

.compass-rose {
  position: absolute;
  left: 24px;
  bottom: 18px;
  width: 112px;
  height: auto;
  z-index: 16;
  pointer-events: none;
  filter: drop-shadow(0 6px 12px rgba(10, 20, 30, 0.35));
}

.map-pin-node {
  position: absolute;
  left: 0;
  top: 0;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 18;
}

.map-pin-node.clickable {
  cursor: pointer;
}

.pin-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #C83E3B;
  border: 2.5px solid #FFFDF8;
  box-shadow: 0 3px 8px rgba(18, 12, 8, 0.4);
  transition: transform 0.2s ease, background 0.2s ease;
}

.map-pin-node.origin .pin-dot {
  background: #2D8C56;
  width: 16px;
  height: 16px;
}

.map-pin-node.visited .pin-dot {
  background: #E84A7F;
}

.map-pin-node.gold-hint .pin-ring {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid #F2B84B;
  animation: target-pulse 1.1s ease-out infinite;
}

@keyframes target-pulse {
  0% { transform: scale(0.8); opacity: 0.95; }
  100% { transform: scale(1.75); opacity: 0; }
}

.city-label-pill {
  position: absolute;
  left: 0;
  top: 0;
  padding: 2px 9px;
  border-radius: 5px;
  background: rgba(250, 243, 232, 0.94);
  border: 1px solid rgba(138, 109, 83, 0.45);
  box-shadow: 0 3px 8px rgba(24, 18, 14, 0.22);
  font-family: var(--font-hand);
  font-size: 22px;
  color: #3A2A1A;
  line-height: 1.15;
  white-space: nowrap;
  z-index: 17;
  transition: background 0.2s ease;
}

.city-label-pill.clickable {
  cursor: pointer;
}

.city-label-pill.visited {
  background: #FFF0EE;
  border-color: rgba(200, 62, 59, 0.55);
  color: #8C2522;
}

/* 左上角线索手账便签 */
.clue-note {
  position: absolute;
  left: 34px;
  top: 28px;
  width: 324px;
  padding: 18px 20px 14px;
  border-radius: 8px;
  background: rgba(255, 251, 242, 0.96);
  border: 1.5px solid rgba(182, 150, 122, 0.5);
  box-shadow: 0 12px 28px rgba(15, 22, 28, 0.34);
  transform: rotate(-1.5deg);
  z-index: 26;
}

.red-pushpin {
  position: absolute;
  left: 50%;
  top: -8px;
  width: 16px;
  height: 16px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #FF827E 0%, #C83E3B 70%, #8A1E1C 100%);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.35);
}

.clue-meta {
  font-family: monospace;
  font-size: 12px;
  color: var(--accent-red);
}

.clue-text {
  margin: 8px 0 6px;
  font-family: var(--font-hand);
  font-size: 28px;
  line-height: 1.25;
  color: var(--ink);
}

.clue-sub {
  margin: 0;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--ink-soft);
}

.plane-sprite {
  position: absolute;
  left: 0;
  top: 0;
  width: 68px;
  height: 68px;
  z-index: 24;
  pointer-events: none;
  will-change: transform;
}

.plane-sprite.is-draggable {
  pointer-events: auto;
  cursor: grab;
  touch-action: none;
}

.plane-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 6px 10px rgba(15, 24, 34, 0.45));
}

.plane-hand {
  position: absolute;
  left: 28px;
  top: 28px;
}

/* 旅行回忆软木板弹窗 */
.postcard-backdrop {
  position: absolute;
  inset: 0;
  z-index: 55;
  background: rgba(20, 32, 42, 0.52);
  display: flex;
  align-items: center;
  justify-content: center;
}

.postcard-board {
  position: relative;
  width: 720px;
  padding: 32px 34px 24px;
  border-radius: 12px;
  background: var(--bg-parchment);
  border: 2px solid #D9C4AA;
  box-shadow: 0 24px 56px rgba(12, 18, 24, 0.48);
}

.board-pushpin {
  position: absolute;
  left: 50%;
  top: -10px;
  width: 22px;
  height: 22px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(circle at 32% 32%, #FF827E 0%, #C83E3B 70%, #8A1E1C 100%);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
}

.polaroid-fan {
  position: relative;
  height: 290px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.travel-polaroid {
  position: absolute;
  width: 186px;
  height: 252px;
  padding: 10px 10px 30px;
  background: #FFFDF9;
  border-radius: 4px;
  border: 1px solid rgba(182, 150, 122, 0.42);
  box-shadow: 0 10px 24px rgba(43, 35, 29, 0.24);
  cursor: pointer;
  transition: transform 0.25s ease;
}

.travel-polaroid.landscape {
  width: 242px;
  height: 214px;
}

.travel-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.postcard-foot {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed rgba(138, 109, 83, 0.4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.city-date-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.modal-city-name {
  font-family: var(--font-hand);
  font-size: 36px;
  color: var(--ink);
}

.modal-city-date {
  font-family: monospace;
  font-size: 14px;
  color: var(--accent-red);
}

.modal-city-note {
  margin: 4px 0 0;
  font-family: var(--font-body);
  font-size: 19px;
  color: var(--ink-soft);
}

.city-continue-btn {
  flex: none;
  padding: 10px 22px;
  border-radius: 999px;
  border: 2px solid var(--accent-red);
  background: var(--accent-red);
  color: #FFFDF8;
  font-family: var(--font-hand);
  font-size: 24px;
  box-shadow: 0 6px 16px rgba(200, 62, 59, 0.3);
}

/* 登机牌拼图与撕票根 */
.pass-overlay {
  position: absolute;
  inset: 0;
  z-index: 48;
  background: rgba(20, 32, 42, 0.56);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
}

.pass-prompt {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 40px;
  font-weight: 400;
  color: #FFFDF8;
  text-shadow: 0 3px 12px rgba(0, 0, 0, 0.45);
}

.pass-arena {
  position: relative;
  width: 720px;
  height: 360px;
}

.pass-left,
.pass-right {
  position: absolute;
  height: 264px;
  border-radius: 12px;
  background: #FFFDF5;
  box-shadow: 0 18px 42px rgba(10, 18, 28, 0.42);
  overflow: hidden;
  touch-action: none;
  user-select: none;
}

.pass-left {
  width: 412px;
}

.pass-right {
  width: 198px;
}

.pass-left.draggable,
.pass-right.draggable {
  cursor: grab;
}

.pass-blue-head {
  height: 46px;
  padding: 0 18px;
  background: #0D63A5;
  color: #FFFDF8;
  font-family: monospace;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.6px;
  display: flex;
  align-items: center;
}

.stub-head {
  justify-content: center;
  font-size: 15px;
}

.pass-left-body {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-row {
  display: flex;
  gap: 22px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.field label {
  font-family: monospace;
  font-size: 11px;
  color: #6B5D50;
}

.field strong {
  font-family: var(--font-body);
  font-size: 19px;
  font-weight: 600;
  color: #1F1814;
}

.field strong.hand-big {
  font-family: var(--font-hand);
  font-size: 30px;
  line-height: 1;
}

.perf-edge {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  border-left: 2.5px dashed rgba(39, 76, 94, 0.35);
}

.right-perf { right: 0; }
.left-perf { left: 0; }

.pass-right-body {
  height: calc(100% - 46px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.stub-plane-svg {
  width: 78px;
  height: 78px;
}

.stub-seat {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: monospace;
  font-size: 12px;
  color: #5C4E41;
}

.stub-seat strong {
  font-size: 15px;
  color: #1F1814;
}

.stub-tear-hand {
  position: absolute;
  left: 72px;
  top: 20px;
}

/* 撕下后别在右下角的票根（避让右下角南海诸岛小框，两者完整同框不互相遮挡） */
.pinned-stub {
  position: absolute;
  left: 942px;
  top: 500px;
  width: 162px;
  height: 188px;
  border-radius: 10px;
  background: #FFFDF6;
  border: 2px solid #0D63A5;
  transform: rotate(5deg);
  box-shadow: 0 12px 26px rgba(15, 22, 30, 0.38);
  overflow: hidden;
  z-index: 26;
}

.pass-right-body.compact {
  height: 146px;
  gap: 6px;
}

.stub-plane-svg.small {
  width: 62px;
  height: 62px;
}

.compact-seat {
  font-family: monospace;
  font-size: 14px;
  font-weight: 700;
  color: #1F1814;
}

.heart-caption-wrap {
  position: absolute;
  left: 50%;
  top: 328px;
  transform: translate(-50%, -50%);
  z-index: 32;
  pointer-events: none;
  animation: caption-pop 0.6s ease-out;
}

@keyframes caption-pop {
  0% { opacity: 0; transform: translate(-50%, -44%) scale(0.9); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

.heart-caption {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 56px;
  font-weight: 400;
  color: #FFFDF8;
  text-shadow:
    0 0 24px rgba(255, 77, 77, 0.85),
    0 4px 16px rgba(18, 12, 8, 0.55);
  white-space: nowrap;
}

.next-wrap {
  position: absolute;
  right: 364px;
  bottom: 28px;
  z-index: 35;
}
</style>
