"use client"

import { useState, useEffect } from "react"
import { scheduleService, type Schedule } from "@/services/schedule-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export function useSchedules(params?: { month?: number; year?: number; user_id?: number }) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      let data: Schedule[]

      // Use admin endpoint if user is admin and viewing other users' schedules
      if (user?.role === "admin" && params?.user_id && params.user_id !== user.id) {
        data = await scheduleService.getAdminSchedules(params)
      } else {
        data = await scheduleService.getSchedules(params)
      }

      setSchedules(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch schedules",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [params?.month, params?.year, params?.user_id, user?.role])

  const updateSchedule = async (scheduleId: number, data: any) => {
    try {
      await scheduleService.updateSchedule(scheduleId, data)
      await fetchSchedules()
      toast({
        title: "Success",
        description: "Schedule updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update schedule",
        variant: "destructive",
      })
    }
  }

  const generateSchedules = async (userId: number, month?: number, year?: number) => {
    try {
      await scheduleService.generateSchedules(userId, month, year)
      await fetchSchedules()
      toast({
        title: "Success",
        description: "Schedules generated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate schedules",
        variant: "destructive",
      })
    }
  }

  return {
    schedules,
    loading,
    refetch: fetchSchedules,
    updateSchedule,
    generateSchedules,
  }
}
