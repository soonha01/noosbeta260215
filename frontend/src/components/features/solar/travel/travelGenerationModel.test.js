import { describe, expect, it } from 'vitest';
import {
  buildGenerationMetricCards,
  clampProgressPercent,
  getActiveGenerationStatus,
  hasLightingPreview,
  resolveGenerationBackgroundImage,
} from './travelGenerationModel';

describe('travelGenerationModel', () => {
  it('clamps progress values to the visible generation range', () => {
    expect(clampProgressPercent(-12)).toBe(0);
    expect(clampProgressPercent(42.5)).toBe(42.5);
    expect(clampProgressPercent(137)).toBe(100);
    expect(clampProgressPercent('not numeric')).toBe(0);
    expect(clampProgressPercent(undefined)).toBe(0);
  });

  it('selects the active status using the existing bounded fallback behavior', () => {
    const statusLines = ['measure', 'compose', 'align'];

    expect(getActiveGenerationStatus(statusLines, 1)).toBe('compose');
    expect(getActiveGenerationStatus(statusLines, 99)).toBe('align');
    expect(getActiveGenerationStatus(statusLines, -1)).toBe('Session preparing');
    expect(getActiveGenerationStatus([], 0)).toBe('Session preparing');
    expect(getActiveGenerationStatus(undefined, 0)).toBe('Session preparing');
  });

  it('builds rounded generation metric cards from canonical state values', () => {
    const metrics = buildGenerationMetricCards({
      focus_readiness: 0.316,
      stress_load: 0.482,
      fatigue_risk: 0.224,
    });

    expect(metrics).toEqual([
      expect.objectContaining({
        key: 'focus_readiness',
        iconKey: 'brain',
        label: 'Focus readiness',
        percent: '32%',
      }),
      expect.objectContaining({
        key: 'stress_load',
        iconKey: 'activity',
        label: 'Stress load',
        percent: '48%',
      }),
      expect.objectContaining({
        key: 'fatigue_risk',
        iconKey: 'timer',
        label: 'Fatigue risk',
        percent: '22%',
      }),
    ]);
  });

  it('uses the existing media fallbacks for background and lighting preview presence', () => {
    expect(resolveGenerationBackgroundImage({ backgroundImage: '/bg.jpg', image: '/image.jpg' })).toBe('/bg.jpg');
    expect(resolveGenerationBackgroundImage({ image: '/image.jpg' })).toBe('/image.jpg');
    expect(resolveGenerationBackgroundImage(null)).toBeUndefined();
    expect(hasLightingPreview({ lightingPreview: { cctKelvin: 3200 } })).toBe(true);
    expect(hasLightingPreview({ lightingPreview: null })).toBe(false);
    expect(hasLightingPreview(undefined)).toBe(false);
  });
});
