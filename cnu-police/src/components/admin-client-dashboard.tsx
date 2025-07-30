"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSchedules } from "@/components/admin-schedules"

export default function ClientAdminDashboard() {
  const { user, loading, logout } = useAuth() // Make sure your auth context provides a logout function
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "admin") {
        logout().then(() => router.push("/"))
      }
    }
  }, [user, loading, router, logout])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
    </SidebarProvider>
  )
}