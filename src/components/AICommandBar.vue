<template>
  <div class="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
    <div class="mb-4">
      <h2 class="text-xl font-semibold text-gray-800 mb-2">AI Event Assistant</h2>
      <p class="text-sm text-gray-600">
        Type natural language commands like "Create event Tech Summit on July 20th for 50 guests"
      </p>
    </div>

    <div class="space-y-4">
      <!-- Command Input -->
      <div class="relative">
        <textarea
          v-model="command"
          @keydown.ctrl.enter="executeCommand"
          @keydown.meta.enter="executeCommand"
          placeholder="Type a command... e.g. 'Create event Gala Night on Aug 5'"
          class="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          rows="3"
          :disabled="isLoading"
        ></textarea>
        
        <!-- Loading Spinner -->
        <div v-if="isLoading" class="absolute top-2 right-2">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between">
        <div class="flex space-x-2">
          <button
            @click="executeCommand"
            :disabled="isLoading || !command.trim()"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="isLoading">Processing...</span>
            <span v-else>Execute</span>
          </button>
          
          <button
            @click="clearCommand"
            :disabled="isLoading"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            Clear
          </button>
        </div>
        
        <div class="text-xs text-gray-500">
          Ctrl+Enter to execute
        </div>
      </div>

      <!-- AI Suggestions -->
      <div v-if="suggestions.length > 0" class="border-t pt-4">
        <h3 class="text-sm font-medium text-gray-700 mb-2">Suggested Commands:</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <button
            v-for="(suggestion, index) in suggestions"
            :key="index"
            @click="setCommand(suggestion)"
            class="text-left p-2 text-sm bg-gray-50 rounded hover:bg-gray-100 transition-colors text-blue-600"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>

      <!-- Command History -->
      <div v-if="commandHistory.length > 0" class="border-t pt-4">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-sm font-medium text-gray-700">Recent Commands:</h3>
          <button
            @click="clearHistory"
            class="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear History
          </button>
        </div>
        <div class="space-y-1">
          <div
            v-for="(item, index) in commandHistory.slice(-5).reverse()"
            :key="index"
            @click="setCommand(item.command)"
            class="text-sm p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <div class="flex items-center justify-between">
              <span class="truncate">{{ item.command }}</span>
              <span
                :class="[
                  'ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full',
                  getStatusClass(item.status)
                ]"
              >
                {{ item.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAIStore } from '@/stores/useAIStore'
import { useWebSocket } from '@/composables/useWebSocket'
import { useNotifications } from '@/composables/useNotifications'
import { useLocalStorage } from '@/composables/useLocalStorage'

interface CommandHistoryItem {
  command: string
  status: 'success' | 'error' | 'pending'
  timestamp: string
}

const aiStore = useAIStore()
const { subscribeToChannel } = useWebSocket()
const { success, error: showError } = useNotifications()

const command = ref('')
const isLoading = ref(false)

// Command history from localStorage
const commandHistory = useLocalStorage<CommandHistoryItem[]>('ai-command-history', [])

const suggestions = computed(() => {
  if (!aiStore.dashboardData) return []
  
  const suggestions = []
  const { total_events, total_guests, pending_invitations } = aiStore.dashboardData.counts || {}
  
  if (total_events === 0) {
    suggestions.push('Create event "Summer Party" on July 15th for 30 guests')
  }
  
  if (total_guests < 5) {
    suggestions.push('Add guest John Doe with email john@example.com')
  }
  
  if (pending_invitations > 0) {
    suggestions.push('Send all pending invitations')
  }
  
  suggestions.push('Get summary of all events')
  suggestions.push('Show upcoming events this month')
  
  return suggestions.slice(0, 4)
})

const getStatusClass = (status: string) => {
  const classes = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const executeCommand = async () => {
  if (!command.value.trim() || isLoading.value) return
  
  const commandText = command.value.trim()
  isLoading.value = true
  
  // Add to history as pending
  const historyItem: CommandHistoryItem = {
    command: commandText,
    status: 'pending',
    timestamp: new Date().toISOString(),
  }
  
  commandHistory.value.unshift(historyItem)
  
  // Keep only last 5 commands
  if (commandHistory.value.length > 5) {
    commandHistory.value = commandHistory.value.slice(0, 5)
  }
  
  try {
    const response = await aiStore.executeCommand(commandText)
    
    if (response.success) {
      // Update history item as success
      const index = commandHistory.value.findIndex(item => item.command === commandText)
      if (index !== -1) {
        commandHistory.value[index].status = 'success'
      }
      
      success('Command submitted successfully')
      clearCommand()
    } else {
      // Update history item as error
      const index = commandHistory.value.findIndex(item => item.command === commandText)
      if (index !== -1) {
        commandHistory.value[index].status = 'error'
      }
      
      showError(response.message || 'Command failed')
    }
  } catch (error) {
    // Update history item as error
    const index = commandHistory.value.findIndex(item => item.command === commandText)
    if (index !== -1) {
      commandHistory.value[index].status = 'error'
    }
    
    showError('Failed to execute command')
    console.error('Command execution error:', error)
  } finally {
    isLoading.value = false
  }
}

const clearCommand = () => {
  command.value = ''
}

const setCommand = (cmd: string) => {
  command.value = cmd
}

const clearHistory = () => {
  commandHistory.value = []
}

onMounted(() => {
  // Subscribe to AI command responses
  subscribeToChannel('ai-commands', 'command.processed', (data) => {
    isLoading.value = false
    
    // Find the pending command in history and update its status
    const pendingIndex = commandHistory.value.findIndex(item => item.status === 'pending')
    if (pendingIndex !== -1) {
      if (data.status === 'success') {
        commandHistory.value[pendingIndex].status = 'success'
        success(data.message || 'Command completed successfully')
      } else if (data.status === 'error') {
        commandHistory.value[pendingIndex].status = 'error'
        showError(data.message || 'Command failed')
      } else if (data.status === 'clarification_needed') {
        commandHistory.value[pendingIndex].status = 'error'
        showError(data.message || 'Need more information')
      }
    }
  })
  
  // Load initial data
  aiStore.fetchDashboardData()
  
  // Focus the textarea when component mounts
  const textarea = document.querySelector('textarea')
  if (textarea) {
    textarea.focus()
  }
})
</script>
