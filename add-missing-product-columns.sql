-- ============================================
-- 為 products 表添加缺失的欄位
-- ============================================
-- 使用方法：在 Supabase SQL Editor 中執行此腳本
-- 
-- 此腳本會檢查欄位是否存在，如果不存在才添加
-- 如果欄位已存在，會跳過（不會報錯）
-- ============================================

-- 添加 compare_at_price（原價）欄位
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'compare_at_price'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN compare_at_price DECIMAL(10, 2);
    
    RAISE NOTICE '已添加 compare_at_price 欄位';
  ELSE
    RAISE NOTICE 'compare_at_price 欄位已存在，跳過';
  END IF;
END $$;

-- 添加 rich_description（詳細描述）欄位
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'rich_description'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN rich_description TEXT;
    
    RAISE NOTICE '已添加 rich_description 欄位';
  ELSE
    RAISE NOTICE 'rich_description 欄位已存在，跳過';
  END IF;
END $$;

-- 添加 is_featured（精選產品）欄位
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN is_featured BOOLEAN DEFAULT false;
    
    RAISE NOTICE '已添加 is_featured 欄位';
  ELSE
    RAISE NOTICE 'is_featured 欄位已存在，跳過';
  END IF;
END $$;

-- ============================================
-- 驗證：查詢 products 表的所有欄位
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
