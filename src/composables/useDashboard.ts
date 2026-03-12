import { ref } from 'vue'
import { dashboardService } from '@/services'
import type { DashboardStats, DashboardSummary } from '@/types'

export function useDashboard() {
  const stats = ref<DashboardStats | null>(null)
  const summary = ref<DashboardSummary | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Fetch dashboard summary
  const fetchSummary = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      stats.value = await dashboardService.getSummary()
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch dashboard summary'
    } finally {
      isLoading.value = false
    }
  }

  // Fetch dashboard statistics
  const fetchStats = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      summary.value = await dashboardService.getStats()
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch dashboard statistics'
    } finally {
      isLoading.value = false
    }
  }

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const data = await dashboardService.getQuickStats()
      stats.value = data.summary
      summary.value = data.stats
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch dashboard data'
    } finally {
      isLoading.value = false
    }
  }

  // Refresh dashboard data
  const refreshDashboard = async () => {
    await fetchDashboardData()
  }

  return {
    stats,
    summary,
    isLoading,
    error,
    fetchSummary,
    fetchStats,
    fetchDashboardData,
    refreshDashboard
  }
}
