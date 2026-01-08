"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      
      // 步驟 1: 驗證 Email 和密碼
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        toast({
          title: "登入失敗",
          description: authError.message === "Invalid login credentials" 
            ? "Email 或密碼錯誤" 
            : authError.message,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (!authData.user) {
        toast({
          title: "登入失敗",
          description: "無法獲取用戶資訊",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // 步驟 2: 檢查是否在 admin_users 表中
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("id, email, full_name, is_active")
        .eq("id", authData.user.id)
        .single()

      // 如果查詢出錯（例如表不存在或沒有權限）
      if (adminError) {
        console.error("Admin check error:", adminError)
        toast({
          title: "驗證失敗",
          description: "無法驗證管理員權限，請檢查資料庫設定",
          variant: "destructive",
        })
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // 步驟 3: 檢查管理員是否存在且啟用
      if (!adminUser) {
        toast({
          title: "權限不足",
          description: "您的帳號不在管理員列表中，請聯繫系統管理員",
          variant: "destructive",
        })
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      if (!adminUser.is_active) {
        toast({
          title: "帳號已停用",
          description: "您的管理員帳號已被停用，請聯繫系統管理員",
          variant: "destructive",
        })
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // 步驟 4: 登入成功，跳轉到管理後台
      console.log("✅ Login success, redirecting to /admin/products...")
      console.log("User ID:", authData.user.id)
      console.log("Admin User:", adminUser)
      
      toast({
        title: "登入成功",
        description: `歡迎回來，${adminUser.full_name || email}`,
      })
      
      // 使用 window.location.href 進行強制跳轉，確保頁面完全重新載入
      // 這樣可以避免 router.push 可能導致的跳轉失敗
      setTimeout(() => {
        window.location.href = "/admin/products"
      }, 500) // 延遲 500ms 讓 toast 訊息顯示
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        title: "發生錯誤",
        description: error.message || "登入過程中發生未知錯誤",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">管理後台登入</CardTitle>
          <CardDescription>請輸入您的帳號密碼</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">電子郵件</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "登入中..." : "登入"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
