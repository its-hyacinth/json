import { authService } from "./auth-service"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface OvertimeRequest {
  id: number
  requested_by: number
  assigned_to: number
  covering_for?: number
  overtime_date: string
  start_time: string
  end_time: string
  reason: string
  overtime_type: "leave_coverage" | "event_coverage" | "emergency" | "special_duty"
  status: "pending" | "accepted" | "declined"
  employee_notes?: string
  overtime_hours?: number
  overtime_rate?: number
  responded_at?: string
  created_at: string
  updated_at: string
  requester?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  assigned_employee?: {
    id: number
    first_name: string
    last_name: string
    email: string
    badge_number?: string
  }
  covering_for_employee?: {
    id: number
    first_name: string
    last_name: string
    email: string
    badge_number?: string
  }
}

export interface CreateOvertimeRequestData {
  assigned_to: number
  covering_for?: number
  overtime_date: string
  start_time: string
  end_time: string
  reason: string
  overtime_type: "leave_coverage" | "event_coverage" | "emergency" | "special_duty"
  overtime_hours?: number
  overtime_rate?: number
}

export interface UpdateOvertimeRequestData extends Partial<CreateOvertimeRequestData> {}

export const OVERTIME_TYPES = {
  leave_coverage: "Leave Coverage",
  event_coverage: "Event Coverage",
  emergency: "Emergency Duty",
  special_duty: "Special Duty",
} as const

export const OVERTIME_STATUSES = {
  pending: "Pending Response",
  accepted: "Accepted",
  declined: "Declined",
} as const

class OvertimeRequestService {
  async getOvertimeRequests(params?: {
    status?: string
    overtime_type?: string
    start_date?: string
    end_date?: string
  }): Promise<OvertimeRequest[]> {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append("status", params.status)
    if (params?.overtime_type) searchParams.append("overtime_type", params.overtime_type)
    if (params?.start_date) searchParams.append("start_date", params.start_date)
    if (params?.end_date) searchParams.append("end_date", params.end_date)

    const response = await fetch(`${API_BASE_URL}/overtime-requests?${searchParams}`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch overtime requests" }))
      throw new Error(error.message || "Failed to fetch overtime requests")
    }

    return response.json()
  }

  async getOvertimeRequest(id: number): Promise<OvertimeRequest> {
    const response = await fetch(`${API_BASE_URL}/overtime-requests/${id}`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch overtime request" }))
      throw new Error(error.message || "Failed to fetch overtime request")
    }

    return response.json()
  }

  async acceptOvertimeRequest(id: number, employeeNotes?: string): Promise<OvertimeRequest> {
    const response = await fetch(`${API_BASE_URL}/overtime-requests/${id}/accept`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ employee_notes: employeeNotes }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to accept overtime request" }))
      throw new Error(error.message || "Failed to accept overtime request")
    }

    const result = await response.json()
    return result.overtime_request
  }

  async declineOvertimeRequest(id: number, employeeNotes: string): Promise<OvertimeRequest> {
    const response = await fetch(`${API_BASE_URL}/overtime-requests/${id}/decline`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ employee_notes: employeeNotes }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to decline overtime request" }))
      throw new Error(error.message || "Failed to decline overtime request")
    }

    const result = await response.json()
    return result.overtime_request
  }

  // Admin methods
  async getAdminOvertimeRequests(params?: {
    status?: string
    overtime_type?: string
    assigned_to?: number
    start_date?: string
    end_date?: string
  }): Promise<OvertimeRequest[]> {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append("status", params.status)
    if (params?.overtime_type) searchParams.append("overtime_type", params.overtime_type)
    if (params?.assigned_to) searchParams.append("assigned_to", params.assigned_to.toString())
    if (params?.start_date) searchParams.append("start_date", params.start_date)
    if (params?.end_date) searchParams.append("end_date", params.end_date)

    const response = await fetch(`${API_BASE_URL}/admin/overtime-requests?${searchParams}`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch admin overtime requests" }))
      throw new Error(error.message || "Failed to fetch admin overtime requests")
    }

    return response.json()
  }

  async createOvertimeRequest(data: CreateOvertimeRequestData): Promise<OvertimeRequest> {
    const response = await fetch(`${API_BASE_URL}/overtime-requests`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to create overtime request" }))
      throw new Error(error.message || "Failed to create overtime request")
    }

    const result = await response.json()
    return result.overtime_request
  }

  async updateOvertimeRequest(id: number, data: UpdateOvertimeRequestData): Promise<OvertimeRequest> {
    const response = await fetch(`${API_BASE_URL}/overtime-requests/${id}`, {
      method: "PUT",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update overtime request" }))
      throw new Error(error.message || "Failed to update overtime request")
    }

    const result = await response.json()
    return result.overtime_request
  }

  async deleteOvertimeRequest(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/overtime-requests/${id}`, {
      method: "DELETE",
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to delete overtime request" }))
      throw new Error(error.message || "Failed to delete overtime request")
    }
  }

  async autoCreateOvertimeForLeave(data: {
    leave_date: string
    employee_on_leave: number
    coverage_employees: number[]
  }): Promise<{ overtime_requests: OvertimeRequest[]; count: number }> {
    const response = await fetch(`${API_BASE_URL}/overtime-requests/auto-create-leave`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to create overtime requests for leave" }))
      throw new Error(error.message || "Failed to create overtime requests for leave")
    }

    return response.json()
  }
}

export const overtimeRequestService = new OvertimeRequestService()
