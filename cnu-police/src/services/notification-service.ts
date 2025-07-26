const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface Notification {
  id: number
  type: string
  data: {
    title: string
    message: string
    created_by?: string
  }
  read_at: string | null
  created_at: string
  updated_at: string
}

export interface NotificationResponse {
  data: Notification[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

class NotificationService {
  private getHeaders(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async getNotifications(page = 1): Promise<NotificationResponse> {
    const response = await fetch(`${API_BASE_URL}/notifications?page=${page}`, {
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch notifications")
    }

    return response.json()
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch unread count")
    }

    return response.json()
  }

  async markAsRead(notificationId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: "PUT",
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to mark notification as read")
    }
  }

  async markAllAsRead(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: "PUT",
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to mark all notifications as read")
    }
  }

  async sendNotification(data: {
    user_ids: number[]
    type: string
    title: string
    message: string
  }): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/notifications/send`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to send notification")
    }
  }
}

export const notificationService = new NotificationService()
