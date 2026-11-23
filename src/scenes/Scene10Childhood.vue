<template>
  <div class="scene-10">
    <PaperBg variant="white">
      <Bunting variant="corner" />

      <!-- 阶段一：两张咬合撕纸童年照碎片拼合 -->
      <template v-if="phase === 'puzzle'">
        <div class="scene-header">
          <h2 class="title-main">{{ SITE_CONFIG.scene10.titleBefore }}</h2>
        </div>

        <div
          class="merge-guide-box"
          :class="{ 'gold-guide': mistakes.glowKey.value === 'merge' }"
        >
          <span>把两块童年照片往中间拼合到一起</span>
        </div>

        <!-- 左碎片：2006 小时候的 choice（手撕白边 + 蓝条纹生日帽） -->
        <div
          ref="leftFragEl"
          class="child-fragment frag-left"
          :style="{
            left: `${leftPos.x}px`,
            top: `${leftPos.y}px`,
            transform: `rotate(${leftPos.rot}deg)`,
          }"
        >
          <div class="torn-photo-card seed-a">
            <img
              :src="assetUrl('assets/photos/his_child_cut.webp')"
              alt="小时候的 choice"
              class="frag-img"
            />
          </div>
          <img
            :src="assetUrl('assets/art/hat_blue_stripes.webp')"
            alt=""
            class="frag-hat frag-hat-boy"
            aria-hidden="true"
          />
          <span class="frag-caption">{{ SITE_CONFIG.scene10.leftLabel }}</span>
          <HandHint v-if="!isUnderlay && !isDraggingFrag" mode="drag-right" class="frag-hand" />
        </div>

        <!-- 右碎片：2003 小时候的佳奇（头顶贴 WOW!! 与粉色波点生日帽） -->
        <div
          ref="rightFragEl"
          class="child-fragment frag-right"
          :style="{
            left: `${rightPos.x}px`,
            top: `${rightPos.y}px`,
            transform: `rotate(${rightPos.rot}deg)`,
          }"
        >
          <div class="torn-photo-card seed-b">
            <img
              :src="assetUrl('assets/photos/her_cake_sticker.webp')"
              alt="小时候的佳奇"
              class="frag-img"
            />
            <span class="wow-sticker">WOW!!</span>
          </div>
          <img
            :src="assetUrl('assets/art/hat_pink_dots.webp')"
            alt=""
            class="frag-hat frag-hat-girl"
            aria-hidden="true"
          />
          <span class="frag-caption">{{ SITE_CONFIG.scene10.rightLabel }}</span>
        </div>
      </template>

      <!-- 阶段二：童年合框 + 彩铅手账涂鸦 + 一键生成 1170×2532 壁纸 -->
      <template v-else-if="phase === 'merged'">
        <h2 class="merged-headline">{{ SITE_CONFIG.scene10.titleAfter }}</h2>

        <div class="merged-composition" :inert="wechatModalOpen">
          <!-- 周围彩色手账涂鸦 SVG（参考 frames/frame_085.0.jpg） -->
          <svg class="doodles-svg" viewBox="0 0 680 490" aria-hidden="true">
            <!-- 左上 OH! -->
            <text
              x="74"
              y="128"
              transform="rotate(-16 74 128)"
              font-family="Comic Sans MS, Georgia, serif"
              font-weight="800"
              font-size="40"
              fill="#628AC4"
              stroke="#D85B7B"
              stroke-width="1.2"
            >
              OH!
            </text>
            <!-- 右上 LEMME KEEP YOU IN MY POCKET -->
            <g transform="translate(510, 22) rotate(8)" fill="#9E3A64" font-family="Comic Sans MS, cursive, serif" font-weight="700" font-size="18">
              <text x="12" y="18">LEMME</text>
              <text x="24" y="38">KEEP</text>
              <text x="6" y="58">YOU IN</text>
              <text x="28" y="78">MY</text>
              <text x="4" y="98">POCKET</text>
              <circle cx="8" cy="24" r="2.2" fill="#E84A7F" />
              <circle cx="88" cy="48" r="2.5" fill="#F2B84B" />
            </g>
            <!-- 左下斜签文字 & 黄笑脸 -->
            <g transform="translate(116, 412) rotate(-8)" fill="#2D4A68" font-family="Georgia, serif" font-size="12">
              <text x="0" y="14">CAPTURE THE</text>
              <text x="14" y="28">MOMENT</text>
            </g>
            <g transform="translate(486, 424)">
              <path d="M-24 -8 Q-20 12 0 12 Q20 12 24 -8" fill="none" stroke="#F4B742" stroke-width="4.5" stroke-linecap="round" />
              <circle cx="-11" cy="-14" r="3" fill="#2D4A68" />
              <circle cx="11" cy="-14" r="3" fill="#2D4A68" />
            </g>
            <!-- 点缀小星芒 -->
            <g stroke="#F2B84B" stroke-width="2" stroke-linecap="round">
              <line x1="88" y1="204" x2="88" y2="224" />
              <line x1="78" y1="214" x2="98" y2="214" />
              <line x1="590" y1="318" x2="590" y2="338" />
              <line x1="580" y1="328" x2="600" y2="328" />
            </g>
          </svg>

          <!-- 中央 AI 修复版两小无猜同框吹蜡烛照（两个小孩一起戴生日帽） -->
          <button
            type="button"
            class="merged-photo-cloud"
            aria-label="保存这张合照壁纸"
            :disabled="isUnderlay || wallpaperBusy || savedToastVisible"
            @click="onClickSaveWallpaper"
          >
            <span class="merged-photo-frame">
              <img
                :src="assetUrl('assets/photos/merged_childhood.webp')"
                alt="小时候的我们一起吹生日蛋糕蜡烛"
                class="merged-photo-img"
              />
              <img
                :src="assetUrl('assets/art/hat_blue_stripes.webp')"
                alt=""
                class="merged-hat merged-hat-boy"
                aria-hidden="true"
              />
              <img
                :src="assetUrl('assets/art/hat_pink_dots.webp')"
                alt=""
                class="merged-hat merged-hat-girl"
                aria-hidden="true"
              />
            </span>
            <span class="merged-wow-tag">WOW!!</span>
          </button>

          <HandHint v-if="!isUnderlay && !wallpaperBusy" mode="bob" class="save-cta-hand" />
        </div>

        <div v-if="savedToastVisible" class="saved-toast">
          {{ SITE_CONFIG.scene10.savedToast }}
        </div>
      </template>

      <!-- 阶段三：12.14 零点 iPhone 灵动岛锁屏 + choice 消息通知（参考 frames/frame_088.5.jpg） -->
      <template v-else>
        <!-- 中央 iPhone 灵动岛锁屏预览 -->
        <div ref="phoneFrameEl" class="iphone-bezel">
          <div class="iphone-screen">
            <img
              :src="wallpaperPreviewUrl || assetUrl('assets/photos/merged_childhood.webp')"
              alt="手机锁屏壁纸"
              class="iphone-wallpaper-img"
              :class="{ 'is-raw-photo': !wallpaperPreviewUrl }"
            />

            <!-- 灵动岛 -->
            <div class="dynamic-island" />

            <!-- 顶部日期与 00:00 零点时钟 -->
            <div class="lock-clock-box">
              <div class="lock-date">{{ SITE_CONFIG.profile.lockScreenDate }}</div>
              <div class="lock-time">00:00</div>
            </div>

            <!-- 底部 iOS 消息通知横幅（点击翻页进入幕 11） -->
            <button type="button" class="ios-notify-card" @click="onGoNext">
              <div class="notify-head">
                <span class="notify-app-dot">♥</span>
                <strong class="notify-sender">{{ SITE_CONFIG.scene10.notification.sender }}</strong>
                <span class="notify-time">{{ SITE_CONFIG.scene10.notification.time }}</span>
              </div>
              <p class="notify-body">{{ SITE_CONFIG.scene10.notification.body }}</p>
            </button>

            <div class="lock-bottom-icons" aria-hidden="true">
              <span class="lock-circle">
                <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round">
                  <path d="M7 3 L13 3 L12 7 L12 17 L8 17 L8 7 Z" />
                  <line x1="8" y1="7" x2="12" y2="7" />
                </svg>
              </span>
              <span class="home-indicator" />
              <span class="lock-circle">
                <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linejoin="round">
                  <rect x="3" y="6" width="14" height="10" rx="2" />
                  <circle cx="10" cy="11" r="2.6" />
                  <path d="M7 6 L8.2 4 L11.8 4 L13 6" />
                </svg>
              </span>
            </div>
          </div>
          <HandHint v-if="!isUnderlay" mode="bob" class="notify-hand" />
        </div>

        <div v-if="!isUnderlay" ref="nextWrapEl" class="next-wrap">
          <NextButton :label="SITE_CONFIG.scene10.nextLabel" @click="onGoNext" />
        </div>
      </template>

      <!-- 时光快门白闪遮罩 -->
      <div class="time-flash" :style="{ opacity: flashOpacity }" aria-hidden="true" />

      <!-- 微信内长按保存壁纸，点空白处进入锁屏预览 -->
      <div
        v-if="wechatModalOpen && wallpaperPreviewUrl"
        class="wallpaper-modal-backdrop"
        @click.self="finishWallpaperModal"
        @keydown.esc.stop="finishWallpaperModal"
      >
        <div ref="wallpaperModalEl" class="wallpaper-modal" role="dialog" aria-modal="true" aria-label="保存高清壁纸" tabindex="-1">
          <p class="wechat-save-tip">{{ SITE_CONFIG.scene10.wechatSaveTip }}</p>
          <img :src="wallpaperPreviewUrl" alt="1170×2532 高清壁纸" class="wallpaper-modal-img" />
        </div>
      </div>

      <HintBubble :text="mistakes.bubbleText.value" />
    </PaperBg>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import Bunting from '../components/Bunting.vue'
