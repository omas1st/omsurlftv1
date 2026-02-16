// src/utils/helpers.js
export const generateRandomSlug = (length = 8) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatDate = (date, format = 'default') => {
  const d = new Date(date);
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString();
    case 'long':
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'relative':
      const now = new Date();
      const diff = now - d;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (minutes < 1) return 'just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return d.toLocaleDateString();
    default:
      return d.toLocaleDateString();
  }
};

export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getCountryName = (countryCode) => {
  const countryNames = {
    US: 'United States',
    GB: 'United Kingdom',
    DE: 'Germany',
    FR: 'France',
    JP: 'Japan',
    CA: 'Canada',
    AU: 'Australia',
    IN: 'India',
    BR: 'Brazil',
    ZA: 'South Africa'
    // Add more country codes as needed
  };
  
  return countryNames[countryCode] || countryCode;
};

export const copyToClipboard = (text) => {
  return navigator.clipboard.writeText(text);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const generateCSVTemplate = () => {
  return `long_url,custom_slug,tags
https://example.com/page1,my-page1,marketing
https://example.com/page2,,sales
https://example.com/page3,custom-page3,"marketing,sales"
https://example.com/page4,page-four,"social,blog,news"
https://example.com/page5,,`;
};

export const parseCSV = (csvText) => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row);
  }
  
  return data;
};