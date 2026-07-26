/**
 * src/core/gameState.js
 * 遊戲狀態機與題目生成邏輯
 */

export const GAME_STAGES = {
  IDLE: 'IDLE',
  COUNTDOWN: 'COUNTDOWN',
  STAGE_1: 'STAGE_1',
  WARN_1: 'WARN_1',
  STAGE_2: 'STAGE_2',
  WARN_2: 'WARN_2',
  STAGE_3: 'STAGE_3',
  RESULT: 'RESULT'
};

export const COLOR_MAP = [
  { name: '紅色', value: '#EF4444', class: 'color-red' },
  { name: '藍色', value: '#3B82F6', class: 'color-blue' },
  { name: '綠色', value: '#10B981', class: 'color-green' },
  { name: '黃色', value: '#F59E0B', class: 'color-yellow' }
];

export function generateQuestion(stage, prevRule = null) {
  // Pick random text and color (ensure discordant for Stroop effect)
  const textObj = COLOR_MAP[Math.floor(Math.random() * COLOR_MAP.length)];
  let colorObj = COLOR_MAP[Math.floor(Math.random() * COLOR_MAP.length)];
  while (colorObj.name === textObj.name) {
    colorObj = COLOR_MAP[Math.floor(Math.random() * COLOR_MAP.length)];
  }

  let rule = 'COLOR'; // default
  if (stage === GAME_STAGES.STAGE_1) {
    rule = 'COLOR';
  } else if (stage === GAME_STAGES.STAGE_2) {
    rule = 'MEANING';
  } else if (stage === GAME_STAGES.STAGE_3) {
    rule = Math.random() < 0.5 ? 'COLOR' : 'MEANING';
  }

  const correctAnswer = rule === 'COLOR' ? colorObj.name : textObj.name;
  const isRuleSwitched = prevRule !== null && prevRule !== rule;

  // Shuffle button choices
  const choices = [...COLOR_MAP].sort(() => Math.random() - 0.5);

  return {
    displayText: textObj.name,
    displayColor: colorObj.value,
    displayColorName: colorObj.name,
    rule, // 'COLOR' or 'MEANING'
    correctAnswer,
    choices,
    isRuleSwitched,
    createdAt: performance.now()
  };
}