import HandHint from '../components/HandHint.vue'
import HintBubble from '../components/HintBubble.vue'
import NextButton from '../components/NextButton.vue'
import PaperBg from '../components/PaperBg.vue'
import { useMistakes } from '../components/useMistakes'
import { SITE_CONFIG, type SceneId } from '../config'
import { animateProp, claimProp, handOverProp } from '../director/handoff'
import type { HandoffProp, TransitionMode } from '../director/types'
import { assetUrl } from '../engine/audio'
import { clamp } from '../engine/coords'
import { playPaperTearTick, playShutter, playTap, playWindChime } from '../engine/sfx'
import { attachStageDrag } from '../engine/useDrag'

const props = withDefaults(
  defineProps<{
    isUnderlay?: boolean
  }>(),
  { isUnderlay: false },
)

const emit = defineEmits<{
  complete: [mode: TransitionMode]
}>()

const mistakes = useMistakes()
const leftFragEl = ref<HTMLElement | null>(null)
const rightFragEl = ref<HTMLElement | null>(null)
const wallpaperModalEl = ref<HTMLElement | null>(null)
const phoneFrameEl = ref<HTMLElement | null>(null)
const nextWrapEl = ref<HTMLElement | null>(null)

const phase = ref<'puzzle' | 'merged' | 'lockscreen'>('puzzle')
const isDraggingFrag = ref(false)
const flashOpacity = ref(0)
const wallpaperBusy = ref(false)
const savedToastVisible = ref(false)
const wallpaperPreviewUrl = ref('')
const wechatModalOpen = ref(false)

