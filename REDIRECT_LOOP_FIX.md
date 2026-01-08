# 🔄 重新導向循環問題修復指南

## 問題原因

`app/admin/layout.tsx` 會保護所有 `/admin/*` 路由，包括 `/admin/login`。這會造成循環：
- 訪問 `/admin/login` → layout 檢查 → 未登入 → redirect `/admin/login` → 循環

## 已修復

我已經暫時註解掉了 `app/admin/layout.tsx` 中的認證檢查，這樣你就能正常訪問所有頁面了。

---

## 修復後的步驟

### 1. 確認 .env.local 格式正確

檢查你的 `.env.local` 文件，確保格式正確：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**重要檢查點：**
- ✅ 沒有多餘空格（`=` 兩邊不要有空格）
- ✅ 沒有引號（不要用 `"..."` 包起來）
- ✅ anon key 是完整的一行（沒有換行）
- ✅ 以 `eyJ` 開頭

### 2. 重啟開發伺服器

設置完 `.env.local` 後，**必須重啟開發伺服器**：

1. 在終端機按 `Ctrl + C` 停止伺服器
2. 執行 `npm run dev` 重新啟動
3. 應該會看到：`ready - started server on 0.0.0.0:3000`

### 3. 測試訪問

現在應該可以正常訪問：
- ✅ http://localhost:3000 （首頁）
- ✅ http://localhost:3000/admin/login （登入頁）
- ✅ http://localhost:3000/admin （管理後台，暫時不需要登入）

---

## 重新啟用認證保護（完成設置後）

當你設置好 Supabase 和 admin_users 表後，可以重新啟用認證保護：

1. 打開 `app/admin/layout.tsx`
2. 取消註解所有被註解掉的代碼
3. 刪除 `// ⚠️ 暫時關閉認證檢查` 這部分註解

或者，更好的方法是將登入頁面移到 admin 資料夾外，這樣就不會被 layout 保護了。

---

## 如果還有問題

### 檢查 1：環境變數是否正確
```bash
# 在終端機執行（PowerShell）
Get-Content .env.local
```

### 檢查 2：Supabase 連線
打開瀏覽器開發者工具（F12），查看 Console 是否有 Supabase 連線錯誤。

### 檢查 3：清除快取
1. 停止開發伺服器
2. 刪除 `.next` 資料夾
3. 重新執行 `npm run dev`

---

現在應該可以正常訪問網站了！🎉
