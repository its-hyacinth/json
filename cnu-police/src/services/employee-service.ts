import { authService } from "./auth-service"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface Employee {
  id: number
  first_name: string
  last_name: string
  badge_number: string
  division?: string
  email: string
  role: "admin" | "employee"
}

class EmployeeService {
  async getEmployees(): Promise<Employee[]> {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      headers: authService.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch employees" }))
      throw new Error(error.message || "Failed to fetch employees")
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
}

export const employeeService = new EmployeeService()
