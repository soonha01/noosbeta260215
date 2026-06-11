import { afterEach, describe, expect, it, vi } from 'vitest';

const loadEnvModule = async (env = {}) => {
  vi.resetModules();
  Object.entries(env).forEach(([key, value]) => vi.stubEnv(key, value));
  return import('./env.js');
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('env URL helpers', () => {
  it('builds backend REST and SockJS URLs from the default API base URL', async () => {
    const { API_BASE_URL, WS_BASE_URL, apiUrl, websocketUrl } = await loadEnvModule();
    const defaultBaseUrl = `http://localhost:${8080}`;

    expect(API_BASE_URL).toBe(defaultBaseUrl);
    expect(WS_BASE_URL).toBe(defaultBaseUrl);
    expect(apiUrl('/api/auth/me')).toBe(`${defaultBaseUrl}/api/auth/me`);
    expect(websocketUrl('/ws')).toBe(`${defaultBaseUrl}/ws`);
  });

  it('honors Vite overrides and trims duplicate slashes', async () => {
    const { API_BASE_URL, WS_BASE_URL, apiUrl, websocketUrl } = await loadEnvModule({
      VITE_API_BASE_URL: 'https://api.noos.test/',
      VITE_WS_BASE_URL: 'https://ws.noos.test/',
    });

    expect(API_BASE_URL).toBe('https://api.noos.test');
    expect(WS_BASE_URL).toBe('https://ws.noos.test');
    expect(apiUrl('api/chat/rooms')).toBe('https://api.noos.test/api/chat/rooms');
    expect(websocketUrl('ws')).toBe('https://ws.noos.test/ws');
  });
});
