import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '@/composables/useApi'

export interface Event {
  id: number
  name: string
  description?: string
  date: string
  capacity: number
  status: 'draft' | 'active' | 'completed'
  accepted_count: number
  pending_count: number
  sent_count: number
  available_slots: number
  invitations_count: number
  created_at: string
  updated_at: string
}

export interface EventFilters {
  status?: string
  date_from?: string
  date_to?: string
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  per_page?: number
  page?: number
}

export interface EventListResponse {
  data: Event[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
  }
}

export const useEventStore = defineStore('events', () => {
  const api = useApi()
  
  // State
  const events = ref<Event[]>([])
  const currentEvent = ref<Event | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<EventListResponse['pagination'] | null>(null)
  const filters = ref<EventFilters>({
    sort_by: 'created_at',
    sort_order: 'desc',
    per_page: 15
  })

  // Getters
  const activeEvents = computed(() => events.value.filter(event => event.status === 'active'))
  const upcomingEvents = computed(() => events.value.filter(event => new Date(event.date) >= new Date()))
  const draftEvents = computed(() => events.value.filter(event => event.status === 'draft'))
  const completedEvents = computed(() => events.value.filter(event => event.status === 'completed'))
  
  const totalEvents = computed(() => pagination.value?.total || 0)
  const currentPage = computed(() => pagination.value?.current_page || 1)
  const totalPages = computed(() => pagination.value?.last_page || 1)

  // Actions
  const fetchEvents = async (eventFilters?: Partial<EventFilters>) => {
    isLoading.value = true
    error.value = null
    
    try {
      const mergedFilters = { ...filters.value, ...eventFilters }
      const response = await api.get('/events', { params: mergedFilters })
      
      const responseData: EventListResponse = response.data as EventListResponse
      events.value = responseData.data
      pagination.value = responseData.pagination
      
      if (eventFilters) {
        filters.value = { ...filters.value, ...eventFilters }
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch events'
      console.error('Events fetch error:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchEvent = async (id: number) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/events/${id}`)
      currentEvent.value = response.data as Event
      return currentEvent.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch event'
      console.error('Event fetch error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const createEvent = async (eventData: Partial<Event>) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.post('/events', eventData)
      const newEvent = response.data as Event
      
      events.value.unshift(newEvent)
      
      return newEvent
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create event'
      console.error('Event creation error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateEvent = async (id: number, eventData: Partial<Event>) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.put(`/events/${id}`, eventData)
      const updatedEvent = response.data as Event
      
      // Update in events list
      const index = events.value.findIndex(event => event.id === id)
      if (index !== -1) {
        events.value[index] = updatedEvent
      }
      
      // Update current event if it's the same
      if (currentEvent.value?.id === id) {
        currentEvent.value = updatedEvent
      }
      
      return updatedEvent
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update event'
      console.error('Event update error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteEvent = async (id: number) => {
    isLoading.value = true
    error.value = null
    
    try {
      await api.delete(`/events/${id}`)
      
      // Remove from events list
      events.value = events.value.filter(event => event.id !== id)
      
      // Clear current event if it's the same
      if (currentEvent.value?.id === id) {
        currentEvent.value = null
      }
      
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete event'
      console.error('Event deletion error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const setFilters = (newFilters: Partial<EventFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      sort_by: 'created_at',
      sort_order: 'desc',
      per_page: 15
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    events.value = []
    currentEvent.value = null
    pagination.value = null
    clearFilters()
    clearError()
  }

  return {
    // State
    events,
    currentEvent,
    isLoading,
    error,
    pagination,
    filters,
    
    // Getters
    activeEvents,
    upcomingEvents,
    draftEvents,
    completedEvents,
    totalEvents,
    currentPage,
    totalPages,
    
    // Actions
    fetchEvents,
    fetchEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    setFilters,
    clearFilters,
    clearError,
    reset
  }
})
