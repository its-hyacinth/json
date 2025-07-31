"use client"

import { useState, useEffect } from "react"
import { trainingRequestService, type TrainingRequest } from "@/services/training-request-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface UseTrainingRequestsParams {
  status?: string
  priority?: string
  autoFetch?: boolean
}

export function useTrainingRequests({ status, priority, autoFetch = true }: UseTrainingRequestsParams = {}) {
  const [trainingRequests, setTrainingRequests] = useState<TrainingRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const fetchTrainingRequests = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = {}
      if (status) params.status = status
      if (priority) params.priority = priority

      let data: TrainingRequest[]
      if (user?.role === "admin") {
        data = await trainingRequestService.getAdminTrainingRequests(params)
      } else {
        data = await trainingRequestService.getTrainingRequests(params)
      }

      setTrainingRequests(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch training requests"
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

  const createTrainingRequest = async (requestData: any, attachment?: File | null) => {
    try {
      const newRequest = await trainingRequestService.createTrainingRequest(requestData, attachment)
      setTrainingRequests((prev) => [newRequest, ...prev])
      toast({
        title: "Success",
        description: "Training request submitted successfully",
      })
      return newRequest
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create training request"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const updateTrainingRequest = async (id: number, requestData: any, attachment?: File | null) => {
    try {
      const updatedRequest = await trainingRequestService.updateTrainingRequest(id, requestData, attachment)
      setTrainingRequests((prev) => prev.map((req) => (req.id === id ? updatedRequest : req)))
      toast({
        title: "Success",
        description: "Training request updated successfully",
      })
      return updatedRequest
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update training request"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const deleteTrainingRequest = async (id: number) => {
    try {
      await trainingRequestService.deleteTrainingRequest(id)
      setTrainingRequests((prev) => prev.filter((req) => req.id !== id))
      toast({
        title: "Success",
        description: "Training request deleted successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete training request"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const downloadAttachment = async (id: number) => {
    try {
      await trainingRequestService.downloadAttachment(id)
      toast({
        title: "Success",
        description: "Attachment downloaded successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to download attachment"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const approveTrainingRequest = async (id: number, adminNotes?: string) => {
    try {
      const approvedRequest = await trainingRequestService.approveTrainingRequest(id, adminNotes)
      setTrainingRequests((prev) => prev.map((req) => (req.id === id ? approvedRequest : req)))
      toast({
        title: "Success",
        description: "Training request approved",
      })
      return approvedRequest
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to approve training request"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const declineTrainingRequest = async (id: number, adminNotes: string) => {
    try {
      const declinedRequest = await trainingRequestService.declineTrainingRequest(id, adminNotes)
      setTrainingRequests((prev) => prev.map((req) => (req.id === id ? declinedRequest : req)))
      toast({
        title: "Success",
        description: "Training request declined",
      })
      return declinedRequest
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to decline training request"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const markTrainingCompleted = async (id: number) => {
    try {
      const completedRequest = await trainingRequestService.markTrainingCompleted(id)
      setTrainingRequests((prev) => prev.map((req) => (req.id === id ? completedRequest : req)))
      toast({
        title: "Success",
        description: "Training marked as completed",
      })
      return completedRequest
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to mark training as completed"
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
      fetchTrainingRequests()
    }
  }, [status, priority, autoFetch, user?.role])

  return {
    trainingRequests,
    loading,
    error,
    fetchTrainingRequests,
    createTrainingRequest,
    updateTrainingRequest,
    deleteTrainingRequest,
    downloadAttachment,
    approveTrainingRequest,
    declineTrainingRequest,
    markTrainingCompleted,
  }
}
