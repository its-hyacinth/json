"use client"

import { useState } from "react"
import { useTrainingRequests } from "@/hooks/use-training-requests"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"
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
  GraduationCap,
  Plus,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Loader2,
  Download,
  Paperclip,
  Eye,
} from "lucide-react"
import { format } from "date-fns"
import type { CreateTrainingRequestData } from "@/services/training-request-service"

export function EmployeeTrainingRequests() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRequest, setEditingRequest] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [formData, setFormData] = useState<CreateTrainingRequestData>({
    training_title: "",
    training_description: "",
    training_provider: "",
    training_location: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    justification: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  const {
    trainingRequests,
    loading,
    createTrainingRequest,
    updateTrainingRequest,
    deleteTrainingRequest,
    downloadAttachment,
  } = useTrainingRequests()

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request)
    setShowDetailsModal(true)
  }

  const handleCreateRequest = async () => {
    setSubmitting(true)
    try {
      await createTrainingRequest(formData, selectedFile)
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
      training_title: request.training_title,
      training_description: request.training_description || "",
      training_provider: request.training_provider || "",
      training_location: request.training_location || "",
      start_date: request.start_date,
      end_date: request.end_date,
      start_time: request.start_time || "",
      end_time: request.end_time || "",
      justification: request.justification,
    })
    setSelectedFile(null)
    setShowEditModal(true)
  }

  const handleUpdateRequest = async () => {
    if (!editingRequest) return

    setSubmitting(true)
    try {
      await updateTrainingRequest(editingRequest.id, formData, selectedFile)
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
    if (confirm("Are you sure you want to delete this training request?")) {
      await deleteTrainingRequest(id)
    }
  }

  const handleDownloadAttachment = async (request: any) => {
    try {
      await downloadAttachment(request.id)
    } catch (error) {
      console.error("Failed to download attachment:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      training_title: "",
      training_description: "",
      training_provider: "",
      training_location: "",
      start_date: "",
      end_date: "",
      start_time: "",
      end_time: "",
      justification: "",
    })
    setSelectedFile(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="default" className="bg-green-50 text-green-700 border-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "declined":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Declined
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
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
          <p className="text-muted-foreground">Submit and track your training requests</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit Training Request</DialogTitle>
                <DialogDescription>Fill out the form to request training approval</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="training_title">Training Title *</Label>
                    <Input
                      id="training_title"
                      value={formData.training_title}
                      onChange={(e) => setFormData({ ...formData, training_title: e.target.value })}
                      placeholder="Enter training title"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="training_description">Description</Label>
                  <Textarea
                    id="training_description"
                    value={formData.training_description}
                    onChange={(e) => setFormData({ ...formData, training_description: e.target.value })}
                    placeholder="Describe the training content and objectives"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="training_provider">Training Provider</Label>
                    <Input
                      id="training_provider"
                      value={formData.training_provider}
                      onChange={(e) => setFormData({ ...formData, training_provider: e.target.value })}
                      placeholder="Organization or institution"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="training_location">Location</Label>
                    <Input
                      id="training_location"
                      value={formData.training_location}
                      onChange={(e) => setFormData({ ...formData, training_location: e.target.value })}
                      placeholder="Training location"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="justification">Justification *</Label>
                  <Textarea
                    id="justification"
                    value={formData.justification}
                    onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                    placeholder="Explain why this training is necessary and how it will benefit your role"
                    rows={3}
                  />
                </div>

                <FileUpload onFileSelect={setSelectedFile} disabled={submitting} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRequest}
                  disabled={
                    submitting ||
                    !formData.training_title ||
                    !formData.start_date ||
                    !formData.end_date ||
                    !formData.justification
                  }
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Submit Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Training Requests List */}
      {loading ? (
        <div className="text-center py-8">Loading your training requests...</div>
      ) : trainingRequests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No training requests found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click "New Request" to submit your first training request
            </p>
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
                        <Badge variant="outline" className="text-xs">
                          <Paperclip className="h-3 w-3 mr-1" />
                          Attachment
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(request.start_date), "MMM d")} -{" "}
                        {format(new Date(request.end_date), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">{getStatusBadge(request.status)}</div>
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

                  {request.attachment_name && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        <span className="text-sm font-medium">{request.attachment_name}</span>
                        {request.attachment_size_formatted && (
                          <span className="text-xs text-muted-foreground">({request.attachment_size_formatted})</span>
                        )}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadAttachment(request)}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}

                  {request.admin_notes && (
                    <div className="bg-muted p-3 rounded">
                      <p className="text-sm font-medium mb-1">Admin Notes:</p>
                      <p className="text-sm text-muted-foreground">{request.admin_notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-xs text-muted-foreground">
                      Submitted {format(new Date(request.created_at), "PPP")}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleViewDetails(request)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {request.status === "pending" && (
                        <>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDeleteRequest(request.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Training Request</DialogTitle>
            <DialogDescription>Update your training request details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_training_title">Training Title *</Label>
                <Input
                  id="edit_training_title"
                  value={formData.training_title}
                  onChange={(e) => setFormData({ ...formData, training_title: e.target.value })}
                  placeholder="Enter training title"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_training_description">Description</Label>
              <Textarea
                id="edit_training_description"
                value={formData.training_description}
                onChange={(e) => setFormData({ ...formData, training_description: e.target.value })}
                placeholder="Describe the training content and objectives"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_training_provider">Training Provider</Label>
                <Input
                  id="edit_training_provider"
                  value={formData.training_provider}
                  onChange={(e) => setFormData({ ...formData, training_provider: e.target.value })}
                  placeholder="Organization or institution"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_training_location">Location</Label>
                <Input
                  id="edit_training_location"
                  value={formData.training_location}
                  onChange={(e) => setFormData({ ...formData, training_location: e.target.value })}
                  placeholder="Training location"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_start_date">Start Date *</Label>
                <Input
                  id="edit_start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_end_date">End Date *</Label>
                <Input
                  id="edit_end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_start_time">Start Time</Label>
                <Input
                  id="edit_start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_end_time">End Time</Label>
                <Input
                  id="edit_end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_justification">Justification *</Label>
              <Textarea
                id="edit_justification"
                value={formData.justification}
                onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                placeholder="Explain why this training is necessary and how it will benefit your role"
                rows={3}
              />
            </div>

            <FileUpload
              onFileSelect={setSelectedFile}
              currentFile={editingRequest?.attachment_name}
              disabled={submitting}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRequest}
              disabled={
                submitting ||
                !formData.training_title ||
                !formData.start_date ||
                !formData.end_date ||
                !formData.justification
              }
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
              Update Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Training Request Details</DialogTitle>
            <DialogDescription>Complete information about your training request</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Training Title:</span> {selectedRequest.training_title}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {getStatusBadge(selectedRequest.status)}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Schedule</h4>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedRequest.training_provider && (
                  <div>
                    <h4 className="font-medium mb-2">Provider</h4>
                    <p className="text-sm text-muted-foreground">{selectedRequest.training_provider}</p>
                  </div>
                )}
                {selectedRequest.training_location && (
                  <div>
                    <h4 className="font-medium mb-2">Location</h4>
                    <p className="text-sm text-muted-foreground">{selectedRequest.training_location}</p>
                  </div>
                )}
              </div>

              {selectedRequest.attachment_name && (
                <div>
                  <h4 className="font-medium mb-2">Attachment</h4>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      <span className="text-sm font-medium">{selectedRequest.attachment_name}</span>
                      {selectedRequest.attachment_size_formatted && (
                        <span className="text-xs text-muted-foreground">({selectedRequest.attachment_size_formatted})</span>
                      )}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleDownloadAttachment(selectedRequest)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {selectedRequest.admin_notes && (
                <div>
                  <h4 className="font-medium mb-2">Admin Notes</h4>
                  <div className="bg-muted p-3 rounded">
                    <p className="text-sm text-muted-foreground">{selectedRequest.admin_notes}</p>
                  </div>
                </div>
              )}

              {selectedRequest.approved_at && (
                <div className="pt-4 border-t text-xs text-muted-foreground">
                  {selectedRequest.status === "approved" ? "Approved" : "Processed"} on{" "}
                  {format(new Date(selectedRequest.approved_at), "PPP")}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
