import { authService } from "./auth-service"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface Event {
  id: number
  title: string
  description?: string
  event_type: string
  event_type_name: string
  start_date: string
  end_date: string
  start_time?: string
  end_time?: string
  location?: string
  is_active: boolean
  created_by: number
  created_at: string
  updated_at: string
  creator?: {
    id: number
    name: string
    email: string
  }
}

export interface CreateEventData {
  title: string
  description?: string
  event_type: string
  start_date: string
  end_date: string
  start_time?: string
  end_time?: string
  location?: string
  is_active?: boolean
}

export interface UpdateEventData extends Partial<CreateEventData> {}

export const EVENT_TYPES = {
  "1": "Ferguson/Arts Event",
  "2": "Freeman Center Event",
  "3": "Dance/Concert",
  "4": "CNU Athletics Event",
  "5": "Commencement",
  "6": "Meeting",
  "7": "Special Event",
  "8": "Yoder Barn",
} as const

class EventService {
  async getEvents(params?: {
    event_type?: string
    start_date?: string
    end_date?: string
    month?: number
    year?: number
    location?: string
  }): Promise<Event[]> {
    const searchParams = new URLSearchParams()
    if (params?.event_type) searchParams.append("event_type", params.event_type)
    if (params?.start_date) searchParams.append("start_date", params.start_date)
    if (params?.end_date) searchParams.append("end_date", params.end_date)
    if (params?.month) searchParams.append("month", params.month.toString())
    if (params?.year) searchParams.append("year", params.year.toString())
    if (params?.location) searchParams.append("location", params.location)

    const response = await fetch(`${API_BASE_URL}/events?${searchParams}`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch events" }))
      throw new Error(error.message || "Failed to fetch events")
    }

    return response.json()
  }

  async getEvent(id: number): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch event" }))
      throw new Error(error.message || "Failed to fetch event")
    }

    return response.json()
  }

  async createEvent(data: CreateEventData): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to create event" }))
      throw new Error(error.message || "Failed to create event")
    }

    const result = await response.json()
    return result.event
  }

  async updateEvent(id: number, data: UpdateEventData): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: "PUT",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update event" }))
      throw new Error(error.message || "Failed to update event")
    }

    const result = await response.json()
    return result.event
  }

  async deleteEvent(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: "DELETE",
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to delete event" }))
      throw new Error(error.message || "Failed to delete event")
    }
  }

  async getEventsForDateRange(startDate: string, endDate: string): Promise<Event[]> {
    const response = await fetch(`${API_BASE_URL}/events/date-range?start_date=${startDate}&end_date=${endDate}`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch events for date range" }))
      throw new Error(error.message || "Failed to fetch events for date range")
    }

    return response.json()
  }

  async getEventTypes(): Promise<Record<string, string>> {
    const response = await fetch(`${API_BASE_URL}/events/types`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch event types" }))
      throw new Error(error.message || "Failed to fetch event types")
    }

    return response.json()
  }
}

export const eventService = new EventService()
