// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const root = dirname(fileURLToPath(import.meta.url));
const source = (path) => readFileSync(resolve(root, path), 'utf8');
const endpoint = (...parts) => parts.join('');

const deletedHelperEndpoints = [
  endpoint('/api/ai/', 'planet/', 'recommend'),
  endpoint('/api/ai/', 'state/', 'explain'),
  endpoint('/api/ai/', 'dashboard/', 'summary'),
  endpoint('/api/ai/', 'session/', 'coach'),
];

const affectedSources = [
  'App.jsx',
  'components/features/auth/login/LoginController.jsx',
  'components/features/solar/SolarExplorer.jsx',
  'components/features/solar/travel/SpaceTravelController.jsx',
  'components/features/solar/travel/TravelDashboardPage.jsx',
  'components/features/solar/travel/TravelPlayerPage.jsx',
  'lib/noosAiApi.js',
];

vi.mock('./components/navigation/FixedNavigation.jsx', async () => {
  const ReactModule = await import('react');
  return {
    default: () => ReactModule.createElement('nav', { 'data-testid': 'fixed-navigation' }),
  };
});

vi.mock('./components/features/auth/board/BoardPage.jsx', async () => {
  const ReactModule = await import('react');
  return {
    default: () => ReactModule.createElement('main', { 'data-testid': 'board-page-route' }),
  };
});

vi.mock('./components/features/auth/livechat/LiveChatPage.jsx', async () => {
  const ReactModule = await import('react');
  return {
    default: () => ReactModule.createElement('main', { 'data-testid': 'livechat-page-route' }),
  };
});

afterEach(() => {
  cleanup();
  window.history.pushState({}, '', '/');
});

const renderAppAt = async (path) => {
  window.history.pushState({}, '', path);
  render(React.createElement(App));
};

describe('frontend route smoke contracts', () => {
  it('renders board and live chat through public app routes', async () => {
    await renderAppAt('/board');
    expect(await screen.findByTestId('board-page-route')).toBeTruthy();

    cleanup();
    await renderAppAt('/livechat');
    expect(await screen.findByTestId('livechat-page-route')).toBeTruthy();
  });

  it('does not call deleted display helper endpoints from affected pages', () => {
    for (const filePath of affectedSources) {
      const fileSource = source(filePath);
      for (const helperEndpoint of deletedHelperEndpoints) {
        expect(fileSource, filePath).not.toContain(helperEndpoint);
      }
    }
  });
});
