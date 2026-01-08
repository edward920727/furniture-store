# 🔐 創建你自己的管理員帳號

## 快速步驟（3 分鐘）

### 步驟 1：在 Supabase 創建用戶

1. 打開 **Supabase Dashboard** → **Authentication** → **Users**
2. 點擊右上角 **Add user** → **Create new user**
3. 輸入你的資訊：
   ```
   Email: 你的email@example.com
   Password: 你的密碼（至少 6 個字元）
   ```
4. 點擊 **Create user**
5. **重要**：複製創建的 **User ID**（UUID 格式）

### 步驟 2：設置管理員權限

1. 打開 **Supabase Dashboard** → **SQL Editor**
2. 執行以下 SQL（替換成你的資訊）：

```sql
INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES (
  'YOUR_USER_ID',           -- ⚠️ 替換為步驟 1 複製的 User ID
  'your-email@example.com', -- ⚠️ 替換為你的 Email
  '你的名字',                -- ⚠️ 替換為你的名字（可選）
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  is_active = true;
```

### 步驟 3：登入測試

1. 訪問：**http://localhost:3000/admin/login**
2. 輸入你的 Email 和密碼
3. 點擊登入

---

## 📝 完整範例

假設你的資訊是：
- Email: `john@example.com`
- Password: `MySecurePassword123`
- Name: `John`

**步驟 1**：在 Supabase Dashboard 創建用戶後，假設 User ID 是 `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

**步驟 2**：執行這個 SQL：

```sql
INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'john@example.com',
  'John',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  is_active = true;
```

**步驟 3**：用 `john@example.com` 和 `MySecurePassword123` 登入

---

## ✅ 驗證設置

執行這個 SQL 查詢確認：

```sql
SELECT id, email, full_name, role, is_active 
FROM admin_users 
WHERE email = 'your-email@example.com';
```

如果看到你的記錄且 `is_active = true`，就成功了！

---

## 💡 提示

- **密碼強度**：建議使用至少 8 個字元，包含大小寫字母和數字
- **多個管理員**：可以創建多個管理員帳號，每個都執行一次 SQL
- **修改資訊**：如果之後想修改名字，直接更新 SQL 中的 `full_name` 即可

---

## 🐛 常見問題

### Q: 可以用任何 Email 嗎？
**A:** 可以！只要是有效的 Email 格式即可。

### Q: 忘記 User ID 怎麼辦？
**A:** 在 Supabase Dashboard → Authentication → Users，點擊你的用戶即可看到 User ID。

### Q: 可以創建多個管理員嗎？
**A:** 可以！每個管理員都需要：
1. 在 Authentication 中創建用戶
2. 在 `admin_users` 表中插入記錄

### Q: 如何刪除管理員？
**A:** 執行這個 SQL：
```sql
UPDATE admin_users SET is_active = false WHERE email = 'your-email@example.com';
```
或者完全刪除：
```sql
DELETE FROM admin_users WHERE email = 'your-email@example.com';
```

---

## 🔒 安全建議

1. **使用強密碼**：至少 8 個字元，包含大小寫、數字和特殊符號
2. **不要分享密碼**：每個管理員應該有自己的帳號
3. **定期檢查**：在 `admin_users` 表中確認只有授權的管理員
