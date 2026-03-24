請協助我將這個專案部署到 Vercel。依照以下步驟逐一執行：

## 步驟 1：確認環境
- 檢查是否已安裝 Vercel CLI：執行 `vercel --version`
- 若未安裝，提示使用者執行：`npm install -g vercel`

## 步驟 2：檢查專案狀態
- 讀取 `package.json` 確認 build script 存在
- 確認 `vite.config.ts` 的 `outDir` 設定（應為 `build`）
- 檢查是否有 `.env` 等敏感檔案需要排除

## 步驟 3：確認 build 可以成功
- 執行 `npm run build`，確認沒有錯誤
- 若有錯誤，先修復再繼續

## 步驟 4：設定 Vercel 部署設定
- 在專案根目錄建立或更新 `vercel.json`，設定正確的 build output 目錄
- 這個專案的 build output 是 `build/` 資料夾

## 步驟 5：部署
- 執行 `vercel` 進行首次部署（或 `vercel --prod` 部署到正式環境）
- 若是已連結的專案，執行 `vercel --prod` 直接部署正式版

## 步驟 6：確認部署結果
- 顯示部署完成的 URL
- 提醒使用者在 Vercel Dashboard 設定必要的環境變數（如有後端 API 的 JWT_SECRET 等）

## 注意事項
- 這個專案是純前端（React + Vite），不包含後端，部署後端需另外處理
- 若有環境變數需求，提醒在 Vercel Dashboard → Settings → Environment Variables 設定
- 部署後告知使用者如何在 Vercel 綁定自訂網域
