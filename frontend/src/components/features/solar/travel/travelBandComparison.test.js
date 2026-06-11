import { describe, expect, it } from 'vitest';
import {
  buildStateComparisonFromBandComparison,
  createBandComparison,
  createBandHistorySnapshot,
} from './travelBandComparison';

describe('travel band comparison helpers', () => {
  it('creates stable live band history snapshots from partial EEG analysis', () => {
    const snapshot = createBandHistorySnapshot({
      analysis: {
        sampleCount: 512,
        dominantBand: 'alpha',
        bandPowers: [
          { key: 'alpha', percent: 41 },
          { key: 'beta', percent: 18 },
        ],
      },
      measuredAt: '2026-06-10T01:00:00.000Z',
      elapsedSec: 12.4,
      windowSec: 30,
      sequence: 2,
      source: 'unit-test',
    });

    expect(snapshot).toMatchObject({
      measuredAt: '2026-06-10T01:00:00.000Z',
      elapsedSec: 12.4,
      windowSec: 30,
      sequence: 2,
      source: 'unit-test',
      sampleCount: 512,
      dominantBand: 'alpha',
      bands: {
        delta: 0,
        theta: 0,
        alpha: 41,
        beta: 18,
        gamma: 0,
      },
    });
  });

  it('builds state comparison only when before and after band data exists', () => {
    const comparison = createBandComparison({
      before: { delta: 8, theta: 14, alpha: 28, beta: 35, gamma: 15 },
      after: { delta: 6, theta: 12, alpha: 34, beta: 30, gamma: 18 },
      beforeLabel: 'Before',
      afterLabel: 'After',
      sourceLabel: 'unit',
      pointCount: 2,
    });

    const stateComparison = buildStateComparisonFromBandComparison(comparison);

    expect(comparison.hasData).toBe(true);
    expect(comparison.bands.find((band) => band.key === 'alpha')).toMatchObject({
      before: 28,
      after: 34,
      delta: 6,
    });
    expect(stateComparison).toMatchObject({
      beforeLabel: 'Before',
      afterLabel: 'After',
      sourceLabel: 'unit',
      pointCount: 2,
      pointLabel: 'windows',
    });
    expect(stateComparison.before).toHaveProperty('focus_readiness');
    expect(stateComparison.after).toHaveProperty('stress_load');
  });
});
