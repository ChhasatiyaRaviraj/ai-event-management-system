import { ref } from 'vue'
import api, { apiUtils, type ApiResponse, type ApiError, type RequestConfig } from '@/utils/api'

export function useApi() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const validationErrors = ref<Record<string, string[]> | null>(null)

  const execute = async <T>(apiCall: () => Promise<ApiResponse<T>>): Promise<T | null> => {
    isLoading.value = true
    error.value = null
    validationErrors.value = null
    
    try {
      const response = await apiCall()
      return response.data
    } catch (err) {
      const apiError = err as ApiError
      
      if (apiError.errors) {
        validationErrors.value = apiError.errors
        error.value = apiError.message
      } else {
        error.value = apiError.message
      }
      
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Convenience methods
  const get = <T>(url: string, config?: RequestConfig) => {
    return execute<T>(() => apiUtils.get<T>(url, config).then(res => res.data))
  }
  
  const post = <T>(url: string, data?: any, config?: RequestConfig) => {
    return execute<T>(() => apiUtils.post<T>(url, data, config).then(res => res.data))
  }
  
  const put = <T>(url: string, data?: any, config?: RequestConfig) => {
    return execute<T>(() => apiUtils.put<T>(url, data, config).then(res => res.data))
  }
  
  const patch = <T>(url: string, data?: any, config?: RequestConfig) => {
    return execute<T>(() => apiUtils.patch<T>(url, data, config).then(res => res.data))
  }
  
  const del = <T>(url: string, config?: RequestConfig) => {
    return execute<T>(() => apiUtils.delete<T>(url, config).then(res => res.data))
  }
  
  const upload = <T>(url: string, file: File | FormData, config?: RequestConfig) => {
    return execute<T>(() => apiUtils.upload<T>(url, file, config).then(res => res.data))
  }

  return {
    isLoading,
    error,
    validationErrors,
    execute,
    get,
    post,
    put,
    patch,
    delete: del,
    upload,
    api: apiUtils,
  }
}
