"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ShoppingCart, Package, Calendar, CreditCard, User } from "lucide-react"
import { formatPrice } from "@/lib/utils"

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
  updated_at: string
  coupons?: {
    code: string
  }
  profiles?: {
    email: string
    full_name?: string
  }
  order_items: OrderItem[]
}

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // 先獲取訂單基本資料
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })

      if (ordersError) {
        throw ordersError
      }

      if (!ordersData || ordersData.length === 0) {
        setOrders([])
        return
      }

      // 手動關聯查詢優惠券、會員資料和訂單項目
      const ordersWithRelations = await Promise.all(
        ordersData.map(async (order) => {
          // 查詢優惠券（如果存在 coupon_id）- 使用獨立請求避免關係錯誤
          let couponData = null
          if (order.coupon_id) {
            try {
              const { data: coupon, error: couponError } = await supabase
                .from("coupons")
                .select("code")
                .eq("id", order.coupon_id)
                .single()
              
              if (!couponError && coupon) {
                couponData = coupon
              } else {
                console.warn(`無法載入優惠券 ${order.coupon_id}:`, couponError?.message)
              }
            } catch (err) {
              console.error(`查詢優惠券時發生錯誤:`, err)
            }
          }

          // 查詢會員資料（如果存在 user_id）
          let profileData = null
          if (order.user_id) {
            try {
              const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("email, full_name, created_at")
                .eq("id", order.user_id)
                .single()
              
              if (!profileError && profile) {
                profileData = profile
              }
            } catch (err) {
              console.error(`查詢會員資料時發生錯誤:`, err)
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
              .eq("order_id", order.id)
            
            if (!itemsError && items) {
              orderItems = items
            }
          } catch (err) {
            console.error(`查詢訂單項目時發生錯誤:`, err)
          }

          return {
            ...order,
            coupons: couponData,
            profiles: profileData,
            order_items: orderItems,
          }
        })
      )

      setOrders(ordersWithRelations as Order[])
    } catch (error: any) {
      console.error("Error fetching orders:", error)
      toast({
        title: "載入失敗",
        description: error.message || "發生未知錯誤",
        variant: "destructive",
      })
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId)

      if (error) {
        toast({
          title: "更新失敗",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "更新成功",
          description: "訂單狀態已更新",
        })
        await fetchOrders()
      }
    } catch (error: any) {
      toast({
        title: "更新失敗",
        description: error.message || "發生未知錯誤",
        variant: "destructive",
      })
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
      <div className="text-center py-12">
        <p className="text-muted-foreground">載入中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">訂單管理</h1>
          <p className="text-muted-foreground mt-2">管理所有訂單與付款狀態</p>
        </div>
        <div className="text-sm text-muted-foreground">
          總共 {orders.length} 筆訂單
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">目前無訂單</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>訂單編號：{order.order_number}</CardTitle>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        訂單時間：{new Date(order.created_at).toLocaleString("zh-TW")}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        支付方式：{getPaymentMethodLabel(order.payment_method)}
                        {order.payment_method === "bank_transfer" && (order.remittance_last_five || order.bank_account_last5) && (
                          <span className="ml-2 text-xs">（匯款後五碼：{order.remittance_last_five || order.bank_account_last5}）</span>
                        )}
                      </div>
                      {order.profiles && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          會員：{order.profiles.full_name || order.profiles.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleUpdateStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">待處理</SelectItem>
                        <SelectItem value="waiting_payment">等待匯款確認</SelectItem>
                        <SelectItem value="paid">已付款</SelectItem>
                        <SelectItem value="processing">處理中</SelectItem>
                        <SelectItem value="shipped">已出貨</SelectItem>
                        <SelectItem value="delivered">已送達</SelectItem>
                        <SelectItem value="cancelled">已取消</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 訂單項目 */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    訂單項目
                  </h4>
                  <div className="space-y-2">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {item.products.image_url && (
                            <img
                              src={item.products.image_url}
                              alt={item.products.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <span>
                            {item.products.name} × {item.quantity}
                          </span>
                        </div>
                        <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 訂單資訊 */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <h4 className="font-medium mb-2">聯絡資訊</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {order.customer_name && <p>姓名：{order.customer_name}</p>}
                      {order.customer_email && <p>Email：{order.customer_email}</p>}
                      {order.customer_phone && <p>電話：{order.customer_phone}</p>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">配送資訊</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {order.shipping_name && <p>收件人：{order.shipping_name}</p>}
                      {order.shipping_phone && <p>電話：{order.shipping_phone}</p>}
                      {order.shipping_address && <p>地址：{order.shipping_address}</p>}
                    </div>
                  </div>
                </div>

                {/* 金額明細 */}
                <div className="pt-4 border-t">
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

                {order.notes && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">備註</h4>
                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
