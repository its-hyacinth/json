const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface User {
  id: number
  name: string
  email: string
  role: "admin" | "employee"
  badge_number?: string
}

export interface LoginResponse {
  user: User
  token: string
}

class AuthService {
  private getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("auth_token")
  }

  private setToken(token: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem("auth_token", token)
  }

  private removeToken(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem("auth_token")
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Invalid credentials")
    }

    const data: LoginResponse = await response.json()
    this.setToken(data.token)
    return data
  }

  async logout(): Promise<void> {
    const token = this.getToken()

    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          console.warn("Logout request failed, but clearing local token anyway")
        }
      } catch (error) {
        console.warn("Logout request failed, but clearing local token anyway", error)
      }
    }

    this.removeToken()
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    return headers
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}

export const authService = new AuthService()
