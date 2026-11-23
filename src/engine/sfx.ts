import { audioState, getAudioContext } from './audio'

function canPlaySfx(): AudioContext | null {
  if (audioState.muted) return null
  return getAudioContext()
}

function makeNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
  const length = Math.max(1, Math.floor(ctx.sampleRate * durationSec))
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1
  }
  return buffer
}

export function playTap(): void {
  const ctx = canPlaySfx()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(520, now)
  osc.frequency.exponentialRampToValueAtTime(240, now + 0.05)
  gain.gain.setValueAtTime(0.08, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
  osc.connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.07)
}

export function playGentleShake(): void {
  const ctx = canPlaySfx()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(320, now)
  osc.frequency.linearRampToValueAtTime(260, now + 0.09)
  osc.frequency.linearRampToValueAtTime(300, now + 0.16)
  gain.gain.setValueAtTime(0.06, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
  osc.connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.19)
}

export function playRibbonUntie(): void {
  const ctx = canPlaySfx()
  if (!ctx) return
  const now = ctx.currentTime
  // 丝带滑开摩挲声 + 温柔风铃单音
  const src = ctx.createBufferSource()
  src.buffer = makeNoiseBuffer(ctx, 0.28)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.setValueAtTime(2800, now)
  bp.frequency.exponentialRampToValueAtTime(1100, now + 0.28)
  bp.Q.value = 1.6
  const nGain = ctx.createGain()
  nGain.gain.setValueAtTime(0.001, now)
  nGain.gain.linearRampToValueAtTime(0.11, now + 0.04)
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)
  src.connect(bp).connect(nGain).connect(ctx.destination)
  src.start(now)

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(660, now + 0.04)
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.24)
  gain.gain.setValueAtTime(0.08, now + 0.04)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38)
  osc.connect(gain).connect(ctx.destination)
  osc.start(now + 0.04)
  osc.stop(now + 0.4)
}

export function playPaperTearTick(progress = 0.5): void {
  const ctx = canPlaySfx()
  if (!ctx) return
  const now = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = makeNoiseBuffer(ctx, 0.08)
  const hp = ctx.createBiquadFilter()
  hp.type = 'bandpass'
  hp.frequency.setValueAtTime(1900 + progress * 900, now)
  hp.Q.value = 1.1
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.14, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075)
  src.connect(hp).connect(gain).connect(ctx.destination)
  src.start(now)
}

export function playPaperTearFinish(): void {
  const ctx = canPlaySfx()
  if (!ctx) return
  const now = ctx.currentTime
  // 清脆撕开牛皮纸纤维声 + 温暖亮相和弦
  const src = ctx.createBufferSource()
  src.buffer = makeNoiseBuffer(ctx, 0.42)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.setValueAtTime(2400, now)
  bp.frequency.exponentialRampToValueAtTime(900, now + 0.42)
  bp.Q.value = 0.9
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.22, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42)
  src.connect(bp).connect(gain).connect(ctx.destination)
  src.start(now)

  ;[523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const t = now + 0.14 + i * 0.06
    g.gain.setValueAtTime(0.001, t)
    g.gain.linearRampToValueAtTime(0.06, t + 0.03)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.55)
    osc.connect(g).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.58)
  })
}

export function playWindChime(): void {
  const ctx = canPlaySfx()
  if (!ctx) return
  const now = ctx.currentTime
  const notes = [880, 1046.5, 1318.5, 1568]
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const t = now + idx * 0.09
    gain.gain.setValueAtTime(0.001, t)
    gain.gain.linearRampToValueAtTime(0.075, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.72)
  })
}

export function playBlowOut(): void {
  const ctx = canPlaySfx()
  if (!ctx) return
  const now = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = makeNoiseBuffer(ctx, 0.36)
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(1400, now)
  lp.frequency.exponentialRampToValueAtTime(320, now + 0.35)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.18, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36)
  src.connect(lp).connect(gain).connect(ctx.destination)
  src.start(now)
}

