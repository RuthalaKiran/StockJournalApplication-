import api from './api';

export const analyticsService = {
  async getDashboardAnalytics(params = {}) {
    const res = await api.get('/analytics/dashboard', { params });
    return res.data;
  },
};
