import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '../../services/api';
import './OperatingSystemChart.css';

const OS_CATEGORIES = ['Windows', 'macOS', 'Linux', 'ChromeOS', 'iOS', 'Android', 'iPadOS', 'Other'];

// Consistent colors for each OS category
const COLORS = {
  Windows: '#2563eb',    // primary blue
  macOS: '#9ca3af',      // gray
  Linux: '#f59e0b',      // amber
  ChromeOS: '#34d399',   // green
  iOS: '#000000',        // black
  Android: '#10b981',    // emerald
  iPadOS: '#8b5cf6',     // violet
  Other: '#6b7280'       // muted gray
};

const OperatingSystemChart = ({
  data: externalData,
  external = false,
  alias,
  timeRange,
  localTime,
  customDate,
  isOverall,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(!external);
  const [noData, setNoData] = useState(false);

  const processData = useCallback((raw) => {
    if (!raw || raw.length === 0) {
      setNoData(true);
      setData([]);
      return;
    }

    const osCounts = {};
    raw.forEach((item) => {
      const nameRaw = (item.name ?? item.os ?? '').toString().toLowerCase();
      let category = 'Other';
      if (nameRaw.includes('windows')) category = 'Windows';
      else if (nameRaw.includes('mac') || nameRaw.includes('mac os') || nameRaw.includes('macos')) category = 'macOS';
      else if (nameRaw.includes('linux')) category = 'Linux';
      else if (nameRaw.includes('chrome os') || nameRaw.includes('chromeos')) category = 'ChromeOS';
      else if (nameRaw.includes('ipad')) category = 'iPadOS';
      else if (nameRaw.includes('ios')) category = 'iOS';
      else if (nameRaw.includes('android')) category = 'Android';
      const visitors = Number(item.visitors ?? item.count ?? item.value ?? 0);
      osCounts[category] = (osCounts[category] || 0) + visitors;
    });

    const chartData = OS_CATEGORIES.map((cat) => ({ name: cat, value: osCounts[cat] || 0 })).filter((d) => d.value > 0);
    if (chartData.length === 0) {
      setNoData(true);
      setData([]);
      return;
    }
    setData(chartData);
  }, []);

  useEffect(() => {
    if (external && externalData) {
      processData(externalData);
      setLoading(false);
    }
  }, [external, externalData, processData]);

  const fetchData = useCallback(async () => {
    if (external) return;
    setLoading(true);
    setNoData(false);
    try {
      const params = { timeframe: timeRange, timezone: localTime };
      if (timeRange === 'custom' && customDate.from && customDate.to) {
        params.from = customDate.from;
        params.to = customDate.to;
      }

      let raw = [];
      if (isOverall) {
        const resp = await analyticsAPI.overall(params);
        raw = resp.data?.data?.operatingSystems || [];
      } else {
        const resp = await analyticsAPI.os(alias, params);
        raw = resp.data?.data || [];
      }
      processData(raw);
    } catch (err) {
      console.error('Error fetching OS data:', err);
      setNoData(true);
    } finally {
      setLoading(false);
    }
  }, [alias, timeRange, localTime, customDate, isOverall, external, processData]);

  useEffect(() => {
    if (!external) fetchData();
  }, [fetchData, external]);

  if (loading) return <div className="chart-loading"><div className="spinner" /></div>;
  if (noData || data.length === 0) {
    return <div className="no-data-placeholder"><p>No operating system data available</p></div>;
  }

  return (
    <div className="os-chart">
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={130}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.Other} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => value.toLocaleString()} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OperatingSystemChart;