<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">API Usage Examples</h1>
    
    <!-- Login Form -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Login Example</h2>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input
            v-model="loginForm.email"
            type="email"
            class="w-full px-3 py-2 border rounded-md"
            placeholder="test@example.com"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Password</label>
          <input
            v-model="loginForm.password"
            type="password"
            class="w-full px-3 py-2 border rounded-md"
            placeholder="password"
          />
        </div>
        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {{ authStore.isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      
      <div v-if="authStore.user" class="mt-4 p-4 bg-green-100 rounded-md">
        <p class="text-green-800">Logged in as: {{ authStore.user.name }}</p>
      </div>
    </div>

    <!-- API Examples -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">API Examples</h2>
      
      <div class="space-y-4">
        <button
          @click="fetchEvents"
          :disabled="isLoading"
          class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
        >
          {{ isLoading ? 'Loading...' : 'Fetch Events' }}
        </button>
        
        <button
          @click="createEvent"
          :disabled="isLoading"
          class="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 disabled:opacity-50"
        >
          {{ isLoading ? 'Creating...' : 'Create Event' }}
        </button>
        
        <button
          @click="uploadFile"
          :disabled="isLoading"
          class="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 disabled:opacity-50"
        >
          {{ isLoading ? 'Uploading...' : 'Upload File' }}
        </button>
      </div>
      
      <!-- Error Display -->
      <div v-if="error" class="mt-4 p-4 bg-red-100 rounded-md">
        <p class="text-red-800 font-medium">Error: {{ error }}</p>
        <div v-if="validationErrors" class="mt-2">
          <p class="text-red-700 font-medium">Validation Errors:</p>
          <ul class="list-disc list-inside text-red-600">
            <li v-for="(errors, field) in validationErrors" :key="field">
              {{ field }}: {{ errors.join(', ') }}
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Success Display -->
      <div v-if="successMessage" class="mt-4 p-4 bg-green-100 rounded-md">
        <p class="text-green-800">{{ successMessage }}</p>
      </div>
      
      <!-- Data Display -->
      <div v-if="events.length > 0" class="mt-4">
        <h3 class="font-medium mb-2">Events:</h3>
        <pre class="bg-gray-100 p-3 rounded-md text-sm overflow-auto">{{ JSON.stringify(events, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useApi } from '@/composables/useApi'
import type { Event } from '@/types'

const authStore = useAuthStore()
const { isLoading, error, validationErrors, get, post, upload } = useApi()

const loginForm = ref({
  email: 'test@example.com',
  password: 'password'
})

const events = ref<Event[]>([])
const successMessage = ref('')

const handleLogin = async () => {
  const success = await authStore.login(loginForm.value)
  if (success) {
    successMessage.value = 'Login successful!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  }
}

const fetchEvents = async () => {
  const result = await get<Event[]>('/api/events')
  if (result) {
    events.value = result
    successMessage.value = `Fetched ${result.length} events`
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  }
}

const createEvent = async () => {
  const eventData = {
    title: 'Test Event',
    description: 'This is a test event created via API',
    type: 'user_action' as const,
    data: { test: true }
  }
  
  const result = await post<Event>('/api/events', eventData)
  if (result) {
    successMessage.value = `Created event: ${result.title}`
    events.value.unshift(result)
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  }
}

const uploadFile = async () => {
  // Create a dummy file for demonstration
  const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
  
  const result = await upload<{ message: string }>('/api/upload', file)
  if (result) {
    successMessage.value = `File uploaded: ${result.message}`
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  }
}
</script>
