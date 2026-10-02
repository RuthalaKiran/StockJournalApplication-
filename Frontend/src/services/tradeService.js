import api from './api';

export const tradeService = {
  async getTrades(params = {}) {
    const res = await api.get('/trades', { params });
    return res.data;
  },

  async getTradeById(id) {
    const res = await api.get(`/trades/${id}`);
    return res.data;
  },

  async createTrade(tradeData) {
    const res = await api.post('/trades', tradeData);
    return res.data;
  },

  async updateTrade(id, tradeData) {
    const res = await api.put(`/trades/${id}`, tradeData);
    return res.data;
  },

  async deleteTrade(id) {
    const res = await api.delete(`/trades/${id}`);
    return res.data;
  },

  async uploadScreenshot(file) {
    const formData = new FormData();
    formData.append('image', file);

    const res = await api.post('/uploads/trade-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
