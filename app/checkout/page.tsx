"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/components/ui/use-toast"
import { formatPrice } from "@/lib/utils"
import { CheckCircle2, XCircle } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Coupon {
  id: string
  code: string
  discount_type: "fixed" | "percentage"
  discount_value: number
  min_purchase_amount: number
  max_discount_amount?: number
  is_free_shipping?: boolean
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer")
  const [remittanceLastFive, setRemittanceLastFive] = useState("")
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [discountSettings, setDiscountSettings] = useState({
    vip_discount_percentage: 10, // 預設值
    vvip_discount_percentage: 20, // 預設值
  })
  
  // 運費設定（可從環境變數或設定檔讀取）
  const SHIPPING_FEE = 150 // 預設運費 150 元

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_name: "",
    shipping_phone: "",
    shipping_address: "",
    notes: "",
  })

  useEffect(() => {
    checkUser()
    loadDiscountSettings()
  }, [])

  // 載入折扣設定
  async function loadDiscountSettings() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("system_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["vip_discount_percentage", "vvip_discount_percentage"])

      if (error) {
        console.error("載入折扣設定失敗:", error)
        return
      }

      if (data) {
        const settings = {
          vip_discount_percentage: 10,
          vvip_discount_percentage: 20,
        }

        data.forEach((item) => {
          if (item.setting_key === "vip_discount_percentage") {
            settings.vip_discount_percentage = parseFloat(item.setting_value) || 10
          } else if (item.setting_key === "vvip_discount_percentage") {
            settings.vvip_discount_percentage = parseFloat(item.setting_value) || 20
          }
        })

        setDiscountSettings(settings)
      }
    } catch (error) {
      console.error("載入折扣設定失敗:", error)
    }
  }

  async function checkUser() {
    setProfileLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // 載入用戶資料，包含 membership_level
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profile) {
          setUserProfile(profile)
          setFormData({
            customer_name: profile.full_name || "",
            customer_email: profile.email || user.email || "",
            customer_phone: profile.phone || "",
            shipping_name: profile.full_name || "",
            shipping_phone: profile.phone || "",
            shipping_address: profile.address || "",
            notes: "",
          })
        }
      }
    } catch (error) {
      console.error("載入用戶資料失敗:", error)
    } finally {
      setProfileLoading(false)
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "請輸入優惠碼",
        variant: "destructive",
      })
      return
    }

    setCouponLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .single()

      if (error || !data) {
        toast({
          title: "優惠碼無效",
          description: "請檢查優惠碼是否正確或已過期",
          variant: "destructive",
        })
        setAppliedCoupon(null)
        return
      }

      // 檢查是否過期
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast({
          title: "優惠碼已過期",
          variant: "destructive",
        })
        setAppliedCoupon(null)
        return
      }

      // 檢查使用次數限制
      if (data.usage_limit && data.used_count >= data.usage_limit) {
        toast({
          title: "優惠碼已用完",
          variant: "destructive",
        })
        setAppliedCoupon(null)
        return
      }

      // 檢查最低消費金額（消費使用門檻）
      const subtotalBeforeShipping = totalPrice
      if (data.min_purchase_amount > 0 && subtotalBeforeShipping < data.min_purchase_amount) {
        toast({
          title: "未達最低消費金額",
          description: `此優惠碼需消費滿 ${formatPrice(data.min_purchase_amount)}`,
          variant: "destructive",
        })
        setAppliedCoupon(null)
        return
      }

      setAppliedCoupon(data)
      toast({
        title: "優惠碼已套用",
        description: "折扣已計算",
      })
    } catch (error: any) {
      toast({
        title: "優惠碼驗證失敗",
        description: error.message || "發生未知錯誤",
        variant: "destructive",
      })
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  // 計算函數定義
  const calculateDiscount = (baseSubtotal: number) => {
    if (!appliedCoupon) return 0

    let discount = 0
    if (appliedCoupon.discount_type === "fixed") {
      discount = Number(appliedCoupon.discount_value) || 0
    } else {
      discount = (baseSubtotal * Number(appliedCoupon.discount_value || 0)) / 100
      if (appliedCoupon.max_discount_amount) {
        discount = Math.min(discount, Number(appliedCoupon.max_discount_amount))
      }
    }

    // 確保折扣金額為整數
    return Math.round(discount)
  }

  const calculateVIPDiscount = (baseSubtotal: number) => {
    if (!userProfile) return 0
    const memberLevel = userProfile.membership_level || userProfile.member_level // 優先使用 membership_level
    let discount = 0
    if (memberLevel === "VIP") {
      // VIP 折扣（從資料庫讀取百分比）
      const discountPercentage = discountSettings.vip_discount_percentage / 100
      discount = baseSubtotal * discountPercentage
    } else if (memberLevel === "VVIP") {
      // VVIP 折扣（從資料庫讀取百分比）
      const discountPercentage = discountSettings.vvip_discount_percentage / 100
      discount = baseSubtotal * discountPercentage
    }
    // 一般會員或其他情況為原價（無折扣）
    // 確保折扣金額為整數
    return Math.round(discount)
  }

  // 取得會員等級顯示名稱
  const getMembershipLevelDisplay = () => {
    if (!userProfile) return null
    const memberLevel = userProfile.membership_level || userProfile.member_level
    if (memberLevel === "VVIP") return "VVIP"
    if (memberLevel === "VIP") return "VIP"
    return "一般會員"
  }

  // 取得會員折扣倍數
  const getMembershipDiscountMultiplier = () => {
    if (!userProfile) return 1.0
    const memberLevel = userProfile.membership_level || userProfile.member_level
    if (memberLevel === "VVIP") {
      return 1 - discountSettings.vvip_discount_percentage / 100
    }
    if (memberLevel === "VIP") {
      return 1 - discountSettings.vip_discount_percentage / 100
    }
    return 1.0
  }

  // 取得會員折扣百分比（用於顯示）
  const getMembershipDiscountPercentage = () => {
    if (!userProfile) return null
    const memberLevel = userProfile.membership_level || userProfile.member_level
    if (memberLevel === "VVIP") {
      return discountSettings.vvip_discount_percentage
    }
    if (memberLevel === "VIP") {
      return discountSettings.vip_discount_percentage
    }
    return null
  }

  // 取得會員折扣顯示文字（例如：8折、9折）
  const getMembershipDiscountDisplay = () => {
    if (!userProfile) return null
    const memberLevel = userProfile.membership_level || userProfile.member_level
    if (memberLevel === "VVIP") {
      const multiplier = 1 - discountSettings.vvip_discount_percentage / 100
      return `${Math.round(multiplier * 10)}折`
    }
    if (memberLevel === "VIP") {
      const multiplier = 1 - discountSettings.vip_discount_percentage / 100
      return `${Math.round(multiplier * 10)}折`
    }
    return null
  }

  const calculateShippingFee = () => {
    // 如果優惠碼有免運費標記，則運費為 0
    if (appliedCoupon?.is_free_shipping) {
      return 0
    }
    return SHIPPING_FEE
  }

  // 使用 useMemo 確保計算順序正確，避免 subtotal before initialization 錯誤
  // 只有在 profile 載入完成後才計算金額
  const { subtotal, shippingFee, couponDiscount, vipDiscount, finalTotal } = useMemo(() => {
    // 如果還在載入 profile，返回預設值
    if (profileLoading) {
      return {
        subtotal: 0,
        shippingFee: 0,
        couponDiscount: 0,
        vipDiscount: 0,
        finalTotal: 0,
      }
    }

    // 先計算基礎金額（確保 totalPrice 是有效數字並整數化）
    const safeTotalPrice = Number(totalPrice) || 0
    const calculatedSubtotal = Math.round(safeTotalPrice)
    
    // 計算折扣（使用已定義的 subtotal）
    const rawCouponDiscount = calculateDiscount(calculatedSubtotal)
    const rawVipDiscount = calculateVIPDiscount(calculatedSubtotal)
    const rawShippingFee = calculateShippingFee()
    
    // 所有金額整數化（移除小數點）
    const calculatedShippingFee = Math.round(rawShippingFee)
    const calculatedCouponDiscount = Math.round(rawCouponDiscount)
    const calculatedVipDiscount = Math.round(rawVipDiscount)
    const calculatedFinalTotal = Math.round(Math.max(0, calculatedSubtotal + calculatedShippingFee - calculatedCouponDiscount - calculatedVipDiscount))
    
    return {
      subtotal: calculatedSubtotal,
      shippingFee: calculatedShippingFee,
      couponDiscount: calculatedCouponDiscount,
      vipDiscount: calculatedVipDiscount,
      finalTotal: calculatedFinalTotal,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPrice, appliedCoupon, userProfile, profileLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      toast({
        title: "購物車是空的",
        description: "請先添加商品到購物車",
        variant: "destructive",
      })
      return
    }

    if (paymentMethod === "bank_transfer" && !remittanceLastFive.trim()) {
      toast({
        title: "請輸入匯款後五碼",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      
      // 生成訂單編號（格式：ORD20240108-XXXX）
      const now = new Date()
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
      const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase()
      const orderNumber = `ORD${dateStr}-${randomStr}`

      // 創建訂單
      // 確保 coupon_id 是 null 而不是 undefined
      const couponId = appliedCoupon?.id ? appliedCoupon.id : null
      
      // 確保 customer_email 有值（優先使用表單，其次使用 user email）
      const customerEmail = formData.customer_email || user?.email || null
      
      // 準備訂單資料，確保所有欄位都有值（即使是 null）
      const orderData: Record<string, any> = {
        order_number: orderNumber,
        customer_name: formData.customer_name || null,
        customer_email: customerEmail,
        customer_phone: formData.customer_phone || null,
        user_id: user?.id || null,
        payment_method: paymentMethod,
        remittance_last_five: paymentMethod === "bank_transfer" ? remittanceLastFive : null,
        shipping_name: formData.shipping_name || null,
        shipping_phone: formData.shipping_phone || null,
        shipping_address: formData.shipping_address || null,
        subtotal_amount: subtotal,  // 已整數化
        shipping_fee: shippingFee,  // 已整數化
        discount_amount: couponDiscount + vipDiscount,  // 已整數化
        total_amount: finalTotal,  // 已整數化
        status: paymentMethod === "bank_transfer" ? "waiting_payment" : "pending",
        notes: formData.notes || null,
        coupon_id: couponId,
      }
      
      // 移除 undefined 值，確保只傳遞 null 或有效值
      Object.keys(orderData).forEach((key) => {
        if (orderData[key] === undefined) {
          orderData[key] = null
        }
      })
      
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single()

      if (orderError) {
        throw orderError
      }

      // 創建訂單項目（價格整數化）
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: Math.round(item.price),  // 價格整數化
      }))

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems)

      if (itemsError) {
        throw itemsError
      }

      // 如果使用了優惠碼，更新使用次數
      if (appliedCoupon) {
        await supabase
          .from("coupons")
          .update({ used_count: ((appliedCoupon as any).used_count || 0) + 1 })
          .eq("id", appliedCoupon.id)
      }

      // 設置訂單編號並顯示成功對話框
      setOrderNumber(orderNumber)
      setShowSuccessDialog(true)

      // 清空購物車
      clearCart()

      // 3秒後自動跳轉到會員中心
      setTimeout(() => {
        router.push("/profile")
      }, 3000)
    } catch (error: any) {
      console.error("訂單建立失敗:", error)
      toast({
        title: "訂單建立失敗",
        description: error.message || "發生未知錯誤",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">購物車是空的</h1>
            <p className="text-muted-foreground mb-6">請先添加商品到購物車</p>
            <Button onClick={() => router.push("/products")}>前往選購</Button>
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">結帳</h1>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 左側：表單 */}
              <div className="lg:col-span-2 space-y-6">
                {/* 聯絡資訊 */}
                <Card>
                  <CardHeader>
                    <CardTitle>聯絡資訊</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customer_name">姓名 *</Label>
                        <Input
                          id="customer_name"
                          value={formData.customer_name}
                          onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer_email">Email *</Label>
                        <Input
                          id="customer_email"
                          type="email"
                          value={formData.customer_email}
                          onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer_phone">電話 *</Label>
                      <Input
                        id="customer_phone"
                        value={formData.customer_phone}
                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 配送資訊 */}
                <Card>
                  <CardHeader>
                    <CardTitle>配送資訊</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shipping_name">收件人姓名 *</Label>
                        <Input
                          id="shipping_name"
                          value={formData.shipping_name}
                          onChange={(e) => setFormData({ ...formData, shipping_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shipping_phone">收件人電話 *</Label>
                        <Input
                          id="shipping_phone"
                          value={formData.shipping_phone}
                          onChange={(e) => setFormData({ ...formData, shipping_phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shipping_address">配送地址 *</Label>
                      <Input
                        id="shipping_address"
                        value={formData.shipping_address}
                        onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 支付方式 */}
                <Card>
                  <CardHeader>
                    <CardTitle>支付方式</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                        <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                          <div>
                            <div className="font-medium">銀行轉帳</div>
                            <div className="text-sm text-muted-foreground">
                              銀行代碼：1234 | 帳號：5678901234
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>

                    {paymentMethod === "bank_transfer" && (
                      <div className="mt-4 space-y-2">
                        <Label htmlFor="remittance_last_five">匯款後五碼 *</Label>
                        <Input
                          id="remittance_last_five"
                          value={remittanceLastFive}
                          onChange={(e) => setRemittanceLastFive(e.target.value.replace(/\D/g, "").slice(0, 5))}
                          placeholder="請輸入匯款帳號後五碼"
                          maxLength={5}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          請於匯款後填寫帳號後五碼，以便我們核對款項
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 備註 */}
                <Card>
                  <CardHeader>
                    <CardTitle>備註</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="如有特殊需求，請在此填寫"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* 右側：訂單摘要 */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle>訂單摘要</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 購物車項目 */}
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      {/* 優惠碼輸入 */}
                      <div className="space-y-2">
                        <Label>優惠碼</Label>
                        <div className="flex gap-2">
                          <Input
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="輸入優惠碼"
                            disabled={!!appliedCoupon || couponLoading}
                          />
                          {!appliedCoupon ? (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleApplyCoupon}
                              disabled={couponLoading}
                            >
                              {couponLoading ? "驗證中..." : "套用"}
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setAppliedCoupon(null)
                                setCouponCode("")
                              }}
                            >
                              移除
                            </Button>
                          )}
                        </div>
                        {appliedCoupon && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>優惠碼 {appliedCoupon.code} 已套用</span>
                          </div>
                        )}
                      </div>

                      {/* 會員等級顯示 */}
                      {!profileLoading && userProfile && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>會員等級：</span>
                          <span className="font-medium text-foreground">{getMembershipLevelDisplay()}</span>
                        </div>
                      )}
                      
                      {/* VIP/VVIP 折扣顯示 */}
                      {!profileLoading && userProfile && vipDiscount > 0 && (
                        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>
                            {(() => {
                              const memberLevel = userProfile.membership_level || userProfile.member_level
                              const discountDisplay = getMembershipDiscountDisplay()
                              if (memberLevel === "VVIP") {
                                return `已套用 VVIP ${discountDisplay}優惠，折扣 ${formatPrice(vipDiscount)}`
                              } else if (memberLevel === "VIP") {
                                return `已套用 VIP ${discountDisplay}優惠，折扣 ${formatPrice(vipDiscount)}`
                              }
                              return ""
                            })()}
                          </span>
                        </div>
                      )}
                      
                      {/* 免運費顯示 */}
                      {appliedCoupon?.is_free_shipping && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>免運費優惠</span>
                        </div>
                      )}

                      {/* 金額明細 */}
                      {profileLoading ? (
                        <div className="pt-4 space-y-2 text-sm text-center text-muted-foreground">
                          載入中...
                        </div>
                      ) : (
                        <div className="pt-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">小計</span>
                            <span>{formatPrice(subtotal)}</span>
                          </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">運費</span>
                          <span className={shippingFee === 0 ? "text-green-600 line-through" : ""}>
                            {shippingFee === 0 ? "免費" : formatPrice(shippingFee)}
                          </span>
                        </div>
                        {couponDiscount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>優惠碼折扣</span>
                            <span>-{formatPrice(couponDiscount)}</span>
                          </div>
                        )}
                        {!profileLoading && vipDiscount > 0 && (
                          <div className="flex justify-between text-green-600 font-medium">
                            <span>
                              {(() => {
                                const memberLevel = userProfile?.membership_level || userProfile?.member_level
                                const discountDisplay = getMembershipDiscountDisplay()
                                if (memberLevel === "VVIP") return `VVIP ${discountDisplay}優惠`
                                if (memberLevel === "VIP") return `VIP ${discountDisplay}優惠`
                                return "會員優惠"
                              })()}
                            </span>
                            <span>-{formatPrice(vipDiscount)}</span>
                          </div>
                        )}
                        <div className="pt-4 border-t flex justify-between font-bold text-lg">
                          <span>總計</span>
                          <span>{formatPrice(finalTotal)}</span>
                        </div>
                      </div>
                      )}

                      <Button type="submit" className="w-full" size="lg" disabled={loading}>
                        {loading ? "處理中..." : "確認訂單"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
      
      {/* 訂單成功對話框 */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">訂單成立！</DialogTitle>
            <DialogDescription className="text-center mt-2">
              感謝您的購買，訂單已成功建立
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">訂單編號</p>
              <p className="text-lg font-semibold text-primary">{orderNumber}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                正在跳轉至會員中心...
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowSuccessDialog(false)}
              >
                稍後查看
              </Button>
              <Button
                className="flex-1"
                onClick={() => router.push("/profile")}
              >
                立即前往
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
