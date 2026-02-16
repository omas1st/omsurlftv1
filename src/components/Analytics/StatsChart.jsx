// src/components/Analytics/StatsChart.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { analyticsAPI } from '../../services/api';
import './Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatsChart = ({
  data: externalData,
  external = false,
  alias,
  timeRange,
  localTime,
  customDate,
  isOverall,
}) => {
  const [chartData, setChartData] = useState(null);
  const [stats, setStats] = useState({ visitors: 0, clicks: 0, engagement: 0, uniques: 0 });
  const [loading, setLoading] = useState(!external);
  const [noData, setNoData] = useState(false);

  const processData = useCallback(
    (series) => {
      if (!series || series.length === 0) {
        setNoData(true);
        setChartData(null);
        setStats({ visitors: 0, clicks: 0, engagement: 0, uniques: 0 });
        return;
      }

      const labels = series.map((point) => {
        const date = new Date(point.date);
        if (timeRange === 'today' || timeRange === 'yesterday')
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (timeRange === 'last7days')
          return date.toLocaleDateString([], { weekday: 'short' });
        if (timeRange === 'last30days' || timeRange === 'last60days')
          return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      });

      const visitorsData = series.map((p) => p.visitors || 0);
      const clicksData = series.map((p) => p.clicks || 0);
      const uniqueData = series.map((p) => p.uniqueVisitors || 0);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Visitors',
            data: visitorsData,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Clicks',
            data: clicksData,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      });

      const totalVisitors = visitorsData.reduce((a, b) => a + b, 0);
      const totalClicks = clicksData.reduce((a, b) => a + b, 0);
      const totalUniques = uniqueData.reduce((a, b) => a + b, 0);
      setStats({
        visitors: totalVisitors,
        clicks: totalClicks,
        engagement: totalVisitors ? ((totalClicks / totalVisitors) * 100).toFixed(1) : 0,
        uniques: totalUniques,
      });
    },
    [timeRange]
  );

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
      const params = {
        timeframe: timeRange,
        timezone: localTime,
      };
      if (timeRange === 'custom' && customDate.from && customDate.to) {
        params.from = customDate.from;
        params.to = customDate.to;
      }

      let response;
      if (isOverall) {
        response = await analyticsAPI.overall(params);
        const series = response.data?.data?.timeSeries || response.data?.timeSeries || [];
        processData(series);
      } else {
        if (!alias) {
          // Cannot fetch without alias – show no data
          setNoData(true);
          setLoading(false);
          return;
        }
        response = await analyticsAPI.timeseries(alias, params);
        const series = response.data?.data || response.data || [];
        processData(series);
      }
    } catch (error) {
      console.error('Error fetching stats chart data:', error);
      setNoData(true);
    } finally {
      setLoading(false);
    }
  }, [alias, timeRange, localTime, customDate, isOverall, external, processData]);

  useEffect(() => {
    if (!external) fetchData();
  }, [fetchData, external]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } },
    },
  };

  if (loading)
    return (
      <div className="stats-chart-loading">
        <div className="spinner" />
      </div>
    );

  return (
    <div className="stats-chart">
      <div className="chart-area">
        {noData || !chartData ? (
          <div className="no-data-placeholder">
            <p>No chart data available</p>
          </div>
        ) : (
          <Line options={options} data={chartData} height={300} />
        )}
      </div>
      <div className="chart-small-stats">
        <div className="stat-badge">
          <span className="stat-label">Visitors</span>
          <span className="stat-number">{stats.visitors}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-label">Clicks</span>
          <span className="stat-number">{stats.clicks}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-label">Engagement</span>
          <span className="stat-number">{stats.engagement}%</span>
        </div>
        <div className="stat-badge">
          <span className="stat-label">Unique</span>
          <span className="stat-number">{stats.uniques}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsChart;