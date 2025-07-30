"use client"

import { useState } from "react"
import { useSchedules } from "@/hooks/use-schedules"
import { useEvents } from "@/hooks/use-events"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight, Star, MapPin } from "lucide-react"
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
} from "date-fns"
import { cn } from "@/lib/utils"
import { EVENT_TYPES } from "@/services/event-service"

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
    const dateOnly = new Date(date.setHours(0, 0, 0, 0));
    return events.filter((event) => {
      const eventStart = new Date(event.start_date);
      eventStart.setHours(0, 0, 0, 0);
      const eventEnd = new Date(event.end_date);
      eventEnd.setHours(23, 59, 59, 999); 
      return dateOnly >= eventStart && dateOnly <= eventEnd;
    });
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

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{format(selectedMonth, "MMMM yyyy")}</CardTitle>
          <CardDescription>
            Your schedule overview. Yellow highlighted cells indicate event days.
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
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1">
                {/* Day Headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-2 text-center font-semibold text-sm bg-muted rounded-t-lg">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {calendarDays.map((date) => {
                  const schedule = getScheduleForDate(date)
                  const dayEvents = getEventsForDate(date)
                  const isTodayDate = isToday(date)
                  const isCurrentMonth = isSameMonth(date, selectedMonth)

                  return (
                    <div
                      key={date.toISOString()}
                      className={cn(
                        "min-h-[100px] p-2 rounded-lg",
                        getDayBackground(date, schedule, dayEvents),
                        "flex flex-col",
                      )}
                    >
                      {/* Date Number */}
                      <div
                        className={cn(
                          "text-sm font-medium mb-1",
                          isTodayDate ? "font-bold" : "",
                          !isCurrentMonth ? "text-muted-foreground" : "",
                        )}
                      >
                        {format(date, "d")}
                        {dayEvents.length > 0 && isCurrentMonth && (
                          <Star className="h-3 w-3 text-yellow-600 inline-block ml-1" />
                        )}
                      </div>

                      {/* Schedule Content */}
                      {schedule && isCurrentMonth && (
                        <div className="mb-1">{getStatusBadge(schedule.status)}</div>
                      )}

                      {/* Events */}
                      {dayEvents.length > 0 && isCurrentMonth && (
                        <div className="mt-auto">
                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                            {dayEvents.length} event{dayEvents.length > 1 ? "s" : ""}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )
                })}
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