// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Login from './LoginController';
import NoosRootPage from '../../../../pages/root/NoosRootPage';
import * as loginAuthModel from './loginAuthModel';
import loginControllerSource from './LoginController.jsx?raw';
import loginAuthHandlersSource from './useLoginAuthHandlers.js?raw';
import { API_BASE_URL } from '../../../../lib/env';

const loginRoutingSource = `${loginControllerSource}\n${loginAuthHandlersSource}`;

vi.mock('framer-motion', async () => {
  const ReactModule = await import('react');
  const createMotionComponent = (tag) =>
    ReactModule.forwardRef(({ children, initial, animate, exit, transition, whileHover, whileTap, ...props }, ref) =>
      ReactModule.createElement(tag, { ...props, ref }, children)
    );

  return {
    AnimatePresence: ({ children }) => <>{children}</>,
    motion: new Proxy(
      {},
      {
        get: (_target, tag) => createMotionComponent(tag),
      }
    ),
  };
});

vi.mock('../StateSurveyPage', () => ({
  default: ({ totalItems, headerTitle, submitLabel }) => (
    <section aria-label="survey-stage">
      <h1>{headerTitle || 'AI 상태 인식을 위한 설문을 진행합니다.'}</h1>
      <p data-testid="survey-total-items">{totalItems}</p>
      <button type="button">{submitLabel || '분석 시작'}</button>
    </section>
  ),
}));

vi.mock('../StateSurveyResultPage', () => ({
  default: ({ onConfirm }) => (
    <section aria-label="survey-result-stage">
      <h1>상태 분석 결과</h1>
      <button type="button" onClick={onConfirm}>Solar Explorer 이동</button>
    </section>
  ),
}));

vi.mock('../MuseSignalDashboard', () => ({
  default: ({ onConfirm }) => (
    <section aria-label="muse-result-stage">
      <h1>Muse S Athena + 설문 분석 완료</h1>
      <button type="button" onClick={onConfirm}>Solar Explorer 이동</button>
    </section>
  ),
}));

vi.mock('../../../brand/NoosLogo', () => ({
  default: () => <span aria-label="NOOS logo">NOOS</span>,
}));

vi.mock('../../../ui/buttons/BackButton', () => ({
  default: ({ onClick }) => (
    <button type="button" onClick={onClick}>Back</button>
  ),
}));

vi.mock('../Stepper', () => ({
  default: ({ children, onFinalStepCompleted }) => (
    <section aria-label="signup-stepper">
      {children}
      <button type="button" onClick={onFinalStepCompleted}>Complete signup</button>
    </section>
  ),
  Step: ({ children }) => <div>{children}</div>,
}));

vi.mock('./loginVisualTransitions', () => ({
  PrismStageShell: ({ children }) => <div data-testid="prism-stage">{children}</div>,
  SolarEntryWarpOverlay: () => <div>Solar entry warp</div>,
  SolarExplorerFallback: () => <div>Solar loading</div>,
  WarpTransitionScene: () => <div>우주로 떠납니다.</div>,
}));

vi.mock('../../solar/SolarExplorer', () => ({
  default: () => <section aria-label="solar-explorer">Solar Explorer</section>,
}));

vi.mock('../../../ui/effects/ClickSpark', () => ({
  default: ({ children }) => <div data-testid="click-spark">{children}</div>,
}));

vi.mock('../../../layout/EmbeddedSiteFrame', () => ({
  default: ({ title }) => <section aria-label={title}>Embedded site</section>,
}));

vi.mock('../../../layout/FadeTransitionOverlay', () => ({
  default: () => <div data-testid="fade-transition-overlay" />,
}));

vi.mock('../../../../pages/home/FirstLook', () => ({
  default: ({ onJump }) => (
    <section aria-label="first-look">
      <button type="button" onClick={onJump}>JUMP</button>
    </section>
  ),
}));

vi.mock('../../../../lib/muse', () => ({
  createMuseClient: vi.fn(),
}));

vi.mock('../../../../lib/muse/liveMuseSession', () => ({
  attachSharedLiveMuseClient: vi.fn(),
  hasActiveSharedLiveMuseSession: vi.fn(() => false),
  stopSharedLiveMuseSession: vi.fn(() => Promise.resolve()),
  updateSharedLiveMuseSession: vi.fn(),
}));

