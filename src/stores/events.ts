import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Event, AICommand } from '@/types'

export const useEventsStore = defineStore('events', () => {
  const events = ref<Event[]>([])
  const commands = ref<AICommand[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchEvents = async (filters?: { type?: string; user_id?: number }) => {
    isLoading.value = true
    error.value = null
    
    try {
      const queryParams = new URLSearchParams()
      if (filters?.type) queryParams.append('type', filters.type)
      if (filters?.user_id) queryParams.append('user_id', filters.user_id.toString())
      
      const response = await fetch(`/api/events?${queryParams}`)
      if (response.ok) {
        events.value = await response.json()
      } else {
        throw new Error('Failed to fetch events')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      isLoading.value = false
    }
  }

  const fetchCommands = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/commands')
      if (response.ok) {
        commands.value = await response.json()
      } else {
        throw new Error('Failed to fetch commands')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      isLoading.value = false
    }
  }

  const createEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })
      
      if (response.ok) {
        const newEvent = await response.json()
        events.value.unshift(newEvent)
        return newEvent
      }
      throw new Error('Failed to create event')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      throw err
    }
  }

  const executeCommand = async (command: string, parameters: Record<string, any>) => {
    try {
      const response = await fetch('/api/commands/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command, parameters }),
      })
      
      if (response.ok) {
        const result = await response.json()
        return result
      }
      throw new Error('Failed to execute command')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      throw err
    }
  }

  return {
    events,
    commands,
    isLoading,
    error,
    fetchEvents,
    fetchCommands,
    createEvent,
    executeCommand,
  }
})
