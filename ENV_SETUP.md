# 🔧 環境變數設置指南

## 創建 .env.local 文件

在專案根目錄創建 `.env.local` 文件（與 `package.json` 同層級）

## 必需的環境變數

```env
# Supabase 配置（必需）
NEXT_PUBLIC_SUPABASE_URL=你的_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key

# 應用程式配置
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 聯絡資訊（可選）
NEXT_PUBLIC_LINE_ID=你的_line_id
NEXT_PUBLIC_PHONE_NUMBER=+886-2-1234-5678
```

## 如何找到 Supabase 環境變數

### 步驟 1：登入 Supabase Dashboard
1. 前往 [supabase.com](https://supabase.com)
2. 登入你的帳號
3. 選擇你的專案

### 步驟 2：獲取環境變數
1. 點擊左側選單的 **Settings**（⚙️ 圖示）
2. 點擊 **API**
3. 你會看到以下資訊：

#### Project URL
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
```

#### anon public key
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### service_role key（⚠️ 保密！）
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**注意**：service_role key 有完整權限，請勿公開！

## 完整範例

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM4OTY3MjkwLCJleHAiOjE5NTQ1NDMyOTB9.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy

# 應用程式配置
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 聯絡資訊
NEXT_PUBLIC_LINE_ID=@your-line-id
NEXT_PUBLIC_PHONE_NUMBER=+886-2-1234-5678
```

## 驗證環境變數是否正確

### 方法 1：檢查終端機輸出
啟動開發伺服器後，如果環境變數缺失，Next.js 會顯示警告。

### 方法 2：檢查瀏覽器 Console
1. 打開瀏覽器開發者工具（F12）
2. 查看 Console 是否有 Supabase 連線錯誤

### 方法 3：測試登入功能
1. 訪問 http://localhost:3000/admin/login
2. 如果環境變數正確，應該能看到登入頁面
3. 如果環境變數錯誤，可能會看到連線錯誤

## ⚠️ 重要提醒

1. **不要提交 .env.local 到 Git**
   - `.env.local` 已在 `.gitignore` 中
   - 永遠不要將包含真實 key 的環境變數文件上傳到公開倉庫

2. **生產環境設置**
   - 部署時，在部署平台（Vercel、Netlify 等）設置環境變數
   - 不要使用 `.env.local` 文件

3. **環境變數命名**
   - `NEXT_PUBLIC_` 前綴的變數會暴露給瀏覽器
   - 沒有前綴的變數只在服務端可用

## 🐛 常見問題

### Q: 找不到 .env.local 文件？
**A:** 
- 確保文件在專案根目錄（與 `package.json` 同層級）
- 文件名必須是 `.env.local`（注意開頭的點）

### Q: 環境變數設置後還是無法連線？
**A:** 
1. 重啟開發伺服器（`Ctrl+C` 然後 `npm run dev`）
2. 檢查 Supabase URL 和 Key 是否正確複製（沒有多餘空格）
3. 確認 Supabase 專案是否正常運行

### Q: service_role key 在哪裡？
**A:** 
- Supabase Dashboard → Settings → API
- 滾動到最下方，找到 "service_role" key
- 點擊 "Reveal" 顯示完整 key

### Q: 可以共用同一個 Supabase 專案嗎？
**A:** 
- 可以，但建議每個環境（開發、測試、生產）使用不同的 Supabase 專案
- 這樣可以避免測試數據影響生產環境
