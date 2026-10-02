import api from './api';

export const aiService = {
  /**
   * Run full multimodal/text AI analysis on a specific trade
   */
  analyzeTrade: async (tradeId) => {
    const response = await api.post(`/ai/analyze-trade/${tradeId}`);
    return response.data;
  },

  /**
   * Auto-draft structured journal observations based on trade parameters
   */
  generateNotes: async (tradeData) => {
    const response = await api.post('/ai/generate-notes', tradeData);
    return response.data;
  },

  /**
   * Conversational Trading Coach
   */
  chatWithCoach: async (messages) => {
    const response = await api.post('/ai/coach', { messages });
    return response.data;
  },

  /**
   * Retrieve AI provider status (Gemini & Groq availability)
   */
  getStatus: async () => {
    const response = await api.get('/ai/status');
    return response.data;
  },
};
