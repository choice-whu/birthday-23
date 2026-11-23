<template>
  <div class="dressed-avatar" :class="{ 'has-sticker': stickerOutline }">
    <!-- 蛋糕立牌白色小签子（幕 4 露出底部签子） -->
    <div v-if="showStick" class="topper-stick" aria-hidden="true" />

    <!-- 贴纸描边包裹层：让脸部与配饰拥有一体白色手账剪裁描边 -->
    <div class="avatar-silhouette">
      <img
        :src="assetUrl('assets/photos/her_face_cut.webp')"
        alt="佳奇 guaiguai"
        class="avatar-face"
      />

      <!-- 佩戴的头饰（皇冠 / 粉色波点帽 / 蝴蝶结 / 春日花环） -->
      <img
        v-if="hatId === 'crown_gold'"
        :src="assetUrl('assets/art/crown_gold.webp')"
        alt="金色皇冠"
        class="worn-hat hat-crown"
      />
      <img
        v-else-if="hatId === 'hat_pink_dots'"
        :src="assetUrl('assets/art/hat_pink_dots.webp')"
        alt="粉色波点生日帽"
        class="worn-hat hat-dots"
      />
      <div v-else-if="hatId" class="worn-hat" :class="`hat-${hatId}`">
        <AccessoryArt :id="hatId" />
      </div>

      <!-- 佩戴的墨镜或面部贴纸（爱心墨镜 / 像素墨镜 / 圆框镜 / 星光腮红） -->
      <img
        v-if="glassesId === 'glasses_heart'"
        :src="assetUrl('assets/art/glasses_heart.webp')"
        alt="爱心墨镜"
        class="worn-glasses glasses-heart"
      />
      <div v-else-if="glassesId" class="worn-glasses" :class="`glasses-${glassesId}`">
        <AccessoryArt :id="glassesId" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { assetUrl } from '../engine/audio'
import AccessoryArt from './AccessoryArt.vue'

withDefaults(
  defineProps<{
    hatId?: string
    glassesId?: string
    showStick?: boolean
    stickerOutline?: boolean
  }>(),
  {
    showStick: false,
    stickerOutline: true,
  },
)
</script>

<style scoped>
.dressed-avatar {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.avatar-silhouette {
  position: relative;
  width: 100%;
  height: 100%;
}

.dressed-avatar.has-sticker .avatar-silhouette {
  filter:
    drop-shadow(3px 0 0 #FFFFFF)
    drop-shadow(-3px 0 0 #FFFFFF)
    drop-shadow(0 3px 0 #FFFFFF)
    drop-shadow(0 -3px 0 #FFFFFF)
    drop-shadow(2px 2px 0 #FFFFFF)
    drop-shadow(-2px -2px 0 #FFFFFF)
    drop-shadow(0 8px 14px rgba(43, 35, 29, 0.24));
}

.avatar-face {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.worn-hat {
  position: absolute;
  left: 52%;
  height: auto;
  pointer-events: none;
}

.hat-crown {
  top: -12%;
  width: 58%;
  transform: translateX(-50%) rotate(-3deg);
}

.hat-dots {
  top: -34%;
  width: 48%;
  transform: translateX(-50%) rotate(-4deg);
}

.hat-bow_red {
  top: -15%;
  width: 58%;
  transform: translateX(-50%) rotate(-4deg);
}

.hat-flower_wreath {
  top: -7%;
  width: 68%;
  transform: translateX(-50%) rotate(-2deg);
}

.worn-glasses {
  position: absolute;
  left: 60%;
  top: 59%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.glasses-heart {
  width: 56%;
  height: auto;
}

.glasses-pixel_sunglasses {
  width: 55%;
}

.glasses-glasses_round {
  width: 56%;
}

.glasses-blush_stars {
  left: 59%;
  top: 66%;
  width: 64%;
}

.topper-stick {
  position: absolute;
  left: 50%;
  top: 90%;
  width: 7px;
  height: 30%;
  transform: translateX(-50%);
  border-radius: 3px;
  background: linear-gradient(90deg, #EED6B2 0%, #FFF7E8 45%, #D3B282 100%);
  box-shadow: 0 3px 6px rgba(43, 35, 29, 0.25);
}
</style>
