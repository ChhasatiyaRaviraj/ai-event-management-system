import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '@/composables/useApi'

export interface DashboardData {
  counts: {
    total_events: number
    total_guests: number
    total_invitations: number
    invitations_sent: number
    pending_invitations: number
    accepted_invitations: number
    declined_invitations: number
  }
  event_status: {
    draft: number
    active: number
    completed: number
  }
  metrics: {
    acceptance_rate: number
    average_invitations_per_event: number
    average_guests_per_event: number
  }
  upcoming_events: any[]
  recent_activity: {
    events: any[]
    guests: any[]
    invitations: any[]
  }
  popular_events: any[]
  date_filter: string
  generated_at: string
}

export interface CommandResponse {
  success: boolean
  job_id?: string
  message: string
  session_id?: string
  error?: string
}

export const useAIStore = defineStore('ai', () => {
  const api = useApi()
  
  // State
  const dashboardData = ref<DashboardData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const commandHistory = ref<Array<{
    command: string
    response: CommandResponse
    timestamp: string
  }>>([])

  // Getters
  const hasData = computed(() => dashboardData.value !== null)
  const totalEvents = computed(() => dashboardData.value?.counts?.total_events || 0)
  const totalGuests = computed(() => dashboardData.value?.counts?.total_guests || 0)
  const pendingInvitations = computed(() => dashboardData.value?.counts?.pending_invitations || 0)
  const acceptanceRate = computed(() => dashboardData.value?.metrics?.acceptance_rate || 0)

  // Actions
  const fetchDashboardData = async (dateFilter = 'all') => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/dashboard/summary${dateFilter !== 'all' ? `?date_filter=${dateFilter}` : ''}`)
      dashboardData.value = response.data as DashboardData
    } catch (err) {
      error.value = 'Failed to fetch dashboard data'
      console.error('Dashboard fetch error:', err)
    } finally {
      isLoading.value = false
    }
  }

  const executeCommand = async (command: string, sessionId = 'default'): Promise<CommandResponse> => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.post('/ai/command', {
        command,
        session_id: sessionId
      })
      
      const commandResponse: CommandResponse = response.data as CommandResponse
      
      // Add to history
      commandHistory.value.unshift({
        command,
        response: commandResponse,
        timestamp: new Date().toISOString()
      })
      
      // Keep only last 10 commands
      if (commandHistory.value.length > 10) {
        commandHistory.value = commandHistory.value.slice(0, 10)
      }
      
      return commandResponse
    } catch (err: any) {
      const errorResponse: CommandResponse = {
        success: false,
        message: err.response?.data?.message || 'Failed to execute command',
        error: err.response?.data?.error || err.message
      }
      
      error.value = errorResponse.message
      
      // Add failed command to history
      commandHistory.value.unshift({
        command,
        response: errorResponse,
        timestamp: new Date().toISOString()
      })
      
      return errorResponse
    } finally {
      isLoading.value = false
    }
  }

  const clearHistory = () => {
    commandHistory.value = []
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    dashboardData,
    isLoading,
    error,
    commandHistory,
    
    // Getters
    hasData,
    totalEvents,
    totalGuests,
    pendingInvitations,
    acceptanceRate,
    
    // Actions
    fetchDashboardData,
    executeCommand,
    clearHistory,
    clearError
  }
})
