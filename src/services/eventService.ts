import { apiUtils } from '@/utils/api'
import type { Event, EventListResponse } from '@/types'

class EventService {
  // Get all events
  async getEvents(params?: {
    page?: number
    per_page?: number
    status?: string
    search?: string
  }): Promise<EventListResponse> {
    const response = await apiUtils.get<EventListResponse>('/events', { params })
    return response.data.data
  }

  // Get single event
  async getEvent(id: number): Promise<Event> {
    const response = await apiUtils.get<Event>(`/events/${id}`)
    return response.data.data
  }

  // Create new event
  async createEvent(eventData: {
    name: string
    description?: string
    date: string // ISO datetime string
    capacity: number
    status?: 'draft' | 'active' | 'completed'
  }): Promise<Event> {
    const response = await apiUtils.post<Event>('/events', eventData)
    return response.data.data
  }

  // Update event
  async updateEvent(id: number, eventData: {
    name?: string
    description?: string
    date?: string
    capacity?: number
    status?: 'draft' | 'active' | 'completed'
  }): Promise<Event> {
    const response = await apiUtils.put<Event>(`/events/${id}`, eventData)
    return response.data.data
  }

  // Delete event
  async deleteEvent(id: number): Promise<void> {
    await apiUtils.delete(`/events/${id}`)
  }

  // Get upcoming events
  async getUpcomingEvents(): Promise<Event[]> {
    const response = await apiUtils.get<Event[]>('/events', {
      params: { 
        status: 'active',
        sort: 'date',
        order: 'asc'
      }
    })
    return response.data.data || response.data
  }

  // Get events by status
  async getEventsByStatus(status: 'draft' | 'active' | 'completed'): Promise<Event[]> {
    const response = await apiUtils.get<Event[]>('/events', {
      params: { status }
    })
    return response.data.data || response.data
  }
}

export const eventService = new EventService()
