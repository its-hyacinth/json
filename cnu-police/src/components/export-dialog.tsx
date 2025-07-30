"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Download, FileSpreadsheet, FileText, Loader2, Calendar } from "lucide-react"
import { format } from "date-fns"
import { useEmployees } from "@/hooks/use-employees"
import { scheduleService } from "@/services/schedule-service"
import { useToast } from "@/hooks/use-toast"
import type { Schedule } from "@/services/schedule-service"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentMonth: Date
}

export function ExportDialog({ open, onOpenChange, currentMonth }: ExportDialogProps) {
  const [selectedMonth, setSelectedMonth] = useState(format(currentMonth, "yyyy-MM"))
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf">("excel")
  const [includeEmployees, setIncludeEmployees] = useState<"all" | "selected">("all")
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([])
  const [exporting, setExporting] = useState(false)

  const { employees } = useEmployees()
  const { toast } = useToast()

  const handleEmployeeToggle = (employeeId: number) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId],
    )
  }

  const handleSelectAllEmployees = () => {
    setSelectedEmployeeIds(employees.map((e) => e.id))
  }

  const handleDeselectAllEmployees = () => {
    setSelectedEmployeeIds([])
  }

  const generateExcelData = (schedules: Schedule[], month: Date) => {
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
    const daysInMonth = monthEnd.getDate()

    // Create header row exactly like the image
    const monthYearHeader = [format(month, "MMMM yyyy").toUpperCase()]
    for (let day = 1; day <= daysInMonth; day++) {
      monthYearHeader.push(day.toString())
    }

    // Create day abbreviation row
    const dayAbbrevHeader = [""]
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day)
      dayAbbrevHeader.push(format(date, "EEEEE")) // Single letter day abbreviation
    }

    // Group schedules by employee
    const schedulesByEmployee = schedules.reduce(
      (acc, schedule) => {
        if (!acc[schedule.user_id]) {
          acc[schedule.user_id] = {}
        }
        const day = new Date(schedule.date).getDate()
        acc[schedule.user_id][day] = schedule
        return acc
      },
      {} as Record<number, Record<number, Schedule>>,
    )

    // Create data rows
    const rows = [monthYearHeader, dayAbbrevHeader]

    const targetEmployees =
      includeEmployees === "all" ? employees : employees.filter((e) => selectedEmployeeIds.includes(e.id))

    targetEmployees.forEach((employee) => {
      const row = [employee.last_name.toUpperCase()]

      for (let day = 1; day <= daysInMonth; day++) {
        const schedule = schedulesByEmployee[employee.id]?.[day]
        if (!schedule) {
          row.push("0")
        } else if (schedule.status === "C") {
          row.push("C")
        } else if (schedule.status === "SD") {
          row.push("SD")
        } else if (schedule.status === "S") {
          row.push("S")
        } else if (schedule.status === "M") {
          row.push("M")
        } else if (schedule.status === "CT") {
          row.push("CT")
        } else if (schedule.time_in) {
          // Extract hour from time and display as number
          const hour = Number.parseInt(schedule.time_in.split(":")[0])
          row.push(hour.toString())
        } else {
          row.push("0")
        }
      }
      rows.push(row)
    })

    // Add events row if there are any events
    const eventsRow = ["EVENTS"]
    for (let day = 1; day <= daysInMonth; day++) {
      // You can add event logic here if needed
      eventsRow.push("")
    }
    rows.push(eventsRow)

    return rows
  }

  const exportToExcel = async (data: string[][], filename: string) => {
    // Create CSV content
    const csvContent = data.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = async (schedules: Schedule[], month: Date) => {
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
    const daysInMonth = monthEnd.getDate()

    const targetEmployees =
      includeEmployees === "all" ? employees : employees.filter((e) => selectedEmployeeIds.includes(e.id))

    // Group schedules by employee
    const schedulesByEmployee = schedules.reduce(
      (acc, schedule) => {
        if (!acc[schedule.user_id]) {
          acc[schedule.user_id] = {}
        }
        const day = new Date(schedule.date).getDate()
        acc[schedule.user_id][day] = schedule
        return acc
      },
      {} as Record<number, Record<number, Schedule>>,
    )

    // Create HTML content that matches the spreadsheet exactly
    let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Schedule Export - ${format(month, "MMMM yyyy")}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 10px; 
          font-size: 11px;
        }
        .schedule-table { 
          width: 100%; 
          border-collapse: collapse; 
          font-size: 10px;
        }
        .schedule-table th, .schedule-table td { 
          border: 1px solid #000; 
          padding: 2px; 
          text-align: center;
          height: 20px;
          min-width: 25px;
        }
        .month-header { 
          background-color: #808080; 
          color: white; 
          font-weight: bold;
          font-size: 11px;
        }
        .day-header { 
          background-color: #f0f0f0; 
          font-weight: bold;
          font-size: 9px;
        }
        .employee-cell {
          background-color: #f0f0f0;
          text-align: left;
          font-weight: bold;
          padding-left: 5px;
          min-width: 80px;
          font-size: 9px;
        }
        .weekend { 
          background-color: #e0e0e0; 
        }
        .status-c { 
          background-color: #ffff00; 
          font-weight: bold;
        }
        .status-s { 
          background-color: #00ffff; 
          font-weight: bold;
        }
        .status-m { 
          background-color: #90EE90; 
          font-weight: bold;
        }
        .status-sd { 
          background-color: #90EE90; 
          font-weight: bold;
        }
        .working-time { 
          font-weight: bold;
        }
        .events-row {
          background-color: #d0d0d0;
          font-weight: bold;
        }
        @media print {
          body { margin: 5px; }
          .schedule-table { font-size: 8px; }
        }
      </style>
    </head>
    <body>
      <table class="schedule-table">
        <thead>
          <tr>
            <th class="month-header">${format(month, "MMMM yyyy").toUpperCase()}</th>
  `

    // Add date headers
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      htmlContent += `<th class="month-header ${isWeekend ? "weekend" : ""}">${day}</th>`
    }

    htmlContent += `
          </tr>
          <tr>
            <th class="day-header"></th>
  `

    // Add day abbreviation headers
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      htmlContent += `<th class="day-header ${isWeekend ? "weekend" : ""}">${format(date, "EEEEE")}</th>`
    }

    htmlContent += `
          </tr>
        </thead>
        <tbody>
  `

    // Add employee rows
    targetEmployees.forEach((employee) => {
      htmlContent += `
      <tr>
        <td class="employee-cell">${employee.last_name.toUpperCase()}</td>
    `

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(month.getFullYear(), month.getMonth(), day)
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        const schedule = schedulesByEmployee[employee.id]?.[day]

        let cellClass = isWeekend ? "weekend" : ""
        let cellContent = "0"

        if (schedule) {
          if (schedule.status === "C") {
            cellClass += " status-c"
            cellContent = "C"
          } else if (schedule.status === "SD") {
            cellClass += " status-sd"
            cellContent = "SD"
          } else if (schedule.status === "S") {
            cellClass += " status-s"
            cellContent = "S"
          } else if (schedule.status === "M") {
            cellClass += " status-m"
            cellContent = "M"
          } else if (schedule.status === "CT") {
            cellClass += " status-m"
            cellContent = "CT"
          } else if (schedule.time_in) {
            cellClass += " working-time"
            const hour = Number.parseInt(schedule.time_in.split(":")[0])
            cellContent = hour.toString()
          }
        }

        htmlContent += `<td class="${cellClass}">${cellContent}</td>`
      }

      htmlContent += "</tr>"
    })

    // Add events row
    htmlContent += `
    <tr>
      <td class="employee-cell events-row">EVENTS</td>
  `

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      htmlContent += `<td class="events-row ${isWeekend ? "weekend" : ""}"></td>`
    }

    htmlContent += `
    </tr>
        </tbody>
      </table>
      
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `

    // Open in new window for printing
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
    }
  }

  const handleExport = async () => {
    if (includeEmployees === "selected" && selectedEmployeeIds.length === 0) {
      toast({
        title: "No employees selected",
        description: "Please select at least one employee to export",
        variant: "destructive",
      })
      return
    }

    setExporting(true)
    try {
      const exportMonth = new Date(selectedMonth)
      const allSchedules: Schedule[] = []

      // Fetch schedules for selected employees
      const targetEmployees =
        includeEmployees === "all" ? employees : employees.filter((e) => selectedEmployeeIds.includes(e.id))

      for (const employee of targetEmployees) {
        try {
          const schedules = await scheduleService.getAdminSchedules({
            month: exportMonth.getMonth() + 1,
            year: exportMonth.getFullYear(),
            user_id: employee.id,
          })
          allSchedules.push(...schedules)
        } catch (error) {
          console.warn(`Failed to fetch schedules for employee ${employee.id}:`, error)
        }
      }

      const filename = `CNU_Police_Schedule_${format(exportMonth, "yyyy_MM")}.${exportFormat === "excel" ? "csv" : "pdf"}`

      if (exportFormat === "excel") {
        const excelData = generateExcelData(allSchedules, exportMonth)
        await exportToExcel(excelData, filename)
      } else {
        await exportToPDF(allSchedules, exportMonth)
      }

      toast({
        title: "Export successful",
        description: `Schedule exported as ${exportFormat.toUpperCase()} for ${format(exportMonth, "MMMM yyyy")}`,
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export schedule",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Schedule
          </DialogTitle>
          <DialogDescription>
            Export employee schedules to Excel or PDF format for the selected month and employees.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Month Selection */}
          <div className="space-y-2">
            <Label htmlFor="export-month">Select Month</Label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                id="export-month"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-48"
              />
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="grid grid-cols-2 gap-4">
              <Card
                className={`cursor-pointer transition-all ${exportFormat === "excel" ? "ring-2 ring-primary" : ""}`}
                onClick={() => setExportFormat("excel")}
              >
                <CardContent className="p-4 text-center">
                  <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-medium">Excel (CSV)</h3>
                  <p className="text-xs text-muted-foreground">Spreadsheet format for data analysis</p>
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all ${exportFormat === "pdf" ? "ring-2 ring-primary" : ""}`}
                onClick={() => setExportFormat("pdf")}
              >
                <CardContent className="p-4 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <h3 className="font-medium">PDF</h3>
                  <p className="text-xs text-muted-foreground">Print-ready document format</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Employee Selection */}
          <div className="space-y-2">
            <Label>Include Employees</Label>
            <Select value={includeEmployees} onValueChange={(value: "all" | "selected") => setIncludeEmployees(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees ({employees.length})</SelectItem>
                <SelectItem value="selected">Selected Employees</SelectItem>
              </SelectContent>
            </Select>

            {includeEmployees === "selected" && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Select Employees</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSelectAllEmployees}
                      className="text-xs bg-transparent"
                    >
                      Select All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDeselectAllEmployees}
                      className="text-xs bg-transparent"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {employees.map((employee) => (
                    <div key={employee.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`employee-${employee.id}`}
                        checked={selectedEmployeeIds.includes(employee.id)}
                        onChange={() => handleEmployeeToggle(employee.id)}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={`employee-${employee.id}`} className="text-sm cursor-pointer flex-1">
                        {employee.first_name} {employee.last_name}
                        <span className="text-xs text-muted-foreground block">{employee.badge_number}</span>
                      </label>
                    </div>
                  ))}
                </div>
                {selectedEmployeeIds.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <Badge variant="secondary">
                      {selectedEmployeeIds.length} employee{selectedEmployeeIds.length !== 1 ? "s" : ""} selected
                    </Badge>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : exportFormat === "excel" ? (
              <FileSpreadsheet className="h-4 w-4 mr-2" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Export {exportFormat === "excel" ? "Excel" : "PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
