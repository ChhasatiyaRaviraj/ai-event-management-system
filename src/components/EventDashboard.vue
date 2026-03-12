<template>
  <div class="p-6 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">AI Event System Dashboard</h1>
    
    <!-- Health Check -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">API Health Check</h2>
      <div class="bg-white rounded-lg shadow p-4">
        <div v-if="healthLoading" class="text-gray-600">Checking API health...</div>
        <div v-else-if="healthError" class="text-red-600">❌ {{ healthError }}</div>
        <div v-else-if="healthData" class="text-green-600">
          ✅ {{ healthData.service }} - {{ healthData.status }} (v{{ healthData.version }})
        </div>
        <button 
          @click="checkHealth" 
          class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          :disabled="healthLoading"
        >
          {{ healthLoading ? 'Checking...' : 'Check Health' }}
        </button>
      </div>
    </div>

    <!-- Dashboard Stats -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">Dashboard Statistics</h2>
      <div v-if="dashboardLoading" class="text-gray-600">Loading dashboard data...</div>
      <div v-else-if="dashboardError" class="text-red-600">❌ {{ dashboardError }}</div>
      <div v-else-if="dashboardStats" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="text-lg font-medium text-gray-900">Total Events</h3>
          <p class="text-3xl font-bold text-blue-600">{{ dashboardStats.totalEvents }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="text-lg font-medium text-gray-900">Total Guests</h3>
          <p class="text-3xl font-bold text-green-600">{{ dashboardStats.totalGuests }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="text-lg font-medium text-gray-900">Total Invitations</h3>
          <p class="text-3xl font-bold text-purple-600">{{ dashboardStats.totalInvitations }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="text-lg font-medium text-gray-900">Upcoming Events</h3>
          <p class="text-3xl font-bold text-orange-600">{{ dashboardStats.upcomingEvents }}</p>
        </div>
      </div>
      <button 
        @click="loadDashboard" 
        class="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        :disabled="dashboardLoading"
      >
        {{ dashboardLoading ? 'Loading...' : 'Load Dashboard' }}
      </button>
    </div>

    <!-- Events List -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">Events</h2>
      <div v-if="eventsLoading" class="text-gray-600">Loading events...</div>
      <div v-else-if="eventsError" class="text-red-600">❌ {{ eventsError }}</div>
      <div v-else-if="events.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="event in events" 
          :key="event.id"
          class="bg-white rounded-lg shadow p-4 border-l-4"
          :class="{
            'border-blue-500': event.status === 'active',
            'border-gray-400': event.status === 'draft',
            'border-green-500': event.status === 'completed'
          }"
        >
          <h3 class="text-lg font-medium text-gray-900">{{ event.name }}</h3>
          <p class="text-gray-600 text-sm mt-1">{{ event.description }}</p>
          <div class="mt-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Date:</span>
              <span>{{ formatDate(event.date) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Capacity:</span>
              <span>{{ event.capacity }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Status:</span>
              <span 
                class="px-2 py-1 rounded text-xs font-medium"
                :class="{
                  'bg-blue-100 text-blue-800': event.status === 'active',
                  'bg-gray-100 text-gray-800': event.status === 'draft',
                  'bg-green-100 text-green-800': event.status === 'completed'
                }"
              >
                {{ event.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-gray-500">No events found.</div>
      <button 
        @click="loadEvents" 
        class="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        :disabled="eventsLoading"
      >
        {{ eventsLoading ? 'Loading...' : 'Load Events' }}
      </button>
    </div>

    <!-- Create Event Form -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">Create New Event</h2>
      <div class="bg-white rounded-lg shadow p-6">
        <form @submit.prevent="createEvent" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Event Name</label>
            <input 
              v-model="newEvent.name"
              type="text" 
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="Enter event name"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea 
              v-model="newEvent.description"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="Enter event description"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Date & Time</label>
            <input 
              v-model="newEvent.date"
              type="datetime-local" 
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Capacity</label>
            <input 
              v-model.number="newEvent.capacity"
              type="number" 
              required
              min="1"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="Enter capacity"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <select 
              v-model="newEvent.status"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div class="flex space-x-4">
            <button 
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              :disabled="createEventLoading"
            >
              {{ createEventLoading ? 'Creating...' : 'Create Event' }}
            </button>
            <button 
              type="button"
              @click="resetForm"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHealth } from '@/composables/useHealth'
import { useDashboard } from '@/composables/useDashboard'
import { useEvents } from '@/composables/useEvents'
import type { Event } from '@/types'

// Health check
const { health: healthData, isLoading: healthLoading, error: healthError, checkHealth } = useHealth()

// Dashboard
const { stats: dashboardStats, isLoading: dashboardLoading, error: dashboardError, fetchDashboardData: loadDashboard } = useDashboard()

// Events
const { events, isLoading: eventsLoading, error: eventsError, fetchEvents: loadEvents, createEvent: createEventApi } = useEvents()

// New event form
const newEvent = ref({
  name: '',
  description: '',
  date: '',
  capacity: 0,
  status: 'draft' as 'draft' | 'active' | 'completed'
})
const createEventLoading = ref(false)

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

// Create event
const createEvent = async () => {
  createEventLoading.value = true
  try {
    await createEventApi(newEvent.value)
    resetForm()
    await loadEvents() // Refresh events list
    await loadDashboard() // Refresh dashboard stats
  } finally {
    createEventLoading.value = false
  }
}

// Reset form
const resetForm = () => {
  newEvent.value = {
    name: '',
    description: '',
    date: '',
    capacity: 0,
    status: 'draft'
  }
}

// Load data on mount
onMounted(async () => {
  await Promise.all([
    checkHealth(),
    loadDashboard(),
    loadEvents()
  ])
})
</script>
