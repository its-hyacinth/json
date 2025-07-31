"use client"

import type React from "react"

import { useState } from "react"
import { useLeaveRequests } from "@/hooks/use-leave-requests"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Clock, Check, X, FileText } from "lucide-react"
import { format } from "date-fns"
import { PDFExportButton } from "./pdf-export-button"

export function EmployeeLeaveRequest() {
  const { leaveRequests, loading, createLeaveRequest } = useLeaveRequests()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    type: "" as "C" | "SD" | "",
    reason: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.start_date || !formData.end_date || !formData.type) return

    await createLeaveRequest({
      start_date: formData.start_date,
      end_date: formData.end_date,
      type: formData.type,
      reason: formData.reason || undefined,
    })

    setFormData({
      start_date: "",
      end_date: "",
      type: "",
      reason: "",
    })
    setIsDialogOpen(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="default">
            <Check className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "declined":
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            Declined
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getLeaveTypeBadge = (type: string) => {
    switch (type) {
      case "C":
        return <Badge variant="secondary">Ordinary Leave</Badge>
      case "SD":
        return <Badge variant="destructive">Sick Leave</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with New Request Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Leave Requests
          </h2>          
          <p className="text-muted-foreground">Submit and track your leave requests</p>
        </div>
        <div className="flex gap-2">
          <PDFExportButton 
            data={leaveRequests || []} 
            type="leave" 
            className="bg-transparent" 
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Leave Request</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="type">Leave Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "C" | "SD") => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="C">Ordinary Leave (C)</SelectItem>
                      <SelectItem value="SD">Sick Leave (SD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Textarea
                    id="reason"
                    placeholder="Provide a reason for your leave request..."
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit Request</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Leave Requests List */}
      {loading ? (
        <div className="text-center py-8">Loading your leave requests...</div>
      ) : leaveRequests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No leave requests found</p>
            <p className="text-sm text-muted-foreground mt-2">Click "New Request" to submit your first leave request</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {leaveRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">Leave Request #{request.id}</CardTitle>
                    {getLeaveTypeBadge(request.type)}
                  </div>
                  {getStatusBadge(request.status)}
                </div>
                <CardDescription>Submitted on {format(new Date(request.created_at), "PPP")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Leave Details</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Start Date:</span> {format(new Date(request.start_date), "PPP")}
                      </p>
                      <p>
                        <span className="font-medium">End Date:</span> {format(new Date(request.end_date), "PPP")}
                      </p>
                      <p>
                        <span className="font-medium">Type:</span>{" "}
                        {request.type === "C" ? "Ordinary Leave" : "Sick Leave"}
                      </p>
                    </div>
                  </div>

                  {request.reason && (
                    <div>
                      <h4 className="font-medium mb-2">Reason</h4>
                      <p className="text-sm text-muted-foreground">{request.reason}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
