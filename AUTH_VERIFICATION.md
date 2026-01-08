# 🔐 管理員認證驗證指南

## 認證流程說明

你的網站現在有完整的兩層驗證機制：

### 第一層：Supabase Auth 驗證
- 驗證 Email 和密碼是否正確
- 在 `app/admin/login/page.tsx` 中處理

### 第二層：admin_users 表驗證
- 檢查用戶是否在 `admin_users` 表中
- 檢查 `is_active` 是否為 `true`
- 在登入頁面和 Layout 中都有檢查

---

## 登入頁面驗證邏輯

**文件位置**：`app/admin/login/page.tsx`

### 驗證步驟：

1. **Email/密碼驗證**
   ```typescript
   const { data, error } = await supabase.auth.signInWithPassword({
     email,
     password,
   })
   ```

2. **檢查 admin_users 表**
   ```typescript
   const { data: adminUser } = await supabase
     .from("admin_users")
     .select("id, email, full_name, is_active")
     .eq("id", data.user.id)
     .single()
   ```

3. **驗證管理員狀態**
   - 檢查 `adminUser` 是否存在
   - 檢查 `is_active` 是否為 `true`

4. **錯誤處理**
   - 如果不在表中 → 顯示「權限不足」
   - 如果 `is_active = false` → 顯示「帳號已停用」
   - 如果查詢錯誤 → 顯示「無法驗證管理員權限」

---

## Layout 保護驗證

**文件位置**：`app/admin/layout.tsx`

所有 `/admin/*` 路由都會經過這個 Layout 檢查：

```typescript
// 1. 檢查是否已登入
const { data: { user } } = await supabase.auth.getUser()

// 2. 檢查是否為管理員
const adminUser = await checkAdminServer(user.id)

// 3. 如果不是管理員，重定向到登入頁
if (!adminUser) {
  redirect("/admin/login")
}
```

---

## 測試驗證是否正常

### 測試 1：正常登入
1. 訪問：http://localhost:3000/admin/login
2. 輸入正確的 Email 和密碼（已在 admin_users 表中）
3. ✅ 應該成功登入並跳轉到 `/admin`

### 測試 2：錯誤密碼
1. 輸入正確 Email，但錯誤密碼
2. ✅ 應該顯示「Email 或密碼錯誤」

### 測試 3：不在 admin_users 表中
1. 使用一個在 Supabase Auth 中但不在 admin_users 表中的帳號
2. ✅ 應該顯示「權限不足」並自動登出

### 測試 4：帳號已停用
1. 在 admin_users 表中將 `is_active` 設為 `false`
2. 嘗試登入
3. ✅ 應該顯示「帳號已停用」

### 測試 5：直接訪問管理頁面
1. 未登入狀態下，直接訪問：http://localhost:3000/admin
2. ✅ 應該自動重定向到 `/admin/login`

---

## 檢查 admin_users 表

### 查詢所有管理員
```sql
SELECT id, email, full_name, role, is_active, created_at
FROM admin_users
ORDER BY created_at DESC;
```

### 查詢特定用戶
```sql
SELECT * FROM admin_users WHERE email = 'your-email@example.com';
```

### 檢查用戶是否為管理員
```sql
SELECT 
  au.id,
  au.email,
  au.is_active,
  au.role,
  CASE 
    WHEN au.id IS NOT NULL AND au.is_active = true THEN '是管理員'
    WHEN au.id IS NOT NULL AND au.is_active = false THEN '帳號已停用'
    ELSE '不是管理員'
  END AS status
FROM auth.users u
LEFT JOIN admin_users au ON u.id = au.id
WHERE u.email = 'your-email@example.com';
```

---

## 常見問題排查

### Q: 登入時顯示「無法驗證管理員權限」？
**A:** 檢查：
1. `admin_users` 表是否存在
2. Supabase RLS (Row Level Security) 政策是否正確
3. 環境變數是否正確設置
4. 瀏覽器 Console 是否有錯誤訊息

### Q: 登入成功但立即被登出？
**A:** 檢查：
1. 用戶是否在 `admin_users` 表中
2. `is_active` 是否為 `true`
3. User ID 是否正確匹配

### Q: 如何查看當前登入的用戶 ID？
**A:** 在登入頁面添加臨時代碼：
```typescript
console.log("User ID:", data.user.id)
```

### Q: 如何暫時跳過管理員檢查？
**A:** ⚠️ **不建議**，但如果是開發測試，可以暫時註解掉檢查：
```typescript
// if (!adminUser) {
//   redirect("/admin/login")
// }
```

---

## 安全建議

1. ✅ **永遠檢查兩層驗證**：Auth + admin_users 表
2. ✅ **使用 RLS 政策**：保護 admin_users 表的讀取權限
3. ✅ **定期審查管理員列表**：移除不需要的管理員
4. ✅ **使用強密碼**：至少 8 個字元
5. ✅ **記錄登入日誌**：可以在 `admin_users` 表中添加 `last_login` 欄位

---

## 輔助函數

已創建 `lib/auth/check-admin.ts` 提供：

- `checkAdminServer()` - 在 Server Component 中使用
- `checkAdminClient()` - 在 Client Component 中使用

可以在任何地方重複使用這些函數來檢查管理員權限。
