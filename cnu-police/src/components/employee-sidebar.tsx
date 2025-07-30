"use client"

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
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, LogOut, Shield, User, GraduationCap, Clock, Users, Gavel, LayoutDashboard } from "lucide-react"
import { EmployeeSchedule } from "./employee-schedule"
import { EmployeeLeaveRequest } from "./employee-leave-request"
import { EmployeeTrainingRequests } from "./employee-training-requests"
import { EmployeeOvertime } from "./employee-overtime"
import { ProfileSettings } from "./profile-settings"
import { ThemeToggle } from "./theme-toggle"
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
import { EmployeeCourt } from "./employee-court"
import { EmployeeScheduleOverview } from "./employee-schedule-overview"

export function EmployeeSidebar() {
  const { user, logout } = useAuth()
  const [activeView, setActiveView] = useState<
    "dashboard" | "schedule" | "leave-request" | "training-requests" | "overtime" | "profile" | "court"
  >("dashboard")
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      key: "dashboard" as const,
    },
    {
      title: "My Schedule",
      icon: Calendar,
      key: "schedule" as const,
    },
    {
      title: "Leave Request",
      icon: FileText,
      key: "leave-request" as const,
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
      title: "Profile",
      icon: User,
      key: "profile" as const,
    },
  ]

  const getPageTitle = () => {
    switch (activeView) {
      case "dashboard":
        return "Dashboard"
      case "schedule":
        return "My Schedule"
      case "leave-request":
        return "Leave Request"
      case "training-requests":
        return "Training Requests"
      case "overtime":
        return "Overtime"
      case "court":
        return "Court"
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
            <p className="text-sm text-white/80 mt-2">Employee Dashboard</p>
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
                <p className="text-xs text-white/60">Employee</p>
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
          {activeView === "dashboard" && <EmployeeScheduleOverview />}
          {activeView === "schedule" && <EmployeeSchedule />}
          {activeView === "leave-request" && <EmployeeLeaveRequest />}
          {activeView === "training-requests" && <EmployeeTrainingRequests />}
          {activeView === "overtime" && <EmployeeOvertime />}
          {activeView === "court" && <EmployeeCourt />}
          {activeView === "profile" && <ProfileSettings />}
        </div>
      </SidebarInset>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You'll need to sign in again to access your employee portal.
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