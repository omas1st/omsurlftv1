// src/components/Analytics/BrowserUsageChart.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '../../services/api';
import './BrowserUsageChart.css';

const BROWSER_COLORS = {
  Chrome: '#34A853',
  Edge: '#0078D7',
  Firefox: '#FF7139',
  Safari: '#FFCC00',
  Opera: '#FF1B2D',
  'Samsung Internet': '#E6703E',
  Brave: '#4A4A4A',
  'Tor Browser': '#7D4698',
  'UC Browser': '#00BCD4',
  Other: '#8B4513',
};

const BROWSER_MAP = {
  Chrome: { display: 'Chrome (Google Chrome)', color: BROWSER_COLORS.Chrome },
  'Google Chrome': { display: 'Chrome (Google Chrome)', color: BROWSER_COLORS.Chrome },
  Edge: { display: 'Edge (Microsoft Edge)', color: BROWSER_COLORS.Edge },
  'Microsoft Edge': { display: 'Edge (Microsoft Edge)', color: BROWSER_COLORS.Edge },
  Firefox: { display: 'Firefox (Mozilla Firefox)', color: BROWSER_COLORS.Firefox },
  'Mozilla Firefox': { display: 'Firefox (Mozilla Firefox)', color: BROWSER_COLORS.Firefox },
  Safari: { display: 'Safari (Apple Safari)', color: BROWSER_COLORS.Safari },
  Opera: { display: 'Opera', color: BROWSER_COLORS.Opera },
  'Samsung Internet': { display: 'Samsung Internet', color: BROWSER_COLORS['Samsung Internet'] },
  Brave: { display: 'Brave', color: BROWSER_COLORS.Brave },
  'Tor Browser': { display: 'Tor Browser', color: BROWSER_COLORS['Tor Browser'] },
  'UC Browser': { display: 'UC Browser', color: BROWSER_COLORS['UC Browser'] },
};

// Map display names to colors for quick lookup
const DISPLAY_COLOR_MAP = Object.fromEntries(
  Object.values(BROWSER_MAP).map(({ display, color }) => [display, color])
);

const extractArray = (resp, keys = []) => {
  if (!resp) return [];
  const root = resp.data ?? resp;
  if (Array.isArray(root)) return root;
  for (const k of keys) {
    const candidate = root[k] ?? (root.data && root.data[k]);
    if (Array.isArray(candidate)) return candidate;
  }
  if (Array.isArray(root.browsers)) return root.browsers;
  if (Array.isArray(root.data)) return root.data;
  return [];
};

const BrowserUsageChart = ({
  alias,
  timeRange,
  localTime,
  customDate,
  isOverall,
  data: externalData,
  external = false,
}) => {
  const [data, setData] = useState([]);
  const [topBrowser, setTopBrowser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);

  // Helper to convert timeRange and customDate into start/end strings
  const getDateRange = useCallback(() => {
    const now = new Date();
    let start, end;

    switch (timeRange) {
      case 'today':
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        start = new Date(now);
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
        break;
      case 'last7days':
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      case 'last30days':
        start = new Date(now);
        start.setDate(now.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      case 'last60days':
        start = new Date(now);
        start.setDate(now.getDate() - 60);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      case 'lastYear':
        start = new Date(now);
        start.setFullYear(now.getFullYear() - 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      case 'custom':
        if (customDate.from && customDate.to) {
          start = new Date(customDate.from);
          start.setHours(0, 0, 0, 0);
          end = new Date(customDate.to);
          end.setHours(23, 59, 59, 999);
        } else {
          // fallback to all-time if custom dates are incomplete
          start = new Date(0);
          end = new Date(now);
        }
        break;
      default: // 'overall'
        start = new Date(0);
        end = new Date(now);
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }, [timeRange, customDate]);

  // Process raw browser data into chart format
  const processData = useCallback((raw) => {
    if (!raw || raw.length === 0) {
      setNoData(true);
      setData([]);
      setTopBrowser(null);
      return;
    }

    const browserCounts = {};
    raw.forEach((item) => {
      const name = item.name || item.browser || item.key || 'Other';
      const mapped = BROWSER_MAP[name] || { display: name, color: BROWSER_COLORS.Other };
      const key = mapped.display;
      browserCounts[key] = (browserCounts[key] || 0) + Number(item.visitors ?? item.count ?? 0);
    });

    const chartData = Object.entries(browserCounts).map(([name, value]) => ({
      name,
      value,
      color: DISPLAY_COLOR_MAP[name] || BROWSER_COLORS.Other,
    }));

    setData(chartData);
    if (chartData.length) {
      const top = chartData.reduce((max, b) => (b.value > max.value ? b : max), chartData[0]);
      setTopBrowser(top);
      setNoData(false);
    } else {
      setTopBrowser(null);
      setNoData(true);
    }
  }, []);

  // Handle external data
  useEffect(() => {
    if (external && externalData) {
      processData(externalData);
      setLoading(false);
    } else if (external && !externalData) {
      // Keep loading true until data arrives
      setLoading(true);
    }
  }, [external, externalData, processData]);

  // Fetch data internally when not external
  const fetchData = useCallback(async () => {
    if (external) return;

    setLoading(true);
    setNoData(false);
    try {
      const params = {
        timezone: localTime,
      };

      // Add start/end based on timeRange
      if (timeRange !== 'overall') {
        const { start, end } = getDateRange();
        params.start = start;
        params.end = end;
      }

      if (isOverall) {
        const resp = await analyticsAPI.overall(params);
        const raw = extractArray(resp, ['browsers', 'data', 'summary']);
        processData(raw);
      } else {
        const response = await analyticsAPI.browsers(alias, params);
        const raw = extractArray(response, ['browsers', 'data']);
        processData(raw);
      }
    } catch (error) {
      console.error('Error fetching browser data:', error);
      setNoData(true);
      setData([]);
      setTopBrowser(null);
    } finally {
      setLoading(false);
    }
  }, [alias, timeRange, localTime, isOverall, getDateRange, external, processData]);

  useEffect(() => {
    if (!external) {
      fetchData();
    }
  }, [fetchData, external]);

  if (loading) return <div className="chart-loading"><div className="spinner" /></div>;
  if (noData || data.length === 0) {
    return (
      <div className="no-data-placeholder">
        <p>No browser data available</p>
      </div>
    );
  }

  return (
    <div className="browser-usage-chart">
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {topBrowser && (
        <div className="top-browser-summary">
          <span className="label">Top Browser:</span>
          <span className="browser-name">{topBrowser.name}</span>
          <span className="browser-count">{topBrowser.value.toLocaleString()} visitors</span>
        </div>
      )}
    </div>
  );
};

export default BrowserUsageChart;