"use client"

import { SidebarInset } from "@/components/ui/sidebar"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, LogOut, Shield, Users, GraduationCap, Clock, UserCheck, User, Gavel, LayoutDashboard } from "lucide-react"
import { AdminSchedules } from "./admin-schedules"
import { AdminLeaveRequests } from "./admin-leave-requests"
import { ThemeToggle } from "./theme-toggle"
import { AdminTrainingRequests } from "./admin-training-requests"
import { AdminOvertime } from "./admin-overtime"
import { AdminAccounts } from "./admin-accounts"
import { ProfileSettings } from "./profile-settings"
import { NotificationBell } from "./notification-bell"
import Image from "next/image"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AdminCourt } from "./admin-court"
import { AdminScheduleOverview } from "./admin-schedule-overview"

export function AdminSidebar() {
  const { user, logout } = useAuth()
  const [activeView, setActiveView] = useState<
    "dashboard" | "schedules" | "leave-requests" | "training-requests" | "overtime" | "court" | "accounts" | "profile"
  >("dashboard")
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      key: "dashboard" as const,
    },
    {
      title: "Schedules",
      icon: Calendar,
      key: "schedules" as const,
    },
    {
      title: "Leave Requests",
      icon: FileText,
      key: "leave-requests" as const,
    },
    {
      title: "Training Requests",
      icon: GraduationCap,
      key: "training-requests" as const,
    },
    {
      title: "Overtime",
      icon: Clock,
      key: "overtime" as const,
    },
    {
      title: "Court",
      icon: Gavel,
      key: "court" as const,
    },
    {
      title: "Account Management",
      icon: UserCheck,
      key: "accounts" as const,
    },
    {
      title: "Profile",
      icon: User,
      key: "profile" as const,
    },
  ]

  const getPageTitle = () => {
    switch (activeView) {
      case "dashboard":
        return "Dashboard"
      case "schedules":
        return "Employee Schedules"
      case "leave-requests":
        return "Leave Requests"
      case "training-requests":
        return "Training Requests"
      case "overtime":
        return "Overtime Management"
      case "court":
        return "Court Management"
      case "accounts":
        return "Account Management"
      case "profile":
        return "Profile Settings"
      default:
        return "Dashboard"
    }
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    logout()
    setShowLogoutConfirm(false)
  }

  return (
    <>
      <Sidebar className="bg-gradient-to-b from-blue-900 to-blue-700 text-white w-64">
        <SidebarHeader className="border-none py-8 flex flex-col items-center justify-center text-center">
          <div className="relative w-20 h-20 mb-4">
            <Image src="/images/Badge.png" alt="CNU Badge" fill className="object-contain" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold tracking-wide uppercase font-serif">Christopher Newport University</h2>
            <p className="text-xs uppercase tracking-wide font-serif">Police Department</p>
            <p className="text-sm text-white/80 mt-2">Admin Dashboard</p>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2">
          <SidebarMenu className="space-y-1">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton
                  onClick={() => setActiveView(item.key)}
                  isActive={activeView === item.key}
                  className={`w-full px-4 py-3 rounded-md text-sm flex items-center gap-3 transition-colors ${
                    activeView === item.key
                      ? "bg-white/20 text-white font-semibold"
                      : "hover:bg-white/10 text-white/80"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="mt-auto p-4 border-none">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-white/80" />
              <div>
                <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-white/60">Administrator</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-white/80 hover:bg-white/10 px-0"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
          </div>
          <NotificationBell />
        </header>
        <div className="flex-1 p-6">
          {activeView === "dashboard" && <AdminScheduleOverview />}
          {activeView === "schedules" && <AdminSchedules />}
          {activeView === "accounts" && <AdminAccounts />}
          {activeView === "leave-requests" && <AdminLeaveRequests />}
          {activeView === "training-requests" && <AdminTrainingRequests />}
          {activeView === "overtime" && <AdminOvertime />}
          {activeView === "court" && <AdminCourt />}
          {activeView === "profile" && <ProfileSettings />}
        </div>
      </SidebarInset>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You'll need to sign in again to access the admin panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}