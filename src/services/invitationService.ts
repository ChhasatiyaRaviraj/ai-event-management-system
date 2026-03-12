import { apiUtils } from '@/utils/api'
import type { Invitation, InvitationListResponse } from '@/types'

class InvitationService {
  // Get all invitations
  async getInvitations(params?: {
    page?: number
    per_page?: number
    status?: string
    event_id?: number
    guest_id?: number
  }): Promise<InvitationListResponse> {
    const response = await apiUtils.get<InvitationListResponse>('/invitations', { params })
    return response.data.data
  }

  // Get single invitation
  async getInvitation(id: number): Promise<Invitation> {
    const response = await apiUtils.get<Invitation>(`/invitations/${id}`)
    return response.data.data
  }

  // Create new invitation
  async createInvitation(invitationData: {
    event_id: number
    guest_id: number
  }): Promise<Invitation> {
    const response = await apiUtils.post<Invitation>('/invitations', invitationData)
    return response.data.data
  }

  // Update invitation
  async updateInvitation(id: number, invitationData: {
    event_id?: number
    guest_id?: number
    status?: 'pending' | 'accepted' | 'declined' | 'sent'
  }): Promise<Invitation> {
    const response = await apiUtils.put<Invitation>(`/invitations/${id}`, invitationData)
    return response.data.data
  }

  // Delete invitation
  async deleteInvitation(id: number): Promise<void> {
    await apiUtils.delete(`/invitations/${id}`)
  }

  // Send invitation
  async sendInvitation(id: number): Promise<Invitation> {
    const response = await apiUtils.post<Invitation>(`/invitations/${id}/send`)
    return response.data.data
  }

  // Accept invitation
  async acceptInvitation(id: number): Promise<Invitation> {
    const response = await apiUtils.post<Invitation>(`/invitations/${id}/accept`)
    return response.data.data
  }

  // Decline invitation
  async declineInvitation(id: number): Promise<Invitation> {
    const response = await apiUtils.post<Invitation>(`/invitations/${id}/decline`)
    return response.data.data
  }

  // Send bulk invitations
  async sendBulkInvitations(invitationData: {
    event_id: number
    guest_ids: number[]
  }): Promise<{ sent: number; failed: number; invitations: Invitation[] }> {
    const response = await apiUtils.post('/invitations/send-bulk', invitationData)
    return response.data.data
  }

  // Get invitations by status
  async getInvitationsByStatus(status: 'pending' | 'accepted' | 'declined' | 'sent'): Promise<Invitation[]> {
    const response = await apiUtils.get<Invitation[]>('/invitations', {
      params: { status }
    })
    return response.data.data
  }

  // Get invitations for an event
  async getEventInvitations(eventId: number): Promise<Invitation[]> {
    const response = await apiUtils.get<Invitation[]>('/invitations', {
      params: { event_id: eventId }
    })
    return response.data.data
  }

  // Get invitations for a guest
  async getGuestInvitations(guestId: number): Promise<Invitation[]> {
    const response = await apiUtils.get<Invitation[]>('/invitations', {
      params: { guest_id: guestId }
    })
    return response.data.data
  }
}

export const invitationService = new InvitationService()
