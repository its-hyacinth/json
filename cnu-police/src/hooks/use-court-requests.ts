"use client"

import { useState, useEffect, useCallback } from "react"
import {
  courtRequestService,
  type CourtRequestFilters,
  type CreateCourtRequestData,
  type UpdateCourtResponseData,
  type PaginatedCourtRequests,
} from "@/services/court-request-service"
import { useToast } from "@/hooks/use-toast"

export function useCourtRequests(filters?: CourtRequestFilters) {
  const [courtRequests, setCourtRequests] = useState<PaginatedCourtRequests>({
    data: [],
    current_page: 1,
    total: 0,
    per_page: 15,
    last_page: 1,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchCourtRequests = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await courtRequestService.getCourtRequests(filters)
      setCourtRequests(response)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch court requests"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filters, toast])

  useEffect(() => {
    fetchCourtRequests()
  }, [fetchCourtRequests])

  const createCourtRequest = async (data: CreateCourtRequestData, attachment?: File | null) => {
    try {
      setLoading(true)
      const newCourtRequest = await courtRequestService.createCourtRequest(data, attachment)
      setCourtRequests((prev) => ({
        ...prev,
        data: [newCourtRequest, ...prev.data],
        total: prev.total + 1,
      }))
      toast({
        title: "Success",
        description: "Court request created successfully",
      })
      return newCourtRequest
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create court request"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateCourtResponse = async (id: number, data: UpdateCourtResponseData) => {
    try {
      setLoading(true)
      const updatedCourtRequest = await courtRequestService.updateCourtResponse(id, data)
      setCourtRequests((prev) => ({
        ...prev,
        data: prev.data.map((request) => (request.id === id ? updatedCourtRequest : request)),
      }))
      toast({
        title: "Success",
        description: `Court request ${data.status} successfully`,
      })
      return updatedCourtRequest
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update response"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteCourtRequest = async (id: number) => {
    try {
      setLoading(true)
      await courtRequestService.deleteCourtRequest(id)
      setCourtRequests((prev) => ({
        ...prev,
        data: prev.data.filter((request) => request.id !== id),
        total: prev.total - 1,
      }))
      toast({
        title: "Success",
        description: "Court request deleted successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete court request"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const downloadAttachment = async (id: number) => {
    try {
      await courtRequestService.downloadAttachment(id)
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

  const acceptCourtRequest = async (id: number, employeeNotes?: string) => {
    try {
      setLoading(true)
      const { data: updatedCourtRequest } = await courtRequestService.acceptCourtRequest(id, employeeNotes)
      setCourtRequests((prev) => ({
        ...prev,
        data: prev.data.map((request) => (request.id === id ? updatedCourtRequest : request)),
      }))
      toast({
        title: "Success",
        description: "Court request accepted successfully",
      })
      return updatedCourtRequest
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to accept court request"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const declineCourtRequest = async (id: number, employeeNotes: string) => {
    try {
      setLoading(true)
      const { data: updatedCourtRequest } = await courtRequestService.declineCourtRequest(id, employeeNotes)
      setCourtRequests((prev) => ({
        ...prev,
        data: prev.data.map((request) => (request.id === id ? updatedCourtRequest : request)),
      }))
      toast({
        title: "Success",
        description: "Court request declined successfully",
      })
      return updatedCourtRequest
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to decline court request"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    courtRequests,
    loading,
    error,
    createCourtRequest,
    acceptCourtRequest,
    declineCourtRequest,
    updateCourtResponse,
    deleteCourtRequest,
    downloadAttachment,
    refetch: fetchCourtRequests,
  }
}
