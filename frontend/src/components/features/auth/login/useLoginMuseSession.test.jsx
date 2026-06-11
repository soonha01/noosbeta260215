// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LIVE_MUSE_SESSION_STORAGE_KEY } from '../../solar/travel/constants';
import { createMuseClient } from '../../../../lib/muse';
import {
  attachSharedLiveMuseClient,
  hasActiveSharedLiveMuseSession,
  stopSharedLiveMuseSession,
  updateSharedLiveMuseSession,
} from '../../../../lib/muse/liveMuseSession';
import {
  startEegSession,
  submitEegAnalysis,
} from '../../../../lib/eegAnalysisApi';
import { useLoginMuseSession } from './useLoginMuseSession';

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
    bandPowers: [{ key: 'alpha', percent: 42 }],
  })),
}));

vi.mock('../../../../lib/eegAnalysisApi', () => ({
  createEegAnalysisPayload: vi.fn(() => ({ sampleCount: 128 })),
  startEegSession: vi.fn(() => Promise.resolve({ eegSessionId: 'eeg-1' })),
  submitEegAnalysis: vi.fn(() => Promise.resolve({
    recognitionResult: { state_profile: { label: 'Ready' } },
    currentState: { focus_readiness: 0.7 },
  })),
}));

vi.mock('../../../../lib/noosAiApi', () => ({
  buildFallbackCurrentStateFromBandAnalysis: vi.fn(() => ({ focus_readiness: 0.5 })),
}));

const createClient = () => {
  const subscription = { unsubscribe: vi.fn() };
  const client = {
    connect: vi.fn(() => Promise.resolve()),
    start: vi.fn(() => Promise.resolve()),
    disconnect: vi.fn(() => Promise.resolve()),
    subscribe: vi.fn((callback) => {
      client.emitReading = callback;
      return subscription;
    }),
    emitReading: null,
    subscription,
  };
  return client;
};

