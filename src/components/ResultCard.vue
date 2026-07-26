<template>
  <div class="result-container fade-in">
    <!-- IG Story 1080x1920 Canvas Preview Container -->
    <div ref="cardRef" class="share-card-canvas">
      <div class="card-inner">
        <!-- Card Header -->
        <div class="card-header">
          <div class="card-brand">🧠 腦齡大逆轉 | BRAIN AGE SWITCH</div>
          <div class="age-badge-container">
            <span class="age-label">大腦年齡</span>
            <div class="age-number-box">
              <span class="age-val">{{ brainResult.age }}</span>
              <span class="age-unit">歲</span>
            </div>
            <div class="title-tag">{{ brainResult.title }}</div>
          </div>
        </div>

        <!-- Toxic Commentary -->
        <div class="comment-box">
          <div class="quote-mark">“</div>
          <p class="comment-text">{{ brainResult.comment }}</p>
          <div class="quote-mark right-quote">”</div>
        </div>

        <!-- Radar Chart Container -->
        <div class="radar-container">
          <canvas ref="radarCanvasRef" width="240" height="170"></canvas>
        </div>

        <!-- Quick Stats Breakdown -->
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-val">{{ brainResult.accuracy }}%</div>
            <div class="stat-lbl">正確率</div>
          </div>
          <div class="stat-item">
            <div class="stat-val">{{ brainResult.avgReactionTime }}<small>ms</small></div>
            <div class="stat-lbl">平均反應</div>
          </div>
          <div class="stat-item">
            <div class="stat-val">{{ brainResult.switchCost }}<small>ms</small></div>
            <div class="stat-lbl">切換成本</div>
          </div>
        </div>

        <!-- Bottom QR & Social Call -->
        <div class="card-footer">
          <div class="qr-box">
            <canvas ref="qrCanvasRef" width="56" height="56"></canvas>
          </div>
          <div class="footer-info">
            <div class="footer-title">⚡ 掃碼挑戰我的腦齡</div>
            <div class="footer-url">brain-age-switch.pwa</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="actions-group">
      <button class="btn-action btn-share" :disabled="isExporting" @click="shareResult">
        <span v-if="!isExporting">🚀 分享至 IG / Threads / LINE</span>
        <span v-else>⏳ 正在生成卡片...</span>
      </button>

      <button class="btn-action btn-download" :disabled="isExporting" @click="downloadCard">
        📥 儲存卡片圖片
      </button>

      <button class="btn-action btn-retry" @click="$emit('retry')">
        🔄 再次挑戰逆轉
      </button>
    </div>

    <!-- Image Preview Modal (Fallback) -->
    <div v-if="previewImage" class="modal-backdrop" @click="previewImage = null">
      <div class="modal-content" @click.stop>
        <h3>📸 長按即可儲存/分享圖片</h3>
        <img :src="previewImage" class="modal-img" alt="Brain Age Result Card" />
        <button class="btn-close-modal" @click="previewImage = null">關閉</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';

const props = defineProps({
  brainResult: {
    type: Object,
    required: true
  }
});

defineEmits(['retry']);

const cardRef = ref(null);
const radarCanvasRef = ref(null);
const qrCanvasRef = ref(null);
const isExporting = ref(false);
const previewImage = ref(null);

// Render Radar Chart on HTML5 Canvas
function drawRadarChart() {
  const canvas = radarCanvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2 + 5;
  const radius = 52;

  const metrics = [
    { label: '反射神經', value: props.brainResult.radar.reaction, angle: -Math.PI / 2 },
    { label: '抗干擾力', value: props.brainResult.radar.accuracy, angle: Math.PI / 6 },
    { label: '切換靈活性', value: props.brainResult.radar.flexibility, angle: (5 * Math.PI) / 6 }
  ];

  // Draw background concentric triangles
  for (let r = 1; r >= 0.25; r -= 0.25) {
    ctx.beginPath();
    metrics.forEach((m, idx) => {
      const x = centerX + Math.cos(m.angle) * (radius * r);
      const y = centerY + Math.sin(m.angle) * (radius * r);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw axis lines & labels
  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  metrics.forEach((m) => {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    const endX = centerX + Math.cos(m.angle) * radius;
    const endY = centerY + Math.sin(m.angle) * radius;
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();

    const labelX = centerX + Math.cos(m.angle) * (radius + 20);
    const labelY = centerY + Math.sin(m.angle) * (radius + 15);
    ctx.fillText(`${m.label} ${m.value}`, labelX, labelY);
  });

  // Draw User Stat Polygon
  ctx.beginPath();
  metrics.forEach((m, idx) => {
    const valRatio = Math.max(0.1, m.value / 100);
    const x = centerX + Math.cos(m.angle) * (radius * valRatio);
    const y = centerY + Math.sin(m.angle) * (radius * valRatio);
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();

  ctx.fillStyle = 'rgba(244, 114, 182, 0.4)';
  ctx.fill();
  ctx.strokeStyle = '#f472b6';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Draw a stylized QR code canvas
function drawQRCode() {
  const canvas = qrCanvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 56, 56);

  ctx.fillStyle = '#0f172a';
  // Corner blocks
  ctx.fillRect(4, 4, 16, 16);
  ctx.fillRect(36, 4, 16, 16);
  ctx.fillRect(4, 36, 16, 16);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(7, 7, 10, 10);
  ctx.fillRect(39, 7, 10, 10);
  ctx.fillRect(7, 39, 10, 10);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(9, 9, 6, 6);
  ctx.fillRect(41, 9, 6, 6);
  ctx.fillRect(9, 41, 6, 6);

  // Random data dots pattern
  const grid = [
    [0,1,0,1,0],
    [1,0,1,0,1],
    [0,1,1,1,0],
    [1,0,0,1,1]
  ];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === 1) {
        ctx.fillRect(8 + c * 8, 24 + r * 6, 4, 4);
      }
    }
  }
}

async function exportCardImage() {
  isExporting.value = true;
  try {
    const dataUrl = await toPng(cardRef.value, { quality: 0.95, pixelRatio: 2 });
    isExporting.value = false;
    return dataUrl;
  } catch (err) {
    console.error('Failed to render card image:', err);
    isExporting.value = false;
    return null;
  }
}

async function shareResult() {
  const dataUrl = await exportCardImage();
  if (!dataUrl) return;

  if (navigator.share && navigator.canShare) {
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'brain-age-result.png', { type: 'image/png' });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: '腦齡大逆轉挑戰',
          text: `我的大腦年齡是 ${props.brainResult.age} 歲！稱號：${props.brainResult.title}，快來測測你的腦齡！`,
          files: [file]
        });
        return;
      }
    } catch (e) {}
  }

  // Fallback: show popup modal
  previewImage.value = dataUrl;
}