const leftPos = reactive({ x: 188, y: 196, rot: -4 })
const rightPos = reactive({ x: 822, y: 202, rot: 4 })

let cleanups: (() => void)[] = []

function clearFragDrags() {
  while (cleanups.length) {
    cleanups.pop()?.()
  }
}

function triggerMergeReunion() {
  if (phase.value !== 'puzzle') return
  clearFragDrags()
  mistakes.clear('merge')
  playShutter()

  // 两片撕纸碎片啪地拼合在一起并闪过温暖时光快门光晕
  gsap.to(leftPos, { x: 386, y: 198, rot: 0, duration: 0.28, ease: 'back.out(1.7)' })
  gsap.to(rightPos, { x: 604, y: 198, rot: 0, duration: 0.28, ease: 'back.out(1.7)' })

  flashOpacity.value = 0.92
  setTimeout(() => {
    phase.value = 'merged'
    playWindChime()
    gsap.to(flashOpacity, { value: 0, duration: 0.55, ease: 'power2.out' })
  }, 240)
}

function checkMergeCondition(): boolean {
  const dx = rightPos.x - leftPos.x
  const dy = Math.abs(rightPos.y - leftPos.y)
  return dx >= 145 && dx <= 318 && dy <= 105
}

function setupFragmentDrags() {
  clearFragDrags()
  if (props.isUnderlay || phase.value !== 'puzzle') return

  if (leftFragEl.value) {
    let sx = leftPos.x
    let sy = leftPos.y
    cleanups.push(
      attachStageDrag(leftFragEl.value, {
        canStart: () => phase.value === 'puzzle',
        onStart() {
          isDraggingFrag.value = true
          sx = leftPos.x
          sy = leftPos.y
        },
        onMove(pt) {
          leftPos.x = clamp(sx + pt.dx, 80, rightPos.x - 145)
          leftPos.y = clamp(sy + pt.dy, 110, 340)
          if (checkMergeCondition()) {
            triggerMergeReunion()
          }
        },
        onEnd() {
          isDraggingFrag.value = false
          if (phase.value === 'puzzle') {
            if (checkMergeCondition()) {
              triggerMergeReunion()
            } else {
              mistakes.trigger('merge', '把两边小时候的照片往中间拖到严丝合缝拼在一起吧~')
            }
          }
        },
      }),
    )
  }

  if (rightFragEl.value) {
    let sx = rightPos.x
    let sy = rightPos.y
    cleanups.push(
      attachStageDrag(rightFragEl.value, {
        canStart: () => phase.value === 'puzzle',
        onStart() {
          isDraggingFrag.value = true
          sx = rightPos.x
          sy = rightPos.y
        },
        onMove(pt) {
          rightPos.x = clamp(sx + pt.dx, leftPos.x + 145, 920)
          rightPos.y = clamp(sy + pt.dy, 110, 340)
          if (checkMergeCondition()) {
            triggerMergeReunion()
          }
        },
        onEnd() {
          isDraggingFrag.value = false
          if (phase.value === 'puzzle') {
            if (checkMergeCondition()) {
              triggerMergeReunion()
            } else {
              mistakes.trigger('merge', '把两边小时候的照片往中间拖到一起就能合拍啦~')
            }
          }
        },
      }),
    )
  }
}

