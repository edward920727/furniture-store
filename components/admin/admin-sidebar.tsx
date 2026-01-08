"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LayoutDashboard, Package, LogOut, Settings, Ticket, Users, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const menuItems = [
  { href: "/admin", label: "儀表板", icon: LayoutDashboard },
  { href: "/admin/products", label: "產品管理", icon: Package },
  { href: "/admin/orders", label: "訂單管理", icon: ShoppingBag },
  { href: "/admin/coupons", label: "優惠券管理", icon: Ticket },
  { href: "/admin/users", label: "會員管理", icon: Users },
  { href: "/admin/settings", label: "設定", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  return (
    <aside className="w-64 border-r bg-card min-h-screen p-6">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold">管理後台</h2>
          <p className="text-sm text-muted-foreground mt-1">張馨家居</p>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          登出
        </Button>
      </div>
    </aside>
  )
}
