import { describe, expect, it, vi } from 'vitest';
import {
  AUTH_ROUTES,
  AUTH_STAGES,
  LOGIN_ALERT_MESSAGES,
  buildOAuthAuthorizationUrl,
  createLoginPayload,
  createSignupPayload,
  getInitialAuthStage,
  isLocalAuthTestHost,
  redirectToOAuthProvider,
  redirectToRoute,
  resolveAuthSession,
  resolveLoginNetworkError,
  resolveLoginResponse,
} from './loginAuthModel';
import {
  fetchCurrentAuthSession,
  submitLogin,
  submitSignup,
} from './loginAuthApi';

const backendUrl = (path) => `https://api.example.test${path}`;

const jsonResponse = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    status: init.status || 200,
    headers: { 'Content-Type': 'application/json' },
  });

describe('loginAuthModel', () => {
  it('derives the initial auth stage from the login success query', () => {
    expect(getInitialAuthStage('?login=success&muse=mock')).toBe(AUTH_STAGES.deviceQuestion);
    expect(getInitialAuthStage('?login=start')).toBe(AUTH_STAGES.login);
    expect(getInitialAuthStage('')).toBe(AUTH_STAGES.login);
  });

  it('detects only localhost and 127.0.0.1 as local test hosts', () => {
    expect(isLocalAuthTestHost('localhost')).toBe(true);
    expect(isLocalAuthTestHost('127.0.0.1')).toBe(true);
    expect(isLocalAuthTestHost('example.test')).toBe(false);
  });

  it('keeps public app route targets stable', () => {
    expect(AUTH_ROUTES.admin).toBe('/admin');
    expect(AUTH_ROUTES.board).toBe('/board');
    expect(AUTH_ROUTES.livechat).toBe('/livechat');
  });

  it('builds OAuth authorization URLs through the backend URL helper', () => {
    expect(buildOAuthAuthorizationUrl(backendUrl, 'google')).toBe(
      'https://api.example.test/oauth2/authorization/google'
    );
    expect(buildOAuthAuthorizationUrl(backendUrl, 'github')).toBe(
      'https://api.example.test/oauth2/authorization/github'
    );
  });

  it('creates login and signup request payloads with backend field names', () => {
    expect(createLoginPayload({ email: 'test@example.com', password: 'secret' })).toEqual({
      loginId: 'test@example.com',
      password: 'secret',
    });
    expect(createSignupPayload({ email: 'test@example.com', password: 'secret', name: 'NOOS User' })).toEqual({
      loginId: 'test@example.com',
      password: 'secret',
      displayName: 'NOOS User',
    });
  });

  it('resolves authenticated user and admin auth-me sessions', () => {
    expect(resolveAuthSession({ authenticated: true, role: 'USER' })).toEqual({
      action: 'stage',
      stage: AUTH_STAGES.deviceQuestion,
    });
    expect(resolveAuthSession({ authenticated: true, role: 'ADMIN' })).toEqual({
      action: 'redirect',
      route: AUTH_ROUTES.admin,
    });
    expect(resolveAuthSession({ authenticated: false })).toEqual({ action: 'none' });
    expect(resolveAuthSession(null)).toEqual({ action: 'none' });
  });

  it('resolves login success, 401, server failure, and network failure decisions', () => {
    expect(resolveLoginResponse({
      ok: true,
      status: 200,
      body: { authenticated: true, role: 'USER' },
    })).toEqual({
      action: 'authenticated',
      session: { authenticated: true, role: 'USER' },
    });
    expect(resolveLoginResponse({
      ok: true,
      status: 200,
      body: { authenticated: false },
    })).toEqual({
      action: 'invalid-credentials',
      alertMessage: LOGIN_ALERT_MESSAGES.invalidCredentials,
    });
    expect(resolveLoginResponse({ ok: false, status: 401, body: null })).toEqual({
      action: 'invalid-credentials',
      alertMessage: LOGIN_ALERT_MESSAGES.invalidCredentials,
    });
    expect(resolveLoginResponse({ ok: false, status: 500, body: null })).toEqual({
      action: 'server-error',
      alertMessage: LOGIN_ALERT_MESSAGES.serverError,
    });
    expect(resolveLoginNetworkError(new Error('network down'))).toMatchObject({
      action: 'network-error',
      alertMessage: LOGIN_ALERT_MESSAGES.networkError,
    });
  });

  it('redirects through injectable location objects', () => {
    const location = { assign: vi.fn(), href: '' };

    redirectToRoute(AUTH_ROUTES.board, location);
    redirectToOAuthProvider(backendUrl, 'google', location);

    expect(location.assign).toHaveBeenCalledWith('/board');
    expect(location.href).toBe('https://api.example.test/oauth2/authorization/google');
  });
});

describe('loginAuthApi', () => {
  it('fetches the current auth session with credentials and ignores non-ok responses', async () => {
    const fetchImpl = vi.fn((url) => {
      if (String(url).endsWith('/api/auth/me')) {
        return Promise.resolve(jsonResponse({ authenticated: true, role: 'USER' }));
      }
      return Promise.resolve(jsonResponse({}, { status: 404 }));
    });

    await expect(fetchCurrentAuthSession(backendUrl, fetchImpl)).resolves.toEqual({
      authenticated: true,
      role: 'USER',
    });
    expect(fetchImpl).toHaveBeenCalledWith('https://api.example.test/api/auth/me', {
      credentials: 'include',
    });

    fetchImpl.mockResolvedValueOnce(jsonResponse({}, { status: 500 }));
    await expect(fetchCurrentAuthSession(backendUrl, fetchImpl)).resolves.toBeNull();
  });

  it('submits login with credentials and returns success or 401 decisions', async () => {
    const payload = createLoginPayload({ email: 'test@example.com', password: 'secret' });
    const fetchImpl = vi.fn(() =>
      Promise.resolve(jsonResponse({ authenticated: true, role: 'USER' }))
    );

    await expect(submitLogin(backendUrl, payload, fetchImpl)).resolves.toEqual({
      action: 'authenticated',
      session: { authenticated: true, role: 'USER' },
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.example.test/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(payload),
      })
    );

    fetchImpl.mockResolvedValueOnce(jsonResponse({ message: 'bad credentials' }, { status: 401 }));
    await expect(submitLogin(backendUrl, payload, fetchImpl)).resolves.toEqual({
      action: 'invalid-credentials',
      alertMessage: LOGIN_ALERT_MESSAGES.invalidCredentials,
    });
  });

  it('converts login network failures into the current network alert decision', async () => {
    const payload = createLoginPayload({ email: 'test@example.com', password: 'secret' });
    const fetchImpl = vi.fn(() => Promise.reject(new Error('network down')));

    await expect(submitLogin(backendUrl, payload, fetchImpl)).resolves.toMatchObject({
      action: 'network-error',
      alertMessage: LOGIN_ALERT_MESSAGES.networkError,
    });
  });

  it('submits signup with backend field names', async () => {
    const payload = createSignupPayload({ email: 'test@example.com', password: 'secret', name: 'NOOS User' });
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse({ ok: true })));

    await submitSignup(backendUrl, payload, fetchImpl);

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.example.test/api/auth/signup',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
      })
    );
  });
});
