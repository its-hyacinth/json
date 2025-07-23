"use client"

import { useState, useEffect } from "react"
import { useEmployees } from "@/hooks/use-employees"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
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
  RefreshCw,
  Calendar,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Copy,
  Clipboard,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
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

  // Add new state for template generation
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedTemplateDate, setSelectedTemplateDate] = useState<Date | undefined>(undefined)
  const [generatingWithTemplate, setGeneratingWithTemplate] = useState(false)

  const [showExportDialog, setShowExportDialog] = useState(false)

  const { employees, loading: employeesLoading } = useEmployees()
  const { toast } = useToast()

  const monthDays = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth),
  })

  // Statistics
  const totalSchedules = allSchedules.length
  const workingDays = allSchedules.filter((s) => s.status === "working").length
  const leaveDays = allSchedules.filter((s) => s.status === "C").length
  const sickDays = allSchedules.filter((s) => s.status === "SD").length

  // Fetch schedules for all employees
  const fetchAllSchedules = async () => {
    if (employees.length === 0) return

    setLoading(true)
    try {
      const allEmployeeSchedules: Schedule[] = []

      for (const employee of employees) {
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
  }

  useEffect(() => {
    if (!employeesLoading && employees.length > 0) {
      fetchAllSchedules()
    }
  }, [selectedMonth, employees, employeesLoading])

  const getScheduleForEmployeeAndDate = (employeeId: number, date: Date): Schedule | undefined => {
    return allSchedules.find((schedule) => schedule.user_id === employeeId && isSameDay(new Date(schedule.date), date))
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

    const employee = employees.find((e) => e.id === employeeId)
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
        status: editingSchedule.status as "working" | "C" | "SD",
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

  // Fixed handleCopyWeek function to get all schedules from the week
  const handleCopyWeek = () => {
    if (!copyingEmployeeId || !selectedCopyDate) return

    const employee = employees.find((e) => e.id === copyingEmployeeId)
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
        employee_ids: employees.map((e) => e.id),
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
            className="text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
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
            className="text-xs font-bold bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900 dark:text-red-300"
          >
            SD
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

    if (isTodayDate) {
      return "bg-primary/10 border-primary/30"
    }

    if (isWeekend) {
      return "bg-muted/30"
    }

    return employeeIndex % 2 === 0 ? "bg-background" : "bg-muted/10"
  }

  const generateSchedulesForAll = async () => {
    setGeneratingSchedules(true)
    try {
      for (const employee of employees) {
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
              {employees.length} Employees
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

          {/* Update the controls section to include template generation */}
          <div className="flex gap-2">
            <Button
              onClick={fetchAllSchedules}
              disabled={loading || generatingSchedules}
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
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

        {/* Statistics */}
        {totalSchedules > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 border-primary/10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Working Days</p>
                  <p className="text-2xl font-bold text-primary">{workingDays}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 border-blue-200">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Leave Days</p>
                  <p className="text-2xl font-bold text-blue-600">{leaveDays}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 border-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Sick Days</p>
                  <p className="text-2xl font-bold text-red-600">{sickDays}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 border-purple-200">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Total Entries</p>
                  <p className="text-2xl font-bold text-purple-600">{totalSchedules}</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Legend */}
      <Card className="border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            Schedule Legend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-6 bg-background border-2 border-primary/20 rounded flex items-center justify-center text-xs font-mono font-semibold">
                08:00
              </div>
              <span className="text-sm">Working Time</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
              >
                C
              </Badge>
              <span className="text-sm">Ordinary Leave</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="destructive"
                className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900 dark:text-red-300"
              >
                SD
              </Badge>
              <span className="text-sm">Sick Leave</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-6 bg-primary/10 border-2 border-primary/30 rounded"></div>
              <span className="text-sm">Today</span>
            </div>
            <div className="flex items-center gap-3">
              <Copy className="h-4 w-4 text-primary" />
              <span className="text-sm">Click copy button to select week</span>
            </div>
          </div>
        </CardContent>
      </Card>

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
              {copyingEmployeeId && employees.find((e) => e.id === copyingEmployeeId)?.first_name}{" "}
              {copyingEmployeeId && employees.find((e) => e.id === copyingEmployeeId)?.last_name}.
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
              {/* Update the week display in copy modal to show Monday-Sunday */}
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
                    {/* Update the paste modal week display */}
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
            Times are displayed in 24-hour format.
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
            <div className="w-[70vw] ml-10">
              <div className="overflow-x-auto">
                <div className="min-w-max border-t">
                  {/* Header Row */}
                  <div
                    className="grid gap-0 bg-primary/5 border-b-2 border-primary/20"
                    style={{ gridTemplateColumns: `200px repeat(${monthDays.length}, 56px)` }}
                  >
                    <div className="p-3 text-sm font-semibold text-center border-r border-primary/20 bg-primary/10">
                      EMPLOYEE
                    </div>
                    {monthDays.map((date) => (
                      <div
                        key={date.toISOString()}
                        className={cn(
                          "p-2 text-xs font-semibold text-center border-r border-primary/10 last:border-r-0",
                          isToday(date) ? "bg-primary/20 text-primary" : "bg-primary/5",
                        )}
                      >
                        <div className="font-bold">{format(date, "d")}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">{format(date, "EEE")}</div>
                      </div>
                    ))}
                  </div>

                  {/* Employee Rows */}
                  {employees.map((employee, index) => (
                    <div
                      key={employee.id}
                      className="grid gap-0 border-b last:border-b-0 hover:bg-primary/5 transition-colors"
                      style={{ gridTemplateColumns: `200px repeat(${monthDays.length}, 56px)` }}
                    >
                      <div className="p-3 border-r border-primary/10 bg-primary/5 flex items-center justify-between group">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm truncate">
                            {employee.first_name} {employee.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground">{employee.badge_number}</div>
                          {employee.division && (
                            <div className="text-xs text-muted-foreground truncate">{employee.division}</div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8"
                          onClick={() => handleOpenCopyModal(employee.id)}
                          title="Copy week pattern"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      {monthDays.map((date) => (
                        <div
                          key={`${employee.id}-${date.toISOString()}`}
                          className={cn(
                            "border-r border-primary/10 last:border-r-0 cursor-pointer hover:bg-primary/10 min-h-[70px] flex items-center justify-center relative transition-all duration-200",
                            getCellBackground(date, index),
                          )}
                          onClick={() => handleCellClick(employee.id, date)}
                        >
                          {getCellContent(employee.id, date)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Export Dialog */}
      <ExportDialog open={showExportDialog} onOpenChange={setShowExportDialog} currentMonth={selectedMonth} />
    </div>
  )
}
