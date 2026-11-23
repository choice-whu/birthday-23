<template>
  <div class="torn-paper-wrap" :style="{ transform: `rotate(${rotation}deg)` }">
    <svg
      class="torn-paper-svg"
      :viewBox="`0 0 ${vbW} ${vbH}`"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <clipPath :id="clipId">
          <path :d="geometry.innerPath" />
        </clipPath>
        <linearGradient :id="gradId" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFDF8" stop-opacity="0.16" />
          <stop offset="48%" stop-color="#FFFDF8" stop-opacity="0.02" />
          <stop offset="100%" stop-color="#382414" stop-opacity="0.08" />
        </linearGradient>
      </defs>

      <!-- 外层露出的纸芯白毛边（真实手撕彩纸断裂纤维层） -->
      <path
        :d="geometry.outerPath"
        fill="#FBF5EB"
        fill-opacity="0.97"
        stroke="rgba(96, 72, 50, 0.16)"
        stroke-width="0.75"
        stroke-linejoin="round"
      />

      <!-- 内层撕裂彩纸本体 -->
      <path :d="geometry.innerPath" :fill="color" />

      <!-- 纸张光影与细微纸浆纤维纹（裁切在内层轮廓中） -->
      <g :clip-path="`url(#${clipId})`">
        <rect :x="0" :y="0" :width="vbW" :height="vbH" :fill="`url(#${gradId})`" />
        <line
          v-for="(fib, i) in geometry.fibers"
          :key="`f-${i}`"
          :x1="fib.x1"
          :y1="fib.y1"
          :x2="fib.x2"
          :y2="fib.y2"
          :stroke="fib.light ? 'rgba(255,255,255,0.14)' : 'rgba(43,31,20,0.07)'"
          :stroke-width="fib.w"
          stroke-linecap="round"
        />
        <circle
          v-for="(speck, i) in geometry.specks"
          :key="`s-${i}`"
          :cx="speck.cx"
          :cy="speck.cy"
          :r="speck.r"
          :fill="speck.light ? 'rgba(255,255,255,0.13)' : 'rgba(54,38,24,0.06)'"
        />
      </g>
    </svg>

    <div class="torn-paper-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const PAD = 18
let uidCounter = 1

const props = withDefaults(
  defineProps<{
    seed?: number
    color?: string
    rotation?: number
    width?: number
    height?: number
    variant?: number
  }>(),
  {
    seed: 1,
    color: '#FAF3E8',
    rotation: 0,
    width: 320,
    height: 96,
    variant: 0,
  },
)

const instanceUid = uidCounter++
const clipId = computed(() => `tp-clip-${props.seed}-${instanceUid}`)
const gradId = computed(() => `tp-grad-${props.seed}-${instanceUid}`)
const vbW = computed(() => Math.round(props.width) + PAD * 2)
const vbH = computed(() => Math.round(props.height) + PAD * 2)

function hashRand(i: number, salt: number): number {
  const x = Math.sin(props.seed * 127.1 + salt * 311.7 + i * 74.7) * 43758.5453123
  return x - Math.floor(x)
}

function signedHash(i: number, salt: number): number {
  return hashRand(i, salt) * 2 - 1
}

function smoothNoise(t: number, salt: number): number {
  const i0 = Math.floor(t)
  const f = t - i0
  const u = f * f * (3 - 2 * f)
  return signedHash(i0, salt) * (1 - u) + signedHash(i0 + 1, salt) * u
}

