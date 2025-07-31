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
import { Download, Plus, Save, Calendar, Users, Loader2, Copy, Clipboard, CalendarDays, ChevronLeft, ChevronRight, Star, Edit, Trash2, GripVertical, UserPlus } from 'lucide-react'
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
import { accountService, type CreateUserData } from "@/services/account-service"

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

interface EditingCell {
  employeeId: number
  date: string
  value: string
}

export function AdminSchedules() {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(false)
  const [generatingSchedules, setGeneratingSchedules] = useState(false)
  const [employeeOrder, setEmployeeOrder] = useState<number[]>([])

  // Inline editing state
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [savingCell, setSavingCell] = useState(false)

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

  // Employee creation states
  const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false)
  const [creatingEmployee, setCreatingEmployee] = useState(false)
  const [employeeFormData, setEmployeeFormData] = useState<CreateUserData>({
    first_name: "",
    last_name: "",
    email: "",
    badge_number: "",
    division: "",
    phone: "",
    address: "",
    role: "employee",
    password: "",
  })

  const [showExportDialog, setShowExportDialog] = useState(false)

  const { employees, loading: employeesLoading, refetch: refetchEmployees } = useEmployees()

  // Filter out admin users (without depending on schedules)
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => employee.role !== "admin")
  }, [employees])

  // Load employee order from localStorage
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

  // Save employee order to localStorage
  const saveEmployeeOrder = (newOrder: number[]) => {
    setEmployeeOrder(newOrder)
    localStorage.setItem('employee-order', JSON.stringify(newOrder))
  }

  // Handle drag and drop for employee rows
  const handleDragStart = (e: React.DragEvent, employeeId: number) => {
    e.dataTransfer.setData('text/plain', employeeId.toString())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetEmployeeId: number) => {
    e.preventDefault()
    const draggedEmployeeId = parseInt(e.dataTransfer.getData('text/plain'))
    
    if (draggedEmployeeId === targetEmployeeId) return

    const currentOrder = employeeOrder.length > 0 ? employeeOrder : sortedEmployees.map(emp => emp.id)
    const newOrder = [...currentOrder]
    
    const draggedIndex = newOrder.indexOf(draggedEmployeeId)
    const targetIndex = newOrder.indexOf(targetEmployeeId)
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Remove dragged item and insert at target position
      newOrder.splice(draggedIndex, 1)
      newOrder.splice(targetIndex, 0, draggedEmployeeId)
      saveEmployeeOrder(newOrder)
    }
  }

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

  // Parse simple input to time and status
  const parseScheduleInput = (input: string): { time_in: string | null; status: string } => {
    const trimmed = input.trim().toUpperCase()
    
    // Handle status codes
    if (['C', 'SD', 'S', 'M', 'CT'].includes(trimmed)) {
      return { time_in: null, status: trimmed }
    }
    
    // Handle empty or 0
    if (!trimmed || trimmed === '0') {
      return { time_in: null, status: 'working' }
    }
    
    // Handle numeric input (assume it's hour in 24-hour format)
    const num = parseInt(trimmed)
    if (!isNaN(num) && num >= 0 && num <= 23) {
      const timeString = `${num.toString().padStart(2, '0')}:00`
      return { time_in: timeString, status: 'working' }
    }
    
    // Handle time format (HH:MM)
    const timeMatch = trimmed.match(/^(\d{1,2}):?(\d{2})?$/)
    if (timeMatch) {
      const hour = parseInt(timeMatch[1])
      const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0
      
      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        return { time_in: timeString, status: 'working' }
      }
    }
    
    // Default to working status with no time
    return { time_in: null, status: 'working' }
  }

  // Handle inline cell editing
  const handleCellClick = (employeeId: number, date: Date) => {
    if (loading || generatingSchedules || savingCell) return

    const dateString = format(date, "yyyy-MM-dd")
    
    // Clear the value when editing for fast input
    setEditingCell({
      employeeId,
      date: dateString,
      value: "" // Clear the value instead of showing current
    })
  }

  const handleCellInputChange = (value: string) => {
    if (editingCell) {
      setEditingCell({ ...editingCell, value })
    }
  }

  const handleCellInputKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault() // Prevent default tab behavior
      await saveCellEdit()
      
      // Only proceed to next cell if Tab was pressed
      if (e.key === 'Tab' && editingCell) {
        // Find current employee index
        const currentEmployeeIndex = sortedEmployees.findIndex(
          emp => emp.id === editingCell.employeeId
        )
        
        // Find current date index
        const currentDateIndex = monthDays.findIndex(
          day => format(day, "yyyy-MM-dd") === editingCell.date
        )
        
        // Determine next cell coordinates
        let nextEmployeeIndex = currentEmployeeIndex
        let nextDateIndex = currentDateIndex
        
        if (e.shiftKey) {
          // Shift+Tab - move left
          if (currentDateIndex > 0) {
            nextDateIndex = currentDateIndex - 1
          } else if (currentEmployeeIndex > 0) {
            nextEmployeeIndex = currentEmployeeIndex - 1
            nextDateIndex = monthDays.length - 1
          }
        } else {
          // Tab - move right
          if (currentDateIndex < monthDays.length - 1) {
            nextDateIndex = currentDateIndex + 1
          } else if (currentEmployeeIndex < sortedEmployees.length - 1) {
            nextEmployeeIndex = currentEmployeeIndex + 1
            nextDateIndex = 0
          }
        }
        
        // If we have a valid next cell, edit it
        if (nextEmployeeIndex !== currentEmployeeIndex || nextDateIndex !== currentDateIndex) {
          const nextEmployee = sortedEmployees[nextEmployeeIndex]
          const nextDate = monthDays[nextDateIndex]
          
          if (nextEmployee && nextDate) {
            setEditingCell({
              employeeId: nextEmployee.id,
              date: format(nextDate, "yyyy-MM-dd"),
              value: "" // Clear for fast editing
            })
          }
        }
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null)
    }
  }

  const handleCellInputBlur = async () => {
    await saveCellEdit()
  }

  const saveCellEdit = async () => {
    if (!editingCell || savingCell) return

    setSavingCell(true)
    try {
      const { time_in, status } = parseScheduleInput(editingCell.value)
      const schedule = getScheduleForEmployeeAndDate(editingCell.employeeId, new Date(editingCell.date))
      
      const updateData = {
        time_in,
        status: status as "working" | "C" | "SD" | "S" | "M" | "CT",
      }

      let updatedSchedule: Schedule

      if (schedule?.id) {
        // Update existing schedule
        updatedSchedule = await scheduleService.updateSchedule(schedule.id, updateData)
      } else {
        // Generate schedule for this employee first, then update
        await scheduleService.generateSchedules(
          editingCell.employeeId,
          selectedMonth.getMonth() + 1,
          selectedMonth.getFullYear(),
        )

        // Fetch the newly created schedule and update it
        const newSchedules = await scheduleService.getAdminSchedules({
          month: selectedMonth.getMonth() + 1,
          year: selectedMonth.getFullYear(),
          user_id: editingCell.employeeId,
        })
        const newSchedule = newSchedules.find((s) => s.date === editingCell.date)
        if (newSchedule) {
          updatedSchedule = await scheduleService.updateSchedule(newSchedule.id, updateData)
        } else {
          throw new Error("Failed to create schedule")
        }
      }

      // Soft update the UI
      updateLocalSchedule(updatedSchedule)
      setEditingCell(null)
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

  // Employee creation functions
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingEmployee(true)
    
    try {
      await accountService.createUser(employeeFormData)
      toast({
        title: "Success",
        description: "Employee account created successfully",
      })
      setShowCreateEmployeeModal(false)
      setEmployeeFormData({
        first_name: "",
        last_name: "",
        email: "",
        badge_number: "",
        division: "",
        phone: "",
        address: "",
        role: "employee",
        password: "",
      })
      // Refetch employees to update the list
      await refetchEmployees()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create employee account",
        variant: "destructive",
      })
    } finally {
      setCreatingEmployee(false)
    }
  }

  // Fixed handleCopyWeek function to get all schedules from the week
  const handleCopyWeek = () => {
    if (!copyingEmployeeId || !selectedCopyDate) return

    const employee = filteredEmployees.find((e) => e.id === copyingEmployeeId)
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
        employee_ids: filteredEmployees.map((e) => e.id),
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
    const dateString = format(date, "yyyy-MM-dd")
    const isEditing = editingCell?.employeeId === employeeId && editingCell?.date === dateString
    
    if (isEditing) {
      return (
        <Input
          value={editingCell.value}
          onChange={(e) => handleCellInputChange(e.target.value)}
          onKeyDown={handleCellInputKeyDown}
          onBlur={handleCellInputBlur}
          className="h-8 w-full text-center text-xs font-bold border-2 border-primary"
          autoFocus
          disabled={savingCell}
        />
      )
    }

    const schedule = getScheduleForEmployeeAndDate(employeeId, date)

    if (!schedule) {
      return (
        <div className="flex items-center justify-center h-full cursor-pointer">
          <span className="text-xs text-gray-400 font-bold">0</span>
        </div>
      )
    }

    if (['C', 'SD', 'S', 'M', 'CT'].includes(schedule.status)) {
      return (
        <div className="flex items-center justify-center h-full cursor-pointer">
          <span className="text-xs font-bold text-black">{schedule.status}</span>
        </div>
      )
    }

    if (schedule.time_in) {
      const hour = parseInt(schedule.time_in.split(':')[0])
      return (
        <div className="flex items-center justify-center h-full cursor-pointer">
          <span className="text-xs font-bold text-black">{hour}</span>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center h-full cursor-pointer">
        <span className="text-xs text-gray-400 font-bold">0</span>
      </div>
    )
  }

  const getCellBackground = (date: Date, employeeIndex: number, schedule?: Schedule) => {
    const dayOfWeek = getDay(date)
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isTodayDate = isToday(date)
    const hasEvents = getEventsForDate(date).length > 0

    // Special background colors for different statuses
    if (schedule?.status === "C") {
      return "bg-yellow-200"
    } else if (schedule?.status === "SD") {
      return "bg-green-200"
    } else if (schedule?.status === "S") {
      return "bg-cyan-200"
    } else if (schedule?.status === "M") {
      return "bg-amber-200"
    } else if (schedule?.status === "CT") {
      return "bg-indigo-200"
    }

    if (isTodayDate) {
      return "bg-blue-100"
    }

    if (hasEvents) {
      return "bg-yellow-100"
    }

    if (isWeekend) {
      return "bg-gray-100"
    }

    return "bg-white"
  }

  const generateSchedulesForAll = async () => {
    setGeneratingSchedules(true)
    try {
      for (const employee of filteredEmployees) {
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
              {filteredEmployees.length} Employees
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

      {/* Copy Week Modal */}
      <Dialog open={showCopyModal} onOpenChange={setShowCopyModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Copy Week Pattern</DialogTitle>
            <DialogDescription>
              Select a date to copy the entire week's schedule pattern from{" "}
              {copyingEmployeeId && filteredEmployees.find((e) => e.id === copyingEmployeeId)?.first_name}{" "}
              {copyingEmployeeId && filteredEmployees.find((e) => e.id === copyingEmployeeId)?.last_name}.
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

      {/* Create Employee Modal */}
      <Dialog open={showCreateEmployeeModal} onOpenChange={setShowCreateEmployeeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Employee Account</DialogTitle>
            <DialogDescription>
              Add a new employee account to the system
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateEmployee} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={employeeFormData.first_name}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, first_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={employeeFormData.last_name}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={employeeFormData.email}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, email: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="badge_number">Badge Number</Label>
                <Input
                  id="badge_number"
                  value={employeeFormData.badge_number}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, badge_number: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="division">Division</Label>
                <Input
                  id="division"
                  value={employeeFormData.division}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, division: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={employeeFormData.phone}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={employeeFormData.address}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, address: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={employeeFormData.password}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, password: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateEmployeeModal(false)} 
                disabled={creatingEmployee}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creatingEmployee}>
                {creatingEmployee ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Create Employee
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Schedule Grid */}
      <Card className="border-primary/10 w-full">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Schedule Grid</CardTitle>
          <CardDescription>
            Click on any cell to edit schedule. Enter numbers (0-23) for hours, or status codes (C, SD, S, M, CT). 
            Drag rows to reorder employees. Times are displayed in 24-hour format. Yellow highlighted cells indicate event days.
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
                        draggable
                        onDragStart={(e) => handleDragStart(e, employee.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, employee.id)}
                      >
                        <td className="border border-gray-300 p-2 bg-gray-100 font-bold text-sm sticky left-0 z-10">
                          <div className="flex items-center justify-between group">
                            <GripVertical className="h-4 w-4 text-gray-400 cursor-grab active:cursor-grabbing" />
                            <div className="min-w-0 flex-1 ml-2">
                              <div className="font-bold text-sm truncate uppercase">{employee.last_name}</div>
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
                          const cellBg = getCellBackground(date, index, schedule)

                          return (
                            <td
                              key={`${employee.id}-${date.toISOString()}`}
                              className={cn(
                                "border border-gray-300 p-1 text-center hover:bg-gray-200 transition-colors h-12 w-12",
                                cellBg,
                              )}
                              onClick={() => handleCellClick(employee.id, date)}
                            >
                              {getCellContent(employee.id, date)}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Add Employee Button */}
                <div className="mt-4 p-4 border-t border-gray-300 bg-gray-50">
                  <Button
                    onClick={() => setShowCreateEmployeeModal(true)}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Employee Account
                  </Button>
                </div>
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
            Schedule Legend & Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-6 bg-background border-2 border-primary/20 rounded flex items-center justify-center text-xs font-mono font-semibold">
                  8
                </div>
                <span className="text-sm">Working Time (8 = 8:00)</span>
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
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Quick Entry Instructions:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Enter <strong>13</strong> for 1:00 PM (13:00)</li>
                <li>• Enter <strong>8</strong> for 8:00 AM (08:00)</li>
                <li>• Enter <strong>0</strong> for no schedule</li>
                <li>• Enter <strong>C</strong> for Ordinary Leave</li>
                <li>• Enter <strong>SD</strong> for Sick Leave</li>
                <li>• Enter <strong>S</strong> for School/Training</li>
                <li>• Enter <strong>M</strong> for Military</li>
                <li>• Enter <strong>CT</strong> for Court</li>
                <li>• Press <strong>Enter</strong> to save, <strong>Escape</strong> to cancel</li>
                <li>• Drag rows by the grip handle to reorder employees</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Export Dialog */}
      <ExportDialog open={showExportDialog} onOpenChange={setShowExportDialog} currentMonth={selectedMonth} />
    </div>
  )
}