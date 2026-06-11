import { describe, expect, it } from 'vitest';
import {
  LIVE_MUSE_ANALYSIS_INTERVAL_MS,
  LIVE_MUSE_CSV_TEST_ANALYSIS_INTERVAL_MS,
  createLiveMuseSessionFromSharedSnapshot,
  createQueueAction,
  resolveAdaptiveMusicAction,
  resolveLiveMuseAnalysisIntervalMs,
} from './spaceTravelRuntime';

describe('space travel runtime decisions', () => {
  it('creates a live Muse fallback session from the shared web snapshot', () => {
    const session = createLiveMuseSessionFromSharedSnapshot({
      isActive: true,
      mode: 'web',
      status: 'streaming',
      startedAt: '2026-06-10T01:00:00.000Z',
      eegSessionId: 'eeg-1',
      sampleCount: 1024,
    });

    expect(session).toMatchObject({
      enabled: true,
      deviceType: 'Muse S Athena',
      status: 'streaming',
      eegSessionId: 'eeg-1',
      sampleCount: 1024,
      streamMode: 'web',
      testMode: null,
      transitionMode: 'crossfade',
    });
    expect(resolveLiveMuseAnalysisIntervalMs(session)).toBe(LIVE_MUSE_ANALYSIS_INTERVAL_MS);
  });

  it('uses short baseline and analysis windows for CSV mock Muse sessions', () => {
    const session = createLiveMuseSessionFromSharedSnapshot({
      isActive: true,
      mode: 'mock',
      connectedAt: '2026-06-10T01:00:00.000Z',
    });

    expect(session).toMatchObject({
      deviceType: 'CSV Mock Muse',
      testMode: 'csv-mock',
      baselineDurationSec: 5,
      analysisIntervalSec: 30,
      analysisWindowSec: 30,
    });
    expect(resolveLiveMuseAnalysisIntervalMs(session)).toBe(LIVE_MUSE_CSV_TEST_ANALYSIS_INTERVAL_MS);
  });

  it('keeps the current audio queue when live Muse quality is too low', () => {
    const action = resolveAdaptiveMusicAction({
      qualityScore: 0.2,
      planetSlug: 'mars',
      currentState: { focus_readiness: 0.9, stress_load: 0.9 },
    });

    expect(action).toMatchObject({
      type: 'hold',
      reason: 'low-signal-quality',
      volumeScale: 1,
    });
  });

  it('crossfades to calmer audio when stress rises beyond the queue threshold', () => {
    const action = resolveAdaptiveMusicAction({
      qualityScore: 0.9,
      planetSlug: 'earth',
      previousState: {
        focus_readiness: 0.52,
        stress_load: 0.3,
        fatigue_risk: 0.3,
        relaxation_level: 0.65,
      },
      currentState: {
        focus_readiness: 0.4,
        stress_load: 0.8,
        fatigue_risk: 0.55,
        relaxation_level: 0.3,
      },
    });

    expect(action).toMatchObject({
      type: 'crossfade',
      reason: 'calmer-crossfade',
      volumeScale: 0.88,
    });
  });

  it('normalizes queue prefetch actions', () => {
    expect(createQueueAction('muse-analysis')).toEqual({
      type: 'queue-prefetch',
      reason: 'muse-analysis',
      label: '다음 2분 음악을 미리 준비합니다.',
      volumeScale: 1,
    });
  });
});
