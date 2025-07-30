"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useEmployees } from "@/hooks/use-employees"
import { useEvents } from "@/hooks/use-events"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Download,
  Plus,
  Save,
  Calendar,
  Users,
  Loader2,
  Copy,
  Clipboard,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Star,
  Edit,
  Trash2,
} from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  getDay,
  isToday,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
} from "date-fns"
import type { Schedule } from "@/services/schedule-service"
import { scheduleService } from "@/services/schedule-service"
import { EVENT_TYPES, type Event, type CreateEventData } from "@/services/event-service"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ExportDialog } from "./export-dialog"

interface EditingSchedule {
  employeeId: number
  employeeName: string
  date: string
  scheduleId?: number
  value: string
  status: string
}

interface CopiedWeek {
  employeeId: number
  employeeName: string
  startDate: string
  schedules: Schedule[]
}

interface EditingEvent {
  id?: number
  title: string
  description: string
  event_type: string
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  location: string
}

export function AdminSchedules() {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(false)
  const [generatingSchedules, setGeneratingSchedules] = useState(false)

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<EditingSchedule | null>(null)
  const [savingSchedule, setSavingSchedule] = useState(false)

  // Copy/Paste states
  const [copiedWeek, setCopiedWeek] = useState<CopiedWeek | null>(null)
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [showPasteModal, setShowPasteModal] = useState(false)
  const [copyingEmployeeId, setCopyingEmployeeId] = useState<number | null>(null)
  const [selectedCopyDate, setSelectedCopyDate] = useState<Date | undefined>(undefined)
  const [selectedPasteDates, setSelectedPasteDates] = useState<Date[]>([])
  const [pasting, setPasting] = useState(false)

  // Template generation states
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedTemplateDate, setSelectedTemplateDate] = useState<Date | undefined>(undefined)
  const [generatingWithTemplate, setGeneratingWithTemplate] = useState(false)

  // Event states
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EditingEvent | null>(null)
  const [savingEvent, setSavingEvent] = useState(false)
  const [showEventsPanel, setShowEventsPanel] = useState(false)

  const [showExportDialog, setShowExportDialog] = useState(false)

  const { employees, loading: employeesLoading } = useEmployees()

  // Filter out admin users and sort by today's start time
  const nonAdminEmployees = useMemo(() => {
    const filtered = employees.filter((employee) => employee.role !== "admin")
    const today = new Date()

    return filtered.sort((a, b) => {
      const scheduleA = allSchedules.find((s) => s.user_id === a.id && isSameDay(new Date(s.date), today))
      const scheduleB = allSchedules.find((s) => s.user_id === b.id && isSameDay(new Date(s.date), today))

      // Get start times, default to 24:00 for non-working statuses
      const getStartTime = (schedule: Schedule | undefined) => {
        if (!schedule || schedule.status !== "working" || !schedule.time_in) {
          return "24:00" // Sort non-working to end
        }
        return schedule.time_in
      }

      const timeA = getStartTime(scheduleA)
      const timeB = getStartTime(scheduleB)

      // Compare times, then by last name
      if (timeA !== timeB) {
        return timeA.localeCompare(timeB)
      }
      return a.last_name.localeCompare(b.last_name)
    })
  }, [employees, allSchedules])

  const {
    events,
    loading: eventsLoading,
    createEvent,
    updateEvent,
    deleteEvent,
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
    if (nonAdminEmployees.length === 0) return

    setLoading(true)
    try {
      const allEmployeeSchedules: Schedule[] = []

      for (const employee of nonAdminEmployees) {
        try {
          const schedules = await scheduleService.getAdminSchedules({
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
  }, [nonAdminEmployees, selectedMonth, toast])

  useEffect(() => {
    if (!employeesLoading && nonAdminEmployees.length > 0) {
      fetchAllSchedules()
    }
  }, [selectedMonth, nonAdminEmployees, employeesLoading, fetchAllSchedules])

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

  // Soft update local state after successful backend operation
  const updateLocalSchedule = (updatedSchedule: Schedule) => {
    setAllSchedules((prev) => {
      const existingIndex = prev.findIndex((s) => s.id === updatedSchedule.id)
      if (existingIndex >= 0) {
        // Update existing schedule
        const newSchedules = [...prev]
        newSchedules[existingIndex] = updatedSchedule
        return newSchedules
      } else {
        // Add new schedule
        return [...prev, updatedSchedule]
      }
    })
  }

  const handleCellClick = (employeeId: number, date: Date) => {
    if (loading || generatingSchedules) return

    const employee = nonAdminEmployees.find((e) => e.id === employeeId)
    if (!employee) return

    const schedule = getScheduleForEmployeeAndDate(employeeId, date)
    const dateString = format(date, "yyyy-MM-dd")

    setEditingSchedule({
      employeeId,
      employeeName: `${employee.first_name} ${employee.last_name}`,
      date: dateString,
      scheduleId: schedule?.id,
      value: schedule?.time_in ? format(new Date(`2000-01-01T${schedule.time_in}`), "HH:mm") : "08:00",
      status: schedule?.status || "working",
    })
    setShowEditModal(true)
  }

  const handleSaveSchedule = async () => {
    if (!editingSchedule) return

    setSavingSchedule(true)
    try {
      const updateData = {
        time_in: editingSchedule.status === "working" ? editingSchedule.value : null,
        status: editingSchedule.status as "working" | "C" | "SD" | "S" | "M",
      }

      let updatedSchedule: Schedule

      if (editingSchedule.scheduleId) {
        // Update existing schedule
        updatedSchedule = await scheduleService.updateSchedule(editingSchedule.scheduleId, updateData)
      } else {
        // Generate schedule for this employee first, then update
        await scheduleService.generateSchedules(
          editingSchedule.employeeId,
          selectedMonth.getMonth() + 1,
          selectedMonth.getFullYear(),
        )

        // Fetch the newly created schedule and update it
        const newSchedules = await scheduleService.getAdminSchedules({
          month: selectedMonth.getMonth() + 1,
          year: selectedMonth.getFullYear(),
          user_id: editingSchedule.employeeId,
        })
        const newSchedule = newSchedules.find((s) => s.date === editingSchedule.date)
        if (newSchedule) {
          updatedSchedule = await scheduleService.updateSchedule(newSchedule.id, updateData)
        } else {
          throw new Error("Failed to create schedule")
        }
      }

      // Soft update the UI
      updateLocalSchedule(updatedSchedule)
      setShowEditModal(false)
      setEditingSchedule(null)

      toast({
        title: "Success",
        description: "Schedule updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update schedule",
        variant: "destructive",
      })
    } finally {
      setSavingSchedule(false)
    }
  }

  // Event handling functions
  const handleCreateEvent = () => {
    setEditingEvent({
      title: "",
      description: "",
      event_type: "1",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: format(new Date(), "yyyy-MM-dd"),
      start_time: "09:00",
      end_time: "17:00",
      location: "",
    })
    setShowEventModal(true)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent({
      id: event.id,
      title: event.title,
      description: event.description || "",
      event_type: event.event_type,
      start_date: event.start_date,
      end_date: event.end_date,
      start_time: event.start_time || "09:00",
      end_time: event.end_time || "17:00",
      location: event.location || "",
    })
    setShowEventModal(true)
  }

  const handleSaveEvent = async () => {
    if (!editingEvent) return

    setSavingEvent(true)
    try {
      const eventData: CreateEventData = {
        title: editingEvent.title,
        description: editingEvent.description,
        event_type: editingEvent.event_type,
        start_date: editingEvent.start_date,
        end_date: editingEvent.end_date,
        start_time: editingEvent.start_time,
        end_time: editingEvent.end_time,
        location: editingEvent.location,
      }

      if (editingEvent.id) {
        await updateEvent(editingEvent.id, eventData)
      } else {
        await createEvent(eventData)
      }

      setShowEventModal(false)
      setEditingEvent(null)
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setSavingEvent(false)
    }
  }

  const handleDeleteEvent = async (eventId: number) => {
    if (confirm("Are you sure you want to delete this event?")) {
      await deleteEvent(eventId)
    }
  }

  // Fixed handleCopyWeek function to get all schedules from the week
  const handleCopyWeek = () => {
    if (!copyingEmployeeId || !selectedCopyDate) return

    const employee = nonAdminEmployees.find((e) => e.id === copyingEmployeeId)
    if (!employee) return

    const weekStart = startOfWeek(selectedCopyDate, { weekStartsOn: 1 }) // Monday start
    const weekEnd = endOfWeek(selectedCopyDate, { weekStartsOn: 1 }) // Sunday end

    // Get ALL schedules for this employee in the selected week (not just working ones)
    const selectedWeekSchedules = allSchedules.filter((schedule) => {
      if (schedule.user_id !== copyingEmployeeId) return false

      const scheduleDate = new Date(schedule.date)
      return scheduleDate >= weekStart && scheduleDate <= weekEnd
    })

    if (selectedWeekSchedules.length === 0) {
      toast({
        title: "No schedules to copy",
        description: "This week has no schedules to copy",
        variant: "destructive",
      })
      return
    }

    setCopiedWeek({
      employeeId: copyingEmployeeId,
      employeeName: `${employee.first_name} ${employee.last_name}`,
      startDate: format(weekStart, "yyyy-MM-dd"),
      schedules: selectedWeekSchedules,
    })

    toast({
      title: "Week copied",
      description: `Copied ${selectedWeekSchedules.length} schedule entries from ${employee.first_name} ${employee.last_name}'s week`,
    })
    setShowCopyModal(false)
  }

  // Update the handlePasteWeek function
  const handlePasteWeek = async () => {
    if (!copiedWeek || selectedPasteDates.length === 0) return

    setPasting(true)
    try {
      // Convert selected dates to Monday-based week starts
      const weekStarts = selectedPasteDates.map((date) => format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd"))
      // Remove duplicates
      const uniqueWeekStarts = [...new Set(weekStarts)]

      await scheduleService.copyWeekPattern({
        user_id: copiedWeek.employeeId,
        source_week_start: copiedWeek.startDate,
        target_weeks: uniqueWeekStarts,
      })

      // Soft refresh - only fetch schedules for the affected employee
      const updatedSchedules = await scheduleService.getAdminSchedules({
        month: selectedMonth.getMonth() + 1,
        year: selectedMonth.getFullYear(),
        user_id: copiedWeek.employeeId,
      })

      // Update local state
      setAllSchedules((prev) => {
        const filtered = prev.filter((s) => s.user_id !== copiedWeek.employeeId)
        return [...filtered, ...updatedSchedules]
      })

      setSelectedPasteDates([])
      setShowPasteModal(false)

      toast({
        title: "Success",
        description: `Pasted schedule pattern to ${uniqueWeekStarts.length} weeks for ${copiedWeek.employeeName}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to paste schedule pattern",
        variant: "destructive",
      })
    } finally {
      setPasting(false)
    }
  }

  // Add new function for template-based generation
  const handleGenerateWithTemplate = async () => {
    if (!selectedTemplateDate) return

    setGeneratingWithTemplate(true)
    try {
      const templateWeekStart = startOfWeek(selectedTemplateDate, { weekStartsOn: 1 })

      await scheduleService.generateSchedulesWithTemplate({
        template_week_start: format(templateWeekStart, "yyyy-MM-dd"),
        month: selectedMonth.getMonth() + 1,
        year: selectedMonth.getFullYear(),
        employee_ids: nonAdminEmployees.map((e) => e.id),
      })

      await fetchAllSchedules()
      setShowTemplateModal(false)
      setSelectedTemplateDate(undefined)

      toast({
        title: "Success",
        description: "Schedules generated with template for all employees",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate schedules with template",
        variant: "destructive",
      })
    } finally {
      setGeneratingWithTemplate(false)
    }
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

    // Add this new case for CT (Court)
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

  const generateSchedulesForAll = async () => {
    setGeneratingSchedules(true)
    try {
      for (const employee of nonAdminEmployees) {
        await scheduleService.generateSchedules(employee.id, selectedMonth.getMonth() + 1, selectedMonth.getFullYear())
      }
      await fetchAllSchedules()
      toast({
        title: "Success",
        description: "Schedules generated for all employees",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate schedules",
        variant: "destructive",
      })
    } finally {
      setGeneratingSchedules(false)
    }
  }

  const handleExportClick = () => {
    setShowExportDialog(true)
  }

  const handleOpenCopyModal = (employeeId: number) => {
    setCopyingEmployeeId(employeeId)
    setSelectedCopyDate(undefined)
    setShowCopyModal(true)
  }

  if (employeesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
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
            <h1 className="text-2xl font-bold tracking-tight text-primary">Schedule Management</h1>
            <p className="text-muted-foreground">Manage employee schedules for {format(selectedMonth, "MMMM yyyy")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 border-primary/20">
              <Users className="h-3 w-3" />
              {nonAdminEmployees.length} Employees
            </Badge>
            <Badge variant="outline" className="gap-1 border-yellow-300">
              <Star className="h-3 w-3" />
              {events.length} Events
            </Badge>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-primary/5 p-4 rounded-lg border border-primary/10">
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

          {/* Update the controls section to include event management */}
          <div className="flex gap-2">
            <Button onClick={handleCreateEvent} variant="outline" size="sm" className="gap-2 bg-transparent">
              <Star className="h-4 w-4" />
              Add Event
            </Button>
            <Button
              onClick={() => setShowEventsPanel(!showEventsPanel)}
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
            >
              <Calendar className="h-4 w-4" />
              {showEventsPanel ? "Hide Events" : "Show Events"}
            </Button>
            <Button
              onClick={() => setShowTemplateModal(true)}
              disabled={loading || generatingSchedules}
              size="sm"
              className="gap-2"
            >
              {generatingSchedules ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Generate with Template
            </Button>
            <Button
              onClick={generateSchedulesForAll}
              disabled={loading || generatingSchedules}
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
            >
              <Plus className="h-4 w-4" />
              Generate Basic
            </Button>
            {copiedWeek && (
              <Button
                onClick={() => setShowPasteModal(true)}
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                <Clipboard className="h-4 w-4" />
                Paste Week
              </Button>
            )}
            <Button onClick={handleExportClick} variant="outline" size="sm" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Events Panel */}
        {showEventsPanel && (
          <Card className="border-yellow-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                Events for {format(selectedMonth, "MMMM yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : events.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No events scheduled for this month</p>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {EVENT_TYPES[event.event_type as keyof typeof EVENT_TYPES]}
                          </Badge>
                          <h4 className="font-semibold">{event.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(event.start_date), "MMM d")} -{" "}
                          {format(new Date(event.end_date), "MMM d, yyyy")}
                          {event.start_time && event.end_time && (
                            <span className="ml-2">
                              {event.start_time} - {event.end_time}
                            </span>
                          )}
                        </p>
                        {event.location && <p className="text-sm text-muted-foreground">📍 {event.location}</p>}
                        {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEditEvent(event)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteEvent(event.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Event Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEvent?.id ? "Edit Event" : "Create New Event"}</DialogTitle>
            <DialogDescription>
              {editingEvent?.id ? "Update event details" : "Create a new event for the schedule"}
            </DialogDescription>
          </DialogHeader>
          {editingEvent && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-title">Event Title</Label>
                <Input
                  id="event-title"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  placeholder="Enter event title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-type">Event Type</Label>
                <Select
                  value={editingEvent.event_type}
                  onValueChange={(value) => setEditingEvent({ ...editingEvent, event_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EVENT_TYPES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {key} - {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={editingEvent.start_date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={editingEvent.end_date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={editingEvent.start_time}
                    onChange={(e) => setEditingEvent({ ...editingEvent, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={editingEvent.end_time}
                    onChange={(e) => setEditingEvent({ ...editingEvent, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editingEvent.location}
                  onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                  placeholder="Enter event location"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  placeholder="Enter event description"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventModal(false)} disabled={savingEvent}>
              Cancel
            </Button>
            <Button onClick={handleSaveEvent} disabled={savingEvent || !editingEvent?.title}>
              {savingEvent ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {editingEvent?.id ? "Update Event" : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>
              Update schedule for {editingSchedule?.employeeName} on{" "}
              {editingSchedule?.date && format(new Date(editingSchedule.date), "EEEE, MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>
          {editingSchedule && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editingSchedule.status}
                  onValueChange={(value) => setEditingSchedule({ ...editingSchedule, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="working">Working</SelectItem>
                    <SelectItem value="C">Ordinary Leave (C)</SelectItem>
                    <SelectItem value="SD">Sick Leave (SD)</SelectItem>
                    <SelectItem value="S">School/Training (S)</SelectItem>
                    <SelectItem value="M">Military (M)</SelectItem>
                    <SelectItem value="CT">Court (CT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingSchedule.status === "working" && (
                <div className="space-y-2">
                  <Label htmlFor="time">Start Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={editingSchedule.value}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, value: e.target.value })}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={savingSchedule}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule} disabled={savingSchedule}>
              {savingSchedule ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Copy Week Modal */}
      <Dialog open={showCopyModal} onOpenChange={setShowCopyModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Copy Week Pattern</DialogTitle>
            <DialogDescription>
              Select a date to copy the entire week's schedule pattern from{" "}
              {copyingEmployeeId && nonAdminEmployees.find((e) => e.id === copyingEmployeeId)?.first_name}{" "}
              {copyingEmployeeId && nonAdminEmployees.find((e) => e.id === copyingEmployeeId)?.last_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select any date from the week you want to copy:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedCopyDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {selectedCopyDate ? format(selectedCopyDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedCopyDate}
                    onSelect={setSelectedCopyDate}
                    month={selectedMonth}
                    onMonthChange={setSelectedMonth}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {selectedCopyDate && (
                <p className="text-sm text-muted-foreground">
                  Week of {format(startOfWeek(selectedCopyDate, { weekStartsOn: 1 }), "MMM d")} -{" "}
                  {format(endOfWeek(selectedCopyDate, { weekStartsOn: 1 }), "MMM d, yyyy")} (Mon-Sun)
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCopyModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCopyWeek} disabled={!selectedCopyDate}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Week
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Paste Week Modal */}
      <Dialog open={showPasteModal} onOpenChange={setShowPasteModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Paste Week Pattern</DialogTitle>
            <DialogDescription>
              Select dates where you want to paste the copied schedule pattern. You can select multiple dates from
              different weeks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {copiedWeek && (
              <div className="p-3 bg-primary/5 rounded-lg">
                <p className="text-sm font-medium">Copied from:</p>
                <p className="text-sm text-muted-foreground">
                  {copiedWeek.employeeName} - Week of {format(new Date(copiedWeek.startDate), "MMM d, yyyy")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{copiedWeek.schedules.length} schedule entries</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Select target dates (any date from weeks you want to paste to):</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {selectedPasteDates.length > 0 ? `${selectedPasteDates.length} dates selected` : "Select dates"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="multiple"
                    selected={selectedPasteDates}
                    onSelect={(dates) => setSelectedPasteDates(dates || [])}
                    month={selectedMonth}
                    onMonthChange={setSelectedMonth}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {selectedPasteDates.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Selected weeks:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {[
                      ...new Set(
                        selectedPasteDates.map((date) => format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd")),
                      ),
                    ].map((weekStart) => (
                      <div key={weekStart} className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                        Week of {format(new Date(weekStart), "MMM d")} -{" "}
                        {format(endOfWeek(new Date(weekStart), { weekStartsOn: 1 }), "MMM d, yyyy")} (Mon-Sun)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasteModal(false)} disabled={pasting}>
              Cancel
            </Button>
            <Button onClick={handlePasteWeek} disabled={selectedPasteDates.length === 0 || pasting}>
              {pasting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Clipboard className="h-4 w-4 mr-2" />}
              Paste to{" "}
              {
                [
                  ...new Set(
                    selectedPasteDates.map((date) => format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd")),
                  ),
                ].length
              }{" "}
              weeks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Generation Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Schedules with Template</DialogTitle>
            <DialogDescription>
              Select a week to use as a template. This will copy the schedule pattern to all weeks in{" "}
              {format(selectedMonth, "MMMM yyyy")} for all employees.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select template week (any date from the week):</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedTemplateDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {selectedTemplateDate ? format(selectedTemplateDate, "PPP") : "Pick a template date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedTemplateDate}
                    onSelect={setSelectedTemplateDate}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {selectedTemplateDate && (
                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="text-sm font-medium">Template Week:</p>
                  <p className="text-sm text-muted-foreground">
                    {format(startOfWeek(selectedTemplateDate, { weekStartsOn: 1 }), "MMM d")} -{" "}
                    {format(endOfWeek(selectedTemplateDate, { weekStartsOn: 1 }), "MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This pattern will be applied to all weeks in {format(selectedMonth, "MMMM yyyy")}
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateModal(false)} disabled={generatingWithTemplate}>
              Cancel
            </Button>
            <Button onClick={handleGenerateWithTemplate} disabled={!selectedTemplateDate || generatingWithTemplate}>
              {generatingWithTemplate ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Generate for All Employees
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Grid */}
      <Card className="border-primary/10 w-full">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Schedule Grid</CardTitle>
          <CardDescription>
            Click on any cell to edit schedule. Click the copy button next to employee names to copy week patterns.
            Times are displayed in 24-hour format. Yellow highlighted cells indicate event days.
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
                    {nonAdminEmployees.map((employee, index) => (
                      <tr
                        key={employee.id}
                        className={cn(
                          "hover:bg-gray-50 transition-colors",
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50",
                        )}
                      >
                        <td className="border border-gray-300 p-2 bg-gray-100 font-bold text-sm sticky left-0 z-10">
                          <div className="flex items-center justify-between group">
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-sm truncate uppercase">{employee.last_name}</div>
                              {employee.first_name && (
                                <div className="text-xs text-gray-600 truncate">{employee.first_name}</div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                              onClick={() => handleOpenCopyModal(employee.id)}
                              title="Copy week pattern"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
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
                              className={cn(
                                "border border-gray-300 p-1 text-center cursor-pointer hover:bg-gray-200 transition-colors h-12 w-12",
                                cellBg,
                              )}
                              onClick={() => handleCellClick(employee.id, date)}
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
            <div className="flex items-center gap-3">
              <Copy className="h-4 w-4 text-primary" />
              <span className="text-sm">Click copy button</span>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Export Dialog */}
      <ExportDialog open={showExportDialog} onOpenChange={setShowExportDialog} currentMonth={selectedMonth} />
    </div>
  )
}
