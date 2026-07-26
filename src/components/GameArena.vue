<template>
  <div class="arena-container glass-card" :class="{ 'wrong-flash': isWrongFlash }">
    <!-- Top Progress Bar & Timer -->
    <div class="top-bar">
      <div class="timer-badge" :class="{ 'timer-urgent': remainingSeconds <= 5 }">
        ⏱️ {{ remainingSeconds.toFixed(1) }}s
      </div>
      <div class="stage-tag" :class="stageClass">
        {{ stageLabel }}
      </div>
      <div class="score-badge">
        得分: {{ correctCount }} / {{ totalCount }}
      </div>
    </div>

    <div class="progress-bar-bg">
      <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>

    <!-- Rule Instruction Banner -->
    <div class="rule-banner" :class="currentQuestion?.rule === 'COLOR' ? 'banner-color' : 'banner-meaning'">
      <div class="rule-icon">{{ currentQuestion?.rule === 'COLOR' ? '🎨' : '🔤' }}</div>
      <div class="rule-text">
        請點擊：<strong>{{ currentQuestion?.rule === 'COLOR' ? '【看顏色】' : '【看文字】' }}</strong>
        <span class="rule-sub-hint">
          {{ currentQuestion?.rule === 'COLOR' ? '（字是什麼顏色，就點什麼）' : '（字寫什麼字，就點什麼）' }}
        </span>
      </div>
    </div>

    <!-- Main Stroop Display Card -->
    <div class="stroop-card">
      <div
        class="stroop-text"
        :style="{ color: currentQuestion?.displayColor }"
      >
        {{ currentQuestion?.displayText }}
      </div>
    </div>

    <!-- 4 Option Color Buttons -->
    <div class="choices-grid">
      <button
        v-for="choice in currentQuestion?.choices"
        :key="choice.name"
        class="choice-btn"
        :style="{ backgroundColor: choice.value }"
        @click="handleChoice(choice.name)"
      >
        {{ choice.name }}
      </button>
    </div>

    <!-- 0.5s Shockwave Warning Overlay -->
    <Transition name="warning-pop">
      <div v-if="activeWarning" class="warning-overlay" :class="activeWarning.bgClass">
        <div class="warning-stripe"></div>
        <div class="warning-content">
          <div class="warning-siren">⚠️ 衝擊波警告 ⚠️</div>
          <h2 class="warning-title">{{ activeWarning.title }}</h2>
          <p class="warning-sub">{{ activeWarning.sub }}</p>
        </div>
        <div class="warning-stripe"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { GAME_STAGES, generateQuestion } from '../core/gameState.js';
import { audioEngine } from '../core/audio.js';

const emit = defineEmits(['finish']);

const TOTAL_GAME_TIME = 41.0; // 10s + 0.5s + 15s + 0.5s + 15s = 41s
const elapsedTime = ref(0);
const currentStage = ref(GAME_STAGES.STAGE_1);
const activeWarning = ref(null);
const isWrongFlash = ref(false);

const currentQuestion = ref(null);
const totalCount = ref(0);
const correctCount = ref(0);
const reactionTimes = ref([]);
const switchCosts = ref([]);

let timerInterval = null;
let stageStartTime = performance.now();

const remainingSeconds = computed(() => {
  return Math.max(0, TOTAL_GAME_TIME - elapsedTime.value);
});

const progressPercent = computed(() => {
  return Math.min(100, (elapsedTime.value / TOTAL_GAME_TIME) * 100);
});

const stageLabel = computed(() => {
  if (currentStage.value === GAME_STAGES.STAGE_1) return 'Stage 1: 慣性建立';
  if (currentStage.value === GAME_STAGES.STAGE_2) return 'Stage 2: 規則逆轉';
  if (currentStage.value === GAME_STAGES.STAGE_3) return 'Stage 3: 隨機大亂鬥';
  return '';
});

const stageClass = computed(() => {
  if (currentStage.value === GAME_STAGES.STAGE_1) return 'tag-s1';
  if (currentStage.value === GAME_STAGES.STAGE_2) return 'tag-s2';
  if (currentStage.value === GAME_STAGES.STAGE_3) return 'tag-s3';
  return '';
});

function nextQuestion() {
  const prevRule = currentQuestion.value ? currentQuestion.value.rule : null;
  currentQuestion.value = generateQuestion(currentStage.value, prevRule);
}

function handleChoice(chosenName) {
  if (activeWarning.value) return; // ignore during 0.5s shockwave warning

  const now = performance.now();
  const rt = now - currentQuestion.value.createdAt;
  totalCount.value++;

  const isCorrect = chosenName === currentQuestion.value.correctAnswer;

  if (isCorrect) {
    correctCount.value++;
    reactionTimes.value.push(rt);
    audioEngine.playCorrect();
    audioEngine.vibrate([30]);

    if (currentQuestion.value.isRuleSwitched) {
      const avgRt = reactionTimes.value.reduce((a, b) => a + b, 0) / reactionTimes.value.length;
      const cost = Math.max(0, rt - avgRt);
      switchCosts.value.push(cost);
    }
  } else {
    isWrongFlash.value = true;
    setTimeout(() => {
      isWrongFlash.value = false;
    }, 250);

    audioEngine.playWrong();
    audioEngine.vibrate([80, 40, 80]);
  }

  nextQuestion();
}

