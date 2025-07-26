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
import { Calendar, FileText, LogOut, Shield, User, GraduationCap, Clock } from "lucide-react"
import { EmployeeSchedule } from "./employee-schedule"
import { EmployeeLeaveRequest } from "./employee-leave-request"
import { EmployeeTrainingRequests } from "./employee-training-requests"
import { EmployeeOvertime } from "./employee-overtime"
import { ProfileSettings } from "./profile-settings"
import { ThemeToggle } from "./theme-toggle"
import { NotificationBell } from "./notification-bell"

export function EmployeeSidebar() {
  const { user, logout } = useAuth()
  const [activeView, setActiveView] = useState<
    "schedule" | "leave-request" | "training-requests" | "overtime" | "profile"
  >("schedule")

  const menuItems = [
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
      title: "Profile",
      icon: User,
      key: "profile" as const,
    },
  ]

  const getPageTitle = () => {
    switch (activeView) {
      case "schedule":
        return "My Schedule"
      case "leave-request":
        return "Leave Request"
      case "training-requests":
        return "Training Requests"
      case "overtime":
        return "Overtime"
      case "profile":
        return "Profile Settings"
      default:
        return "Dashboard"
    }
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader className="border-b">
          <div className="flex items-center space-x-2 p-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="font-semibold">CNU Police Dept</h2>
              <p className="text-xs text-muted-foreground">Employee Portal</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>My Dashboard</SidebarGroupLabel>
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
                <User className="h-4 w-4" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-muted-foreground">Employee</p>
                </div>
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 p-2">
                <ThemeToggle />
                <Button variant="ghost" className="flex-1 justify-start" onClick={logout}>
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
          {activeView === "schedule" && <EmployeeSchedule />}
          {activeView === "leave-request" && <EmployeeLeaveRequest />}
          {activeView === "training-requests" && <EmployeeTrainingRequests />}
          {activeView === "overtime" && <EmployeeOvertime />}
          {activeView === "profile" && <ProfileSettings />}
        </div>
      </SidebarInset>
    </>
  )
}
