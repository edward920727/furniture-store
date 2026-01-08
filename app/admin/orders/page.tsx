import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { OrderManagement } from "@/components/admin/order-management"

export default function AdminOrdersPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <OrderManagement />
        </main>
      </div>
    </div>
  )
}
