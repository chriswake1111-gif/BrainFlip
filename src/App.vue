<template>
  <main class="app-root">
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
import { ref, computed } from 'vue';
import LandingView from './components/LandingView.vue';
import GameArena from './components/GameArena.vue';
import ResultCard from './components/ResultCard.vue';
import { GAME_STAGES } from './core/gameState.js';
import { calculateBrainAge } from './core/brainAge.js';
import { audioEngine } from './core/audio.js';

const currentState = ref(GAME_STAGES.IDLE);
const countdownValue = ref(3);
const brainResult = ref(null);

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
  audioEngine.init();
  currentState.value = GAME_STAGES.COUNTDOWN;
  countdownValue.value = 3;
  audioEngine.playTick();

  const timer = setInterval(() => {
    countdownValue.value--;
    if (countdownValue.value > 0) {
      audioEngine.playTick();
    } else {
      clearInterval(timer);
      audioEngine.playCorrect();
      currentState.value = GAME_STAGES.STAGE_1;
    }
  }, 800);
}

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
