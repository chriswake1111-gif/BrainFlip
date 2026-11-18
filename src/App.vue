<template>
  <main class="app-root">
    <button
      class="mute-toggle-btn"
      :aria-label="isMuted ? '開啟音效' : '關閉音效'"
      @click="handleToggleMute"
    >
      {{ isMuted ? '🔇 靜音' : '🔊 音效' }}
    </button>

    <!-- Landing State -->
    <LandingView
      v-if="currentState === GAME_STAGES.IDLE"
      @start="startCountdown"
    />

    <!-- Countdown Overlay State -->
    <div v-else-if="currentState === GAME_STAGES.COUNTDOWN" class="countdown-overlay glass-card fade-in">
      <div class="countdown-num pulse-num">{{ countdownValue }}</div>
      <div class="countdown-sub">準備大腦切換...</div>
    </div>

    <!-- Arena Game State -->
    <GameArena
      v-else-if="isPlaying"
      @finish="handleGameFinish"
    />

    <!-- Result State -->
    <ResultCard
      v-else-if="currentState === GAME_STAGES.RESULT && brainResult"
      :brain-result="brainResult"
      @retry="startCountdown"
    />
  </main>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import LandingView from './components/LandingView.vue';
import GameArena from './components/GameArena.vue';
import ResultCard from './components/ResultCard.vue';
import { GAME_STAGES } from './core/gameState.js';
import { calculateBrainAge } from './core/brainAge.js';
import { audioEngine } from './core/audio.js';

const currentState = ref(GAME_STAGES.IDLE);
const countdownValue = ref(3);
const brainResult = ref(null);
const isMuted = ref(audioEngine.isMuted);
let countdownTimer = null;

function handleToggleMute() {
  isMuted.value = audioEngine.toggleMute();
}

const isPlaying = computed(() => {
  return [
    GAME_STAGES.STAGE_1,
    GAME_STAGES.WARN_1,
    GAME_STAGES.STAGE_2,
    GAME_STAGES.WARN_2,
    GAME_STAGES.STAGE_3
  ].includes(currentState.value);
});

function startCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  audioEngine.init();
  currentState.value = GAME_STAGES.COUNTDOWN;
  countdownValue.value = 3;
  audioEngine.playTick();

  countdownTimer = setInterval(() => {
    countdownValue.value--;
    if (countdownValue.value > 0) {
      audioEngine.playTick();
    } else {
      clearInterval(countdownTimer);
      countdownTimer = null;
      audioEngine.playCorrect();
      currentState.value = GAME_STAGES.STAGE_1;
    }
  }, 800);
}

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
});

function handleGameFinish(rawMetrics) {
  const calculated = calculateBrainAge(
    rawMetrics.total,
    rawMetrics.correct,
    rawMetrics.avgReactionTime,
    rawMetrics.switchCost
  );

  brainResult.value = calculated;
  currentState.value = GAME_STAGES.RESULT;
}
</script>

<style scoped>
.app-root {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  position: relative;
}

.mute-toggle-btn {
  position: fixed;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 200;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e2e8f0;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: transform 0.15s ease, background 0.15s ease;
}

.mute-toggle-btn:active {
  transform: scale(0.95);
}

.countdown-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  max-width: 360px;
  width: 100%;
  text-align: center;
}

.countdown-num {
  font-size: 6rem;
  font-weight: 900;
  background: linear-gradient(135deg, #38bdf8, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
}

.pulse-num {
  animation: pulseZoom 0.8s infinite;
}

@keyframes pulseZoom {
  0% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.countdown-sub {
  font-size: 1.1rem;
  color: #94a3b8;
  margin-top: 1rem;
  font-weight: 600;
}
</style>
