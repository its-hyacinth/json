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
import { Calendar, FileText, LogOut, Shield, Users, GraduationCap, Clock, UserCheck, User } from "lucide-react"
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

export function AdminSidebar() {
  const { user, logout } = useAuth()
  const [activeView, setActiveView] = useState<
    "schedules" | "leave-requests" | "training-requests" | "overtime" | "accounts" | "profile"
  >("schedules")
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const menuItems = [
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
      case "schedules":
        return "Employee Schedules"
      case "leave-requests":
        return "Leave Requests"
      case "training-requests":
        return "Training Requests"
      case "overtime":
        return "Overtime Management"
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
      <Sidebar>
        <SidebarHeader className="border-b">
          <div className="flex items-center space-x-2 p-2">
            {/* Badge Image */}
            <div className="relative h-10 w-10">
              <Image 
                src="/images/Badge.png" 
                alt="CNU Police Badge"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="font-semibold">CNU Police Dept</h2>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton onClick={() => setActiveView(item.key)} isActive={activeView === item.key}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center space-x-2 p-2">
                <Users className="h-4 w-4" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 p-2">
                <Button variant="ghost" className="flex-1 justify-start" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
          </div>
          <NotificationBell />
          <ThemeToggle />
        </header>
        <div className="flex-1 p-6">
          {activeView === "schedules" && <AdminSchedules />}
          {activeView === "accounts" && <AdminAccounts />}
          {activeView === "leave-requests" && <AdminLeaveRequests />}
          {activeView === "training-requests" && <AdminTrainingRequests />}
          {activeView === "overtime" && <AdminOvertime />}
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