async function generateWallpaper1170x2532(): Promise<string> {
  if (wallpaperPreviewUrl.value) return wallpaperPreviewUrl.value

  const W = 1170
  const H = 2532
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // 纯白温柔手账纸底与顶部锁屏时钟柔和暖雾渐变（衬托 iOS 白色时钟数字）
  const bg = ctx.createRadialGradient(W / 2, H * 0.54, 80, W / 2, H * 0.54, H * 0.72)
  bg.addColorStop(0, '#FFFFFF')
  bg.addColorStop(1, '#F7F1E7')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  const topWash = ctx.createLinearGradient(0, 0, 0, 740)
  topWash.addColorStop(0, 'rgba(182, 150, 122, 0.42)')
  topWash.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = topWash
  ctx.fillRect(0, 0, W, 740)

  // 顶部主题手写小标题（避开 iOS 时钟区，也与下方 OH!/LEMME 涂鸦错开留白）
  ctx.save()
  ctx.fillStyle = '#5C4B3E'
  ctx.textAlign = 'center'
  ctx.font = '46px "LongCang", "ZCOOL XiaoWei", cursive, sans-serif'
  ctx.fillText('错过的那些生日，以后一起补上', W / 2, 672)
  ctx.restore()

  // 加载合框童年高清图与两顶手绘生日帽，居中贴进撕纸相框并给两个小孩戴上生日帽
  const loadImage = (srcPath: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = reject
      el.src = assetUrl(srcPath)
    })

  const [img, hatBoyImg, hatGirlImg] = await Promise.all([
    loadImage('assets/photos/merged_childhood.webp'),
    loadImage('assets/art/hat_blue_stripes.webp'),
    loadImage('assets/art/hat_pink_dots.webp'),
  ])

  const photoW = 940
  const photoH = Math.round(photoW * (img.naturalHeight / Math.max(1, img.naturalWidth)))
  const photoX = (W - photoW) / 2
  const photoY = 856

  // 外层轻柔手账卡纸阴影与白框
  ctx.save()
  ctx.shadowColor = 'rgba(43, 35, 29, 0.16)'
  ctx.shadowBlur = 28
  ctx.shadowOffsetY = 12
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(photoX - 24, photoY - 24, photoW + 48, photoH + 48)
  ctx.restore()
  ctx.drawImage(img, photoX, photoY, photoW, photoH)

  const drawRotatedHat = (
    hatEl: HTMLImageElement,
    leftFrac: number,
    topFrac: number,
    widthFrac: number,
    deg: number,
  ) => {
    const hw = photoW * widthFrac
    const hh = hw * (hatEl.naturalHeight / Math.max(1, hatEl.naturalWidth))
    const hx = photoX + photoW * leftFrac
    const hy = photoY + photoH * topFrac
    ctx.save()
    ctx.translate(hx + hw / 2, hy + hh / 2)
    ctx.rotate((deg * Math.PI) / 180)
    ctx.drawImage(hatEl, -hw / 2, -hh / 2, hw, hh)
    ctx.restore()
  }
  drawRotatedHat(hatBoyImg, 0.28, -0.04, 0.17, -12)
  drawRotatedHat(hatGirlImg, 0.585, -0.06, 0.175, 10)

  // 四周蜡笔手账涂鸦点缀（对齐 frames/frame_088.5.jpg 壁纸效果）
  ctx.save()
  ctx.translate(210, 800)
  ctx.rotate(-0.26)
  ctx.font = 'bold 88px Georgia, serif'
  ctx.fillStyle = '#628AC4'
  ctx.fillText('OH!', 0, 0)
  ctx.restore()

  ctx.save()
  ctx.translate(820, 740)
  ctx.rotate(0.14)
  ctx.fillStyle = '#9E3A64'
  ctx.font = 'bold 42px Georgia, serif'
  ctx.fillText('LEMME', 20, 0)
  ctx.fillText('KEEP', 40, 48)
  ctx.fillText('YOU IN', 10, 96)
  ctx.fillText('MY POCKET', -10, 144)
  ctx.restore()

  // 黄色微笑弧线
  ctx.save()
  ctx.strokeStyle = '#F4B742'
  ctx.lineWidth = 10
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(815, 1645)
  ctx.quadraticCurveTo(860, 1692, 905, 1645)
  ctx.stroke()
  ctx.fillStyle = '#2D4A68'
  ctx.beginPath()
  ctx.arc(840, 1622, 6, 0, Math.PI * 2)
  ctx.arc(880, 1622, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // 底部日期签章（稳稳避开锁屏底部消息通知卡）
  ctx.fillStyle = '#8C6D53'
  ctx.textAlign = 'center'
  ctx.font = '30px monospace'
  ctx.fillText('2026.12.14 · guaiguai & choice', W / 2, 1748)

  const url = canvas.toDataURL('image/png')
  wallpaperPreviewUrl.value = url
  return url
}

