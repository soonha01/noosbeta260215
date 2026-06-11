import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildFallbackCurrentStateFromBandAnalysis } from './noosAiApi';

const apiSourcePath = resolve(dirname(fileURLToPath(import.meta.url)), 'noosAiApi.js');
const removedSourcePattern = new RegExp(
  ['noos' + 'Lite' + 'Rt', 'tasks-' + 'genai', 'ge' + 'mma', 'lite' + 'rt'].join('|'),
  'i'
);
const removedExportNames = [
  'requestPlanet' + 'Recommendation',
  'requestState' + 'Explanation',
  'requestDashboard' + 'Summary',
  'requestSession' + 'Coach',
  'warmNoosLocal' + 'Copilot',
];

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('NOOS AI API client', () => {
  it('does not load browser model fallback code or expose removed helper API clients', async () => {
    const source = readFileSync(apiSourcePath, 'utf8');
    const api = await import('./noosAiApi');

    expect(source).not.toMatch(removedSourcePattern);
    removedExportNames.forEach((exportName) => {
      expect(api).not.toHaveProperty(exportName);
    });
  });

  it('does not expose display insight builders from the network API client', async () => {
    const api = await import('./noosAiApi');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    ['buildState' + 'Brief', 'buildDashboard' + 'Summary', 'buildSession' + 'Guide'].forEach((exportName) => {
      expect(api).not.toHaveProperty(exportName);
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('builds a bounded fallback state vector from EEG band percentages', () => {
    const state = buildFallbackCurrentStateFromBandAnalysis({
      bandPowers: [
        { key: 'alpha', percent: 40 },
        { key: 'beta', percent: 35 },
        { key: 'theta', percent: 15 },
        { key: 'delta', percent: 5 },
        { key: 'gamma', percent: 8 },
      ],
    });

    expect(Object.keys(state)).toEqual([
      'focus_readiness',
      'stress_load',
      'fatigue_risk',
      'relaxation_level',
      'cortical_arousal',
      'mental_workload',
    ]);
    Object.values(state).forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });
  });
});
