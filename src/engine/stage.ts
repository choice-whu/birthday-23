import { reactive } from 'vue'

export const DESIGN_W = 1280
export const DESIGN_H = 720

export const stageState = reactive({
  scale: 1,
  isPortrait: false,
  forcePortrait: false,
  vw: 1280,
  vh: 720,
  centerX: 640,
  centerY: 360,
  stageEl: null as HTMLElement | null,
})

export function setupStage(stageEl: HTMLElement): () => void {
  stageState.stageEl = stageEl

  const update = () => {
    const vv = window.visualViewport
    const vw = vv ? vv.width : window.innerWidth
    const vh = vv ? vv.height : window.innerHeight
    const offsetX = vv ? vv.offsetLeft : 0
    const offsetY = vv ? vv.offsetTop : 0

    const isPortrait = stageState.forcePortrait || vw < vh
    const scale = isPortrait
      ? Math.min(vh / DESIGN_W, vw / DESIGN_H)
      : Math.min(vw / DESIGN_W, vh / DESIGN_H)

    stageState.vw = vw
    stageState.vh = vh
    stageState.isPortrait = isPortrait
    stageState.scale = scale
    stageState.centerX = offsetX + vw / 2
    stageState.centerY = offsetY + vh / 2

    document.documentElement.classList.toggle('portrait-rotated', isPortrait)
    stageEl.style.left = `${stageState.centerX}px`
    stageEl.style.top = `${stageState.centerY}px`
    stageEl.style.transform = isPortrait
      ? `translate(-50%, -50%) rotate(90deg) scale(${scale})`
      : `translate(-50%, -50%) scale(${scale})`
  }

  update()
  window.addEventListener('resize', update)
  window.addEventListener('orientationchange', update)
  window.visualViewport?.addEventListener('resize', update)
  window.visualViewport?.addEventListener('scroll', update)

  return () => {
    window.removeEventListener('resize', update)
    window.removeEventListener('orientationchange', update)
    window.visualViewport?.removeEventListener('resize', update)
    window.visualViewport?.removeEventListener('scroll', update)
    stageState.stageEl = null
  }
}

export function toggleForcePortrait(): void {
  stageState.forcePortrait = !stageState.forcePortrait
  window.dispatchEvent(new Event('resize'))
}
