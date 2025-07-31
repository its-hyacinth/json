"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useEmployees } from "@/hooks/use-employees"
import { useEvents } from "@/hooks/use-events"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Star, Users, Loader2 } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  getDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns"
import type { Schedule } from "@/services/schedule-service"
import type { Event } from "@/services/event-service"
import { scheduleService } from "@/services/schedule-service"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

export function AdminScheduleOverview() {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(false)
  const [employeeOrder, setEmployeeOrder] = useState<number[]>([])

  const { employees, loading: employeesLoading } = useEmployees()

  // Filter out admin users (without depending on schedules)
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => employee.role !== "admin")
  }, [employees])

  useEffect(() => {
    const savedOrder = localStorage.getItem('employee-order')
    if (savedOrder) {
      try {
        setEmployeeOrder(JSON.parse(savedOrder))
      } catch (error) {
        console.warn('Failed to parse saved employee order:', error)
      }
    }
  }, [])

  // Sort employees by saved order, then by custom sort order
  const sortedEmployees = useMemo(() => {
    // Define the custom sort order
    const customSortOrder = [
      "OZMENT",
      "CHERRY",
      "DECKER",
      "RICHARDS",
      "LANZENDORF",
      "SANDERS",
      "DELGADO",
      "HATTON",
      "CERRUTI",
      "AUSTIN",
      "CRENSHAW",
      "CAMACHO",
      "SENTZ",
      "WILLIAMS",
      "GOLBAD",
      "REYNOLDS"
    ].map(name => name.toLowerCase())

    let sorted = [...filteredEmployees]

    // If we have a saved order, use it
    if (employeeOrder.length > 0) {
      sorted.sort((a, b) => {
        const indexA = employeeOrder.indexOf(a.id)
        const indexB = employeeOrder.indexOf(b.id)
        
        // If both are in saved order, sort by that
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB
        }
        // If only A is in saved order, it comes first
        if (indexA !== -1) {
          return -1
        }
        // If only B is in saved order, it comes first
        if (indexB !== -1) {
          return 1
        }
        // If neither is in saved order, use custom sort
        const customIndexA = customSortOrder.indexOf(a.last_name.toLowerCase())
        const customIndexB = customSortOrder.indexOf(b.last_name.toLowerCase())
        
        if (customIndexA !== -1 && customIndexB !== -1) {
          return customIndexA - customIndexB
        }
        if (customIndexA !== -1) {
          return -1
        }
        if (customIndexB !== -1) {
          return 1
        }
        return a.last_name.localeCompare(b.last_name)
      })
    } else {
      // Use custom sort order
      sorted.sort((a, b) => {
        const indexA = customSortOrder.indexOf(a.last_name.toLowerCase())
        const indexB = customSortOrder.indexOf(b.last_name.toLowerCase())

        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB
        }
        if (indexA !== -1) {
          return -1
        }
        if (indexB !== -1) {
          return 1
        }
        return a.last_name.localeCompare(b.last_name)
      })
    }

    return sorted
  }, [filteredEmployees, employeeOrder])

  const {
    events,
    loading: eventsLoading,
    fetchEvents,
  } = useEvents({
    month: selectedMonth.getMonth() + 1,
    year: selectedMonth.getFullYear(),
  })
  const { toast } = useToast()

  const monthDays = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth),
  })

  // Fetch schedules for all employees
  const fetchAllSchedules = useCallback(async () => {
    if (filteredEmployees.length === 0) return;

    setLoading(true);
    try {
      // Get all employee IDs
      const employeeIds = filteredEmployees.map(emp => emp.id);
      
      // Use batch fetch instead of individual fetches
      const batchSchedules = await scheduleService.getBatchSchedules({
        user_ids: employeeIds,
        month: selectedMonth.getMonth() + 1,
        year: selectedMonth.getFullYear()
      });

      // Convert the grouped schedules into a flat array
      const allSchedules = Object.values(batchSchedules).flat();
      setAllSchedules(allSchedules);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch schedules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filteredEmployees, selectedMonth, toast]);

  // Only fetch schedules when month changes or filtered employees change
  useEffect(() => {
    if (!employeesLoading && filteredEmployees.length > 0) {
      fetchAllSchedules()
    }
  }, [selectedMonth, filteredEmployees, employeesLoading, fetchAllSchedules])

  const getScheduleForEmployeeAndDate = (employeeId: number, date: Date): Schedule | undefined => {
    return allSchedules.find((schedule) => schedule.user_id === employeeId && isSameDay(new Date(schedule.date), date))
  }

  const getEventsForDate = (date: Date): Event[] => {
    const dateOnly = new Date(date.setHours(0, 0, 0, 0))

    return events.filter((event) => {
      const eventStart = new Date(event.start_date)
      eventStart.setHours(0, 0, 0, 0)

      const eventEnd = new Date(event.end_date)
      eventEnd.setHours(23, 59, 59, 999)

      return dateOnly >= eventStart && dateOnly <= eventEnd
    })
  }

  const getCellContent = (employeeId: number, date: Date) => {
    const schedule = getScheduleForEmployeeAndDate(employeeId, date)

    if (!schedule) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-xs text-muted-foreground">—</div>
        </div>
      )
    }

    if (schedule.status === "C") {
      return (
        <div className="flex items-center justify-center h-full">
          <Badge
            variant="secondary"
            className="text-xs font-bold bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300"
          >
            C
          </Badge>
        </div>
      )
    }

    if (schedule.status === "SD") {
      return (
        <div className="flex items-center justify-center h-full">
          <Badge
            variant="destructive"
            className="text-xs font-bold bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300"
          >
            SD
          </Badge>
        </div>
      )
    }

    if (schedule.status === "S") {
      return (
        <div className="flex items-center justify-center h-full">
          <Badge
            variant="outline"
            className="text-xs font-bold bg-cyan-100 text-cyan-700 hover:bg-cyan-100 dark:bg-cyan-900 dark:text-cyan-300 border-cyan-300"
          >
            S
          </Badge>
        </div>
      )
    }

    if (schedule.status === "M") {
      return (
        <div className="flex items-center justify-center h-full">
          <Badge
            variant="outline"
            className="text-xs font-bold bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-300 border-amber-300"
          >
            M
          </Badge>
        </div>
      )
    }

    if (schedule.status === "CT") {
      return (
        <div className="flex items-center justify-center h-full">
          <Badge
            variant="outline"
            className="text-xs font-bold bg-indigo-100 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300 border-indigo-300"
          >
            CT
          </Badge>
        </div>
      )
    }

    if (schedule.time_in) {
      const timeIn = format(new Date(`2000-01-01T${schedule.time_in}`), "HH:mm")
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-xs font-mono font-semibold text-foreground">{timeIn}</div>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xs text-muted-foreground">—</div>
      </div>
    )
  }

  const getCellBackground = (date: Date, employeeIndex: number) => {
    const dayOfWeek = getDay(date)
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isTodayDate = isToday(date)
    const hasEvents = getEventsForDate(date).length > 0

    if (isTodayDate) {
      return "bg-primary/10 border-primary/30"
    }

    if (hasEvents) {
      return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
    }

    if (isWeekend) {
      return "bg-muted/30"
    }

    return employeeIndex % 2 === 0 ? "bg-background" : "bg-muted/10"
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
    <div className="space-y-6 max-w-full">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-primary">Schedule Overview</h1>
            <p className="text-muted-foreground">Viewing schedules for {format(selectedMonth, "MMMM yyyy")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 border-primary/20">
              <Users className="h-3 w-3" />
              {filteredEmployees.length} Employees
            </Badge>
            <Badge variant="outline" className="gap-1 border-yellow-300">
              <Star className="h-3 w-3" />
              {events.length} Events
            </Badge>
          </div>
        </div>

        {/* Month Controls */}
        <div className="flex gap-4 items-center justify-between bg-primary/5 p-4 rounded-lg border border-primary/10">
          <div className="flex gap-4 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
              className="bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="space-y-2">
              <div className="flex">
                <Input
                  id="month"
                  type="month"
                  value={format(selectedMonth, "yyyy-MM")}
                  onChange={(e) => setSelectedMonth(new Date(e.target.value))}
                  className="w-44"
                />
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
              className="bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <Card className="border-primary/10 w-full">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Schedule Grid</CardTitle>
          <CardDescription>
            Read-only view of schedules. Times are displayed in 24-hour format. Yellow highlighted cells indicate event
            days.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8">
              <div className="flex items-center justify-center space-y-4">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Loading schedules...</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="w-[75vw] ml-2">
                {/* Spreadsheet-style table */}
                <table className="w-full border-collapse border border-gray-300">
                  {/* Header Row */}
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-sm font-bold text-center w-40 bg-gray-200 sticky left-0 z-10">
                        {format(selectedMonth, "MMMM yyyy").toUpperCase()}
                      </th>
                      {monthDays.map((date) => {
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
                    {sortedEmployees.map((employee, index) => (
                      <tr
                        key={employee.id}
                        className={cn(
                          "hover:bg-gray-50 transition-colors",
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50",
                        )}
                      >
                        <td className="border border-gray-300 p-2 bg-gray-100 font-bold text-sm sticky left-0 z-10">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-sm truncate uppercase">{employee.last_name}</div>
                            </div>
                          </div>
                        </td>

                        {monthDays.map((date) => {
                          const schedule = getScheduleForEmployeeAndDate(employee.id, date)
                          const dayOfWeek = getDay(date)
                          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                          const isTodayDate = isToday(date)
                          const hasEvents = getEventsForDate(date).length > 0

                          let cellBg = "bg-white"
                          if (isTodayDate) {
                            cellBg = "bg-blue-100"
                          } else if (hasEvents) {
                            cellBg = "bg-yellow-100"
                          } else if (isWeekend) {
                            cellBg = "bg-gray-100"
                          }

                          // Special background colors for different statuses
                          if (schedule?.status === "C") {
                            cellBg = "bg-yellow-200"
                          } else if (schedule?.status === "SD") {
                            cellBg = "bg-green-200"
                          } else if (schedule?.status === "S") {
                            cellBg = "bg-cyan-200"
                          } else if (schedule?.status === "M") {
                            cellBg = "bg-amber-200"
                          } else if (schedule?.status === "CT") {
                            cellBg = "bg-indigo-200"
                          }

                          return (
                            <td
                              key={`${employee.id}-${date.toISOString()}`}
                              className={cn("border border-gray-300 p-1 text-center h-12 w-12", cellBg)}
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
                    ))}
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
                08:00
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
