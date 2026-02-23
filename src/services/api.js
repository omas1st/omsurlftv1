// src/services/api.js
import axios from 'axios';

// Only log in development
const isDev = process.env.NODE_ENV === 'development';

// Log the environment variable for debugging (only in dev)
if (isDev) {
  // eslint-disable-next-line no-console
  console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
}

// Helper to get base URL
const getBaseURL = () => {
  const url = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  if (isDev) {
    // eslint-disable-next-line no-console
    console.log('Using base URL:', url);
  }
  return url;
};

// Create axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to default headers if present on load
const initialToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
if (initialToken) {
  // safe-guard headers object
  api.defaults.headers = api.defaults.headers || {};
  api.defaults.headers.common = api.defaults.headers.common || {};
  api.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore localStorage failures
    }

    // Avoid crashing if method is undefined in rare cases
    const method = (config.method || '').toUpperCase();
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(`API Request: ${method} ${config.baseURL}${config.url}`, config.data);
    }

    return config;
  },
  (error) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.error('Request error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.error('API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        response: error.response?.data,
      });
    }

    const originalRequest = error.config || {};

    // Handle 429 Too Many Requests
    if (error.response?.status === 429) {
      const retryAfterHeader = error.response.headers?.['retry-after'];
      const retryAfter = retryAfterHeader || 5;
      const waitTime = parseInt(retryAfter, 10) * 1000;

      if (!originalRequest._retryCount) {
        // eslint-disable-next-line no-param-reassign
        originalRequest._retryCount = 0;
      }

      if (originalRequest._retryCount < 3) {
        // eslint-disable-next-line no-param-reassign
        originalRequest._retryCount += 1;

        if (isDev) {
          // eslint-disable-next-line no-console
          console.log(`Rate limited. Retry ${originalRequest._retryCount}/3 after ${waitTime}ms`);
        }

        // wait and retry
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return api(originalRequest);
      }

      if (isDev) {
        // eslint-disable-next-line no-console
        console.warn('Maximum retry attempts (3) reached for rate limit');
      }

      // annotate message and reject
      error.message = 'Too many requests. Please try again later.';
      return Promise.reject(error);
    }

    // Handle token refresh (only try once)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
        if (!refreshToken) {
          return Promise.reject(error);
        }

        // mark as retrying
        // eslint-disable-next-line no-param-reassign
        originalRequest._retry = true;

        const refreshUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/refresh`;

        const refreshResponse = await axios.post(refreshUrl, { refreshToken });

        const refreshedToken = refreshResponse?.data?.token;
        const newRefreshToken = refreshResponse?.data?.refreshToken;

        if (refreshedToken) {
          try {
            localStorage.setItem('token', refreshedToken);
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
          } catch (e) {
            // ignore localStorage failures
          }

          api.defaults.headers = api.defaults.headers || {};
          api.defaults.headers.common = api.defaults.headers.common || {};
          api.defaults.headers.common['Authorization'] = `Bearer ${refreshedToken}`;

          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${refreshedToken}`;
          } else {
            originalRequest.headers = { Authorization: `Bearer ${refreshedToken}` };
          }

          return api(originalRequest);
        }
      } catch (refreshError) {
        // clear tokens and redirect to login
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        } catch (e) {
          // ignore
        }
        delete api.defaults.headers?.common?.Authorization;

        try {
          // best-effort redirect (client-side app should handle this gracefully)
          // eslint-disable-next-line no-undef
          if (typeof window !== 'undefined' && window.location) {
            window.location.href = '/login';
          }
        } catch (e) {
          // ignore if window not available
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle network errors (no response)
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        isNetworkError: true,
      });
    }

    // Map some common HTTP statuses to readable messages
    switch (error.response.status) {
      case 403:
        error.message = 'Access forbidden. You do not have permission.';
        break;
      case 404:
        error.message = 'Resource not found.';
        break;
      case 429:
        error.message = 'Too many requests. Please try again later.';
        break;
      case 500:
        error.message = 'Internal server error. Please try again later.';
        break;
      case 503:
        error.message = 'Service temporarily unavailable. Please try again later.';
        break;
      default:
        error.message = error.response?.data?.message || error.message || 'An error occurred.';
    }

    return Promise.reject(error);
  }
);

// ---------- API groups ---------- //

// Contact endpoints
export const contactAPI = {
  sendMessage: (payload) => api.post('/contact/send', payload),
  getMessages: (params) => api.get('/contact/messages', { params }),
  deleteMessage: (id) => api.delete(`/contact/messages/${id}`),
};

// Auth endpoints
export const authAPI = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  adminLogin: (payload) => api.post('/auth/admin/login', payload),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: () => api.post('/auth/resend-verification'),
  profile: () => api.get('/auth/profile'),
  updateProfile: (payload) => api.put('/auth/profile', payload),
  changePassword: (payload) => api.post('/auth/change-password', payload),
  deleteAccount: () => api.delete('/auth/account'),
  verifyToken: () => api.get('/auth/verify'),
  refreshToken: () => api.post('/auth/refresh'),
};

