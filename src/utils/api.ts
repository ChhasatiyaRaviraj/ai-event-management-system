import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'

// API Response Types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  status: number
}

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

// Request Configuration Types
export interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean
  skipErrorHandler?: boolean
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000')

// Create Axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true, // Enable cookies for CSRF protection
})

// Request interceptor
api.interceptors.request.use(
  (config: any) => {
    const requestConfig = config as RequestConfig
    
    // Add auth token if not skipped
    if (!requestConfig.skipAuth) {
      const authStore = useAuthStore()
      const token = authStore.token || localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
        headers: config.headers,
      })
    }
    
    return config
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate request duration
    const endTime = new Date()
    const startTime = response.config.metadata?.startTime
    const duration = startTime ? endTime.getTime() - startTime.getTime() : 0
    
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
        status: response.status,
        data: response.data,
      })
    }
    
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RequestConfig & { _retry?: boolean }
    
    // Skip error handling if explicitly requested
    if (originalRequest?.skipErrorHandler) {
      return Promise.reject(error)
    }
    
    // Handle different error types
    if (error.response) {
      const status = error.response.status
      const errorData = error.response.data as any
      
      // Log error in development
      if (import.meta.env.DEV) {
        console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
          status,
          data: errorData,
          message: error.message,
        })
      }
      
      // Handle 401 Unauthorized
      if (status === 401) {
        const authStore = useAuthStore()
        
        // If not a retry request, try to refresh token
        if (!originalRequest._retry) {
          originalRequest._retry = true
          
          try {
            // Attempt token refresh
            const refreshResponse = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, {
              withCredentials: true,
              skipAuth: true,
            } as any)
            
            const newToken = refreshResponse.data.token
            authStore.token = newToken
            localStorage.setItem('token', newToken)
            
            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
            }
            return api(originalRequest)
          } catch (refreshError) {
            // Refresh failed, logout and redirect
            authStore.logout()
            localStorage.removeItem('token')
            
            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login'
            }
          }
        } else {
          // Second 401, logout immediately
          authStore.logout()
          localStorage.removeItem('token')
          
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login'
          }
        }
      }
      
      // Handle 422 Validation Errors
      if (status === 422 && errorData?.errors) {
        const validationError: ApiError = {
          message: errorData.message || 'Validation failed',
          status,
          errors: errorData.errors,
        }
        return Promise.reject(validationError)
      }
      
      // Handle 429 Rate Limiting
      if (status === 429) {
        const retryAfter = error.response.headers['retry-after']
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000
        
        console.warn(`⏱️ Rate limited. Retrying after ${waitTime}ms`)
        
        // Auto-retry after delay
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(api(originalRequest))
          }, waitTime)
        })
      }
      
      // Handle 500 Server Errors
      if (status >= 500) {
        console.error('💥 Server Error:', errorData?.message || 'Internal server error')
      }
    } else if (error.request) {
      // Network error (no response received)
      console.error('🌐 Network Error:', error.message)
      
      // Check if it's a CORS or connectivity issue
      if (error.message.includes('Network Error')) {
        console.error('Possible CORS or connectivity issue')
      }
    } else {
      // Request configuration error
      console.error('⚙️ Request Config Error:', error.message)
    }
    
    // Create standardized error object
    const apiError: ApiError = {
      message: (error.response?.data as any)?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status || 0,
      errors: (error.response?.data as any)?.errors,
    }
    
    return Promise.reject(apiError)
  }
)

// Utility functions for common API operations
export const apiUtils = {
  // Get with proper typing
  get: <T>(url: string, config?: RequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return api.get<ApiResponse<T>>(url, config)
  },
  
  // Post with proper typing
  post: <T>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return api.post<ApiResponse<T>>(url, data, config)
  },
  
  // Put with proper typing
  put: <T>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return api.put<ApiResponse<T>>(url, data, config)
  },
  
  // Patch with proper typing
  patch: <T>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return api.patch<ApiResponse<T>>(url, data, config)
  },
  
  // Delete with proper typing
  delete: <T>(url: string, config?: RequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return api.delete<ApiResponse<T>>(url, config)
  },
  
  // File upload
  upload: <T>(url: string, file: File | FormData, config?: RequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    const formData = file instanceof FormData ? file : new FormData()
    if (file instanceof File) {
      formData.append('file', file)
    }
    
    return api.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  // Download file
  download: (url: string, filename?: string, config?: RequestConfig): Promise<void> => {
    return api.get(url, {
      ...config,
      responseType: 'blob',
    }).then((response) => {
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    })
  },
}

// Add TypeScript declaration for axios config metadata
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: Date
    }
  }
}

export default api
