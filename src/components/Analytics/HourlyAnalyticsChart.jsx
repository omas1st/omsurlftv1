// src/components/Analytics/HourlyAnalyticsChart.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '../../services/api';
import './HourlyAnalyticsChart.css';

const HourlyAnalyticsChart = ({
  data: externalData,
  external = false,
  alias,
  timeRange,
  localTime,
  customDate,
  isOverall,
}) => {
  const [hourlyData, setHourlyData] = useState([]);
  const [peakHour, setPeakHour] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [minuteData, setMinuteData] = useState([]);
  const [loading, setLoading] = useState(!external);
  const [noData, setNoData] = useState(false);

  const processData = useCallback((raw) => {
    if (!raw || raw.length === 0) {
      setNoData(true);
      setHourlyData([]);
      setPeakHour(null);
      return;
    }

    // raw is an array of { hour, visitors, uniqueVisitors } for 0-23 (some may be missing)
    const hours = Array.from({ length: 24 }, (_, i) => {
      const found = raw.find((h) => h.hour === i);
      return { hour: i, visitors: found?.visitors || 0 };
    });

    setHourlyData(hours);
    const max = hours.reduce((prev, curr) => (curr.visitors > prev.visitors ? curr : prev), hours[0]);
    setPeakHour(max.hour !== undefined ? max : null);
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

      if (isOverall) {
        const resp = await analyticsAPI.overall(params);
        processData(resp.data?.data?.hourly || []);
      } else {
        const resp = await analyticsAPI.hourly(alias, params);
        processData(resp.data?.data || []);
      }
    } catch (error) {
      console.error('Error fetching hourly data:', error);
      setNoData(true);
    } finally {
      setLoading(false);
    }
  }, [alias, timeRange, localTime, customDate, isOverall, external, processData]);

  useEffect(() => {
    if (!external) fetchData();
  }, [fetchData, external]);

  const handleHourClick = async (hour) => {
    setSelectedHour(hour);
    try {
      const params = {
        hour,
        timeframe: timeRange,
        timezone: localTime,
      };
      if (timeRange === 'custom' && customDate.from && customDate.to) {
        params.from = customDate.from;
        params.to = customDate.to;
      }
      const response = await analyticsAPI.hourlyMinute(alias, params);
      const minute = response.data?.data || response.data || [];
      setMinuteData(minute);
    } catch (error) {
      console.error('Error fetching minute data:', error);
      setMinuteData([]);
    }
  };

  if (loading) return <div className="chart-loading"><div className="spinner" /></div>;
  if (noData || hourlyData.length === 0) {
    return (
      <div className="no-data-placeholder">
        <p>No hourly data available</p>
      </div>
    );
  }

  return (
    <div className="hourly-analytics-chart">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={hourlyData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          onClick={(e) => {
            if (!e) return;
            const hour = e.activeLabel ?? (e.activePayload?.[0]?.payload?.hour);
            if (hour !== undefined && hour !== null) {
              handleHourClick(Number(hour));
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip labelFormatter={(v) => `${v}:00`} />
          <Area
            type="monotone"
            dataKey="visitors"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>

      {peakHour !== null && (
        <div className="peak-hour-indicator">
          <span className="label">Peak Hour:</span>
          <span className="hour">{String(peakHour.hour).padStart(2, '0')}:00</span>
          <span className="count">{peakHour.visitors} visitors</span>
        </div>
      )}

      {selectedHour !== null && (
        <div className="minute-breakdown">
          <h4>Minute Breakdown for Hour {selectedHour}</h4>
          {minuteData.length === 0 ? (
            <p>No minute data available</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Minute</th>
                  <th>Visitors</th>
                </tr>
              </thead>
              <tbody>
                {minuteData.map((m, i) => (
                  <tr key={i}>
                    <td>{(m.minute ?? m.m ?? i).toString().padStart(2, '0')}:00</td>
                    <td>{m.visitors ?? m.count ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default HourlyAnalyticsChart;