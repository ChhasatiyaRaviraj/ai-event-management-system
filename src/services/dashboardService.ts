import { apiUtils } from '@/utils/api'
import type { DashboardStats, DashboardSummary } from '@/types'

class DashboardService {
  // Get dashboard summary
  async getSummary(): Promise<DashboardStats> {
    const response = await apiUtils.get<DashboardStats>('/dashboard/summary')
    return response.data.data
  }

  // Get dashboard statistics
  async getStats(): Promise<DashboardSummary> {
    const response = await apiUtils.get<DashboardSummary>('/dashboard/stats')
    return response.data.data
  }

  // Get quick stats (combination of summary and stats)
  async getQuickStats(): Promise<{
    summary: DashboardStats
    stats: DashboardSummary
  }> {
    const [summary, stats] = await Promise.all([
      this.getSummary(),
      this.getStats()
    ])
    
    return { summary, stats }
  }
}

export const dashboardService = new DashboardService()
