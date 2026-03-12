import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Invitation {
  id: number
  event_id: number
  user_id: number
  email: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  updated_at: string
}

export const useInvitationsStore = defineStore('invitations', () => {
  const invitations = ref<Invitation[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchInvitations = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/invitations')
      if (response.ok) {
        invitations.value = await response.json()
      } else {
        throw new Error('Failed to fetch invitations')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      isLoading.value = false
    }
  }

  const createInvitation = async (invitationData: Omit<Invitation, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invitationData),
      })
      
      if (response.ok) {
        const newInvitation = await response.json()
        invitations.value.unshift(newInvitation)
        return newInvitation
      }
      throw new Error('Failed to create invitation')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      throw err
    }
  }

  const updateInvitationStatus = async (id: number, status: 'accepted' | 'declined') => {
    try {
      const response = await fetch(`/api/invitations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })
      
      if (response.ok) {
        const updatedInvitation = await response.json()
        const index = invitations.value.findIndex(inv => inv.id === id)
        if (index !== -1) {
          invitations.value[index] = updatedInvitation
        }
        return updatedInvitation
      }
      throw new Error('Failed to update invitation')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      throw err
    }
  }

  // Computed properties for dashboard stats
  const totalInvitations = computed(() => invitations.value.length)
  const pendingInvitations = computed(() => 
    invitations.value.filter(inv => inv.status === 'pending').length
  )
  const acceptedInvitations = computed(() => 
    invitations.value.filter(inv => inv.status === 'accepted').length
  )

  return {
    invitations,
    isLoading,
    error,
    fetchInvitations,
    createInvitation,
    updateInvitationStatus,
    totalInvitations,
    pendingInvitations,
    acceptedInvitations,
  }
})
