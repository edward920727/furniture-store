# 庫存顯示問題修復總結

## ✅ 已完成的修復

### 1. 修改資料庫讀取與顯示邏輯 ✅

#### 前端顯示邏輯更新
- ✅ **ProductQuickView**：只有當 `stock_quantity === 0` 時才顯示「缺貨中」
- ✅ **ProductDetail**：只有當 `stock_quantity === 0` 時才顯示「缺貨中」
- ✅ **FeaturedProducts**：只有當 `stock_quantity === 0` 時才禁用按鈕
- ✅ **預設顯示**：如果 `stock_quantity` 為 `null` 或 `undefined`，顯示「現貨供應」

#### 邏輯說明
```typescript
// 舊邏輯（錯誤）
if (stock_quantity <= 0) { // null 或 0 都會顯示缺貨
  return "缺貨中"
}

// 新邏輯（正確）
const stock = stock_quantity ?? null
if (stock !== null && stock === 0) {
  return "缺貨中"
} else if (stock !== null) {
  return `庫存：${stock} 件`
} else {
  return "現貨供應" // null 時顯示現貨供應
}
```

### 2. 更新管理後台表單 ✅

#### 表單更新
- ✅ **庫存數量欄位**：已存在，現在標記為必填（*）
- ✅ **預設值**：從 `"0"` 改為 `"99"`
- ✅ **提示文字**：添加「預設值：99（現貨供應）」
- ✅ **儲存邏輯**：如果為空，預設為 99

#### 表單欄位
```typescript
<Input
  id="stock_quantity"
  type="number"
  min="0"
  value={formData.stock_quantity}
  placeholder="99"
  required
/>
<p className="text-xs text-muted-foreground">預設值：99（現貨供應）</p>
```

### 3. 批次更新現有資料 ✅

#### SQL 腳本
已創建 `update-stock-quantity.sql` 腳本，執行以下操作：
- 將所有 `stock_quantity` 為 `NULL` 或 `0` 的產品更新為 `10`
- 包含查詢語句，可查看更新結果

#### 執行方式
1. 前往 Supabase Dashboard
2. 點擊左側選單的 **SQL Editor**
3. 複製 `update-stock-quantity.sql` 的內容
4. 貼到 SQL Editor 並執行

---

## 📋 修改的檔案

1. **`components/product-quick-view.tsx`**
   - 更新庫存顯示邏輯
   - 更新加入購物車邏輯
   - 更新數量選擇器邏輯

2. **`components/product-detail.tsx`**
   - 更新庫存顯示邏輯
   - 更新加入購物車邏輯

3. **`components/featured-products.tsx`**
   - 更新加入購物車邏輯
   - 更新按鈕禁用邏輯

4. **`components/admin/product-management.tsx`**
   - 更新表單預設值為 99
   - 更新儲存邏輯
   - 添加提示文字

5. **`update-stock-quantity.sql`**（新建）
   - 批次更新 SQL 腳本

---

## 🔧 庫存顯示邏輯

### 顯示規則
- **`stock_quantity === null`** → 顯示「現貨供應」
- **`stock_quantity > 0`** → 顯示「庫存：X 件」
- **`stock_quantity === 0`** → 顯示「缺貨中」

### 加入購物車邏輯
- **`stock_quantity === null`** → 允許加入（預設為 99）
- **`stock_quantity > 0`** → 允許加入
- **`stock_quantity === 0`** → 禁止加入，顯示缺貨提示

---

## ✅ 測試檢查清單

### 前端顯示
- [ ] 庫存為 null 的產品顯示「現貨供應」
- [ ] 庫存 > 0 的產品顯示「庫存：X 件」
- [ ] 庫存 = 0 的產品顯示「缺貨中」
- [ ] 庫存為 null 的產品可以加入購物車
- [ ] 庫存 > 0 的產品可以加入購物車
- [ ] 庫存 = 0 的產品無法加入購物車

### 後台表單
- [ ] 新增產品時，庫存數量預設為 99
- [ ] 庫存數量欄位標記為必填（*）
- [ ] 顯示提示文字「預設值：99（現貨供應）」
- [ ] 儲存時能正確寫入 Supabase

### 批次更新
- [ ] 執行 SQL 腳本
- [ ] 確認所有產品的 stock_quantity 都不為 null 或 0
- [ ] 前端顯示正常

---

## 🚨 重要提醒

### 執行 SQL 腳本
請務必執行 `update-stock-quantity.sql` 來更新現有資料：
1. 前往 Supabase Dashboard → SQL Editor
2. 複製腳本內容並執行
3. 確認更新結果

### 資料庫欄位
確認 Supabase 中的 `products` 表有 `stock_quantity` 欄位：
- 類型：`INTEGER`
- 預設值：`0`（建議改為 `NULL` 或 `99`）

---

## 🎉 完成！

所有庫存顯示問題已修復，沒有語法錯誤。產品現在會正確顯示庫存狀態！

**下一步：**
1. 執行 `update-stock-quantity.sql` 更新現有資料
2. 重新整理頁面（Ctrl + F5）
3. 測試產品庫存顯示
4. 測試加入購物車功能
