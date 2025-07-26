"use client"

import { useState } from "react"
import { useOvertimeRequests } from "@/hooks/use-overtime-requests"
import { useEmployees } from "@/hooks/use-employees"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Clock,
  Plus,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Loader2,
  Filter,
  RefreshCw,
  Users,
} from "lucide-react"
import { format } from "date-fns"
import { OVERTIME_TYPES, OVERTIME_STATUSES, type CreateOvertimeRequestData } from "@/services/overtime-request-service"

export function AdminOvertime() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRequest, setEditingRequest] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAutoCreateModal, setShowAutoCreateModal] = useState(false)
  const [formData, setFormData] = useState<CreateOvertimeRequestData>({
    assigned_to: 0,
    covering_for: undefined,
    overtime_date: "",
    start_time: "08:00",
    end_time: "16:00",
    reason: "",
    overtime_type: "leave_coverage",
    overtime_hours: undefined,
    overtime_rate: undefined,
  })
  const [autoCreateData, setAutoCreateData] = useState({
    leave_date: "",
    employee_on_leave: 0,
    coverage_employees: [] as number[],
  })
  const [submitting, setSubmitting] = useState(false)

  const {
    overtimeRequests,
    loading,
    fetchOvertimeRequests,
    createOvertimeRequest,
    updateOvertimeRequest,
    deleteOvertimeRequest,
    autoCreateOvertimeForLeave,
  } = useOvertimeRequests({
    status: statusFilter === "all" ? undefined : statusFilter,
    overtime_type: typeFilter === "all" ? undefined : typeFilter,
  })

  const { employees } = useEmployees()

  const handleCreateRequest = async () => {
    setSubmitting(true)
    try {
      await createOvertimeRequest(formData)
      setShowCreateModal(false)
      resetForm()
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditRequest = (request: any) => {
    setEditingRequest(request)
    setFormData({
      assigned_to: request.assigned_to,
      covering_for: request.covering_for,
      overtime_date: request.overtime_date,
      start_time: request.start_time,
      end_time: request.end_time,
      reason: request.reason,
      overtime_type: request.overtime_type,
      overtime_hours: request.overtime_hours,
      overtime_rate: request.overtime_rate,
    })
    setShowEditModal(true)
  }

  const handleUpdateRequest = async () => {
    if (!editingRequest) return

    setSubmitting(true)
    try {
      await updateOvertimeRequest(editingRequest.id, formData)
      setShowEditModal(false)
      setEditingRequest(null)
      resetForm()
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRequest = async (id: number) => {
    if (confirm("Are you sure you want to delete this overtime request?")) {
      await deleteOvertimeRequest(id)
    }
  }

  const handleAutoCreate = async () => {
    setSubmitting(true)
    try {
      await autoCreateOvertimeForLeave(autoCreateData)
      setShowAutoCreateModal(false)
      setAutoCreateData({
        leave_date: "",
        employee_on_leave: 0,
        coverage_employees: [],
      })
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      assigned_to: 0,
      covering_for: undefined,
      overtime_date: "",
      start_time: "08:00",
      end_time: "16:00",
      reason: "",
      overtime_type: "leave_coverage",
      overtime_hours: undefined,
      overtime_rate: undefined,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "accepted":
        return (
          <Badge variant="default" className="bg-green-50 text-green-700 border-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        )
      case "declined":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Declined
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      leave_coverage: "bg-blue-50 text-blue-700 border-blue-300",
      event_coverage: "bg-purple-50 text-purple-700 border-purple-300",
      emergency: "bg-red-50 text-red-700 border-red-300",
      special_duty: "bg-green-50 text-green-700 border-green-300",
    }
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors] || ""}>
        {OVERTIME_TYPES[type as keyof typeof OVERTIME_TYPES]}
      </Badge>
    )
  }

  // Statistics
  const totalRequests = overtimeRequests.length
  const pendingRequests = overtimeRequests.filter((r) => r.status === "pending").length
  const acceptedRequests = overtimeRequests.filter((r) => r.status === "accepted").length
  const declinedRequests = overtimeRequests.filter((r) => r.status === "declined").length
  const totalHours = overtimeRequests
    .filter((r) => r.status === "accepted")
    .reduce((sum, r) => sum + (r.overtime_hours || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Overtime Management
          </h2>
          <p className="text-muted-foreground">Create and manage overtime requests for employees</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchOvertimeRequests} disabled={loading} variant="outline" className="gap-2 bg-transparent">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
          <Dialog open={showAutoCreateModal} onOpenChange={setShowAutoCreateModal}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Users className="h-4 w-4" />
                Auto Create for Leave
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Auto Create Overtime for Leave Coverage</DialogTitle>
                <DialogDescription>
                  Automatically create overtime requests for employees to cover someone's leave
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="leave_date">Leave Date</Label>
                  <Input
                    id="leave_date"
                    type="date"
                    value={autoCreateData.leave_date}
                    onChange={(e) => setAutoCreateData({ ...autoCreateData, leave_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee_on_leave">Employee on Leave</Label>
                  <Select
                    value={autoCreateData.employee_on_leave.toString()}
                    onValueChange={(value) =>
                      setAutoCreateData({ ...autoCreateData, employee_on_leave: Number.parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.first_name} {employee.last_name} ({employee.badge_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Coverage Employees (Select multiple)</Label>
                  <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-2">
                    {employees.map((employee) => (
                      <div key={employee.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`coverage-${employee.id}`}
                          checked={autoCreateData.coverage_employees.includes(employee.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAutoCreateData({
                                ...autoCreateData,
                                coverage_employees: [...autoCreateData.coverage_employees, employee.id],
                              })
                            } else {
                              setAutoCreateData({
                                ...autoCreateData,
                                coverage_employees: autoCreateData.coverage_employees.filter(
                                  (id) => id !== employee.id,
                                ),
                              })
                            }
                          }}
                          className="rounded"
                        />
                        <label htmlFor={`coverage-${employee.id}`} className="text-sm cursor-pointer">
                          {employee.first_name} {employee.last_name} ({employee.badge_number})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAutoCreateModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAutoCreate}
                  disabled={
                    submitting ||
                    !autoCreateData.leave_date ||
                    !autoCreateData.employee_on_leave ||
                    autoCreateData.coverage_employees.length === 0
                  }
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Users className="h-4 w-4 mr-2" />}
                  Create Overtime Requests
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Overtime Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Overtime Request</DialogTitle>
                <DialogDescription>Assign overtime work to an employee</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assigned_to">Assign To *</Label>
                  <Select
                    value={formData.assigned_to.toString()}
                    onValueChange={(value) => setFormData({ ...formData, assigned_to: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.first_name} {employee.last_name} ({employee.badge_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overtime_type">Overtime Type *</Label>
                  <Select
                    value={formData.overtime_type}
                    onValueChange={(value: any) => setFormData({ ...formData, overtime_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(OVERTIME_TYPES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.overtime_type === "leave_coverage" && (
                  <div className="space-y-2">
                    <Label htmlFor="covering_for">Covering For</Label>
                    <Select
                      value={formData.covering_for?.toString() || "none"}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          covering_for: value === "none" ? undefined : Number.parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee being covered" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id.toString()}>
                            {employee.first_name} {employee.last_name} ({employee.badge_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="overtime_date">Overtime Date *</Label>
                  <Input
                    id="overtime_date"
                    type="date"
                    value={formData.overtime_date}
                    onChange={(e) => setFormData({ ...formData, overtime_date: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time *</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time *</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="overtime_hours">Hours</Label>
                    <Input
                      id="overtime_hours"
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={formData.overtime_hours || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          overtime_hours: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                        })
                      }
                      placeholder="Auto-calculated"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overtime_rate">Rate ($/hour)</Label>
                    <Input
                      id="overtime_rate"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.overtime_rate || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          overtime_rate: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                        })
                      }
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason *</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Explain why overtime is needed"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRequest}
                  disabled={
                    submitting ||
                    !formData.assigned_to ||
                    !formData.overtime_date ||
                    !formData.start_time ||
                    !formData.end_time ||
                    !formData.reason
                  }
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Create Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      {totalRequests > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Requests</p>
                <p className="text-2xl font-bold">{totalRequests}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingRequests}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{acceptedRequests}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Declined</p>
                <p className="text-2xl font-bold text-red-600">{declinedRequests}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Hours</p>
                <p className="text-2xl font-bold text-blue-600">{totalHours}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Overtime Requests List */}
      {loading ? (
        <div className="text-center py-8">Loading overtime requests...</div>
      ) : overtimeRequests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No overtime requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {overtimeRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                    <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">Overtime Request #{request.id}</h3>
                        {getTypeBadge(request.overtime_type)}
                        {getStatusBadge(request.status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>
                            <span className="font-medium">Assigned:</span> {request.assigned_employee?.first_name} {request.assigned_employee?.last_name} ({request.assigned_employee?.badge_number})
                            </span>
                        </div>
                        {request.covering_for_employee && (
                            <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>
                                <span className="font-medium">Covering:</span> {request.covering_for_employee.first_name} {request.covering_for_employee.last_name} ({request.covering_for_employee.badge_number})
                            </span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(request.overtime_date), "PPP")}
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {request.start_time} - {request.end_time} ({request.overtime_hours} hours)
                        </div>
                        </div>
                    </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                    <div>
                        <p className="text-sm font-medium mb-1">Reason:</p>
                        <p className="text-sm text-muted-foreground">{request.reason}</p>
                    </div>

                    {request.employee_notes && (
                        <div className="bg-muted p-3 rounded">
                        <p className="text-sm font-medium mb-1">Employee Response:</p>
                        <p className="text-sm text-muted-foreground">{request.employee_notes}</p>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-xs text-muted-foreground">
                        <span>Created by {request.requester?.first_name} {request.requester?.last_name} on {format(new Date(request.created_at), "PPPp")}</span>
                        {request.responded_at && (
                            <span className="ml-2">• Responded on {format(new Date(request.responded_at), "PPPp")}</span>
                        )}
                        </div>
                        {request.status === "pending" && (
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditRequest(request)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteRequest(request.id)}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                            </Button>
                        </div>
                        )}
                    </div>
                    </div>
                </CardContent>
                </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Overtime Request</DialogTitle>
            <DialogDescription>Update the overtime request details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_assigned_to">Assign To *</Label>
              <Select
                value={formData.assigned_to.toString()}
                onValueChange={(value) => setFormData({ ...formData, assigned_to: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.first_name} {employee.last_name} ({employee.badge_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_overtime_type">Overtime Type *</Label>
              <Select
                value={formData.overtime_type}
                onValueChange={(value: any) => setFormData({ ...formData, overtime_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(OVERTIME_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_overtime_date">Overtime Date *</Label>
              <Input
                id="edit_overtime_date"
                type="date"
                value={formData.overtime_date}
                onChange={(e) => setFormData({ ...formData, overtime_date: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_start_time">Start Time *</Label>
                <Input
                  id="edit_start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_end_time">End Time *</Label>
                <Input
                  id="edit_end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_reason">Reason *</Label>
              <Textarea
                id="edit_reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Explain why overtime is needed"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRequest}
              disabled={
                submitting ||
                !formData.assigned_to ||
                !formData.overtime_date ||
                !formData.start_time ||
                !formData.end_time ||
                !formData.reason
              }
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
              Update Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
