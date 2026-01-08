-- 創建減少庫存的函數
CREATE OR REPLACE FUNCTION decrease_stock(product_id UUID, quantity INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  -- 獲取當前庫存
  SELECT stock_quantity INTO current_stock
  FROM products
  WHERE id = product_id;

  -- 檢查庫存是否足夠
  IF current_stock IS NULL THEN
    RETURN FALSE;
  END IF;

  IF current_stock < quantity THEN
    RETURN FALSE;
  END IF;

  -- 減少庫存
  UPDATE products
  SET stock_quantity = stock_quantity - quantity
  WHERE id = product_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
