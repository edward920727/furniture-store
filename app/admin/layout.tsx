import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { checkAdminServer } from "@/lib/auth/check-admin"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 注意：這個 layout 會應用到所有 /admin/* 路徑，包括 /admin/login
  // 但我們需要讓登入頁面可以訪問，所以需要檢查當前路徑
  
  // 獲取當前路徑（需要在 Server Component 中通過 headers 獲取）
  // 由於 Next.js App Router 的限制，我們使用不同的策略：
  // 只在非登入頁面進行認證檢查
  
  // 暫時關閉認證檢查，讓各個頁面自己處理
  // 這樣可以避免在登入頁面時也進行認證檢查導致循環
  // 各個 admin 頁面（如 app/admin/page.tsx）會自己檢查認證
  
  return <>{children}</>
}