async function downloadCard() {
  const dataUrl = await exportCardImage();
  if (!dataUrl) return;

  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `brain-age-${props.brainResult.age}-years.png`;
  a.click();
}

onMounted(async () => {
  await nextTick();
  drawRadarChart();
  drawQRCode();

  // Save record to Local-First storage
  try {
    const existingBest = localStorage.getItem('brain_flip_best_record');
    let shouldSave = true;
    if (existingBest) {
      const parsed = JSON.parse(existingBest);
      if (parsed.score >= props.brainResult.score) {
        shouldSave = false;
      }
    }
    if (shouldSave) {
      localStorage.setItem('brain_flip_best_record', JSON.stringify({
        age: props.brainResult.age,
        score: props.brainResult.score,
        title: props.brainResult.title,
        date: new Date().toISOString()
      }));
    }
  } catch (e) {}

  // Trigger celebration confetti
  if (props.brainResult.score >= 75) {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
});
</script>

<style scoped>
.result-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  max-width: 440px;
  width: 100%;
  margin: 0 auto;
}

.share-card-canvas {
  width: 100%;
  background: linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
  border: 2px solid rgba(244, 114, 182, 0.4);
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
  position: relative;
  color: #fff;
}

.card-inner {
  padding: 1rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  text-align: center;
}

.card-brand {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #94a3b8;
  text-transform: uppercase;
}

.age-badge-container {
  margin-top: 0.1rem;
}

.age-label {
  font-size: 0.8rem;
  color: #cbd5e1;
}

.age-number-box {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.1rem;
  line-height: 1;
  margin: 0.1rem 0;
}

.age-val {
  font-size: 3.4rem;
  font-weight: 900;
  background: linear-gradient(135deg, #f43f5e 0%, #fbbf24 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.age-unit {
  font-size: 1.3rem;
  font-weight: 800;
  color: #f43f5e;
}

.title-tag {
  display: inline-block;
  background: rgba(244, 114, 182, 0.2);
  border: 1px solid #f472b6;
  color: #f472b6;
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 800;
}

.comment-box {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 0.5rem 0.8rem;
}

.quote-mark {
  font-size: 1.2rem;
  color: #f472b6;
  line-height: 0;
  display: inline-block;
}

.comment-text {
  font-size: 0.82rem;
  font-weight: 600;
  color: #f1f5f9;
  line-height: 1.35;
  margin: 0.15rem 0;
}

.radar-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.4rem;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 10px;
  padding: 0.35rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-val {
  font-size: 0.95rem;
  font-weight: 800;
  color: #38bdf8;
}

.stat-val small {
  font-size: 0.65rem;
  color: #94a3b8;
}

.stat-lbl {
  font-size: 0.68rem;
  color: #94a3b8;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: rgba(255, 255, 255, 0.06);
  padding: 0.45rem 0.7rem;
  border-radius: 12px;
  text-align: left;
}

.qr-box {
  background: #fff;
  padding: 2px;
  border-radius: 6px;
  display: flex;
}

.footer-info {
  display: flex;
  flex-direction: column;
}

.footer-title {
  font-size: 0.78rem;
  font-weight: 800;
  color: #a7f3d0;
}

.footer-url {
  font-size: 0.68rem;
  color: #94a3b8;
}

.actions-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.btn-action {
  width: 100%;
  padding: 0.8rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.btn-action:active {
  transform: scale(0.97);
}

.btn-share {
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  color: #fff;
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);
}

.btn-download {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f8fafc;
}

.btn-retry {
  background: transparent;
  color: #94a3b8;
  font-size: 0.82rem;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  background: #1e293b;
  border-radius: 16px;
  padding: 1rem;
  max-width: 360px;
  width: 100%;
  text-align: center;
}

.modal-content h3 {
  font-size: 0.9rem;
  color: #cbd5e1;
  margin-bottom: 0.8rem;
}

.modal-img {
  width: 100%;
  border-radius: 12px;
  margin-bottom: 0.8rem;
}

.btn-close-modal {
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  border: none;
  background: #ef4444;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
}
</style>
