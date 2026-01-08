# ⚡ 快速設置環境變數（5 分鐘）

## 步驟 1：檢查是否有 .env.local 文件

在專案根目錄（與 `package.json` 同層級）檢查是否有 `.env.local` 文件。

**如果沒有，請繼續步驟 2。**

---

## 步驟 2：創建 .env.local 文件

### 方法 A：複製模板（推薦）

1. 複製 `env.local.example` 文件
2. 重新命名為 `.env.local`（注意開頭的點）
3. 編輯文件，填入你的 Supabase 資訊

### 方法 B：手動創建

1. 在專案根目錄創建新文件，命名為 `.env.local`
2. 複製以下內容：

```env
NEXT_PUBLIC_SUPABASE_URL=你的專案URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Anon Key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 步驟 3：獲取 Supabase 環境變數

### 📍 在 Supabase Dashboard 中：

1. **登入 Supabase**
   - 前往 [app.supabase.com](https://app.supabase.com)
   - 登入你的帳號

2. **選擇專案**
   - 在專案列表中選擇你的專案

3. **進入 API 設置**
   - 點擊左側選單的 **Settings**（⚙️ 圖示）
   - 點擊 **API**

4. **複製環境變數**

   你會看到以下資訊：

   #### Project URL
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   👉 複製這個，貼到 `.env.local` 的 `NEXT_PUBLIC_SUPABASE_URL`

   #### anon public key
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjM4OTY3MjkwLCJleHAiOjE5NTQ1NDMyOTB9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   👉 複製這個，貼到 `.env.local` 的 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 步驟 4：完成設置

### 你的 `.env.local` 應該看起來像這樣：

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### ⚠️ 重要提醒：

1. **不要有多餘的空格**
   - ✅ 正確：`NEXT_PUBLIC_SUPABASE_URL=https://...`
   - ❌ 錯誤：`NEXT_PUBLIC_SUPABASE_URL = https://...`

2. **不要用引號包起來**
   - ✅ 正確：`NEXT_PUBLIC_SUPABASE_URL=https://...`
   - ❌ 錯誤：`NEXT_PUBLIC_SUPABASE_URL="https://..."`

3. **確保文件命名正確**
   - ✅ 正確：`.env.local`（注意開頭的點）
   - ❌ 錯誤：`env.local` 或 `.env.local.txt`

---

## 步驟 5：重啟開發伺服器

設置完環境變數後，**必須重啟開發伺服器**：

1. 在終端機按 `Ctrl + C` 停止伺服器
2. 執行 `npm run dev` 重新啟動
3. 訪問 http://localhost:3000

---

## ✅ 驗證設置是否成功

### 方法 1：檢查終端機輸出
啟動開發伺服器時，如果環境變數缺失，Next.js 會顯示警告。

### 方法 2：測試登入功能
1. 訪問：http://localhost:3000/admin/login
2. 如果環境變數正確，應該能看到登入頁面
3. 如果環境變數錯誤，可能會看到連線錯誤

### 方法 3：檢查瀏覽器 Console
1. 打開瀏覽器開發者工具（F12）
2. 查看 Console 是否有 Supabase 連線錯誤

---

## 🐛 常見問題

### Q: 找不到 .env.local 文件？
**A:** 
- 確保文件在專案根目錄（與 `package.json` 同層級）
- 文件名必須是 `.env.local`（注意開頭的點）
- 某些編輯器可能隱藏以點開頭的文件，檢查「顯示隱藏文件」選項

### Q: 設置後還是無法連線？
**A:** 
1. **重啟開發伺服器**（最重要！）
2. 檢查 Supabase URL 和 Key 是否正確複製（沒有多餘空格）
3. 確認 Supabase 專案是否正常運行
4. 檢查瀏覽器 Console 的錯誤訊息

### Q: 如何確認環境變數是否被讀取？
**A:** 
在代碼中暫時添加（僅用於測試）：
```typescript
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
```
然後檢查瀏覽器 Console 或終端機輸出。

### Q: 可以共用同一個 Supabase 專案嗎？
**A:** 
- 可以，但建議每個環境（開發、測試、生產）使用不同的 Supabase 專案
- 這樣可以避免測試數據影響生產環境

---

## 📝 完整範例

假設你的 Supabase 資訊是：
- Project URL: `https://abcdefghijklmnop.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

你的 `.env.local` 應該是：

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

完成這些步驟後，你的網站就能正常連接到 Supabase 了！🎉
