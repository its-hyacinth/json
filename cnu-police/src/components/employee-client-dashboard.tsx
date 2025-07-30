"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { EmployeeSidebar } from "@/components/employee-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function ClientEmployeeDashboard() {
  const { user, loading, logout } = useAuth() // Destructure logout from useAuth
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "employee") {
        logout() // Call logout if user is not authenticated or not an employee
        router.push("/")
      }
    }
  }, [user, loading, router, logout])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user || user.role !== "employee") {
    return null
  }

  return (
    <SidebarProvider>
      <EmployeeSidebar />
    </SidebarProvider>
  )
}