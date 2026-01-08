-- 測試管理員帳號設置腳本
-- 請按照以下步驟操作：

-- ============================================
-- 步驟 1：在 Supabase Dashboard 中創建用戶
-- ============================================
-- 1. 前往 Supabase Dashboard → Authentication → Users
-- 2. 點擊 "Add user" → "Create new user"
-- 3. 輸入以下資訊：
--    Email: admin@test.com
--    Password: admin123456
--    (取消勾選 "Auto Confirm User")
-- 4. 點擊 "Create user"
-- 5. 複製創建的 User ID (UUID格式，例如：123e4567-e89b-12d3-a456-426614174000)

-- ============================================
-- 步驟 2：執行下面的 SQL（替換 YOUR_USER_ID）
-- ============================================

-- 將下面的 YOUR_USER_ID 替換為步驟 1 中複製的 User ID，然後執行

INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES (
  'YOUR_USER_ID',  -- ⚠️ 請替換為實際的 User ID
  'admin@test.com',
  '測試管理員',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  is_active = true;

-- ============================================
-- 測試帳號資訊
-- ============================================
-- Email: admin@test.com
-- Password: admin123456
-- 
-- 登入網址: http://localhost:3000/admin/login
-- ============================================
