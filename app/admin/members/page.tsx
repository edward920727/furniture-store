import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { UserManagement } from "@/components/admin/user-management"

export default function AdminMembersPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <UserManagement />
        </main>
      </div>
    </div>
  )
}
