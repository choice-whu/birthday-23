import { reactive } from 'vue'
import type { SceneId } from '../config'

const STORAGE_KEY = 'guaiguai_hbd23_progress_v1'

export interface ProgressState {
  scene: SceneId
  unlockedAll: boolean
  accessories: {
    hatId?: string
    glassesId?: string
  }
}

const DEFAULT_PROGRESS: ProgressState = {
  scene: 1,
  unlockedAll: false,
  accessories: {},
}

function readStored(): ProgressState {
  if (typeof window === 'undefined') return { ...DEFAULT_PROGRESS, accessories: {} }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PROGRESS, accessories: {} }
    const parsed = JSON.parse(raw) as Partial<ProgressState>
    const scene =
      typeof parsed.scene === 'number' && parsed.scene >= 1 && parsed.scene <= 12
        ? (parsed.scene as SceneId)
        : 1
    return {
      scene,
      unlockedAll: Boolean(parsed.unlockedAll),
      accessories: {
        hatId: parsed.accessories?.hatId,
        glassesId: parsed.accessories?.glassesId,
      },
    }
  } catch {
    return { ...DEFAULT_PROGRESS, accessories: {} }
  }
}

export const progressState = reactive<ProgressState>(readStored())

function persist(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        scene: progressState.scene,
        unlockedAll: progressState.unlockedAll,
        accessories: progressState.accessories,
      }),
    )
  } catch {
    // ignore quota errors
  }
}

export function setSceneProgress(scene: SceneId): void {
  progressState.scene = scene
  persist()
}

export function setAccessoriesProgress(acc: { hatId?: string; glassesId?: string }): void {
  progressState.accessories = { ...progressState.accessories, ...acc }
  persist()
}

export function markUnlockedAll(): void {
  progressState.unlockedAll = true
  persist()
}

export function resetProgress(): void {
  progressState.scene = 1
  progressState.unlockedAll = false
  progressState.accessories = {}
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }
}