async function onClickSaveWallpaper() {
  if (props.isUnderlay || wallpaperBusy.value || savedToastVisible.value || wechatModalOpen.value) return
  playTap()
  wallpaperBusy.value = true
  try {
    const url = await generateWallpaper1170x2532()
    const isWeChat = /MicroMessenger/i.test(navigator.userAgent)

    if (isWeChat) {
      wechatModalOpen.value = true
      await nextTick()
      wallpaperModalEl.value?.focus()
    } else {
      const a = document.createElement('a')
      a.href = url
      a.download = 'guaiguai_23_wallpaper.png'
      document.body.appendChild(a)
      a.click()
      a.remove()

      savedToastVisible.value = true
      playWindChime()
      setTimeout(() => {
        savedToastVisible.value = false
        phase.value = 'lockscreen'
      }, 900)
    }
  } finally {
    wallpaperBusy.value = false
  }
}

function finishWallpaperModal() {
  playTap()
  wechatModalOpen.value = false
  phase.value = 'lockscreen'
}

function onGoNext() {
  playTap()
  emit('complete', 'prop-handoff')
}

async function intro() {
  claimProp('child_boy_frag')
  claimProp('child_girl_frag')
}

function play() {
  void nextTick().then(() => {
    if (phase.value === 'puzzle') {
      setupFragmentDrags()
    }
  })
}