vi.mock('../../../../lib/muse/signalProcessing', () => ({
  DEFAULT_FFT_SIZE: 256,
  analyzeEegBands: vi.fn(() => ({
    sampleCount: 128,
    dominantBand: 'alpha',
    bandPowers: [
      { key: 'alpha', percent: 40 },
      { key: 'beta', percent: 25 },
    ],
  })),
}));

vi.mock('../../../../lib/eegAnalysisApi', () => ({
  createEegAnalysisPayload: vi.fn(() => ({ sampleCount: 128 })),
  startEegSession: vi.fn(() => Promise.resolve({ eegSessionId: 'eeg-1' })),
  submitEegAnalysis: vi.fn(() => Promise.resolve({
    recognitionResult: null,
    currentState: { focus_readiness: 0.5 },
  })),
}));

vi.mock('../../../../lib/noosAiApi', () => ({
  buildFallbackCurrentStateFromBandAnalysis: vi.fn(() => ({ focus_readiness: 0.5 })),
}));

vi.mock('../../../../lib/noosDeterministicInsights', () => ({
  buildStateBrief: vi.fn(() => ({ output: 'state brief' })),
}));

vi.mock('./loginAuthModel', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    redirectToOAuthProvider: vi.fn(),
    redirectToRoute: vi.fn(),
  };
});

const jsonResponse = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    status: init.status || 200,
    headers: { 'Content-Type': 'application/json' },
  });

const renderLogin = async (path = '/') => {
  window.history.pushState({}, '', path);
  const view = render(<Login />);
  await flushPromises();
  return view;
};

const flushPromises = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

const advance = async (ms) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
  await Promise.resolve();
};

