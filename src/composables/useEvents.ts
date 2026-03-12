import { ref } from 'vue'
import { eventService } from '@/services'
import type { Event } from '@/types'

export function useEvents() {
  const events = ref<Event[]>([])
  const currentEvent = ref<Event | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Fetch all events
  const fetchEvents = async (params?: {
    page?: number
    per_page?: number
    status?: string
    search?: string
  }) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await eventService.getEvents(params)
      events.value = response.data || response
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch events'
    } finally {
      isLoading.value = false
    }
  }

  // Fetch single event
  const fetchEvent = async (id: number) => {
    isLoading.value = true
    error.value = null
    
    try {
      currentEvent.value = await eventService.getEvent(id)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch event'
    } finally {
      isLoading.value = false
    }
  }

  // Create new event
  const createEvent = async (eventData: {
    name: string
    description?: string
    date: string
    capacity: number
    status?: 'draft' | 'active' | 'completed'
  }) => {
    isLoading.value = true
    error.value = null
    
    try {
      const newEvent = await eventService.createEvent(eventData)
      events.value.push(newEvent)
      return newEvent
    } catch (err: any) {
      error.value = err.message || 'Failed to create event'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Update event
  const updateEvent = async (id: number, eventData: Partial<Event>) => {
    isLoading.value = true
    error.value = null
    
    try {
      const updatedEvent = await eventService.updateEvent(id, eventData)
      const index = events.value.findIndex(e => e.id === id)
      if (index !== -1) {
        events.value[index] = updatedEvent
      }
      if (currentEvent.value?.id === id) {
        currentEvent.value = updatedEvent
      }
      return updatedEvent
    } catch (err: any) {
      error.value = err.message || 'Failed to update event'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Delete event
  const deleteEvent = async (id: number) => {
    isLoading.value = true
    error.value = null
    
    try {
      await eventService.deleteEvent(id)
      events.value = events.value.filter(e => e.id !== id)
      if (currentEvent.value?.id === id) {
        currentEvent.value = null
      }
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to delete event'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Get upcoming events
  const fetchUpcomingEvents = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      events.value = await eventService.getUpcomingEvents()
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch upcoming events'
    } finally {
      isLoading.value = false
    }
  }

  // Clear current event
  const clearCurrentEvent = () => {
    currentEvent.value = null
  }

  return {
    events,
    currentEvent,
    isLoading,
    error,
    fetchEvents,
    fetchEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchUpcomingEvents,
    clearCurrentEvent
  }
}
