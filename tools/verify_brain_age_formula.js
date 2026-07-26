/**
 * tools/verify_brain_age_formula.js
 * 驗證腦齡換算公式、認知吞吐量與實測場景
 */

import { calculateBrainAge } from '../src/core/brainAge.js';

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

  const ageValid = result.age >= tc.expectedMinAge && result.age <= tc.expectedMaxAge;
  const categoryValid = result.title.includes(tc.expectedCategory);

  console.log(`[測試] ${tc.name}`);
  console.log(`  └得分: ${result.score.toFixed(1)} | 腦齡: ${result.age} 歲 | 稱號: ${result.title}`);
  console.log(`  └雷達圖[反射神經]: ${result.radar.reaction} | [抗干擾力]: ${result.radar.accuracy} | [切換靈活性]: ${result.radar.flexibility}`);
  console.log(`  └評語: "${result.comment}"`);
  console.log(`  └結果: ${ageValid && categoryValid ? '✅ PASS' : '❌ FAIL'}\n`);

  if (ageValid && categoryValid) passedCount++;
}

console.log(`--------------------------------------------------`);
console.log(`測試完成: ${passedCount} / ${testCases.length} 通過`);

if (passedCount !== testCases.length) {
  console.error('❌ 部份測試未通過，請檢查邏輯演算法！');
  process.exit(1);
} else {
  console.log('✨ 腦齡演算法與實測場景驗證 100% 正確！');
}
