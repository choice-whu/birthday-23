import { DESIGN_H, DESIGN_W, stageState } from './stage'

export interface StagePoint {
  x: number
  y: number
}

/**
 * 将屏幕指针坐标（clientX, clientY）精准映射回 1280×720 设计坐标系。
 * 在手机竖屏自动 +90deg 旋转时使用逆向矩阵映射，保证拖拽/刮擦 100% 跟手。
 */
export function getStageCoords(
  clientX: number,
  clientY: number,
  stageElement: HTMLElement | null = stageState.stageEl,
): StagePoint {
  if (!stageElement) {
    return { x: clientX, y: clientY }
  }
  const rect = stageElement.getBoundingClientRect()
  const isRotated = document.documentElement.classList.contains('portrait-rotated')
  if (rect.width === 0 || rect.height === 0) {
    return { x: 0, y: 0 }
  }

  if (!isRotated) {
    return {
      x: ((clientX - rect.left) / rect.width) * DESIGN_W,
      y: ((clientY - rect.top) / rect.height) * DESIGN_H,
    }
  }

  // 容器顺时针旋转 90deg 后的逆向坐标映射
  return {
    x: ((clientY - rect.top) / rect.height) * DESIGN_W,
    y: ((rect.right - clientX) / rect.width) * DESIGN_H,
  }
}

export function stageDistance(a: StagePoint, b: StagePoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
