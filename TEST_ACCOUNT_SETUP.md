# 🔐 測試管理員帳號設置指南

## 方法一：手動設置（推薦，最簡單）

### 步驟 1：在 Supabase Dashboard 創建用戶

1. 登入 [Supabase Dashboard](https://app.supabase.com)
2. 選擇你的專案
3. 點擊左側選單的 **Authentication** → **Users**
4. 點擊右上角的 **Add user** → **Create new user**
5. 填寫以下資訊：
   ```
   Email: admin@test.com
   Password: admin123456
   ```
6. **取消勾選** "Auto Confirm User"（或保持勾選也可以）
7. 點擊 **Create user**
8. **重要**：複製創建的 User ID（UUID 格式，例如：`a1b2c3d4-e5f6-7890-abcd-ef1234567890`）

### 步驟 2：設置管理員權限

1. 在 Supabase Dashboard，點擊左側選單的 **SQL Editor**
2. 打開專案中的 `supabase-test-account.sql` 文件
3. 將 SQL 中的 `YOUR_USER_ID` 替換為步驟 1 中複製的 User ID
4. 執行 SQL

**或者直接執行這個 SQL（記得替換 YOUR_USER_ID）：**

```sql
INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES (
  'YOUR_USER_ID',  -- ⚠️ 替換為實際的 User ID
  'admin@test.com',
  '測試管理員',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  is_active = true;
```

### 步驟 3：登入測試

1. 訪問：**http://localhost:3000/admin/login**
2. 輸入：
   - Email: `admin@test.com`
   - Password: `admin123456`
3. 點擊登入

---

## 方法二：使用腳本自動設置（進階）

如果你已經設置了環境變數，可以使用 Node.js 腳本：

```bash
# 確保已設置環境變數
export NEXT_PUBLIC_SUPABASE_URL=你的_supabase_url
export SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key

# 執行腳本
npx tsx scripts/create-test-admin.ts
```

---

## 📋 測試帳號資訊

```
Email: admin@test.com
Password: admin123456
登入網址: http://localhost:3000/admin/login
```

---

## ⚠️ 注意事項

1. **安全性**：這只是測試帳號，請勿在生產環境使用
2. **User ID**：必須是 Supabase Auth 中創建的用戶的 UUID
3. **環境變數**：確保 `.env.local` 已正確設置 Supabase 連線資訊

---

## 🐛 常見問題

### Q: 登入時顯示「權限不足」？
**A:** 檢查：
- 是否在 `admin_users` 表中插入了記錄
- User ID 是否正確
- `is_active` 是否為 `true`

### Q: 找不到 User ID？
**A:** 在 Supabase Dashboard → Authentication → Users，點擊用戶即可看到 User ID

### Q: 用戶已存在但無法登入？
**A:** 檢查：
- 密碼是否正確
- 用戶是否已確認（Email Confirmed）
- 在 Authentication → Users 中確認用戶狀態

---

## ✅ 驗證設置是否成功

執行這個 SQL 查詢，應該能看到你的管理員記錄：

```sql
SELECT * FROM admin_users WHERE email = 'admin@test.com';
```

如果查詢結果中有記錄且 `is_active = true`，表示設置成功！
