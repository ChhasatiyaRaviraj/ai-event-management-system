import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '@/composables/useApi'

export interface Guest {
  id: number
  name: string
  email: string
  phone?: string
  accepted_count: number
  pending_count: number
  declined_count: number
  invitations_count: number
  created_at: string
  updated_at: string
}

export interface GuestFilters {
  search?: string
  email?: string
  has_invitations?: boolean
  has_accepted?: boolean
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  per_page?: number
  page?: number
}

export interface GuestListResponse {
  data: Guest[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
  }
}

export const useGuestStore = defineStore('guests', () => {
  const api = useApi()
  
  // State
  const guests = ref<Guest[]>([])
  const currentGuest = ref<Guest | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<GuestListResponse['pagination'] | null>(null)
  const filters = ref<GuestFilters>({
    sort_by: 'created_at',
    sort_order: 'desc',
    per_page: 15
  })

  // Getters
  const guestsWithInvitations = computed(() => 
    guests.value.filter(guest => guest.invitations_count > 0)
  )
  const guestsWithAccepted = computed(() => 
    guests.value.filter(guest => guest.accepted_count > 0)
  )
  const totalGuests = computed(() => pagination.value?.total || 0)
  const currentPage = computed(() => pagination.value?.current_page || 1)
  const totalPages = computed(() => pagination.value?.last_page || 1)

  // Actions
  const fetchGuests = async (guestFilters?: Partial<GuestFilters>) => {
    isLoading.value = true
    error.value = null
    
    try {
      const mergedFilters = { ...filters.value, ...guestFilters }
      const response = await api.get('/guests', { params: mergedFilters })
      
      const responseData: GuestListResponse = response.data as GuestListResponse
      guests.value = responseData.data
      pagination.value = responseData.pagination
      
      if (guestFilters) {
        filters.value = { ...filters.value, ...guestFilters }
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch guests'
      console.error('Guests fetch error:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchGuest = async (id: number) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/guests/${id}`)
      currentGuest.value = response.data as Guest
      return currentGuest.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch guest'
      console.error('Guest fetch error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const createGuest = async (guestData: Partial<Guest>) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.post('/guests', guestData)
      const newGuest = response.data as Guest
      
      guests.value.unshift(newGuest)
      
      return newGuest
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create guest'
      console.error('Guest creation error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateGuest = async (id: number, guestData: Partial<Guest>) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.put(`/guests/${id}`, guestData)
      const updatedGuest = response.data as Guest
      
      // Update in guests list
      const index = guests.value.findIndex(guest => guest.id === id)
      if (index !== -1) {
        guests.value[index] = updatedGuest
      }
      
      // Update current guest if it's the same
      if (currentGuest.value?.id === id) {
        currentGuest.value = updatedGuest
      }
      
      return updatedGuest
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update guest'
      console.error('Guest update error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteGuest = async (id: number) => {
    isLoading.value = true
    error.value = null
    
    try {
      await api.delete(`/guests/${id}`)
      
      // Remove from guests list
      guests.value = guests.value.filter(guest => guest.id !== id)
      
      // Clear current guest if it's the same
      if (currentGuest.value?.id === id) {
        currentGuest.value = null
      }
      
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete guest'
      console.error('Guest deletion error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchGuestEvents = async (id: number) => {
    try {
      const response = await api.get(`/guests/${id}/events`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch guest events'
      console.error('Guest events fetch error:', err)
      return []
    }
  }

  const searchGuests = async (query: string) => {
    return fetchGuests({ search: query })
  }

  const setFilters = (newFilters: Partial<GuestFilters>) => {
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
    guests.value = []
    currentGuest.value = null
    pagination.value = null
    clearFilters()
    clearError()
  }

  return {
    // State
    guests,
    currentGuest,
    isLoading,
    error,
    pagination,
    filters,
    
    // Getters
    guestsWithInvitations,
    guestsWithAccepted,
    totalGuests,
    currentPage,
    totalPages,
    
    // Actions
    fetchGuests,
    fetchGuest,
    createGuest,
    updateGuest,
    deleteGuest,
    fetchGuestEvents,
    searchGuests,
    setFilters,
    clearFilters,
    clearError,
    reset
  }
})
