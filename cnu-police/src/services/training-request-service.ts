import { authService } from "./auth-service"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface TrainingRequest {
  id: number
  user_id: number
  training_title: string
  training_description?: string
  training_provider?: string
  training_location?: string
  start_date: string
  end_date: string
  start_time?: string
  end_time?: string
  estimated_cost?: number
  justification: string
  priority: "low" | "medium" | "high"
  status: "pending" | "approved" | "declined" | "completed"
  admin_notes?: string
  approved_by?: number
  approved_at?: string
  created_at: string
  updated_at: string
  user?: {
    id: number
    first_name: string
    last_name: string
    email: string
    division: string
    phone: string
    badge_number?: string
  }
  approver?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
}

export interface CreateTrainingRequestData {
  training_title: string
  training_description?: string
  training_provider?: string
  training_location?: string
  start_date: string
  end_date: string
  start_time?: string
  end_time?: string
  estimated_cost?: number
  justification: string
  priority: "low" | "medium" | "high"
}

export interface UpdateTrainingRequestData extends Partial<CreateTrainingRequestData> {}

export const TRAINING_PRIORITIES = {
  low: "Low Priority",
  medium: "Medium Priority",
  high: "High Priority",
} as const

export const TRAINING_STATUSES = {
  pending: "Pending Review",
  approved: "Approved",
  declined: "Declined",
  completed: "Completed",
} as const

class TrainingRequestService {
  async getTrainingRequests(params?: {
    status?: string
    priority?: string
    start_date?: string
    end_date?: string
  }): Promise<TrainingRequest[]> {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append("status", params.status)
    if (params?.priority) searchParams.append("priority", params.priority)
    if (params?.start_date) searchParams.append("start_date", params.start_date)
    if (params?.end_date) searchParams.append("end_date", params.end_date)

    const response = await fetch(`${API_BASE_URL}/training-requests?${searchParams}`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch training requests" }))
      throw new Error(error.message || "Failed to fetch training requests")
    }

    return response.json()
  }

  async getTrainingRequest(id: number): Promise<TrainingRequest> {
    const response = await fetch(`${API_BASE_URL}/training-requests/${id}`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch training request" }))
      throw new Error(error.message || "Failed to fetch training request")
    }

    return response.json()
  }

  async createTrainingRequest(data: CreateTrainingRequestData): Promise<TrainingRequest> {
    const response = await fetch(`${API_BASE_URL}/training-requests`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to create training request" }))
      throw new Error(error.message || "Failed to create training request")
    }

    const result = await response.json()
    return result.training_request
  }

  async updateTrainingRequest(id: number, data: UpdateTrainingRequestData): Promise<TrainingRequest> {
    const response = await fetch(`${API_BASE_URL}/training-requests/${id}`, {
      method: "PUT",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update training request" }))
      throw new Error(error.message || "Failed to update training request")
    }

    const result = await response.json()
    return result.training_request
  }

  async deleteTrainingRequest(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/training-requests/${id}`, {
      method: "DELETE",
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to delete training request" }))
      throw new Error(error.message || "Failed to delete training request")
    }
  }

  // Admin methods
  async getAdminTrainingRequests(params?: {
    status?: string
    priority?: string
    user_id?: number
    start_date?: string
    end_date?: string
  }): Promise<TrainingRequest[]> {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append("status", params.status)
    if (params?.priority) searchParams.append("priority", params.priority)
    if (params?.user_id) searchParams.append("user_id", params.user_id.toString())
    if (params?.start_date) searchParams.append("start_date", params.start_date)
    if (params?.end_date) searchParams.append("end_date", params.end_date)

    const response = await fetch(`${API_BASE_URL}/admin/training-requests?${searchParams}`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch admin training requests" }))
      throw new Error(error.message || "Failed to fetch admin training requests")
    }

    return response.json()
  }

  async approveTrainingRequest(id: number, adminNotes?: string): Promise<TrainingRequest> {
    const response = await fetch(`${API_BASE_URL}/training-requests/${id}/approve`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ admin_notes: adminNotes }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to approve training request" }))
      throw new Error(error.message || "Failed to approve training request")
    }

    const result = await response.json()
    return result.training_request
  }

  async declineTrainingRequest(id: number, adminNotes: string): Promise<TrainingRequest> {
    const response = await fetch(`${API_BASE_URL}/training-requests/${id}/decline`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ admin_notes: adminNotes }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to decline training request" }))
      throw new Error(error.message || "Failed to decline training request")
    }

    const result = await response.json()
    return result.training_request
  }

  async markTrainingCompleted(id: number): Promise<TrainingRequest> {
    const response = await fetch(`${API_BASE_URL}/training-requests/${id}/complete`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to mark training as completed" }))
      throw new Error(error.message || "Failed to mark training as completed")
    }

    const result = await response.json()
    return result.training_request
  }
}

export const trainingRequestService = new TrainingRequestService()
