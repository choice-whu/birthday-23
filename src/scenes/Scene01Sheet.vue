<template>
  <div class="sheet-layer">
    <PaperBg variant="kraft">
      <Bunting variant="corner" />

      <!-- 倾斜 +3deg 白色打孔手账礼单（还原 frames/frame_001.0.jpg 版式） -->
      <div class="gift-slip">
        <div class="slip-scallops" aria-hidden="true">
          <span v-for="n in 25" :key="n" class="scallop-hole" />
        </div>

        <div class="slip-inner">
          <!-- 顶部 To / Topic / HBD 栏 -->
          <div class="slip-header">
            <div class="ledger-col">
              <div class="ledger-row">
                <span class="ledger-label">To:</span>
                <span class="ledger-value">{{ cfg.to }}</span>
              </div>
              <div class="ledger-row">
                <span class="ledger-label">Topic:</span>
                <span class="ledger-value">{{ cfg.topic }}</span>
              </div>
            </div>
            <div class="hbd-badge">
              <div class="hbd-main">{{ cfg.badge }}</div>
              <div class="hbd-sub">{{ cfg.badgeSub }}</div>
            </div>
          </div>

          <!-- 英文大字标题 A GIFT / FOR YOU -->
          <div class="en-title">
            <div>{{ cfg.enTitle[0] }}</div>
            <div>{{ cfg.enTitle[1] }}</div>
          </div>

          <!-- 毛笔核心大字「想送你 / 1份礼物」 -->
          <div class="cn-title">
            <div class="cn-line-1">{{ cfg.cnTitle[0] }}</div>
            <div class="cn-line-2">{{ cfg.cnTitle[1] }}</div>
          </div>

          <!-- 底部红色邮戳 + 日期与签收栏 -->
          <div class="slip-footer">
            <svg class="postmark-svg" viewBox="0 0 120 120" aria-hidden="true">
              <defs>
                <path id="pm-top-arc" d="M 22,60 A 38,38 0 1,1 98,60" />
                <path id="pm-bot-arc" d="M 22,64 A 38,38 0 0,0 98,64" />
              </defs>
              <circle cx="60" cy="60" r="52" fill="none" stroke="#C83E3B" stroke-width="2.4" />
              <circle cx="60" cy="60" r="46" fill="none" stroke="#C83E3B" stroke-width="1" stroke-dasharray="3 2" />
              <circle cx="60" cy="60" r="29" fill="none" stroke="#C83E3B" stroke-width="1.3" />
              <text font-size="8.4" font-family="Georgia, serif" font-weight="700" fill="#C83E3B" letter-spacing="1.2">
                <textPath href="#pm-top-arc" startOffset="50%" text-anchor="middle">
                  {{ cfg.stampTop }}
                </textPath>
              </text>
              <text
                x="60"
                y="66"
                text-anchor="middle"
                font-size="18"
                font-weight="700"
                font-family="Georgia, serif"
                fill="#C83E3B"
              >
                {{ cfg.stampYear }}
              </text>
              <text font-size="9" font-family="BodyFont, serif" fill="#C83E3B" letter-spacing="1.5">
                <textPath href="#pm-bot-arc" startOffset="50%" text-anchor="middle">
                  {{ cfg.stampBottom }}
                </textPath>
              </text>
            </svg>

            <div class="sign-block">
              <div class="sign-meta">
                <span>12.14（农历冬月）</span>
                <span>有效期：一辈子</span>
              </div>
              <div class="sign-date">{{ cfg.dateRange }}</div>
              <div class="sign-line">
                <span class="sign-key">收件人</span>
                <span class="sign-val">{{ cfg.recipient }}</span>
              </div>
              <div class="sign-line">
                <span class="sign-key" aria-hidden="true">　　　</span>
                <span class="sign-val sign-note">{{ cfg.signNote }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PaperBg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Bunting from '../components/Bunting.vue'
import PaperBg from '../components/PaperBg.vue'
import { SITE_CONFIG } from '../config'

const cfg = computed(() => SITE_CONFIG.scene1)
</script>

<style scoped>
.sheet-layer {
  position: relative;
  width: 1280px;
  height: 720px;
  overflow: hidden;
}

.gift-slip {
  position: absolute;
  left: 454px;
  top: 48px;
  width: 372px;
  height: 626px;
  transform: rotate(3.2deg);
  background: #FFFDF9;
  border-radius: 3px;
  box-shadow:
    0 18px 42px rgba(43, 35, 29, 0.28),
    0 3px 10px rgba(43, 35, 29, 0.14);
}

/* 左侧活页装订半圆打孔质感 */
.slip-scallops {
  position: absolute;
  left: -8px;
  top: 12px;
  bottom: 12px;
  width: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
  z-index: 3;
}

.scallop-hole {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: var(--bg-kraft);
  box-shadow: inset -1.5px 0 2px rgba(43, 35, 29, 0.22);
}

.slip-inner {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 20px 26px 22px 34px;
  display: flex;
  flex-direction: column;
}

.slip-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.ledger-col {
  flex: 1;
}

.ledger-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  border-bottom: 1px solid rgba(92, 75, 62, 0.35);
  padding: 5px 0 3px;
  font-size: 13px;
  color: var(--ink-soft);
}

