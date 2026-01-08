"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Save, Loader2 } from "lucide-react"

interface SystemSettings {
  vip_discount_percentage: string
  vvip_discount_percentage: string
}

export function SettingsManagement() {
  const [settings, setSettings] = useState<SystemSettings>({
    vip_discount_percentage: "10",
    vvip_discount_percentage: "20",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("system_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["vip_discount_percentage", "vvip_discount_percentage"])

      if (error) {
        throw error
      }

      if (data) {
        const settingsMap: SystemSettings = {
          vip_discount_percentage: "10",
          vvip_discount_percentage: "20",
        }

        data.forEach((item) => {
          if (item.setting_key === "vip_discount_percentage") {
            settingsMap.vip_discount_percentage = item.setting_value || "10"
          } else if (item.setting_key === "vvip_discount_percentage") {
            settingsMap.vvip_discount_percentage = item.setting_value || "20"
          }
        })

        setSettings(settingsMap)
      }
    } catch (error: any) {
      console.error("載入設定失敗:", error)
      toast({
        title: "載入失敗",
        description: error.message || "無法載入系統設定",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    // 驗證輸入
    const vipDiscount = parseFloat(settings.vip_discount_percentage)
    const vvipDiscount = parseFloat(settings.vvip_discount_percentage)

    if (isNaN(vipDiscount) || vipDiscount < 0 || vipDiscount > 100) {
      toast({
        title: "驗證失敗",
        description: "VIP 折扣百分比必須是 0-100 之間的數字",
        variant: "destructive",
      })
      return
    }

    if (isNaN(vvipDiscount) || vvipDiscount < 0 || vvipDiscount > 100) {
      toast({
        title: "驗證失敗",
        description: "VVIP 折扣百分比必須是 0-100 之間的數字",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      const supabase = createClient()

      // 更新 VIP 折扣百分比
      const { error: vipError } = await supabase
        .from("system_settings")
        .upsert(
          {
            setting_key: "vip_discount_percentage",
            setting_value: settings.vip_discount_percentage,
            description: "VIP 會員折扣百分比（例如：10 表示 10% 折扣）",
          },
          { onConflict: "setting_key" }
        )

      if (vipError) throw vipError

      // 更新 VVIP 折扣百分比
      const { error: vvipError } = await supabase
        .from("system_settings")
        .upsert(
          {
            setting_key: "vvip_discount_percentage",
            setting_value: settings.vvip_discount_percentage,
            description: "VVIP 會員折扣百分比（例如：20 表示 20% 折扣）",
          },
          { onConflict: "setting_key" }
        )

      if (vvipError) throw vvipError

      toast({
        title: "儲存成功",
        description: "系統設定已更新",
      })
    } catch (error: any) {
      console.error("儲存設定失敗:", error)
      toast({
        title: "儲存失敗",
        description: error.message || "無法儲存系統設定",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>系統設定</CardTitle>
          <CardDescription>管理您的系統配置</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>會員折扣設定</CardTitle>
        <CardDescription>調整 VIP 和 VVIP 會員的折扣百分比</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vip_discount">VIP 折扣百分比 (%)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="vip_discount"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.vip_discount_percentage}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    vip_discount_percentage: e.target.value,
                  })
                }
                placeholder="例如：10 表示 10% 折扣"
                className="max-w-xs"
              />
              <span className="text-sm text-muted-foreground">
                (目前：VIP 會員可享 {settings.vip_discount_percentage}% 折扣)
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              例如：輸入 10 表示 VIP 會員可享 10% 折扣（即 9 折優惠）
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vvip_discount">VVIP 折扣百分比 (%)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="vvip_discount"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.vvip_discount_percentage}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    vvip_discount_percentage: e.target.value,
                  })
                }
                placeholder="例如：20 表示 20% 折扣"
                className="max-w-xs"
              />
              <span className="text-sm text-muted-foreground">
                (目前：VVIP 會員可享 {settings.vvip_discount_percentage}% 折扣)
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              例如：輸入 20 表示 VVIP 會員可享 20% 折扣（即 8 折優惠）
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                儲存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                儲存設定
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
