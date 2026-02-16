// src/services/api.js - UPDATED with missing methods for ManageURLs
import axios from 'axios';

// Log the environment variable for debugging
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

// Helper to get base URL
const getBaseURL = () => {
  const url = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  console.log('Using base URL:', url);
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
const initialToken = localStorage.getItem('token');
if (initialToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Avoid crashing if method is undefined in rare cases
    const method = (config.method || '').toUpperCase();
    console.log(`API Request: ${method} ${config.baseURL}${config.url}`, config.data);

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      response: error.response?.data,
    });

    const originalRequest = error.config;

    // Handle 429 Too Many Requests
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 5;
      const waitTime = parseInt(retryAfter) * 1000;
      
      // Store original request for retry
      if (!originalRequest._retryCount) {
        originalRequest._retryCount = 0;
      }
      
      if (originalRequest._retryCount < 3) {
        originalRequest._retryCount++;
        
        // Log retry attempt
        console.log(`Rate limited. Retry ${originalRequest._retryCount}/3 after ${waitTime}ms`);
        
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return api(originalRequest);
      } else {
        console.warn('Maximum retry attempts (3) reached for rate limit');
        error.message = 'Too many requests. Please try again later.';
        return Promise.reject(error);
      }
    }

    // Handle token refresh (only try once)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Prevent infinite loops: if no refresh token, do not attempt refresh
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // No refresh token – just reject
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const refreshUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/refresh`;

        const response = await axios.post(refreshUrl, { refreshToken });

        const { token, refreshToken: newRefreshToken } = response.data;

        if (token) {
          localStorage.setItem('token', token);
          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
          } else {
            originalRequest.headers = { Authorization: `Bearer ${token}` };
          }

          return api(originalRequest);
        }
      } catch (refreshError) {
        // clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        delete api.defaults.headers.common['Authorization'];

        // best-effort redirect (client-side app should handle this gracefully)
        try {
          window.location.href = '/login';
        } catch (e) {
          /* ignore if window not available */
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
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

// Contact endpoints - NEW SECTION
export const contactAPI = {
  sendMessage: (data) => api.post('/contact/send', data),
  getMessages: (params) => api.get('/contact/messages', { params }),
  deleteMessage: (id) => api.delete(`/contact/messages/${id}`),
};

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin/login', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: () => api.post('/auth/resend-verification'),
  profile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  deleteAccount: () => api.delete('/auth/account'),
  verifyToken: () => api.get('/auth/verify'),
  refreshToken: () => api.post('/auth/refresh'),
};

// URL endpoints - CORRECTED function names
export const urlAPI = {
  shorten: (data) => api.post('/urls/shorten', data),
  bulkShorten: (data) => api.post('/urls/bulk', data),
  getAll: (params) => api.get('/urls', { params }),
  getUrls: (params) => api.get('/urls', { params }), // alias for getAll
  getUrl: (alias) => api.get(`/urls/${alias}`),
  getOne: (alias) => api.get(`/urls/${alias}`), // Keep both for compatibility
  getByUser: (userId, params) => api.get(`/urls/user/${userId}`, { params }),
  update: (id, data) => api.put(`/urls/${id}`, data),
  delete: (id) => api.delete(`/urls/${id}`),
  deleteUrl: (id) => api.delete(`/urls/${id}`), // alias for delete
  toggleActive: (id, data) => api.patch(`/urls/${id}/active`, data),
  verifyPassword: (alias, data) => api.post(`/urls/${alias}/verify-password`, data),
  checkAlias: (alias) => api.get(`/urls/check-alias/${alias}`),
  getStats: (alias) => api.get(`/urls/${alias}/stats`),
  exportData: (params) => api.get('/urls/export', { params, responseType: 'blob' }),
  redirect: (alias) => api.get(`/urls/redirect/${alias}`),
  evaluateRules: (alias, data) => api.post(`/urls/${alias}/evaluate-rules`, data),
};

// QR endpoints - UPDATED with aliases and toggleActive
export const qrAPI = {
  generate: (data) => api.post('/qr/generate', data),
  getAll: (params) => api.get('/qr', { params }),
  getQRCodes: (params) => api.get('/qr', { params }), // alias for getAll
  getOne: (id) => api.get(`/qr/${id}`),
  update: (id, data) => api.put(`/qr/${id}`, data),
  delete: (id) => api.delete(`/qr/${id}`),
  deleteQR: (id) => api.delete(`/qr/${id}`), // alias for delete
  download: (id) => api.get(`/qr/${id}/download`, { responseType: 'blob' }),
  customize: (id, data) => api.post(`/qr/${id}/customize`, data),
  toggleActive: (id, data) => api.patch(`/qr/${id}/toggle`, data), // matches route
  toggleQRActive: (id, data) => api.patch(`/qr/${id}/toggle`, data), // alias
};

// Text endpoints - UPDATED with aliases and toggleActive
export const textAPI = {
  create: (data) => api.post('/text', data),
  getAll: (params) => api.get('/text', { params }),
  getTextPages: (params) => api.get('/text', { params }), // alias for getAll
  getOne: (alias) => api.get(`/text/${alias}`),
  update: (id, data) => api.put(`/text/${id}`, data),
  delete: (id) => api.delete(`/text/${id}`),
  deleteTextPage: (id) => api.delete(`/text/${id}`), // alias for delete
  addReply: (id, data) => api.post(`/text/${id}/replies`, data),
  getReplies: (id, params) => api.get(`/text/${id}/replies`, { params }),
  deleteReply: (id, replyId) => api.delete(`/text/${id}/replies/${replyId}`),
  toggleReply: (id, data) => api.patch(`/text/${id}/reply-toggle`, data),
  customize: (id, data) => api.post(`/text/${id}/customize`, data),
  toggleActive: (id, data) => api.patch(`/text/${id}/active`, data), // you need to add this route on backend
};

// Analytics endpoints
export const analyticsAPI = {
  overall: (params) => api.get('/analytics/overall', { params }),
  getOverall: (params) => api.get('/analytics/overall', { params }),
  url: (alias, params) => api.get(`/analytics/${alias}`, { params }),
  urlPublic: (alias) => api.get(`/analytics/${alias}/public`),
  timeseries: (alias, params) => api.get(`/analytics/${alias}/timeseries`, { params }),
  countries: (alias, params) => api.get(`/analytics/${alias}/countries`, { params }),
  devices: (alias, params) => api.get(`/analytics/${alias}/devices`, { params }),
  referrers: (alias, params) => api.get(`/analytics/${alias}/referrers`, { params }),
  browsers: (alias, params) => api.get(`/analytics/${alias}/browsers`, { params }),
  os: (alias, params) => api.get(`/analytics/${alias}/os`, { params }),
  realtime: (alias) => api.get(`/analytics/${alias}/realtime`),
  click: (alias, data) => api.post(`/analytics/${alias}/click`, data),
  qrscan: (alias, data) => api.post(`/analytics/${alias}/qrscan`, data),
  textview: (alias, data) => api.post(`/analytics/${alias}/textview`, data),
  export: (alias, params) => api.get(`/analytics/${alias}/export`, { params, responseType: 'blob' }),
  heatmap: (alias, params) => api.get(`/analytics/${alias}/heatmap`, { params }),
  engagement: (alias, params) => api.get(`/analytics/${alias}/engagement`, { params }),
  conversions: (alias, params) => api.get(`/analytics/${alias}/conversions`, { params }),
  social: (alias, params) => api.get(`/analytics/${alias}/social`, { params }),
  events: (alias, params) => api.get(`/analytics/${alias}/events`, { params }),
  event: (alias, data) => api.post(`/analytics/${alias}/event`, data),
  abtest: (alias, testId) => api.get(`/analytics/${alias}/abtest/${testId}`),
  funnel: (alias, funnelId) => api.get(`/analytics/${alias}/funnel/${funnelId}`),
  cohort: (alias, params) => api.get(`/analytics/${alias}/cohort`, { params }),
  retention: (alias, params) => api.get(`/analytics/${alias}/retention`, { params }),
  revenue: (alias, params) => api.get(`/analytics/${alias}/revenue`, { params }),
  
  // ----- NEW METHODS FOR 10-SECTION PAGE -----
  // Hourly data for 24h chart
  hourly: (alias, params) => api.get(`/analytics/${alias}/hourly`, { params }),
  // Minute‑level drill‑down for a specific hour
  hourlyMinute: (alias, params) => api.get(`/analytics/${alias}/hourly/minute`, { params }),
  // Language distribution
  languages: (alias, params) => api.get(`/analytics/${alias}/languages`, { params }),
  // Recent visitors (last 10)
  recentVisitors: (alias, params) => api.get(`/analytics/${alias}/recent`, { params }),
  // Sankey / flow network data
  sankey: (alias, params) => api.get(`/analytics/${alias}/sankey`, { params }),
  // (Optional) export report generation
  exportReport: (data) => api.post('/analytics/export', data, { responseType: 'blob' }),
};

// Coin endpoints
export const coinsAPI = {
  balance: () => api.get('/coins/balance'),
  history: (params) => api.get('/coins/history', { params }),
  earn: (data) => api.post('/coins/earn', data),
  spend: (data) => api.post('/coins/spend', data),
  transfer: (data) => api.post('/coins/transfer', data),
  rewards: () => api.get('/coins/rewards'),
  redeem: (data) => api.post('/coins/redeem', data),
  referral: () => api.get('/coins/referral'),
  generateReferral: () => api.post('/coins/referral/generate'),
  referralStats: () => api.get('/coins/referral/stats'),
  claimReferral: (data) => api.post('/coins/referral/claim', data),
  dailyTasks: () => api.get('/coins/tasks/daily'),
  completeTask: (data) => api.post('/coins/tasks/complete', data),
  achievements: () => api.get('/coins/achievements'),
  claimAchievement: (data) => api.post('/coins/achievements/claim', data),
  premiumPlans: () => api.get('/coins/premium/plans'),
  subscribePremium: (data) => api.post('/coins/premium/subscribe', data),
  currentSubscription: () => api.get('/coins/premium/subscription'),
  cancelSubscription: () => api.post('/coins/premium/cancel'),
  packages: () => api.get('/coins/packages'),
  purchase: (data) => api.post('/coins/purchase', data),
  verifyPayment: (data) => api.post('/coins/verify-payment', data),
  transaction: (id) => api.get(`/coins/transaction/${id}`),
  leaderboard: (params) => api.get('/coins/leaderboard', { params }),
  value: () => api.get('/coins/value'),
};

// Admin endpoints
export const adminAPI = {
  // User management
  users: (params) => api.get('/admin/users', { params }),
  user: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  restrictUser: (id, data) => api.post(`/admin/users/${id}/restrict`, data),
  unrestrictUser: (id) => api.post(`/admin/users/${id}/unrestrict`),

  // URL management
  allUrls: (params) => api.get('/admin/urls', { params }),
  url: (id) => api.get(`/admin/urls/${id}`),
  restrictUrl: (id, data) => api.post(`/admin/urls/${id}/restrict`, data),
  unrestrictUrl: (id) => api.post(`/admin/urls/${id}/unrestrict`),

  // Contact messages management - NEW
  contactMessages: (params) => api.get('/admin/contact-messages', { params }),
  contactMessage: (id) => api.get(`/admin/contact-messages/${id}`),
  deleteContactMessage: (id) => api.delete(`/admin/contact-messages/${id}`),
  replyToContact: (id, data) => api.post(`/admin/contact-messages/${id}/reply`, data),

  // Analytics
  adminStats: () => api.get('/admin/stats'),
  systemHealth: () => api.get('/admin/health'),
  serverInfo: () => api.get('/admin/server-info'),

  // Settings
  settings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),

  // Logs
  logs: (params) => api.get('/admin/logs', { params }),
  clearLogs: () => api.delete('/admin/logs'),

  // Backup
  backup: () => api.get('/admin/backup', { responseType: 'blob' }),
  restore: (data) => api.post('/admin/restore', data),

  // Email
  sendEmail: (data) => api.post('/admin/email', data),
  emailTemplates: () => api.get('/admin/email-templates'),
  updateEmailTemplate: (id, data) => api.put(`/admin/email-templates/${id}`, data),

  // Reports
  generateReport: (data) => api.post('/admin/reports', data),
  reports: (params) => api.get('/admin/reports', { params }),
  report: (id) => api.get(`/admin/reports/${id}`),

  // System
  clearCache: () => api.post('/admin/clear-cache'),
  maintenanceMode: (data) => api.post('/admin/maintenance', data),
  updateSystem: () => api.post('/admin/update-system'),
};

// Cloudinary endpoints
export const cloudinaryAPI = {
  signature: (data) => api.post('/cloudinary/signature', data),
  upload: (data) => api.post('/cloudinary/upload', data),
  delete: (data) => api.post('/cloudinary/delete', data),
};

// Socket endpoints
export const socketAPI = {
  connect: () => api.post('/socket/connect'),
  disconnect: () => api.post('/socket/disconnect'),
  status: () => api.get('/socket/status'),
};

// Export the axios instance
export { api };

// Create a simple default export
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