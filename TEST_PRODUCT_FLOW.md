# 產品新增與刪除測試流程

## 測試步驟

### 1. 測試新增產品

1. **訪問後台**
   - 打開 http://localhost:3000/admin/products
   - 確認頁面正常載入

2. **新增產品**
   - 點擊「新增產品」按鈕
   - 填寫以下測試資料：
     - **產品名稱**: `測試產品-${當前時間戳}`
     - **分類**: 選擇任意一個分類（或選擇「無分類」）
     - **簡短描述**: `這是一個測試產品`
     - **價格**: `9999`
     - **原價**: `12999`（可選）
     - **庫存數量**: `10`
     - **精選產品**: ✅ 勾選
     - **啟用**: ✅ 勾選（必須勾選，否則前台看不到）

3. **提交並檢查**
   - 點擊「儲存」按鈕
   - **打開瀏覽器 Console (F12)**，檢查是否有錯誤
   - 如果出現 alert 彈窗，記錄錯誤訊息
   - 檢查 Console 中的日誌：
     - `準備提交的產品資料:`
     - `嘗試創建產品:`
     - `✅ 產品創建成功！`

4. **確認後台顯示**
   - 檢查產品列表是否出現新產品
   - 確認產品名稱、價格等資訊正確

### 2. 測試前台顯示

1. **訪問前台首頁**
   - 打開 http://localhost:3000/
   - 滾動到「精選產品」區塊

2. **檢查產品顯示**
   - 確認剛才新增的產品是否出現在列表中
   - **打開瀏覽器 Console (F12)**，檢查日誌：
     - `前台 - Supabase 查詢結果:`
     - `前台 - 成功載入產品: X 個`
     - `前台 - 產品列表:`

3. **如果沒有顯示**
   - 檢查 Console 是否有錯誤
   - 確認產品的 `is_active` 是否為 `true`
   - 確認產品的 `is_featured` 是否為 `true`（如果首頁只顯示精選產品）

### 3. 測試刪除產品

1. **返回後台**
   - 訪問 http://localhost:3000/admin/products

2. **刪除產品**
   - 找到剛才新增的測試產品
   - 點擊產品卡片右上角的「刪除」按鈕（垃圾桶圖標）
   - 確認刪除對話框

3. **檢查刪除結果**
   - **打開瀏覽器 Console (F12)**，檢查日誌：
     - `準備刪除產品 ID:`
     - `✅ 產品刪除成功！`
   - 確認產品從列表中消失

4. **確認前台更新**
   - 返回前台首頁 http://localhost:3000/
   - 刷新頁面（F5）
   - 確認產品已從列表中移除

## 常見問題排查

### 問題 1: 新增產品失敗

**檢查項目：**
- Console 中的錯誤訊息
- Alert 彈窗中的錯誤代碼和詳細資訊
- 確認所有必填欄位都已填寫
- 確認價格是數字格式

**常見錯誤：**
- `duplicate key value violates unique constraint "products_slug_key"` → Slug 重複，系統會自動重試
- `null value in column "name" violates not-null constraint` → 產品名稱不能為空
- `invalid input syntax for type uuid` → 分類 ID 格式錯誤

### 問題 2: 前台看不到產品

**檢查項目：**
- 產品的 `is_active` 必須為 `true`
- 產品的 `is_featured` 必須為 `true`（如果首頁只顯示精選產品）
- Console 中的查詢結果
- 確認 Supabase RLS 政策允許公開讀取

**解決方法：**
- 編輯產品，確認「啟用」和「精選產品」都已勾選
- 檢查 Supabase 的 RLS 政策

### 問題 3: 刪除產品失敗

**檢查項目：**
- Console 中的錯誤訊息
- Alert 彈窗中的錯誤代碼
- 確認產品 ID 是否正確

**常見錯誤：**
- `permission denied` → RLS 政策不允許刪除
- `foreign key constraint` → 產品有關聯資料（如訂單）無法刪除

## 調試日誌位置

所有調試資訊都會顯示在：
- **瀏覽器 Console** (按 F12 打開)
- **Alert 彈窗**（錯誤時會自動彈出）

## 快速測試腳本

如果需要快速測試，可以在瀏覽器 Console 中執行：

```javascript
// 測試新增產品
async function testCreateProduct() {
  const supabase = window.supabase || (await import('@/lib/supabase/client')).createClient()
  const testProduct = {
    name: `測試產品-${Date.now()}`,
    slug: `test-product-${Date.now()}`,
    description: '測試產品',
    price: 9999,
    stock_quantity: 10,
    is_featured: true,
    is_active: true,
  }
  const { data, error } = await supabase.from('products').insert([testProduct]).select()
  console.log('創建結果:', { data, error })
  return { data, error }
}

// 測試刪除產品（需要產品 ID）
async function testDeleteProduct(productId) {
  const supabase = window.supabase || (await import('@/lib/supabase/client')).createClient()
  const { error } = await supabase.from('products').delete().eq('id', productId)
  console.log('刪除結果:', { error })
  return { error }
}
```
