<template>
  <PixelSunglasses v-if="id === 'pixel_sunglasses'" class="acc-svg" />

  <!-- 红丝带蝴蝶结发箍 -->
  <svg v-else-if="id === 'bow_red'" viewBox="0 0 180 110" class="acc-svg" aria-hidden="true">
    <!-- 细丝绒发箍弧线 -->
    <path
      d="M28 96 C40 48, 140 48, 152 96"
      fill="none"
      stroke="#5C2026"
      stroke-width="6.5"
      stroke-linecap="round"
    />
    <path
      d="M28 96 C40 48, 140 48, 152 96"
      fill="none"
      stroke="#A8323B"
      stroke-width="3.2"
      stroke-linecap="round"
    />
    <!-- 垂落双飘带 -->
    <path
      d="M84 56 Q62 76 48 96 Q62 94 74 82 Z"
      fill="#C83E3B"
      stroke="#2C1F17"
      stroke-width="2.4"
      stroke-linejoin="round"
    />
    <path
      d="M96 56 Q118 76 132 96 Q118 94 106 82 Z"
      fill="#C83E3B"
      stroke="#2C1F17"
      stroke-width="2.4"
      stroke-linejoin="round"
    />
    <!-- 左耳结 -->
    <path
      d="M88 48 C56 12, 16 20, 22 52 C28 80, 66 64, 88 48 Z"
      fill="#DF4949"
      stroke="#2C1F17"
      stroke-width="2.6"
      stroke-linejoin="round"
    />
    <path d="M40 38 Q58 34 72 44" fill="none" stroke="rgba(255,236,228,0.55)" stroke-width="2.6" stroke-linecap="round" />
    <!-- 右耳结 -->
    <path
      d="M92 48 C124 12, 164 20, 158 52 C152 80, 114 64, 92 48 Z"
      fill="#DF4949"
      stroke="#2C1F17"
      stroke-width="2.6"
      stroke-linejoin="round"
    />
    <path d="M140 38 Q122 34 108 44" fill="none" stroke="rgba(255,236,228,0.55)" stroke-width="2.6" stroke-linecap="round" />
    <!-- 中心系扣 -->
    <ellipse cx="90" cy="48" rx="12" ry="10" fill="#B52B2B" stroke="#2C1F17" stroke-width="2.6" />
    <ellipse cx="88" cy="45" rx="4" ry="2.2" fill="rgba(255,236,228,0.5)" />
  </svg>

  <!-- 春日雏菊小花环 -->
  <svg v-else-if="id === 'flower_wreath'" viewBox="0 0 210 92" class="acc-svg" aria-hidden="true">
    <!-- 藤蔓弧线 -->
    <path
      d="M18 68 Q105 26 192 68"
      fill="none"
      stroke="#5E7B44"
      stroke-width="5.5"
      stroke-linecap="round"
    />
    <!-- 鼠尾草小绿叶 -->
    <g fill="#8BB56B" stroke="#2F4222" stroke-width="1.8">
      <ellipse cx="30" cy="60" rx="11" ry="5" transform="rotate(-26 30 60)" />
      <ellipse cx="72" cy="42" rx="11" ry="5" transform="rotate(-14 72 42)" />
      <ellipse cx="136" cy="42" rx="11" ry="5" transform="rotate(14 136 42)" />
      <ellipse cx="178" cy="60" rx="11" ry="5" transform="rotate(26 178 60)" />
    </g>
    <!-- 5 朵彩铅花 -->
    <g transform="translate(50, 52)">
      <circle v-for="a in 6" :key="`fl1-${a}`" :cx="Math.cos(a * 1.047) * 8" :cy="Math.sin(a * 1.047) * 8" r="6" fill="#FAF3E8" stroke="#3C2D22" stroke-width="1.5" />
      <circle cx="0" cy="0" r="5" fill="#F2B84B" stroke="#3C2D22" stroke-width="1.3" />
    </g>
    <g transform="translate(86, 40)">
      <circle v-for="a in 5" :key="`fl2-${a}`" :cx="Math.cos(a * 1.256) * 8.5" :cy="Math.sin(a * 1.256) * 8.5" r="6.5" fill="#F7B7C4" stroke="#3C2D22" stroke-width="1.5" />
      <circle cx="0" cy="0" r="4.8" fill="#FFE680" stroke="#3C2D22" stroke-width="1.3" />
    </g>
    <g transform="translate(122, 41)">
      <circle v-for="a in 6" :key="`fl3-${a}`" :cx="Math.cos(a * 1.047) * 8" :cy="Math.sin(a * 1.047) * 8" r="6" fill="#FFFFFF" stroke="#3C2D22" stroke-width="1.5" />
      <circle cx="0" cy="0" r="5" fill="#F29E56" stroke="#3C2D22" stroke-width="1.3" />
    </g>
    <g transform="translate(158, 52)">
      <circle v-for="a in 5" :key="`fl4-${a}`" :cx="Math.cos(a * 1.256) * 8" :cy="Math.sin(a * 1.256) * 8" r="6" fill="#C9B3E8" stroke="#3C2D22" stroke-width="1.5" />
      <circle cx="0" cy="0" r="4.6" fill="#FFE680" stroke="#3C2D22" stroke-width="1.3" />
    </g>
  </svg>

  <!-- 复古金边圆框甜酷墨镜 -->
  <svg v-else-if="id === 'glasses_round'" viewBox="0 0 180 76" class="acc-svg" aria-hidden="true">
    <path d="M8 26 L24 30 M172 26 L156 30" stroke="#A67418" stroke-width="4" stroke-linecap="round" />
    <!-- 鼻梁拱桥 -->
    <path d="M77 36 Q90 26 103 36" fill="none" stroke="#B88422" stroke-width="4" stroke-linecap="round" />
    <!-- 左右玫瑰茶色圆镜片 -->
    <circle cx="51" cy="39" r="26" fill="rgba(232, 138, 162, 0.56)" stroke="#B88422" stroke-width="4.5" />
    <circle cx="129" cy="39" r="26" fill="rgba(232, 138, 162, 0.56)" stroke="#B88422" stroke-width="4.5" />
    <circle cx="51" cy="39" r="23" fill="none" stroke="#2C1F17" stroke-width="1.2" opacity="0.45" />
    <circle cx="129" cy="39" r="23" fill="none" stroke="#2C1F17" stroke-width="1.2" opacity="0.45" />
    <!-- 镜片斜反光 -->
    <path d="M36 28 Q42 20 50 20" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="3.2" stroke-linecap="round" />
    <path d="M114 28 Q120 20 128 20" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="3.2" stroke-linecap="round" />
  </svg>

  <!-- 桃粉星光腮红贴纸 -->
  <svg v-else-if="id === 'blush_stars'" viewBox="0 0 184 74" class="acc-svg" aria-hidden="true">
    <ellipse cx="38" cy="40" rx="28" ry="15" fill="rgba(244, 114, 138, 0.58)" />
    <ellipse cx="146" cy="40" rx="28" ry="15" fill="rgba(244, 114, 138, 0.58)" />
    <!-- 手绘腮红斜纹 -->
    <g stroke="#E04860" stroke-width="2" stroke-linecap="round" opacity="0.68">
      <line x1="28" y1="35" x2="23" y2="45" />
      <line x1="38" y1="35" x2="33" y2="45" />
      <line x1="48" y1="35" x2="43" y2="45" />
      <line x1="136" y1="35" x2="131" y2="45" />
      <line x1="146" y1="35" x2="141" y2="45" />
      <line x1="156" y1="35" x2="151" y2="45" />
    </g>
    <!-- 闪亮小星星与小爱心 -->
    <polygon
      points="22,16 25,22 31,23 26,27 27,33 22,30 17,33 18,27 13,23 19,22"
      fill="#F2B84B"
      stroke="#2C1F17"
      stroke-width="1.3"
      stroke-linejoin="round"
    />
    <path
      d="M158 29 C153 25, 149 21, 149 17.5 C149 14.5, 151.5 13, 154 13 C155.8 13, 157.2 14, 158 15.5 C158.8 14, 160.2 13, 162 13 C164.5 13, 167 14.5, 167 17.5 C167 21, 163 25, 158 29 Z"
      fill="#FF5C7A"
      stroke="#2C1F17"
      stroke-width="1.3"
    />
    <circle cx="58" cy="24" r="2.8" fill="#FFE07D" stroke="#2C1F17" stroke-width="1" />
    <circle cx="128" cy="24" r="2.8" fill="#FFE07D" stroke="#2C1F17" stroke-width="1" />
  </svg>
</template>

<script setup lang="ts">
import PixelSunglasses from './PixelSunglasses.vue'

defineProps<{
  id: string
}>()
</script>

<style scoped>
.acc-svg {
  width: 100%;
  height: auto;
  display: block;
}
</style>
