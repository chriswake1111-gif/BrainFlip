# 腦齡大逆轉 (Brain Age Switch) - NEXT_TODO

## 📌 已完成工作 (Completed)
- [x] **Git 版本控制與 GitHub 遠端倉庫建立**：已初始化 Git 儲存庫並推送至 GitHub 倉庫：[chriswake1111-gif/BrainFlip](https://github.com/chriswake1111-gif/BrainFlip)。
- [x] **PWA 專案骨架與圖示素材建置**：完成 Vite + Vue 3 專案初始化，自動生成 `pwa-192x192.png` / `pwa-512x512.png` / `apple-touch-icon.png` / `icon.svg`。
- [x] **PWA 一鍵加到主畫面與 iOS Safari 支持**：在首頁整合 `beforeinstallprompt` 喚起原生安裝，並加入 iOS Safari 「分享 ⎋ ➔ 加入主畫面 ➕」指引。
- [x] **腦齡與認知吞吐量演算法**：完成 $Score$、$S_{\text{cost}}$、吞吐量加分、高精準度獎勵與防盲目瞎猜 (Anti-Spam) 機制，`tools/verify_brain_age_formula.js` 100% 通過單元測試。
- [x] **Web Audio API 零延遲音效與觸覺震動**：實現叮咚聲、錯誤逼逼聲、高壓警報音與震動反饋。
- [x] **三大關卡與 0.5s 衝擊波警告**：實現 45 秒完整遊戲狀態機，提示字眼精簡直覺化（【看顏色】/【看文字】）。
- [x] **1080x1920 (9:16) IG Story 社群分享卡片**：修復卡片排版與 QR Code 裁切，整合 HTML5 Canvas 雷達圖、`html-to-image` 導出與 Web Share API 原生分享。
- [x] **生產環境構建與 Service Worker Precaching**：`npm run build` 通過，9 項核心靜態資產全數預快取，支援完全離線遊玩。

## 🔮 下階段建議 (NEXT_TODO)
- [ ] **Vercel / Cloudflare Pages 自動部署**：可於 Vercel / Cloudflare 連結 GitHub `chriswake1111-gif/BrainFlip` 倉庫，達成每一次 git push 自動更新生產環境與 PWA 網站！
