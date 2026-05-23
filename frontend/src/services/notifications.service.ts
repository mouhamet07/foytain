import api from '@/lib/axios';
import type { Notification, PaginatedResponse } from '@/types';

export const notificationsService = {
  async findAll(params?: { page?: number; limit?: number; unreadOnly?: boolean }): Promise<PaginatedResponse<Notification> & { meta: { unreadCount: number } }> {
    const res = await api.get('/notifications', { params });
    return res.data;
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const res = await api.get('/notifications/unread-count');
    return res.data.data;
  },

  async markAsRead(id: string) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },

  async delete(id: string) {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
};
