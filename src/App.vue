<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useWebSocket } from '@/composables/useWebSocket'
import AppLayout from '@/components/AppLayout.vue'

const authStore = useAuthStore()
const { isConnected } = useWebSocket()

onMounted(() => {
  authStore.initAuth()
})
</script>

<template>
  <AppLayout v-if="authStore.isAuthenticated" />
  <RouterView v-else />
</template>
