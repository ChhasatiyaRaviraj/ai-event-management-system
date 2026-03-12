<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">AI Commands</h1>
      <button
        @click="showExecuteModal = true"
        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      >
        Execute Command
      </button>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b border-gray-200">
        <button
          @click="fetchCommands"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>

      <div class="p-6">
        <div v-if="eventsStore.isLoading" class="text-center py-8">
          <p class="text-gray-500">Loading commands...</p>
        </div>
        <div v-else-if="eventsStore.commands.length === 0" class="text-center py-8">
          <p class="text-gray-500">No commands found</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="command in eventsStore.commands"
            :key="command.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">{{ command.command }}</h3>
                <div class="mt-2">
                  <code class="bg-gray-100 px-2 py-1 rounded text-sm">
                    {{ JSON.stringify(command.parameters, null, 2) }}
                  </code>
                </div>
                <div v-if="command.result" class="mt-2">
                  <h4 class="text-sm font-medium text-gray-700">Result:</h4>
                  <pre class="bg-gray-100 p-2 rounded text-sm mt-1">{{ command.result }}</pre>
                </div>
                <div v-if="command.error" class="mt-2">
                  <h4 class="text-sm font-medium text-red-700">Error:</h4>
                  <p class="text-red-600 text-sm mt-1">{{ command.error }}</p>
                </div>
              </div>
              <div class="text-right">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                    getStatusClass(command.status)
                  ]"
                >
                  {{ command.status }}
                </span>
                <p class="text-xs text-gray-500 mt-2">
                  {{ formatDate(command.created_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Execute Command Modal -->
    <div
      v-if="showExecuteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Execute AI Command</h2>
        <form @submit.prevent="executeCommand">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Command
            </label>
            <input
              v-model="newCommand.command"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter command"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Parameters (JSON)
            </label>
            <textarea
              v-model="newCommand.parameters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder='{"key": "value"}'
            ></textarea>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showExecuteModal = false"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isExecuting"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {{ isExecuting ? 'Executing...' : 'Execute' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEventsStore } from '@/stores/events'
import { useNotifications } from '@/composables/useNotifications'

const eventsStore = useEventsStore()
const { success, error: showError } = useNotifications()

const showExecuteModal = ref(false)
const isExecuting = ref(false)
const newCommand = ref({
  command: '',
  parameters: '{}',
})

const getStatusClass = (status: string) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const fetchCommands = () => {
  eventsStore.fetchCommands()
}

const executeCommand = async () => {
  isExecuting.value = true
  try {
    let parameters = {}
    try {
      parameters = JSON.parse(newCommand.value.parameters)
    } catch (e) {
      showError('Invalid JSON in parameters')
      return
    }

    await eventsStore.executeCommand(newCommand.value.command, parameters)
    success('Command executed successfully')
    showExecuteModal.value = false
    newCommand.value = { command: '', parameters: '{}' }
    fetchCommands()
  } catch (err) {
    showError('Failed to execute command')
  } finally {
    isExecuting.value = false
  }
}

onMounted(() => {
  fetchCommands()
})
</script>
