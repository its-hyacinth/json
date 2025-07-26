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

    // Create header row with dates
    const headers = ["Employee", "Badge Number", "Division"]
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day)
      headers.push(`${day} (${format(date, "EEE")})`)
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
    const rows = [headers]

    const targetEmployees =
      includeEmployees === "all" ? employees : employees.filter((e) => selectedEmployeeIds.includes(e.id))

    targetEmployees.forEach((employee) => {
      const row = [`${employee.first_name} ${employee.last_name}`, employee.badge_number || "", employee.division || ""]

      for (let day = 1; day <= daysInMonth; day++) {
        const schedule = schedulesByEmployee[employee.id]?.[day]
        if (!schedule) {
          row.push("-")
        } else if (schedule.status === "C") {
          row.push("C (Leave)")
        } else if (schedule.status === "SD") {
          row.push("SD (Sick)")
        } else if (schedule.status === "S") {
          row.push("S (School/Training)")
        } else if (schedule.status === "M") {
          row.push("M (Military Attachment)")
        } else if (schedule.time_in) {
          row.push(format(new Date(`2000-01-01T${schedule.time_in}`), "HH:mm"))
        } else {
          row.push("Working")
        }
      }
      rows.push(row)
    })

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
    // Create a printable HTML version
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

    // Create HTML content
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CNU Police Department - Schedule Report</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            font-size: 12px;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .header h1 { 
            color: #1e40af; 
            margin: 0;
            font-size: 24px;
          }
          .header h2 { 
            color: #666; 
            margin: 5px 0;
            font-size: 18px;
          }
          .schedule-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
            font-size: 10px;
          }
          .schedule-table th, .schedule-table td { 
            border: 1px solid #ddd; 
            padding: 4px; 
            text-align: center;
          }
          .schedule-table th { 
            background-color: #1e40af; 
            color: white; 
            font-weight: bold;
          }
          .employee-cell {
            background-color: #f8fafc;
            text-align: left;
            font-weight: bold;
            min-width: 120px;
          }
          .weekend { 
            background-color: #f3f4f6; 
          }
          .leave { 
            background-color: #dbeafe; 
            color: #1e40af;
            font-weight: bold;
          }
          .sick { 
            background-color: #fee2e2; 
            color: #dc2626;
            font-weight: bold;
          }
          .working { 
            background-color: #f0fdf4; 
            color: #166534;
            font-weight: bold;
          }
          .school { 
            background-color: #f0fdf4; 
            color: #166534;
            font-weight: bold;
          }
          .military { 
            background-color: #faf5ff; 
            color: #7c3aed;
            font-weight: bold;
          }
          .legend {
            margin-top: 20px;
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
          }
          .legend-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .legend-color {
            width: 20px;
            height: 15px;
            border: 1px solid #ccc;
          }
          @media print {
            body { margin: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CNU Police Department</h1>
          <h2>Schedule Report - ${format(month, "MMMM yyyy")}</h2>
          <p>Generated on ${format(new Date(), "PPP")} at ${format(new Date(), "p")}</p>
        </div>
        
        <table class="schedule-table">
          <thead>
            <tr>
              <th rowspan="2" class="employee-cell">Employee</th>
              <th rowspan="2">Badge</th>
    `

    // Add date headers
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      htmlContent += `<th class="${isWeekend ? "weekend" : ""}">${day}</th>`
    }

    htmlContent += `
            </tr>
            <tr>
    `

    // Add day of week headers
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      htmlContent += `<th class="${isWeekend ? "weekend" : ""}">${format(date, "EEE")}</th>`
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
          <td class="employee-cell">
            ${employee.first_name} ${employee.last_name}
            ${employee.division ? `<br><small>${employee.division}</small>` : ""}
          </td>
          <td>${employee.badge_number || "-"}</td>
      `

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(month.getFullYear(), month.getMonth(), day)
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        const schedule = schedulesByEmployee[employee.id]?.[day]

        let cellClass = isWeekend ? "weekend" : ""
        let cellContent = "-"

        if (schedule) {
          if (schedule.status === "C") {
            cellClass += " leave"
            cellContent = "C"
          } else if (schedule.status === "SD") {
            cellClass += " sick"
            cellContent = "SD"
          } else if (schedule.status === "S") {
            cellClass += " school"
            cellContent = "S"
          } else if (schedule.status === "M") {
            cellClass += " military"
            cellContent = "M"
          } else if (schedule.time_in) {
            cellClass += " working"
            cellContent = format(new Date(`2000-01-01T${schedule.time_in}`), "HH:mm")
          } else {
            cellClass += " working"
            cellContent = "08:00"
          }
        }

        htmlContent += `<td class="${cellClass}">${cellContent}</td>`
      }

      htmlContent += "</tr>"
    })

    htmlContent += `
          </tbody>
        </table>
        
        <div class="legend">
          <div class="legend-item">
            <div class="legend-color working"></div>
            <span>Working Time</span>
          </div>
          <div class="legend-item">
            <div class="legend-color leave"></div>
            <span>Ordinary Leave (C)</span>
          </div>
          <div class="legend-item">
            <div class="legend-color sick"></div>
            <span>Sick Leave (SD)</span>
          </div>
          <div class="legend-item">
            <div class="legend-color school"></div>
            <span>School/Training (S)</span>
          </div>
          <div class="legend-item">
            <div class="legend-color military"></div>
            <span>Military Attachment (M)</span>
          </div>
          <div class="legend-item">
            <div class="legend-color weekend"></div>
            <span>Weekend</span>
          </div>
        </div>
        
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
