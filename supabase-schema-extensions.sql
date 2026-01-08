-- 張馨家居 - 商城系統擴展 Schema
-- 優惠碼、會員系統、銀行轉帳功能

-- 1. 優惠碼表 (Coupons)
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('fixed', 'percentage')), -- fixed: 固定金額, percentage: 百分比
  discount_value DECIMAL(10, 2) NOT NULL, -- 折扣金額或百分比（如 10 表示 10% 或 10 元）
  min_purchase_amount DECIMAL(10, 2) DEFAULT 0, -- 最低消費金額
  max_discount_amount DECIMAL(10, 2), -- 最大折扣金額（僅百分比折扣時使用）
  usage_limit INTEGER, -- 使用次數限制（NULL 表示無限制）
  used_count INTEGER DEFAULT 0, -- 已使用次數
  expires_at TIMESTAMP WITH TIME ZONE, -- 到期日
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 會員資料表 (Profiles) - 擴展 Supabase Auth 用戶資訊
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  phone VARCHAR(50),
  address TEXT,
  membership_level VARCHAR(20) DEFAULT 'normal' CHECK (membership_level IN ('normal', 'vip', 'vvip')), -- 會員等級
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 擴展訂單表 (Orders) - 添加支付相關欄位
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL; -- 關聯會員
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'credit_card', 'cash_on_delivery')); -- 支付方式
ALTER TABLE orders ADD COLUMN IF NOT EXISTS bank_account_last5 VARCHAR(5); -- 匯款後五碼
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL; -- 使用的優惠碼
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0; -- 折扣金額
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal_amount DECIMAL(10, 2) NOT NULL DEFAULT 0; -- 小計（折扣前）
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT; -- 配送地址
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_name VARCHAR(100); -- 收件人姓名
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(50); -- 收件人電話

-- 更新訂單狀態的 CHECK 約束（如果尚未存在）
DO $$ 
BEGIN
  -- 檢查並更新 status 欄位的約束
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_status_check'
  ) THEN
    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
    ALTER TABLE orders ADD CONSTRAINT orders_status_check 
      CHECK (status IN ('pending', 'waiting_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'));
  END IF;
END $$;

-- 更新訂單表的預設狀態為 'waiting_payment'（銀行轉帳時）
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'waiting_payment';

-- 索引優化
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_membership ON profiles(membership_level);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);

-- 更新時間觸發器
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- 優惠碼表：公開可讀（前台需要查詢），管理員可管理
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public coupons are viewable by everyone"
  ON coupons FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Admins can manage coupons"
  ON coupons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- 會員資料表：用戶只能查看和更新自己的資料，管理員可查看所有
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- 訂單表：用戶只能查看自己的訂單，管理員可查看所有
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders"
  ON orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- 訂單項目表：通過訂單關聯權限
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all order items"
  ON order_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- 自動創建會員資料的觸發器（當用戶註冊時）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 如果觸發器不存在，則創建
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
