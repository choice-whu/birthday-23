<template>
  <div class="hand-hint" :class="`mode-${mode}`" aria-hidden="true">
    <svg class="hand-svg" viewBox="0 0 80 86">
      <!-- 暖色投影 -->
      <path
        d="M31 12 C31 6, 40 6, 40 12 L40 34 C43 31, 49 32, 50 37 C53 34, 59 35, 60 40 C63 38, 69 40, 69 46 L68 58 C68 71, 57 78, 43 78 C31 78, 22 69, 17 58 C13 51, 12 45, 16 42 C20 39, 25 43, 28 49 L31 53 Z"
        fill="rgba(75, 48, 32, 0.28)"
        transform="translate(2, 4)"
      />
      <!-- 卡通指向手掌本体 -->
      <path
        d="M31 12 C31 6, 40 6, 40 12 L40 34 C43 31, 49 32, 50 37 C53 34, 59 35, 60 40 C63 38, 69 40, 69 46 L68 58 C68 71, 57 78, 43 78 C31 78, 22 69, 17 58 C13 51, 12 45, 16 42 C20 39, 25 43, 28 49 L31 53 Z"
        fill="#FFF6E5"
        stroke="#2C1F17"
        stroke-width="3.2"
        stroke-linejoin="round"
      />
      <!-- 指节细节与袖口/掌心红晕 -->
      <ellipse cx="44" cy="63" rx="13" ry="6.5" fill="#FAD2CE" opacity="0.65" />
      <line x1="40" y1="34" x2="40" y2="45" stroke="#2C1F17" stroke-width="2.4" stroke-linecap="round" />
      <line x1="50" y1="37" x2="50" y2="47" stroke="#2C1F17" stroke-width="2.4" stroke-linecap="round" />
      <line x1="60" y1="40" x2="60" y2="49" stroke="#2C1F17" stroke-width="2.4" stroke-linecap="round" />
    </svg>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    mode?: 'bob' | 'drag-right' | 'drag-down' | 'press'
  }>(),
  { mode: 'bob' },
)
</script>

<style scoped>
.hand-hint {
  width: 58px;
  height: 64px;
  pointer-events: none;
  z-index: 30;
}

.hand-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.mode-bob {
  animation: hand-bob 1.5s ease-in-out infinite;
}

.mode-drag-right {
  animation: hand-drag-right 1.8s ease-in-out infinite;
}

.mode-drag-down {
  animation: hand-drag-down 1.8s ease-in-out infinite;
}

.mode-press {
  animation: hand-press 1.4s ease-in-out infinite;
}

@keyframes hand-bob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(6px, 8px) scale(0.95); }
}

@keyframes hand-drag-right {
  0% { transform: translate(0, 0) scale(1); opacity: 0.9; }
  25% { transform: translate(0, 0) scale(0.92); opacity: 1; }
  75% { transform: translate(58px, 16px) scale(0.92); opacity: 1; }
  100% { transform: translate(58px, 16px) scale(1); opacity: 0; }
}

@keyframes hand-drag-down {
  0% { transform: translate(0, 0) scale(1); opacity: 0; }
  18% { transform: translate(0, 0) scale(0.92); opacity: 1; }
  78% { transform: translate(0, 118px) scale(0.92); opacity: 1; }
  100% { transform: translate(0, 128px) scale(1); opacity: 0; }
}

@keyframes hand-press {
  0%, 100% { transform: scale(1); }
  45% { transform: scale(0.86) translateY(4px); }
}
</style>
