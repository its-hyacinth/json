"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useCourtRequests } from "@/hooks/use-court-requests"
import { useEmployees } from "@/hooks/use-employees"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/ui/file-upload"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Calendar,
  Clock,
  Plus,
  Gavel,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Paperclip,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { COURT_TYPES, type CreateCourtRequestData, type CourtRequestFilters } from "@/services/court-request-service"
import { useAuth } from "@/contexts/auth-context"

export function EmployeeCourt() {
  const { user } = useAuth()
  const [filters, setFilters] = useState<CourtRequestFilters>({
    employee_id: user?.id || 0,
  })
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createData, setCreateData] = useState<CreateCourtRequestData>({
    employee_id: 0,
    court_date: "",
    court_time: "",
    court_type: "criminal",
    description: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const { courtRequests, refetch, loading, createCourtRequest, deleteCourtRequest, downloadAttachment } =
    useCourtRequests(filters)
  const { employees = [] } = useEmployees()

  // Filter admins from employees
  const admins = employees.filter((employee) => employee.role === "admin")

  // Auto-select the first admin when admins load
  useEffect(() => {
    if (admins.length > 0 && createData.employee_id === 0) {
      setCreateData((prev) => ({ ...prev, employee_id: admins[0].id }))
    }
  }, [admins])

  const handleCreateCourtRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCourtRequest(createData, selectedFile)
      setShowCreateDialog(false)
      setCreateData({
        employee_id: admins.length > 0 ? admins[0].id : 0,
        court_date: "",
        court_time: "",
        court_type: "criminal",
        description: "",
      })
      setSelectedFile(null)
      await refetch()
    } catch (error) {
      console.error("Failed to create court request:", error)
    }
  }

  const handleDownloadAttachment = async (request: any) => {
    try {
      await downloadAttachment(request.id)
    } catch (error) {
      console.error("Failed to download attachment:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gavel className="h-6 w-6" />
            Court Management
          </h2>
          <p className="text-muted-foreground">Manage court appearances and requests for employees</p>
        </div>

        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Court Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Court Request</DialogTitle>
                <DialogDescription>Request a court appearance for an admin</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCourtRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Admin</Label>
                  <Select
                    value={createData.employee_id.toString()}
                    onValueChange={(value) =>
                      setCreateData((prev) => ({ ...prev, employee_id: Number.parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={admins.length > 0 ? "Select admin" : "No admins available"} />
                    </SelectTrigger>
                    <SelectContent>
                      {admins.length > 0 ? (
                        admins.map((admin) => (
                          <SelectItem key={admin.id} value={admin.id.toString()}>
                            {admin.first_name} {admin.last_name} {admin.badge_number && `(#${admin.badge_number})`}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="0" disabled>
                          No admins available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="court_date">Court Date</Label>
                    <Input
                      id="court_date"
                      type="date"
                      value={createData.court_date}
                      onChange={(e) => setCreateData((prev) => ({ ...prev, court_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="court_time">Court Time</Label>
                    <Input
                      id="court_time"
                      type="time"
                      value={createData.court_time}
                      onChange={(e) => setCreateData((prev) => ({ ...prev, court_time: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="court_type">Court Type</Label>
                  <Select
                    value={createData.court_type}
                    onValueChange={(value) => setCreateData((prev) => ({ ...prev, court_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(COURT_TYPES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={createData.description}
                    onChange={(e) => setCreateData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional details about the court appearance..."
                    rows={3}
                  />
                </div>

                <FileUpload onFileSelect={setSelectedFile} />

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={admins.length === 0}>
                    Create Request
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value === "all" ? undefined : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Court Type</Label>
              <Select
                value={filters.court_type || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, court_type: value === "all" ? undefined : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(COURT_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Admin</Label>
              <Select
                value={filters.employee_id?.toString() || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, employee_id: value === "all" ? undefined : Number.parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Admins</SelectItem>
                  {admins.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id.toString()}>
                      {admin.first_name} {admin.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Court Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Court Requests</CardTitle>
          <CardDescription>Manage all court appearance requests</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : !Array.isArray(courtRequests.data) ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Data Error</h3>
              <p className="text-muted-foreground mb-4">Unable to load court requests. Please try again later.</p>
            </div>
          ) : courtRequests.data.length === 0 ? (
            <div className="text-center py-8">
              <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No court requests found</h3>
              <p className="text-muted-foreground mb-4">Create your first court request to get started.</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Court Request
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Court Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attachment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courtRequests.data.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {request.employee?.first_name} {request.employee?.last_name}
                            </p>
                            {request.employee?.badge_number && (
                              <p className="text-xs text-muted-foreground">#{request.employee.badge_number}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {request.court_date ? format(new Date(request.court_date), "MMM d, yyyy") : "N/A"}
                            </p>
                            {request.court_time && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {request.court_time}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getCourtTypeBadge(request.court_type)}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {request.attachment_name ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <Paperclip className="h-3 w-3 mr-1" />
                              Attachment
                            </Badge>
                            <Button size="sm" variant="outline" onClick={() => handleDownloadAttachment(request)}>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No attachment</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => deleteCourtRequest(request.id)}>
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
