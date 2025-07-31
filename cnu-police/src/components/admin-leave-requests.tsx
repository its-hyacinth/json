"use client"

import { useLeaveRequests } from "@/hooks/use-leave-requests"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Clock, User, FileText, Loader2, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { PDFExportButton } from "./pdf-export-button"

export function AdminLeaveRequests() {
  const { leaveRequests, loading, refetch, approveLeaveRequest, declineLeaveRequest } = useLeaveRequests()

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

  if (loading) {
    return <div className="text-center py-8">Loading leave requests...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Leave Requests
          </h2>
          <p className="text-muted-foreground">Manage employee leave requests and approvals</p>
        </div>
        <div className="flex gap-2">
          <PDFExportButton 
            data={leaveRequests || []} 
            type="leave" 
            className="bg-transparent" 
          />
          
          <Button 
            onClick={refetch} 
            disabled={loading} 
            variant="outline" 
            className="gap-2 bg-transparent"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </div>

      {leaveRequests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No leave requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {leaveRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <CardTitle className="text-lg">
                      {request.user?.first_name} {request.user?.last_name}
                      <span className="text-sm text-muted-foreground ml-2">({request.user?.badge_number})</span>
                    </CardTitle>
                    {getLeaveTypeBadge(request.type)}
                  </div>
                  {getStatusBadge(request.status)}
                </div>
                <CardDescription>
                  Submitted on {format(new Date(request.created_at), "PPP")} • {request.user?.division}
                </CardDescription>
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
                      <p>
                        <span className="font-medium">Status:</span>{" "}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Reason</h4>
                    <p className="text-sm text-muted-foreground">{request.reason || "No reason provided"}</p>
                  </div>
                </div>

                {request.status === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => approveLeaveRequest(request.id)}
                      className="flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => declineLeaveRequest(request.id)}
                      className="flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                      Decline
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}