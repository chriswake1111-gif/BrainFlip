# 腦齡大逆轉 (Brain Age Switch) - NEXT_TODO

## 📌 已完成工作 (Completed)
- [x] **獨立程式碼與架構審查 (Auditor + Guardian + Design Reviewer) 與 Surgeon 加固重構**：
  - 修正 `Switch Cost` 自我污染平均值與規則切換後答錯逃脫懲罰的計分漏洞 ([GameArena.vue](file:///c:/Users/User/Documents/GitHub/BrainFlip/src/components/GameArena.vue))。
  - 修正腦齡分數邊界插值連續性 (`85 / 70 / 50`) 與 Fisher-Yates 無偏誤洗牌 ([brainAge.js](file:///c:/Users/User/Documents/GitHub/BrainFlip/src/core/brainAge.js), [gameState.js](file:///c:/Users/User/Documents/GitHub/BrainFlip/src/core/gameState.js))。
  - 新增右上角浮動「🔊 音效 / 🔇 靜音」持久化開關、等寬數字 (`tabular-nums`) 防倒數抖動與 `prefers-reduced-motion` 無障礙防護 ([App.vue](file:///c:/Users/User/Documents/GitHub/BrainFlip/src/App.vue), [style.css](file:///c:/Users/User/Documents/GitHub/BrainFlip/src/style.css))。
  - 移除外部 Google Fonts `@import` 並加入 `toPng` 的 `skipFonts: true` 自動重試降級，確保離線匯出圖片 100% 零報錯 ([ResultCard.vue](file:///c:/Users/User/Documents/GitHub/BrainFlip/src/components/ResultCard.vue))。
  - 清理 7 個未使用的 Create-Vite 初始模板垃圾檔並修復 PWA Manifest `maskable` 圖示配置 ([vite.config.js](file:///c:/Users/User/Documents/GitHub/BrainFlip/vite.config.js))。
- [x] **Git 版本控制與 GitHub 遠端倉庫建立**：已初始化 Git 儲存庫並推送至 GitHub 倉庫：[chriswake1111-gif/BrainFlip](https://github.com/chriswake1111-gif/BrainFlip)。
- [x] **PWA 專案骨架與圖示素材建置**：完成 Vite + Vue 3 專案初始化，自動生成 `pwa-192x192.png` / `pwa-512x512.png` / `apple-touch-icon.png` / `icon.svg`。
- [x] **PWA 一鍵加到主畫面與 iOS Safari 支持**：在首頁整合 `beforeinstallprompt` 喚起原生安裝，並加入 iOS Safari 「分享 ⎋ ➔ 加入主畫面 ➕」指引。
- [x] **腦齡與認知吞吐量演算法**：完成 $Score$、$S_{\text{cost}}$、吞吐量加分、高精準度獎勵與防盲目瞎猜 (Anti-Spam) 機制，`tools/verify_brain_age_formula.js` 8/8 100% 通過單元測試。

## 🔮 下階段建議 (NEXT_TODO)
- [ ] **Vercel / Cloudflare Pages 自動部署**：可於 Vercel / Cloudflare 連結 GitHub `chriswake1111-gif/BrainFlip` 倉庫，達成每一次 git push 自動更新生產環境與 PWA 網站！
