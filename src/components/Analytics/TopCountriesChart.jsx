// src/components/Analytics/TopCountriesChart.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ReactCountryFlag from 'react-country-flag';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { analyticsAPI } from '../../services/api';
import { getCountryName } from '../../utils/countryUtils';
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
  const [viewMode, setViewMode] = useState('map');
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(!external);
  const [noData, setNoData] = useState(false);
  const [topCountry, setTopCountry] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null); // { country, x, y }

  const processData = useCallback((raw) => {
    if (!raw || raw.length === 0) {
      setNoData(true);
      setCountries([]);
      setTopCountry(null);
      return;
    }

    const processed = raw.map((c) => {
      const countryCode = c.countryCode || c.code || c.iso2 || null;
      const rawName = c.country || c.name || c.label || '';

      // Use enhanced utility to get proper country name
      const countryName = getCountryName(countryCode, rawName);

      return {
        country: countryName,
        countryCode: countryCode,
        visitors: safeNum(c.visitors ?? c.count ?? c.value ?? 0),
      };
    });

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

  // --- Pie Chart (replaces old BarChart) ---
  const renderChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={countries}
          dataKey="visitors"
          nameKey="country"
          cx="50%"
          cy="50%"
          outerRadius={120}
          fill="#8884d8"
          label={({ country, percent }) => `${country} ${(percent * 100).toFixed(0)}%`}
        >
          {countries.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [value, 'Visitors']} />
        <Legend />
      </PieChart>
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

  // --- Map with clickable geographies and popup ---
  const handleGeographyClick = (geo, event) => {
    // Try to get country name from geography properties
    const geoName = geo.properties?.name || geo.properties?.NAME || '';
    if (!geoName) return;

    // Find matching country in our data (case‑insensitive)
    const matchedCountry = countries.find(
      (c) => c.country.toLowerCase() === geoName.toLowerCase()
    );
    if (!matchedCountry) return;

    // Show popup near click position
    setPopupInfo({
      country: matchedCountry,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const renderMap = () => (
    <div className="geo-map-container" onClick={() => setPopupInfo(null)}>
      <ComposableMap projectionConfig={{ scale: 147 }} style={{ width: '100%', height: 400 }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#EAEAEC"
                stroke="#D6D6DA"
                onClick={(event) => {
                  event.stopPropagation(); // Prevent container click
                  handleGeographyClick(geo, event);
                }}
                style={{
                  default: { outline: 'none' },
                  hover: { fill: '#F53', outline: 'none' },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>

      {/* Popup for clicked country */}
      {popupInfo && (
        <div
          className="map-popup"
          style={{
            position: 'fixed',
            left: popupInfo.x + 10,
            top: popupInfo.y - 40,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          <strong>{popupInfo.country.country}</strong>
          <div>Visitors: {popupInfo.country.visitors.toLocaleString()}</div>
          <div>Percentage: {popupInfo.country.percentage.toFixed(1)}%</div>
        </div>
      )}
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