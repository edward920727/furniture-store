-- 測試數據插入腳本
-- 在 Supabase SQL Editor 中執行此腳本

-- 確保分類存在
INSERT INTO categories (slug, name, is_active, sort_order)
VALUES 
  ('sofa', '沙發', true, 1),
  ('dining', '餐桌椅', true, 2),
  ('bedroom', '床組', true, 3),
  ('bookshelf', '書櫃', true, 4),
  ('coffee-table', '茶几', true, 5),
  ('lighting', '燈具', true, 6)
ON CONFLICT (slug) DO NOTHING;

-- 插入測試產品
INSERT INTO products (name, slug, description, price, compare_at_price, stock_quantity, category_id, is_featured, is_active, dimensions, weight)
SELECT 
  '北歐極簡三人沙發',
  'nordic-sofa-3-seater',
  '採用優質布藝面料，舒適的坐感與簡約的設計完美結合',
  45000,
  52000,
  5,
  (SELECT id FROM categories WHERE slug = 'sofa' LIMIT 1),
  true,
  true,
  '{"length": 220, "width": 95, "height": 85}'::jsonb,
  45
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO products (name, slug, description, price, compare_at_price, stock_quantity, category_id, is_featured, is_active, dimensions, weight)
SELECT 
  '現代簡約餐桌組',
  'modern-dining-table-set',
  '實木餐桌搭配四張餐椅，適合4-6人使用',
  32000,
  38000,
  3,
  (SELECT id FROM categories WHERE slug = 'dining' LIMIT 1),
  true,
  true,
  '{"length": 180, "width": 90, "height": 75}'::jsonb,
  60
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO products (name, slug, description, price, stock_quantity, category_id, is_featured, is_active, dimensions, weight)
SELECT 
  '設計師單人沙發椅',
  'designer-armchair',
  '經典設計師款單人沙發，適合客廳角落或書房',
  18000,
  8,
  (SELECT id FROM categories WHERE slug = 'sofa' LIMIT 1),
  true,
  true,
  '{"length": 75, "width": 80, "height": 95}'::jsonb,
  18
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO products (name, slug, description, price, compare_at_price, stock_quantity, category_id, is_featured, is_active, dimensions, weight)
SELECT 
  '實木書櫃組合',
  'wooden-bookshelf-set',
  '三層實木書櫃，可自由組合排列',
  25000,
  30000,
  4,
  (SELECT id FROM categories WHERE slug = 'bookshelf' LIMIT 1),
  false,
  true,
  '{"length": 120, "width": 35, "height": 180}'::jsonb,
  35
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO products (name, slug, description, price, stock_quantity, category_id, is_featured, is_active, dimensions, weight)
SELECT 
  '北歐風格茶几',
  'nordic-coffee-table',
  '簡約設計的實木茶几，適合現代客廳',
  12000,
  6,
  (SELECT id FROM categories WHERE slug = 'coffee-table' LIMIT 1),
  true,
  true,
  '{"length": 120, "width": 60, "height": 40}'::jsonb,
  15
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO products (name, slug, description, price, compare_at_price, stock_quantity, category_id, is_featured, is_active, dimensions, weight)
SELECT 
  '現代吊燈',
  'modern-pendant-light',
  '簡約設計的吊燈，提供溫暖的照明',
  8500,
  10000,
  10,
  (SELECT id FROM categories WHERE slug = 'lighting' LIMIT 1),
  false,
  true,
  '{"length": 40, "width": 40, "height": 50}'::jsonb,
  3
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- 插入產品圖片
-- 北歐極簡三人沙發
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT 
  (SELECT id FROM products WHERE slug = 'nordic-sofa-3-seater' LIMIT 1),
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
  '北歐極簡三人沙發 - 主圖',
  0,
  true
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT 
  (SELECT id FROM products WHERE slug = 'nordic-sofa-3-seater' LIMIT 1),
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
  '北歐極簡三人沙發 - 側面',
  1,
  false
ON CONFLICT DO NOTHING;

-- 現代簡約餐桌組
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT 
  (SELECT id FROM products WHERE slug = 'modern-dining-table-set' LIMIT 1),
  'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800&q=80',
  '現代簡約餐桌組',
  0,
  true
ON CONFLICT DO NOTHING;

-- 設計師單人沙發椅
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT 
  (SELECT id FROM products WHERE slug = 'designer-armchair' LIMIT 1),
  'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80',
  '設計師單人沙發椅',
  0,
  true
ON CONFLICT DO NOTHING;

-- 實木書櫃組合
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT 
  (SELECT id FROM products WHERE slug = 'wooden-bookshelf-set' LIMIT 1),
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
  '實木書櫃組合',
  0,
  true
ON CONFLICT DO NOTHING;

-- 北歐風格茶几
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT 
  (SELECT id FROM products WHERE slug = 'nordic-coffee-table' LIMIT 1),
  'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800&q=80',
  '北歐風格茶几',
  0,
  true
ON CONFLICT DO NOTHING;

-- 現代吊燈
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT 
  (SELECT id FROM products WHERE slug = 'modern-pendant-light' LIMIT 1),
  'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80',
  '現代吊燈',
  0,
  true
ON CONFLICT DO NOTHING;
