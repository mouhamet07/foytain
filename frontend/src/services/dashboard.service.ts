import api from '@/lib/axios';

export const dashboardService = {
  async getUserDashboard() {
    const res = await api.get('/dashboard/user');
    return res.data.data;
  },

  async getGlobalStats() {
    const res = await api.get('/dashboard/global');
    return res.data.data;
  },

  async getTontineDashboard(tontineId: string) {
    const res = await api.get(`/dashboard/tontine/${tontineId}`);
    return res.data.data;
  },
};
