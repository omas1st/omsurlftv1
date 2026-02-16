// src/services/analytics.js
import api from './api';
import socketService from './socket';

const analyticsService = {
  // Get overall analytics
  getOverall: async (params = {}) => {
    try {
      const response = await api.get('/analytics/overall', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch analytics'
      };
    }
  },

  // Get URL-specific analytics
  getUrlAnalytics: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${alias}`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch URL analytics'
      };
    }
  },

  // Get time series data
  getTimeSeries: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${alias}/timeseries`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch time series'
      };
    }
  },

  // Get countries data
  getCountries: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${alias}/countries`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch countries data'
      };
    }
  },

  // Get devices data
  getDevices: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${alias}/devices`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch devices data'
      };
    }
  },

  // Get referrers data
  getReferrers: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${alias}/referrers`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch referrers data'
      };
    }
  },

  // Get browsers data
  getBrowsers: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${alias}/browsers`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch browsers data'
      };
    }
  },

  // Get operating systems data
  getOS: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${alias}/os`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch OS data'
      };
    }
  },

  // Get real-time analytics
  getRealtime: async (alias) => {
    try {
      const response = await api.get(`/analytics/${alias}/realtime`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch real-time data'
      };
    }
  },

  // Track click
  trackClick: async (alias, data = {}) => {
    try {
      const response = await api.post(`/analytics/${alias}/click`, data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to track click'
      };
    }
  },

  // Track QR scan
  trackQRScan: async (alias, data = {}) => {
    try {
      const response = await api.post(`/analytics/${alias}/qrscan`, data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to track QR scan'
      };
    }
  },

  // Track text view
  trackTextView: async (alias, data = {}) => {
    try {
      const response = await api.post(`/analytics/${alias}/textview`, data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to track text view'
      };
    }
  },

  // Export analytics data
  exportData: async (alias, format = 'csv', params = {}) => {
    try {
      const response = await api.get(`/analytics/${alias}/export`, {
        params: { ...params, format },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-${alias}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return {
        success: true,
        message: 'Export successful'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to export data'
      };
    }
  },

  // Subscribe to real-time updates
  subscribeToRealtime: (alias, callback) => {
    socketService.subscribeToAnalytics(alias, callback);
  },

  // Unsubscribe from real-time updates
  unsubscribeFromRealtime: (alias, callback) => {
    socketService.unsubscribeFromAnalytics(alias, callback);
  },

  // Get heatmap data
  getHeatmap: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${alias}/heatmap`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch heatmap data'
      };
    }
  },

  // Get engagement data
  getEngagement: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${alias}/engagement`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch engagement data'
      };
    }
  },

  // Get conversion data
  getConversions: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${alias}/conversions`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch conversion data'
      };
    }
  },

  // Get social shares
  getSocialShares: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${alias}/social`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch social shares'
      };
    }
  },

  // Get custom events
  getCustomEvents: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${alias}/events`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch custom events'
      };
    }
  },

  // Track custom event
  trackEvent: async (alias, eventName, data = {}) => {
    try {
      const response = await api.post(`/analytics/${alias}/event`, {
        event: eventName,
        ...data
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to track event'
      };
    }
  },

  // Get A/B test results
  getABTestResults: async (alias, testId) => {
    try {
      const response = await api.get(`/analytics/${alias}/abtest/${testId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch A/B test results'
      };
    }
  },

  // Get funnel data
  getFunnelData: async (alias, funnelId) => {
    try {
      const response = await api.get(`/analytics/${alias}/funnel/${funnelId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch funnel data'
      };
    }
  },

  // Get cohort analysis
  getCohortAnalysis: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${alias}/cohort`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch cohort analysis'
      };
    }
  },

  // Get retention data
  getRetentionData: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${alias}/retention`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch retention data'
      };
    }
  },

  // Get revenue data (premium feature)
  getRevenueData: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${alias}/revenue`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch revenue data'
      };
    }
  }
};

export default analyticsService;