<template>
  <svg
    class="crumpled-flower"
    viewBox="0 0 340 410"
    :style="{ opacity: paperOpacity }"
    aria-hidden="true"
  >
    <defs>
      <clipPath :id="clipId">
        <polygon :points="outline" />
      </clipPath>
      <radialGradient :id="shadowId">
        <stop offset="0" stop-color="#624A33" stop-opacity=".32" />
        <stop offset="1" stop-color="#624A33" stop-opacity="0" />
      </radialGradient>
      <linearGradient :id="paperId" x1="0" y1=".08" x2=".82" y2="1">
        <stop stop-color="#FFF9E9" />
        <stop offset=".52" stop-color="#F3EAD7" />
        <stop offset="1" stop-color="#E1D1B5" />
      </linearGradient>
    </defs>

    <ellipse cx="170" :cy="294 + progress * 72" :rx="105 + progress * 51" ry="24" :fill="`url(#${shadowId})`" />
    <polygon :points="outline" :fill="`url(#${paperId})`" />
    <g :clip-path="`url(#${clipId})`">
      <image
        :href="src"
        x="0"
        y="0"
        width="340"
        height="410"
        preserveAspectRatio="xMidYMid meet"
        :transform="imageTransform"
        :opacity="0.18 + progress * 0.82"
      />
      <g :opacity="foldContrast">
        <polygon
          v-for="(face, index) in faces"
          :key="index"
          :points="coordinates(face.points)"
          :fill="face.light ? '#FFFCED' : '#725338'"
          :opacity="face.opacity"
        />
        <g fill="none" stroke-linecap="round" stroke-linejoin="round">
          <g v-for="(ridge, index) in ridges" :key="index">
            <polyline :points="coordinates(ridge)" stroke="#71543D" stroke-opacity=".53" stroke-width="2.6" />
            <polyline :points="coordinates(ridge)" transform="translate(-.9 -1.5)" stroke="#FFF9E9" stroke-opacity=".8" stroke-width="1.6" />
          </g>
        </g>
      </g>
    </g>
    <polygon :points="outline" fill="none" stroke="#9F8767" stroke-width="1.3" :stroke-opacity=".23 + foldContrast * .27" />
  </svg>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { clamp } from '../engine/coords'

const props = defineProps<{ src: string; progress: number }>()
const id = useId()
const clipId = `${id}-paper-clip`
const shadowId = `${id}-paper-shadow`
const paperId = `${id}-paper-fill`

// 同一张纸的 25 个节点。外缘先舒展，内侧隆起的折面随后被压平。
const crumpled = [
  [100, 111], [144, 89], [182, 103], [226, 99], [247, 127],
  [79, 147], [133, 130], [158, 160], [199, 136], [265, 166],
  [87, 208], [122, 181], [182, 200], [220, 180], [250, 228],
  [70, 245], [134, 244], [157, 216], [209, 248], [271, 258],
  [100, 278], [132, 299], [185, 280], [227, 305], [250, 278],
] as const
const flat = [
  [21, 28], [95, 22], [167, 26], [243, 21], [313, 26],
  [18, 111], [97, 111], [171, 108], [243, 116], [320, 112],
  [24, 202], [99, 195], [170, 198], [247, 204], [316, 201],
  [19, 295], [91, 292], [166, 298], [246, 293], [321, 290],
  [24, 382], [99, 388], [169, 384], [242, 390], [314, 381],
] as const

const edges = [0, 1, 2, 3, 4, 9, 14, 19, 24, 23, 22, 21, 20, 15, 10, 5]
const edgeSet = new Set(edges)
const ridges = [[0, 6, 12, 18, 24], [1, 7, 12, 17, 21], [5, 11, 17, 23], [4, 8, 12, 16, 20], [9, 13, 18, 22], [10, 16, 17, 13, 14]]

const faces = Array.from({ length: 16 }, (_, index) => {
  const row = Math.floor(index / 4)
  const column = index % 4
  const corner = row * 5 + column
  const even = (row + column) % 2 === 0
  return [
    { points: even ? [corner, corner + 1, corner + 6] : [corner, corner + 1, corner + 5], light: true, opacity: .13 + (index % 4) * .105 },
    { points: even ? [corner, corner + 6, corner + 5] : [corner + 1, corner + 6, corner + 5], light: false, opacity: .12 + (index % 5) * .11 },
  ]
}).flat()

const vertices = computed(() =>
  crumpled.map(([x, y], i) => {
    const delay = edgeSet.has(i) ? (i % 4) * .035 : .12 + (i % 3) * .055
    const t = clamp((props.progress - delay) / (1 - delay), 0, 1)
    const spread = 1 - (1 - t) ** 2
    const [flatX, flatY] = flat[i]
    return `${(x + (flatX - x) * spread).toFixed(1)},${(y + (flatY - y) * spread).toFixed(1)}`
  }),
)

function coordinates(indices: number[]): string {
  return indices.map(index => vertices.value[index]).join(' ')
}

const outline = computed(() => coordinates(edges))
const foldContrast = computed(() => (1 - props.progress) ** 1.22)
const paperOpacity = computed(() => clamp((1 - props.progress) / .12, 0, 1))
const imageTransform = computed(() => {
  const compressed = 1 - props.progress
  return `translate(170 205) rotate(${-11 * compressed}) scale(${1 - .48 * compressed} ${1 - .52 * compressed}) translate(-170 -205)`
})
</script>

<style scoped>
.crumpled-flower {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