const createStorageFake = () => {
  const store = new Map();
  return {
    getItem: vi.fn((key) => store.get(key) ?? null),
    setItem: vi.fn((key, value) => {
      store.set(key, String(value));
    }),
    removeItem: vi.fn((key) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
  };
};

const renderMuseHook = (overrides = {}) => {
  const onAuthStageChange = vi.fn();
  const view = renderHook((props) => useLoginMuseSession({
    authStage: 'login',
    isTransitioning: false,
    selectedMeasurementDurationSecOverride: undefined,
    surveyResult: null,
    surveyAnswers: {},
    onAuthStageChange,
    ...props,
  }), {
    initialProps: overrides,
  });

  return { ...view, onAuthStageChange };
};

describe('useLoginMuseSession', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: createStorageFake(),
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it('starts a measurement, subscribes to readings, buffers them, and enters device-complete', async () => {
    const client = createClient();
    createMuseClient.mockResolvedValueOnce(client);
    const { result, onAuthStageChange } = renderMuseHook();

    await act(async () => {
      await result.current.startMuseMeasurement();
    });
    await act(async () => {
      client.emitReading({ timestamp: 1, samples: [0.11] });
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(createMuseClient).toHaveBeenCalledWith({ mode: 'web' });
    expect(startEegSession).toHaveBeenCalledWith({
      deviceType: 'Muse S Athena',
      measuredAt: expect.any(String),
    });
    expect(client.subscribe).toHaveBeenCalledTimes(1);
    expect(result.current.eegData).toEqual([{ timestamp: 1, samples: [0.11] }]);
    expect(result.current.collectedSampleCount).toBe(1);
    expect(onAuthStageChange).toHaveBeenCalledWith('device-connecting');
    expect(onAuthStageChange).toHaveBeenCalledWith('device-complete');
  });

  it('continues local streaming when backend EEG session start fails', async () => {
    const client = createClient();
    createMuseClient.mockResolvedValueOnce(client);
    startEegSession.mockRejectedValueOnce(new Error('session unavailable'));
    const { result, onAuthStageChange } = renderMuseHook();

    await act(async () => {
      await result.current.startMuseMeasurement();
    });

    expect(client.subscribe).toHaveBeenCalledTimes(1);
    expect(result.current.eegUploadStats.eegSessionId).toBeNull();
    expect(onAuthStageChange).toHaveBeenCalledWith('device-complete');
  });

  it('resets streams by unsubscribing, clearing timers, stopping shared sessions, and disconnecting', async () => {
    const client = createClient();
    createMuseClient.mockResolvedValueOnce(client);
    const { result } = renderMuseHook();
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

    await act(async () => {
      await result.current.startMuseMeasurement();
      client.emitReading({ timestamp: 2, samples: [0.22] });
      result.current.resetMuseStream();
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(client.subscription.unsubscribe).toHaveBeenCalledTimes(1);
    expect(stopSharedLiveMuseSession).toHaveBeenCalledWith({ disconnect: true });
    expect(client.disconnect).toHaveBeenCalledTimes(1);
    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(result.current.eegData).toEqual([]);
    expect(result.current.measuredEegData).toEqual([]);
  });

  it('resets to the device question-compatible stage when measurement connection fails', async () => {
    createMuseClient.mockRejectedValueOnce(new Error('bluetooth denied'));
    const { result, onAuthStageChange } = renderMuseHook();

    await act(async () => {
      await result.current.startMuseMeasurement();
    });

    expect(onAuthStageChange).toHaveBeenCalledWith('device-connecting');
    expect(onAuthStageChange).toHaveBeenCalledWith('device-question');
  });

  it('persists CSV mock live sessions and updates shared-session continuity', async () => {
    const client = createClient();
    createMuseClient.mockResolvedValueOnce(client);
    startEegSession.mockResolvedValueOnce({ eegSessionId: 'live-eeg-1' });
    const { result } = renderMuseHook();

    await act(async () => {
      await result.current.startLiveMuseConnection({ modeOverride: 'mock' });
    });

    const savedSession = JSON.parse(window.localStorage.getItem(LIVE_MUSE_SESSION_STORAGE_KEY));
    expect(savedSession).toMatchObject({
      deviceType: 'CSV Mock Muse',
      status: 'connected',
      eegSessionId: 'live-eeg-1',
      streamMode: 'mock',
      testMode: 'csv-mock',
    });
    expect(result.current.liveMuseConnectionStatus).toBe('connected');
    expect(result.current.liveMuseConnectionMode).toBe('mock');
    expect(attachSharedLiveMuseClient).toHaveBeenCalledWith(client, expect.objectContaining({
      mode: 'mock',
      status: 'connected',
      eegSessionId: 'live-eeg-1',
    }));
    expect(updateSharedLiveMuseSession).toHaveBeenCalledWith(expect.objectContaining({
      status: 'connected',
      eegSessionId: 'live-eeg-1',
    }));
  });

  it('disconnects on unmount only when the live Muse handoff is not preserved', async () => {
    const firstClient = createClient();
    createMuseClient.mockResolvedValueOnce(firstClient);
    hasActiveSharedLiveMuseSession.mockReturnValueOnce(true);
    const first = renderMuseHook();

    await act(async () => {
      await first.result.current.startLiveMuseConnection({ modeOverride: 'web' });
    });

    first.unmount();
    expect(stopSharedLiveMuseSession).toHaveBeenCalledTimes(2);
    expect(stopSharedLiveMuseSession).toHaveBeenLastCalledWith({ disconnect: true });

    const preservedClient = createClient();
    createMuseClient.mockResolvedValueOnce(preservedClient);
    hasActiveSharedLiveMuseSession.mockReturnValueOnce(true);
    const preserved = renderMuseHook();

    await act(async () => {
      await preserved.result.current.startLiveMuseConnection({ modeOverride: 'web' });
      preserved.result.current.preserveLiveMuseConnection();
    });

    preserved.unmount();
    expect(stopSharedLiveMuseSession).toHaveBeenCalledTimes(3);
    expect(preservedClient.disconnect).not.toHaveBeenCalled();
  });

  it('submits EEG analysis for completed hybrid Muse data and exposes response state', async () => {
    const client = createClient();
    createMuseClient.mockResolvedValueOnce(client);
    const { result, rerender } = renderMuseHook({
      authStage: 'login',
      surveyResult: { title: 'Survey', canonicalState: { focus_readiness: 0.4 } },
      surveyAnswers: { focus_energy: 4 },
    });

    await act(async () => {
      await result.current.startMuseMeasurement();
      client.emitReading({ timestamp: 3, samples: [0.33] });
      result.current.completeMeasurement();
    });
    rerender({
      authStage: 'device-success',
      surveyResult: { title: 'Survey', canonicalState: { focus_readiness: 0.4 } },
      surveyAnswers: { focus_energy: 4 },
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(submitEegAnalysis).toHaveBeenCalledWith(
      expect.objectContaining({ eegSessionId: 'eeg-1' }),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    expect(result.current.museCurrentState).toEqual({ focus_readiness: 0.7 });
    expect(result.current.museRecognitionResult).toEqual({ state_profile: { label: 'Ready' } });
  });
});
