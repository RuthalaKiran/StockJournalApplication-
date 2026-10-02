import api from './api';

export const dailyPnlService = {
  async getCalendarData(month) {
    const res = await api.get('/daily-pnl/calendar', {
      params: { month },
    });
    return res.data;
  },

  async saveDailyPnL(data) {
    const res = await api.post('/daily-pnl', data);
    return res.data;
  },

  async deleteDailyPnL(date) {
    const res = await api.delete(`/daily-pnl/${date}`);
    return res.data;
  },
};
