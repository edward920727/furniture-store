"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Users, Mail, Phone, Calendar } from "lucide-react"

interface UserProfile {
  id: string
  email: string
  full_name?: string
  phone?: string
  address?: string
  member_level?: "normal" | "regular" | "vip" | "vvip"
  membership_level?: "normal" | "regular" | "vip" | "vvip" // 兼容舊欄位名稱
  created_at?: string
}

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // 明確指定要查詢的欄位，確保包含所有必要欄位
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, phone, address, member_level, membership_level, created_at")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "載入失敗",
          description: error.message,
          variant: "destructive",
        })
        setUsers([])
      } else {
        // 確保資料格式正確
        setUsers((data || []).map(user => ({
          ...user,
          created_at: user.created_at || null,
        })))
      }
    } catch (error: any) {
      console.error("Exception in fetchUsers:", error)
      toast({
        title: "載入失敗",
        description: error.message || "發生未知錯誤",
        variant: "destructive",
      })
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateMembership = async (userId: string, newLevel: "normal" | "regular" | "vip" | "vvip") => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("profiles")
        .update({ member_level: newLevel })
        .eq("id", userId)

      if (error) {
        toast({
          title: "更新失敗",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "更新成功",
          description: "會員等級已更新",
        })
        await fetchUsers()
      }
    } catch (error: any) {
      toast({
        title: "更新失敗",
        description: error.message || "發生未知錯誤",
        variant: "destructive",
      })
    }
  }

  const getMembershipBadge = (user: UserProfile) => {
    const level = user.member_level || user.membership_level || "normal"
    switch (level) {
      case "vvip":
        return <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">VVIP</span>
      case "vip":
        return <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">VIP</span>
      case "regular":
        return <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">一般會員</span>
      case "normal":
      default:
        return <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">一般會員</span>
    }
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
          <h1 className="text-3xl font-bold">會員管理</h1>
          <p className="text-muted-foreground mt-2">管理所有註冊會員及其等級</p>
        </div>
        <div className="text-sm text-muted-foreground">
          總共 {users.length} 位會員
        </div>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">目前尚無會員註冊</h3>
              <p className="text-muted-foreground">
                當有會員註冊時，他們的資料會顯示在這裡
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {user.full_name || "未設定名稱"}
                      {getMembershipBadge(user)}
                    </CardTitle>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {user.phone}
                        </div>
                      )}
                      {user.created_at && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          註冊時間：{new Date(user.created_at).toLocaleDateString("zh-TW")}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={user.member_level || user.membership_level || "normal"}
                      onValueChange={(value: "normal" | "regular" | "vip" | "vvip") =>
                        handleUpdateMembership(user.id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">一般會員</SelectItem>
                        <SelectItem value="regular">一般會員</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="vvip">VVIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              {user.address && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    <strong>地址：</strong>
                    {user.address}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
