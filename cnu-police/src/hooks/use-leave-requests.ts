"use client"

import { useState, useEffect } from "react"
import { leaveService, type LeaveRequest, type CreateLeaveRequest } from "@/services/leave-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export function useLeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true)
      let data: LeaveRequest[]

      // Use admin endpoint if user is admin
      if (user?.role === "admin") {
        data = await leaveService.getAdminLeaveRequests()
      } else {
        data = await leaveService.getLeaveRequests()
      }

      setLeaveRequests(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch leave requests",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaveRequests()
  }, [user?.role])

  const createLeaveRequest = async (data: CreateLeaveRequest) => {
    try {
      await leaveService.createLeaveRequest(data)
      await fetchLeaveRequests()
      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit leave request",
        variant: "destructive",
      })
    }
  }

  const approveLeaveRequest = async (leaveRequestId: number) => {
    try {
      await leaveService.approveLeaveRequest(leaveRequestId)
      await fetchLeaveRequests()
      toast({
        title: "Success",
        description: "Leave request approved",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve leave request",
        variant: "destructive",
      })
    }
  }

  const declineLeaveRequest = async (leaveRequestId: number) => {
    try {
      await leaveService.declineLeaveRequest(leaveRequestId)
      await fetchLeaveRequests()
      toast({
        title: "Success",
        description: "Leave request declined",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to decline leave request",
        variant: "destructive",
      })
    }
  }

  return {
    leaveRequests,
    loading,
    refetch: fetchLeaveRequests,
    createLeaveRequest,
    approveLeaveRequest,
    declineLeaveRequest,
  }
}
