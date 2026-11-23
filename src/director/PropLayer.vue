<template>
  <div class="prop-layer" aria-hidden="true">
    <div
      v-for="item in props"
      :key="item.id"
      class="prop-item"
      :style="{
        left: `${item.x}px`,
        top: `${item.y}px`,
        width: `${item.width}px`,
        height: `${item.height}px`,
        opacity: item.opacity ?? 1,
        zIndex: item.zIndex ?? 40,
        transform: `rotate(${item.rotation ?? 0}deg) scale(${item.scale ?? 1})`,
      }"
    >
      <DressedAvatar
        v-if="item.kind === 'dressed-avatar'"
        :hat-id="item.meta?.hatId"
        :glasses-id="item.meta?.glassesId"
        :show-stick="Boolean(item.meta?.showStick)"
        :sticker-outline="true"
      />
      <img v-else-if="item.src" :src="assetUrl(item.src)" alt="" class="prop-img" />
      <div v-else-if="item.html" class="prop-html" v-html="item.html" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DressedAvatar from '../components/DressedAvatar.vue'
import { assetUrl } from '../engine/audio'
import type { HandoffProp } from './types'

defineProps<{ props: HandoffProp[] }>()
</script>

<style scoped>
.prop-layer {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  pointer-events: none;
  z-index: 40;
  overflow: hidden;
}

.prop-item {
  position: absolute;
  transform-origin: center center;
  will-change: transform, opacity;
}

.prop-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
</style>
