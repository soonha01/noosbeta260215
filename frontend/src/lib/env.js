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

export const AI_OBJET_URL = trimTrailingSlash(envValue('AI_OBJET_URL', '/ai-objet'));

export const EEG_ANALYSIS_ENDPOINT = envValue('EEG_ANALYSIS_ENDPOINT', '/api/eeg/results');

export const NOOS_LITERT_MODEL_URL = envValue(
  'NOOS_LITERT_MODEL_URL',
  'https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/resolve/main/gemma-4-E2B-it-web.task'
);

export const NOOS_LITERT_WASM_BASE_URL = envValue(
  'NOOS_LITERT_WASM_BASE_URL',
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@0.10.27/wasm'
);

export const NOOS_LITERT_DISABLED = envValue('NOOS_LITERT_DISABLED', 'false') === 'true';
