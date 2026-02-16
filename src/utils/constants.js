// src/utils/constants.js
export const TIME_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last7days',
  LAST_30_DAYS: 'last30days',
  LAST_60_DAYS: 'last60days',
  LAST_YEAR: 'lastYear',
  CUSTOM: 'custom',
  OVERALL: 'overall'
};

export const TIMEZONES = {
  UTC: 'utc',
  LOCAL: 'local',
  EST: 'est',
  PST: 'pst',
  GMT: 'gmt',
  CET: 'cet'
};

export const URL_TYPES = {
  URL: 'url',
  QR: 'qr',
  TEXT: 'text'
};

export const USER_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise'
};

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' }
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_TEXT_WORDS = 1000;
export const MAX_CUSTOM_ALIAS_LENGTH = 50;
export const DEFAULT_QR_SIZE = 256;

export const COLORS = {
  PRIMARY: '#007bff',
  SUCCESS: '#28a745',
  DANGER: '#dc3545',
  WARNING: '#ffc107',
  INFO: '#17a2b8',
  DARK: '#343a40',
  LIGHT: '#f8f9fa'
};

export const CHART_COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
  '#8884D8', '#82CA9D', '#A4DE6C', '#D0ED57',
  '#FFC658', '#FF7C43'
];