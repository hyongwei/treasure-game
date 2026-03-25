請協助我將專案部署到 GitHub Pages。依序執行以下每個步驟，每步先檢查狀態，已完成的步驟可跳過。

---

## 背景知識

GitHub Pages 部署 Vite/React 專案有兩個關鍵差異：
1. **base URL**：GitHub Pages 的網址格式為 `https://<username>.github.io/<repo-name>/`，因此 Vite 必須設定 `base: '/<repo-name>/'`，否則資源路徑錯誤導致白畫面
2. **部署分支**：GitHub Pages 從 `gh-pages` 分支讀取靜態檔案，使用 `gh-pages` npm 套件自動處理

---

## 階段一：環境前置檢查

### 1-1. 檢查 Git 是否安裝
執行 `git --version`。
- ✅ 已安裝 → 繼續
- ❌ 未安裝 → 提示前往 https://git-scm.com/downloads 下載安裝，完成後重新執行

### 1-2. 檢查 git user 設定
執行 `git config user.name` 和 `git config user.email`。
- ✅ 有值 → 繼續
- ❌ 未設定 → 詢問使用者名稱和 email，執行：
  ```bash
  git config --global user.name "使用者輸入的名稱"
  git config --global user.email "使用者輸入的 email"
  ```

### 1-3. 檢查 GitHub CLI (gh) 是否安裝
執行 `gh --version`。
- ✅ 已安裝 → 繼續
- ❌ 未安裝 → 提示：
  ```bash
  # Windows (winget)
  winget install --id GitHub.cli
  # 或前往 https://cli.github.com 下載安裝
  ```
  安裝完成後重新執行

### 1-4. 檢查是否已登入 GitHub
執行 `gh auth status`。
- ✅ 已登入 → 取得登入的 GitHub 帳號名稱（username），繼續
- ❌ 未登入 → 提示執行（需要瀏覽器，僅需一次）：
  ```bash
  gh auth login
  ```
  選擇 GitHub.com → HTTPS → 用瀏覽器登入，完成後重新執行

---

## 階段二：取得專案資訊

### 2-1. 確認 repo 名稱
執行 `git remote -v` 檢查是否已有 remote origin。
- ✅ 已有 origin → 從 URL 解析出 repo 名稱，顯示給使用者確認
- ❌ 無 remote → 詢問使用者想要的 repo 名稱（預設：目前資料夾名稱），記為 `<repo-name>`

### 2-2. 確認 GitHub username
執行 `gh api user --jq '.login'` 取得 GitHub 登入帳號，記為 `<username>`。

---

## 階段三：設定 Vite base URL

### 3-1. 檢查 vite.config.ts 是否已設定 base
讀取 `vite.config.ts`，檢查是否有 `base: '/<repo-name>/'`。
- ✅ 已設定正確的 base → 繼續
- ❌ 未設定或不正確 → 在 `defineConfig({` 內加入 `base: '/<repo-name>/'`：
  ```typescript
  export default defineConfig({
    base: '/<repo-name>/',  // 新增這行
    plugins: [...],
    ...
  })
  ```
  修改後告知使用者：此設定讓 GitHub Pages 能正確載入所有資源

---

## 階段四：安裝 gh-pages 套件

### 4-1. 檢查 gh-pages 是否已安裝
檢查 `package.json` 的 `devDependencies` 是否包含 `gh-pages`。
- ✅ 已安裝 → 繼續
- ❌ 未安裝 → 執行：
  ```bash
  npm install --save-dev gh-pages
  ```

### 4-2. 確認 package.json 有 deploy 腳本
讀取 `package.json`，檢查 `scripts` 是否包含：
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d build"
```
- ✅ 已有 → 繼續
- ❌ 未有 → 在 `scripts` 區塊加入上述兩行

---

## 階段五：GitHub 同步

### 5-1. 確認 git repo 已初始化
執行 `git status`。
- ✅ 已初始化 → 跳到 5-3
- ❌ 未初始化 → 執行 `git init`

### 5-2. 初始 commit（首次）
```bash
git add .
git commit -m "Initial commit"
```

### 5-3. 確認 GitHub remote 已設定
執行 `git remote -v`。
- ✅ 已有 origin → 跳到 5-5
- ❌ 無 remote → 繼續 5-4

### 5-4. 建立 GitHub repo（首次）
詢問使用者要設為 public 或 private，然後執行：
```bash
gh repo create <repo-name> --public --source=. --remote=origin --push
```
執行後跳到階段六。

### 5-5. 推送最新變更
```bash
git add .
git status   # 顯示有哪些變更
```
詢問使用者這次 commit 描述（預設："Update project"），然後：
```bash
git commit -m "使用者輸入的描述"
git push origin HEAD
```
- ❌ push 失敗 → 停下來說明錯誤，不要強行繼續

---

## 階段六：部署到 GitHub Pages

### 6-1. 執行部署
```bash
npm run deploy
```
此指令會自動：
1. 執行 `npm run build` 產生 `build/` 目錄
2. 將 `build/` 內容推送到 `gh-pages` 分支

- ✅ 部署成功 → 繼續 6-2
- ❌ 失敗 → 顯示錯誤訊息，停下來說明問題

### 6-2. 確認 GitHub Pages 已啟用
執行以下指令確認 Pages 來源設定為 `gh-pages` 分支：
```bash
gh api repos/<username>/<repo-name>/pages 2>/dev/null
```
- ✅ 已啟用且來源為 gh-pages → 繼續階段七
- ❌ 未啟用或指令失敗 → 執行以下指令啟用：
  ```bash
  gh api repos/<username>/<repo-name>/pages \
    --method POST \
    --field source[branch]=gh-pages \
    --field source[path]=/
  ```
  若失敗（已存在），改用 PATCH：
  ```bash
  gh api repos/<username>/<repo-name>/pages \
    --method PUT \
    --field source[branch]=gh-pages \
    --field source[path]=/
  ```

---

## 階段七：完成確認

部署完成後：
- 顯示 GitHub Pages 網址：`https://<username>.github.io/<repo-name>/`
- 告知使用者：首次啟用 GitHub Pages 約需等待 **1-3 分鐘** 才能訪問，之後每次部署約 30 秒
- 提醒：後端功能（登入/註冊/分數儲存）在純前端部署時不可用，遊戲本體（訪客模式）可正常使用
- 告知日後更新只需再次執行 `/deploy_github_pages`，會自動跳過已完成的步驟直接部署

---

## 重要注意事項

- `vite.config.ts` 的 `base` 設定**只影響 GitHub Pages 部署**，本地開發 (`npm run dev`) 不受影響
- 若同時有 Vercel 部署，`base` 設定會讓 Vercel 的路由出現問題 → 建議使用不同分支或只擇一部署平台
- `server/.env`、`database.db`、`node_modules/` 已在 `.gitignore` 中，不會被上傳 ✅
- 如果有任何步驟失敗，停下來說明問題並提供解決方案，不要強行繼續
