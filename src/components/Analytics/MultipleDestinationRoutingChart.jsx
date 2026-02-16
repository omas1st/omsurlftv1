// src/components/Analytics/MultipleDestinationRoutingChart.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '../../services/api';
import './MultipleDestinationRoutingChart.css';

const extractSankey = (resp) => {
  if (!resp) return null;
  const root = resp.data ?? resp;
  if (root.nodes && root.links) return { nodes: root.nodes, links: root.links };
  if (root.data && root.data.nodes && root.data.links) return { nodes: root.data.nodes, links: root.data.links };
  if (root.sankey && root.sankey.nodes) return root.sankey;
  return null;
};

const MultipleDestinationRoutingChart = ({
  data: externalData,
  external = false,
  alias,
  timeRange,
  localTime,
  customDate,
  isOverall,
}) => {
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(!external);

  // Use external data if provided
  useEffect(() => {
    if (external && externalData) {
      setHasData(Boolean(externalData.nodes && externalData.nodes.length > 0));
      setLoading(false);
    }
  }, [external, externalData]);

  const fetchData = useCallback(async () => {
    if (external) return; // skip if external mode

    // If alias is missing or it's overall, we can't fetch – set no data
    if (!alias || alias === 'overall' || isOverall) {
      setHasData(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = {
        timeframe: timeRange,
        timezone: localTime,
      };
      if (timeRange === 'custom' && customDate.from && customDate.to) {
        params.from = customDate.from;
        params.to = customDate.to;
      }

      const response = await analyticsAPI.sankey(alias, params);
      const sankey = extractSankey(response);

      setHasData(Boolean(sankey && sankey.nodes && sankey.nodes.length > 0));
    } catch (error) {
      console.error('Error fetching sankey data:', error);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  }, [alias, timeRange, localTime, customDate, isOverall, external]);

  useEffect(() => {
    if (!external) fetchData();
  }, [fetchData, external]);

  if (loading) return <div className="chart-loading"><div className="spinner" /></div>;

  if (!hasData) {
    return (
      <div className="no-data-placeholder">
        <p>No destination routing data available</p>
      </div>
    );
  }

  // Placeholder that can be replaced with a proper Sankey component.
  return (
    <div className="sankey-placeholder">
      <p>Destination routing chart (to be implemented)</p>
    </div>
  );
};

export default MultipleDestinationRoutingChart;