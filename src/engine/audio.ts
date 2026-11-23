import { reactive } from 'vue'

export function assetUrl(relPath: string): string {
  const base = import.meta.env.BASE_URL || './'
  const cleanBase = base.endsWith('/') ? base : `${base}/`
  return `${cleanBase}${relPath.replace(/^\/+/, '')}`
}

export const audioState = reactive({
  muted: false,
  bgmPlaying: false,
  unlocked: false,
})

let bgmEl: HTMLAudioElement | null = null
let audioCtx: AudioContext | null = null
let weixinHookBound = false

function ensureBgmElement(): HTMLAudioElement {
  if (!bgmEl) {
    bgmEl = new Audio(assetUrl('assets/audio/bgm.mp3'))
    bgmEl.loop = true
    bgmEl.preload = 'auto'
    bgmEl.volume = 0.5
    bgmEl.addEventListener('play', () => {
      audioState.bgmPlaying = true
    })
    bgmEl.addEventListener('pause', () => {
      audioState.bgmPlaying = false
    })
  }
  return bgmEl
}

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (Ctx) {
      audioCtx = new Ctx()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    void audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

/**
 * 同步解锁 AudioContext，并尝试预热微信内置浏览器音频环境。
 */
export function bindWeixinAudioBridge(): void {
  if (weixinHookBound || typeof document === 'undefined') return
  weixinHookBound = true
  const prime = () => {
    const el = ensureBgmElement()
    el.load()
    if (audioState.unlocked && !audioState.muted && el.paused) {
      void el.play().catch(() => {})
    }
  }
  document.addEventListener('WeixinJSBridgeReady', prime, false)
  // 若 WeixinJSBridge 已经就绪则立即注册一次安全调用
  const wx = (window as unknown as { WeixinJSBridge?: { invoke?: (name: string, args: unknown, cb: () => void) => void } }).WeixinJSBridge
  if (wx?.invoke) {
    try {
      wx.invoke('getNetworkType', {}, prime)
    } catch {
      // ignore
    }
  }
}

/**
 * 必须在用户首次 pointerdown / touchend 事件同步回调中直接调用，以兼容 iOS 微信静音策略。
 */
export function unlockAndPlayBgm(): void {
  audioState.unlocked = true
  getAudioContext()
  const el = ensureBgmElement()
  el.muted = audioState.muted
  if (!audioState.muted && el.paused) {
    void el.play().catch(() => {})
  }
}

export function ensureBgmOnResume(): void {
  if (!audioState.unlocked || audioState.muted) return
  const el = ensureBgmElement()
  if (el.paused) unlockAndPlayBgm()
}

export function setMuted(muted: boolean): void {
  audioState.muted = muted
  const el = ensureBgmElement()
  el.muted = muted
  if (!muted && audioState.unlocked && el.paused) {
    void el.play().catch(() => {})
  }
}

export function toggleMute(): boolean {
  setMuted(!audioState.muted)
  return audioState.muted
}
