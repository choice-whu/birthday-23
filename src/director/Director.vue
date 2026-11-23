<template>
  <div ref="rootEl" class="director-root">
    <!-- 基于持久 slot 的双层舞台：underlay 晋升为 active 时不卸载/不重挂载，保证一镜到底零闪烁 -->
    <div
      v-for="slot in slots"
      :key="slot.key"
      class="scene-layer"
      :class="[
        slot.role === 'active' ? 'active-layer' : 'underlay-layer',
        { 'revealing-layer': slot.role === 'underlay' && revealingProps !== null },
      ]"
      :style="{ opacity: slot.opacity }"
      :aria-hidden="slot.role === 'underlay' ? 'true' : undefined"
      :inert="slot.role === 'underlay'"
    >
      <component
        :is="resolveComponent(slot.sceneId)"
        :ref="(el: unknown) => setSlotRef(slot.key, el)"
        :scene-id="slot.sceneId"
        :is-underlay="slot.role === 'underlay'"
        @prepare-underlay="onPrepareUnderlay"
        @complete="onSceneComplete"
        @jump="jumpToScene"
      />
    </div>

    <!-- 跨幕交接道具层（《Florence》一镜到底 PropLayer） -->
    <PropLayer :props="revealingProps ?? propLayerStore.props" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, type Component } from 'vue'
import type { SceneId } from '../config'
import { progressState, setSceneProgress } from '../engine/progress'
import Scene01Cover from '../scenes/Scene01Cover.vue'
import Scene02Wish from '../scenes/Scene02Wish.vue'
import Scene03Polaroid from '../scenes/Scene03Polaroid.vue'
import Scene04Toast from '../scenes/Scene04Toast.vue'
import Scene05Film from '../scenes/Scene05Film.vue'
import Scene06Flowers from '../scenes/Scene06Flowers.vue'
import Scene07Map from '../scenes/Scene07Map.vue'
import Scene08Lottery from '../scenes/Scene08Lottery.vue'
import Scene09Slot from '../scenes/Scene09Slot.vue'
import Scene10Childhood from '../scenes/Scene10Childhood.vue'
import Scene11CakeSlips from '../scenes/Scene11CakeSlips.vue'
import Scene12Gift from '../scenes/Scene12Gift.vue'
import SceneStub from '../scenes/SceneStub.vue'
import { clearProps, propLayerStore } from './handoff'
import PropLayer from './PropLayer.vue'
import type { HandoffProp, SceneExposed, TransitionMode } from './types'

interface SceneSlot {
  key: number
  sceneId: SceneId
  role: 'active' | 'underlay'
  opacity: number
}

const props = withDefaults(
  defineProps<{
    initialScene?: SceneId
  }>(),
  { initialScene: 1 },
)

const emit = defineEmits<{
  'scene-change': [scene: SceneId]
}>()

let nextSlotKey = 1
const slots = ref<SceneSlot[]>([
  { key: nextSlotKey++, sceneId: props.initialScene, role: 'active', opacity: 1 },
])
const transitioning = ref(false)
const rootEl = ref<HTMLElement | null>(null)
const revealingProps = ref<HandoffProp[] | null>(null)
const slotRefs = new Map<number, SceneExposed | null>()

const activeSlot = computed(() => slots.value.find((s) => s.role === 'active') ?? slots.value[0])

function setSlotRef(key: number, el: unknown) {
  if (el) {
    slotRefs.set(key, el as SceneExposed)
  } else {
    slotRefs.delete(key)
  }
}

function resolveComponent(id: SceneId): Component {
  if (id === 1) return Scene01Cover
  if (id === 2) return Scene02Wish
  if (id === 3) return Scene03Polaroid
  if (id === 4) return Scene04Toast
  if (id === 5) return Scene05Film
  if (id === 6) return Scene06Flowers
  if (id === 7) return Scene07Map
  if (id === 8) return Scene08Lottery
  if (id === 9) return Scene09Slot
  if (id === 10) return Scene10Childhood
  if (id === 11) return Scene11CakeSlips
  if (id === 12) return Scene12Gift
  return SceneStub
}

