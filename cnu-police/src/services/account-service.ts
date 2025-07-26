import { authService } from "./auth-service"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  badge_number: string
  division: string
  phone: string
  address: string
  role: "admin" | "employee"
  created_at: string
}

export interface CreateUserData {
  first_name: string
  last_name: string
  email: string
  badge_number: string
  division: string
  phone: string
  address: string
  role: "admin" | "employee"
  password: string
}

export const accountService = {
  async getUsers(params?: { search?: string; role?: string; page?: number }) {
    const searchParams = new URLSearchParams()

    if (params?.search) searchParams.append("search", params.search)
    if (params?.role) searchParams.append("role", params.role)
    if (params?.page) searchParams.append("page", params.page.toString())

    const response = await fetch(`${API_BASE_URL}/accounts?${searchParams}`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch users")
    }

    return response.json()
  },

  async createUser(userData: CreateUserData) {
    const response = await fetch(`${API_BASE_URL}/accounts`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error("Failed to create user")
    }

    return response.json()
  },

  async updateUser(id: number, userData: Partial<User>) {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      method: "PUT",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error("Failed to update user")
    }

    return response.json()
  },

  async deleteUser(id: number) {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      method: "DELETE",
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to delete user")
    }

    return response.json()
  },

  async resetPassword(id: number, password: string) {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}/reset-password`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ password }),
    })

    if (!response.ok) {
      throw new Error("Failed to reset password")
    }

    return response.json()
  },
}