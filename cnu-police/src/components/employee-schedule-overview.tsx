"use client"

import { useState } from "react"
import { useSchedules } from "@/hooks/use-schedules"
import { useEvents } from "@/hooks/use-events"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight, Star } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isWeekend,
  isSameMonth,
  getDay,
} from "date-fns"
import { cn } from "@/lib/utils"

export function EmployeeScheduleOverview() {
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  const { schedules, loading } = useSchedules({
    month: selectedMonth.getMonth() + 1,
    year: selectedMonth.getFullYear(),
  })

  const { events } = useEvents({
    month: selectedMonth.getMonth() + 1,
    year: selectedMonth.getFullYear(),
  })

  // Get calendar grid including previous/next month days for complete weeks
  const monthStart = startOfMonth(selectedMonth)
  const monthEnd = endOfMonth(selectedMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // Sunday start
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  const getScheduleForDate = (date: Date) => {
    return schedules.find((schedule) => isSameDay(new Date(schedule.date), date))
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

  const getStatusBadge = (status: string, timeIn?: string) => {
    switch (status) {
      case "working":
        return (
          <Badge variant="default" className="text-xs">
            Working
          </Badge>
        )
      case "C":
        return (
          <Badge variant="secondary" className="text-xs">
            Leave
          </Badge>
        )
      case "SD":
        return (
          <Badge variant="destructive" className="text-xs">
            Sick
          </Badge>
        )
      case "S":
        return (
          <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
            School
          </Badge>
        )
      case "M":
        return (
          <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
            Military
          </Badge>
        )
      case "CT":
        return (
          <Badge variant="outline" className="text-xs bg-indigo-100 text-indigo-700 border-indigo-300">
            Court
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        )
    }
  }

  const getDayBackground = (date: Date, schedule: any, dayEvents: any[]) => {
    const isTodayDate = isToday(date)
    const isCurrentMonth = isSameMonth(date, selectedMonth)
    const isWeekendDay = isWeekend(date)
    const hasEvents = dayEvents.length > 0

    if (!isCurrentMonth) {
      return "bg-muted/30 text-muted-foreground"
    }

    if (isTodayDate) {
      return "bg-primary/10 border-primary/30 border-2"
    }

    if (hasEvents) {
      return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
    }

    if (isWeekendDay) {
      return "bg-muted/50"
    }

    return "bg-background border hover:bg-muted/30 transition-colors"
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setSelectedMonth(direction === "prev" ? subMonths(selectedMonth, 1) : addMonths(selectedMonth, 1))
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
            {format(selectedMonth, "MMMM yyyy")} - View your work schedule and events
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            Your schedule overview. Times are shown in 24-hour format. Yellow highlighted cells indicate event days.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Loading schedule...</p>
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
                      <th className="border border-gray-300 p-2 text-sm font-bold text-center w-40 bg-gray-200">
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

                  {/* Employee Row - Highlighted */}
                  <tbody>
                    <tr className="bg-primary/10 border-2 border-primary/30 hover:bg-primary/15 transition-colors">
                      <td className="border border-gray-300 p-2 bg-primary/20 font-bold text-sm">
                        <div className="flex items-center justify-center">
                          <div className="text-center">
                            <div className="font-bold text-sm uppercase text-primary">OVERVIEW</div>
                            <div className="text-xs text-primary/80">{format(selectedMonth, "MMMM yyyy")}</div>
                          </div>
                        </div>
                      </td>

                      {eachDayOfInterval({
                        start: startOfMonth(selectedMonth),
                        end: endOfMonth(selectedMonth),
                      }).map((date) => {
                        const schedule = getScheduleForDate(date)
                        const dayOfWeek = getDay(date)
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                        const isTodayDate = isToday(date)
                        const hasEvents = getEventsForDate(date).length > 0

                        let cellBg = "bg-primary/5"
                        if (isTodayDate) {
                          cellBg = "bg-blue-200 border-2 border-blue-400"
                        } else if (hasEvents) {
                          cellBg = "bg-yellow-200"
                        } else if (isWeekend) {
                          cellBg = "bg-gray-200"
                        }

                        // Special background colors for different statuses
                        if (schedule?.status === "C") {
                          cellBg = "bg-yellow-300"
                        } else if (schedule?.status === "SD") {
                          cellBg = "bg-green-300"
                        } else if (schedule?.status === "S") {
                          cellBg = "bg-cyan-300"
                        } else if (schedule?.status === "M") {
                          cellBg = "bg-amber-300"
                        } else if (schedule?.status === "CT") {
                          cellBg = "bg-indigo-300"
                        }

                        return (
                          <td
                            key={`schedule-${date.toISOString()}`}
                            className={cn("border border-gray-300 p-1 text-center h-12 w-12 relative", cellBg)}
                            title={
                              hasEvents
                                ? `Events: ${getEventsForDate(date)
                                    .map((e) => e.title)
                                    .join(", ")}`
                                : schedule?.status === "working" && schedule?.time_in
                                  ? `Working: ${format(new Date(`2000-01-01T${schedule.time_in}`), "HH:mm")}`
                                  : schedule?.status
                                    ? `Status: ${schedule.status}`
                                    : "No schedule"
                            }
                          >
                            <div className="flex items-center justify-center h-full">
                              {!schedule ? (
                                <span className="text-xs text-gray-500 font-bold">0</span>
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
                                <span className="text-xs text-gray-500 font-bold">0</span>
                              )}
                            </div>
                            {hasEvents && (
                              <div className="absolute top-0 right-0">
                                <Star className="h-2 w-2 text-yellow-600" />
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Schedule Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="default" className="text-xs">
                Working
              </Badge>
              <span className="text-sm">Regular work day</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs">
                Leave
              </Badge>
              <span className="text-sm">Ordinary leave</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="destructive" className="text-xs">
                Sick
              </Badge>
              <span className="text-sm">Sick leave</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-primary/10 border-2 border-primary/30 rounded"></div>
              <span className="text-sm">Today</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                School
              </Badge>
              <span className="text-sm">School/Training</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-yellow-50 border-2 border-yellow-200 rounded flex items-center justify-center">
                <Star className="h-3 w-3 text-yellow-600" />
              </div>
              <span className="text-sm">Event Day</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
