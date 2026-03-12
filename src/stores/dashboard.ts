import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DashboardStats } from '@/types'

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardStats>({
    totalEvents: 0,
    totalCommands: 0,
    activeUsers: 0,
    recentEvents: [],
  })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const recentEventsCount = computed(() => stats.value.recentEvents.length)
  const hasRecentEvents = computed(() => recentEventsCount.value > 0)

  const fetchDashboardStats = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        stats.value = await response.json()
      } else {
        throw new Error('Failed to fetch dashboard stats')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      isLoading.value = false
    }
  }

  const refreshStats = () => {
    fetchDashboardStats()
  }

  return {
    stats,
    isLoading,
    error,
    recentEventsCount,
    hasRecentEvents,
    fetchDashboardStats,
    refreshStats,
  }
})
