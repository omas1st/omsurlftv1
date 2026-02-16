// src/components/Analytics/LanguageChart.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '../../services/api';
import './LanguageChart.css';

const LanguageChart = ({
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

    const processed = raw.map((item) => ({
      name: item.name || item.code || 'Unknown',
      visitors: Number(item.visitors ?? item.count ?? 0),
    }));

    processed.sort((a, b) => b.visitors - a.visitors);
    setData(processed.slice(0, 10));
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
        raw = resp.data?.data?.languages || [];
      } else {
        const resp = await analyticsAPI.languages(alias, params);
        raw = resp.data?.data || [];
      }
      processData(raw);
    } catch (error) {
      console.error('Error fetching language data:', error);
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
    return <div className="no-data-placeholder"><p>No language data available</p></div>;
  }

  return (
    <div className="language-chart">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="visitors" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LanguageChart;