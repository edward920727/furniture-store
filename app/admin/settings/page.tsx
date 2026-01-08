import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">設定</h1>
              <p className="text-muted-foreground mt-2">管理系統設定</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>系統設定</CardTitle>
                <CardDescription>管理您的系統配置</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">設定功能開發中...</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
