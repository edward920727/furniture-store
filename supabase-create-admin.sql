-- ============================================
-- 創建你自己的管理員帳號
-- ============================================
-- 
-- 使用說明：
-- 1. 在 Supabase Dashboard → Authentication → Users 創建用戶
-- 2. 複製 User ID
-- 3. 替換下面 SQL 中的 YOUR_USER_ID、YOUR_EMAIL、YOUR_NAME
-- 4. 執行 SQL
--
-- ============================================

INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES (
  'YOUR_USER_ID',        -- ⚠️ 替換為 Supabase Auth 中的 User ID (UUID)
  'YOUR_EMAIL',          -- ⚠️ 替換為你的 Email
  'YOUR_NAME',           -- ⚠️ 替換為你的名字（可選）
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  is_active = true;

-- ============================================
-- 範例（請替換成你的實際資訊）
-- ============================================
-- 
-- INSERT INTO admin_users (id, email, full_name, role, is_active)
-- VALUES (
--   'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
--   'john@example.com',
--   'John',
--   'admin',
--   true
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   email = EXCLUDED.email,
--   full_name = EXCLUDED.full_name,
--   is_active = true;
--
-- ============================================
