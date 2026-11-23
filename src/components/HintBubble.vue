<template>
  <Transition name="bubble-pop">
    <div v-if="text" class="hint-bubble" role="status" aria-live="polite">
      <span class="bubble-dot" aria-hidden="true">♡</span>
      <span class="bubble-text">{{ text }}</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  text: string | null
}>()
</script>

<style scoped>
.hint-bubble {
  position: absolute;
  left: 50%;
  bottom: 30px;
  transform: translateX(-50%);
  z-index: 60;
  pointer-events: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 999px;
  background: rgba(255, 250, 241, 0.96);
  border: 2px solid rgba(182, 150, 122, 0.65);
  box-shadow: 0 6px 20px rgba(43, 35, 29, 0.16);
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: 24px;
  line-height: 1.2;
  white-space: nowrap;
}

.bubble-dot {
  color: var(--accent-red);
  font-size: 18px;
}

.bubble-pop-enter-active,
.bubble-pop-leave-active {
  transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.22, 1.35, 0.36, 1);
}

.bubble-pop-enter-from,
.bubble-pop-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px) scale(0.92);
}
</style>