function onPrepareUnderlay(target: SceneId) {
  const cur = activeSlot.value
  if (!cur || target < 1 || target > 12 || target === cur.sceneId) return
  const existing = slots.value.find((s) => s.role === 'underlay' && s.sceneId === target)
  if (existing) return
  // 替换其他旧 underlay，保持与当前活跃幕同步就位
  slots.value = [
    { key: nextSlotKey++, sceneId: target, role: 'underlay', opacity: 1 },
    cur,
  ]
}

async function onSceneComplete(mode: TransitionMode = 'prop-handoff') {
  if (transitioning.value) return
  const outgoing = activeSlot.value
  if (!outgoing || outgoing.sceneId >= 12) return

  const nextId = (outgoing.sceneId + 1) as SceneId
  transitioning.value = true

  try {
    if (mode === 'tear-reveal') {
      let incoming = slots.value.find((s) => s.role === 'underlay' && s.sceneId === nextId)
      if (!incoming) {
        incoming = { key: nextSlotKey++, sceneId: nextId, role: 'underlay', opacity: 1 }
        slots.value = [incoming, outgoing]
        await nextTick()
      }
      incoming.opacity = 1
      incoming.role = 'active'
      slots.value = [incoming]
      clearProps()
      await nextTick()
      slotRefs.get(incoming.key)?.play?.({ resumed: false })
      setSceneProgress(nextId)
      emit('scene-change', nextId)
      return
    }

    // 标准 Florence 一镜到底 prop-handoff 转场
    let incoming = slots.value.find((s) => s.role === 'underlay' && s.sceneId === nextId)
    if (!incoming) {
      incoming = { key: nextSlotKey++, sceneId: nextId, role: 'underlay', opacity: 0 }
      slots.value = [incoming, outgoing]
      await nextTick()
    }

    const outgoingComp = slotRefs.get(outgoing.key)
    const handed = await outgoingComp?.outro?.(nextId)
    if (Array.isArray(handed)) {
      for (const item of handed) {
        propLayerStore.props.push(item)
      }
    }

    // 新幕盖过不透明的旧幕和飞行道具，直到完全显影，交接时舞台底色不会透出。
    revealingProps.value = [...propLayerStore.props]
    incoming.opacity = 1
    const incomingComp = slotRefs.get(incoming.key)
    const intro = incomingComp?.intro?.(propLayerStore.props)
    await nextTick()
    const reveal = rootEl.value?.querySelector('.revealing-layer')
    await Promise.all([
      intro,
      ...(reveal?.getAnimations().map((animation) => animation.finished.catch(() => {})) ?? []),
    ])

    incoming.role = 'active'
    slots.value = [incoming]
    clearProps()
    await nextTick()
    slotRefs.get(incoming.key)?.play?.({ resumed: false })
    setSceneProgress(nextId)
    emit('scene-change', nextId)
  } finally {
    revealingProps.value = null
    transitioning.value = false
  }
}

async function jumpToScene(id: SceneId, opts: { persist?: boolean } = {}) {
  if (transitioning.value) return
  clearProps()
  const fresh: SceneSlot = { key: nextSlotKey++, sceneId: id, role: 'active', opacity: 1 }
  slots.value = [fresh]
  if (opts.persist !== false) {
    setSceneProgress(id)
  }
  emit('scene-change', id)
  await nextTick()
  slotRefs.get(fresh.key)?.play?.({ resumed: id > 1 })
}

onMounted(async () => {
  await nextTick()
  const cur = activeSlot.value
  const resumed = cur.sceneId > 1 || progressState.unlockedAll
  slotRefs.get(cur.key)?.play?.({ resumed })
  emit('scene-change', cur.sceneId)
})

defineExpose({
  activeScene: computed(() => activeSlot.value.sceneId),
  jumpToScene,
})
</script>

<style scoped>
.director-root {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  overflow: hidden;
}

.scene-layer {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  transition: opacity 0.42s ease;
}

.underlay-layer {
  z-index: 10;
  pointer-events: none;
}

.active-layer {
  z-index: 20;
}

.revealing-layer {
  z-index: 50;
}
</style>
