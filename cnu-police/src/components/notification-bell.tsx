"use client"

import { useState, useEffect } from "react"
import { 
  Bell, 
  CheckCheck, 
  CalendarDays, 
  Sun, 
  PenSquare, 
  GraduationCap, 
  BookOpen, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Mail,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  UserCog,
  Users,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotifications } from "@/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

export function NotificationBell() {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, fetchUnreadCount } = useNotifications()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      // Refresh notifications when dropdown is opened
      fetchNotifications(1)
      fetchUnreadCount()
    }
  }, [open, fetchNotifications])

  const handleNotificationClick = async (notificationId: number, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(notificationId)
    }
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const getNotificationIcon = (type: string) => {
    const iconClass = "h-4 w-4 text-primary";
    
    switch (type) {
      case "new_event":
        return <CalendarDays className={iconClass} />
      case "event_update":
        return <CalendarCheck className={iconClass} />
      case "event_cancelled":
        return <CalendarX className={iconClass} />
      case "event_reminder":
        return <CalendarClock className={iconClass} />
      case "schedule_update":
      case "bulk_schedule_update":
      case "schedule_generated":
        return <Clock className={iconClass} />
      case "schedule_template_applied":
        return <UserCog className={iconClass} />
      case "schedule_conflict":
        return <AlertTriangle className={iconClass} />
      case "leave_request_update":
        return <Sun className={iconClass} />
      case "new_leave_request":
        return <PenSquare className={iconClass} />
      case "leave_request_status_change":
        return <Mail className={iconClass} />
      case "training_request_approved":
        return <ThumbsUp className={iconClass} />
      case "training_request_declined":
        return <ThumbsDown className={iconClass} />
      case "training_completed":
      case "training_completed_admin":
        return <CheckCircle className={iconClass} />
      case "new_training_request":
      case "training_request_updated":
        return <GraduationCap className={iconClass} />
      case "overtime_request":
      case "new_overtime_request":
      case "overtime_request_updated":
        return <Clock className={iconClass} />
      case "overtime_request_accepted":
        return <ThumbsUp className={iconClass} />
      case "overtime_request_declined":
        return <ThumbsDown className={iconClass} />
      case "auto_overtime_assigned":
        return <Users className={iconClass} />
      default:
        return <AlertCircle className={iconClass} />
    }
  }

  const notificationItems = notifications.slice(0, 10).map((notification) => {
    const isRead = !!notification.read_at
    return (
      <DropdownMenuItem
        key={`${notification.id}-${isRead}`}
        className={cn(
          "flex flex-col items-start p-3 cursor-pointer relative",
          !isRead && "bg-primary/5"
        )}
        onClick={() => handleNotificationClick(notification.id, isRead)}
      >
        {!isRead && (
          <div className="absolute left-1 top-1/2 transform -translate-y-1/2">
            <div className="h-2 w-2 bg-primary rounded-full" />
          </div>
        )}
        
        <div className="flex items-start gap-3 w-full pl-3">
          <div className="flex-shrink-0 mt-0.5">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm truncate">{notification.data.title}</p>
              {!isRead && (
                <Badge variant="default" className="h-4 px-1 text-xs">
                  New
                </Badge>
              )}
            </div>
            <p className="text-xs mt-1 line-clamp-2">{notification.data.message}</p>
            <p className="text-xs mt-1">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </DropdownMenuItem>
    )
  })

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead} 
              className="h-auto p-1 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
          ) : (
            notificationItems
          )}
        </ScrollArea>
        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-muted-foreground">
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}