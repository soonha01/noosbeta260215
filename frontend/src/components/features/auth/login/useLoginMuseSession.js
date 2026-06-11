import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  hasActiveSharedLiveMuseSession,
  stopSharedLiveMuseSession,
} from '../../../../lib/muse/liveMuseSession';
import { DEFAULT_FFT_SIZE, analyzeEegBands } from '../../../../lib/muse/signalProcessing';
import { buildFallbackCurrentStateFromBandAnalysis } from '../../../../lib/noosAiApi';
import {
  DEFAULT_MEASUREMENT_DURATION_SEC,
  EEG_SAMPLE_RATE,
  EEG_UI_FLUSH_INTERVAL_MS,
  MAX_EEG_UI_BUFFER_SIZE,
} from './museSessionRuntime';
import {
  runLiveMuseConnectionSession,
  runMuseMeasurementSession,
} from './loginMuseConnectionRuntime';
import { useLoginMuseAnalysis } from './useLoginMuseAnalysis';

const noop = () => {};

export const useLoginMuseSession = ({
  authStage,
  isTransitioning,
  selectedMeasurementDurationSecOverride,
  surveyResult,
  surveyAnswers,
  onAuthStageChange = noop,
} = {}) => {
  const [eegData, setEegData] = useState([]);
  const [measuredEegData, setMeasuredEegData] = useState([]);
  const [selectedMeasurementDurationSec, setSelectedMeasurementDurationSec] = useState(
    selectedMeasurementDurationSecOverride || DEFAULT_MEASUREMENT_DURATION_SEC
  );
  const [measurementProgressPercent, setMeasurementProgressPercent] = useState(0);
  const [measurementCompletedAt, setMeasurementCompletedAt] = useState(null);
  const [eegUploadStats, setEegUploadStats] = useState({
    eegSessionId: null,
    sampleCount: 0,
    failed: false,
  });
  const [museRecognitionResult, setMuseRecognitionResult] = useState(null);
  const [museCurrentState, setMuseCurrentState] = useState(null);
  const [liveMuseConnectionStatus, setLiveMuseConnectionStatus] = useState('idle');
  const [liveMuseConnectionError, setLiveMuseConnectionError] = useState('');
  const [liveMuseConnectedAt, setLiveMuseConnectedAt] = useState(null);
  const [liveMuseConnectionMode, setLiveMuseConnectionMode] = useState('web');

  const museClientRef = useRef(null);
  const museSubscriptionRef = useRef(null);
  const eegBufferRef = useRef([]);
  const eegSessionIdRef = useRef(null);
  const eegSessionMeasuredAtRef = useRef(null);
  const collectedSampleCountRef = useRef(0);
  const eegFlushTimerRef = useRef(null);
  const preserveLiveMuseConnectionRef = useRef(false);
  const museRefs = useMemo(() => ({
    museClientRef,
    museSubscriptionRef,
    eegBufferRef,
    eegSessionIdRef,
    eegSessionMeasuredAtRef,
    collectedSampleCountRef,
    preserveLiveMuseConnectionRef,
  }), []);

  const museFftAnalysis = useMemo(() => {
    if (!measuredEegData.length) {
      return null;
    }

    return analyzeEegBands(measuredEegData, {
      sampleRate: EEG_SAMPLE_RATE,
      fftSize: DEFAULT_FFT_SIZE,
    });
  }, [measuredEegData]);
  const fallbackMuseCurrentState = useMemo(
    () => (museFftAnalysis ? buildFallbackCurrentStateFromBandAnalysis(museFftAnalysis) : null),
    [museFftAnalysis]
  );
  const resetMuseAnalysis = useLoginMuseAnalysis({
    authStage,
    measurementCompletedAt,
    museFftAnalysis,
    selectedMeasurementDurationSec,
    measuredEegDataLength: measuredEegData.length,
    surveyAnswers,
    surveyResult,
    eegSessionId: eegSessionIdRef.current,
    sampleCount: collectedSampleCountRef.current,
    fallbackMuseCurrentState,
    setMuseRecognitionResult,
    setMuseCurrentState,
  });

  const scheduleEegFlush = useCallback(() => {
    if (eegFlushTimerRef.current) return;

    eegFlushTimerRef.current = window.setTimeout(() => {
      eegFlushTimerRef.current = null;
      setEegData([...eegBufferRef.current.slice(-MAX_EEG_UI_BUFFER_SIZE)]);
    }, EEG_UI_FLUSH_INTERVAL_MS);
  }, []);

  const resetMuseStream = useCallback(({ preserveSharedConnection = false } = {}) => {
    museSubscriptionRef.current?.unsubscribe?.();
    museSubscriptionRef.current = null;

    if (!preserveSharedConnection) {
      stopSharedLiveMuseSession({ disconnect: true }).catch((error) => {
        console.warn('Failed to stop shared Muse session:', error);
      });
      preserveLiveMuseConnectionRef.current = false;
      museClientRef.current?.disconnect?.();
    }

    museClientRef.current = null;
    eegBufferRef.current = [];
    eegSessionIdRef.current = null;
    eegSessionMeasuredAtRef.current = null;
    collectedSampleCountRef.current = 0;
    resetMuseAnalysis();
    setEegData([]);
    setMeasuredEegData([]);
    setMeasurementProgressPercent(0);
    setMeasurementCompletedAt(null);
    setEegUploadStats({
      eegSessionId: null,
      sampleCount: 0,
      failed: false,
    });
    setMuseRecognitionResult(null);
    setMuseCurrentState(null);

    if (eegFlushTimerRef.current) {
      clearTimeout(eegFlushTimerRef.current);
      eegFlushTimerRef.current = null;
    }
  }, [resetMuseAnalysis]);

  const completeMeasurement = useCallback(() => {
    const frozenReadings = [...eegBufferRef.current];
    const measuredAt = new Date().toISOString();

    setMeasurementProgressPercent(100);
    setMeasuredEegData(frozenReadings);
    setEegData(frozenReadings);
    setMeasurementCompletedAt(measuredAt);
    museSubscriptionRef.current?.unsubscribe?.();
    museSubscriptionRef.current = null;

    const disconnectPromise = museClientRef.current?.disconnect?.();
    museClientRef.current = null;

    Promise.resolve(disconnectPromise).catch((error) => {
      console.error('Failed to disconnect Muse client after measurement:', error);
    });

    return { measuredAt, readings: frozenReadings };
  }, []);

  const startMuseMeasurement = useCallback(async () => {
    if (isTransitioning) return;

    await runMuseMeasurementSession({
      refs: museRefs,
      selectedMeasurementDurationSec,
      scheduleEegFlush,
      resetMuseStream,
      setEegUploadStats,
      setMeasurementProgressPercent,
      onAuthStageChange,
    });
  }, [isTransitioning, museRefs, onAuthStageChange, resetMuseStream, scheduleEegFlush, selectedMeasurementDurationSec]);

  const startLiveMuseConnection = useCallback(async (options = {}) => {
    if (isTransitioning || liveMuseConnectionStatus === 'connecting' || liveMuseConnectionStatus === 'connected') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const mode = options?.modeOverride || (params.get('muse') === 'mock' ? 'mock' : 'web');
    await runLiveMuseConnectionSession({
      mode,
      refs: museRefs,
      resetMuseStream,
      scheduleEegFlush,
      setEegUploadStats,
      setLiveMuseConnectedAt,
      setLiveMuseConnectionError,
      setLiveMuseConnectionMode,
      setLiveMuseConnectionStatus,
    });
  }, [isTransitioning, liveMuseConnectionStatus, museRefs, resetMuseStream, scheduleEegFlush]);

  const startLiveMuseCsvTestConnection = useCallback(() => {
    startLiveMuseConnection({ modeOverride: 'mock' });
  }, [startLiveMuseConnection]);

  const resetLiveMuseGate = useCallback(() => {
    resetMuseStream();
    setLiveMuseConnectionStatus('idle');
    setLiveMuseConnectionError('');
    setLiveMuseConnectedAt(null);
    setLiveMuseConnectionMode('web');
  }, [resetMuseStream]);

  const preserveLiveMuseConnection = useCallback(() => {
    preserveLiveMuseConnectionRef.current = true;
  }, []);

  useEffect(() => {
    return () => {
      museSubscriptionRef.current?.unsubscribe?.();
      museSubscriptionRef.current = null;

      if (eegFlushTimerRef.current) {
        clearTimeout(eegFlushTimerRef.current);
        eegFlushTimerRef.current = null;
      }

      const hasSharedSession = hasActiveSharedLiveMuseSession();
      if (preserveLiveMuseConnectionRef.current && hasSharedSession) {
        museClientRef.current = null;
        return;
      }

      if (hasSharedSession) {
        stopSharedLiveMuseSession({ disconnect: true }).catch((error) => {
          console.warn('Failed to stop shared Muse session:', error);
        });
      } else {
        museClientRef.current?.disconnect?.();
      }

      museClientRef.current = null;
    };
  }, []);

  return {
    eegData,
    measuredEegData,
    selectedMeasurementDurationSec,
    setSelectedMeasurementDurationSec,
    measurementProgressPercent,
    setMeasurementProgressPercent,
    measurementCompletedAt,
    eegUploadStats,
    museRecognitionResult,
    museCurrentState,
    fallbackMuseCurrentState,
    liveMuseConnectionStatus,
    liveMuseConnectionError,
    setLiveMuseConnectionError,
    liveMuseConnectedAt,
    liveMuseConnectionMode,
    museFftAnalysis,
    eegSessionId: eegSessionIdRef.current,
    collectedSampleCount: collectedSampleCountRef.current,
    resetMuseStream,
    resetLiveMuseGate,
    startMuseMeasurement,
    startLiveMuseConnection,
    startLiveMuseCsvTestConnection,
    completeMeasurement,
    preserveLiveMuseConnection,
  };
};
