# 圖片裁切功能升級總結

## ✅ 已完成的功能

### 1. 安裝 react-easy-crop 套件
- ✅ 已安裝 `react-easy-crop` 套件
- ✅ 導入 `Cropper` 組件和 `Area` 類型

### 2. 實作拖放功能
- ✅ 使用 HTML5 `onDragOver` 和 `onDrop` 事件
- ✅ 支援直接拖曳圖片檔案到上傳區塊
- ✅ 拖曳時顯示視覺回饋（邊框變色）

### 3. 加入裁切視窗
- ✅ 選擇或拖入圖片後，先彈出裁切視窗（Modal 內的 Modal）
- ✅ 設定裁切比例為 **1:1（正方形）**，適合產品圖片展示
- ✅ 可以用滑鼠縮放和移動圖片
- ✅ 顯示網格輔助線，方便對齊

### 4. 裁切後上傳
- ✅ 點擊「確認裁切」後，將裁切後的圖片轉換為 Blob/File 格式
- ✅ 自動將裁切後的檔案上傳到 Supabase Storage 的 `product-images` Bucket
- ✅ 上傳成功後，自動更新 `image_url` 並顯示縮圖

### 5. UI 優化
- ✅ 上傳區塊加上明顯的虛線框（`border-2 border-dashed`）
- ✅ 文字改為「拖曳圖片至此或點擊上傳」
- ✅ 添加提示文字：「上傳前可裁切圖片」

---

## 🎯 功能特點

### 裁切視窗功能
- **裁切比例**：1:1（正方形），適合產品主圖
- **縮放範圍**：1x - 3x，使用滑桿調整
- **移動和縮放**：滑鼠拖曳移動，滾輪或滑桿縮放
- **網格輔助線**：顯示網格，方便對齊

### 上傳流程
1. 選擇或拖入圖片 → 顯示裁切視窗
2. 調整裁切區域和縮放 → 點擊「確認裁切」
3. 自動轉換為 JPEG 格式 → 上傳到 Supabase Storage
4. 顯示縮圖預覽 → 完成

---

## 📋 技術實現

### 狀態管理
```typescript
const [showCropModal, setShowCropModal] = useState(false)
const [imageToCrop, setImageToCrop] = useState<string | null>(null)
const [crop, setCrop] = useState({ x: 0, y: 0 })
const [zoom, setZoom] = useState(1)
const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
const [cropAspectRatio, setCropAspectRatio] = useState(1) // 1:1 正方形
```

### 核心函數
- `handleFileSelect()` - 處理檔案選擇，顯示裁切視窗
- `onCropComplete()` - 裁切完成回調，保存裁切區域
- `getCroppedImg()` - 將裁切後的圖片轉換為 Blob
- `handleConfirmCrop()` - 確認裁切並上傳

---

## 🎨 UI 改進

### 上傳區塊樣式
- **虛線邊框**：`border-2 border-dashed`
- **拖曳狀態**：拖曳時邊框變為主題色，背景變淺
- **提示文字**：明確說明「拖曳圖片至此或點擊上傳」

### 裁切視窗
- **全螢幕 Modal**：最大寬度 `max-w-2xl`
- **裁切區域**：400px 高度，黑色背景
- **控制項**：縮放滑桿、取消/確認按鈕

---

## 📝 使用說明

### 基本流程
1. 點擊「新增產品」或「編輯產品」
2. 在「產品圖片」區塊：
   - **方式一**：拖曳圖片到虛線框內
   - **方式二**：點擊虛線框選擇檔案
3. 圖片會自動顯示在裁切視窗中
4. 調整裁切區域：
   - 拖曳圖片移動位置
   - 使用滑桿調整縮放（1x - 3x）
5. 點擊「確認裁切」
6. 系統自動上傳裁切後的圖片
7. 圖片縮圖顯示在預覽區

### 裁切比例說明
- **當前設定**：1:1（正方形）
- **適用場景**：產品主圖、縮圖展示
- **如需修改**：更改 `cropAspectRatio` 狀態值
  - `1` = 1:1（正方形）
  - `4/3` = 4:3（橫向）
  - `3/4` = 3:4（直向）

---

## 🔧 修改的檔案

1. **`components/admin/product-management.tsx`**
   - 添加裁切相關狀態
   - 實作裁切邏輯
   - 添加裁切 Modal
   - 優化上傳區塊 UI

2. **`package.json`**
   - 添加 `react-easy-crop` 依賴

---

## ✅ 測試檢查清單

- [ ] 拖曳圖片到上傳區塊，裁切視窗正常顯示
- [ ] 點擊上傳區塊選擇檔案，裁切視窗正常顯示
- [ ] 可以拖曳圖片移動裁切區域
- [ ] 可以調整縮放滑桿
- [ ] 點擊「確認裁切」後，圖片成功上傳
- [ ] 上傳成功後，縮圖顯示在預覽區
- [ ] 點擊「取消」可以關閉裁切視窗
- [ ] 上傳區塊的虛線框和提示文字正確顯示

---

## 🚨 注意事項

### Supabase Storage 設置
請確保已設置 Supabase Storage：
1. 創建 `product-images` bucket
2. 設置公開讀取權限
3. 設置管理員上傳權限

詳見：`SUPABASE_STORAGE_SETUP.md`

### 圖片格式
- 裁切後的圖片會自動轉換為 **JPEG 格式**（品質 95%）
- 原始格式可以是 JPG、PNG、WebP 等

### 檔案大小限制
- 上傳前限制：5MB
- 裁切後可能會稍微減小檔案大小

---

## 🎉 完成！

所有功能已成功實現，沒有語法錯誤。專案可以正常編譯和運行！
