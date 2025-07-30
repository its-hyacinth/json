"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useCourtRequests } from "@/hooks/use-court-requests"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  Gavel,
  MapPin,
  FileText,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { COURT_TYPES, type CourtRequest } from "@/services/court-request-service"

export function AdminCourt() {
  const { user } = useAuth()
  const [selectedRequest, setSelectedRequest] = useState<CourtRequest | null>(null)
  const [showResponseDialog, setShowResponseDialog] = useState(false)
  const [responseStatus, setResponseStatus] = useState<"accepted" | "declined">("accepted")
  const [employeeNotes, setEmployeeNotes] = useState("")

  // Memoize filters to prevent infinite re-renders
  const filters = useMemo(() => ({
    employee_id: user?.id
  }), [user?.id])

  const { courtRequests, loading, acceptCourtRequest, declineCourtRequest, refetch } = useCourtRequests(filters)

  const handleResponse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest) return

    try {
      if (responseStatus === "accepted") {
        await acceptCourtRequest(selectedRequest.id, employeeNotes)
      } else {
        await declineCourtRequest(selectedRequest.id, employeeNotes)
      }
      setShowResponseDialog(false)
      setSelectedRequest(null)
      setEmployeeNotes("")
      setResponseStatus("accepted")
    } catch (error) {
      // Error handled by hook
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending Response
          </Badge>
        )
      case "accepted":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        )
      case "declined":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Declined
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCourtTypeBadge = (type: string) => {
    const colors = {
      criminal: "bg-red-100 text-red-700 border-red-300",
      civil: "bg-blue-100 text-blue-700 border-blue-300",
      traffic: "bg-orange-100 text-orange-700 border-orange-300",
      family: "bg-purple-100 text-purple-700 border-purple-300",
      juvenile: "bg-pink-100 text-pink-700 border-pink-300",
      administrative: "bg-gray-100 text-gray-700 border-gray-300",
    }

    return (
      <Badge variant="outline" className={cn("text-xs", colors[type as keyof typeof colors])}>
        <Gavel className="h-3 w-3 mr-1" />
        {COURT_TYPES[type as keyof typeof COURT_TYPES]}
      </Badge>
    )
  }

  // Ensure courtRequests.data exists before filtering
  const pendingRequests = courtRequests?.data.filter((req) => req.status === "pending") || []
  const respondedRequests = courtRequests?.data.filter((req) => req.status !== "pending") || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Gavel className="h-6 w-6" />
          My Court Appearances
        </h2>
        <p className="text-muted-foreground">View and respond to court appearance requests</p>
      </div>

      {/* Court Requests */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="responded" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Responded ({respondedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending court requests</h3>
                <p className="text-muted-foreground">You have no court appearance requests awaiting your response.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="border-yellow-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getCourtTypeBadge(request.court_type)}
                          {getStatusBadge(request.status)}
                        </div>
                        <CardTitle className="text-lg">Court Appearance Request</CardTitle>
                        <CardDescription>
                          Requested by {request.creator?.name} on {format(new Date(request.created_at), "MMM d, yyyy")}
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowResponseDialog(true)
                        }}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        Respond
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{format(new Date(request.court_date), "EEEE, MMMM d, yyyy")}</p>
                          {request.court_time && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {request.court_time}
                            </p>
                          )}
                        </div>
                      </div>

                      {request.case_number && (
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Case Number</p>
                            <p className="text-sm font-mono">{request.case_number}</p>
                          </div>
                        </div>
                      )}

                      {request.location && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Location</p>
                            <p className="text-sm">{request.location}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Requested by</p>
                          <p className="text-sm">{request.creator?.name}</p>
                        </div>
                      </div>
                    </div>

                    {request.description && (
                      <div className="space-y-2">
                        <p className="font-medium">Description</p>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{request.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="responded" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : respondedRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No responded requests</h3>
                <p className="text-muted-foreground">You haven't responded to any court requests yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {respondedRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getCourtTypeBadge(request.court_type)}
                          {getStatusBadge(request.status)}
                        </div>
                        <CardTitle className="text-lg">Court Appearance Request</CardTitle>
                        <CardDescription>
                          Responded on{" "}
                          {request.responded_at ? format(new Date(request.responded_at), "MMM d, yyyy") : "N/A"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{format(new Date(request.court_date), "EEEE, MMMM d, yyyy")}</p>
                          {request.court_time && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {request.court_time}
                            </p>
                          )}
                        </div>
                      </div>

                      {request.case_number && (
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Case Number</p>
                            <p className="text-sm font-mono">{request.case_number}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {request.employee_notes && (
                      <div className="space-y-2">
                        <p className="font-medium flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Your Response Notes
                        </p>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                          {request.employee_notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Respond to Court Request</DialogTitle>
            <DialogDescription>Please respond to the court appearance request</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <form onSubmit={handleResponse} className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Court Details:</p>
                <div className="bg-muted p-3 rounded-lg space-y-1">
                  <p className="text-sm">
                    <strong>Date:</strong> {format(new Date(selectedRequest.court_date), "EEEE, MMMM d, yyyy")}
                  </p>
                  {selectedRequest.court_time && (
                    <p className="text-sm">
                      <strong>Time:</strong> {selectedRequest.court_time}
                    </p>
                  )}
                  {selectedRequest.case_number && (
                    <p className="text-sm">
                      <strong>Case:</strong> {selectedRequest.case_number}
                    </p>
                  )}
                  <p className="text-sm">
                    <strong>Type:</strong> {COURT_TYPES[selectedRequest.court_type as keyof typeof COURT_TYPES]}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Response</Label>
                <Select
                  value={responseStatus}
                  onValueChange={(value: "accepted" | "declined") => setResponseStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accepted">Accept</SelectItem>
                    <SelectItem value="declined">Decline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee_notes">
                  {responseStatus === "accepted" ? "Notes (Optional)" : "Reason for Declining (Required)"}
                </Label>
                <Textarea
                  id="employee_notes"
                  value={employeeNotes}
                  onChange={(e) => setEmployeeNotes(e.target.value)}
                  placeholder={
                    responseStatus === "accepted" 
                      ? "Add any notes about your response..." 
                      : "Please provide a reason for declining..."
                  }
                  rows={3}
                  required={responseStatus === "declined"}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Submit Response
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowResponseDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}