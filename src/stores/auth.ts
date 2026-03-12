import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { useApi } from '@/composables/useApi'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const { post, get } = useApi()

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const login = async (credentials: { email: string; password: string }) => {
    isLoading.value = true
    try {
      const response = await post<{ token: string; user: User }>('/api/auth/login', credentials)
      
      if (response) {
        token.value = response.token
        user.value = response.user
        localStorage.setItem('token', response.token)
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  const initAuth = async () => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      token.value = storedToken
      
      try {
        // Validate token and fetch user data
        const response = await get<{ user: User }>('/api/auth/me')
        if (response) {
          user.value = response.user
        } else {
          // Token is invalid, clear it
          logout()
        }
      } catch (error) {
        console.error('Token validation failed:', error)
        logout()
      }
    }
  }

  const refreshToken = async () => {
    try {
      const response = await post<{ token: string }>('/api/auth/refresh', {}, { skipAuth: true })
      if (response) {
        token.value = response.token
        localStorage.setItem('token', response.token)
        return true
      }
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      return false
    }
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    initAuth,
    refreshToken,
  }
})
