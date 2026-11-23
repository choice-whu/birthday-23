import type { SceneId } from '../config'

export type TransitionMode = 'tear-reveal' | 'prop-handoff'

export interface HandoffProp {
  id: string
  kind?: 'image' | 'html' | 'dressed-avatar'
  src?: string
  html?: string
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  scale?: number
  opacity?: number
  zIndex?: number
  meta?: {
    hatId?: string
    glassesId?: string
    showStick?: boolean
    [key: string]: unknown
  }
}

export interface SceneExposed {
  intro?: (props: HandoffProp[]) => Promise<void> | void
  play?: (opts?: { resumed?: boolean }) => void
  outro?: (nextScene: SceneId) => Promise<HandoffProp[] | void> | HandoffProp[] | void
}
