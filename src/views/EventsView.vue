<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Events</h1>
      <button
        @click="showCreateModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Create Event
      </button>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b border-gray-200">
        <div class="flex space-x-4">
          <select
            v-model="filters.type"
            @change="fetchEvents"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="ai_command">AI Commands</option>
            <option value="user_action">User Actions</option>
            <option value="system_event">System Events</option>
          </select>
          <button
            @click="fetchEvents"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>
      </div>

      <div class="p-6">
        <div v-if="eventsStore.isLoading" class="text-center py-8">
          <p class="text-gray-500">Loading events...</p>
        </div>
        <div v-else-if="eventsStore.events.length === 0" class="text-center py-8">
          <p class="text-gray-500">No events found</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="event in eventsStore.events"
            :key="event.id"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">{{ event.title }}</h3>
                <p class="text-gray-600 mt-1">{{ event.description }}</p>
                <div class="mt-2">
                  <span
                    :class="[
                      'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                      getEventTypeClass(event.type)
                    ]"
                  >
                    {{ event.type }}
                  </span>
                </div>
              </div>
              <div class="text-right text-sm text-gray-500">
                <p>{{ formatDate(event.created_at) }}</p>
                <p class="mt-1">User ID: {{ event.user_id }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEventsStore } from '@/stores/events'

const eventsStore = useEventsStore()

const showCreateModal = ref(false)
const filters = ref({
  type: '',
  user_id: undefined as number | undefined,
})

const getEventTypeClass = (type: string) => {
  const classes = {
    ai_command: 'bg-blue-100 text-blue-800',
    user_action: 'bg-green-100 text-green-800',
    system_event: 'bg-yellow-100 text-yellow-800',
  }
  return classes[type as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const fetchEvents = () => {
  eventsStore.fetchEvents(filters.value)
}

onMounted(() => {
  fetchEvents()
})
</script>