// URL endpoints
export const urlAPI = {
  shorten: (payload) => api.post('/urls/shorten', payload),
  bulkShorten: (payload) => api.post('/urls/bulk', payload),
  getAll: (params) => api.get('/urls', { params }),
  getUrls: (params) => api.get('/urls', { params }), // alias
  getUrl: (alias) => api.get(`/urls/${encodeURIComponent(alias)}`),
  getOne: (alias) => api.get(`/urls/${encodeURIComponent(alias)}`),
  getByUser: (userId, params) => api.get(`/urls/user/${userId}`, { params }),
  update: (id, payload) => api.put(`/urls/${id}`, payload),
  delete: (id) => api.delete(`/urls/${id}`),
  deleteUrl: (id) => api.delete(`/urls/${id}`),
  toggleActive: (id, payload) => api.patch(`/urls/${id}/active`, payload),
  verifyPassword: (alias, payload) => api.post(`/urls/${encodeURIComponent(alias)}/verify-password`, payload),
  checkAlias: (alias) => api.get(`/urls/check-alias/${encodeURIComponent(alias)}`),
  getStats: (alias) => api.get(`/urls/${encodeURIComponent(alias)}/stats`),
  exportData: (params) => api.get('/urls/export', { params, responseType: 'blob' }),
  redirect: (alias) => api.get(`/urls/redirect/${encodeURIComponent(alias)}`),
  evaluateRules: (alias, payload) => api.post(`/urls/${encodeURIComponent(alias)}/evaluate-rules`, payload),
};

// QR endpoints
export const qrAPI = {
  generate: (payload) => api.post('/qr/generate', payload),
  getAll: (params) => api.get('/qr', { params }),
  getQRCodes: (params) => api.get('/qr', { params }), // alias
  getOne: (id) => api.get(`/qr/${id}`),
  update: (id, payload) => api.put(`/qr/${id}`, payload),
  delete: (id) => api.delete(`/qr/${id}`),
  download: (id) => api.get(`/qr/${id}/download`, { responseType: 'blob' }),
  customize: (id, payload) => api.post(`/qr/${id}/customize`, payload),
  toggleActive: (id, payload) => api.patch(`/qr/${id}/toggle`, payload),
};

// Text endpoints
export const textAPI = {
  create: (payload) => api.post('/text', payload),
  getAll: (params) => api.get('/text', { params }),
  getTextPages: (params) => api.get('/text', { params }), // alias
  getOne: (alias) => api.get(`/text/${encodeURIComponent(alias)}`),
  update: (id, payload) => api.put(`/text/${id}`, payload),
  delete: (id) => api.delete(`/text/${id}`),
  deleteTextPage: (id) => api.delete(`/text/${id}`),
  addReply: (id, payload) => api.post(`/text/${id}/replies`, payload),
  getReplies: (id, params) => api.get(`/text/${id}/replies`, { params }),
  deleteReply: (id, replyId) => api.delete(`/text/${id}/replies/${replyId}`),
  toggleReply: (id, payload) => api.patch(`/text/${id}/reply-toggle`, payload),
  customize: (id, payload) => api.post(`/text/${id}/customize`, payload),
  toggleActive: (id, payload) => api.patch(`/text/${id}/active`, payload),
};

// Analytics endpoints - ensure params are forwarded and aliases encoded
export const analyticsAPI = {
  overall: (params = {}) => api.get('/analytics/overall', { params }),
  getOverall: (params = {}) => api.get('/analytics/overall', { params }),
  url: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}`, { params }),
  urlPublic: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/public`, { params }),
  timeseries: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/timeseries`, { params }),
  countries: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/countries`, { params }),
  devices: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/devices`, { params }),
  referrers: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/referrers`, { params }),
  browsers: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/browsers`, { params }),
  os: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/os`, { params }),
  realtime: (alias) => api.get(`/analytics/${encodeURIComponent(alias)}/realtime`),
  click: (alias, payload) => api.post(`/analytics/${encodeURIComponent(alias)}/click`, payload),
  qrscan: (alias, payload) => api.post(`/analytics/${encodeURIComponent(alias)}/qrscan`, payload),
  textview: (alias, payload) => api.post(`/analytics/${encodeURIComponent(alias)}/textview`, payload),
  export: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/export`, { params, responseType: 'blob' }),
  heatmap: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/heatmap`, { params }),
  engagement: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/engagement`, { params }),
  conversions: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/conversions`, { params }),
  social: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/social`, { params }),
  events: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/events`, { params }),
  event: (alias, payload) => api.post(`/analytics/${encodeURIComponent(alias)}/event`, payload),
  abtest: (alias, testId) => api.get(`/analytics/${encodeURIComponent(alias)}/abtest/${encodeURIComponent(testId)}`),
  funnel: (alias, funnelId, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/funnel/${encodeURIComponent(funnelId)}`, { params }),
  cohort: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/cohort`, { params }),
  retention: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/retention`, { params }),
  revenue: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/revenue`, { params }),
  hourly: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/hourly`, { params }),
  hourlyMinute: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/hourly/minute`, { params }),
  languages: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/languages`, { params }),
  recentVisitors: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/recent`, { params }),
  sankey: (alias, params = {}) => api.get(`/analytics/${encodeURIComponent(alias)}/sankey`, { params }),
  exportReport: (payload) => api.post('/analytics/export', payload, { responseType: 'blob' }),
};

