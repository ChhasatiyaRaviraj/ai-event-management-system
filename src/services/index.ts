// Export all API services
export { eventService } from './eventService'
export { guestService } from './guestService'
export { invitationService } from './invitationService'
export { dashboardService } from './dashboardService'
export { healthService } from './healthService'

// Re-export types for convenience
export type {
  Event,
  Guest,
  Invitation,
  DashboardStats,
  DashboardSummary,
  HealthResponse,
  EventListResponse,
  GuestListResponse,
  InvitationListResponse
} from '@/types'
