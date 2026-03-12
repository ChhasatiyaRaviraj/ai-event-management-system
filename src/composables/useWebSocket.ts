import { ref, onMounted, onUnmounted } from 'vue'
import Echo from 'laravel-echo'
import { useNotifications } from '@/composables/useNotifications'

interface WebSocketEvent {
  [key: string]: any
}

interface CommandProcessedEvent extends WebSocketEvent {
  status: string
  message: string
  data?: any
  timestamp: string
}

interface EventCreatedEvent extends WebSocketEvent {
  event: {
    id: number
    name: string
    description: string
    date: string
    capacity: number
    status: string
    created_at: string
  }
}

interface InvitationSentEvent extends WebSocketEvent {
  invitation_id: number
  event_id: number
  guest_id: number
  guest_name: string
  guest_email: string
  event_name: string
  event_date: string
  sent_at: string
  timestamp: string
}

export function useWebSocket() {
  const echo = ref<any>(null)
  const isConnected = ref(false)
  const connectionError = ref<string | null>(null)
  const { success, info, warning } = useNotifications()

  // Store event callbacks
  const eventCallbacks = ref<Map<string, Function[]>>(new Map())

  const initializeEcho = () => {
    try {
      echo.value = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY || 'your-pusher-key',
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
        wsHost: import.meta.env.VITE_PUSHER_HOST || `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1'}.pusher.com`,
        wsPort: import.meta.env.VITE_PUSHER_PORT || 80,
        wssPort: import.meta.env.VITE_PUSHER_PORT || 443,
        forceTLS: import.meta.env.VITE_PUSHER_SCHEME || 'https' === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: '/api/broadcasting/auth',
        auth: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      })

      isConnected.value = true
      connectionError.value = null
      
      console.log('WebSocket connected successfully')
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error)
      connectionError.value = 'Failed to connect to real-time services'
      isConnected.value = false
    }
  }

  const subscribeToChannel = (channel: string, event: string, callback: Function) => {
    if (!echo.value) return

    // Store callback for later use
    if (!eventCallbacks.value.has(channel)) {
      eventCallbacks.value.set(channel, [])
    }
    eventCallbacks.value.get(channel)?.push(callback)

    // Subscribe to the channel and event
    const channelInstance = echo.value.private(channel)
    channelInstance.listen(event, (data: any) => {
      callback(data)
    })

    // Handle errors
    channelInstance.error((error: any) => {
      console.error(`Channel ${channel} error:`, error)
    })
  }

  const unsubscribeFromChannel = (channel: string, event?: string) => {
    if (!echo.value) return

    const channelInstance = echo.value.private(channel)
    
    if (event) {
      channelInstance.stopListening(event)
    } else {
      channelInstance.leave()
    }

    // Clear callbacks
    eventCallbacks.value.delete(channel)
  }

  const disconnect = () => {
    if (echo.value) {
      echo.value.disconnect()
      echo.value = null
      isConnected.value = false
      console.log('WebSocket disconnected')
    }
  }

  const reconnect = () => {
    disconnect()
    initializeEcho()
  }

  // Auto-initialize on mount
  onMounted(() => {
    // Only initialize if user is authenticated
    const token = localStorage.getItem('token')
    if (token) {
      initializeEcho()
    }
  })

  // Cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    echo,
    isConnected,
    connectionError,
    initializeEcho,
    subscribeToChannel,
    unsubscribeFromChannel,
    disconnect,
    reconnect,
  }
}
