import { authService } from "./auth-service"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface Schedule {
  id: number
  user_id: number
  date: string
  time_in: string | null
  status: "working" | "C" | "SD"
  created_at: string
  updated_at: string
  user?: {
    id: number
    name: string
    email: string
    badge_number?: string
  }
}

export interface ScheduleUpdate {
  time_in?: string
  status?: "working" | "C" | "SD"
}

export interface BulkUpdateChanges {
  time_in?: string
  status?: "working" | "C" | "SD"
  recurring_pattern?: "daily" | "weekly" | "monthly"
  start_date?: string
  end_date?: string
}

export interface WeekPattern {
  user_id: number
  source_week_start: string
  target_weeks: string[]
}

export interface GenerateWithTemplate {
  template_week_start: string
  month: number
  year: number
  employee_ids: number[]
}

class ScheduleService {
  async getSchedules(params?: { month?: number; year?: number; user_id?: number }): Promise<Schedule[]> {
    const searchParams = new URLSearchParams()
    if (params?.month) searchParams.append("month", params.month.toString())
    if (params?.year) searchParams.append("year", params.year.toString())
    if (params?.user_id) searchParams.append("user_id", params.user_id.toString())

    const response = await fetch(`${API_BASE_URL}/schedules?${searchParams}`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch schedules" }))
      throw new Error(error.message || "Failed to fetch schedules")
    }

    return response.json()
  }

  async getCurrentMonth(): Promise<Schedule[]> {
    const response = await fetch(`${API_BASE_URL}/schedules/current-month`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch current month schedules" }))
      throw new Error(error.message || "Failed to fetch current month schedules")
    }

    return response.json()
  }

  async updateSchedule(scheduleId: number, data: ScheduleUpdate): Promise<Schedule> {
    const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}`, {
      method: "PUT",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update schedule" }))
      throw new Error(error.message || "Failed to update schedule")
    }

    return response.json()
  }

  // Admin-only methods
  async getAdminSchedules(params?: { month?: number; year?: number; user_id?: number }): Promise<Schedule[]> {
    const searchParams = new URLSearchParams()
    if (params?.month) searchParams.append("month", params.month.toString())
    if (params?.year) searchParams.append("year", params.year.toString())
    if (params?.user_id) searchParams.append("user_id", params.user_id.toString())

    const response = await fetch(`${API_BASE_URL}/admin/schedules?${searchParams}`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch admin schedules" }))
      throw new Error(error.message || "Failed to fetch admin schedules")
    }

    return response.json()
  }

  async generateSchedules(
    userId: number,
    month?: number,
    year?: number,
  ): Promise<{ message: string; month: number; year: number }> {
    const response = await fetch(`${API_BASE_URL}/schedules/generate`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ user_id: userId, month, year }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to generate schedules" }))
      throw new Error(error.message || "Failed to generate schedules")
    }

    return response.json()
  }

  async bulkUpdateFuture(
    userId: number,
    changes: BulkUpdateChanges,
  ): Promise<{ message: string; changes_applied: BulkUpdateChanges }> {
    const response = await fetch(`${API_BASE_URL}/schedules/bulk-update-future`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ user_id: userId, changes }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to bulk update schedules" }))
      throw new Error(error.message || "Failed to bulk update schedules")
    }

    return response.json()
  }

  async copyWeekPattern(
    data: WeekPattern,
  ): Promise<{ message: string; copied_schedules: number; target_weeks: number }> {
    const response = await fetch(`${API_BASE_URL}/schedules/copy-week-pattern`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to copy week pattern" }))
      throw new Error(error.message || "Failed to copy week pattern")
    }

    return response.json()
  }

  async generateSchedulesWithTemplate(
    data: GenerateWithTemplate,
  ): Promise<{ message: string; generated_count: number }> {
    const response = await fetch(`${API_BASE_URL}/schedules/generate-with-template`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to generate schedules with template" }))
      throw new Error(error.message || "Failed to generate schedules with template")
    }

    return response.json()
  }
}

export const scheduleService = new ScheduleService()
