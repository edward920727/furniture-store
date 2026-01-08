"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  })
  const [categoryData, setCategoryData] = useState<{ name: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()

      // 產品統計
      const { count: totalProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })

      const { count: activeProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)

      // 訂單統計
      const { count: totalOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })

      const { data: orders } = await supabase
        .from("orders")
        .select("total_amount")

      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

      // 分類統計
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name")

      if (categories) {
        const categoryCounts = await Promise.all(
          categories.map(async (category) => {
            const { count } = await supabase
              .from("products")
              .select("*", { count: "exact", head: true })
              .eq("category_id", category.id)
              .eq("is_active", true)
            return { name: category.name, count: count || 0 }
          })
        )
        setCategoryData(categoryCounts)
      }

      setStats({
        totalProducts: totalProducts || 0,
        activeProducts: activeProducts || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
      })
      setLoading(false)
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div className="text-center py-12">載入中...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">儀表板</h1>
        <p className="text-muted-foreground mt-2">歡迎回來</p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總產品數</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              活躍產品：{stats.activeProducts}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總訂單數</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總營收</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">產品分布</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryData.length}</div>
            <p className="text-xs text-muted-foreground">產品分類</p>
          </CardContent>
        </Card>
      </div>

      {/* 圖表 */}
      <Card>
        <CardHeader>
          <CardTitle>產品分類分布</CardTitle>
          <CardDescription>各分類的產品數量</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
