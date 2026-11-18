/**
 * tools/verify_brain_age_formula.js
 * 驗證腦齡換算公式、認知吞吐量與實測場景
 */

import { calculateBrainAge } from '../src/core/brainAge.js';
import { shuffleArray, COLOR_MAP } from '../src/core/gameState.js';

console.log('🧪 正在執行腦齡演算法吞吐量與實測校正測試...\n');

const testCases = [
  {
    name: '1. Perfect Fiber Brain (超頻光纖腦 - 100% 正確, 350ms 反應, 28題)',
    input: { total: 28, correct: 28, avgReactionTime: 350, switchCost: 20 },
    expectedMinAge: 18,
    expectedMaxAge: 22,
    expectedCategory: '超頻光纖腦'
  },
  {
    name: '2. Standard Corporate Brain (年輕敏捷 - 90% 正確, 550ms 反應, 24題)',
    input: { total: 27, correct: 24, avgReactionTime: 550, switchCost: 80 },
    expectedMinAge: 23,
    expectedMaxAge: 35,
    expectedCategory: '社畜標準腦'
  },
  {
    name: '3. User Screenshot Case (穩健高精準 - 93% 正確, 1335ms 反應, 切換成本 658ms, 25題 - 應落於 36~48 歲)',
    input: { total: 27, correct: 25, avgReactionTime: 1335, switchCost: 658 },
    expectedMinAge: 36,
    expectedMaxAge: 48,
    expectedCategory: '轉圈加載腦'
  },
  {
    name: '4. Fast Spamming Exploit Test (盲目亂點防刷分測試 - 25% 正確, 200ms 超快反應)',
    input: { total: 30, correct: 8, avgReactionTime: 200, switchCost: 50 },
    expectedMinAge: 85,
    expectedMaxAge: 88,
    expectedCategory: '盲目瞎猜大師'
  },
  {
    name: '5. Boundary Continuity 84.9 (應落於 CORPORATE 23~35 歲)',
    input: { total: 20, correct: 18, avgReactionTime: 500, switchCost: 80 },
    expectedScore: 84.9,
    expectedMinAge: 23,
    expectedMaxAge: 35,
    expectedCategory: '社畜標準腦'
  },
  {
    name: '6. Boundary Continuity 69.9 (應落於 LAGGING 36~52 歲)',
    input: { total: 20, correct: 16, avgReactionTime: 500, switchCost: 87 },
    expectedScore: 69.9,
    expectedMinAge: 36,
    expectedMaxAge: 52,
    expectedCategory: '轉圈加載腦'
  },
  {
    name: '7. Boundary Continuity 49.9 (應落於 SENIOR 53~85 歲)',
    input: { total: 20, correct: 12, avgReactionTime: 250, switchCost: 33 },
    expectedScore: 49.9,
    expectedMinAge: 53,
    expectedMaxAge: 85,
    expectedCategory: '敬老卡預備腦'
  }
];

let passedCount = 0;

for (const tc of testCases) {
  const result = calculateBrainAge(
    tc.input.total,
    tc.input.correct,
    tc.input.avgReactionTime,
    tc.input.switchCost
  );

  const scoreValid = tc.expectedScore === undefined || result.score === tc.expectedScore;
  const ageValid = result.age >= tc.expectedMinAge && result.age <= tc.expectedMaxAge;
  const categoryValid = result.title.includes(tc.expectedCategory);
  const ok = scoreValid && ageValid && categoryValid;

  console.log(`[測試] ${tc.name}`);
  console.log(`  └得分: ${result.score.toFixed(1)} | 腦齡: ${result.age} 歲 | 稱號: ${result.title}`);
  console.log(`  └雷達圖[反射神經]: ${result.radar.reaction} | [抗干擾力]: ${result.radar.accuracy} | [切換靈活性]: ${result.radar.flexibility}`);
  console.log(`  └評語: "${result.comment}"`);
  console.log(`  └結果: ${ok ? '✅ PASS' : '❌ FAIL'}\n`);

  if (ok) passedCount++;
}

// 8. Fisher-Yates shuffleArray 均勻洗牌驗證
const trials = 4000;
const positionCounts = COLOR_MAP.map(() => ({}));
for (const c of COLOR_MAP) {
  for (let pos = 0; pos < COLOR_MAP.length; pos++) {
    positionCounts[pos][c.name] = 0;
  }
}

let allElementsPreserved = true;
for (let t = 0; t < trials; t++) {
  const shuffled = shuffleArray(COLOR_MAP);
  if (shuffled.length !== COLOR_MAP.length) {
    allElementsPreserved = false;
    break;
  }
  const seen = new Set();
  shuffled.forEach((item, idx) => {
    seen.add(item.name);
    positionCounts[idx][item.name]++;
  });
  if (seen.size !== COLOR_MAP.length) {
    allElementsPreserved = false;
    break;
  }
}

const expectedPerSlot = trials / COLOR_MAP.length; // 1000
const maxDeviation = 0.15; // 允許 ±15% 統計誤差
let uniformValid = allElementsPreserved;
for (let pos = 0; pos < COLOR_MAP.length; pos++) {
  for (const c of COLOR_MAP) {
    const count = positionCounts[pos][c.name];
    if (Math.abs(count - expectedPerSlot) / expectedPerSlot > maxDeviation) {
      uniformValid = false;
    }
  }
}

const totalChecks = testCases.length + 1;
console.log(`[測試] 8. Fisher-Yates shuffleArray 均勻洗牌驗證 (${trials} 次)`);
console.log(`  └各位置出現次數:`, positionCounts);
console.log(`  └結果: ${uniformValid ? '✅ PASS' : '❌ FAIL'}\n`);
if (uniformValid) passedCount++;

console.log(`--------------------------------------------------`);
console.log(`測試完成: ${passedCount} / ${totalChecks} 通過`);

if (passedCount !== totalChecks) {
  console.error('❌ 部份測試未通過，請檢查邏輯演算法！');
  process.exit(1);
} else {
  console.log('✨ 腦齡演算法、邊界連續性與洗牌均勻性驗證 100% 正確！');
}
