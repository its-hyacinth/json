"use client"

import { useState } from "react"
import { useOvertimeRequests } from "@/hooks/use-overtime-requests"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Clock, Check, X, User, Calendar, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { OVERTIME_TYPES } from "@/services/overtime-request-service"

export function EmployeeOvertime() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [responseAction, setResponseAction] = useState<"accept" | "decline">("accept")
  const [employeeNotes, setEmployeeNotes] = useState("")
  const [responding, setResponding] = useState(false)

  const { overtimeRequests, loading, acceptOvertimeRequest, declineOvertimeRequest } = useOvertimeRequests()

  const handleResponseAction = (request: any, action: "accept" | "decline") => {
    setSelectedRequest(request)
    setResponseAction(action)
    setEmployeeNotes("")
    setShowResponseModal(true)
  }

  const handleSubmitResponse = async () => {
    if (!selectedRequest) return

    setResponding(true)
    try {
      if (responseAction === "accept") {
        await acceptOvertimeRequest(selectedRequest.id, employeeNotes || undefined)
      } else {
        if (!employeeNotes.trim()) {
          alert("Please provide a reason for declining the overtime request")
          return
        }
        await declineOvertimeRequest(selectedRequest.id, employeeNotes)
      }
      setShowResponseModal(false)
      setSelectedRequest(null)
      setEmployeeNotes("")
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setResponding(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending Response
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
            Overtime Requests
          </h2>
          <p className="text-muted-foreground">Review and respond to overtime assignments</p>
        </div>
      </div>

      {/* Statistics */}
      {totalRequests > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
        <div className="text-center py-8">Loading your overtime requests...</div>
      ) : overtimeRequests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No overtime requests found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Overtime requests will appear here when assigned by administrators
            </p>
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
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Requested by {request.requester?.first_name} {request.requester?.last_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(request.overtime_date), "PPP")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {request.start_time} - {request.end_time}
                      </div>
                      {request.overtime_hours && <div>{request.overtime_hours} hours</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">{getStatusBadge(request.status)}</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Reason for Overtime</h4>
                    <p className="text-sm text-muted-foreground">{request.reason}</p>
                  </div>

                  {request.covering_for_employee && (
                    <div>
                      <h4 className="font-medium mb-2">Coverage Details</h4>
                      <p className="text-sm text-muted-foreground">
                        You will be covering for {request.covering_for_employee.first_name} {request.covering_for_employee.last_name} (
                        {request.covering_for_employee.badge_number})
                      </p>
                    </div>
                  )}

                  {request.overtime_rate && (
                    <div>
                      <h4 className="font-medium mb-2">Compensation</h4>
                      <p className="text-sm text-muted-foreground">
                        Rate: ${request.overtime_rate.toFixed(2)}/hour
                        {request.overtime_hours && (
                          <span className="ml-2">
                            • Total: ${(request.overtime_rate * request.overtime_hours).toFixed(2)}
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {request.employee_notes && (
                    <div className="bg-muted p-3 rounded">
                      <p className="text-sm font-medium mb-1">Your Response:</p>
                      <p className="text-sm text-muted-foreground">{request.employee_notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-xs text-muted-foreground">
                      Created {format(new Date(request.created_at), "PPP")}
                      {request.responded_at && (
                        <span className="ml-2">• Responded {format(new Date(request.responded_at), "PPP")}</span>
                      )}
                    </div>
                    {request.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleResponseAction(request, "accept")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleResponseAction(request, "decline")}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Decline
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

      {/* Response Modal */}
      <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{responseAction === "accept" ? "Accept" : "Decline"} Overtime Request</DialogTitle>
            <DialogDescription>
              {responseAction === "accept"
                ? "Accept this overtime assignment. You can optionally add notes."
                : "Decline this overtime assignment. Please provide a reason."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRequest && (
              <div className="bg-muted p-3 rounded">
                <p className="text-sm font-medium mb-1">Overtime Details:</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedRequest.overtime_date), "PPP")} • {selectedRequest.start_time} -{" "}
                  {selectedRequest.end_time}
                  {selectedRequest.overtime_hours && <span> • {selectedRequest.overtime_hours} hours</span>}
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="employee-notes">
                {responseAction === "accept" ? "Notes (Optional)" : "Reason for Decline"}
              </Label>
              <Textarea
                id="employee-notes"
                value={employeeNotes}
                onChange={(e) => setEmployeeNotes(e.target.value)}
                placeholder={
                  responseAction === "accept"
                    ? "Add any notes about accepting this overtime..."
                    : "Please explain why you cannot work this overtime..."
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResponseModal(false)} disabled={responding}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResponse}
              disabled={responding || (responseAction === "decline" && !employeeNotes.trim())}
              className={responseAction === "accept" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={responseAction === "decline" ? "destructive" : "default"}
            >
              {responding ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : responseAction === "accept" ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              {responseAction === "accept" ? "Accept Overtime" : "Decline Overtime"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
