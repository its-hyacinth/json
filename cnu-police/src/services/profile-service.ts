const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

import { authService } from "./auth-service"

export interface ProfileData {
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

export const profileService = {
  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch profile")
    }

    return response.json()
  },

  async updateProfile(profileData: ProfileData) {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: "PUT",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(profileData),
    })

    if (!response.ok) {
      throw new Error("Failed to update profile")
    }

    return response.json()
  },

  async changePassword(passwordData: ChangePasswordData) {
    const response = await fetch(`${API_BASE_URL}/profile/change-password`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(passwordData),
    })

    if (!response.ok) {
      throw new Error("Failed to change password")
    }

    return response.json()
  },
}