import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { CouponManagement } from "@/components/admin/coupon-management"

export default function AdminCouponsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <CouponManagement />
        </main>
      </div>
    </div>
  )
}
