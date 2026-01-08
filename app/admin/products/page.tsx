import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ProductManagement } from "@/components/admin/product-management"

export default function AdminProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <ProductManagement />
        </main>
      </div>
    </div>
  )
}