function triggerWarning(warningConfig, callback) {
  activeWarning.value = warningConfig;
  audioEngine.playWarningSiren();
  audioEngine.vibrate([100, 50, 100, 50, 100]);

  setTimeout(() => {
    activeWarning.value = null;
    if (callback) callback();
  }, 500); // 0.5 second warning shockwave
}

function updateGameLoop() {
  const now = performance.now();
  elapsedTime.value = (now - stageStartTime) / 1000;

  if (elapsedTime.value >= TOTAL_GAME_TIME) {
    clearInterval(timerInterval);
    finishGame();
    return;
  }

  if (elapsedTime.value >= 10.0 && currentStage.value === GAME_STAGES.STAGE_1 && !activeWarning.value) {
    triggerWarning({
      title: '⚠️ 規則逆轉！',
      sub: '改看【文字寫什麼】！不要看顏色！',
      bgClass: 'warn-yellow'
    }, () => {
      currentStage.value = GAME_STAGES.STAGE_2;
      nextQuestion();
    });
  } else if (elapsedTime.value >= 25.5 && currentStage.value === GAME_STAGES.STAGE_2 && !activeWarning.value) {
    triggerWarning({
      title: '⚠️ 終極大亂鬥！',
      sub: '每題隨機切換！看清頂部標籤【看顏色】或【看文字】！',
      bgClass: 'warn-red'
    }, () => {
      currentStage.value = GAME_STAGES.STAGE_3;
      nextQuestion();
    });
  }
}

function finishGame() {
  const avgRt = reactionTimes.value.length > 0
    ? reactionTimes.value.reduce((a, b) => a + b, 0) / reactionTimes.value.length
    : 1000;
  const avgSwitchCost = switchCosts.value.length > 0
    ? switchCosts.value.reduce((a, b) => a + b, 0) / switchCosts.value.length
    : 150;

  emit('finish', {
    total: totalCount.value,
    correct: correctCount.value,
    avgReactionTime: avgRt,
    switchCost: avgSwitchCost
  });
}

onMounted(() => {
  stageStartTime = performance.now();
  currentStage.value = GAME_STAGES.STAGE_1;
  nextQuestion();

  timerInterval = setInterval(updateGameLoop, 50);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped>
.arena-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  padding: 1.5rem;
  max-width: 440px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  touch-action: manipulation;
  user-select: none;
  overflow: hidden;
}

.wrong-flash {
  animation: flashRed 0.25s ease;
}

@keyframes flashRed {
  0% { background: rgba(239, 68, 68, 0.4); }
  100% { background: transparent; }
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 0.9rem;
}

.timer-badge {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-weight: 800;
  color: #38bdf8;
}

.timer-urgent {
  color: #ef4444;
  animation: pulseUrgent 0.5s infinite alternate;
}

@keyframes pulseUrgent {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}

.stage-tag {
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.8rem;
}

.tag-s1 { background: #2563eb; color: #fff; }
.tag-s2 { background: #d97706; color: #fff; }
.tag-s3 { background: #dc2626; color: #fff; }

.score-badge {
  font-size: 0.85rem;
  color: #cbd5e1;
  font-weight: 600;
}

.progress-bar-bg {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #ec4899);
  transition: width 0.05s linear;
}

.rule-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 0.8rem;
  border-radius: 12px;
  font-size: 0.95rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: background 0.3s ease;
  text-align: center;
}

.banner-color {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.4), rgba(16, 185, 129, 0.4));
  border: 1px solid rgba(59, 130, 246, 0.5);
  color: #60a5fa;
}

.banner-meaning {
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.4), rgba(239, 68, 68, 0.4));
  border: 1px solid rgba(245, 158, 11, 0.5);
  color: #fbbf24;
}

.rule-icon {
  font-size: 1.2rem;
}

.rule-text strong {
  font-size: 1.05rem;
}

.rule-sub-hint {
  display: block;
  font-size: 0.72rem;
  opacity: 0.85;
  margin-top: 0.1rem;
}

.stroop-card {
  background: rgba(15, 23, 42, 0.85);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.5);
}

.stroop-text {
  font-size: 3.6rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
  user-select: none;
}

.choices-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
}

.choice-btn {
  height: 72px;
  border-radius: 16px;
  border: none;
  font-size: 1.4rem;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  transition: transform 0.1s ease, filter 0.1s ease;
  touch-action: manipulation;
}

.choice-btn:active {
  transform: scale(0.94);
  filter: brightness(1.2);
}

/* 0.5s Shockwave Warning Overlay */
.warning-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 1rem;
  text-align: center;
  backdrop-filter: blur(8px);
}

.warn-yellow {
  background: rgba(245, 158, 11, 0.95);
  color: #000;
}

.warn-red {
  background: rgba(220, 38, 38, 0.95);
  color: #fff;
}

.warning-stripe {
  width: 100%;
  height: 24px;
  background: repeating-linear-gradient(
    45deg,
    #000,
    #000 15px,
    #f59e0b 15px,
    #f59e0b 30px
  );
}

.warning-content {
  margin: auto 0;
}

.warning-siren {
  font-size: 1.1rem;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.warning-title {
  font-size: 2.2rem;
  font-weight: 900;
  margin: 0.5rem 0;
}

.warning-sub {
  font-size: 1rem;
  font-weight: 700;
}

.warning-pop-enter-active,
.warning-pop-leave-active {
  transition: all 0.15s ease-out;
}

.warning-pop-enter-from,
.warning-pop-leave-to {
  opacity: 0;
  transform: scale(1.15);
}
</style>
