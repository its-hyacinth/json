"use client"

import { useState } from "react"
import { useSchedules } from "@/hooks/use-schedules"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"

export function EmployeeSchedule() {
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  const { schedules, loading } = useSchedules({
    month: selectedMonth.getMonth() + 1,
    year: selectedMonth.getFullYear(),
  })

  const monthDays = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth),
  })

  const getScheduleForDate = (date: Date) => {
    return schedules.find((schedule) => isSameDay(new Date(schedule.date), date))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "working":
        return <Badge variant="default">Working</Badge>
      case "C":
        return <Badge variant="secondary">Leave</Badge>
      case "SD":
        return <Badge variant="destructive">Sick Leave</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <div>
          <Label htmlFor="month">Select Month</Label>
          <Input
            id="month"
            type="month"
            value={format(selectedMonth, "yyyy-MM")}
            onChange={(e) => setSelectedMonth(new Date(e.target.value))}
            className="w-40"
          />
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Schedule Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="default">Working</Badge>
              <span>Regular work day</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">C</Badge>
              <span>Ordinary Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">SD</Badge>
              <span>Sick Leave</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>My Schedule - {format(selectedMonth, "MMMM yyyy")}</CardTitle>
          <CardDescription>View your work schedule and leave days</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading your schedule...</div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {/* Header */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center font-medium text-sm bg-muted rounded">
                  {day}
                </div>
              ))}

              {/* Days */}
              {monthDays.map((date) => {
                const schedule = getScheduleForDate(date)
                const isToday = isSameDay(date, new Date())

                return (
                  <div
                    key={date.toISOString()}
                    className={`p-2 border rounded min-h-[80px] ${isToday ? "bg-blue-50 border-blue-200" : ""}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : ""}`}>
                      {format(date, "d")}
                    </div>
                    {schedule && (
                      <div className="space-y-1">
                        {schedule.time_in && schedule.status === "working" && (
                          <div className="text-xs font-mono">
                            {format(new Date(`2000-01-01T${schedule.time_in}`), "HH:mm")}
                          </div>
                        )}
                        {getStatusBadge(schedule.status)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
