請協助我將專案同步到 GitHub 並部署到 Vercel。依序執行以下每個步驟，每步先檢查狀態，已完成的步驟可跳過。

---

## 階段一：環境前置檢查

### 1-1. 檢查 Git 是否安裝
執行 `git --version`。
- ✅ 已安裝 → 繼續
- ❌ 未安裝 → 提示使用者前往 https://git-scm.com/downloads 下載安裝，完成後重新執行指令

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
  安裝完成後重新執行指令

### 1-4. 檢查是否已登入 GitHub
執行 `gh auth status`。
- ✅ 已登入 → 繼續
- ❌ 未登入 → 提示使用者執行：
  ```bash
  gh auth login
  ```
  選擇 GitHub.com → HTTPS → 用瀏覽器登入，完成後重新執行指令

---

## 階段二：專案準備

### 2-1. 確認 build 可以成功
在專案根目錄執行 `npm run build`。
- ✅ 成功（產生 `build/` 目錄）→ 繼續
- ❌ 有錯誤 → 顯示錯誤訊息，先修復錯誤再繼續

### 2-2. 確認 vercel.json 存在
檢查專案根目錄是否有 `vercel.json`。
- ✅ 已存在 → 繼續
- ❌ 不存在 → 建立以下內容的 `vercel.json`：
  ```json
  {
    "buildCommand": "npm run build",
    "outputDirectory": "build",
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

---

## 階段三：GitHub 同步

### 3-1. 檢查是否已初始化 git repo
檢查 `.git` 目錄是否存在（`git status`）。
- ✅ 已初始化 → 跳到 3-3
- ❌ 未初始化 → 執行 `git init`

### 3-2. 初始 commit（首次）
```bash
git add .
git commit -m "Initial commit: treasure game with auth system"
```

### 3-3. 檢查是否已有 GitHub remote
執行 `git remote -v`。
- ✅ 已有 origin → 跳到 3-5（更新部署流程）
- ❌ 沒有 remote → 繼續 3-4

### 3-4. 建立 GitHub repo 並推送（首次）
詢問使用者想要的 repo 名稱（預設：`treasure-game`），以及要設為 public 或 private，然後執行：
```bash
gh repo create <repo-name> --public --source=. --remote=origin --push
```
執行後顯示 GitHub repo 的 URL。

### 3-5. 更新推送（已有 remote 時）
執行以下步驟：
```bash
git add .
git status   # 顯示有哪些變更
```
詢問使用者這次 commit 的描述（預設："Update project"），然後：
```bash
git commit -m "使用者輸入的描述"
git push origin main
```
- ✅ push 成功 → 告知 GitHub 已更新，Vercel 會自動觸發重新部署
- ❌ push 失敗（如 branch 不同）→ 嘗試 `git push origin HEAD`，或提示使用者確認 branch 名稱

---

## 階段四：Vercel 部署設定（首次）

### 4-1. 檢查是否已連結 Vercel
檢查 `.vercel/` 目錄是否存在。
- ✅ 已連結 → 跳過此階段，告知「GitHub push 後 Vercel 會自動部署」
- ❌ 未連結 → 繼續

### 4-2. 引導使用者在 Vercel Dashboard 連結（無需安裝 CLI）

告知使用者：

**在瀏覽器完成以下步驟：**

1. 前往 https://vercel.com，點右上角 **Sign Up** 或 **Log In**
   - 建議選「Continue with GitHub」，直接用 GitHub 帳號登入

2. 登入後點 **Add New Project**

3. 在 **Import Git Repository** 區塊，找到剛建立的 repo（`<repo-name>`），點 **Import**

4. 在設定頁面確認以下設定：
   - **Framework Preset**: Vite（應自動偵測）
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

5. 點 **Deploy**，等待部署完成（約 1-2 分鐘）

6. 部署成功後會顯示網址，格式為 `https://<repo-name>.vercel.app`

---

## 階段五：完成確認

部署完成後：
- 顯示部署網址
- 提醒使用者：後端功能（登入/註冊/分數儲存）在純前端部署時不可用，遊戲本體（訪客模式）可正常使用
- 告知日後只要執行 `/sync_and_deploy`，推送更新後 Vercel 就會自動重新部署

---

## 重要注意事項

- `server/.env` 含有 JWT_SECRET，已在 `.gitignore` 中，**不會被上傳到 GitHub** ✅
- `database.db` 已在 `.gitignore` 中，**不會被上傳** ✅
- `server/node_modules/` 和 `node_modules/` 已在 `.gitignore` 中 ✅
- 如果有任何步驟失敗，停下來說明問題並提供解決方案，不要強行繼續
