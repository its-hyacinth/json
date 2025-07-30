"use client"

import { useState, useEffect, useCallback } from "react"
import { useEmployees } from "@/hooks/use-employees"
import { useEvents } from "@/hooks/use-events"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, ChevronLeft, ChevronRight, Star, Users, Loader2, User } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  getDay,
} from "date-fns"
import { cn } from "@/lib/utils"
import type { Schedule } from "@/services/schedule-service"
import { scheduleService } from "@/services/schedule-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export function EmployeeScheduleOverview() {
  const { user } = useAuth()
  const currentUserId = user?.id
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(false)

  const { employees: allEmployees, loading: employeesLoading } = useEmployees()

  // Filter out admin users - only show regular employees
  const employees = allEmployees.filter((employee) => employee.role !== "admin")

  const { events } = useEvents({
    month: selectedMonth.getMonth() + 1,
    year: selectedMonth.getFullYear(),
  })
  const { toast } = useToast()

  // Fetch schedules for all employees
  const fetchAllSchedules = useCallback(async () => {
    if (employees.length === 0) return

    setLoading(true)
    try {
      const allEmployeeSchedules: Schedule[] = []

      for (const employee of employees) {
        try {
          const schedules = await scheduleService.getSchedules({
            month: selectedMonth.getMonth() + 1,
            year: selectedMonth.getFullYear(),
            user_id: employee.id,
          })
          allEmployeeSchedules.push(...schedules)
        } catch (error) {
          console.warn(`Failed to fetch schedules for employee ${employee.id}:`, error)
        }
      }

      setAllSchedules(allEmployeeSchedules)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch schedules",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [employees, selectedMonth, toast])

  useEffect(() => {
        if (!employeesLoading && employees.length > 0) {
        fetchAllSchedules()
        }
    }, [fetchAllSchedules, employeesLoading, employees.length])

  const getScheduleForEmployeeAndDate = (employeeId: number, date: Date): Schedule | undefined => {
    return allSchedules.find((schedule) => schedule.user_id === employeeId && isSameDay(new Date(schedule.date), date))
  }

  const getEventsForDate = (date: Date) => {
    const dateOnly = new Date(date.setHours(0, 0, 0, 0))
    return events.filter((event) => {
      const eventStart = new Date(event.start_date)
      eventStart.setHours(0, 0, 0, 0)
      const eventEnd = new Date(event.end_date)
      eventEnd.setHours(23, 59, 59, 999)
      return dateOnly >= eventStart && dateOnly <= eventEnd
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setSelectedMonth(direction === "prev" ? subMonths(selectedMonth, 1) : addMonths(selectedMonth, 1))
  }

  if (employeesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Schedule Overview
          </h2>
          <p className="text-muted-foreground">
            {format(selectedMonth, "MMMM yyyy")} - View your work schedule alongside your colleagues
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 border-primary/20">
            <Users className="h-3 w-3" />
            {employees.length} Employees
          </Badge>
          <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Schedule Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{format(selectedMonth, "MMMM yyyy")}</CardTitle>
          <CardDescription>
            Your schedule overview with team context. Your row is highlighted. Times are shown in 24-hour format. Yellow
            highlighted cells indicate event days.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Loading schedules...</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-[70vw] ml-10 overflow-x-auto">
              <div className="min-w-max">
                {/* Spreadsheet-style table */}
                <table className="w-full border-collapse border border-gray-300">
                  {/* Header Row */}
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-sm font-bold text-center w-40 bg-gray-200 sticky left-0 z-10">
                        {format(selectedMonth, "MMMM yyyy").toUpperCase()}
                      </th>
                      {eachDayOfInterval({
                        start: startOfMonth(selectedMonth),
                        end: endOfMonth(selectedMonth),
                      }).map((date) => {
                        const dayEvents = getEventsForDate(date)
                        return (
                          <th
                            key={date.toISOString()}
                            className={cn(
                              "border border-gray-300 p-1 text-xs font-bold text-center w-12 relative",
                              isToday(date) ? "bg-blue-200" : "bg-gray-100",
                              dayEvents.length > 0 && "bg-yellow-200",
                            )}
                            title={
                              dayEvents.length > 0 ? `Events: ${dayEvents.map((e) => e.title).join(", ")}` : undefined
                            }
                          >
                            <div className="font-bold text-sm">{format(date, "d")}</div>
                            <div className="text-[10px] text-gray-600 uppercase font-bold">
                              {format(date, "EEE")[0]}
                            </div>
                            {dayEvents.length > 0 && (
                              <div className="absolute top-0 right-0">
                                <Star className="h-2 w-2 text-yellow-600" />
                              </div>
                            )}
                          </th>
                        )
                      })}
                    </tr>
                  </thead>

                  {/* Employee Rows */}
                  <tbody>
                    {employees.map((employee, index) => {
                      const isCurrentUser = employee.id === currentUserId
                      return (
                        <tr
                          key={employee.id}
                          className={cn(
                            "hover:bg-gray-50 transition-colors",
                            isCurrentUser
                              ? "bg-primary/10 border-l-4 border-l-primary"
                              : index % 2 === 0
                                ? "bg-white"
                                : "bg-gray-50/50",
                          )}
                        >
                          <td
                            className={cn(
                              "border border-gray-300 p-2 font-bold text-sm sticky left-0 z-10",
                              isCurrentUser ? "bg-primary/20" : "bg-gray-100",
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="font-bold text-sm truncate uppercase">{employee.last_name}</div>
                                  {isCurrentUser && (
                                    <span className="relative">
                                      <User className="h-3 w-3 text-primary" />
                                      <span className="sr-only">This is you</span>
                                    </span>
                                  )}
                                </div>
                                {employee.first_name && (
                                  <div className="text-xs text-gray-600 truncate">{employee.first_name}</div>
                                )}
                              </div>
                            </div>
                          </td>

                          {eachDayOfInterval({
                            start: startOfMonth(selectedMonth),
                            end: endOfMonth(selectedMonth),
                          }).map((date) => {
                            const schedule = getScheduleForEmployeeAndDate(employee.id, date)
                            const dayOfWeek = getDay(date)
                            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                            const isTodayDate = isToday(date)
                            const hasEvents = getEventsForDate(date).length > 0

                            let cellBg = isCurrentUser ? "bg-primary/5" : "bg-white"
                            if (isTodayDate) {
                              cellBg = isCurrentUser ? "bg-primary/20" : "bg-blue-100"
                            } else if (hasEvents) {
                              cellBg = isCurrentUser ? "bg-yellow-200" : "bg-yellow-100"
                            } else if (isWeekend) {
                              cellBg = isCurrentUser ? "bg-primary/10" : "bg-gray-100"
                            }

                            // Special background colors for different statuses
                            if (schedule?.status === "C") {
                              cellBg = isCurrentUser ? "bg-yellow-300" : "bg-yellow-200"
                            } else if (schedule?.status === "SD") {
                              cellBg = isCurrentUser ? "bg-green-300" : "bg-green-200"
                            } else if (schedule?.status === "S") {
                              cellBg = isCurrentUser ? "bg-cyan-300" : "bg-cyan-200"
                            } else if (schedule?.status === "M") {
                              cellBg = isCurrentUser ? "bg-amber-300" : "bg-amber-200"
                            } else if (schedule?.status === "CT") {
                              cellBg = isCurrentUser ? "bg-indigo-300" : "bg-indigo-200"
                            }

                            return (
                              <td
                                key={`schedule-${date.toISOString()}`}
                                className={cn(
                                  "border border-gray-300 p-1 text-center h-12 w-12",
                                  cellBg,
                                  isCurrentUser && "border-primary/30",
                                )}
                              >
                                <div className="flex items-center justify-center h-full">
                                  {!schedule ? (
                                    <span className="text-xs text-gray-400 font-bold">0</span>
                                  ) : schedule.status === "C" ? (
                                    <span className="text-xs font-bold text-black">C</span>
                                  ) : schedule.status === "SD" ? (
                                    <span className="text-xs font-bold text-black">SD</span>
                                  ) : schedule.status === "S" ? (
                                    <span className="text-xs font-bold text-black">S</span>
                                  ) : schedule.status === "M" ? (
                                    <span className="text-xs font-bold text-black">M</span>
                                  ) : schedule.status === "CT" ? (
                                    <span className="text-xs font-bold text-black">CT</span>
                                  ) : schedule.time_in ? (
                                    <span className="text-xs font-bold text-black">
                                      {Number.parseInt(schedule.time_in.split(":")[0])}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400 font-bold">0</span>
                                  )}
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            Schedule Legend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-6 bg-background border-2 border-primary/20 rounded flex items-center justify-center text-xs font-mono font-semibold">
                08
              </div>
              <span className="text-sm">Working Time</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300"
              >
                C
              </Badge>
              <span className="text-sm">Ordinary Leave</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="destructive"
                className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300"
              >
                SD
              </Badge>
              <span className="text-sm">Sick Leave</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100 dark:bg-cyan-900 dark:text-cyan-300 border-cyan-300"
              >
                S
              </Badge>
              <span className="text-sm">School/Training</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-300 border-amber-300"
              >
                M
              </Badge>
              <span className="text-sm">Military</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300 border-indigo-300"
              >
                CT
              </Badge>
              <span className="text-sm">Court</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-6 bg-yellow-50 border-2 border-yellow-200 rounded"></div>
              <span className="text-sm">Event Day</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-6 bg-primary/10 border-2 border-primary/30 rounded flex items-center justify-center">
                <User className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm">Your Schedule</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
