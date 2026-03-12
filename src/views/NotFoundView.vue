<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-gray-900">404</h1>
        <h2 class="mt-4 text-3xl font-bold text-gray-900">Page not found</h2>
        <p class="mt-2 text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
      </div>
      
      <div class="space-y-4">
        <router-link
          to="/"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go back home
        </router-link>
        
        <button
          @click="$router.go(-1)"
          class="block w-full text-center text-blue-600 hover:text-blue-500"
        >
          Go back to previous page
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No script needed for this simple 404 page
</script>