.ledger-label {
  font-family: var(--font-serif-en);
  font-style: italic;
  font-size: 12px;
  color: var(--ink-faint);
}

.ledger-value {
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--ink);
  font-weight: 600;
}

.hbd-badge {
  text-align: right;
  padding-top: 2px;
  flex-shrink: 0;
}

.hbd-main {
  font-family: var(--font-sans-en);
  font-weight: 800;
  font-size: 18px;
  color: var(--accent-red);
  letter-spacing: 0.4px;
}

.hbd-sub {
  font-family: var(--font-sans-en);
  font-size: 9px;
  color: var(--ink-faint);
  margin-top: 2px;
}

.en-title {
  margin-top: 38px;
  font-family: var(--font-sans-en);
  font-weight: 900;
  font-size: 38px;
  line-height: 0.96;
  color: #1F1915;
  letter-spacing: 1px;
  transform: rotate(-1.5deg);
}

.cn-title {
  margin-top: 12px;
  font-family: var(--font-brush);
  color: #15100D;
  line-height: 1.04;
  text-shadow: 0 2px 0 rgba(255, 250, 240, 0.72);
  user-select: none;
}

.cn-line-1 {
  font-size: 92px;
  letter-spacing: 8px;
  padding-left: 4px;
}

.cn-line-2 {
  font-size: 104px;
  letter-spacing: 4px;
  margin-top: 2px;
}

.slip-footer {
  margin-top: auto;
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.postmark-svg {
  width: 96px;
  height: 96px;
  flex-shrink: 0;
  transform: rotate(-14deg);
  opacity: 0.92;
}

.sign-block {
  flex: 1;
  padding-bottom: 4px;
}

.sign-meta {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--ink-faint);
  border-bottom: 1px solid rgba(92, 75, 62, 0.25);
  padding-bottom: 3px;
}

.sign-date {
  margin: 6px 0 8px;
  font-family: var(--font-sans-en);
  font-weight: 800;
  font-size: 22px;
  color: var(--ink);
  letter-spacing: 0.5px;
}

.sign-line {
  display: flex;
  align-items: baseline;
  gap: 8px;
  border-bottom: 1px solid rgba(92, 75, 62, 0.35);
  padding: 4px 0 2px;
  font-size: 12.5px;
}

.sign-key {
  font-family: var(--font-hand);
  font-size: 18.5px;
  color: var(--ink-soft);
  flex-shrink: 0;
}

.sign-val {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--ink);
  white-space: nowrap;
}

.sign-note {
  color: var(--ink-soft);
}
</style>
