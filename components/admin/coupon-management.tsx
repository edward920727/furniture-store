"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Edit, Trash2, Copy } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface Coupon {
  id: string
  code: string
  discount_type: "fixed" | "percentage"
  discount_value: number
  min_purchase_amount: number
  max_discount_amount?: number
  usage_limit?: number
  used_count: number
  expires_at?: string
  is_active: boolean
  is_free_shipping?: boolean
  description?: string
  created_at?: string
}

export function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage" as "fixed" | "percentage",
    discount_value: "",
    min_purchase_amount: "",
    max_discount_amount: "",
    usage_limit: "",
    expires_at: "",
    is_active: true,
    is_free_shipping: false,
    description: "",
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  async function fetchCoupons() {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching coupons:", error)
        toast({
          title: "載入失敗",
          description: error.message,
          variant: "destructive",
        })
        setCoupons([])
      } else {
        setCoupons(data || [])
      }
    } catch (error: any) {
      console.error("Exception in fetchCoupons:", error)
      toast({
        title: "載入失敗",
        description: error.message || "發生未知錯誤",
        variant: "destructive",
      })
      setCoupons([])
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEditingCoupon(null)
    setFormData({
      code: "",
      discount_type: "percentage" as "fixed" | "percentage",
      discount_value: "",
      min_purchase_amount: "",
      max_discount_amount: "",
      usage_limit: "",
      expires_at: "",
      is_active: true,
      is_free_shipping: false,
      description: "",
    })
  }

  const handleOpenDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon)
      setFormData({
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value.toString(),
        min_purchase_amount: coupon.min_purchase_amount.toString(),
        max_discount_amount: coupon.max_discount_amount?.toString() || "",
        usage_limit: coupon.usage_limit?.toString() || "",
        expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0, 16) : "",
        is_active: coupon.is_active,
        is_free_shipping: coupon.is_free_shipping || false,
        description: coupon.description || "",
      })
    } else {
      setEditingCoupon(null)
      setFormData({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        min_purchase_amount: "",
        max_discount_amount: "",
        usage_limit: "",
        expires_at: "",
        is_active: true,
        is_free_shipping: false,
        description: "",
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 確保在客戶端環境下執行
    if (typeof window === 'undefined') {
      return
    }
    
    setSubmitting(true)
    
    try {
      const supabase = createClient()

      // 準備優惠券資料，確保所有欄位都有值（即使是 null）
      const couponData: Record<string, any> = {
        code: formData.code.trim().toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value) || 0,
        min_purchase_amount: parseFloat(formData.min_purchase_amount) || 0,
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        is_active: formData.is_active,
        is_free_shipping: formData.is_free_shipping || false,
        description: formData.description?.trim() || null,
      }
      
      // 移除 undefined 值，確保只傳遞 null 或有效值
      Object.keys(couponData).forEach((key) => {
        if (couponData[key] === undefined) {
          couponData[key] = null
        }
      })

      if (editingCoupon) {
        const { error } = await supabase
          .from("coupons")
          .update(couponData)
          .eq("id", editingCoupon.id)

        if (error) {
          console.error("Update coupon error:", error)
          toast({
            title: "更新失敗",
            description: error.message || "無法更新優惠券",
            variant: "destructive",
          })
        } else {
          toast({
            title: "更新成功",
            description: "優惠券已更新",
          })
          setDialogOpen(false)
          resetForm()
          await fetchCoupons()
        }
      } else {
        const { error } = await supabase
          .from("coupons")
          .insert([couponData])

        if (error) {
          console.error("Create coupon error:", error)
          toast({
            title: "創建失敗",
            description: error.message || "無法創建優惠券",
            variant: "destructive",
          })
        } else {
          toast({
            title: "創建成功",
            description: "優惠券已創建",
          })
          setDialogOpen(false)
          resetForm()
          await fetchCoupons()
        }
      }
    } catch (error: any) {
      console.error("Exception in handleSubmit:", error)
      toast({
        title: "操作失敗",
        description: error.message || "發生未知錯誤",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此優惠券嗎？此操作無法復原。")) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("coupons")
        .delete()
        .eq("id", id)

      if (error) {
        toast({
          title: "刪除失敗",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "刪除成功",
          description: "優惠券已刪除",
        })
        await fetchCoupons()
      }
    } catch (error: any) {
      toast({
        title: "刪除失敗",
        description: error.message || "發生未知錯誤",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "已複製",
      description: "優惠碼已複製到剪貼板",
    })
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
          <h1 className="text-3xl font-bold">優惠券管理</h1>
          <p className="text-muted-foreground mt-2">管理您的優惠券與折扣活動</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              新增優惠券
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? "編輯優惠券" : "新增優惠券"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">優惠碼 *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="例如：SAVE10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_type">折扣類型 *</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value: "fixed" | "percentage") =>
                      setFormData({ ...formData, discount_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">百分比折扣</SelectItem>
                      <SelectItem value="fixed">固定金額</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount_value">
                    折扣值 * {formData.discount_type === "percentage" ? "（%）" : "（元）"}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    step="0.01"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    placeholder={formData.discount_type === "percentage" ? "例如：10" : "例如：100"}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_purchase_amount">最低消費金額</Label>
                  <Input
                    id="min_purchase_amount"
                    type="number"
                    step="0.01"
                    value={formData.min_purchase_amount}
                    onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              {formData.discount_type === "percentage" && (
                <div className="space-y-2">
                  <Label htmlFor="max_discount_amount">最大折扣金額（元）</Label>
                  <Input
                    id="max_discount_amount"
                    type="number"
                    step="0.01"
                    value={formData.max_discount_amount}
                    onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                    placeholder="不限"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usage_limit">使用次數限制</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    placeholder="不限"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires_at">到期日</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="優惠券說明"
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_active">啟用</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_free_shipping"
                    checked={formData.is_free_shipping}
                    onChange={(e) => setFormData({ ...formData, is_free_shipping: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_free_shipping">免運費</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setDialogOpen(false)
                    resetForm()
                  }}
                  disabled={submitting}
                >
                  取消
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "儲存中..." : "儲存"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {coupons.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">目前無優惠券，請點擊新增</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {coupons.map((coupon) => {
            const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date()
            const isUsedUp = coupon.usage_limit && coupon.used_count >= coupon.usage_limit

            return (
              <Card key={coupon.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="font-mono text-xl">{coupon.code}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(coupon.code)}
                          className="h-6 w-6"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}% 折扣`
                          : `${formatPrice(coupon.discount_value)} 折扣`}
                        {coupon.min_purchase_amount > 0 &&
                          ` • 最低消費 ${formatPrice(coupon.min_purchase_amount)}`}
                        {coupon.max_discount_amount &&
                          ` • 最高折扣 ${formatPrice(coupon.max_discount_amount)}`}
                        {coupon.is_free_shipping && ` • 免運費`}
                      </p>
                      {coupon.description && (
                        <p className="text-sm text-muted-foreground mt-1">{coupon.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleOpenDialog(coupon)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    {coupon.is_active && !isExpired && !isUsedUp ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        啟用中
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                        已停用
                      </span>
                    )}
                    {isExpired && (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                        已過期
                      </span>
                    )}
                    {isUsedUp && (
                      <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded">
                        已用完
                      </span>
                    )}
                    {coupon.usage_limit && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        已使用 {coupon.used_count} / {coupon.usage_limit}
                      </span>
                    )}
                    {coupon.expires_at && (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                        到期：{new Date(coupon.expires_at).toLocaleDateString("zh-TW")}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
