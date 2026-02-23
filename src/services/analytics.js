// src/services/analytics.js
import api from './api';
import socketService from './socket';

const analyticsService = {
  // Get overall analytics (requires auth)
  // params: { timeframe, from, to, timezone, ... }
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

  // Public URL analytics (no auth) - uses /:alias/public
  // params: { timeframe, from, to, timezone, ... }
  getPublicUrlAnalytics: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/public`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch public URL analytics'
      };
    }
  },

  // Authenticated URL analytics (protected)
  // params: { timeframe, from, to, timezone, ... }
  getUrlAnalytics: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}`, { params });
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
  // params: { timeframe, from, to, timezone, start, end, ... }
  getTimeSeries: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/timeseries`, { params });
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
  // params: { timeframe, from, to, timezone, limit, ... }
  getCountries: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/countries`, { params });
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
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/devices`, { params });
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
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/referrers`, { params });
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
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/browsers`, { params });
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
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/os`, { params });
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

  // Get hourly distribution
  getHourly: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/hourly`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch hourly data'
      };
    }
  },

  // Hourly minute breakdown (placeholder)
  getHourlyMinute: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/hourly/minute`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch hourly minute data'
      };
    }
  },

  // Get languages data
  getLanguages: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/languages`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch language data'
      };
    }
  },

  // Get recent visitors
  getRecent: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/recent`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch recent visitors'
      };
    }
  },

  // Sankey / routing data
  getSankey: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/sankey`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch sankey data'
      };
    }
  },

  // Get real-time analytics
  getRealtime: async (alias) => {
    try {
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/realtime`);
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
      const response = await api.post(`/analytics/${encodeURIComponent(alias)}/click`, data);
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
      const response = await api.post(`/analytics/${encodeURIComponent(alias)}/qrscan`, data);
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
      const response = await api.post(`/analytics/${encodeURIComponent(alias)}/textview`, data);
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

  // Export analytics data (supports timeframe/from/to/timezone & format)
  exportData: async (alias, format = 'csv', params = {}) => {
    try {
      const mergedParams = { ...params, format };
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/export`, {
        params: mergedParams,
        responseType: format === 'csv' ? 'blob' : undefined
      });

      if (format === 'csv') {
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
      }

      return {
        success: true,
        data: response.data
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

  // Heatmap
  getHeatmap: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/heatmap`, { params });
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

  // Engagement
  getEngagement: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/engagement`, { params });
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

  // Conversions
  getConversions: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/conversions`, { params });
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

  // Social shares
  getSocialShares: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/social`, { params });
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

  // Custom events
  getCustomEvents: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/events`, { params });
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
      const response = await api.post(`/analytics/${encodeURIComponent(alias)}/event`, {
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

  // A/B test results
  getABTestResults: async (alias, testId) => {
    try {
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/abtest/${encodeURIComponent(testId)}`);
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

  // Funnels
  getFunnelData: async (alias, funnelId, params = {}) => {
    try {
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/funnel/${encodeURIComponent(funnelId)}`, { params });
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

  // Cohort analysis
  getCohortAnalysis: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/cohort`, { params });
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

  // Retention
  getRetentionData: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/retention`, { params });
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

  // Revenue
  getRevenueData: async (alias, params = {}) => {
    try {
      const response = await api.get(`/analytics/${encodeURIComponent(alias)}/revenue`, { params });
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