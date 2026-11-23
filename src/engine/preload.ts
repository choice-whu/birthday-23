import { ref } from 'vue'
import { SITE_CONFIG } from '../config'
import { assetUrl } from './audio'

export const preloadProgress = ref(0)
export const preloadDone = ref(false)

const TIER1_ASSETS = [
  'assets/art/number_23.webp',
  'assets/art/cake_strawberry.webp',
  'assets/art/hat_blue_stripes.webp',
  'assets/art/crown_gold.webp',
  'assets/art/polaroid_camera.webp',
  'assets/art/hat_pink_dots.webp',
  'assets/art/glasses_heart.webp',
  'assets/photos/her_cake_cut.webp',
  'assets/photos/her_cake_sticker.webp',
  'assets/photos/her_face_square.webp',
  'assets/photos/her_face_cut.webp',
]

function getTier2Assets(): string[] {
  const list = [
    'assets/art/cake_white.webp',
    'assets/art/beer_glass.webp',
    'assets/art/film_canister.webp',
    'assets/art/compass_rose.webp',
    'assets/art/slot_machine.webp',
    'assets/art/gift_box.webp',
    'assets/photos/his_child_cut.webp',
    'assets/photos/merged_childhood.webp',
    'assets/map/china.webp',
    'assets/map/china-region.webp',
  ]
  for (const f of SITE_CONFIG.scene5.frames) {
    list.push(f.blurSrc, f.src)
  }
  for (const fl of SITE_CONFIG.scene6.flowers) {
    list.push(fl.src)
  }
  for (const city of SITE_CONFIG.scene7.cities) {
    for (const ph of city.photos) {
      list.push(ph.src)
    }
  }
  return list
}

function loadImage(relPath: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = assetUrl(relPath)
  })
}

export async function runPriorityPreload(): Promise<void> {
  if (preloadDone.value) return

  const totalSteps = TIER1_ASSETS.length + 1 // +1 for fonts.ready
  let completed = 0
  const bump = () => {
    completed += 1
    preloadProgress.value = Math.min(100, Math.round((completed / totalSteps) * 100))
  }

  const fontPromise =
    typeof document !== 'undefined' && document.fonts
      ? Promise.race([
          document.fonts.ready.catch(() => {}),
          new Promise<void>((r) => setTimeout(r, 2500)),
        ]).then(bump)
      : Promise.resolve().then(bump)

  await Promise.all([
    fontPromise,
    ...TIER1_ASSETS.map((src) => loadImage(src).then(bump)),
  ])

  preloadProgress.value = 100
  preloadDone.value = true

  // 后续幕素材在进入第 1 幕后后台静默预载，不阻塞首屏
  const startBackground = () => {
    const tier2 = getTier2Assets()
    let idx = 0
    const nextBatch = () => {
      const slice = tier2.slice(idx, idx + 4)
      idx += 4
      if (slice.length === 0) return
      void Promise.all(slice.map(loadImage)).then(() => {
        setTimeout(nextBatch, 120)
      })
    }
    nextBatch()
  }

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    ;(window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(startBackground)
  } else {
    setTimeout(startBackground, 400)
  }
}
