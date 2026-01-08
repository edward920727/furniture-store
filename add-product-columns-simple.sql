-- ============================================
-- 簡化版：直接添加欄位（如果已存在會報錯，但可以忽略）
-- ============================================
-- 如果欄位已存在，會顯示錯誤但不會影響其他欄位的添加
-- ============================================

-- 添加 compare_at_price（原價）欄位
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(10, 2);

-- 添加 rich_description（詳細描述）欄位
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS rich_description TEXT;

-- 添加 is_featured（精選產品）欄位
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- ============================================
-- 完成！現在可以測試新增產品功能了
-- ============================================
