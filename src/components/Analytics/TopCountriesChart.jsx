// src/components/Analytics/TopCountriesChart.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ReactCountryFlag from 'react-country-flag';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { analyticsAPI } from '../../services/api';
import './TopCountriesChart.css';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
  '#8884D8', '#82CA9D', '#A4DE6C', '#D0ED57',
  '#FFC658', '#FF7C43',
];

const safeNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

const TopCountriesChart = ({
  data: externalData,
  external = false,
  alias,
  timeRange,
  localTime,
  customDate,
  isOverall,
}) => {
  // Set default view to 'map' instead of 'chart'
  const [viewMode, setViewMode] = useState('map');
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(!external);
  const [noData, setNoData] = useState(false);
  const [topCountry, setTopCountry] = useState(null);

  const processData = useCallback((raw) => {
    if (!raw || raw.length === 0) {
      setNoData(true);
      setCountries([]);
      setTopCountry(null);
      return;
    }

    const processed = raw.map((c) => ({
      country: c.country || c.name || c.label || 'Unknown',
      countryCode: c.countryCode || c.code || (c.iso2 || null),
      visitors: safeNum(c.visitors ?? c.count ?? c.value ?? 0),
    }));

    const total = processed.reduce((sum, c) => sum + c.visitors, 0);
    processed.forEach((c) => {
      c.percentage = total > 0 ? (c.visitors / total) * 100 : 0;
    });

    processed.sort((a, b) => b.visitors - a.visitors);
    setCountries(processed.slice(0, 10));
    setTopCountry(processed[0] || null);
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
      const params = {
        timeframe: timeRange,
        timezone: localTime,
        limit: 10,
      };
      if (timeRange === 'custom' && customDate.from && customDate.to) {
        params.from = customDate.from;
        params.to = customDate.to;
      }

      let response;
      if (isOverall) {
        response = await analyticsAPI.overall(params);
        processData(response.data?.data?.countries || []);
      } else {
        response = await analyticsAPI.countries(alias, params);
        processData(response.data?.data || []);
      }
    } catch (error) {
      console.error('Error fetching countries data:', error);
      setNoData(true);
    } finally {
      setLoading(false);
    }
  }, [alias, timeRange, localTime, customDate, isOverall, external, processData]);

  useEffect(() => {
    if (!external) fetchData();
  }, [fetchData, external]);

  const renderChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={countries}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" />
        <YAxis type="category" dataKey="country" width={160} />
        <Tooltip
          formatter={(value) => [value, 'Visitors']}
          labelFormatter={(label) => label}
        />
        <Bar dataKey="visitors" name="Visitors">
          {countries.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const renderTable = () => (
    <div className="countries-table">
      <table>
        <thead>
          <tr>
            <th>Country</th>
            <th>Visitors</th>
            <th>Percentage</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {countries.map((c, idx) => (
            <tr key={c.countryCode || `${c.country}-${idx}`}>
              <td className="country-cell">
                {c.countryCode && (
                  <ReactCountryFlag
                    countryCode={c.countryCode}
                    svg
                    style={{ width: '20px', height: '15px', marginRight: '8px' }}
                  />
                )}
                <span>{c.country}</span>
              </td>
              <td>{c.visitors.toLocaleString()}</td>
              <td>{c.percentage.toFixed(1)}%</td>
              <td>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${c.percentage}%` }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderMap = () => (
    <div className="geo-map-container">
      <ComposableMap projectionConfig={{ scale: 147 }} style={{ width: '100%', height: 400 }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#EAEAEC"
                stroke="#D6D6DA"
                style={{
                  default: { outline: 'none' },
                  hover: { fill: '#F53', outline: 'none' },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>
        {countries.map((c) => (
          <Marker key={c.countryCode || c.country} coordinates={[0, 0]}>
            <circle r={Math.max(3, Math.sqrt(c.visitors) / 5)} fill="#F00" stroke="#FFF" strokeWidth={1} />
          </Marker>
        ))}
      </ComposableMap>
      <p className="map-note">Click on a country to zoom (simulated)</p>
    </div>
  );

  if (loading) return <div className="chart-loading"><div className="spinner" /></div>;
  if (noData || countries.length === 0) {
    return (
      <div className="no-data-placeholder">
        <p>No countries data available</p>
      </div>
    );
  }

  return (
    <div className="top-countries-chart">
      <div className="view-mode-toggle">
        <button
          className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
          onClick={() => setViewMode('map')}
        >
          Map
        </button>
        <button
          className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
          onClick={() => setViewMode('table')}
        >
          Table
        </button>
        <button
          className={`toggle-btn ${viewMode === 'chart' ? 'active' : ''}`}
          onClick={() => setViewMode('chart')}
        >
          Chart
        </button>
      </div>

      <div className="chart-content">
        {viewMode === 'map' && renderMap()}
        {viewMode === 'table' && renderTable()}
        {viewMode === 'chart' && renderChart()}
      </div>

      {topCountry && (
        <div className="top-country-summary">
          <div className="summary-flag">
            {topCountry.countryCode && (
              <ReactCountryFlag countryCode={topCountry.countryCode} svg style={{ width: '30px', height: '20px' }} />
            )}
          </div>
          <div className="summary-details">
            <span className="country-name">{topCountry.country}</span>
            <span className="visitor-count">{topCountry.visitors.toLocaleString()} visitors</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopCountriesChart;