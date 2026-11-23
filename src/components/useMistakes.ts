import { reactive, ref } from 'vue'
import { playGentleShake } from '../engine/sfx'

export function useMistakes() {
  const counts = reactive<Record<string, number>>({})
  const bubbleText = ref<string | null>(null)
  const shakingKey = ref<string | null>(null)
  const glowKey = ref<string | null>(null)
  let hideTimer: ReturnType<typeof setTimeout> | null = null
  let shakeTimer: ReturnType<typeof setTimeout> | null = null

  function trigger(key: string, message: string) {
    counts[key] = (counts[key] ?? 0) + 1
    bubbleText.value = message
    shakingKey.value = key
    playGentleShake()

    if (counts[key] >= 2) {
      glowKey.value = key
    }

    if (hideTimer) clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {
      bubbleText.value = null
    }, 2600)

    if (shakeTimer) clearTimeout(shakeTimer)
    shakeTimer = setTimeout(() => {
      if (shakingKey.value === key) shakingKey.value = null
    }, 450)
  }

  function clear(key?: string) {
    if (key) {
      delete counts[key]
      if (glowKey.value === key) glowKey.value = null
      if (shakingKey.value === key) shakingKey.value = null
    } else {
      Object.keys(counts).forEach((k) => delete counts[k])
      glowKey.value = null
      shakingKey.value = null
    }
    bubbleText.value = null
  }

  return {
    counts,
    bubbleText,
    shakingKey,
    glowKey,
    trigger,
    clear,
  }
}
