# UploadThing 圖片上傳設定指南

## 1. 註冊 UploadThing 帳號

1. 前往 [UploadThing](https://uploadthing.com/)
2. 註冊一個免費帳號
3. 創建一個新應用程式

## 2. 獲取 API Keys

1. 在 UploadThing Dashboard 中，找到您的應用程式
2. 複製以下資訊：
   - `UPLOADTHING_SECRET`
   - `UPLOADTHING_APP_ID`

## 3. 設定環境變數

在 `.env.local` 檔案中添加：

```env
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
```

## 4. 測試圖片上傳

1. 啟動開發伺服器：`npm run dev`
2. 前往後台產品管理頁面：`http://localhost:3000/admin/products`
3. 點擊「新增產品」
4. 在「產品圖片」區塊中，點擊上傳按鈕
5. 選擇圖片並上傳

## 注意事項

- 單張圖片最大 4MB
- 每個產品最多可上傳 10 張圖片
- 第一張上傳的圖片會自動設為主圖
- 圖片會自動儲存到 `product_images` 資料表
