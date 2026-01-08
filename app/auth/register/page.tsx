"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Email 驗證（支援包含數字的 Gmail 格式，如 920727@gmail.com）
    // 使用標準的 email 驗證，允許數字開頭的地址
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const trimmedEmail = formData.email.trim()
    
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      toast({
        title: "註冊失敗",
        description: "請輸入有效的 Email 地址（例如：920727@gmail.com）",
        variant: "destructive",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "註冊失敗",
        description: "密碼與確認密碼不一致",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "註冊失敗",
        description: "密碼長度至少需要 6 個字元",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // 確保在客戶端環境下執行
      if (typeof window === 'undefined') {
        throw new Error('註冊只能在客戶端環境下執行')
      }

      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
          },
        },
      })

      if (error) {
        toast({
          title: "註冊失敗",
          description: error.message,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (data.user) {
        // 自動建立 profiles 資料（如果不存在）
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .single()

        if (!existingProfile) {
          // 如果不存在，則插入新資料
          const { error: profileError } = await supabase
            .from("profiles")
            .insert([
              {
                id: data.user.id,
                email: formData.email,
                full_name: formData.full_name || null,
                member_level: "regular", // 預設等級為 regular
              },
            ])

          if (profileError) {
            console.error("建立會員資料失敗:", profileError)
            // 即使建立 profile 失敗，也繼續註冊流程
          }
        } else {
          // 如果已存在，則更新
          await supabase
            .from("profiles")
            .update({ full_name: formData.full_name || null })
            .eq("id", data.user.id)
        }

        toast({
          title: "註冊成功",
          description: "歡迎加入張馨家居！",
        })
        router.push("/auth/login")
      }
    } catch (error: any) {
      toast({
        title: "註冊失敗",
        description: error.message || "發生未知錯誤",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">會員註冊</CardTitle>
              <CardDescription>註冊成為會員，享受 VIP 優惠</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">姓名</Label>
                  <Input
                    id="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="請輸入您的姓名"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密碼</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="至少 6 個字元"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">確認密碼</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="再次輸入密碼"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "註冊中..." : "註冊"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  已有帳號？{" "}
                  <Link href="/auth/login" className="text-primary hover:underline">
                    立即登入
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
