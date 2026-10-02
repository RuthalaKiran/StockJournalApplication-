import axios from 'axios';

const resolveBaseURL = () => {
  let url = (import.meta.env.VITE_API_URL || '').trim();

  // If empty or explicitly '/api', use relative path or fallback to Render backend
  if (!url || url === '/api') {
    if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
      return 'https://tradejournal-backend-sbqp.onrender.com/api';
    }
    return '/api';
  }

  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  // Handle Render service slug or hostname (e.g. 'tradejournal-backend-sbqp' or 'tradejournal-backend-sbqp.onrender.com')
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (!url.includes('.')) {
      url = `https://${url}.onrender.com`;
    } else {
      url = `https://${url}`;
    }
  }

  // Ensure trailing /api
  if (!url.endsWith('/api')) {
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
