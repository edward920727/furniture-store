-- 系統設定表 - 用於存儲 VIP/VVIP 折扣百分比等系統配置
-- 執行此 SQL 文件以添加系統設定功能

-- 1. 創建系統設定表
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL, -- 設定鍵（如 'vip_discount_percentage', 'vvip_discount_percentage'）
  setting_value TEXT NOT NULL, -- 設定值（JSON 格式或純文字）
  description TEXT, -- 設定說明
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 插入初始設定值
-- VIP 折扣百分比（10% = 0.1）
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('vip_discount_percentage', '10', 'VIP 會員折扣百分比（例如：10 表示 10% 折扣）')
ON CONFLICT (setting_key) DO NOTHING;

-- VVIP 折扣百分比（20% = 0.2）
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('vvip_discount_percentage', '20', 'VVIP 會員折扣百分比（例如：20 表示 20% 折扣）')
ON CONFLICT (setting_key) DO NOTHING;

-- 3. 創建索引
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- 4. 更新時間觸發器
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Row Level Security (RLS) Policies
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- 公開讀取政策（前台需要讀取折扣設定）
CREATE POLICY "System settings are viewable by everyone"
  ON system_settings FOR SELECT
  USING (true);

-- 管理員政策（只有管理員可以更新設定）
CREATE POLICY "Admins can manage system settings"
  ON system_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );
