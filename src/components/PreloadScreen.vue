<template>
  <Transition name="preload-fade">
    <div v-if="!done" class="preload-screen">
      <PaperBg variant="parchment">
        <div class="preload-center">
          <div class="journal-emblem" aria-hidden="true">
            <svg viewBox="0 0 120 96" class="book-svg">
              <path
                d="M14 22 Q38 14 60 24 Q82 14 106 22 L106 78 Q82 70 60 80 Q38 70 14 78 Z"
                fill="#FFFDF8"
                stroke="#8A6D53"
                stroke-width="3"
                stroke-linejoin="round"
              />
              <line x1="60" y1="24" x2="60" y2="80" stroke="#B6967A" stroke-width="2" stroke-dasharray="4 3" />
              <path
                d="M60 44 C56 36, 44 37, 44 46 C44 54, 60 64, 60 64 C60 64, 76 54, 76 46 C76 37, 64 36, 60 44 Z"
                fill="#C83E3B"
                opacity="0.88"
              />
            </svg>
          </div>
          <p class="preload-title">正在装订你的 {{ SITE_CONFIG.profile.age }} 岁生日手账… {{ progress }}%</p>
          <div class="thread-track">
            <div class="thread-fill" :style="{ width: `${progress}%` }" />
          </div>
          <p class="preload-sub">For guaiguai · 12.14</p>
        </div>
      </PaperBg>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { SITE_CONFIG } from '../config'
import PaperBg from './PaperBg.vue'

defineProps<{
  progress: number
  done: boolean
}>()
</script>

<style scoped>
.preload-screen {
  position: absolute;
  inset: 0;
  z-index: 90;
}

.preload-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.journal-emblem {
  width: 112px;
  height: 90px;
  animation: book-bob 2.2s ease-in-out infinite;
}

.book-svg {
  width: 100%;
  height: 100%;
}

.preload-title {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 36px;
  color: var(--ink);
  letter-spacing: 1px;
}

.thread-track {
  width: 340px;
  height: 10px;
  border-radius: 999px;
  background: rgba(182, 150, 122, 0.25);
  border: 1.5px solid rgba(138, 109, 83, 0.45);
  overflow: hidden;
}

.thread-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #C83E3B, #E87A76);
  transition: width 0.22s ease;
}

.preload-sub {
  margin: 0;
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--ink-soft);
  letter-spacing: 2px;
}

@keyframes book-bob {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-5px) rotate(1deg); }
}

.preload-fade-leave-active {
  transition: opacity 0.45s ease;
  pointer-events: none;
}
.preload-fade-leave-to {
  opacity: 0;
}
</style>
