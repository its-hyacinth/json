"use client"

import { useState } from "react"
import { useTrainingRequests } from "@/hooks/use-training-requests"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
} from "@/components/ui/dialog"
import {
  GraduationCap,
  Check,
  X,
  Clock,
  User,
  Calendar,
  MapPin,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Filter,
  RefreshCw,
  Paperclip,
} from "lucide-react"
import { format } from "date-fns"
import { TRAINING_PRIORITIES, TRAINING_STATUSES, type TrainingRequest } from "@/services/training-request-service"
import { PDFExportButton } from "./pdf-export-button"
import { useToast } from "@/hooks/use-toast"

export function AdminTrainingRequests() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<TrainingRequest | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalAction, setApprovalAction] = useState<"approve" | "decline">("approve")
  const [adminNotes, setAdminNotes] = useState("")
  const { toast } = useToast()

  const {
    trainingRequests,
    loading,
    fetchTrainingRequests,
    approveTrainingRequest,
    declineTrainingRequest,
    markTrainingCompleted,
    downloadAttachment,
    error,
  } = useTrainingRequests({
    status: statusFilter === "all" ? undefined : statusFilter,
  })

  const handleViewDetails = (request: TrainingRequest) => {
    setSelectedRequest(request)
    setShowDetailsModal(true)
  }

  const handleApprovalAction = (request: TrainingRequest, action: "approve" | "decline") => {
    setSelectedRequest(request)
    setApprovalAction(action)
    setAdminNotes("")
    setShowApprovalModal(true)
  }

  const handleDownloadAttachment = async (requestId: number) => {
    try {
      await downloadAttachment(requestId)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleSubmitApproval = async () => {
    if (!selectedRequest) return

    try {
      if (approvalAction === "approve") {
        await approveTrainingRequest(selectedRequest.id, adminNotes || undefined)
      } else {
        if (!adminNotes.trim()) {
          toast({
            title: "Validation Error",
            description: "Please provide a reason for declining the request",
            variant: "destructive",
          })
          return
        }
        await declineTrainingRequest(selectedRequest.id, adminNotes)
      }
      setShowApprovalModal(false)
      setSelectedRequest(null)
      setAdminNotes("")
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleMarkCompleted = async (request: TrainingRequest) => {
    try {
      await markTrainingCompleted(request.id)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const getStatusBadge = (status: keyof typeof TRAINING_STATUSES) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            {TRAINING_STATUSES.pending}
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="default" className="bg-green-50 text-green-700 border-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {TRAINING_STATUSES.approved}
          </Badge>
        )
      case "declined":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            {TRAINING_STATUSES.declined}
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-300">
            <Check className="h-3 w-3 mr-1" />
            {TRAINING_STATUSES.completed}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Training Requests
          </h2>
          <p className="text-muted-foreground">Review and manage employee training requests</p>
        </div>
        <div className="flex gap-2">
          <PDFExportButton data={trainingRequests} type="training" className="bg-transparent" />
          <Button onClick={fetchTrainingRequests} disabled={loading} variant="outline" className="gap-2 bg-transparent">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(TRAINING_STATUSES).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Training Requests List */}
      {loading ? (
        <div className="text-center py-8">Loading training requests...</div>
      ) : trainingRequests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No training requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {trainingRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{request.training_title}</h3>
                      {request.attachment_name && (
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {request.user?.first_name} {request.user?.last_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(request.start_date), "MMM d")} -{" "}
                        {format(new Date(request.end_date), "MMM d, yyyy")}
                      </div>
                      {request.start_time && request.end_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {request.start_time} - {request.end_time}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status as keyof typeof TRAINING_STATUSES)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {request.training_description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{request.training_description}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {request.training_provider && (
                      <div>
                        <span className="font-medium">Provider:</span> {request.training_provider}
                      </div>
                    )}
                    {request.training_location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {request.training_location}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-xs text-muted-foreground">
                      Submitted {format(new Date(request.created_at), "PPP")}
                    </div>
                    <div className="flex gap-2">
                      {request.attachment_name && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDownloadAttachment(request.id)}
                        >
                          <Paperclip className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleViewDetails(request)}>
                        View Details
                      </Button>
                      {request.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprovalAction(request, "approve")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApprovalAction(request, "decline")}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </>
                      )}
                      {request.status === "approved" && (
                        <Button size="sm" variant="outline" onClick={() => handleMarkCompleted(request)}>
                          <Check className="h-4 w-4 mr-1" />
                          Mark Completed
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Training Request Details</DialogTitle>
            <DialogDescription>Complete information about the training request</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Employee:</span> {selectedRequest.user?.first_name} {selectedRequest.user?.last_name}
                    </div>
                    <div>
                      <span className="font-medium">Training Title:</span> {selectedRequest.training_title}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {getStatusBadge(selectedRequest.status as keyof typeof TRAINING_STATUSES)}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Schedule & Cost</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Start Date:</span>{" "}
                      {format(new Date(selectedRequest.start_date), "PPP")}
                    </div>
                    <div>
                      <span className="font-medium">End Date:</span> {format(new Date(selectedRequest.end_date), "PPP")}
                    </div>
                    {selectedRequest.start_time && selectedRequest.end_time && (
                      <div>
                        <span className="font-medium">Time:</span> {selectedRequest.start_time} -{" "}
                        {selectedRequest.end_time}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Employee Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Division:</span> {selectedRequest.user?.division}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedRequest.user?.email}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {selectedRequest.user?.phone}
                  </div>
                </div>
              </div>

              {selectedRequest.training_description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedRequest.training_description}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Justification</h4>
                <p className="text-sm text-muted-foreground">{selectedRequest.justification}</p>
              </div>

              {selectedRequest.training_provider && (
                <div>
                  <h4 className="font-medium mb-2">Provider & Location</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">Provider:</span> {selectedRequest.training_provider}
                    </div>
                    {selectedRequest.training_location && (
                      <div>
                        <span className="font-medium">Location:</span> {selectedRequest.training_location}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedRequest.admin_notes && (
                <div>
                  <h4 className="font-medium mb-2">Admin Notes</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">{selectedRequest.admin_notes}</p>
                </div>
              )}

              {selectedRequest.approved_by && selectedRequest.approved_at && (
                <div className="pt-4 border-t text-xs text-muted-foreground">
                  {selectedRequest.status === "approved" ? "Approved" : "Processed"} by{" "}
                  {selectedRequest.approver?.first_name} {selectedRequest.approver?.last_name} on{" "}
                  {format(new Date(selectedRequest.approved_at), "PPP")}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{approvalAction === "approve" ? "Approve" : "Decline"} Training Request</DialogTitle>
            <DialogDescription>
              {approvalAction === "approve"
                ? "Approve this training request. You can optionally add notes."
                : "Decline this training request. Please provide a reason."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-notes">
                {approvalAction === "approve" ? "Notes (Optional)" : "Reason for Decline"}
              </Label>
              <Textarea
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={
                  approvalAction === "approve"
                    ? "Add any notes about the approval..."
                    : "Please explain why this request is being declined..."
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalModal(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitApproval}
              disabled={loading || (approvalAction === "decline" && !adminNotes.trim())}
              className={approvalAction === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={approvalAction === "decline" ? "destructive" : "default"}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : approvalAction === "approve" ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              {approvalAction === "approve" ? "Approve Request" : "Decline Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}