/** 根据 variant 生成更有戏剧张力的真实手撕纸大幅度起伏曲线 */
function macroProfile(edge: 'top' | 'bottom' | 'left' | 'right', t: number, variant: number): number {
  if (variant === 0) {
    // 底层宽紫纸条：大幅起伏、右上深凹谷、左右端自然斜裂
    if (edge === 'top') return -7.5 * Math.sin(t * Math.PI * 1.8) + 5.8 * Math.cos(t * Math.PI * 1.1)
    if (edge === 'bottom') return 6.4 * Math.sin(t * Math.PI * 1.5 + 0.5) - 2.4 * Math.cos(t * Math.PI * 2.6)
    if (edge === 'left') return (t - 0.5) * -13 + 5.6 * Math.sin(t * Math.PI * 1.7)
    return (t - 0.5) * 11 - 5.2 * Math.cos(t * Math.PI * 1.5)
  }
  if (variant === 1) {
    // 第2层红纸条：鲜明手撕波峰 + 右下撕纸缺口
    if (edge === 'top') return 6.8 * Math.sin(t * Math.PI * 2.1 + 0.4) - 2.6 * Math.sin(t * Math.PI * 3.4)
    if (edge === 'bottom') {
      const notch = t > 0.78 ? Math.sin(((t - 0.78) / 0.22) * Math.PI) * -12.5 : 0
      return 5.4 * Math.sin(t * Math.PI * 2.0) + notch
    }
    if (edge === 'left') return 7.4 * Math.sin(t * Math.PI * 1.5 + 0.5)
    return -8.2 * Math.sin(t * Math.PI * 1.6)
  }
  if (variant === 2) {
    // 黄纸条：左上斜翘 + 右侧撕裂倾角
    if (edge === 'top') return -6.2 * Math.sin(t * Math.PI * 1.5 - 0.3) + (t - 0.5) * 4.5
    if (edge === 'bottom') return 5.8 * Math.sin(t * Math.PI * 1.9 + 0.9)
    if (edge === 'left') return (t - 0.5) * 12 + 4.8 * Math.sin(t * Math.PI * 2)
    return (t - 0.5) * -10.5 + 5.4 * Math.cos(t * Math.PI * 1.6)
  }
  if (variant === 3) {
    // 粉纸条：斜肩不规则手撕廓形
    if (edge === 'top') return (t - 0.45) * 9.5 + 5.2 * Math.sin(t * Math.PI * 2.3)
    if (edge === 'bottom') return -5.5 * Math.sin(t * Math.PI * 1.8 + 0.4)
    return 6.2 * Math.sin(t * Math.PI * 1.8 + (edge === 'left' ? 0.2 : 1.3))
  }
  if (variant === 4) {
    // 绿纸条：山野起伏波浪上沿
    if (edge === 'top') return 7.2 * Math.sin(t * Math.PI * 2.2 + 0.2)
    if (edge === 'bottom') return 5.6 * Math.sin(t * Math.PI * 1.6 + 1.1)
    return (t - 0.5) * (edge === 'left' ? -9.5 : 9.5) + 4.8 * Math.sin(t * Math.PI * 1.9)
  }
  // variant 5 顶层短粉条
  if (edge === 'top') return -5.2 * Math.sin(t * Math.PI * 1.6 + 0.5)
  if (edge === 'bottom') return 5.4 * Math.sin(t * Math.PI * 1.8 - 0.4)
  return 5.8 * Math.sin(t * Math.PI * 1.6 + (edge === 'left' ? 0.7 : 2.1))
}

interface Pt {
  x: number
  y: number
  tGlob: number
}

function buildPolygonPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return ''
  return (
    pts
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ') + ' Z'
  )
}

