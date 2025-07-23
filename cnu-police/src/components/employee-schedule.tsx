"use client"

import { useState } from "react"
import { useSchedules } from "@/hooks/use-schedules"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, ChevronLeft, ChevronRight } from "lucide-react"
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

export function EmployeeSchedule() {
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  const { schedules, loading } = useSchedules({
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

  const getStatusBadge = (status: string, timeIn?: string) => {
    switch (status) {
      case "working":
        return (
          <div className="space-y-1">
            <Badge variant="default" className="text-xs">
              Working
            </Badge>
            {timeIn && (
              <div className="text-sm font-mono text-foreground font-semibold"> {/* Changed from text-xs to text-sm */}
                {format(new Date(`2000-01-01T${timeIn}`), "HH:mm")}
              </div>
            )}
          </div>
        )
      case "C":
        return (
          <Badge variant="secondary" className="text-xs font-medium">
            Leave
          </Badge>
        )
      case "SD":
        return (
          <Badge variant="destructive" className="text-xs font-medium">
            Sick
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

  const getDayBackground = (date: Date, schedule: any) => {
    const isTodayDate = isToday(date)
    const isCurrentMonth = isSameMonth(date, selectedMonth)
    const isWeekendDay = isWeekend(date)

    if (!isCurrentMonth) {
      return "bg-muted/30 text-muted-foreground"
    }

    if (isTodayDate) {
      return "bg-primary/10 border-primary/30 border-2"
    }

    if (isWeekendDay) {
      return "bg-muted/50"
    }

    return "bg-background border hover:bg-muted/30 transition-colors"
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setSelectedMonth(direction === "prev" ? subMonths(selectedMonth, 1) : addMonths(selectedMonth, 1))
  }

  // Statistics
  const currentMonthSchedules = schedules.filter((s) => isSameMonth(new Date(s.date), selectedMonth))
  const workingDays = currentMonthSchedules.filter((s) => s.status === "working").length
  const leaveDays = currentMonthSchedules.filter((s) => s.status === "C").length
  const sickDays = currentMonthSchedules.filter((s) => s.status === "SD").length

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            My Schedule
          </h2>
          <p className="text-muted-foreground">View your work schedule and leave days</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")} className="bg-transparent">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <Label htmlFor="month" className="sr-only">
              Select Month
            </Label>
            <Input
              id="month"
              type="month"
              value={format(selectedMonth, "yyyy-MM")}
              onChange={(e) => setSelectedMonth(new Date(e.target.value))}
              className="w-40"
            />
          </div>

          <Button variant="outline" size="sm" onClick={() => navigateMonth("next")} className="bg-transparent">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {currentMonthSchedules.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Working Days</p>
                  <p className="text-2xl font-bold">{workingDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Leave Days</p>
                  <p className="text-2xl font-bold">{leaveDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sick Days</p>
                  <p className="text-2xl font-bold">{sickDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Schedule Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{format(selectedMonth, "MMMM yyyy")}</CardTitle>
          <CardDescription>Your complete schedule for the month. Times are shown in 24-hour format.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Loading your schedule...</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1">
                {/* Day Headers */}
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                  <div key={day} className="p-3 text-center font-semibold text-sm bg-muted rounded-t-lg">
                    <div className="hidden sm:block">{day}</div>
                    <div className="sm:hidden">{day.slice(0, 3)}</div>
                  </div>
                ))}

                {/* Calendar Days */}
                {calendarDays.map((date) => {
                  const schedule = getScheduleForDate(date)
                  const isTodayDate = isToday(date)
                  const isCurrentMonth = isSameMonth(date, selectedMonth)

                  return (
                    <div
                      key={date.toISOString()}
                      className={cn(
                        "min-h-[100px] p-2 transition-all duration-200 rounded-lg",
                        getDayBackground(date, schedule),
                        "flex flex-col",
                      )}
                    >
                      {/* Date Number */}
                      <div
                        className={cn(
                          "text-sm font-medium mb-2",
                          isTodayDate ? "font-bold" : "",
                          !isCurrentMonth ? "text-muted-foreground" : "",
                        )}
                      >
                        {format(date, "d")}
                      </div>

                      {/* Schedule Content */}
                      {schedule && isCurrentMonth && (
                        <div className="flex-1 flex flex-col justify-center items-center space-y-1">
                          {getStatusBadge(schedule.status, schedule.time_in)}
                        </div>
                      )}

                      {/* Weekend indicator */}
                      {isWeekend(date) && isCurrentMonth && !schedule && (
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">Weekend</span>
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
    </div>
  )
}