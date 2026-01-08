/**
 * 檢查用戶是否為管理員的輔助函數
 * 可以在 Server Components 和 Client Components 中使用
 */

import { createClient } from "@/lib/supabase/server"
import { createClient as createBrowserClient } from "@/lib/supabase/client"

export interface AdminUser {
  id: string
  email: string
  full_name: string | null
  role: string
  is_active: boolean
}

/**
 * 在 Server Component 中檢查管理員權限
 */
export async function checkAdminServer(userId: string): Promise<AdminUser | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, email, full_name, role, is_active")
      .eq("id", userId)
      .eq("is_active", true)
      .single()

    if (error || !data) {
      return null
    }

    return data as AdminUser
  } catch (error) {
    console.error("Error checking admin:", error)
    return null
  }
}

/**
 * 在 Client Component 中檢查管理員權限
 */
export async function checkAdminClient(userId: string): Promise<AdminUser | null> {
  try {
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, email, full_name, role, is_active")
      .eq("id", userId)
      .eq("is_active", true)
      .single()

    if (error || !data) {
      return null
    }

    return data as AdminUser
  } catch (error) {
    console.error("Error checking admin:", error)
    return null
  }
}
