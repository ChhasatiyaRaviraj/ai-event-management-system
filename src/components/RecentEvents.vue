<template>
  <div class="bg-white rounded-lg shadow">
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900">Recent Events</h3>
        <router-link
          to="/events"
          class="text-sm text-blue-600 hover:text-blue-500"
        >
          View All
        </router-link>
      </div>
    </div>
    
    <div class="p-6">
      <div v-if="eventsStore.isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p class="text-gray-500 mt-2">Loading events...</p>
      </div>
      
      <div v-else-if="recentEvents.length === 0" class="text-center py-8">
        <div class="text-gray-400 mb-2">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="text-gray-500">No events found</p>
      </div>
      
      <div v-else class="space-y-4">
        <div
          v-for="event in recentEvents"
          :key="event.id"
          class="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 rounded-r-lg transition-colors cursor-pointer"
          @click="viewEventDetails(event)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="text-sm font-medium text-gray-900">{{ event.title }}</h4>
              <p class="text-sm text-gray-600 mt-1 line-clamp-2">
                {{ event.description }}
              </p>
              <div class="flex items-center mt-2 space-x-2">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                    getEventTypeClass(event.type)
                  ]"
                >
                  {{ event.type }}
                </span>
                <span class="text-xs text-gray-500">
                  {{ formatDate(event.created_at) }}
                </span>
              </div>
            </div>
            
            <div class="ml-4 flex-shrink-0">
              <button
                @click.stop="viewEventDetails(event)"
                class="text-gray-400 hover:text-gray-600"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="recentEvents.length > 0" class="mt-6 pt-4 border-t border-gray-200">
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-500">
            Showing {{ recentEvents.length }} of {{ eventsStore.events.length }} events
          </p>
          <router-link
            to="/events"
            class="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            View All Events →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/events'
import type { Event } from '@/types'

const router = useRouter()
const eventsStore = useEventsStore()

// Show only the 5 most recent events
const recentEvents = computed(() => 
  eventsStore.events.slice(0, 5)
)

const getEventTypeClass = (type: string) => {
  const classes = {
    ai_command: 'bg-blue-100 text-blue-800',
    user_action: 'bg-green-100 text-green-800',
    system_event: 'bg-yellow-100 text-yellow-800',
  }
  return classes[type as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) {
    return 'Just now'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}m ago`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}h ago`
  } else {
    return date.toLocaleDateString()
  }
}

const viewEventDetails = (event: Event) => {
  // Navigate to events page with event details
  router.push({
    name: 'events',
    query: { eventId: event.id.toString() }
  })
}

onMounted(() => {
  // Fetch events when component mounts
  eventsStore.fetchEvents()
})
</script>
