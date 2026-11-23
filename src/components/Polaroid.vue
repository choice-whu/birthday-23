<template>
  <div class="polaroid" :class="{ portrait: aspect === '3:4' }" :style="{ transform: `rotate(${rotation}deg)` }">
    <div class="polaroid-photo">
      <img v-if="src" :src="assetUrl(src)" :alt="caption || ''" />
      <slot v-else />
    </div>
    <div v-if="caption || $slots.caption" class="polaroid-caption">
      <slot name="caption">{{ caption }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { assetUrl } from '../engine/audio'

withDefaults(
  defineProps<{
    src?: string
    caption?: string
    aspect?: '1:1' | '3:4'
    rotation?: number
  }>(),
  {
    aspect: '1:1',
    rotation: -2,
  },
)
</script>

<style scoped>
.polaroid {
  width: 248px;
  padding: 14px 14px 36px;
  background: #FFFDF9;
  border-radius: 3px;
  box-shadow: 0 10px 24px rgba(43, 35, 29, 0.2), 0 2px 6px rgba(43, 35, 29, 0.1);
  border: 1px solid rgba(182, 150, 122, 0.3);
}

.polaroid-photo {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #EAE2D6;
  overflow: hidden;
  position: relative;
}

.polaroid.portrait .polaroid-photo {
  aspect-ratio: 3 / 4;
}

.polaroid-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.polaroid-caption {
  margin-top: 12px;
  text-align: center;
  font-family: var(--font-hand);
  font-size: 22px;
  color: var(--ink);
  line-height: 1.2;
}
</style>
