<template>
  <div class="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
    <!-- Header -->
    <div class="p-6">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ event.name }}</h3>
          <p v-if="event.description" class="text-sm text-gray-600 mb-3">{{ event.description }}</p>
        </div>
        <div class="ml-4">
          <span
            :class="[
              'inline-flex px-2 py-1 text-xs font-medium rounded-full',
              getStatusClass(event.status)
            ]"
          >
            {{ event.status }}
          </span>
        </div>
      </div>

      <!-- Event Details -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="flex items-center text-sm text-gray-500">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ formatDate(event.date) }}
        </div>
        <div class="flex items-center text-sm text-gray-500">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {{ event.capacity }} guests
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="mb-4">
        <div class="flex justify-between text-sm text-gray-600 mb-1">
          <span>Capacity</span>
          <span>{{ event.accepted_count || 0 }}/{{ event.capacity }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all"
            :style="{ width: `${capacityPercentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="bg-green-50 rounded p-2">
          <div class="text-green-600 font-semibold text-lg">{{ event.accepted_count || 0 }}</div>
          <div class="text-green-700 text-xs">Accepted</div>
        </div>
        <div class="bg-yellow-50 rounded p-2">
          <div class="text-yellow-600 font-semibold text-lg">{{ event.pending_count || 0 }}</div>
          <div class="text-yellow-700 text-xs">Pending</div>
        </div>
        <div class="bg-blue-50 rounded p-2">
          <div class="text-blue-600 font-semibold text-lg">{{ event.available_slots || event.capacity }}</div>
          <div class="text-blue-700 text-xs">Available</div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="px-6 pb-6 pt-4 border-t border-gray-100">
      <div class="flex space-x-2">
        <button
          @click="$emit('view-details', event)"
          class="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
        <button
          v-if="canSendInvitations"
          @click="$emit('send-invitations', event)"
          class="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Send Invitations
        </button>
        <button
          @click="$emit('edit', event)"
          class="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Event {
  id: number
  name: string
  description?: string
  date: string
  capacity: number
  status: 'draft' | 'active' | 'completed'
  accepted_count?: number
  pending_count?: number
  available_slots?: number
  invitations_count?: number
}

interface Props {
  event: Event
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'view-details': [event: Event]
  'send-invitations': [event: Event]
  'edit': [event: Event]
}>()

const capacityPercentage = computed(() => {
  const accepted = props.event.accepted_count || 0
  return Math.min((accepted / props.event.capacity) * 100, 100)
})

const canSendInvitations = computed(() => {
  return props.event.pending_count > 0 && props.event.status !== 'completed'
})

const getStatusClass = (status: string) => {
  const classes = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>
