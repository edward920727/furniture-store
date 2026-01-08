-- 批次更新現有產品的庫存數量
-- 將所有 stock_quantity 為 NULL 或 0 的產品更新為 10

UPDATE products
SET stock_quantity = 10
WHERE stock_quantity IS NULL OR stock_quantity = 0;

-- 查看更新結果
SELECT id, name, stock_quantity 
FROM products 
ORDER BY created_at DESC;
