import { useCallback } from 'react';
import { stopWizLighting } from '../../../../lib/noosAiApi';

export const useJourneyExitCleanup = ({
  audioRef,
  audioPlayRetryRef,
  audioSourceAutoResumeRef,
  clearAiTimers,
  crossfadeHandoffRef,
  crossfadeTimerRef,
  journeyExitInProgressRef,
  journeyLightingJobRef,
  latestQueueActionRef,
  lightingRestoreRequestedRef,
  liveAnalysisTimerRef,
  liveBandHistoryTimerRef,
  liveCalibrationTimerRef,
  liveFeedbackTimerRef,
  liveUiTimerRef,
  nextAudioRef,
  pendingAdaptiveAudioRef,
  queueGenerationAbortControllerRef,
  queueGenerationInFlightRef,
  queueRetryAfterMsRef,
  queuedAdaptiveAudioRef,
  setAdaptiveMusicState,
  setPendingAdaptiveAudio,
  setPlaybackActive,
  setQueuedAdaptiveAudio,
  setShowLiveFeedbackDialog,
}) => {
  const restoreJourneyLighting = useCallback((reason = 'route-leave', options = {}) => {
    const force = Boolean(options?.force);
    if ((!journeyLightingJobRef.current && !force) || lightingRestoreRequestedRef.current) return;

    lightingRestoreRequestedRef.current = true;
    journeyLightingJobRef.current = null;

    stopWizLighting({ keepalive: true }).catch((error) => {
      console.warn(`Failed to restore WiZ lighting after ${reason}:`, error);
    });
  }, [journeyLightingJobRef, lightingRestoreRequestedRef]);

  const clearLiveMuseTimers = useCallback(() => {
    if (liveAnalysisTimerRef.current) {
      clearInterval(liveAnalysisTimerRef.current);
      liveAnalysisTimerRef.current = null;
    }
    if (liveBandHistoryTimerRef.current) {
      clearInterval(liveBandHistoryTimerRef.current);
      liveBandHistoryTimerRef.current = null;
    }
    if (liveCalibrationTimerRef.current) {
      clearTimeout(liveCalibrationTimerRef.current);
      liveCalibrationTimerRef.current = null;
    }
    if (liveUiTimerRef.current) {
      clearTimeout(liveUiTimerRef.current);
      liveUiTimerRef.current = null;
    }
    if (liveFeedbackTimerRef.current) {
      clearTimeout(liveFeedbackTimerRef.current);
      liveFeedbackTimerRef.current = null;
    }
  }, [
    liveAnalysisTimerRef,
    liveBandHistoryTimerRef,
    liveCalibrationTimerRef,
    liveFeedbackTimerRef,
    liveUiTimerRef,
  ]);

  const stopJourneyPlaybackAndBackgroundWork = useCallback((reason = 'journey-exit') => {
    journeyExitInProgressRef.current = true;
    restoreJourneyLighting(reason, { force: true });
    clearLiveMuseTimers();
    clearAiTimers();

    if (queueGenerationAbortControllerRef.current) {
      queueGenerationAbortControllerRef.current.abort();
      queueGenerationAbortControllerRef.current = null;
    }
    queueGenerationInFlightRef.current = false;
    queueRetryAfterMsRef.current = Number.POSITIVE_INFINITY;
    queuedAdaptiveAudioRef.current = null;
    pendingAdaptiveAudioRef.current = null;
    latestQueueActionRef.current = null;
    setQueuedAdaptiveAudio(null);
    setPendingAdaptiveAudio(null);

    if (audioPlayRetryRef.current) {
      clearTimeout(audioPlayRetryRef.current);
      audioPlayRetryRef.current = null;
    }
    if (crossfadeTimerRef.current) {
      clearInterval(crossfadeTimerRef.current);
      crossfadeTimerRef.current = null;
    }

    audioSourceAutoResumeRef.current = false;
    crossfadeHandoffRef.current = null;
    audioRef.current?.pause();
    nextAudioRef.current?.pause();
    if (nextAudioRef.current) {
      nextAudioRef.current.volume = 0;
    }
    setPlaybackActive(false);
    setShowLiveFeedbackDialog(false);
    setAdaptiveMusicState((prev) => ({
      ...prev,
      isGenerating: false,
      isCrossfading: false,
      label: '여정을 종료하는 중입니다.',
      reason: '',
    }));
  }, [
    audioPlayRetryRef,
    audioRef,
    audioSourceAutoResumeRef,
    clearAiTimers,
    clearLiveMuseTimers,
    crossfadeHandoffRef,
    crossfadeTimerRef,
    journeyExitInProgressRef,
    latestQueueActionRef,
    nextAudioRef,
    pendingAdaptiveAudioRef,
    queueGenerationAbortControllerRef,
    queueGenerationInFlightRef,
    queueRetryAfterMsRef,
    queuedAdaptiveAudioRef,
    restoreJourneyLighting,
    setAdaptiveMusicState,
    setPendingAdaptiveAudio,
    setPlaybackActive,
    setQueuedAdaptiveAudio,
    setShowLiveFeedbackDialog,
  ]);

  return {
    clearLiveMuseTimers,
    restoreJourneyLighting,
    stopJourneyPlaybackAndBackgroundWork,
  };
};
