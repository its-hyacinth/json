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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Download,
  Plus,
  Save,
  X,
  RefreshCw,
  Calendar,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Copy,
  Clipboard,
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
  addWeeks,
} from "date-fns"
import type { Schedule } from "@/services/schedule-service"
import { scheduleService } from "@/services/schedule-service"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface EditingCell {
  employeeId: number
  date: string
  value: string
  status: string
}

interface CopiedWeek {
  employeeId: number
  startDate: string
  schedules: Schedule[]
}

export function AdminSchedules() {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(false)
  const [generatingSchedules, setGeneratingSchedules] = useState(false)
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [savingCell, setSavingCell] = useState(false)
  const [copiedWeek, setCopiedWeek] = useState<CopiedWeek | null>(null)
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([])
  const [showPasteDialog, setShowPasteDialog] = useState(false)
  const [pasting, setPasting] = useState(false)
  const { employees, loading: employeesLoading } = useEmployees()
  const { toast } = useToast()

  const monthDays = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth),
  })

  // Get all weeks in the month
  const monthWeeks = []
  let currentWeek = startOfWeek(startOfMonth(selectedMonth))
  const monthEnd = endOfMonth(selectedMonth)

  while (currentWeek <= monthEnd) {
    monthWeeks.push(currentWeek)
    currentWeek = addWeeks(currentWeek, 1)
  }

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

  const handleCellClick = (employeeId: number, date: Date) => {
    if (loading || generatingSchedules) return

    const schedule = getScheduleForEmployeeAndDate(employeeId, date)
    const dateString = format(date, "yyyy-MM-dd")

    setEditingCell({
      employeeId,
      date: dateString,
      value: schedule?.time_in ? format(new Date(`2000-01-01T${schedule.time_in}`), "HH:mm") : "08:00",
      status: schedule?.status || "working",
    })
  }

  const handleCellSave = async () => {
    if (!editingCell) return

    setSavingCell(true)
    try {
      const schedule = allSchedules.find((s) => s.user_id === editingCell.employeeId && s.date === editingCell.date)

      const updateData = {
        time_in: editingCell.status === "working" ? editingCell.value : null,
        status: editingCell.status as "working" | "C" | "SD",
      }

      if (schedule) {
        await scheduleService.updateSchedule(schedule.id, updateData)
      } else {
        // Generate schedule for this employee first
        const employee = employees.find((e) => e.id === editingCell.employeeId)
        if (employee) {
          await scheduleService.generateSchedules(
            employee.id,
            selectedMonth.getMonth() + 1,
            selectedMonth.getFullYear(),
          )
          // Fetch the newly created schedule and update it
          const newSchedules = await scheduleService.getAdminSchedules({
            month: selectedMonth.getMonth() + 1,
            year: selectedMonth.getFullYear(),
            user_id: employee.id,
          })
          const newSchedule = newSchedules.find((s) => s.date === editingCell.date)
          if (newSchedule) {
            await scheduleService.updateSchedule(newSchedule.id, updateData)
          }
        }
      }

      await fetchAllSchedules()
      setEditingCell(null)

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
      setSavingCell(false)
    }
  }

  const handleCellCancel = () => {
    setEditingCell(null)
  }

  const handleCopyWeek = (employeeId: number, weekStart: Date) => {
    const weekEnd = addWeeks(weekStart, 1)
    const weekSchedules = allSchedules.filter(
      (schedule) =>
        schedule.user_id === employeeId &&
        schedule.status === "working" &&
        schedule.time_in &&
        new Date(schedule.date) >= weekStart &&
        new Date(schedule.date) < weekEnd,
    )

    if (weekSchedules.length === 0) {
      toast({
        title: "No schedules to copy",
        description: "This week has no working schedules to copy",
        variant: "destructive",
      })
      return
    }

    setCopiedWeek({
      employeeId,
      startDate: format(weekStart, "yyyy-MM-dd"),
      schedules: weekSchedules,
    })

    const employee = employees.find((e) => e.id === employeeId)
    toast({
      title: "Week copied",
      description: `Copied ${weekSchedules.length} working days from ${employee?.first_name} ${employee?.last_name}'s schedule`,
    })
  }

  const handlePasteWeek = async () => {
    if (!copiedWeek || selectedWeeks.length === 0) return

    setPasting(true)
    try {
      await scheduleService.copyWeekPattern({
        user_id: copiedWeek.employeeId,
        start_date: copiedWeek.startDate,
        target_weeks: selectedWeeks,
      })

      await fetchAllSchedules()
      setSelectedWeeks([])
      setShowPasteDialog(false)

      const employee = employees.find((e) => e.id === copiedWeek.employeeId)
      toast({
        title: "Success",
        description: `Pasted schedule pattern to ${selectedWeeks.length} weeks for ${employee?.first_name} ${employee?.last_name}`,
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
          <Badge variant="secondary" className="text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-100">
            C
          </Badge>
        </div>
      )
    }

    if (schedule.status === "SD") {
      return (
        <div className="flex items-center justify-center h-full">
          <Badge variant="destructive" className="text-xs font-bold bg-red-100 text-red-700 hover:bg-red-100">
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

  const exportToPDF = () => {
    toast({
      title: "Coming Soon",
      description: "PDF export functionality will be available soon",
    })
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
            <div className="space-y-2">
              <Label htmlFor="month" className="text-sm font-medium">
                Select Month
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="month"
                  type="month"
                  value={format(selectedMonth, "yyyy-MM")}
                  onChange={(e) => setSelectedMonth(new Date(e.target.value))}
                  className="pl-10 w-44"
                />
              </div>
            </div>
          </div>

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
              onClick={generateSchedulesForAll}
              disabled={loading || generatingSchedules}
              size="sm"
              className="gap-2"
            >
              {generatingSchedules ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Generate All
            </Button>
            {copiedWeek && (
              <Dialog open={showPasteDialog} onOpenChange={setShowPasteDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Clipboard className="h-4 w-4" />
                    Paste Week
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Paste Week Pattern</DialogTitle>
                    <DialogDescription>
                      Select the weeks where you want to paste the copied schedule pattern.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-sm">
                      <strong>Copied from:</strong> {employees.find((e) => e.id === copiedWeek.employeeId)?.first_name}{" "}
                      {employees.find((e) => e.id === copiedWeek.employeeId)?.last_name} -{" "}
                      {format(new Date(copiedWeek.startDate), "MMM d, yyyy")}
                    </div>
                    <div className="space-y-2">
                      <Label>Select target weeks:</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {monthWeeks.map((week) => (
                          <div key={week.toISOString()} className="flex items-center space-x-2">
                            <Checkbox
                              id={week.toISOString()}
                              checked={selectedWeeks.includes(format(week, "yyyy-MM-dd"))}
                              onCheckedChange={(checked) => {
                                const weekStr = format(week, "yyyy-MM-dd")
                                if (checked) {
                                  setSelectedWeeks([...selectedWeeks, weekStr])
                                } else {
                                  setSelectedWeeks(selectedWeeks.filter((w) => w !== weekStr))
                                }
                              }}
                            />
                            <Label htmlFor={week.toISOString()} className="text-sm">
                              Week of {format(week, "MMM d")}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowPasteDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handlePasteWeek} disabled={selectedWeeks.length === 0 || pasting}>
                      {pasting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Paste to {selectedWeeks.length} weeks
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <Button onClick={exportToPDF} variant="outline" size="sm" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export PDF
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
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                C
              </Badge>
              <span className="text-sm">Ordinary Leave</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">
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
              <span className="text-sm">Right-click week to copy</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Grid */}
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Schedule Grid</CardTitle>
          <CardDescription>
            Click on any cell to edit schedule. Right-click on employee name to copy week pattern. Times are displayed
            in 24-hour format.
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
            <div className="w-full">
              <div className="overflow-x-auto">
                <div className="min-w-max border-t">
                  {/* Header Row */}
                  <div
                    className="grid gap-0 bg-primary/5 border-b-2 border-primary/20"
                    style={{ gridTemplateColumns: `180px repeat(${monthDays.length}, 56px)` }}
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
                      style={{ gridTemplateColumns: `180px repeat(${monthDays.length}, 56px)` }}
                    >
                      <div
                        className="p-3 border-r border-primary/10 bg-primary/5 flex items-center justify-between group"
                        onContextMenu={(e) => {
                          e.preventDefault()
                          const weekStart = startOfWeek(monthDays[0])
                          handleCopyWeek(employee.id, weekStart)
                        }}
                      >
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
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                          onClick={() => handleCopyWeek(employee.id, startOfWeek(monthDays[0]))}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>

                      {monthDays.map((date) => {
                        const isEditing =
                          editingCell?.employeeId === employee.id && editingCell?.date === format(date, "yyyy-MM-dd")

                        return (
                          <div
                            key={`${employee.id}-${date.toISOString()}`}
                            className={cn(
                              "border-r border-primary/10 last:border-r-0 cursor-pointer hover:bg-primary/10 min-h-[70px] flex items-center justify-center relative transition-all duration-200",
                              getCellBackground(date, index),
                              isEditing && "ring-2 ring-primary ring-inset",
                            )}
                            onClick={() => !isEditing && handleCellClick(employee.id, date)}
                          >
                            {isEditing ? (
                              <div className="absolute inset-1 bg-background border-2 border-primary rounded-md p-2 z-10 shadow-lg">
                                <div className="space-y-2">
                                  <Input
                                    type="time"
                                    value={editingCell.value}
                                    onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                                    className="h-7 text-xs"
                                    disabled={editingCell.status !== "working"}
                                  />
                                  <Select
                                    value={editingCell.status}
                                    onValueChange={(value) => setEditingCell({ ...editingCell, status: value })}
                                  >
                                    <SelectTrigger className="h-7 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="working">Working</SelectItem>
                                      <SelectItem value="C">Leave (C)</SelectItem>
                                      <SelectItem value="SD">Sick (SD)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      onClick={handleCellSave}
                                      className="h-6 px-2 text-xs flex-1"
                                      disabled={savingCell}
                                    >
                                      {savingCell ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <Save className="h-3 w-3" />
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleCellCancel}
                                      className="h-6 px-2 text-xs bg-transparent"
                                      disabled={savingCell}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              getCellContent(employee.id, date)
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
