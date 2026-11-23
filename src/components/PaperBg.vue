<template>
  <div class="paper-bg" :class="`paper-${variant}`">
    <div v-if="variant === 'parchment'" class="parchment-damask" aria-hidden="true" />
    <div v-if="variant === 'kraft'" class="kraft-fibers" aria-hidden="true" />
    <div v-if="variant === 'dark'" class="dark-spotlight" aria-hidden="true" />
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'kraft' | 'parchment' | 'dark' | 'white' | 'map'
  }>(),
  { variant: 'parchment' },
)
</script>

<style scoped>
.paper-bg {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  overflow: hidden;
}

.paper-kraft {
  background-color: var(--bg-kraft);
  background-image:
    radial-gradient(ellipse at 50% 45%, rgba(255, 240, 224, 0.14) 0%, rgba(110, 82, 58, 0.24) 100%),
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.04) 0px,
      rgba(255, 255, 255, 0.04) 2px,
      rgba(95, 68, 46, 0.045) 2px,
      rgba(95, 68, 46, 0.045) 7px
    );
}

.kraft-fibers {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.015) 0px,
      rgba(255, 255, 255, 0.015) 1px,
      transparent 1px,
      transparent 6px
    ),
    radial-gradient(circle at 18% 24%, rgba(80, 56, 38, 0.05) 0 1px, transparent 1.5px),
    radial-gradient(circle at 76% 68%, rgba(80, 56, 38, 0.05) 0 1px, transparent 1.5px);
  background-size: 100% 100%, 48px 48px, 64px 64px;
}

.paper-parchment {
  background-color: var(--bg-parchment);
  background-image:
    radial-gradient(ellipse at center, rgba(255, 252, 246, 0.72) 0%, rgba(235, 217, 194, 0.42) 100%);
}

/* 复古手账淡雅暗纹墙纸（还原 frames/frame_004.0.jpg 与 frame_010.0.jpg 质感，纯 CSS 轻量渲染） */
.parchment-damask {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.24;
  background-image:
    radial-gradient(ellipse 18px 28px at 50% 50%, rgba(212, 185, 155, 0.42) 0%, rgba(212, 185, 155, 0) 70%),
    radial-gradient(circle 6px at 0% 0%, rgba(206, 178, 146, 0.35) 0%, transparent 100%),
    radial-gradient(circle 6px at 100% 0%, rgba(206, 178, 146, 0.35) 0%, transparent 100%),
    radial-gradient(circle 6px at 0% 100%, rgba(206, 178, 146, 0.35) 0%, transparent 100%),
    radial-gradient(circle 6px at 100% 100%, rgba(206, 178, 146, 0.35) 0%, transparent 100%);
  background-size: 72px 84px;
}

.paper-dark {
  background-color: var(--bg-dark);
}

.dark-spotlight {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 46% 52%, rgba(255, 232, 198, 0.22) 0%, rgba(43, 35, 29, 0.88) 62%, #1e1712 100%);
}

.paper-white {
  background-color: var(--bg-white);
  background-image: radial-gradient(circle at center, #ffffff 65%, #f7f3ed 100%);
}

.paper-map {
  background-color: var(--bg-map-sea);
}
</style>
