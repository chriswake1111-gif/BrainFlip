/**
 * src/core/brainAge.js
 * 腦齡計算演算法與毒舌評語庫（經認知效能吞吐量與高正確率校正版）
 */

export const TOXIC_COMMENTS = {
  SPAMMER: {
    title: '【盲目瞎猜大師】',
    ageRange: [85, 88],
    comments: [
      '⚠️ 檢測到盲目亂點！手指跑得比腦袋快 10 倍，這不叫反射神經，這叫閉眼瞎猜！',
      '正確率只有兩三成還敢點那麼快？大腦已經放棄思考，全靠手指隨機撞大運！'
    ]
  },
  FIBER: {
    title: '【超頻光纖腦】',
    ageRange: [18, 22],
    comments: [
      '你的神經傳導速度比 5G 還快，規則切換完全沒在卡頓！',
      '大腦開了雙核超頻，AI 都快追不上你的反射神經了！',
      '神級反應力！你的腦袋簡直是用光纖打造的量子電腦！'
    ]
  },
  CORPORATE: {
    title: '【社畜標準腦】',
    ageRange: [23, 35],
    comments: [
      '表現尚可，但下午三點大腦似乎會陷入低電量模式。',
      '預設運作正常的上班族腦袋，遇到突發狀況需要 0.5 秒喝口咖啡。',
      '中規中矩！雖然偶爾被規則虐到，但依然保持職場求生本能。'
    ]
  },
  LAGGING: {
    title: '【轉圈加載腦】',
    ageRange: [36, 52],
    comments: [
      '規則一切換，你的大腦是不是彈出了「網頁無回應」？',
      '大腦記憶體不足，CPU 正在發熱狂轉，建議清除快取！',
      '切換規則時有明顯的 3G 網路延遲感，需要手動刷新主機！'
    ]
  },
  SENIOR: {
    title: '【敬老卡預備腦】',
    ageRange: [53, 85],
    comments: [
      '你的手指跟大腦已經離家出走，建議關機重啟。',
      '大腦已陷入撥接上網時代，請聯絡電信業者升級配備！',
      '恭喜獲得敬老卡申請資格！大腦抗干擾能力已被強行洗牌。'
    ]
  }
};

/**
 * 計算腦齡與維度分數
 * @param {number} total 總題數
 * @param {number} correct 正確題數
 * @param {number} avgReactionTime 平均反應時間(ms)
 * @param {number} switchCost 切換成本(ms)
 */
export function calculateBrainAge(total, correct, avgReactionTime, switchCost = 0) {
  if (!total || total <= 0) {
    return {
      score: 0,
      age: 75,
      title: TOXIC_COMMENTS.SENIOR.title,
      comment: TOXIC_COMMENTS.SENIOR.comments[0],
      accuracy: 0,
      avgReactionTime: 0,
      switchCost: 0,
      radar: { reaction: 10, accuracy: 0, flexibility: 10 }
    };
  }

  const acc = correct / total; // 0 ~ 1.0
  const clampedSwitchCost = Math.max(0, switchCost);
  const clampedReaction = Math.max(250, Math.min(2500, avgReactionTime));

  // 1. 防亂點防刷分機制 (Anti-Blind-Spamming Detection)
  if (acc <= 0.35) {
    const category = TOXIC_COMMENTS.SPAMMER;
    return {
      score: 10,
      age: 88,
      title: category.title,
      comment: category.comments[0],
      accuracy: Math.round(acc * 100),
      avgReactionTime: Math.round(clampedReaction),
      switchCost: Math.round(clampedSwitchCost),
      radar: { reaction: 10, accuracy: Math.round(acc * 100), flexibility: 10 }
    };
  }

  // 2. 認知吞吐量 (Cognitive Throughput) 與高準確率獎勵
  // (1) 答對題數效能獎勵 (Max 25 pts)
  const throughputBonus = Math.min(25, correct * 0.85);

  // (2) 正確率基礎分 (Max 40 pts)
  const accuracyScore = acc * 40;

  // (3) 高精準度獎勵 (High Precision Bonus: >=90% 給予額外 15 分獎勵)
  const precisionBonus = acc >= 0.90 ? 15 : (acc >= 0.80 ? 8 : 0);

  // (4) 速度加分 (Max 25 pts, 基準窗口放寬至 1600ms)
  const speedBonus = Math.max(0, 1600 - clampedReaction) * 0.02 * acc;

  // (5) 切換成本扣分 (適度溫和扣分)
  const switchPenalty = clampedSwitchCost * 0.015;

  let rawScore = throughputBonus + accuracyScore + precisionBonus + speedBonus - switchPenalty;
  const score = Math.max(0, Math.min(100, Math.round(rawScore * 10) / 10));

  let categoryKey = 'SENIOR';
  let age = 55;

  if (score >= 85) {
    categoryKey = 'FIBER';
    const scoreDiff = (100 - score) / 15;
    age = Math.round(18 + scoreDiff * 4);
  } else if (score >= 70) {
    categoryKey = 'CORPORATE';
    const scoreDiff = (84 - score) / 14;
    age = Math.round(23 + scoreDiff * 12);
  } else if (score >= 50) {
    categoryKey = 'LAGGING';
    const scoreDiff = (69 - score) / 19;
    age = Math.round(36 + scoreDiff * 16);
  } else {
    categoryKey = 'SENIOR';
    const scoreDiff = (49 - score) / 49;
    age = Math.round(53 + scoreDiff * 32);
  }

  age = Math.max(18, Math.min(88, age));

  const category = TOXIC_COMMENTS[categoryKey];
  const commentIndex = Math.floor((score * 13) % category.comments.length);
  const comment = category.comments[commentIndex];

  // 3. 三維度雷達圖指標
  // (1) 反射神經 (Effective Reaction Speed)：速度與正確率加權
  const rawSpeedStat = Math.max(0, (1600 - clampedReaction) / 12);
  const reactionStat = Math.max(10, Math.min(100, Math.round((rawSpeedStat + throughputBonus) * Math.pow(acc, 1.1))));

  // (2) 抗干擾力 (Inhibitory Control)：正確率直接換算
  const accuracyStat = Math.round(acc * 100);

  // (3) 切換靈活性 (Cognitive Flexibility)：切換成本與正確率結合
  const rawFlex = Math.max(0, 100 - clampedSwitchCost / 6);
  const flexStat = Math.max(10, Math.min(100, Math.round(rawFlex * (0.4 + 0.6 * acc))));

  return {
    score,
    age,
    title: category.title,
    comment,
    accuracy: Math.round(acc * 100),
    avgReactionTime: Math.round(clampedReaction),
    switchCost: Math.round(clampedSwitchCost),
    radar: {
      reaction: reactionStat,
      accuracy: accuracyStat,
      flexibility: flexStat
    }
  };
}
