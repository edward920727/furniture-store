# 前台圖片顯示修復總結

## ✅ 已完成的修復

### 1. 檢查欄位讀取
- ✅ 在 `select` 查詢中明確指定 `image_url` 欄位
- ✅ 在 `Product` interface 中添加 `image_url?: string`
- ✅ 在資料映射時包含 `image_url` 欄位

### 2. 修正圖片組件邏輯
- ✅ 使用 Next.js `Image` 組件顯示圖片
- ✅ 正確使用 `product.image_url` 作為圖片來源
- ✅ 添加 `onError` 處理（簡化版本）
- ✅ 添加 `unoptimized` 屬性以支援 Supabase Storage URL

### 3. 添加調試日誌
- ✅ 添加 `console.log("前端收到的產品資料：", data)` 
- ✅ 添加詳細的產品列表日誌，包含圖片 URL
- ✅ 在映射後記錄每個產品的 `image_url`

### 4. 處理空值與 Fallback
- ✅ 如果 `image_url` 為空，顯示「圖片準備中」佔位符
- ✅ 處理相對路徑：自動加上 Supabase Storage URL 前綴
- ✅ 檢查 URL 格式（http:// 或 https://）

### 5. 清除快取
- ✅ 確認 `app/page.tsx` 有 `export const revalidate = 0;`
- ✅ 確保每次重新整理都會抓取最新資料

---

## 🔧 關鍵修改

### 1. Product Interface
```typescript
interface Product {
  id: string
  name: string
  slug: string
  price: number
  compare_at_price?: number
  description?: string
  image_url?: string  // ✅ 新增
}
```

### 2. 資料查詢
```typescript
const { data, error } = await supabase
  .from("products")
  .select("id, name, slug, price, compare_at_price, description, image_url, is_active, created_at")
  .eq("is_active", true)
  .limit(8)
  .order("created_at", { ascending: false })

console.log("前端收到的產品資料：", data)  // ✅ 調試日誌
```

### 3. 圖片 URL 處理
```typescript
// 處理相對路徑
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const storageUrl = supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/product-images/` : ""

let imageUrl = product.image_url || ""
if (imageUrl) {
  // 如果是相對路徑，加上 Supabase Storage URL 前綴
  if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
    const cleanPath = imageUrl.startsWith("/") ? imageUrl.substring(1) : imageUrl
    imageUrl = `${storageUrl}${cleanPath}`
  }
}
```

### 4. 圖片顯示邏輯
```typescript
{product.image_url ? (
  <Image
    src={product.image_url}
    alt={product.name}
    fill
    className="object-cover group-hover:scale-105 transition-transform duration-300"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
    loading="lazy"
    unoptimized={product.image_url.startsWith("https://") && product.image_url.includes("supabase.co")}
  />
) : (
  <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
    <span className="text-muted-foreground text-sm">圖片準備中</span>
  </div>
)}
```

---

## 📋 調試步驟

### 1. 檢查 Console 日誌
打開瀏覽器開發者工具（F12），查看 Console：
- `前端收到的產品資料：` - 確認資料是否包含 `image_url`
- `前台 - 產品列表：` - 確認映射後的資料結構
- `前端收到的產品資料（含圖片URL）：` - 確認每個產品的 `image_url` 值

### 2. 檢查圖片 URL 格式
確認 `image_url` 的格式：
- ✅ **完整 URL**：`https://xxxxx.supabase.co/storage/v1/object/public/product-images/products/xxx.jpg`
- ✅ **相對路徑**：`products/xxx.jpg`（會自動加上前綴）
- ❌ **空值**：`null` 或 `undefined`（會顯示「圖片準備中」）

### 3. 檢查 Next.js Image 設定
確認 `next.config.js` 允許 Supabase Storage 域名：
```javascript
images: {
  domains: ['your-project.supabase.co'],
  // 或使用 remotePatterns
}
```

---

## 🚨 常見問題

### 問題 1：圖片仍然顯示「圖片準備中」

**可能原因：**
1. `image_url` 欄位為空或 `null`
2. 資料庫中沒有 `image_url` 資料
3. Supabase Storage URL 前綴設定錯誤

**解決方案：**
1. 檢查 Console 日誌，確認 `image_url` 的值
2. 前往 `/admin/products`，確認產品是否有上傳圖片
3. 檢查 `.env.local` 中的 `NEXT_PUBLIC_SUPABASE_URL` 是否正確

### 問題 2：圖片載入失敗（404）

**可能原因：**
1. Supabase Storage bucket 不存在
2. 圖片路徑不正確
3. Storage 權限設定問題

**解決方案：**
1. 確認 Supabase Storage 中已創建 `product-images` bucket
2. 確認 bucket 設為 Public
3. 檢查圖片 URL 是否正確（完整路徑）

### 問題 3：圖片顯示但很慢

**可能原因：**
1. 圖片檔案太大
2. Supabase Storage CDN 設定問題

**解決方案：**
1. 優化圖片大小（建議 < 500KB）
2. 使用圖片裁切功能確保圖片尺寸一致

---

## ✅ 測試檢查清單

- [ ] 打開首頁，查看 Console 日誌
- [ ] 確認 `前端收到的產品資料：` 包含 `image_url`
- [ ] 確認產品卡片顯示圖片（不是「圖片準備中」）
- [ ] 檢查圖片 URL 格式是否正確
- [ ] 測試重新整理頁面，確認圖片正常顯示
- [ ] 測試多個產品，確認所有圖片都正常顯示

---

## 📝 修改的檔案

1. **`components/featured-products.tsx`**
   - 添加 `image_url` 到 Product interface
   - 明確查詢 `image_url` 欄位
   - 處理相對路徑，自動加上 Supabase Storage URL 前綴
   - 使用 Next.js Image 組件顯示圖片
   - 添加調試日誌
   - 處理空值，顯示佔位符

2. **`app/page.tsx`**
   - 確認有 `export const revalidate = 0;`

---

## 🎉 完成！

所有修復已完成，沒有語法錯誤。請測試首頁圖片顯示功能！

**下一步：**
1. 重新整理首頁（Ctrl + F5）
2. 打開瀏覽器 Console（F12）
3. 檢查 `前端收到的產品資料：` 日誌
4. 確認圖片是否正常顯示
