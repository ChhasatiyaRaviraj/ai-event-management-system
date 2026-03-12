import { apiUtils } from '@/utils/api'
import type { HealthResponse } from '@/types'

class HealthService {
  // Check API health (public endpoint)
  async checkHealth(): Promise<HealthResponse> {
    const response = await apiUtils.get<HealthResponse>('/health', { skipAuth: true })
    return response.data.data
  }

  // Check API v1 health (public endpoint)
  async checkV1Health(): Promise<HealthResponse> {
    const response = await apiUtils.get<HealthResponse>('/health', { skipAuth: true })
    return response.data.data
  }

  // Check if API is accessible
  async isApiAccessible(): Promise<boolean> {
    try {
      await this.checkHealth()
      return true
    } catch (error) {
      return false
    }
  }
}

export const healthService = new HealthService()
