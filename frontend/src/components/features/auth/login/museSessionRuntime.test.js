import { describe, expect, it } from 'vitest';
import {
  createLiveMuseSessionPayload,
  formatMeasurementClock,
  formatMeasurementDurationText,
  getMaxLocalEegBufferSize,
} from './museSessionRuntime';

describe('Muse session runtime', () => {
  it('builds the persisted live Muse session contract', () => {
    expect(createLiveMuseSessionPayload('2026-06-10T01:00:00.000Z', {
      status: 'connected',
      eegSessionId: 'eeg-1',
      streamMode: 'mock',
      testMode: 'csv-mock',
      baselineDurationSec: 6,
      analysisIntervalSec: 30,
      analysisWindowSec: 30,
    })).toMatchObject({
      enabled: true,
      deviceType: 'Muse S Athena',
      status: 'connected',
      createdAt: '2026-06-10T01:00:00.000Z',
      eegSessionId: 'eeg-1',
      streamMode: 'mock',
      testMode: 'csv-mock',
      baselineDurationSec: 6,
      analysisIntervalSec: 30,
      analysisWindowSec: 30,
      transitionMode: 'crossfade',
    });
  });

  it('formats measurement clocks and caps local EEG buffers', () => {
    expect(formatMeasurementClock(65)).toBe('01:05');
    expect(formatMeasurementDurationText(3660)).toBe('61분');
    expect(getMaxLocalEegBufferSize(3600)).toBe(256 * 600 + 512);
  });
});
