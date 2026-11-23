<template>
  <div class="scene-stub">
    <PaperBg variant="parchment">
      <Bunting variant="corner" />
      <div class="stub-card">
        <p class="stub-badge">Chapter {{ String(sceneId).padStart(2, '0') }}</p>
        <h2 class="stub-title">{{ title }}</h2>
        <p class="stub-desc">这一幕将在下一里程碑（M2–M5）完成交互组装，目前可先试玩第 1 幕拆礼与第 2 幕预览~</p>
        <button type="button" class="stub-btn" @click="$emit('jump', 1)">回到第 1 幕拆礼物 ↺</button>
      </div>
    </PaperBg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SITE_CONFIG, type SceneId } from '../config'
import Bunting from '../components/Bunting.vue'
import PaperBg from '../components/PaperBg.vue'

const props = defineProps<{ sceneId: SceneId }>()
defineEmits<{ jump: [id: SceneId] }>()

const title = computed(() => SITE_CONFIG.sceneTitles[props.sceneId - 1] ?? `第 ${props.sceneId} 幕`)
</script>

<style scoped>
.scene-stub {
  position: absolute;
  inset: 0;
}

.stub-card {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 620px;
  padding: 40px 44px;
  background: rgba(255, 253, 248, 0.94);
  border: 2px dashed rgba(138, 109, 83, 0.45);
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 12px 30px rgba(43, 35, 29, 0.12);
}

.stub-badge {
  margin: 0 0 8px;
  font-family: var(--font-serif-en);
  font-size: 16px;
  color: var(--accent-red);
  letter-spacing: 3px;
}

.stub-title {
  margin: 0 0 16px;
  font-family: var(--font-hand);
  font-size: 42px;
  color: var(--ink);
}

.stub-desc {
  margin: 0 0 28px;
  font-family: var(--font-body);
  font-size: 19px;
  color: var(--ink-soft);
  line-height: 1.65;
}

.stub-btn {
  padding: 10px 24px;
  border-radius: 999px;
  border: 1.5px solid var(--accent-red);
  background: var(--accent-red);
  color: #fff;
  font-family: var(--font-hand);
  font-size: 24px;
}
</style>
