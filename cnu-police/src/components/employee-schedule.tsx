"use client"

import { useState } from "react"
import { useSchedules } from "@/hooks/use-schedules"
import { useEvents } from "@/hooks/use-events"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Shield,
  Star,
  MapPin,
  Info,
} from "lucide-react"
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
import { EVENT_TYPES, type Event } from "@/services/event-service"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function EmployeeSchedule() {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)

  const { schedules, loading } = useSchedules({
    month: selectedMonth.getMonth() + 1,
    year: selectedMonth.getFullYear(),
  })

  const { events, loading: eventsLoading } = useEvents({
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

  const getEventsForDate = (date: Date): Event[] => {
    return events.filter((event) => {
      const eventStart = new Date(event.start_date)
      const eventEnd = new Date(event.end_date)
      return date >= eventStart && date <= eventEnd
    })
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setShowEventModal(true)
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
              <div className="text-xs font-mono text-foreground font-semibold">
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
      case "S":
        return (
          <Badge variant="outline" className="text-xs font-medium bg-green-100 text-green-700 border-green-300">
            School
          </Badge>
        )
      case "M":
        return (
          <Badge variant="outline" className="text-xs font-medium bg-purple-100 text-purple-700 border-purple-300">
            Military
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

  const getEventBadge = (event: Event) => {
    const eventType = EVENT_TYPES[event.event_type as keyof typeof EVENT_TYPES]
    const colors = {
      "1": "bg-blue-100 text-blue-700 border-blue-300", // Ferguson/Arts
      "2": "bg-green-100 text-green-700 border-green-300", // Freeman Center
      "3": "bg-purple-100 text-purple-700 border-purple-300", // Dance/Concert
      "4": "bg-orange-100 text-orange-700 border-orange-300", // CNU Athletics
      "5": "bg-red-100 text-red-700 border-red-300", // Commencement
      "6": "bg-gray-100 text-gray-700 border-gray-300", // Meeting
      "7": "bg-yellow-100 text-yellow-700 border-yellow-300", // Special Event
      "8": "bg-pink-100 text-pink-700 border-pink-300", // Yoder Barn
    }

    return (
      <Badge
        variant="outline"
        className={cn(
          "text-xs font-medium cursor-pointer hover:opacity-80",
          colors[event.event_type as keyof typeof colors],
        )}
        onClick={() => handleEventClick(event)}
      >
        <Star className="h-2 w-2 mr-1" />
        {event.event_type}
      </Badge>
    )
  }

  const getDayBackground = (date: Date, schedule: any, dayEvents: Event[]) => {
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

  // Statistics
  const currentMonthSchedules = schedules.filter((s) => isSameMonth(new Date(s.date), selectedMonth))
  const workingDays = currentMonthSchedules.filter((s) => s.status === "working").length
  const leaveDays = currentMonthSchedules.filter((s) => s.status === "C").length
  const sickDays = currentMonthSchedules.filter((s) => s.status === "SD").length
  const schoolDays = currentMonthSchedules.filter((s) => s.status === "S").length
  const militaryDays = currentMonthSchedules.filter((s) => s.status === "M").length
  const totalEvents = events.length

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            My Schedule
          </h2>
          <p className="text-muted-foreground">View your work schedule, leave days, and upcoming events</p>
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
      {(currentMonthSchedules.length > 0 || totalEvents > 0) && (
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

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">School/Training Days</p>
                  <p className="text-2xl font-bold">{schoolDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Military Days</p>
                  <p className="text-2xl font-bold">{militaryDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Events This Month</p>
                  <p className="text-2xl font-bold text-yellow-600">{totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Events List */}
      {events.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Upcoming Events - {format(selectedMonth, "MMMM yyyy")}
            </CardTitle>
            <CardDescription>Events and activities scheduled for this month</CardDescription>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-lg">
                      <Star className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {EVENT_TYPES[event.event_type as keyof typeof EVENT_TYPES]}
                        </Badge>
                        <h4 className="font-semibold truncate">{event.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.start_date), "MMM d")} -{" "}
                        {format(new Date(event.end_date), "MMM d, yyyy")}
                        {event.start_time && event.end_time && (
                          <span className="ml-2">
                            {event.start_time} - {event.end_time}
                          </span>
                        )}
                      </p>
                      {event.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                      )}
                    </div>
                    <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                School
              </Badge>
              <span className="text-sm">School/Training</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                Military
              </Badge>
              <span className="text-sm">Military</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-yellow-50 border-2 border-yellow-200 rounded flex items-center justify-center">
                <Star className="h-3 w-3 text-yellow-600" />
              </div>
              <span className="text-sm">Event Day</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                <Star className="h-2 w-2 mr-1" />1
              </Badge>
              <span className="text-sm">Event Badge</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{format(selectedMonth, "MMMM yyyy")}</CardTitle>
          <CardDescription>
            Your complete schedule for the month. Times are shown in 24-hour format. Yellow highlighted cells indicate
            event days. Click on event badges for details.
          </CardDescription>
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
                  const dayEvents = getEventsForDate(date)
                  const isTodayDate = isToday(date)
                  const isCurrentMonth = isSameMonth(date, selectedMonth)

                  return (
                    <div
                      key={date.toISOString()}
                      className={cn(
                        "min-h-[120px] p-2 transition-all duration-200 rounded-lg",
                        getDayBackground(date, schedule, dayEvents),
                        "flex flex-col",
                      )}
                    >
                      {/* Date Number */}
                      <div
                        className={cn(
                          "text-sm font-medium mb-2 flex items-center justify-between",
                          isTodayDate ? "font-bold" : "",
                          !isCurrentMonth ? "text-muted-foreground" : "",
                        )}
                      >
                        <span>{format(date, "d")}</span>
                        {dayEvents.length > 0 && isCurrentMonth && <Star className="h-3 w-3 text-yellow-600" />}
                      </div>

                      {/* Schedule Content */}
                      {schedule && isCurrentMonth && (
                        <div className="mb-2">{getStatusBadge(schedule.status, schedule.time_in)}</div>
                      )}

                      {/* Events */}
                      {dayEvents.length > 0 && isCurrentMonth && (
                        <div className="space-y-1 flex-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div key={event.id} className="w-full">
                              {getEventBadge(event)}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-gray-100 text-gray-600 cursor-pointer"
                              onClick={() => {
                                setSelectedEvent(dayEvents[2])
                                setShowEventModal(true)
                              }}
                            >
                              +{dayEvents.length - 2} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Weekend indicator */}
                      {isWeekend(date) && isCurrentMonth && !schedule && dayEvents.length === 0 && (
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

      {/* Event Details Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Event Details
            </DialogTitle>
            <DialogDescription>Information about the selected event</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                <Badge variant="outline" className="mt-1">
                  {EVENT_TYPES[selectedEvent.event_type as keyof typeof EVENT_TYPES]}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(selectedEvent.start_date), "EEEE, MMMM d, yyyy")}
                    {selectedEvent.start_date !== selectedEvent.end_date && (
                      <span> - {format(new Date(selectedEvent.end_date), "EEEE, MMMM d, yyyy")}</span>
                    )}
                  </span>
                </div>

                {selectedEvent.start_time && selectedEvent.end_time && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {selectedEvent.start_time} - {selectedEvent.end_time}
                    </span>
                  </div>
                )}

                {selectedEvent.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
              </div>

              {selectedEvent.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                </div>
              )}

              {selectedEvent.creator && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Created by {selectedEvent.creator.name}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
