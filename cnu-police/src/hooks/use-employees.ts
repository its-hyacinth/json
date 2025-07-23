"use client"

import { useState, useEffect } from "react"
import { employeeService, type Employee } from "@/services/employee-service"
import { useToast } from "@/hooks/use-toast"

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const data = await employeeService.getEmployees()
      setEmployees(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch employees",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  return {
    employees,
    loading,
    refetch: fetchEmployees,
  }
}
