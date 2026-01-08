# Supabase Storage 設置指南

## 📋 設置步驟

### 1. 創建 Storage Bucket

1. 登入 Supabase Dashboard
2. 點擊左側選單的 **Storage**
3. 點擊 **New bucket**
4. 輸入 bucket 名稱：`product-images`
5. 選擇 **Public bucket**（公開，讓圖片可以直接訪問）
6. 點擊 **Create bucket**

### 2. 設置 Bucket 權限

#### 公開讀取權限（讓前台可以顯示圖片）

在 Supabase SQL Editor 中執行：

```sql
-- 允許所有人讀取 product-images bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');
```

#### 管理員上傳權限（讓後台可以上傳圖片）

```sql
-- 允許已認證的管理員上傳圖片
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
);

-- 允許已認證的管理員更新圖片
CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' AND
  auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
);

-- 允許已認證的管理員刪除圖片
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND
  auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
);
```

### 3. 驗證設置

1. 前往 `/admin/products`
2. 點擊「新增產品」
3. 嘗試上傳一張圖片
4. 如果上傳成功，圖片會顯示在預覽區
5. 如果上傳失敗，會顯示錯誤訊息，並提供「手動輸入圖片網址」的備案

---

## 🔧 故障排除

### 問題：上傳失敗，顯示 "Bucket not found"

**解決方案：**
1. 確認 bucket 名稱是 `product-images`（完全一致）
2. 確認 bucket 已創建且狀態為 Active
3. 檢查 Storage → Settings → Buckets 中是否有該 bucket

### 問題：上傳失敗，顯示 "Permission denied"

**解決方案：**
1. 確認已登入管理員帳號
2. 確認 `admin_users` 表中有你的記錄且 `is_active = true`
3. 執行上述的 RLS Policy SQL 語句

### 問題：圖片上傳成功但無法顯示

**解決方案：**
1. 確認 bucket 設為 **Public**
2. 確認已執行「公開讀取權限」的 Policy
3. 檢查圖片 URL 是否正確（應該以 Supabase Storage URL 開頭）

---

## 📝 手動輸入圖片網址（備案）

如果 Supabase Storage 上傳失敗，系統會自動顯示「手動輸入圖片網址」選項。

你可以：
1. 使用其他圖片託管服務（如 Imgur、Cloudinary）
2. 使用 CDN 連結
3. 使用外部圖片 URL

**注意：** 手動輸入的 URL 必須是公開可訪問的圖片連結。

---

## ✅ 完成檢查清單

- [ ] 創建 `product-images` bucket
- [ ] 設置 bucket 為 Public
- [ ] 執行公開讀取權限 Policy
- [ ] 執行管理員上傳權限 Policy
- [ ] 測試上傳功能
- [ ] 確認圖片可以正常顯示
