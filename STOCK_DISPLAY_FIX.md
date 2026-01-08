# 前台商品缺貨顯示問題修復

## 🔍 問題原因

在 `components/featured-products.tsx` 中：
1. **查詢時沒有包含 `stock_quantity` 欄位**（第 46 行）
2. **映射邏輯錯誤**：`product.stock_quantity || 0` 會將 `null`/`undefined` 轉換為 `0`（第 94 行）

這導致所有產品的 `stock_quantity` 都是 `undefined`，然後被轉換為 `0`，所以全部顯示缺貨。

## ✅ 已修復

### 1. 添加 stock_quantity 到查詢
```typescript
// 修正前
.select("id, name, slug, price, compare_at_price, description, image_url, is_active, created_at")

// 修正後
.select("id, name, slug, price, compare_at_price, description, image_url, stock_quantity, is_active, created_at")
```

### 2. 修正映射邏輯
```typescript
// 修正前（錯誤）
stock_quantity: product.stock_quantity || 0, // null/undefined 會被轉換為 0

// 修正後（正確）
stock_quantity: product.stock_quantity !== undefined && product.stock_quantity !== null 
  ? Number(product.stock_quantity) 
  : null, // 保留 null，不要轉換為 0
```

### 3. 同時修正 product-list.tsx
- ✅ 添加 `stock_quantity` 到查詢

## 📋 顯示邏輯

現在的顯示邏輯：
- **`stock_quantity === null`** → 顯示「現貨供應」，可以加入購物車
- **`stock_quantity > 0`** → 顯示「庫存：X 件」，可以加入購物車
- **`stock_quantity === 0`** → 顯示「缺貨中」，無法加入購物車

## 🚨 重要提醒

### 執行 SQL 更新
請務必執行 `update-stock-quantity.sql` 來更新現有資料：
```sql
UPDATE products
SET stock_quantity = 10
WHERE stock_quantity IS NULL OR stock_quantity = 0;
```

## ✅ 測試步驟

1. 重新整理頁面（Ctrl + F5）
2. 打開瀏覽器 Console（F12）
3. 查看 `前端收到的產品資料：` 日誌
4. 確認每個產品都有 `stock_quantity` 欄位
5. 確認產品不再顯示「缺貨中」
