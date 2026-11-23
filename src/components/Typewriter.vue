<template>
  <span class="typewriter">{{ displayed }}<span v-if="!isDone && cursor" class="caret">|</span></span>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    text: string
    speedMs?: number
    startDelayMs?: number
    cursor?: boolean
    active?: boolean
  }>(),
  {
    speedMs: 75,
    startDelayMs: 180,
    cursor: true,
    active: true,
  },
)

const emit = defineEmits<{ done: [] }>()

const displayed = ref('')
const isDone = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

function clearTimers() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

function run() {
  clearTimers()
  displayed.value = ''
  isDone.value = false
  if (!props.active) return

  const chars = Array.from(props.text)
  let idx = 0

  const step = () => {
    if (idx >= chars.length) {
      isDone.value = true
      emit('done')
      return
    }
    displayed.value += chars[idx]
    idx += 1
    timer = setTimeout(step, props.speedMs)
  }

  timer = setTimeout(step, props.startDelayMs)
}

watch(() => [props.text, props.active] as const, run)
onMounted(run)
onBeforeUnmount(clearTimers)
</script>

<style scoped>
.caret {
  display: inline-block;
  margin-left: 2px;
  color: var(--accent-red);
  animation: blink-caret 0.85s steps(1) infinite;
}

@keyframes blink-caret {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
</style>
