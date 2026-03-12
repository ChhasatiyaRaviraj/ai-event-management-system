import { ref } from 'vue'
import { healthService } from '@/services'
import type { HealthResponse } from '@/types'

export function useHealth() {
  const health = ref<HealthResponse | null>(null)
  const isHealthy = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Check API health
  const checkHealth = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      health.value = await healthService.checkHealth()
      isHealthy.value = true
    } catch (err: any) {
      error.value = err.message || 'Health check failed'
      isHealthy.value = false
    } finally {
      isLoading.value = false
    }
  }

  // Check if API is accessible
  const checkApiAccessibility = async () => {
    isLoading.value = true
    
    try {
      const accessible = await healthService.isApiAccessible()
      isHealthy.value = accessible
      return accessible
    } catch (err: any) {
      isHealthy.value = false
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    health,
    isHealthy,
    isLoading,
    error,
    checkHealth,
    checkApiAccessibility
  }
}
