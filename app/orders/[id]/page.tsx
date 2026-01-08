"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { CheckCircle2, Package, Calendar } from "lucide-react"
import Link from "next/link"

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  price: number
  products: {
    name: string
    image_url?: string
  }
}

interface Order {
  id: string
  order_number: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  total_amount: number
  subtotal_amount: number
  discount_amount: number
  status: string
  payment_method: string
  remittance_last_five?: string
  bank_account_last5?: string // 兼容舊欄位名稱
  shipping_address?: string
  shipping_name?: string
  shipping_phone?: string
  notes?: string
  created_at: string
  coupons?: {
    code: string
  }
  order_items: OrderItem[]
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  async function fetchOrder() {
    try {
      const supabase = createClient()
      
      // 先獲取訂單基本資料
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", params.id)
        .single()

      if (orderError) {
        console.error("Error fetching order:", orderError)
        return
      }

      if (!orderData) {
        return
      }

      // 手動關聯查詢優惠券（獨立請求避免關係錯誤）
      let couponData = null
      if (orderData.coupon_id) {
        try {
          const { data: coupon, error: couponError } = await supabase
            .from("coupons")
            .select("code")
            .eq("id", orderData.coupon_id)
            .single()
          
          if (!couponError && coupon) {
            couponData = coupon
          }
        } catch (err) {
          console.error(`查詢優惠券時發生錯誤:`, err)
        }
      }

      // 查詢訂單項目
      let orderItems = []
      try {
        const { data: items, error: itemsError } = await supabase
          .from("order_items")
          .select(`
            *,
            products (name, image_url)
          `)
          .eq("order_id", orderData.id)
        
        if (!itemsError && items) {
          orderItems = items
        }
      } catch (err) {
        console.error(`查詢訂單項目時發生錯誤:`, err)
      }

      setOrder({
        ...orderData,
        coupons: couponData,
        order_items: orderItems,
      } as Order)
    } catch (error) {
      console.error("Exception in fetchOrder:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "待處理",
      waiting_payment: "等待匯款確認",
      paid: "已付款",
      processing: "處理中",
      shipped: "已出貨",
      delivered: "已送達",
      cancelled: "已取消",
    }
    return statusMap[status] || status
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

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">訂單不存在</h1>
            <Link href="/products">
              <Button>前往選購</Button>
            </Link>
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
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 訂單確認標題 */}
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-600" />
            <h1 className="text-3xl font-bold">訂單已建立</h1>
            <p className="text-muted-foreground">
              訂單編號：<span className="font-mono font-semibold">{order.order_number}</span>
            </p>
          </div>

          {/* 訂單詳情 */}
          <Card>
            <CardHeader>
              <CardTitle>訂單詳情</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 訂單項目 */}
              <div>
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  訂單項目
                </h3>
                <div className="space-y-3">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      {item.products.image_url && (
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={item.products.image_url}
                            alt={item.products.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.products.name}</p>
                        <p className="text-sm text-muted-foreground">
                          數量：{item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 訂單資訊 */}
              <div className="grid grid-cols-2 gap-6 pt-6 border-t">
                <div>
                  <h3 className="font-medium mb-2">聯絡資訊</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {order.customer_name && <p>姓名：{order.customer_name}</p>}
                    {order.customer_email && <p>Email：{order.customer_email}</p>}
                    {order.customer_phone && <p>電話：{order.customer_phone}</p>}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">配送資訊</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {order.shipping_name && <p>收件人：{order.shipping_name}</p>}
                    {order.shipping_phone && <p>電話：{order.shipping_phone}</p>}
                    {order.shipping_address && <p>地址：{order.shipping_address}</p>}
                  </div>
                </div>
              </div>

              {/* 支付資訊 */}
              <div className="pt-6 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5" />
                  <h3 className="font-medium">支付資訊</h3>
                </div>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">支付方式：</span>
                    <span>{getPaymentMethodLabel(order.payment_method)}</span>
                  </div>
                  {order.payment_method === "bank_transfer" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">銀行代碼：</span>
                        <span>1234</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">帳號：</span>
                        <span>5678901234</span>
                      </div>
                      {(order.remittance_last_five || order.bank_account_last5) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">匯款後五碼：</span>
                          <span>{order.remittance_last_five || order.bank_account_last5}</span>
                        </div>
                      )}
                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>重要提醒：</strong>請於匯款後，我們會核對您的匯款資訊。
                          訂單狀態將更新為「已付款」，我們會盡快為您處理訂單。
                        </p>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">訂單狀態：</span>
                    <span className="font-semibold">{getStatusLabel(order.status)}</span>
                  </div>
                </div>
              </div>

              {/* 金額明細 */}
              <div className="pt-6 border-t">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">小計：</span>
                      <span>{formatPrice(order.subtotal_amount)}</span>
                    </div>
                    {order.discount_amount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>
                          折扣
                          {order.coupons && `（${order.coupons.code}）`}：
                        </span>
                        <span>-{formatPrice(order.discount_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>總計：</span>
                      <span>{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 操作按鈕 */}
          <div className="flex justify-center gap-4">
            <Link href="/products">
              <Button variant="outline">繼續購物</Button>
            </Link>
            <Link href="/">
              <Button>返回首頁</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