async function outro(_nextScene: SceneId): Promise<HandoffProp[]> {
  clearFragDrags()
  playPaperTearTick(0.6)

  if (nextWrapEl.value) {
    gsap.to(nextWrapEl.value, { opacity: 0, duration: 0.22 })
  }
  if (phoneFrameEl.value) {
    gsap.to(phoneFrameEl.value, {
      x: -220,
      rotation: -14,
      opacity: 0,
      duration: 0.54,
      ease: 'power2.in',
    })
  }

  // 一镜到底 10→11：从翻开的手机书页夹层中滑落 6 张彩色手撕纸条
  const slipColors = SITE_CONFIG.scene11.slips.map((s) => s.color)
  slipColors.forEach((col, i) => {
    handOverProp({
      id: `slip_fly_${i}`,
      kind: 'html',
      x: 560,
      y: 260,
      width: 240,
      height: 58,
      rotation: (i - 2.5) * 6,
      opacity: 0.96,
      zIndex: 48,
      html: `<div style="width:100%;height:100%;background:${col};border-radius:3px;box-shadow:0 8px 18px rgba(43,35,29,0.22);"></div>`,
    })
  })

  await Promise.all(
    slipColors.map((_c, i) =>
      animateProp(`slip_fly_${i}`, {
        x: 680 + (i % 2) * 140,
        y: 120 + i * 80,
        rotation: (i % 2 === 0 ? -5 : 4),
        duration: 0.58,
        ease: 'power2.out',
      }),
    ),
  )

  return []
}

onMounted(() => {
  void nextTick().then(() => {
    if (!props.isUnderlay && phase.value === 'puzzle') {
      setupFragmentDrags()
    }
  })
})

onBeforeUnmount(() => {
  clearFragDrags()
})

defineExpose({
  intro,
  play,
  outro,
})
</script>

<style scoped>
.scene-10 {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 720px;
  overflow: hidden;
}

.scene-header {
  position: absolute;
  left: 72px;
  top: 40px;
  z-index: 20;
}

.title-main {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 44px;
  font-weight: 400;
  color: var(--ink);
}

.merge-guide-box {
  position: absolute;
  left: 468px;
  top: 196px;
  width: 344px;
  height: 294px;
  border-radius: 14px;
  border: 2.5px dashed rgba(138, 109, 83, 0.35);
  background: rgba(250, 243, 232, 0.42);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 12px;
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--ink-soft);
  pointer-events: none;
}

.child-fragment {
  position: absolute;
  width: 268px;
  height: 312px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: grab;
  touch-action: none;
  user-select: none;
  z-index: 22;
}

