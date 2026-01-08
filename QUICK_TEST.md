# 快速測試指南：新增產品 → 檢查前台 → 刪除

## 方法 1: 手動測試（推薦）

### 步驟 1: 新增產品

1. **打開後台**
   - 訪問：http://localhost:3000/admin/products
   - 打開瀏覽器 Console (按 F12)

2. **點擊「新增產品」按鈕**

3. **填寫表單**
   - **產品名稱**: `測試產品-${當前時間}`（例如：`測試產品-1736260000`）
   - **分類**: 選擇任意分類（或「無分類」）
   - **簡短描述**: `這是測試產品`
   - **價格**: `9999`
   - **原價**: `12999`（可選）
   - **庫存數量**: `10`
   - ✅ **精選產品**: 必須勾選
   - ✅ **啟用**: 必須勾選

4. **點擊「儲存」**

5. **檢查結果**
   - 如果成功：應該看到「創建成功」的 toast 訊息
   - 如果失敗：會彈出 alert 顯示錯誤訊息
   - **查看 Console**：應該看到 `✅ 產品創建成功！` 和產品資料

### 步驟 2: 檢查前台

1. **打開新分頁**
   - 訪問：http://localhost:3000/
   - 打開瀏覽器 Console (按 F12)

2. **滾動到「精選產品」區塊**

3. **檢查產品**
   - 確認剛才新增的產品是否出現
   - **查看 Console**：應該看到 `前台 - 成功載入產品: X 個`
   - 如果沒有顯示，檢查 Console 中的錯誤訊息

4. **如果沒有顯示**
   - 確認產品的「啟用」和「精選產品」都已勾選
   - 刷新頁面 (F5)
   - 檢查 Console 中的查詢結果

### 步驟 3: 刪除產品

1. **返回後台**
   - 訪問：http://localhost:3000/admin/products

2. **找到測試產品**
   - 在產品列表中找到剛才新增的產品

3. **點擊刪除按鈕**
   - 點擊產品卡片右上角的垃圾桶圖標
   - 確認刪除對話框

4. **檢查結果**
   - 如果成功：應該看到「刪除成功」的 toast 訊息
   - 如果失敗：會彈出 alert 顯示錯誤訊息
   - **查看 Console**：應該看到 `✅ 產品刪除成功！`

5. **確認前台更新**
   - 返回前台首頁
   - 刷新頁面 (F5)
   - 確認產品已從列表中移除

---

## 方法 2: 使用瀏覽器 Console 腳本

### 在後台頁面執行

1. **打開後台**
   - 訪問：http://localhost:3000/admin/products
   - 按 F12 打開 Console

2. **複製貼上以下代碼**：

```javascript
// 快速測試：新增產品
(async function() {
  const { createClient } = await import('/lib/supabase/client.js')
  const supabase = createClient()
  
  // 獲取分類
  const { data: cats } = await supabase.from('categories').select('id').limit(1)
  const catId = cats?.[0]?.id || null
  
  // 創建產品
  const product = {
    name: `測試產品-${Date.now()}`,
    slug: `test-${Date.now()}`,
    description: '測試',
    price: 9999,
    stock_quantity: 10,
    category_id: catId,
    is_featured: true,
    is_active: true,
  }
  
  console.log('準備創建:', product)
  const { data, error } = await supabase.from('products').insert([product]).select().single()
  
  if (error) {
    console.error('❌ 錯誤:', error)
    alert(`錯誤：${error.message}`)
  } else {
    console.log('✅ 成功:', data)
    alert(`成功！產品 ID: ${data.id}\n名稱: ${data.name}`)
    window.testProductId = data.id // 儲存 ID 供刪除使用
  }
})()
```

3. **檢查前台**
   - 訪問：http://localhost:3000/
   - 確認產品是否顯示

4. **刪除產品**（在後台 Console 執行）：

```javascript
// 刪除剛才創建的產品
(async function() {
  if (!window.testProductId) {
    alert('請先執行新增產品的腳本')
    return
  }
  
  const { createClient } = await import('/lib/supabase/client.js')
  const supabase = createClient()
  
  const { error } = await supabase.from('products').delete().eq('id', window.testProductId)
  
  if (error) {
    console.error('❌ 錯誤:', error)
    alert(`錯誤：${error.message}`)
  } else {
    console.log('✅ 刪除成功')
    alert('刪除成功！')
  }
})()
```

---

## 調試檢查清單

如果新增失敗，請檢查：

- [ ] Console 中的錯誤訊息
- [ ] Alert 彈窗中的錯誤代碼
- [ ] 產品名稱是否填寫
- [ ] 價格是否為數字格式
- [ ] 分類 ID 是否為有效的 UUID
- [ ] Supabase 環境變數是否正確設置
- [ ] RLS 政策是否允許插入

如果前台看不到產品，請檢查：

- [ ] 產品的 `is_active` 是否為 `true`
- [ ] 產品的 `is_featured` 是否為 `true`
- [ ] Console 中的查詢結果
- [ ] 是否有 RLS 權限問題
- [ ] 前台頁面是否已刷新

如果刪除失敗，請檢查：

- [ ] Console 中的錯誤訊息
- [ ] Alert 彈窗中的錯誤代碼
- [ ] 產品 ID 是否正確
- [ ] RLS 政策是否允許刪除
- [ ] 產品是否有關聯資料（如訂單）

---

## 常見錯誤解決

### 錯誤：`duplicate key value violates unique constraint "products_slug_key"`
- **原因**: Slug 重複
- **解決**: 系統會自動重試，如果還是失敗，請使用不同的產品名稱

### 錯誤：`null value in column "name" violates not-null constraint`
- **原因**: 產品名稱不能為空
- **解決**: 確保填寫產品名稱

### 錯誤：`permission denied`
- **原因**: RLS 政策不允許操作
- **解決**: 檢查 Supabase RLS 政策設定

### 錯誤：`invalid input syntax for type uuid`
- **原因**: 分類 ID 格式錯誤
- **解決**: 確保選擇的是有效的分類，或選擇「無分類」
