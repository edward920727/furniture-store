-- 商城系統功能更新 SQL
-- 請在 Supabase SQL Editor 中執行此腳本

-- 1. 添加優惠碼免運費欄位
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_free_shipping BOOLEAN DEFAULT false;

-- 2. 修改訂單表的匯款後五碼欄位名稱（如果存在舊欄位）
DO $$ 
BEGIN
  -- 檢查是否存在舊欄位
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'bank_account_last5'
  ) THEN
    -- 如果新欄位不存在，則重命名舊欄位
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'remittance_last_five'
    ) THEN
      ALTER TABLE orders RENAME COLUMN bank_account_last5 TO remittance_last_five;
    ELSE
      -- 如果新欄位已存在，則刪除舊欄位
      ALTER TABLE orders DROP COLUMN bank_account_last5;
    END IF;
  END IF;
END $$;

-- 如果 remittance_last_five 欄位不存在，則創建它
ALTER TABLE orders ADD COLUMN IF NOT EXISTS remittance_last_five VARCHAR(5);

-- 3. 添加運費欄位到訂單表
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_fee DECIMAL(10, 2) DEFAULT 0;

-- 4. 修改會員等級欄位名稱（如果存在舊欄位）
DO $$ 
BEGIN
  -- 檢查是否存在舊欄位 membership_level
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'membership_level'
  ) THEN
    -- 如果新欄位不存在，則重命名舊欄位
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'member_level'
    ) THEN
      ALTER TABLE profiles RENAME COLUMN membership_level TO member_level;
    ELSE
      -- 如果新欄位已存在，則刪除舊欄位
      ALTER TABLE profiles DROP COLUMN membership_level;
    END IF;
  END IF;
END $$;

-- 如果 member_level 欄位不存在，則創建它
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS member_level VARCHAR(20) DEFAULT 'normal' CHECK (member_level IN ('normal', 'vip', 'vvip'));

-- 5. 更新 RLS 政策以使用新欄位名稱（如果需要）
-- 注意：如果 RLS 政策中使用了舊欄位名稱，需要手動更新
