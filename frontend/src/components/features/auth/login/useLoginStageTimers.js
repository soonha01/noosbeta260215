import { useEffect } from 'react';

export const ANALYSIS_RESULT_DELAY_MS = 2600;
export const WARP_TO_SOLAR_DELAY_MS = 4300;
export const SOLAR_ENTRY_WARP_OVERLAY_DURATION_MS = 2200;

export const useLoginStageTimers = ({
  authStage,
  selectedMeasurementDurationSec,
  showSolarExplorer,
  setMeasurementProgressPercent,
  completeMeasurement,
  resetSurvey,
  setAuthStage,
  setShowSolarExplorer,
  setShowSolarEntryWarp,
}) => {
  useEffect(() => {
    const timeoutIds = [];
    let measurementProgressTimerId = null;

    if (authStage === 'device-complete') {
      const measurementStartedAt = Date.now();
      const measurementStageDurationMs = selectedMeasurementDurationSec * 1000;

      setMeasurementProgressPercent(0);
      measurementProgressTimerId = window.setInterval(() => {
        const elapsedMs = Date.now() - measurementStartedAt;
        const nextProgress = Math.min(
          100,
          Math.round((elapsedMs / measurementStageDurationMs) * 100)
        );
        setMeasurementProgressPercent(nextProgress);
      }, 100);

      timeoutIds.push(
        window.setTimeout(() => {
          completeMeasurement();
          resetSurvey();
          setAuthStage('muse-survey');
        }, measurementStageDurationMs)
      );
    }

    if (authStage === 'analysis-loading') {
      timeoutIds.push(window.setTimeout(() => setAuthStage('analysis-result'), ANALYSIS_RESULT_DELAY_MS));
    }

    if (authStage === 'warp-transition') {
      timeoutIds.push(window.setTimeout(() => setShowSolarExplorer(true), WARP_TO_SOLAR_DELAY_MS));
    }

    return () => {
      timeoutIds.forEach((id) => window.clearTimeout(id));
      if (measurementProgressTimerId) {
        window.clearInterval(measurementProgressTimerId);
      }
    };
  }, [
    authStage,
    completeMeasurement,
    resetSurvey,
    selectedMeasurementDurationSec,
    setAuthStage,
    setMeasurementProgressPercent,
    setShowSolarExplorer,
  ]);

  useEffect(() => {
    if (!showSolarExplorer) return undefined;

    setShowSolarEntryWarp(true);
    const timeoutId = window.setTimeout(() => {
      setShowSolarEntryWarp(false);
    }, SOLAR_ENTRY_WARP_OVERLAY_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [showSolarExplorer, setShowSolarEntryWarp]);
};
