// src/utils/extractAnalytics.js
const safeNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const ensureArray = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return [];
};

/**
 * Try to pull a nested property from common possible shapes.
 * Accepts either an "analyticsData" object or a full axios response (resp.data).
 */
const pick = (root, ...paths) => {
  if (!root) return undefined;
  // If axios response passed, prefer its .data
  if (root.data && typeof root.data === 'object' && !Array.isArray(root.data)) {
    root = root.data;
  }
  for (const p of paths) {
    const parts = p.split('.');
    let cur = root;
    let ok = true;
    for (const key of parts) {
      if (cur == null) {
        ok = false;
        break;
      }
      cur = cur[key];
    }
    if (ok && cur !== undefined) return cur;
  }
  return undefined;
};

const getTimeSeries = (analytics) => {
  // common places
  let arr = pick(analytics, 'timeSeries', 'timeseries', 'data.timeSeries', 'data.timeseries', 'data.data.timeSeries', 'data.data.timeseries');
  if (!arr) arr = pick(analytics, 'series', 'data.series');
  return ensureArray(arr).map((p) => {
    // normalize keys used in StatsChart
    return {
      date: p.date || p.day || p.label || p.timestamp || p._id || p.time,
      visitors: safeNum(p.visitors ?? p.totalVisitors ?? p.count ?? p.value),
      clicks: safeNum(p.clicks ?? p.totalClicks ?? p.click_count ?? 0),
      uniqueVisitors: safeNum(p.uniqueVisitors ?? p.unique ?? p.unique_visitors ?? 0),
    };
  });
};

const getCountries = (analytics) => {
  let arr = pick(analytics, 'countries', 'data.countries', 'summary.countries', 'data.summary.countries', 'data.data.countries');
  if (!arr) {
    // sometimes backend returns aggregated map or object
    const alt = pick(analytics, 'data', 'summary', 'countriesList');
    if (Array.isArray(alt)) arr = alt;
  }
  const raw = ensureArray(arr);
  // normalize
  const normalized = raw.map((c) => ({
    country: c.country ?? c.name ?? c.label ?? 'Unknown',
    countryCode: (c.countryCode ?? c.code ?? c.iso2 ?? c.alpha2 ?? null)?.toUpperCase?.() ?? null,
    visitors: safeNum(c.visitors ?? c.count ?? c.value ?? 0),
    percentage: safeNum(c.percentage ?? c.percent ?? 0),
  }));
  // if percentage missing compute
  const total = normalized.reduce((s, x) => s + x.visitors, 0) || 0;
  if (total > 0 && normalized.every((c) => !c.percentage)) {
    normalized.forEach((c) => {
      c.percentage = Number(((c.visitors / total) * 100).toFixed(1));
    });
  }
  return normalized;
};

const getBrowsers = (analytics) => {
  let arr = pick(analytics, 'browsers', 'data.browsers', 'data.data.browsers', 'summary.browsers');
  const raw = ensureArray(arr);
  return raw.map((b) => ({
    name: b.name ?? b.browser ?? 'Other',
    version: b.version ?? b.browserVersion ?? b.browser_version ?? '',
    visitors: safeNum(b.visitors ?? b.count ?? b.value ?? 0),
    percentage: safeNum(b.percentage ?? b.percent ?? 0),
  }));
};

const getOS = (analytics) => {
  let arr = pick(analytics, 'operatingSystems', 'os', 'data.operatingSystems', 'data.os', 'data.data.operatingSystems');
  const raw = ensureArray(arr);
  return raw.map((o) => ({
    name: o.name ?? o.os ?? 'Other',
    version: o.version ?? o.osVersion ?? '',
    visitors: safeNum(o.visitors ?? o.count ?? o.value ?? 0),
    percentage: safeNum(o.percentage ?? o.percent ?? 0),
  }));
};

const getLanguages = (analytics) => {
  let arr = pick(analytics, 'languages', 'data.languages', 'data.data.languages', 'summary.languages');
  const raw = ensureArray(arr);
  return raw.map((l) => ({
    code: l.code ?? l.lang ?? (typeof l === 'string' ? l : 'unknown'),
    name: l.name ?? l.label ?? l.language ?? (typeof l === 'string' ? l : 'Unknown'),
    visitors: safeNum(l.visitors ?? l.count ?? l.value ?? 0),
    percentage: safeNum(l.percentage ?? l.percent ?? 0),
  }));
};

const getHourly = (analytics) => {
  let arr = pick(analytics, 'hourly', 'data.hourly', 'data.data.hourly');
  const raw = ensureArray(arr);
  // If backend returns objects with {hour: N, visitors: X}
  if (raw.length === 0) {
    // maybe it's under summary.hourlyMap or hourlyData
    arr = pick(analytics, 'hourlyData', 'data.hourlyData', 'data.summary.hourly');
  }
  const final = ensureArray(arr);
  // normalize to 24 entries if possible
  const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, visitors: 0, uniqueVisitors: 0 }));
  final.forEach((h) => {
    const hr = Number(h.hour ?? h.h ?? (h._id && Number(h._id.split?.(':')?.[0]) ) ?? NaN);
    if (!Number.isFinite(hr) || hr < 0 || hr > 23) return;
    hours[hr].visitors += safeNum(h.visitors ?? h.count ?? h.value ?? 0);
    hours[hr].uniqueVisitors += safeNum(h.uniqueVisitors ?? h.unique ?? h.unique_visitors ?? 0);
  });
  return hours;
};

const getSankey = (analytics) => {
  return pick(analytics, 'sankey', 'data.sankey', 'data.data.sankey') ?? null;
};

const getRecent = (analytics) => {
  let arr = pick(analytics, 'recentVisitors', 'recent', 'data.recent', 'data.recentVisitors');
  return ensureArray(arr).map((r) => ({
    timestamp: r.timestamp ?? r.date ?? r.time,
    ip: r.ip ?? r.address ?? '',
    country: r.country ?? r.countryName ?? '',
    browser: r.browser ?? '',
    os: r.os ?? '',
    referrer: r.referrer ?? r.referer ?? '',
  }));
};

// Export
module.exports = {
  getTimeSeries,
  getCountries,
  getBrowsers,
  getOS,
  getLanguages,
  getHourly,
  getSankey,
  getRecent,
  safeNum,
  pick,
};
