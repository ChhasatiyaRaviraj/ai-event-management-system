import { ref } from 'vue'
import { useAIStore } from '@/stores/useAIStore'
import { useNotifications } from '@/composables/useNotifications'

interface AICommandOptions {
  sessionId?: string
  showNotifications?: boolean
  addToHistory?: boolean
}

interface CommandHistoryItem {
  id: string
  command: string
  response: any
  timestamp: string
  status: 'pending' | 'success' | 'error'
  duration?: number
}

export function useAICommand(options: AICommandOptions = {}) {
  const {
    sessionId = 'default',
    showNotifications = true,
    addToHistory = true
  } = options

  const aiStore = useAIStore()
  const { success, error: showError, info } = useNotifications()

  // State
  const isProcessing = ref(false)
  const commandHistory = ref<CommandHistoryItem[]>([])
  const currentCommand = ref('')

  // Execute AI command
  const executeCommand = async (command: string, customSessionId?: string) => {
    if (!command.trim()) {
      showError('Please enter a command')
      return null
    }

    isProcessing.value = true
    currentCommand.value = command

    const startTime = Date.now()
    const commandId = `cmd_${Date.now()}`

    // Add to history as pending
    if (addToHistory) {
      commandHistory.value.unshift({
        id: commandId,
        command: command.trim(),
        response: null,
        timestamp: new Date().toISOString(),
        status: 'pending'
      })
    }

    try {
      const response = await aiStore.executeCommand(
        command.trim(),
        customSessionId || sessionId
      )

      const duration = Date.now() - startTime

      // Update history item
      if (addToHistory) {
        const historyIndex = commandHistory.value.findIndex(item => item.id === commandId)
        if (historyIndex !== -1) {
          commandHistory.value[historyIndex] = {
            ...commandHistory.value[historyIndex],
            response,
            status: response.success ? 'success' : 'error',
            duration
          }
        }
      }

      // Show notifications
      if (showNotifications) {
        if (response.success) {
          success(response.message || 'Command executed successfully')
        } else {
          showError(response.message || 'Command failed')
        }
      }

      return response
    } catch (err: any) {
      const duration = Date.now() - startTime
      const errorResponse = {
        success: false,
        message: err.message || 'Command execution failed',
        error: err
      }

      // Update history item
      if (addToHistory) {
        const historyIndex = commandHistory.value.findIndex(item => item.id === commandId)
        if (historyIndex !== -1) {
          commandHistory.value[historyIndex] = {
            ...commandHistory.value[historyIndex],
            response: errorResponse,
            status: 'error',
            duration
          }
        }
      }

      if (showNotifications) {
        showError(errorResponse.message)
      }

      throw err
    } finally {
      isProcessing.value = false
      currentCommand.value = ''
    }
  }

  // Clear command history
  const clearHistory = () => {
    commandHistory.value = []
  }

  // Get command from history
  const getFromHistory = (command: string) => {
    currentCommand.value = command
  }

  // Get recent commands
  const getRecentCommands = (limit = 5) => {
    return commandHistory.value
      .filter(item => item.status !== 'pending')
      .slice(0, limit)
      .map(item => item.command)
  }

  // Get command statistics
  const getStats = () => {
    const total = commandHistory.value.length
    const successful = commandHistory.value.filter(item => item.status === 'success').length
    const failed = commandHistory.value.filter(item => item.status === 'error').length
    const pending = commandHistory.value.filter(item => item.status === 'pending').length

    const averageDuration = commandHistory.value
      .filter(item => item.duration)
      .reduce((sum, item) => sum + (item.duration || 0), 0) / 
      commandHistory.value.filter(item => item.duration).length || 0

    return {
      total,
      successful,
      failed,
      pending,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      averageDuration
    }
  }

  // Command suggestions based on context
  const getSuggestions = () => {
    const suggestions = []

    // Basic suggestions
    suggestions.push('Create event "Tech Summit" on July 20th for 50 guests')
    suggestions.push('Add guest John Doe with email john@example.com')
    suggestions.push('Send all pending invitations')
    suggestions.push('Get summary of all events')

    // Contextual suggestions based on recent commands
    const recentCommands = getRecentCommands(3)
    if (recentCommands.length > 0) {
      const lastCommand = recentCommands[0]
      
      if (lastCommand.includes('event')) {
        suggestions.push('Update event capacity to 100')
        suggestions.push('Show upcoming events')
      }
      
      if (lastCommand.includes('guest')) {
        suggestions.push('List all guests')
        suggestions.push('Create invitation for John Doe')
      }
      
      if (lastCommand.includes('invitation')) {
        suggestions.push('Check invitation status')
        suggestions.push('Send pending invitations')
      }
    }

    return suggestions.slice(0, 6)
  }

  // Validate command before sending
  const validateCommand = (command: string) => {
    if (!command.trim()) {
      return { valid: false, error: 'Command cannot be empty' }
    }

    if (command.length < 5) {
      return { valid: false, error: 'Command must be at least 5 characters' }
    }

    if (command.length > 500) {
      return { valid: false, error: 'Command must be less than 500 characters' }
    }

    return { valid: true }
  }

  return {
    // State
    isProcessing,
    currentCommand,
    commandHistory,
    
    // Methods
    executeCommand,
    clearHistory,
    getFromHistory,
    getRecentCommands,
    getStats,
    getSuggestions,
    validateCommand
  }
}
