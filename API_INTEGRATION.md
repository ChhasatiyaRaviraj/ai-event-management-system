# AI Event System - Frontend API Integration

This document describes the complete API integration between the ai-event-frontend and ai-event-system backend.

## Overview

The frontend has been fully integrated with the Laravel backend API, providing:

- ✅ **Event Management** - CRUD operations for events
- ✅ **Guest Management** - CRUD operations for guests  
- ✅ **Invitation Management** - Send, accept, decline invitations
- ✅ **Dashboard Statistics** - Real-time stats and summaries
- ✅ **Health Checks** - API connectivity monitoring
- ✅ **TypeScript Support** - Full type safety
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Authentication Ready** - Sanctum token support

## API Configuration

### Environment Variables

The frontend is configured to connect to the backend API:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_API_TIMEOUT=10000
```

### API Endpoints

The following endpoints are available:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| GET | `/events` | List events | Yes |
| POST | `/events` | Create event | Yes |
| GET | `/events/{id}` | Get event | Yes |
| PUT | `/events/{id}` | Update event | Yes |
| DELETE | `/events/{id}` | Delete event | Yes |
| GET | `/guests` | List guests | Yes |
| POST | `/guests` | Create guest | Yes |
| GET | `/guests/{id}` | Get guest | Yes |
| PUT | `/guests/{id}` | Update guest | Yes |
| DELETE | `/guests/{id}` | Delete guest | Yes |
| GET | `/invitations` | List invitations | Yes |
| POST | `/invitations` | Create invitation | Yes |
| POST | `/invitations/{id}/send` | Send invitation | Yes |
| POST | `/invitations/{id}/accept` | Accept invitation | Yes |
| POST | `/invitations/{id}/decline` | Decline invitation | Yes |
| POST | `/invitations/send-bulk` | Send bulk invitations | Yes |
| GET | `/dashboard/summary` | Dashboard summary | Yes |
| GET | `/dashboard/stats` | Dashboard statistics | Yes |

## Frontend Architecture

### Services Layer

All API interactions are handled through service classes:

- `eventService.ts` - Event management
- `guestService.ts` - Guest management  
- `invitationService.ts` - Invitation management
- `dashboardService.ts` - Dashboard data
- `healthService.ts` - Health checks

### Composables Layer

Vue composables provide reactive state management:

- `useEvents()` - Event operations with loading/error states
- `useDashboard()` - Dashboard statistics
- `useHealth()` - API health monitoring
- `useApi()` - Generic API operations

### Type Definitions

Complete TypeScript definitions for all API responses:

```typescript
interface Event {
  id: number
  name: string
  description?: string
  date: string
  capacity: number
  status: 'draft' | 'active' | 'completed'
  created_at: string
  updated_at: string
}

interface Guest {
  id: number
  name: string
  email: string
  phone?: string
  created_at: string
  updated_at: string
}

interface Invitation {
  id: number
  event_id: number
  guest_id: number
  status: 'pending' | 'accepted' | 'declined' | 'sent'
  sent_at?: string
  responded_at?: string
  created_at: string
  updated_at: string
  event?: Event
  guest?: Guest
}
```

## Usage Examples

### Using Event Service

```typescript
import { eventService } from '@/services'

// Get all events
const events = await eventService.getEvents({ 
  page: 1, 
  per_page: 10,
  status: 'active' 
})

// Create new event
const newEvent = await eventService.createEvent({
  name: 'Conference 2024',
  description: 'Annual tech conference',
  date: '2024-06-15T09:00:00Z',
  capacity: 200,
  status: 'draft'
})
```

### Using Event Composable

```vue
<script setup>
import { useEvents } from '@/composables/useEvents'

const { 
  events, 
  isLoading, 
  error, 
  fetchEvents, 
  createEvent 
} = useEvents()

// Load events on mount
onMounted(() => {
  fetchEvents()
})

// Create new event
const handleCreate = async (eventData) => {
  const success = await createEvent(eventData)
  if (success) {
    console.log('Event created successfully')
  }
}
</script>

<template>
  <div>
    <div v-if="isLoading">Loading events...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <div v-for="event in events" :key="event.id">
        {{ event.name }}
      </div>
    </div>
  </div>
</template>
```

### Error Handling

The API setup includes comprehensive error handling:

```typescript
const { execute } = useApi()

try {
  const result = await execute(() => 
    eventService.createEvent(eventData)
  )
  // Handle success
} catch (error) {
  if (error.errors) {
    // Validation errors
    Object.entries(error.errors).forEach(([field, messages]) => {
      console.log(`${field}: ${messages.join(', ')}`)
    })
  } else {
    // General error
    console.error(error.message)
  }
}
```

## Authentication

The frontend is set up for Laravel Sanctum authentication:

```typescript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Login
await authStore.login({ email, password })

// Check authentication
if (authStore.isAuthenticated) {
  // Make authenticated requests
}

// Logout
authStore.logout()
```

## Development Setup

### Prerequisites

1. Backend API running on `http://localhost:8000`
2. Frontend development server on `http://localhost:5174`

### Running the Application

1. Start the backend:
   ```bash
   cd ai-event-system
   php artisan serve
   ```

2. Start the frontend:
   ```bash
   cd ai-event-frontend
   npm run dev
   ```

3. Access the application at `http://localhost:5174`

### Testing the Integration

The EventDashboard component provides a complete test interface:

- **Health Check** - Verify API connectivity
- **Dashboard Stats** - View system statistics
- **Events List** - Browse and manage events
- **Create Event** - Add new events via form

## Features Implemented

### ✅ Core Features

- [x] Event CRUD operations
- [x] Guest CRUD operations  
- [x] Invitation management
- [x] Dashboard statistics
- [x] Health monitoring
- [x] TypeScript types
- [x] Error handling
- [x] Loading states

### ✅ Advanced Features

- [x] Axios interceptors for auth
- [x] Request/response logging
- [x] Rate limiting handling
- [x] Validation error formatting
- [x] File upload support
- [x] Pagination support
- [x] Search and filtering

### 🔄 Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] File upload for event images
- [ ] Advanced filtering and sorting
- [ ] Export functionality
- [ ] Offline support
- [ ] Caching strategies

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS allows `http://localhost:5174`
2. **401 Unauthorized**: Check authentication token in localStorage
3. **422 Validation**: Review form data matches backend validation rules
4. **Network Errors**: Verify backend API is running on correct port

### Debug Mode

Enable detailed API logging:

```typescript
// In development mode, all requests are logged automatically
// Check browser console for detailed request/response info
```

## Production Deployment

### Environment Configuration

```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
VITE_API_TIMEOUT=10000
```

### Build and Deploy

```bash
# Build for production
npm run build

# Deploy dist/ folder to your web server
```

## API Response Format

All API responses follow this standard format:

```typescript
// Success Response
{
  data: T,           // Response data
  message?: string,   // Optional message
  status: number      // HTTP status code
}

// Error Response
{
  message: string,           // Error message
  status: number,            // HTTP status code
  errors?: Record<string, string[]>  // Validation errors
}
```

This integration provides a solid foundation for building a complete event management application with modern web technologies.
