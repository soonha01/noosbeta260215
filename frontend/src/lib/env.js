const trimTrailingSlash = (value) => String(value || '').replace(/\/$/, '');

const envValue = (key, fallback = '') => {
  const reactAppKey = `REACT_APP_${key}`;
  const viteKey = `VITE_${key}`;
  return import.meta.env[reactAppKey] || import.meta.env[viteKey] || fallback;
};

export const PUBLIC_BASE_URL = trimTrailingSlash(import.meta.env.BASE_URL || '');

export const publicAsset = (path) => {
  const normalizedPath = String(path || '').replace(/^\/+/, '');
  return `${PUBLIC_BASE_URL}/${normalizedPath}`;
};

export const API_BASE_URL = trimTrailingSlash(envValue('API_BASE_URL', 'http://localhost:8080'));

export const WS_BASE_URL = trimTrailingSlash(envValue('WS_BASE_URL', API_BASE_URL));

const normalizePath = (path = '') => `/${String(path || '').replace(/^\/+/, '')}`;

export const apiUrl = (path = '') => `${API_BASE_URL}${normalizePath(path)}`;

export const websocketUrl = (path = '/ws') => `${WS_BASE_URL}${normalizePath(path)}`;

export const AI_OBJET_URL = trimTrailingSlash(envValue('AI_OBJET_URL', '/ai-objet'));

export const EEG_ANALYSIS_ENDPOINT = envValue('EEG_ANALYSIS_ENDPOINT', '/api/eeg/results');
