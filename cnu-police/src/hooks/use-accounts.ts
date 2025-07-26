"use client"

import { useState, useEffect } from "react"
import { accountService, type User, type CreateUserData } from "@/services/account-service"
import { useToast } from "@/hooks/use-toast"

export function useAccounts() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  })
  const { toast } = useToast()

  const fetchUsers = async (params?: { search?: string; role?: string; page?: number }) => {
    try {
      setLoading(true)
      const response = await accountService.getUsers(params)
      setUsers(response.data)
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        total: response.total,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (userData: CreateUserData) => {
    try {
      await accountService.createUser(userData)
      toast({
        title: "Success",
        description: "User created successfully",
      })
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateUser = async (id: number, userData: Partial<User>) => {
    try {
      await accountService.updateUser(id, userData)
      toast({
        title: "Success",
        description: "User updated successfully",
      })
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteUser = async (id: number) => {
    try {
      await accountService.deleteUser(id)
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const resetPassword = async (id: number, password: string) => {
    try {
      await accountService.resetPassword(id, password)
      toast({
        title: "Success",
        description: "Password reset successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password",
        variant: "destructive",
      })
      throw error
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    pagination,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    refetch: fetchUsers,
  }
}
