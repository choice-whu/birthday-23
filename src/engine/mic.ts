export function isMicSupported(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(window.isSecureContext && navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

export interface BreathDetector {
  start: () => Promise<boolean>
  stop: () => void
  readonly active: boolean
}

/**
 * 仅在 HTTPS / localhost 安全上下文启用麦克风吹气检测：
 * 监测 0~500Hz 低频气流能量峰值持续 > 150ms 即触发。
 */
export function createBreathDetector(
  onBlow: () => void,
  opts: { threshold?: number; sustainMs?: number } = {},
): BreathDetector {
  const threshold = opts.threshold ?? 145
  const sustainMs = opts.sustainMs ?? 150

  let stream: MediaStream | null = null
  let ctx: AudioContext | null = null
  let rafId = 0
  let isActive = false
  let highSince = 0
  let fired = false

  const stop = () => {
    isActive = false
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      stream = null
    }
    if (ctx) {
      void ctx.close().catch(() => {})
      ctx = null
    }
  }

  const start = async (): Promise<boolean> => {
    if (!isMicSupported()) return false
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx = new Ctx()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 1024
      source.connect(analyser)

      const bins = new Uint8Array(analyser.frequencyBinCount)
      const binHz = ctx.sampleRate / analyser.fftSize
      const maxBin = Math.max(4, Math.min(bins.length - 1, Math.floor(500 / binHz)))
      isActive = true
      fired = false
      highSince = 0

      const tick = (now: number) => {
        if (!isActive || fired) return
        analyser.getByteFrequencyData(bins)
        let sum = 0
        for (let i = 1; i <= maxBin; i++) {
          sum += bins[i]
        }
        const avg = sum / maxBin
        if (avg >= threshold) {
          if (highSince === 0) highSince = now
          if (now - highSince >= sustainMs) {
            fired = true
            onBlow()
            stop()
            return
          }
        } else {
          highSince = 0
        }
        rafId = requestAnimationFrame(tick)
      }

      rafId = requestAnimationFrame(tick)
      return true
    } catch {
      stop()
      return false
    }
  }

  return {
    start,
    stop,
    get active() {
      return isActive
    },
  }
}
