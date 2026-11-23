<template>
  <svg
    v-if="variant === 'corner'"
    class="bunting bunting-corner"
    viewBox="0 0 260 66"
    aria-hidden="true"
  >
    <path d="M4,6 Q130,28 256,4" fill="none" stroke="#5A4638" stroke-width="1.6" />
    <g v-for="(flag, i) in cornerFlags" :key="i">
      <polygon
        :points="flag.points"
        :fill="flag.color"
        stroke="#4A382B"
        stroke-width="0.9"
        stroke-linejoin="round"
      />
    </g>
  </svg>

  <svg
    v-else
    class="bunting bunting-party"
    viewBox="0 0 360 88"
    aria-hidden="true"
  >
    <path d="M6,6 Q180,68 354,6" fill="none" stroke="#4D3A2D" stroke-width="2" />
    <g v-for="(flag, i) in partyFlags" :key="i">
      <polygon
        :points="flag.points"
        :fill="flag.color"
        stroke="#3A2A20"
        stroke-width="1.1"
        stroke-linejoin="round"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

withDefaults(
  defineProps<{
    variant?: 'corner' | 'party'
  }>(),
  { variant: 'corner' },
)

const cornerColors = ['#C83E3B', '#FAF3E8', '#FAF3E8', '#FAF3E8', '#FAF3E8', '#FAF3E8', '#FAF3E8', '#FAF3E8']
const partyColors = ['#C83E3B', '#2F4D6D', '#F2B84B', '#FAF3E8', '#4F8B6C', '#E86C7E', '#3A5F85', '#E6A73C', '#C83E3B', '#2F4D6D', '#F2B84B', '#4F8B6C']

function buildFlags(
  count: number,
  w: number,
  sag: number,
  flagW: number,
  flagH: number,
  colors: string[],
) {
  const list: { points: string; color: string }[] = []
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count
    const cx = 14 + t * (w - 28)
    // 二次贝塞尔曲线 y = (1-t)^2*y0 + 2(1-t)t*yc + t^2*y1
    const yTop = 6 + 2 * (1 - t) * t * sag
    const angle = Math.atan2(2 * (1 - 2 * t) * sag, w - 28)
    const half = flagW / 2
    const x1 = cx - half * Math.cos(angle)
    const y1 = yTop - half * Math.sin(angle)
    const x2 = cx + half * Math.cos(angle)
    const y2 = yTop + half * Math.sin(angle)
    const tipX = cx - flagH * Math.sin(angle)
    const tipY = yTop + flagH * Math.cos(angle)
    list.push({
      points: `${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} ${tipX.toFixed(1)},${tipY.toFixed(1)}`,
      color: colors[i % colors.length],
    })
  }
  return list
}

const cornerFlags = computed(() => buildFlags(8, 256, 22, 18, 22, cornerColors))
const partyFlags = computed(() => buildFlags(12, 354, 62, 22, 27, partyColors))
</script>

<style scoped>
.bunting {
  position: absolute;
  pointer-events: none;
  transform-origin: top center;
  animation: bunting-sway 4.8s ease-in-out infinite;
}

.bunting-corner {
  top: 0;
  right: 88px;
  width: 245px;
  height: 62px;
  z-index: 6;
}

.bunting-party {
  top: 0;
  left: 332px;
  width: 340px;
  height: 82px;
  z-index: 6;
}

@keyframes bunting-sway {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(0.9deg); }
}
</style>
