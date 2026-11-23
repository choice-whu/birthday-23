import gsap from 'gsap'
import { reactive } from 'vue'
import { getStageCoords } from '../engine/coords'
import { stageState } from '../engine/stage'
import type { HandoffProp } from './types'

export const propLayerStore = reactive<{ props: HandoffProp[] }>({
  props: [],
})

export function handOverProp(prop: HandoffProp): void {
  const idx = propLayerStore.props.findIndex((p) => p.id === prop.id)
  if (idx >= 0) {
    propLayerStore.props[idx] = { ...prop }
  } else {
    propLayerStore.props.push({ ...prop })
  }
}

export function animateProp(
  id: string,
  vars: {
    x?: number
    y?: number
    width?: number
    height?: number
    rotation?: number
    scale?: number
    opacity?: number
    duration?: number
    ease?: string
  },
): Promise<void> {
  const prop = propLayerStore.props.find((p) => p.id === id)
  if (!prop) return Promise.resolve()
  const { duration = 0.65, ease = 'power2.inOut', ...targets } = vars
  return new Promise((resolve) => {
    gsap.to(prop, {
      ...targets,
      duration,
      ease,
      onComplete: () => resolve(),
    })
  })
}

export function claimProp(id: string): HandoffProp | undefined {
  const idx = propLayerStore.props.findIndex((p) => p.id === id)
  if (idx < 0) return undefined
  const [removed] = propLayerStore.props.splice(idx, 1)
  return removed
}

export function clearProps(): void {
  propLayerStore.props.splice(0, propLayerStore.props.length)
}

export function measureInStage(el: HTMLElement): { x: number; y: number; width: number; height: number } {
  const rect = el.getBoundingClientRect()
  const stageEl = stageState.stageEl
  if (!stageEl) {
    return { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
  }
  const topLeft = getStageCoords(rect.left, rect.top, stageEl)
  const bottomRight = getStageCoords(rect.right, rect.bottom, stageEl)
  return {
    x: Math.min(topLeft.x, bottomRight.x),
    y: Math.min(topLeft.y, bottomRight.y),
    width: Math.abs(bottomRight.x - topLeft.x),
    height: Math.abs(bottomRight.y - topLeft.y),
  }
}
