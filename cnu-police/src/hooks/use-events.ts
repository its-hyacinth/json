"use client"

import { useState, useEffect } from "react"
import { eventService, type Event } from "@/services/event-service"
import { useToast } from "@/hooks/use-toast"

interface UseEventsParams {
  month?: number
  year?: number
  event_type?: string
  autoFetch?: boolean
}

export function useEvents({ month, year, event_type, autoFetch = true }: UseEventsParams = {}) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchEvents = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = {}
      if (month) params.month = month
      if (year) params.year = year
      if (event_type) params.event_type = event_type

      const data = await eventService.getEvents(params)
      setEvents(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch events"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createEvent = async (eventData: any) => {
    try {
      const newEvent = await eventService.createEvent(eventData)
      setEvents((prev) => [...prev, newEvent])
      toast({
        title: "Success",
        description: "Event created successfully",
      })
      return newEvent
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create event"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const updateEvent = async (id: number, eventData: any) => {
    try {
      const updatedEvent = await eventService.updateEvent(id, eventData)
      setEvents((prev) => prev.map((event) => (event.id === id ? updatedEvent : event)))
      toast({
        title: "Success",
        description: "Event updated successfully",
      })
      return updatedEvent
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update event"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const deleteEvent = async (id: number) => {
    try {
      await eventService.deleteEvent(id)
      setEvents((prev) => prev.filter((event) => event.id !== id))
      toast({
        title: "Success",
        description: "Event deleted successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete event"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchEvents()
    }
  }, [month, year, event_type, autoFetch])

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  }
}
