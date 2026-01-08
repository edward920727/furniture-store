# VIP/VVIP 折扣設定功能說明

## 📋 功能概述

此功能允許管理員在後台調整 VIP 和 VVIP 會員的折扣百分比，無需修改程式碼。

## 🗄️ 資料庫設定

### 步驟 1：執行 SQL 遷移文件

在 Supabase SQL Editor 中執行 `add-system-settings.sql` 文件：

1. 登入 Supabase Dashboard
2. 點擊左側選單的 **SQL Editor**
3. 打開專案中的 `add-system-settings.sql` 文件
4. 複製全部內容並貼到 SQL Editor
5. 點擊 **Run** 執行

此 SQL 文件會：
- 創建 `system_settings` 表
- 插入初始設定值（VIP: 10%, VVIP: 20%）
- 設定 Row Level Security (RLS) 政策

## 🎯 使用方式

### 後台設定頁面

1. 登入後台管理系統
2. 點擊左側選單的 **設定**
3. 在「會員折扣設定」區塊中：
   - **VIP 折扣百分比**：輸入 VIP 會員的折扣百分比（例如：10 表示 10% 折扣，即 9 折）
   - **VVIP 折扣百分比**：輸入 VVIP 會員的折扣百分比（例如：20 表示 20% 折扣，即 8 折）
4. 點擊 **儲存設定** 按鈕

### 設定說明

- **折扣百分比範圍**：0-100 之間的數字
- **VIP 折扣範例**：
  - 輸入 `10` = 10% 折扣 = 9 折優惠
  - 輸入 `15` = 15% 折扣 = 85 折優惠
- **VVIP 折扣範例**：
  - 輸入 `20` = 20% 折扣 = 8 折優惠
  - 輸入 `25` = 25% 折扣 = 75 折優惠

## 🔄 前台自動更新

當管理員在後台更新折扣設定後：
- 結帳頁面會自動從資料庫讀取最新的折扣百分比
- 會員在結帳時會看到正確的折扣金額
- 折扣顯示文字會自動更新（例如：8折、9折等）

## 📝 技術細節

### 資料庫結構

```sql
system_settings 表：
- setting_key: 設定鍵（'vip_discount_percentage', 'vvip_discount_percentage'）
- setting_value: 設定值（文字格式，例如：'10', '20'）
- description: 設定說明
```

### 程式碼變更

1. **後台設定頁面** (`app/admin/settings/page.tsx`)
   - 新增 `SettingsManagement` 組件
   - 提供 UI 介面調整折扣百分比

2. **設定管理組件** (`components/admin/settings-management.tsx`)
   - 載入並顯示當前折扣設定
   - 提供表單輸入和儲存功能

3. **結帳頁面** (`app/checkout/page.tsx`)
   - 從資料庫讀取折扣設定
   - 動態計算 VIP/VVIP 折扣金額
   - 動態顯示折扣文字

## ⚠️ 注意事項

1. **權限控制**：只有管理員可以修改系統設定
2. **資料驗證**：系統會驗證輸入值必須在 0-100 之間
3. **預設值**：如果資料庫中沒有設定值，系統會使用預設值（VIP: 10%, VVIP: 20%）
4. **即時生效**：設定更新後，新訂單會立即使用新的折扣百分比

## 🐛 故障排除

### 問題：無法載入設定

**解決方案**：
1. 確認已執行 `add-system-settings.sql`
2. 檢查 Supabase RLS 政策是否正確設定
3. 確認管理員帳號有正確的權限

### 問題：折扣計算不正確

**解決方案**：
1. 檢查資料庫中的 `setting_value` 是否為有效的數字
2. 確認結帳頁面有正確載入設定（檢查瀏覽器控制台）
3. 清除瀏覽器快取並重新載入頁面

## 📚 相關文件

- `add-system-settings.sql` - 資料庫遷移文件
- `app/admin/settings/page.tsx` - 後台設定頁面
- `components/admin/settings-management.tsx` - 設定管理組件
- `app/checkout/page.tsx` - 結帳頁面（使用折扣設定）
