import gsap from 'gsap'
import { getStageCoords, stageDistance, type StagePoint } from './coords'
import { stageState } from './stage'

export interface DragPayload {
  x: number
  y: number
  dx: number
  dy: number
  stepDx: number
  stepDy: number
  startX: number
  startY: number
  dist: number
  event: PointerEvent
}

export interface UseDragHandlers {
  canStart?: (pt: StagePoint, event: PointerEvent) => boolean
  onStart?: (payload: DragPayload) => void
  onMove?: (payload: DragPayload) => void
  onEnd?: (payload: DragPayload) => void
  onCancel?: (payload: DragPayload) => void
}

/**
 * 基于 Pointer Events + setPointerCapture 的舞台坐标系拖拽控制器。
 */
export function attachStageDrag(target: HTMLElement, handlers: UseDragHandlers): () => void {
  let activePointerId: number | null = null
  let startPt: StagePoint = { x: 0, y: 0 }
  let prevPt: StagePoint = { x: 0, y: 0 }

  const makePayload = (pt: StagePoint, event: PointerEvent): DragPayload => ({
    x: pt.x,
    y: pt.y,
    dx: pt.x - startPt.x,
    dy: pt.y - startPt.y,
    stepDx: pt.x - prevPt.x,
    stepDy: pt.y - prevPt.y,
    startX: startPt.x,
    startY: startPt.y,
    dist: Math.hypot(pt.x - startPt.x, pt.y - startPt.y),
    event,
  })

  const onPointerDown = (e: PointerEvent) => {
    if (activePointerId !== null) return
    const pt = getStageCoords(e.clientX, e.clientY, stageState.stageEl)
    if (handlers.canStart && !handlers.canStart(pt, e)) return

    activePointerId = e.pointerId
    startPt = pt
    prevPt = pt
    try {
      target.setPointerCapture(e.pointerId)
    } catch {
      // Ignore synthetic events where pointer capture isn't supported
    }
    handlers.onStart?.(makePayload(pt, e))
  }

  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerId !== activePointerId) return
    const pt = getStageCoords(e.clientX, e.clientY, stageState.stageEl)
    const payload = makePayload(pt, e)
    prevPt = pt
    handlers.onMove?.(payload)
  }

  const finish = (e: PointerEvent, cancelled: boolean) => {
    if (e.pointerId !== activePointerId) return
    const pt = getStageCoords(e.clientX, e.clientY, stageState.stageEl)
    const payload = makePayload(pt, e)
    activePointerId = null
    try {
      if (target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId)
      }
    } catch {
      // ignore
    }
    if (cancelled) {
      handlers.onCancel?.(payload)
    } else {
      handlers.onEnd?.(payload)
    }
  }

  const onPointerUp = (e: PointerEvent) => finish(e, false)
  const onPointerCancel = (e: PointerEvent) => finish(e, true)

  target.addEventListener('pointerdown', onPointerDown)
  target.addEventListener('pointermove', onPointerMove)
  target.addEventListener('pointerup', onPointerUp)
  target.addEventListener('pointercancel', onPointerCancel)

  return () => {
    target.removeEventListener('pointerdown', onPointerDown)
    target.removeEventListener('pointermove', onPointerMove)
    target.removeEventListener('pointerup', onPointerUp)
    target.removeEventListener('pointercancel', onPointerCancel)
  }
}

export function snapTo(
  pos: StagePoint,
  target: StagePoint,
  radius: number,
): { snapped: boolean; dist: number; x: number; y: number } {
  const dist = stageDistance(pos, target)
  if (dist <= radius) {
    return { snapped: true, dist, x: target.x, y: target.y }
  }
  return { snapped: false, dist, x: pos.x, y: pos.y }
}

export function springReturn(
  el: gsap.TweenTarget,
  to: { x?: number; y?: number; rotation?: number; scale?: number } = { x: 0, y: 0 },
  duration = 0.55,
): gsap.core.Tween {
  return gsap.to(el, {
    ...to,
    duration,
    ease: 'elastic.out(1, 0.58)',
  })
}

export function checkDualMerge(
  a: { x: number; y: number; rotation?: number },
  b: { x: number; y: number; rotation?: number },
  maxDist = 42,
  maxAngleDiff = 15,
): boolean {
  const dist = Math.hypot(a.x - b.x, a.y - b.y)
  const angleDiff = Math.abs((a.rotation ?? 0) - (b.rotation ?? 0)) % 360
  const normalizedAngle = angleDiff > 180 ? 360 - angleDiff : angleDiff
  return dist <= maxDist && normalizedAngle <= maxAngleDiff
}
