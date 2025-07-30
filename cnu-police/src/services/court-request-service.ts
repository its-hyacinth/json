import { authService } from "./auth-service"
import { Employee } from "./employee-service"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface CourtRequest {
  id: number
  employee_id: number
  created_by: number
  court_date: string
  court_time?: string
  case_number?: string
  court_type: "criminal" | "civil" | "traffic" | "family" | "juvenile" | "administrative"
  location?: string
  description?: string
  status: "pending" | "accepted" | "declined"
  employee_notes?: string
  responded_at?: string
  created_at: string
  updated_at: string
  employee: {
    id: number
    first_name: string
    last_name: string
    email: string
    badge_number?: string
  }
  creator: {
    id: number
    name: string
    email: string
  }
}

export interface CourtRequestFilters {
  status?: string
  employee_id?: number
  court_type?: string
  date_from?: string
  date_to?: string
  search?: string
}

export interface CreateCourtRequestData {
  employee_id: number
  court_date: string
  court_time?: string
  case_number?: string
  court_type: string
  location?: string
  description?: string
}

export interface UpdateCourtResponseData {
  status: "accepted" | "declined"
  employee_notes?: string
}

export interface PaginatedCourtRequests {
  data: CourtRequest[]
  current_page: number
  total: number
  per_page: number
  last_page: number
}

export interface CourtStatistics {
  total: number
  pending: number
  accepted: number
  declined: number
  this_month: number
  upcoming: number
}

export const COURT_TYPES = {
  criminal: "Criminal",
  civil: "Civil",
  traffic: "Traffic",
  family: "Family",
  juvenile: "Juvenile",
  administrative: "Administrative",
} as const

class CourtRequestService {
  async getCourtRequests(filters?: CourtRequestFilters) {
    const params = new URLSearchParams()

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString())
        }
      })
    }

    const response = await fetch(`${API_BASE_URL}/court-requests?${params.toString()}`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch court requests" }))
      throw new Error(error.message || "Failed to fetch court requests")
    }

    return response.json()
  }

  async getCourtRequest(id: number): Promise<CourtRequest> {
    const response = await fetch(`${API_BASE_URL}/court-requests/${id}`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch court request" }))
      throw new Error(error.message || "Failed to fetch court request")
    }

    return response.json()
  }

  async createCourtRequest(data: CreateCourtRequestData): Promise<CourtRequest> {
    const response = await fetch(`${API_BASE_URL}/court-requests`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to create court request" }))
      throw new Error(error.message || "Failed to create court request")
    }

    const result = await response.json()
    return result.courtRequest
  }

  async updateCourtRequest(id: number, data: Partial<CreateCourtRequestData>): Promise<CourtRequest> {
    const response = await fetch(`${API_BASE_URL}/court-requests/${id}`, {
      method: "PUT",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update court request" }))
      throw new Error(error.message || "Failed to update court request")
    }

    const result = await response.json()
    return result.courtRequest
  }

  async deleteCourtRequest(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/court-requests/${id}`, {
      method: "DELETE",
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to delete court request" }))
      throw new Error(error.message || "Failed to delete court request")
    }
  }

  async updateCourtResponse(id: number, data: UpdateCourtResponseData): Promise<CourtRequest> {
    const response = await fetch(`${API_BASE_URL}/court-requests/${id}/response`, {
      method: "PATCH",
      headers: {
        ...authService.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update court response" }))
      throw new Error(error.message || "Failed to update court response")
    }

    return response.json()
  }

  async getCourtStatistics(): Promise<CourtStatistics> {
    const response = await fetch(`${API_BASE_URL}/court-requests/statistics`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch court statistics" }))
      throw new Error(error.message || "Failed to fetch court statistics")
    }

    return response.json()
  }

  async getUpcomingCourtRequests(days = 7): Promise<CourtRequest[]> {
    const response = await fetch(`${API_BASE_URL}/court-requests/upcoming?days=${days}`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch upcoming court requests" }))
      throw new Error(error.message || "Failed to fetch upcoming court requests")
    }

    return response.json()
  }

  async getEmployee(id: number): Promise<Employee> {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch employee" }))
      throw new Error(error.message || "Failed to fetch employee")
    }

    return response.json()
  }

  async acceptCourtRequest(
    id: number,
    employeeNotes?: string
  ): Promise<{ message: string; data: CourtRequest }> {
    const response = await fetch(`${API_BASE_URL}/court-requests/${id}/accept`, {
      method: "PATCH",
      headers: {
        ...authService.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ employee_notes: employeeNotes }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to accept court request" }))
      throw new Error(error.message || "Failed to accept court request")
    }

    return response.json()
  }

  async declineCourtRequest(
    id: number,
    employeeNotes: string
  ): Promise<{ message: string; data: CourtRequest }> {
    const response = await fetch(`${API_BASE_URL}/court-requests/${id}/decline`, {
      method: "PATCH",
      headers: {
        ...authService.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ employee_notes: employeeNotes }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to decline court request" }))
      throw new Error(error.message || "Failed to decline court request")
    }

    return response.json()
  }
}

export const courtRequestService = new CourtRequestService()