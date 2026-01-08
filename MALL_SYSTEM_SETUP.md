# 商城系統功能實作說明

本文檔說明已實作的三個核心商城系統功能及其使用方法。

## 📋 功能清單

### 1. ✅ 優惠碼折扣系統 (Coupons)

#### 後台管理
- **路徑**：`/admin/coupons`
- **功能**：
  - 新增/編輯/刪除優惠券
  - 設定優惠碼、折扣類型（固定金額/百分比）、折扣值
  - 設定最低消費金額、最大折扣金額（百分比折扣時）
  - 設定使用次數限制、到期日
  - 查看優惠券使用統計

#### 前台使用
- **位置**：結帳頁面 (`/checkout`)
- **功能**：
  - 輸入優惠碼並即時驗證
  - 自動計算折扣金額
  - 顯示折扣明細

### 2. ✅ 會員系統與 VIP 設定 (Users & Roles)

#### 前台會員功能
- **註冊頁面**：`/auth/register`
- **登入頁面**：`/auth/login`
- **功能**：
  - 會員註冊（使用 Supabase Auth）
  - 會員登入/登出
  - 自動建立會員資料（profiles 表）

#### 後台管理
- **路徑**：`/admin/users`
- **功能**：
  - 查看所有註冊會員
  - 手動切換會員等級（一般會員、VIP、VVIP）
  - 查看會員註冊時間、聯絡資訊

#### VIP 折扣
- **自動套用**：VIP 會員在結帳時自動享受 9 折優惠
- **顯示位置**：結帳頁面訂單摘要區塊

### 3. ✅ 轉帳匯款結帳流程 (Bank Transfer)

#### 結帳選項
- **位置**：結帳頁面 (`/checkout`)
- **支付方式**：銀行轉帳

#### 匯款資訊
- **顯示內容**：
  - 銀行代碼：1234
  - 帳號：5678901234
  - 匯款後五碼輸入欄位（必填）

#### 訂單狀態流程
1. **提交訂單**：狀態自動設為「等待匯款確認」
2. **後台管理**：管理員可在 `/admin/orders` 查看訂單
3. **手動更新**：管理員核對匯款後，手動更新訂單狀態為「已付款」

## 🗄️ 資料庫結構

### 新增表格

#### 1. `coupons` 表
```sql
- id (UUID)
- code (VARCHAR) - 優惠碼
- discount_type (VARCHAR) - 折扣類型：fixed/percentage
- discount_value (DECIMAL) - 折扣值
- min_purchase_amount (DECIMAL) - 最低消費金額
- max_discount_amount (DECIMAL) - 最大折扣金額
- usage_limit (INTEGER) - 使用次數限制
- used_count (INTEGER) - 已使用次數
- expires_at (TIMESTAMP) - 到期日
- is_active (BOOLEAN) - 是否啟用
```

#### 2. `profiles` 表
```sql
- id (UUID) - 關聯 auth.users
- email (VARCHAR)
- full_name (VARCHAR)
- phone (VARCHAR)
- address (TEXT)
- membership_level (VARCHAR) - normal/vip/vvip
```

#### 3. `orders` 表擴展欄位
```sql
- user_id (UUID) - 關聯會員
- payment_method (VARCHAR) - 支付方式
- bank_account_last5 (VARCHAR) - 匯款後五碼
- coupon_id (UUID) - 使用的優惠碼
- discount_amount (DECIMAL) - 折扣金額
- subtotal_amount (DECIMAL) - 小計
- shipping_address (TEXT) - 配送地址
- shipping_name (VARCHAR) - 收件人姓名
- shipping_phone (VARCHAR) - 收件人電話
```

## 🚀 安裝與設定

### 1. 安裝依賴

需要安裝 `@radix-ui/react-radio-group`：

```bash
npm install @radix-ui/react-radio-group
```

### 2. 執行資料庫擴展 SQL

在 Supabase SQL Editor 中執行 `supabase-schema-extensions.sql`：

1. 登入 Supabase Dashboard
2. 進入 SQL Editor
3. 執行 `supabase-schema-extensions.sql` 中的所有 SQL 語句

### 3. 設定銀行資訊

在結帳頁面 (`app/checkout/page.tsx`) 中，請更新以下資訊為您的實際銀行帳號：

```typescript
// 第 280 行附近
銀行代碼：1234 | 帳號：5678901234
```

以及訂單確認頁面 (`app/orders/[id]/page.tsx`) 中的相同資訊。

### 4. 測試功能

#### 測試優惠碼系統
1. 登入後台：`/admin/coupons`
2. 新增一個測試優惠碼（例如：`TEST10`，10% 折扣）
3. 前往前台結帳頁面
4. 輸入優惠碼並驗證折扣是否正確計算

#### 測試會員系統
1. 前往 `/auth/register` 註冊新會員
2. 登入後台：`/admin/users`
3. 將會員等級改為 VIP
4. 前往結帳頁面，確認 VIP 折扣自動套用

#### 測試銀行轉帳流程
1. 添加商品到購物車
2. 前往結帳頁面
3. 選擇「銀行轉帳」支付方式
4. 填寫匯款後五碼
5. 提交訂單
6. 在後台 `/admin/orders` 查看訂單狀態為「等待匯款確認」
7. 手動更新訂單狀態為「已付款」

## 📁 新增檔案清單

### 後台管理
- `components/admin/coupon-management.tsx` - 優惠券管理組件
- `components/admin/user-management.tsx` - 會員管理組件
- `components/admin/order-management.tsx` - 訂單管理組件
- `app/admin/coupons/page.tsx` - 優惠券管理頁面
- `app/admin/users/page.tsx` - 會員管理頁面
- `app/admin/orders/page.tsx` - 訂單管理頁面

### 前台功能
- `app/auth/login/page.tsx` - 會員登入頁面
- `app/auth/register/page.tsx` - 會員註冊頁面
- `app/cart/page.tsx` - 購物車頁面
- `app/checkout/page.tsx` - 結帳頁面
- `app/orders/[id]/page.tsx` - 訂單確認頁面

### UI 組件
- `components/ui/radio-group.tsx` - RadioGroup 組件

### 資料庫
- `supabase-schema-extensions.sql` - 資料庫擴展 SQL

## 🔧 更新檔案

- `components/admin/admin-sidebar.tsx` - 新增導航選單項目
- `components/header.tsx` - 新增會員登入/登出功能

## ⚠️ 注意事項

1. **銀行帳號資訊**：請務必更新結帳頁面中的銀行代碼和帳號為實際資訊
2. **RLS 政策**：資料庫已設定 Row Level Security (RLS)，確保資料安全
3. **會員註冊觸發器**：當用戶註冊時，會自動在 `profiles` 表中建立對應記錄
4. **優惠碼驗證**：前台會驗證優惠碼的有效性、過期時間、使用次數限制和最低消費金額
5. **VIP 折扣**：目前僅實作 VIP 等級的 9 折優惠，VVIP 等級可依需求擴展

## 🎯 後續擴展建議

1. **VVIP 折扣**：可為 VVIP 會員設定更優惠的折扣（例如 8.5 折）
2. **會員積分系統**：可新增積分累積和兌換功能
3. **訂單追蹤**：可新增物流追蹤功能
4. **優惠碼批次生成**：可新增批次生成優惠碼功能
5. **郵件通知**：可新增訂單確認、出貨通知等郵件功能
