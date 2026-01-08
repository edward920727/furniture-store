# 張馨家居 - 高端家具電商平台

這是一個使用 Next.js、Supabase 和 Tailwind CSS 構建的現代化家具電商平台，包含完整的前台展示與管理後台系統。

## 技術棧

- **前端框架**: Next.js 14 (App Router)
- **樣式**: Tailwind CSS
- **動畫**: Framer Motion
- **UI 組件**: shadcn/ui
- **後端**: Supabase (Database & Auth)
- **圖片上傳**: UploadThing (預留)
- **圖表**: Recharts
- **富文本編輯**: React Quill

## 功能特色

### 前台功能
- ✅ 現代化首頁設計（動態 Banner、分類展示、精選產品）
- ✅ 產品列表頁（分類篩選、即時搜尋、分頁）
- ✅ 產品詳情頁（多圖展示、規格資訊）
- ✅ LINE 與電話諮詢漂浮按鈕
- ✅ 響應式設計，完美適配各種裝置

### 管理後台
- ✅ 管理員登入系統
- ✅ Dashboard 儀表板（統計數據、圖表視覺化）
- ✅ 產品管理（完整的 CRUD 功能）
- ✅ 富文本編輯器支援
- ✅ 產品狀態管理（啟用/停用、精選標記）

## 開始使用

### 1. 安裝依賴

```bash
npm install
```

### 2. 設置環境變數

複製 `.env.example` 並創建 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_LINE_ID=your_line_id
NEXT_PUBLIC_PHONE_NUMBER=+886-2-1234-5678
```

### 3. 設置 Supabase 資料庫

1. 在 Supabase 創建新專案
2. 執行 `supabase-schema.sql` 中的 SQL 語句來創建資料表
3. 在 Supabase Auth 中創建管理員帳號
4. 在 `admin_users` 表中插入對應的管理員記錄

### 4. 啟動開發伺服器

```bash
npm run dev
```

訪問 [http://localhost:3000](http://localhost:3000) 查看前台網站。

訪問 [http://localhost:3000/admin/login](http://localhost:3000/admin/login) 登入管理後台。

## 專案結構

```
├── app/                    # Next.js App Router 頁面
│   ├── admin/             # 管理後台頁面
│   ├── products/          # 產品相關頁面
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首頁
├── components/            # React 組件
│   ├── admin/            # 管理後台組件
│   ├── ui/               # shadcn/ui 基礎組件
│   └── ...               # 前台組件
├── lib/                   # 工具函數與配置
│   └── supabase/        # Supabase 客戶端
└── supabase-schema.sql    # 資料庫 Schema
```

## 設計理念

本專案採用「北歐極簡主義」設計風格，強調：
- 大留白空間
- 高級字體排版
- 優雅的動畫過渡
- 清晰的視覺層次
- 現代化的用戶體驗

## 效能優化

- ✅ 圖片 Lazy Loading
- ✅ WebP 格式支援
- ✅ 動態組件載入
- ✅ 服務端渲染 (SSR)
- ✅ 響應式圖片優化

## 待開發功能

- [ ] UploadThing 圖片上傳整合
- [ ] 產品多圖上傳功能
- [ ] 訂單管理系統
- [ ] 客戶管理
- [ ] SEO 優化
- [ ] 多語言支援

## 授權

版權所有 © 2024 張馨家居
