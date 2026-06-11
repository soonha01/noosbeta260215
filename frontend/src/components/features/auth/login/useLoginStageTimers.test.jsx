// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLoginStageTimers } from './useLoginStageTimers';

const renderTimers = (props) => renderHook((nextProps) => useLoginStageTimers(nextProps), {
  initialProps: {
    authStage: 'login',
    selectedMeasurementDurationSec: 60,
    showSolarExplorer: false,
    setMeasurementProgressPercent: vi.fn(),
    completeMeasurement: vi.fn(),
    resetSurvey: vi.fn(),
    setAuthStage: vi.fn(),
    setShowSolarExplorer: vi.fn(),
    setShowSolarEntryWarp: vi.fn(),
    ...props,
  },
});

describe('useLoginStageTimers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('updates measurement progress and completes into muse-survey', async () => {
    const setMeasurementProgressPercent = vi.fn();
    const completeMeasurement = vi.fn();
    const resetSurvey = vi.fn();
    const setAuthStage = vi.fn();

    renderTimers({
      authStage: 'device-complete',
      selectedMeasurementDurationSec: 1,
      setMeasurementProgressPercent,
      completeMeasurement,
      resetSurvey,
      setAuthStage,
    });

    await vi.advanceTimersByTimeAsync(500);
    expect(setMeasurementProgressPercent).toHaveBeenCalledWith(50);

    await vi.advanceTimersByTimeAsync(500);
    expect(setMeasurementProgressPercent).toHaveBeenCalledWith(100);
    expect(completeMeasurement).toHaveBeenCalledTimes(1);
    expect(resetSurvey).toHaveBeenCalledTimes(1);
    expect(setAuthStage).toHaveBeenCalledWith('muse-survey');
  });

  it('moves analysis loading to analysis-result after 2600ms', async () => {
    const setAuthStage = vi.fn();
    renderTimers({ authStage: 'analysis-loading', setAuthStage });

    await vi.advanceTimersByTimeAsync(2599);
    expect(setAuthStage).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(setAuthStage).toHaveBeenCalledWith('analysis-result');
  });

  it('shows Solar Explorer after the warp transition delay', async () => {
    const setShowSolarExplorer = vi.fn();
    renderTimers({ authStage: 'warp-transition', setShowSolarExplorer });

    await vi.advanceTimersByTimeAsync(4299);
    expect(setShowSolarExplorer).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(setShowSolarExplorer).toHaveBeenCalledWith(true);
  });

  it('toggles the Solar entry warp overlay while Solar Explorer is visible', async () => {
    const setShowSolarEntryWarp = vi.fn();
    renderTimers({ showSolarExplorer: true, setShowSolarEntryWarp });

    expect(setShowSolarEntryWarp).toHaveBeenCalledWith(true);

    await vi.advanceTimersByTimeAsync(2200);
    expect(setShowSolarEntryWarp).toHaveBeenCalledWith(false);
  });

  it('clears pending timers when the stage changes or unmounts', async () => {
    const setAuthStage = vi.fn();
    const setShowSolarExplorer = vi.fn();
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    const { rerender, unmount } = renderTimers({
      authStage: 'device-complete',
      selectedMeasurementDurationSec: 1,
      setAuthStage,
      setShowSolarExplorer,
    });

    rerender({
      authStage: 'warp-transition',
      selectedMeasurementDurationSec: 1,
      showSolarExplorer: false,
      setMeasurementProgressPercent: vi.fn(),
      completeMeasurement: vi.fn(),
      resetSurvey: vi.fn(),
      setAuthStage,
      setShowSolarExplorer,
      setShowSolarEntryWarp: vi.fn(),
    });
    await vi.advanceTimersByTimeAsync(1000);
    expect(setAuthStage).not.toHaveBeenCalledWith('muse-survey');

    unmount();
    await vi.advanceTimersByTimeAsync(4300);
    expect(setShowSolarExplorer).not.toHaveBeenCalledWith(true);
    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
