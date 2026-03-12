<template>
  <div class="bg-white rounded-lg shadow">
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900">Live Activity Feed</h3>
        <div class="flex items-center">
          <div
            :class="[
              'w-2 h-2 rounded-full mr-2',
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            ]"
          ></div>
          <span class="text-sm text-gray-500">
            {{ isConnected ? 'Connected' : 'Disconnected' }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="p-6">
      <div v-if="liveEvents.length === 0" class="text-center py-8">
        <div class="text-gray-400 mb-2">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-gray-500">No recent activity</p>
      </div>
      
      <div v-else class="space-y-4">
        <div
          v-for="event in liveEvents"
          :key="event.id"
          class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div class="flex-shrink-0">
            <div
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center',
                getEventIconClass(event.type)
              ]"
            >
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path :d="getEventIconPath(event.type)" />
              </svg>
            </div>
          </div>
          
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900">
              {{ event.title }}
            </p>
            <p class="text-sm text-gray-600 mt-1">
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
                {{ formatTime(event.created_at) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="liveEvents.length > 0" class="mt-4 pt-4 border-t border-gray-200">
        <button
          @click="clearFeed"
          class="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear Feed
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'

interface LiveEvent {
  id: string
  title: string
  description: string
  type: 'command' | 'event' | 'invitation' | 'guest' | 'system'
  status?: string
  created_at: string
  data?: any
}

const { isConnected, subscribeToChannel, unsubscribeFromChannel } = useWebSocket()

const liveEvents = ref<LiveEvent[]>([])
const maxEvents = 20

const addEvent = (event: LiveEvent) => {
  liveEvents.value.unshift(event)
  
  // Keep only last 20 events
  if (liveEvents.value.length > maxEvents) {
    liveEvents.value = liveEvents.value.slice(0, maxEvents)
  }
}

// WebSocket event handlers
const handleCommandProcessed = (data: any) => {
  addEvent({
    id: `cmd_${Date.now()}`,
    title: 'AI Command Processed',
    description: data.message || 'Command completed',
    type: 'command',
    status: data.status || 'info',
    created_at: data.timestamp || new Date().toISOString(),
    data: data
  })
}

const handleEventCreated = (data: any) => {
  const event = data.event
  addEvent({
    id: `event_${event.id}`,
    title: 'Event Created',
    description: `"${event.name}" scheduled for ${event.date}`,
    type: 'event',
    status: 'success',
    created_at: data.timestamp || new Date().toISOString(),
    data: data
  })
}

const handleInvitationSent = (data: any) => {
  addEvent({
    id: `inv_${data.invitation_id}`,
    title: 'Invitation Sent',
    description: `Invitation sent to ${data.guest_name} for ${data.event_name}`,
    type: 'invitation',
    status: 'success',
    created_at: data.timestamp || new Date().toISOString(),
    data: data
  })
}

const getEventIconClass = (type: string) => {
  const classes = {
    command: 'bg-blue-500',
    event: 'bg-green-500',
    invitation: 'bg-purple-500',
    guest: 'bg-orange-500',
    system: 'bg-gray-500',
  }
  return classes[type as keyof typeof classes] || 'bg-gray-500'
}

const getEventIconPath = (type: string) => {
  const paths = {
    command: 'M13 10V3L4 14h7v7l9-11h-7z',
    event: 'M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z',
    invitation: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    guest: 'M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z',
    system: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  }
  return paths[type as keyof typeof paths] || paths.system
}

const getEventTypeClass = (type: string) => {
  const classes = {
    command: 'bg-blue-100 text-blue-800',
    event: 'bg-green-100 text-green-800',
    invitation: 'bg-purple-100 text-purple-800',
    guest: 'bg-orange-100 text-orange-800',
    system: 'bg-gray-100 text-gray-800',
  }
  return classes[type as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const formatTime = (dateString: string) => {
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

const clearFeed = () => {
  liveEvents.value = []
}

onMounted(() => {
  // Subscribe to real-time channels
  subscribeToChannel('ai-commands', 'command.processed', handleCommandProcessed)
  subscribeToChannel('events', 'event.created', handleEventCreated)
  subscribeToChannel('invitations', 'invitation.sent', handleInvitationSent)
  
  // Add initial system event
  addEvent({
    id: 'system_start',
    title: 'Live Feed Active',
    description: 'Real-time activity monitoring started',
    type: 'system',
    status: 'info',
    created_at: new Date().toISOString()
  })
})

onUnmounted(() => {
  // Cleanup subscriptions
  unsubscribeFromChannel('ai-commands')
  unsubscribeFromChannel('events')
  unsubscribeFromChannel('invitations')
})
</script>