describe('LoginController contract', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    jsdom.reconfigure({ url: 'http://localhost/' });
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(jsonResponse({ authenticated: false }))));
    vi.stubGlobal('alert', vi.fn());
  });

  afterEach(() => {
    cleanup();
    window.localStorage?.clear?.();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('starts on the device question for login success and preserves other query params when cleaning the URL', async () => {
    await renderLogin('/?login=success&muse=mock');

    expect(screen.getByText(/"Muse S Athena"를 보유하고 계신가요/)).toBeTruthy();

    await advance(100);

    expect(window.location.search).toBe('?muse=mock');
  });

  it('opens the login facade through NoosRootPage for login start query', async () => {
    window.history.pushState({}, '', '/?login=start');

    render(
      <MemoryRouter initialEntries={['/?login=start']}>
        <NoosRootPage />
      </MemoryRouter>
    );
    await flushPromises();

    expect(screen.getByRole('button', { name: "Let's go!" })).toBeTruthy();
  });

  it('uses the auth session endpoint to continue users and redirect admins', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve(jsonResponse({ authenticated: true, role: 'USER' }))
    );

    await renderLogin('/');

    expect(screen.getByText(/"Muse S Athena"를 보유하고 계신가요/)).toBeTruthy();

    cleanup();
    vi.clearAllMocks();
    fetch.mockImplementationOnce(() =>
      Promise.resolve(jsonResponse({ authenticated: true, role: 'ADMIN' }))
    );

    await renderLogin('/');
    await flushPromises();

    expect(loginAuthModel.redirectToRoute).toHaveBeenCalledWith('/admin');
  });

  it('shows local test bypass only on localhost and advances to the device question', async () => {
    await renderLogin('/');

    const skipButton = screen.getByRole('button', { name: '테스트로 건너뛰기' });
    fireEvent.click(skipButton);
    await advance(420);

    expect(screen.getByText(/"Muse S Athena"를 보유하고 계신가요/)).toBeTruthy();
  });

  it('hides local test bypass away from localhost and 127.0.0.1', async () => {
    jsdom.reconfigure({ url: 'https://example.test/' });

    await renderLogin('/');

    expect(window.location.hostname).toBe('example.test');
    expect(screen.queryByRole('button', { name: '테스트로 건너뛰기' })).toBeNull();
  });

  it('keeps device no path wired to the survey stage', async () => {
    await renderLogin('/?login=success');

    fireEvent.click(screen.getByRole('button', { name: 'No, 보유하지 않았어요' }));
    await advance(760);

    expect(screen.getByLabelText('survey-stage')).toBeTruthy();
    expect(screen.getByTestId('survey-total-items').textContent).toBe('19');
  });

  it('keeps device yes path gated on a live Muse connection before Solar Explorer', async () => {
    await renderLogin('/?login=success');

    fireEvent.click(screen.getByRole('button', { name: 'Yes, 보유 중입니다' }));
    await advance(520);

    expect(screen.getByText('Muse S Athena를 먼저 연결합니다.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Solar Explorer 이동' }).disabled).toBe(true);
  });

  it('keeps board and livechat quick links routed to their public app routes', async () => {
    await renderLogin('/?login=success');

    fireEvent.click(screen.getByRole('button', { name: '게시판 열기' }));
    fireEvent.click(screen.getByRole('button', { name: '채팅 열기' }));

    expect(loginAuthModel.redirectToRoute).toHaveBeenCalledWith('/board');
    expect(loginAuthModel.redirectToRoute).toHaveBeenCalledWith('/livechat');
  });

  it('routes OAuth buttons through backend authorization URLs built from apiUrl', async () => {
    await renderLogin('/');

    fireEvent.click(screen.getByRole('button', { name: 'Login with Google' }));
    fireEvent.click(screen.getByRole('button', { name: 'Login with GitHub' }));

    expect(loginAuthModel.redirectToOAuthProvider).toHaveBeenCalledWith(
      expect.any(Function),
      'google'
    );
    expect(loginAuthModel.redirectToOAuthProvider).toHaveBeenCalledWith(
      expect.any(Function),
      'github'
    );

    const [backendUrlArg, providerArg] = loginAuthModel.redirectToOAuthProvider.mock.calls[0];
    expect(providerArg).toBe('google');
    expect(backendUrlArg('/oauth2/authorization/google')).toBe(
      `${API_BASE_URL}/oauth2/authorization/google`
    );
  });

  it('dispatches auth change and moves to device question after local login success', async () => {
    const authChanged = vi.fn();
    window.addEventListener('noos-auth-changed', authChanged);
    fetch.mockImplementation((url) => {
      const requestUrl = String(url);
      if (requestUrl.endsWith('/api/auth/login')) {
        return Promise.resolve(jsonResponse({ authenticated: true, role: 'USER' }));
      }
      return Promise.resolve(jsonResponse({ authenticated: false }));
    });

    await renderLogin('/');

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'secret' },
    });
    fireEvent.submit(screen.getByRole('button', { name: "Let's go!" }).closest('form'));
    await flushPromises();

    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/auth/login`,
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          loginId: 'test@example.com',
          password: 'secret',
        }),
      })
    );
    expect(authChanged).toHaveBeenCalledTimes(1);

    await advance(500);

    expect(screen.getByText(/"Muse S Athena"를 보유하고 계신가요/)).toBeTruthy();
    window.removeEventListener('noos-auth-changed', authChanged);
  });

  it('alerts and stays on login for 401 and network errors', async () => {
    fetch.mockImplementation((url) => {
      const requestUrl = String(url);
      if (requestUrl.endsWith('/api/auth/login')) {
        return Promise.resolve(jsonResponse({ message: 'bad credentials' }, { status: 401 }));
      }
      return Promise.resolve(jsonResponse({ authenticated: false }));
    });

    await renderLogin('/');

    fireEvent.submit(screen.getByRole('button', { name: "Let's go!" }).closest('form'));
    await flushPromises();

    expect(alert).toHaveBeenCalledWith('아이디 또는 비밀번호가 올바르지 않습니다.');
    expect(screen.getByRole('button', { name: "Let's go!" })).toBeTruthy();

    cleanup();
    alert.mockClear();
    fetch.mockImplementation((url) => {
      const requestUrl = String(url);
      if (requestUrl.endsWith('/api/auth/login')) {
        return Promise.reject(new Error('network down'));
      }
      return Promise.resolve(jsonResponse({ authenticated: false }));
    });

    await renderLogin('/');
    fireEvent.submit(screen.getByRole('button', { name: "Let's go!" }).closest('form'));
    await flushPromises();

    expect(alert).toHaveBeenCalledWith('서버와 연결할 수 없습니다.');
    expect(screen.getByRole('button', { name: "Let's go!" })).toBeTruthy();
  });

  it('keeps admin and OAuth redirects wired to the backend route helpers', () => {
    expect(loginRoutingSource).toContain('resolveAuthSession(session)');
    expect(loginRoutingSource).toContain('redirectToRoute(nextAuthStep.route)');
    expect(loginRoutingSource).toContain("redirectToRoute(AUTH_ROUTES.admin)");
    expect(loginRoutingSource).toContain("redirectToOAuthProvider(backendUrl, 'google')");
    expect(loginRoutingSource).toContain("redirectToOAuthProvider(backendUrl, 'github')");
  });
});