export function playShutter(): void {
  const ctx = canPlaySfx()
  if (!ctx) return
  const now = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = makeNoiseBuffer(ctx, 0.09)
  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 1800
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.24, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
  src.connect(hp).connect(gain).connect(ctx.destination)
  src.start(now)
}

export function playScissors(): void {
  const ctx = canPlaySfx()
  if (!ctx) return
  const now = ctx.currentTime
  ;[0, 0.06].forEach((offset) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(2600, now + offset)
    osc.frequency.exponentialRampToValueAtTime(1200, now + offset + 0.03)
    gain.gain.setValueAtTime(0.09, now + offset)
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.04)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now + offset)
    osc.stop(now + offset + 0.045)
  })
}

export function playClink(): void {
  const ctx = canPlaySfx()
  if (!ctx) return
  const now = ctx.currentTime
  ;[1860, 2790].forEach((freq) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.09, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.56)
  })
}

export function playScratch(): void {
  const ctx = canPlaySfx()
  if (!ctx) return
  const now = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = makeNoiseBuffer(ctx, 0.06)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 3200
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.08, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
  src.connect(bp).connect(gain).connect(ctx.destination)
  src.start(now)
}

export function playSlotSpin(): void {
  const ctx = canPlaySfx()
  if (!ctx) return
  const now = ctx.currentTime
  for (let i = 0; i < 6; i++) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = 380 + (i % 3) * 90
    const t = now + i * 0.07
    gain.gain.setValueAtTime(0.04, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.055)
  }
}

export function playSlotWin(): void {
  const ctx = canPlaySfx()
  if (!ctx) return
  const now = ctx.currentTime
  ;[587.33, 739.99, 880, 1174.66].forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = freq
    const t = now + i * 0.08
    gain.gain.setValueAtTime(0.1, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.36)
  })
}

export function playCoinDrop(): void {
  const ctx = canPlaySfx()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(987.77, now)
  osc.frequency.setValueAtTime(1318.5, now + 0.08)
  gain.gain.setValueAtTime(0.12, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42)
  osc.connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.44)
}

export function playMatchStrike(): void {
  const ctx = canPlaySfx()
  if (!ctx) return
  const now = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = makeNoiseBuffer(ctx, 0.2)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.setValueAtTime(3400, now)
  bp.frequency.exponentialRampToValueAtTime(1400, now + 0.2)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.18, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
  src.connect(bp).connect(gain).connect(ctx.destination)
  src.start(now)
}

export function playDoorbell(): void {
  const ctx = canPlaySfx()
  if (!ctx) return
  const now = ctx.currentTime
  ;[
    [783.99, 0],
    [659.25, 0.28],
  ].forEach(([freq, offset]) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const t = now + offset
    gain.gain.setValueAtTime(0.14, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.72)
  })
}

export function playPetalRustle(): void {
  const ctx = canPlaySfx()
  if (!ctx) return
  const now = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = makeNoiseBuffer(ctx, 0.24)
  const lp = ctx.createBiquadFilter()
  lp.type = 'bandpass'
  lp.frequency.value = 1800
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.07, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24)
  src.connect(lp).connect(gain).connect(ctx.destination)
  src.start(now)
}

export function playStamp(): void {
  const ctx = canPlaySfx()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(190, now)
  osc.frequency.exponentialRampToValueAtTime(75, now + 0.12)
  gain.gain.setValueAtTime(0.24, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)
  osc.connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.15)
}

export function playHeartbeat(): void {
  const ctx = canPlaySfx()
  if (!ctx) return
  const now = ctx.currentTime
  ;[0, 0.16].forEach((offset) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(110, now + offset)
    osc.frequency.exponentialRampToValueAtTime(52, now + offset + 0.1)
    gain.gain.setValueAtTime(0.18, now + offset)
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now + offset)
    osc.stop(now + offset + 0.13)
  })
}
