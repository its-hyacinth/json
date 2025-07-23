import { authService } from "./auth-service"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface LeaveRequest {
  id: number
  user_id: number
  start_date: string
  end_date: string
  type: "C" | "SD"
  reason?: string
  status: "pending" | "approved" | "declined"
  created_at: string
  updated_at: string
  user?: {
    id: number
    name: string
    email: string
    badge_number?: string
  }
}

export interface CreateLeaveRequest {
  start_date: string
  end_date: string
  type: "C" | "SD"
  reason?: string
}

class LeaveService {
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    const response = await fetch(`${API_BASE_URL}/leave-requests`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch leave requests" }))
      throw new Error(error.message || "Failed to fetch leave requests")
    }

    return response.json()
  }

  async createLeaveRequest(data: CreateLeaveRequest): Promise<LeaveRequest> {
    const response = await fetch(`${API_BASE_URL}/leave-requests`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to create leave request" }))
      throw new Error(error.message || "Failed to create leave request")
    }

    return response.json()
  }

  // Admin-only methods
  async getAdminLeaveRequests(): Promise<LeaveRequest[]> {
    const response = await fetch(`${API_BASE_URL}/admin/leave-requests`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch admin leave requests" }))
      throw new Error(error.message || "Failed to fetch admin leave requests")
    }

    return response.json()
  }

  async approveLeaveRequest(leaveRequestId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/leave-requests/${leaveRequestId}/approve`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to approve leave request" }))
      throw new Error(error.message || "Failed to approve leave request")
    }

    return response.json()
  }

  async declineLeaveRequest(leaveRequestId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/leave-requests/${leaveRequestId}/decline`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to decline leave request" }))
      throw new Error(error.message || "Failed to decline leave request")
    }

    return response.json()
  }
}

export const leaveService = new LeaveService()
