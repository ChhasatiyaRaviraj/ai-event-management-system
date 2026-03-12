// Event Management Types
export interface Event {
  id: number
  name: string
  description?: string
  date: string // ISO datetime string
  capacity: number
  status: 'draft' | 'active' | 'completed'
  created_at: string
  updated_at: string
}

export interface Guest {
  id: number
  name: string
  email: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Invitation {
  id: number
  event_id: number
  guest_id: number
  status: 'pending' | 'accepted' | 'declined' | 'sent'
  sent_at?: string
  responded_at?: string
  created_at: string
  updated_at: string
  // Relations
  event?: Event
  guest?: Guest
}

// API Response Types for Event System
export interface EventListResponse {
  data: Event[]
  current_page?: number
  last_page?: number
  per_page?: number
  total?: number
}

export interface GuestListResponse {
  data: Guest[]
  current_page?: number
  last_page?: number
  per_page?: number
  total?: number
}

export interface InvitationListResponse {
  data: Invitation[]
  current_page?: number
  last_page?: number
  per_page?: number
  total?: number
}

// Dashboard Types
export interface DashboardStats {
  totalEvents: number
  totalGuests: number
  totalInvitations: number
  upcomingEvents: number
  recentEvents: Event[]
}

export interface DashboardSummary {
  eventsByStatus: Record<string, number>
  invitationsByStatus: Record<string, number>
  monthlyStats: {
    month: string
    events: number
    guests: number
    invitations: number
  }[]
}

// AI Command Types (for future use)
export interface AICommand {
  id: number
  command: string
  parameters: Record<string, any>
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: any
  error?: string
  user_id: number
  created_at: string
  updated_at: string
}

// Health Check Types
export interface HealthResponse {
  status: 'ok'
  timestamp: string
  version: string
  service: string
}
