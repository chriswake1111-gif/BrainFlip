<template>
  <div class="landing-container glass-card fade-in">
    <!-- Header Badge -->
    <div class="pill-badge glow-badge">
      ⚡ 45 秒極限 Stroop 逆轉測試
    </div>

    <!-- Main Title -->
    <h1 class="game-title">
      腦齡大逆轉
      <span class="sub-title">Brain Age Switch</span>
    </h1>

    <!-- Best Score Record (Local-First) -->
    <div v-if="bestRecord" class="best-record-box">
      <div class="record-label">🏆 你的歷史最高紀錄</div>
      <div class="record-value">
        腦齡 <span class="highlight-age">{{ bestRecord.age }}</span> 歲
        <span class="record-title">{{ bestRecord.title }}</span>
      </div>
      <div class="record-score">最高得分：{{ bestRecord.score }} 分</div>
    </div>

    <!-- Game Stages Intro -->
    <div class="rules-box">
      <h3 class="rules-header">⚔️ 關卡逆轉規則</h3>
      <div class="stage-step">
        <span class="step-num">S1</span>
        <div class="step-desc">
          <strong>10 秒【看顏色】</strong>
          <span>字的「墨水顏色」是什麼就點什麼</span>
        </div>
      </div>
      <div class="stage-step warning-step">
        <span class="step-num warning-tag">0.5s</span>
        <div class="step-desc">
          <strong>⚠️ 衝擊波警告 1</strong>
          <span>規則瞬間逆轉！強制切換腦迴路</span>
        </div>
      </div>
      <div class="stage-step">
        <span class="step-num">S2</span>
        <div class="step-desc">
          <strong>15 秒【看文字】</strong>
          <span>改看字面「寫什麼字」就點什麼</span>
        </div>
      </div>
      <div class="stage-step warning-step">
        <span class="step-num warning-tag">0.5s</span>
        <div class="step-desc">
          <strong>⚠️ 衝擊波警告 2</strong>
          <span>進入終極大亂鬥！</span>
        </div>
      </div>
      <div class="stage-step">
        <span class="step-num">S3</span>
        <div class="step-desc">
          <strong>15 秒 隨機大亂鬥</strong>
          <span>每題頂部標籤隨機出現【看顏色】或【看文字】</span>
        </div>
      </div>
    </div>

    <!-- Start Button CTA -->
    <button class="btn-start pulse-btn" @click="$emit('start')">
      🔥 開始大腦逆轉檢測
    </button>

    <!-- PWA Install Prompt Banner -->
    <div v-if="deferredPrompt || isIOS" class="pwa-install-box">
      <button v-if="deferredPrompt" class="btn-pwa-install" @click="installPWA">
        📲 一鍵加到桌面 (PWA 免下載 App)
      </button>
      <div v-else-if="isIOS" class="ios-install-hint">
        💡 iOS 秘技：點擊 Safari 下方「分享 ⎋」➔「加入主畫面 ➕」即可全螢幕遊玩！
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

defineEmits(['start']);

const bestRecord = ref(null);
const deferredPrompt = ref(null);
const isIOS = ref(false);

function handleBeforeInstallPrompt(e) {
  e.preventDefault();
  deferredPrompt.value = e;
}

async function installPWA() {
  if (!deferredPrompt.value) return;
  deferredPrompt.value.prompt();
  const { outcome } = await deferredPrompt.value.userChoice;
  if (outcome === 'accepted') {
    deferredPrompt.value = null;
  }
}

onMounted(() => {
  try {
    const saved = localStorage.getItem('brain_flip_best_record');
    if (saved) {
      bestRecord.value = JSON.parse(saved);
    }
  } catch (e) {}

  // Detect iOS Safari
  const ua = window.navigator.userAgent;
  isIOS.value = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
});

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
});
</script>

<style scoped>
.landing-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  padding: 2rem 1.5rem;
  max-width: 440px;
  width: 100%;
  margin: 0 auto;
  text-align: center;
}

.pill-badge {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  color: #a7f3d0;
}

.game-title {
  font-size: 2.4rem;
  font-weight: 900;
  background: linear-gradient(135deg, #60a5fa 0%, #a7f3d0 50%, #f472b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  margin: 0.2rem 0;
}

.sub-title {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  color: #94a3b8;
  letter-spacing: 0.15em;
  margin-top: 0.2rem;
}

.best-record-box {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(59, 130, 246, 0.4);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);
  padding: 1rem;
  border-radius: 12px;
  width: 100%;
}

.record-label {
  font-size: 0.8rem;
  color: #94a3b8;
}

.record-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #f8fafc;
  margin: 0.3rem 0;
}

.highlight-age {
  color: #f43f5e;
  font-size: 1.6rem;
  font-weight: 900;
}

.record-title {
  font-size: 0.9rem;
  color: #38bdf8;
  margin-left: 0.5rem;
}

.record-score {
  font-size: 0.85rem;
  color: #a7f3d0;
}

.rules-box {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 1.2rem;
  width: 100%;
  text-align: left;
}

.rules-header {
  font-size: 0.95rem;
  color: #cbd5e1;
  margin-bottom: 0.8rem;
  text-align: center;
}

.stage-step {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.stage-step:last-child {
  border-bottom: none;
}

.step-num {
  background: #3b82f6;
  color: #fff;
  font-weight: bold;
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  min-width: 32px;
  text-align: center;
}

.warning-tag {
  background: #f59e0b !important;
  color: #000 !important;
}

.step-desc {
  display: flex;
  flex-direction: column;
  font-size: 0.82rem;
}

.step-desc strong {
  color: #f1f5f9;
}

.step-desc span {
  color: #94a3b8;
  font-size: 0.75rem;
}

.btn-start {
  width: 100%;
  padding: 1.1rem;
  font-size: 1.2rem;
  font-weight: 800;
  color: #ffffff;
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%);
  border: none;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(236, 72, 153, 0.4);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn-start:active {
  transform: scale(0.97);
}

.pulse-btn {
  animation: pulseGlow 2s infinite;
}

@keyframes pulseGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(236, 72, 153, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(236, 72, 153, 0);
  }
}

.pwa-install-box {
  width: 100%;
  margin-top: 0.5rem;
}

.btn-pwa-install {
  width: 100%;
  padding: 0.75rem;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid #10b981;
  color: #34d399;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.btn-pwa-install:active {
  transform: scale(0.97);
}

.ios-install-hint {
  font-size: 0.75rem;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 0.6rem 0.8rem;
  line-height: 1.4;
}
</style>
