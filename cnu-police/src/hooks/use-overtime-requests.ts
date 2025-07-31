"use client"

import { useState, useEffect } from "react"
import { overtimeRequestService, type OvertimeRequest } from "@/services/overtime-request-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface UseOvertimeRequestsParams {
  status?: string
  overtime_type?: string
  autoFetch?: boolean
}

export function useOvertimeRequests({ status, overtime_type, autoFetch = true }: UseOvertimeRequestsParams = {}) {
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const fetchOvertimeRequests = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = {}
      if (status) params.status = status
      if (overtime_type) params.overtime_type = overtime_type

      let data: OvertimeRequest[]
      if (user?.role === "admin") {
        data = await overtimeRequestService.getAdminOvertimeRequests(params)
      } else {
        data = await overtimeRequestService.getOvertimeRequests(params)
      }

      setOvertimeRequests(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch overtime requests"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createOvertimeRequest = async (requestData: any) => {
    try {
      const newRequest = await overtimeRequestService.createOvertimeRequest(requestData)
      setOvertimeRequests((prev) => [newRequest, ...prev])
      toast({
        title: "Success",
        description: "Overtime request created successfully",
      })
      return newRequest
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create overtime request"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const updateOvertimeRequest = async (id: number, requestData: any) => {
    try {
      const updatedRequest = await overtimeRequestService.updateOvertimeRequest(id, requestData)
      setOvertimeRequests((prev) => prev.map((req) => (req.id === id ? updatedRequest : req)))
      toast({
        title: "Success",
        description: "Overtime request updated successfully",
      })
      return updatedRequest
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update overtime request"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const deleteOvertimeRequest = async (id: number) => {
    try {
      await overtimeRequestService.deleteOvertimeRequest(id)
      setOvertimeRequests((prev) => prev.filter((req) => req.id !== id))
      toast({
        title: "Success",
        description: "Overtime request deleted successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete overtime request"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const acceptOvertimeRequest = async (id: number, employeeNotes?: string) => {
    try {
      const acceptedRequest = await overtimeRequestService.acceptOvertimeRequest(id, employeeNotes)
      setOvertimeRequests((prev) => prev.map((req) => (req.id === id ? acceptedRequest : req)))
      toast({
        title: "Success",
        description: "Overtime request accepted",
      })
      return acceptedRequest
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to accept overtime request"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const declineOvertimeRequest = async (id: number, employeeNotes: string) => {
    try {
      const declinedRequest = await overtimeRequestService.declineOvertimeRequest(id, employeeNotes)
      setOvertimeRequests((prev) => prev.map((req) => (req.id === id ? declinedRequest : req)))
      toast({
        title: "Success",
        description: "Overtime request declined",
      })
      return declinedRequest
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to decline overtime request"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const autoCreateOvertimeForLeave = async (data: {
    leave_date: string
    employee_on_leave: number
    coverage_employees: number[]
  }) => {
    try {
      const result = await overtimeRequestService.autoCreateOvertimeForLeave(data)
      await fetchOvertimeRequests() // Refresh the list
      toast({
        title: "Success",
        description: `Created ${result.count} overtime requests for leave coverage`,
      })
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create overtime requests for leave"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchOvertimeRequests()
    }
  }, [status, overtime_type, autoFetch, user?.role])

  return {
    overtimeRequests,
    loading,
    error,
    fetchOvertimeRequests,
    createOvertimeRequest,
    updateOvertimeRequest,
    deleteOvertimeRequest,
    acceptOvertimeRequest,
    declineOvertimeRequest,
    autoCreateOvertimeForLeave,
    refetch: fetchOvertimeRequests,
  }
}
