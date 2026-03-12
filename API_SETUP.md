# Axios API Setup Guide

This project includes a comprehensive Axios setup with TypeScript support, error handling, authentication, and utility functions.

## Features

- ✅ **TypeScript Support**: Full type safety with proper interfaces
- ✅ **Authentication**: Automatic token management with refresh support
- ✅ **Error Handling**: Comprehensive error handling with validation errors
- ✅ **Request/Response Interceptors**: Logging, timing, and automatic retries
- ✅ **Utility Functions**: Convenient methods for common API operations
- ✅ **File Upload/Download**: Built-in support for file operations
- ✅ **Rate Limiting**: Automatic retry for 429 responses
- ✅ **CSRF Protection**: With credentials enabled

## Setup

### Environment Variables

Add these to your `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=10000
```

### Basic Usage

```typescript
import { useApi } from '@/composables/useApi'

const { get, post, put, patch, delete, upload, isLoading, error } = useApi()

// GET request
const users = await get<User[]>('/api/users')

// POST request
const newUser = await post<User>('/api/users', { name: 'John', email: 'john@example.com' })

// File upload
const result = await upload<{ message: string }>('/api/upload', file)
```

### Advanced Usage

```typescript
import { api, apiUtils, type RequestConfig } from '@/utils/api'

// Skip authentication for public endpoints
const publicData = await apiUtils.get('/api/public-data', { skipAuth: true })

// Skip error handling for custom error processing
const response = await apiUtils.get('/api/data', { skipErrorHandler: true })

// Custom headers
const data = await apiUtils.get('/api/data', {
  headers: { 'Custom-Header': 'value' }
})
```

## API Structure

### Core Files

- `src/utils/api.ts` - Main Axios configuration and utilities
- `src/composables/useApi.ts` - Vue composable for API operations
- `src/stores/auth.ts` - Authentication store with token management

### Types

```typescript
// API Response wrapper
interface ApiResponse<T = any> {
  data: T
  message?: string
  status: number
}

// Standardized error format
interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

// Request configuration with additional options
interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean        // Skip adding auth token
  skipErrorHandler?: boolean // Skip global error handling
}
```

## Error Handling

The API setup includes comprehensive error handling:

### 401 Unauthorized
- Attempts token refresh automatically
- Redirects to login on refresh failure
- Clears invalid tokens

### 422 Validation Errors
- Extracts and formats validation errors
- Provides field-specific error messages

### 429 Rate Limiting
- Automatically retries after the specified delay
- Uses `Retry-After` header if provided

### 500+ Server Errors
- Logs server errors for debugging
- Maintains error context for user feedback

### Network Errors
- Detects CORS and connectivity issues
- Provides meaningful error messages

## Authentication

### Token Management
```typescript
// Login
const success = await authStore.login({ email, password })

// Check authentication status
if (authStore.isAuthenticated) {
  // User is logged in
}

// Logout
authStore.logout()

// Initialize auth on app start
authStore.initAuth()
```

### Token Refresh
- Automatic token refresh on 401 errors
- Seamless retry of failed requests
- Fallback to login on refresh failure

## Development Features

### Request/Response Logging
In development mode, all API requests and responses are logged with:
- HTTP method and URL
- Request data and parameters
- Response status and data
- Request duration timing

### Request Timing
Each request includes timing information:
- Start time tracking
- Duration calculation
- Performance monitoring

## Examples

### Basic Component Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useApi } from '@/composables/useApi'
import type { User } from '@/types'

const { get, isLoading, error, validationErrors } = useApi()
const users = ref<User[]>([])

const fetchUsers = async () => {
  const result = await get<User[]>('/api/users')
  if (result) {
    users.value = result
  }
}
</script>

<template>
  <div>
    <button @click="fetchUsers" :disabled="isLoading">
      {{ isLoading ? 'Loading...' : 'Fetch Users' }}
    </button>
    
    <div v-if="error" class="error">
      {{ error }}
      <div v-if="validationErrors">
        <div v-for="(errors, field) in validationErrors" :key="field">
          {{ field }}: {{ errors.join(', ') }}
        </div>
      </div>
    </div>
    
    <ul v-if="users.length">
      <li v-for="user in users" :key="user.id">{{ user.name }}</li>
    </ul>
  </div>
</template>
```

### File Upload

```typescript
const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  const result = await upload<{ url: string }>('/api/upload', file)
  if (result) {
    console.log('File uploaded:', result.url)
  }
}
```

### Custom Error Handling

```typescript
const { execute } = useApi()

const customApiCall = async () => {
  try {
    const result = await execute(() => 
      apiUtils.get('/api/data', { skipErrorHandler: true })
    )
    // Custom error handling
  } catch (error) {
    // Handle error manually
    console.error('Custom error handling:', error)
  }
}
```

## Best Practices

1. **Use the composable** for most cases - it provides loading states and error handling
2. **Type your responses** - always specify the expected response type
3. **Handle validation errors** - use the `validationErrors` for form feedback
4. **Check loading states** - disable buttons and show loading indicators
5. **Use proper error boundaries** - handle API errors gracefully in the UI

## Configuration Options

### Axios Instance Configuration
```typescript
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true, // Enable cookies for CSRF
})
```

### Custom Configuration
You can modify the Axios configuration in `src/utils/api.ts` to add:
- Custom headers
- Different timeout values
- Additional interceptors
- Request transformers

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `withCredentials` matches your backend CORS configuration
2. **Type Errors**: Make sure your API responses match the defined types
3. **Auth Issues**: Check that your token refresh endpoint is correctly configured
4. **Network Errors**: Verify your `VITE_API_BASE_URL` is correct

### Debug Mode

Enable detailed logging by setting `import.meta.env.DEV` or by temporarily setting it to `true` in the API file.

## Integration with Laravel Backend

This API setup is designed to work seamlessly with Laravel APIs:

- **Sanctum Authentication**: Compatible with Laravel Sanctum tokens
- **CSRF Protection**: Works with Laravel's CSRF tokens
- **Validation Errors**: Handles Laravel's validation error format
- **Rate Limiting**: Respects Laravel's rate limiting headers

## Next Steps

1. Configure your backend API endpoints
2. Set up authentication routes
3. Implement proper error handling in your UI
4. Add loading states and user feedback
5. Test file upload functionality
6. Configure production environment variables
