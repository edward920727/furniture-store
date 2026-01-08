-- 為 products 表添加 image_url 欄位（如果不存在）
-- 這個欄位用於儲存產品的主圖 URL

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 添加註釋說明
COMMENT ON COLUMN products.image_url IS '產品主圖 URL，如果沒有上傳圖片則使用 placeholder';