// Coins endpoints
export const coinsAPI = {
  balance: () => api.get('/coins/balance'),
  history: (params = {}) => api.get('/coins/history', { params }),
  earn: (payload) => api.post('/coins/earn', payload),
  spend: (payload) => api.post('/coins/spend', payload),
  transfer: (payload) => api.post('/coins/transfer', payload),
  rewards: () => api.get('/coins/rewards'),
  redeem: (payload) => api.post('/coins/redeem', payload),
  referral: () => api.get('/coins/referral'),
  generateReferral: () => api.post('/coins/referral/generate'),
  referralStats: () => api.get('/coins/referral/stats'),
  claimReferral: (payload) => api.post('/coins/referral/claim', payload),
  dailyTasks: () => api.get('/coins/tasks/daily'),
  completeTask: (payload) => api.post('/coins/tasks/complete', payload),
  achievements: () => api.get('/coins/achievements'),
  claimAchievement: (payload) => api.post('/coins/achievements/claim', payload),
  premiumPlans: () => api.get('/coins/premium/plans'),
  subscribePremium: (payload) => api.post('/coins/premium/subscribe', payload),
  currentSubscription: () => api.get('/coins/premium/subscription'),
  cancelSubscription: () => api.post('/coins/premium/cancel'),
  packages: () => api.get('/coins/packages'),
  purchase: (payload) => api.post('/coins/purchase', payload),
  verifyPayment: (payload) => api.post('/coins/verify-payment', payload),
  transaction: (id) => api.get(`/coins/transaction/${id}`),
  leaderboard: (params = {}) => api.get('/coins/leaderboard', { params }),
  value: () => api.get('/coins/value'),
};

// Admin endpoints
export const adminAPI = {
  users: (params = {}) => api.get('/admin/users', { params }),
  user: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, payload) => api.put(`/admin/users/${id}`, payload),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  restrictUser: (id, payload) => api.post(`/admin/users/${id}/restrict`, payload),
  unrestrictUser: (id) => api.post(`/admin/users/${id}/unrestrict`),
  allUrls: (params = {}) => api.get('/admin/urls', { params }),
  url: (id) => api.get(`/admin/urls/${id}`),
  restrictUrl: (id, payload) => api.post(`/admin/urls/${id}/restrict`, payload),
  unrestrictUrl: (id) => api.post(`/admin/urls/${id}/unrestrict`),
  contactMessages: (params = {}) => api.get('/admin/contact-messages', { params }),
  contactMessage: (id) => api.get(`/admin/contact-messages/${id}`),
  deleteContactMessage: (id) => api.delete(`/admin/contact-messages/${id}`),
  replyToContact: (id, payload) => api.post(`/admin/contact-messages/${id}/reply`, payload),
  adminStats: () => api.get('/admin/stats'),
  systemHealth: () => api.get('/admin/health'),
  serverInfo: () => api.get('/admin/server-info'),
  settings: () => api.get('/admin/settings'),
  updateSettings: (payload) => api.put('/admin/settings', payload),
  logs: (params = {}) => api.get('/admin/logs', { params }),
  clearLogs: () => api.delete('/admin/logs'),
  backup: () => api.get('/admin/backup', { responseType: 'blob' }),
  restore: (payload) => api.post('/admin/restore', payload),
  sendEmail: (payload) => api.post('/admin/email', payload),
  emailTemplates: () => api.get('/admin/email-templates'),
  updateEmailTemplate: (id, payload) => api.put(`/admin/email-templates/${id}`, payload),
  generateReport: (payload) => api.post('/admin/reports', payload),
  reports: (params = {}) => api.get('/admin/reports', { params }),
  report: (id) => api.get(`/admin/reports/${id}`),
  clearCache: () => api.post('/admin/clear-cache'),
  maintenanceMode: (payload) => api.post('/admin/maintenance', payload),
  updateSystem: () => api.post('/admin/update-system'),
};

// Cloudinary endpoints
export const cloudinaryAPI = {
  signature: (payload) => api.post('/cloudinary/signature', payload),
  upload: (payload) => api.post('/cloudinary/upload', payload),
  delete: (payload) => api.post('/cloudinary/delete', payload),
};

// Socket endpoints
export const socketAPI = {
  connect: () => api.post('/socket/connect'),
  disconnect: () => api.post('/socket/disconnect'),
  status: () => api.get('/socket/status'),
};

// Export the axios instance
export { api };

// Create a simple default export object bundling groups
const apiService = {
  api,
  auth: authAPI,
  urls: urlAPI,
  qr: qrAPI,
  text: textAPI,
  analytics: analyticsAPI,
  coins: coinsAPI,
  admin: adminAPI,
  cloudinary: cloudinaryAPI,
  socket: socketAPI,
  contact: contactAPI,
};

export default apiService;