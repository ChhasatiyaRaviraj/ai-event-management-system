import { apiUtils } from '@/utils/api'
import type { Guest, GuestListResponse } from '@/types'

class GuestService {
  // Get all guests
  async getGuests(params?: {
    page?: number
    per_page?: number
    search?: string
  }): Promise<GuestListResponse> {
    const response = await apiUtils.get<GuestListResponse>('/guests', { params })
    return response.data.data
  }

  // Get single guest
  async getGuest(id: number): Promise<Guest> {
    const response = await apiUtils.get<Guest>(`/guests/${id}`)
    return response.data.data
  }

  // Create new guest
  async createGuest(guestData: {
    name: string
    email: string
    phone?: string
  }): Promise<Guest> {
    const response = await apiUtils.post<Guest>('/guests', guestData)
    return response.data.data
  }

  // Update guest
  async updateGuest(id: number, guestData: {
    name?: string
    email?: string
    phone?: string
  }): Promise<Guest> {
    const response = await apiUtils.put<Guest>(`/guests/${id}`, guestData)
    return response.data.data
  }

  // Delete guest
  async deleteGuest(id: number): Promise<void> {
    await apiUtils.delete(`/guests/${id}`)
  }

  // Get guest's events
  async getGuestEvents(guestId: number): Promise<any[]> {
    const response = await apiUtils.get<any[]>(`/guests/${guestId}/events`)
    return response.data.data
  }

  // Search guests by name or email
  async searchGuests(query: string): Promise<Guest[]> {
    const response = await apiUtils.get<Guest[]>('/guests', {
      params: { search: query }
    })
    return response.data.data
  }
}

export const guestService = new GuestService()
