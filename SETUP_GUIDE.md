# 🚀 網站啟動與設置指南

## 第一步：啟動開發伺服器

開發伺服器已經在背景啟動！請在瀏覽器中訪問：

**http://localhost:3000**

如果沒有自動打開，請：
1. 打開瀏覽器
2. 在網址列輸入：`http://localhost:3000`
3. 按 Enter

## 第二步：設置 Supabase 資料庫

### 1. 創建 Supabase 專案
- 前往 [supabase.com](https://supabase.com)
- 註冊/登入帳號
- 創建新專案

### 2. 執行資料庫 Schema
- 在 Supabase Dashboard 中，點擊左側的 **SQL Editor**
- 打開專案中的 `supabase-schema.sql` 文件
- 複製全部內容並貼到 SQL Editor
- 點擊 **Run** 執行

### 3. 插入測試數據
- 在 SQL Editor 中，打開 `supabase-seed-data.sql` 文件
- 複製全部內容並貼到 SQL Editor
- 點擊 **Run** 執行
- 這樣你就會有 6 個測試家具產品了！

### 4. 設置環境變數
創建 `.env.local` 文件（在專案根目錄）：

```env
NEXT_PUBLIC_SUPABASE_URL=你的_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_LINE_ID=你的_line_id
NEXT_PUBLIC_PHONE_NUMBER=+886-2-1234-5678
```

**如何找到這些值：**
- 在 Supabase Dashboard 中，點擊 **Settings** → **API**
- `NEXT_PUBLIC_SUPABASE_URL` = Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key
- `SUPABASE_SERVICE_ROLE_KEY` = service_role key（⚠️ 保密！）

### 5. 重啟開發伺服器
設置完環境變數後，需要重啟：
- 在終端機按 `Ctrl + C` 停止伺服器
- 再次執行 `npm run dev`

## 第三步：設置管理後台

### 1. 創建管理員帳號
- 在 Supabase Dashboard，點擊 **Authentication** → **Users**
- 點擊 **Add user** → **Create new user**
- 輸入 Email 和密碼
- 記下創建的 User ID（UUID）

### 2. 將用戶設為管理員
在 SQL Editor 中執行：

```sql
INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES (
  '你的_user_id',
  '你的_email',
  '管理員',
  'admin',
  true
);
```

### 3. 登入後台
- 訪問：**http://localhost:3000/admin/login**
- 使用剛才創建的 Email 和密碼登入
- 成功後會自動跳轉到 Dashboard

## 第四步：查看網站功能

### ✅ 前台頁面
- **首頁**：http://localhost:3000
  - Hero Banner（大圖 + 文字疊在中間）
  - 產品分類區塊
  - 精選產品展示

- **產品列表**：http://localhost:3000/products
  - 搜尋功能
  - 分類篩選
  - 價格排序
  - 分頁

- **產品詳情**：http://localhost:3000/products/[產品slug]
  - 多圖展示
  - 產品規格
  - LINE/電話諮詢按鈕

### ✅ 管理後台
- **登入頁**：http://localhost:3000/admin/login
- **Dashboard**：http://localhost:3000/admin
  - 統計數據
  - 產品分類圖表

- **產品管理**：http://localhost:3000/admin/products
  - 查看所有產品
  - 新增/編輯/刪除產品
  - 富文本編輯器

## 🎨 開始微調你的網站

現在網站已經可以運行了！你可以開始微調：

### 1. 更換首頁 Banner 圖片
在 `components/hero-banner.tsx` 中修改圖片 URL：
```tsx
src="https://images.unsplash.com/photo-你的圖片ID?w=1920&q=80"
```

### 2. 修改顏色主題
在 `app/globals.css` 中修改 CSS 變數：
```css
--primary: 你的顏色值;
--background: 你的背景色;
```

### 3. 添加更多產品
- 在管理後台新增產品
- 或直接在 Supabase 的 `products` 表中插入

### 4. 調整布局
所有組件都在 `components/` 目錄中，可以直接編輯修改

## 🐛 常見問題

### Q: 網站顯示「載入中...」但沒有產品？
**A:** 檢查：
1. Supabase 環境變數是否正確設置
2. 是否執行了 `supabase-seed-data.sql`
3. 瀏覽器 Console 是否有錯誤訊息

### Q: 無法登入後台？
**A:** 檢查：
1. 是否在 `admin_users` 表中插入了管理員記錄
2. User ID 是否正確
3. 環境變數是否正確

### Q: 圖片無法顯示？
**A:** 檢查：
1. 圖片 URL 是否有效
2. `next.config.js` 中的圖片域名設置

## 📝 下一步建議

1. ✅ **先搞定首頁**：讓它看起來比 hsinfyhome.com 更漂亮
2. ✅ **搞定商品頁**：確保產品詳情頁有完整資訊
3. ✅ **搞定後台清單**：確保能在後台看到所有家具

完成這些後，你的網站就基本完成了！

## 💡 提示

- 所有代碼都有註解，可以直接修改
- 使用 `Ctrl + I` 打開 Composer，告訴 AI 你想要什麼改變
- 修改後保存文件，Next.js 會自動重新載入

祝你開發順利！🎉
