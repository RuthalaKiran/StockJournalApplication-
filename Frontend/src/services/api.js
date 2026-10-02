import axios from 'axios';

const resolveBaseURL = () => {
  let url = (import.meta.env.VITE_API_URL || '/api').trim();
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  if (url.startsWith('http') && !url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const api = axios.create({
  baseURL: resolveBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tradejournal_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not already on login/register page, clear storage and redirect
      if (
        !window.location.pathname.includes('/auth/login') &&
        !window.location.pathname.includes('/auth/register')
      ) {
        localStorage.removeItem('tradejournal_token');
        localStorage.removeItem('tradejournal_user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
