"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { formatPrice } from "@/lib/utils"
import { User, Mail, Phone, MapPin, Package, Calendar, CreditCard, Edit, Save } from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  order_number: string
  total_amount: number
  status: string
  payment_method: string
  remittance_last_five?: string
  bank_account_last5?: string
  created_at: string
  order_items: Array<{
    id: string
    quantity: number
    price: number
    products: {
      name: string
      image_url?: string
    }
  }>
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
  })

  useEffect(() => {
    // 確保在客戶端環境下執行
    if (typeof window === 'undefined') {
      return
    }
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      // 確保在客戶端環境下創建 Supabase 客戶端
      if (typeof window === 'undefined') {
        return
      }
      
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        router.push("/auth/login")
        return
      }

      setUser(user)
      await loadProfile(user.id)
      await loadOrders(user.id)
    } catch (error) {
      console.error("Auth check failed:", error)
      router.push("/auth/login")
    }
  }

  async function loadProfile(userId: string) {
    try {
      // 確保在客戶端環境下執行
      if (typeof window === 'undefined') {
        return
      }
      
      const supabase = createClient()
      // 明確指定要查詢的欄位，確保包含所有必要欄位
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, phone, address, member_level, membership_level, created_at")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("Error loading profile:", error)
        // 如果 profile 不存在（錯誤代碼 PGRST116 表示找不到記錄），自動建立一個
        if (error.code === 'PGRST116' || error.message?.includes('No rows') || error.message?.includes('not found')) {
          console.log("Profile not found, creating new profile...")
          try {
            const { data: newProfile, error: insertError } = await supabase
              .from("profiles")
              .insert([{
                id: userId,
                email: user?.email || null,
                full_name: user?.email?.split("@")[0] || null,
                member_level: "regular",
              }])
              .select()
              .single()

            if (!insertError && newProfile) {
              console.log("Profile created successfully:", newProfile)
              setProfile(newProfile)
              setFormData({
                full_name: newProfile.full_name || "",
                phone: newProfile.phone || "",
                address: newProfile.address || "",
              })
              toast({
                title: "歡迎加入！",
                description: "您的會員資料已建立",
              })
            } else {
              console.error("Failed to create profile:", insertError)
              // 即使建立失敗，也設置一個基本 profile 以避免頁面崩潰
              setProfile({
                id: userId,
                email: user?.email || null,
                full_name: null,
                member_level: "regular",
              })
            }
          } catch (insertErr) {
            console.error("Exception creating profile:", insertErr)
            // 設置一個基本 profile 以避免頁面崩潰
            setProfile({
              id: userId,
              email: user?.email || null,
              full_name: null,
              member_level: "regular",
            })
          }
        } else {
          // 其他錯誤，設置一個基本 profile
          setProfile({
            id: userId,
            email: user?.email || null,
            full_name: null,
            member_level: "regular",
          })
        }
        setLoading(false)
        return
      }

      if (data) {
        setProfile(data)
        setFormData({
          full_name: data.full_name || "",
          phone: data.phone || "",
          address: data.address || "",
        })
      }
    } catch (error) {
      console.error("Exception loading profile:", error)
      // 設置一個基本 profile 以避免頁面崩潰
      setProfile({
        id: userId,
        email: user?.email || null,
        full_name: null,
        member_level: "regular",
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadOrders(userId: string) {
    try {
      const supabase = createClient()
      
      // 先獲取訂單基本資料
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (ordersError) {
        console.error("Error loading orders:", ordersError)
        return
      }

      if (!ordersData || ordersData.length === 0) {
        setOrders([])
        return
      }

      // 手動關聯查詢訂單項目
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          let orderItems []= []
          try {
            const { data: items, error: itemsError } = await supabase
              .from("order_items")
              .select(`
                *,
                products (name, image_url)
              `)
              .eq("order_id", order.id)
            
            if (!itemsError && items) {
              orderItems = items
            }
          } catch (err) {
            console.error(`查詢訂單項目時發生錯誤:`, err)
          }

          return {
            ...order,
            order_items: orderItems,
          }
        })
      )

      setOrders(ordersWithItems as Order[])
    } catch (error) {
      console.error("Exception loading orders:", error)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
        })
        .eq("id", user.id)

      if (error) {
        throw error
      }

      toast({
        title: "更新成功",
        description: "個人資料已更新",
      })

      await loadProfile(user.id)
      setEditing(false)
    } catch (error: any) {
      toast({
        title: "更新失敗",
        description: error.message || "發生未知錯誤",
        variant: "destructive",
      })
    }
  }

  const handleUpdateRemittance = async (orderId: string, remittanceLastFive: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("orders")
        .update({ remittance_last_five: remittanceLastFive })
        .eq("id", orderId)

      if (error) {
        throw error
      }

      toast({
        title: "更新成功",
        description: "匯款後五碼已更新",
      })

      if (user) {
        await loadOrders(user.id)
      }
    } catch (error: any) {
      toast({
        title: "更新失敗",
        description: error.message || "發生未知錯誤",
        variant: "destructive",
      })
    }
  }

  const getMembershipBadge = (size: "sm" | "md" | "lg" = "md") => {
    const level = profile?.member_level || profile?.membership_level || "normal"
    const sizeClasses = {
      sm: "text-xs px-2 py-1",
      md: "text-sm px-3 py-1",
      lg: "text-base px-4 py-2",
    }
    
    switch (level) {
      case "vvip":
        return (
          <span className={`${sizeClasses[size]} bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full font-semibold shadow-md`}>
            VVIP
          </span>
        )
      case "vip":
        return (
          <span className={`${sizeClasses[size]} bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full font-semibold shadow-md`}>
            VIP
          </span>
        )
      case "regular":
        return (
          <span className={`${sizeClasses[size]} bg-gray-200 text-gray-700 rounded-full font-medium`}>
            一般會員
          </span>
        )
      case "normal":
      default:
        return (
          <span className={`${sizeClasses[size]} bg-gray-200 text-gray-700 rounded-full font-medium`}>
            一般會員
          </span>
        )
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: "待處理", className: "bg-gray-100 text-gray-800" },
      waiting_payment: { label: "等待匯款確認", className: "bg-yellow-100 text-yellow-800" },
      paid: { label: "已付款", className: "bg-blue-100 text-blue-800" },
      processing: { label: "處理中", className: "bg-purple-100 text-purple-800" },
      shipped: { label: "已出貨", className: "bg-indigo-100 text-indigo-800" },
      delivered: { label: "已送達", className: "bg-green-100 text-green-800" },
      cancelled: { label: "已取消", className: "bg-red-100 text-red-800" },
    }

    const statusInfo = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" }
    return (
      <span className={`text-xs px-2 py-1 rounded ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    )
  }

  const getPaymentMethodLabel = (method: string) => {
    const methodMap: Record<string, string> = {
      bank_transfer: "銀行轉帳",
      credit_card: "信用卡",
      cash_on_delivery: "貨到付款",
    }
    return methodMap[method] || method
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <div className="text-center">
            <p className="text-muted-foreground">載入中...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <div className="text-center">
            <p className="text-muted-foreground">請先登入</p>
            <Button onClick={() => router.push("/auth/login")} className="mt-4">
              前往登入
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // 如果 profile 不存在，顯示基本資訊（不應該發生，因為會自動建立）
  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <div className="max-w-6xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <p className="text-muted-foreground">正在載入會員資料...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 使用者頭像與歡迎詞 */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center shadow-lg">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    {getMembershipBadge("sm")}
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">
                    歡迎回來，{profile.full_name || profile.email?.split("@")[0] || "會員"}！
                  </h1>
                  <p className="text-muted-foreground">
                    {profile.email || user.email}
                  </p>
                </div>
                <div className="text-right">
                  {getMembershipBadge("lg")}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左側：個人資料 */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      個人資料
                    </CardTitle>
                    {!editing ? (
                      <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={handleSaveProfile}>
                        <Save className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input value={profile.email || user.email || ""} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      姓名
                    </Label>
                    {editing ? (
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="請輸入姓名"
                      />
                    ) : (
                      <Input value={formData.full_name || "未設定"} disabled />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      電話
                    </Label>
                    {editing ? (
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="請輸入電話"
                      />
                    ) : (
                      <Input value={formData.phone || "未設定"} disabled />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      地址
                    </Label>
                    {editing ? (
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="請輸入地址"
                      />
                    ) : (
                      <Input value={formData.address || "未設定"} disabled />
                    )}
                  </div>

                  {editing && (
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleSaveProfile} className="flex-1">
                        儲存
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditing(false)
                          setFormData({
                            full_name: profile.full_name || "",
                            phone: profile.phone || "",
                            address: profile.address || "",
                          })
                        }}
                        className="flex-1"
                      >
                        取消
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 右側：訂單查詢 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    訂單歷史
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">目前尚無訂單</h3>
                      <p className="text-muted-foreground mb-6">開始選購您喜歡的商品吧！</p>
                      <Link href="/products">
                        <Button size="lg">前往選購</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <Card key={order.id} className="border hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold text-lg">訂單編號：{order.order_number}</span>
                                  {getStatusBadge(order.status)}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(order.created_at).toLocaleString("zh-TW")}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <CreditCard className="h-4 w-4" />
                                    {getPaymentMethodLabel(order.payment_method)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">{formatPrice(order.total_amount)}</div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* 訂單項目 */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                訂單項目
                              </h4>
                              <div className="space-y-2">
                                {order.order_items && order.order_items.length > 0 ? (
                                  order.order_items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                                      <span className="text-muted-foreground">
                                        {item.products?.name || "商品"} × {item.quantity}
                                      </span>
                                      <span className="font-medium">
                                        {formatPrice(item.price * item.quantity)}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-muted-foreground">無訂單項目</p>
                                )}
                              </div>
                            </div>

                            {/* 匯款後五碼（僅銀行轉帳） */}
                            {order.payment_method === "bank_transfer" && (
                              <div className="pt-4 border-t">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  匯款資訊
                                </h4>
                                {order.status === "waiting_payment" && (
                                  <RemittanceInput
                                    orderId={order.id}
                                    currentValue={order.remittance_last_five || order.bank_account_last5 || ""}
                                    onUpdate={handleUpdateRemittance}
                                  />
                                )}
                                {(order.remittance_last_five || order.bank_account_last5) ? (
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">匯款後五碼：</span>
                                    <span className="font-mono font-semibold text-primary">
                                      {order.remittance_last_five || order.bank_account_last5}
                                    </span>
                                  </div>
                                ) : (
                                  order.status !== "waiting_payment" && (
                                    <div className="text-sm text-muted-foreground">
                                      尚未填寫匯款後五碼
                                    </div>
                                  )
                                )}
                              </div>
                            )}

                            {/* 訂單詳情連結 */}
                            <div className="pt-4 border-t">
                              <Link href={`/orders/${order.id}`}>
                                <Button variant="outline" className="w-full">
                                  查看訂單詳情
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// 匯款後五碼輸入組件
function RemittanceInput({
  orderId,
  currentValue,
  onUpdate,
}: {
  orderId: string
  currentValue: string
  onUpdate: (orderId: string, value: string) => void
}) {
  const [value, setValue] = useState(currentValue)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!value.trim() || value.length !== 5) {
      return
    }

    setSaving(true)
    await onUpdate(orderId, value)
    setSaving(false)
  }

  return (
    <div className="space-y-2">
      <Label>匯款後五碼</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, 5))}
          placeholder="請輸入匯款帳號後五碼"
          maxLength={5}
          className="flex-1"
        />
        <Button onClick={handleSave} disabled={saving || value.length !== 5}>
          {saving ? "儲存中..." : "儲存"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        請於匯款後填寫帳號後五碼，以便我們核對款項
      </p>
    </div>
  )
}

