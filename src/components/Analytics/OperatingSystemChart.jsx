// src/components/Analytics/OperatingSystemChart.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '../../services/api';
import './OperatingSystemChart.css';

const OS_CATEGORIES = ['Windows', 'macOS', 'Linux', 'ChromeOS', 'iOS', 'Android', 'iPadOS', 'Other'];

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

    const chartData = OS_CATEGORIES.map((cat) => ({ name: cat, visitors: osCounts[cat] || 0 })).filter((d) => d.visitors > 0);
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
        <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={100} />
          <Tooltip />
          <Legend />
          <Bar dataKey="visitors" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OperatingSystemChart;