const geometry = computed(() => {
  const w = Math.round(props.width)
  const h = Math.round(props.height)
  const ox = PAD
  const oy = PAD
  const v = ((props.variant % 6) + 6) % 6

  // 内缩 2px 让波峰与角落在盒内自在呼吸，外圈 PAD=12 预留白毛边与阴影空间
  const inset = 2.5
  const left = ox + inset
  const right = ox + w - inset
  const top = oy + inset
  const bottom = oy + h - inset
  const spanX = right - left
  const spanY = bottom - top

  const stepsTop = Math.max(36, Math.round(w / 4.2))
  const stepsSide = Math.max(20, Math.round(h / 4.0))

  const basePts: Pt[] = []
  let seq = 0

  const cornerFade = (t: number) => Math.sin(Math.min(1, Math.max(0, t)) * Math.PI)

  // 1. Top edge (left -> right), corner taper softens abrupt 90deg corners
  for (let i = 0; i <= stepsTop; i++) {
    const t = i / stepsTop
    const edgeDistPx = t * spanX
    const taper = Math.pow(cornerFade(t), 0.32)
    const macro = macroProfile('top', t, v) * taper
    const med = smoothNoise(edgeDistPx / 16, 11) * 4.2 * taper
    const fine = smoothNoise(edgeDistPx / 4.2, 23) * 2.1 + signedHash(seq, 31) * 0.9
    const cornerSlope = (t < 0.05 ? (0.05 - t) * 95 : 0) + (t > 0.95 ? (t - 0.95) * 95 : 0)
    basePts.push({
      x: left + t * spanX,
      y: top + macro + med + fine + cornerSlope,
      tGlob: seq++,
    })
  }

  // 2. Right edge (top -> bottom)
  for (let i = 1; i < stepsSide; i++) {
    const t = i / stepsSide
    const edgeDistPx = t * spanY
    const taper = Math.pow(cornerFade(t), 0.32)
    const macro = macroProfile('right', t, v) * taper
    const med = smoothNoise(edgeDistPx / 14 + 40, 13) * 4.5 * taper
    const fine = smoothNoise(edgeDistPx / 4.0 + 80, 29) * 2.2 + signedHash(seq, 37) * 0.95
    const cornerSlope = (t < 0.1 ? (0.1 - t) * 48 : 0) + (t > 0.9 ? (t - 0.9) * 48 : 0)
    basePts.push({
      x: right + macro + med + fine - cornerSlope,
      y: top + t * spanY,
      tGlob: seq++,
    })
  }

  // 3. Bottom edge (right -> left)
  for (let i = stepsTop; i >= 0; i--) {
    const t = i / stepsTop
    const edgeDistPx = (1 - t) * spanX
    const taper = Math.pow(cornerFade(t), 0.32)
    const macro = macroProfile('bottom', t, v) * taper
    const med = smoothNoise(edgeDistPx / 16 + 90, 17) * 4.2 * taper
    const fine = smoothNoise(edgeDistPx / 4.2 + 130, 41) * 2.1 + signedHash(seq, 43) * 0.9
    const cornerSlope = (t < 0.05 ? (0.05 - t) * 95 : 0) + (t > 0.95 ? (t - 0.95) * 95 : 0)
    basePts.push({
      x: left + t * spanX,
      y: bottom + macro + med + fine - cornerSlope,
      tGlob: seq++,
    })
  }

  // 4. Left edge (bottom -> top)
  for (let i = stepsSide - 1; i >= 1; i--) {
    const t = i / stepsSide
    const edgeDistPx = (1 - t) * spanY
    const taper = Math.pow(cornerFade(t), 0.32)
    const macro = macroProfile('left', t, v) * taper
    const med = smoothNoise(edgeDistPx / 14 + 150, 19) * 4.5 * taper
    const fine = smoothNoise(edgeDistPx / 4.0 + 190, 47) * 2.2 + signedHash(seq, 53) * 0.95
    const cornerSlope = (t < 0.1 ? (0.1 - t) * 48 : 0) + (t > 0.9 ? (t - 0.9) * 48 : 0)
    basePts.push({
      x: left + macro + med + fine + cornerSlope,
      y: top + t * spanY,
      tGlob: seq++,
    })
  }

  // 计算每点的单位外法线，分别生成「外层白纸芯毛边」与「内层彩纸边缘」
  const n = basePts.length
  const outerPts: { x: number; y: number }[] = []
  const innerPts: { x: number; y: number }[] = []

  for (let i = 0; i < n; i++) {
    const prev = basePts[(i - 1 + n) % n]
    const curr = basePts[i]
    const next = basePts[(i + 1) % n]
    const tx = next.x - prev.x
    const ty = next.y - prev.y
    const len = Math.hypot(tx, ty) || 1
    // 顺时针顶点序列下，向右/向外法线为 (ty / len, -tx / len)
    const nx = ty / len
    const ny = -tx / len

    // 加宽的真实纸芯白毛边：起伏在 2.2px ~ 6.8px 之间，带有羽状毛刺
    const rimSwell = (smoothNoise(i * 0.22, 61) * 0.5 + 0.5) * 3.1
    const rimFiber = hashRand(i, 67) * 1.95
    const outerDist = 2.2 + rimSwell + rimFiber
    outerPts.push({
      x: curr.x + nx * outerDist,
      y: curr.y + ny * outerDist,
    })

    // 内层彩纸边缘独立锯齿，形成错位撕裂层次感
    const innerJitter = signedHash(i, 73) * 1.2 + smoothNoise(i * 0.45, 79) * 0.9
    innerPts.push({
      x: curr.x + nx * innerJitter,
      y: curr.y + ny * innerJitter,
    })
  }

  // 生成少量柔和纸浆纤维与微小颗粒，增添彩纸质感
  const fibers = Array.from({ length: 18 }, (_, i) => {
    const x1 = left + hashRand(i, 101) * spanX
    const y1 = top + hashRand(i, 103) * spanY
    const ang = hashRand(i, 107) * Math.PI * 2
    const len = 5 + hashRand(i, 109) * 9
    return {
      x1,
      y1,
      x2: x1 + Math.cos(ang) * len,
      y2: y1 + Math.sin(ang) * len,
      w: 0.7 + hashRand(i, 113) * 0.6,
      light: i % 2 === 0,
    }
  })

  const specks = Array.from({ length: 14 }, (_, i) => ({
    cx: left + hashRand(i, 127) * spanX,
    cy: top + hashRand(i, 131) * spanY,
    r: 0.6 + hashRand(i, 137) * 0.9,
    light: i % 3 === 0,
  }))

  return {
    outerPath: buildPolygonPath(outerPts),
    innerPath: buildPolygonPath(innerPts),
    fibers,
    specks,
  }
})
</script>

<style scoped>
.torn-paper-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 8px rgba(46, 32, 20, 0.16)) drop-shadow(0 1px 2px rgba(46, 32, 20, 0.12));
}

.torn-paper-svg {
  position: absolute;
  left: -18px;
  top: -18px;
  width: calc(100% + 36px);
  height: calc(100% + 36px);
  display: block;
  pointer-events: none;
  overflow: visible;
}

.torn-paper-content {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
}
</style>