.torn-photo-card {
  position: relative;
  width: 246px;
  height: 268px;
  background: #FFFFFF;
  padding: 16px;
  filter: drop-shadow(0 12px 24px rgba(43, 35, 29, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
}

.torn-photo-card.seed-a {
  clip-path: polygon(
    1% 5%, 10% 1%, 21% 4%, 34% 0%, 48% 3%, 62% 0%, 76% 4%, 89% 1%, 99% 4%,
    97% 18%, 100% 34%, 96% 52%, 99% 68%, 97% 84%, 99% 96%,
    85% 99%, 70% 96%, 54% 100%, 38% 96%, 22% 99%, 8% 96%, 1% 95%,
    3% 80%, 0% 66%, 3% 48%, 0% 32%, 2% 18%
  );
}

.torn-photo-card.seed-b {
  clip-path: polygon(
    0% 3%, 14% 0%, 28% 3%, 42% 0%, 56% 4%, 72% 1%, 86% 4%, 99% 3%,
    97% 20%, 100% 38%, 97% 55%, 100% 72%, 97% 88%, 98% 97%,
    84% 99%, 68% 96%, 52% 99%, 36% 96%, 20% 100%, 6% 96%, 2% 95%,
    0% 78%, 3% 62%, 0% 45%, 3% 28%, 1% 14%
  );
}

.frag-hat {
  position: absolute;
  height: auto;
  pointer-events: none;
  z-index: 8;
  filter: drop-shadow(0 5px 8px rgba(43, 35, 29, 0.24));
}

.frag-hat-boy {
  left: 126px;
  top: -24px;
  width: 82px;
  transform: rotate(5deg);
}

.frag-hat-girl {
  left: 44px;
  top: -28px;
  width: 84px;
  transform: rotate(-10deg);
}

.frag-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
  pointer-events: none;
}

.wow-sticker {
  position: absolute;
  right: 16px;
  top: 14px;
  padding: 3px 9px;
  border-radius: 6px;
  background: #231D1A;
  color: #FFE36E;
  font-family: Comic Sans MS, sans-serif;
  font-weight: 800;
  font-size: 16px;
  transform: rotate(9deg);
}

.frag-caption {
  font-family: var(--font-hand);
  font-size: 24px;
  color: var(--ink);
}

.frag-hand {
  position: absolute;
  right: -28px;
  bottom: 44px;
}

/* 阶段二：童年合框 + 涂鸦 + 存壁纸 */
.merged-headline {
  position: absolute;
  left: 50%;
  top: 40px;
  transform: translateX(-50%);
  margin: 0;
  font-family: var(--font-hand);
  font-size: 46px;
  font-weight: 400;
  color: var(--ink);
  white-space: nowrap;
}

.merged-composition {
  position: absolute;
  left: 300px;
  top: 102px;
  width: 680px;
  height: 490px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.doodles-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 6;
}

.merged-photo-cloud {
  position: relative;
  width: 454px;
  padding: 16px;
  border: none;
  background: #FFFFFF;
  border-radius: 18px;
  box-shadow: 0 18px 42px rgba(43, 35, 29, 0.16);
  z-index: 4;
}

.merged-photo-frame {
  position: relative;
  display: block;
  width: 100%;
}

.merged-photo-img {
  width: 100%;
  height: auto;
  border-radius: 10px;
  display: block;
}

.merged-hat {
  position: absolute;
  height: auto;
  pointer-events: none;
  z-index: 5;
  filter: drop-shadow(0 5px 10px rgba(43, 35, 29, 0.24));
}

.merged-hat-boy {
  left: 28%;
  top: -4%;
  width: 17%;
  transform: rotate(-12deg);
}

.merged-hat-girl {
  left: 58.5%;
  top: -6%;
  width: 17.5%;
  transform: rotate(10deg);
}

.merged-wow-tag {
  position: absolute;
  right: 46px;
  top: 102px;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(35, 29, 26, 0.85);
  color: #FFFDF8;
  font-family: Comic Sans MS, sans-serif;
  font-weight: 800;
  font-size: 14px;
  transform: rotate(8deg);
  z-index: 6;
}

.save-cta-hand {
  position: absolute;
  right: 108px;
  bottom: 114px;
  z-index: 7;
}

.saved-toast {
  position: absolute;
  left: 50%;
  bottom: 98px;
  transform: translateX(-50%);
  padding: 8px 22px;
  border-radius: 999px;
  background: #2D8C56;
  color: #FFFFFF;
  font-family: var(--font-body);
  font-size: 18px;
  box-shadow: 0 8px 20px rgba(24, 72, 42, 0.32);
  z-index: 35;
}

/* 阶段三：iPhone 12.14 零点灵动岛锁屏 */
.iphone-bezel {
  position: absolute;
  left: 496px;
  top: 56px;
  width: 288px;
  height: 604px;
  border-radius: 44px;
  background: #1C1917;
  padding: 10px;
  box-shadow: 0 24px 56px rgba(20, 14, 10, 0.34);
  z-index: 20;
}

.iphone-screen {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 36px;
  overflow: hidden;
  background: #FFFFFF;
}

.iphone-wallpaper-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.iphone-wallpaper-img.is-raw-photo {
  object-fit: contain;
  padding: 190px 14px 120px;
  background: linear-gradient(180deg, #FDF9F2 0%, #FFFFFF 100%);
}

.dynamic-island {
  position: absolute;
  left: 50%;
  top: 12px;
  transform: translateX(-50%);
  width: 84px;
  height: 22px;
  border-radius: 999px;
  background: #111111;
  z-index: 4;
}

.lock-clock-box {
  position: absolute;
  left: 0;
  right: 0;
  top: 46px;
  text-align: center;
  z-index: 4;
  text-shadow: 0 2px 14px rgba(43, 35, 29, 0.45);
}

.lock-date {
  font-family: var(--font-sans-cn);
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
  -webkit-text-stroke: 0.4px rgba(43, 35, 29, 0.35);
}

.lock-time {
  font-family: var(--font-sans-cn);
  font-size: 62px;
  font-weight: 700;
  line-height: 1;
  color: #FFFFFF;
  letter-spacing: -1px;
  -webkit-text-stroke: 1px rgba(43, 35, 29, 0.25);
}

.ios-notify-card {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 72px;
  padding: 10px 12px;
  border-radius: 16px;
  border: 1px solid rgba(182, 150, 122, 0.28);
  background: rgba(252, 249, 244, 0.94);
  box-shadow: 0 10px 24px rgba(24, 18, 14, 0.22);
  text-align: left;
  cursor: pointer;
  z-index: 6;
  transition: transform 0.16s ease;
}

.ios-notify-card:active {
  transform: scale(0.97);
}

.notify-head {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ink);
}

.notify-app-dot {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background: #E84A7F;
  color: #FFFFFF;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.notify-sender {
  font-weight: 700;
}

.notify-time {
  margin-left: auto;
  font-size: 11px;
  color: var(--ink-soft);
}

.notify-body {
  margin: 5px 0 0;
  font-family: var(--font-sans-cn);
  font-size: 12.5px;
  line-height: 1.4;
  color: #2B231D;
}

.lock-bottom-icons {
  position: absolute;
  left: 22px;
  right: 22px;
  bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 4;
}

.lock-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(36, 29, 24, 0.36);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.home-indicator {
  width: 96px;
  height: 4px;
  border-radius: 999px;
  background: rgba(43, 35, 29, 0.65);
}

.notify-hand {
  position: absolute;
  right: -18px;
  bottom: 58px;
  z-index: 12;
}

.next-wrap {
  position: absolute;
  right: 44px;
  bottom: 28px;
  z-index: 35;
}

.time-flash {
  position: absolute;
  inset: 0;
  background: #FFFFFF;
  pointer-events: none;
  z-index: 50;
}

/* 微信内高清壁纸长按保存全屏预览弹窗 */
.wallpaper-modal-backdrop {
  position: absolute;
  inset: 0;
  z-index: 65;
  background: rgba(24, 18, 14, 0.78);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.wallpaper-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  cursor: default;
}

.wechat-save-tip {
  margin: 0;
  padding: 6px 18px;
  border-radius: 999px;
  background: rgba(255, 250, 241, 0.94);
  font-family: var(--font-hand);
  font-size: 24px;
  color: var(--ink);
}

.wallpaper-modal-img {
  height: 510px;
  width: auto;
  border-radius: 18px;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.45);
  pointer-events: auto;
  -webkit-touch-callout: default;
}

</style>
