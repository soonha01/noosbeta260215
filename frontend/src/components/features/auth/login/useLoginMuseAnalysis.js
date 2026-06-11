import { useCallback, useEffect, useRef } from 'react';
import {
  createEegAnalysisPayload,
  submitEegAnalysis,
} from '../../../../lib/eegAnalysisApi';
import {
  EEG_SAMPLE_RATE,
  createSurveyContextPayload,
} from './museSessionRuntime';

export const useLoginMuseAnalysis = ({
  authStage,
  measurementCompletedAt,
  museFftAnalysis,
  selectedMeasurementDurationSec,
  measuredEegDataLength,
  surveyAnswers,
  surveyResult,
  eegSessionId,
  sampleCount,
  fallbackMuseCurrentState,
  setMuseRecognitionResult,
  setMuseCurrentState,
}) => {
  const eegAnalysisRequestKeyRef = useRef(null);

  const resetMuseAnalysis = useCallback(() => {
    eegAnalysisRequestKeyRef.current = null;
  }, []);

  useEffect(() => {
    if (authStage !== 'device-success' || !measurementCompletedAt || !museFftAnalysis) {
      return undefined;
    }

    if (museFftAnalysis.sampleCount < 64 || eegAnalysisRequestKeyRef.current === measurementCompletedAt) {
      return undefined;
    }

    const basePayload = createEegAnalysisPayload({
      eegSessionId,
      analysis: museFftAnalysis,
      measuredAt: measurementCompletedAt,
      measurementDurationSec: selectedMeasurementDurationSec,
      sampleRateHz: EEG_SAMPLE_RATE,
      sampleCountOverride: sampleCount || measuredEegDataLength,
      surveyContext: createSurveyContextPayload(surveyResult, surveyAnswers, 'muse-hybrid'),
    });

    if (!basePayload) {
      return undefined;
    }

    eegAnalysisRequestKeyRef.current = measurementCompletedAt;
    const controller = new AbortController();

    submitEegAnalysis(
      {
        ...basePayload,
        eegSessionId,
      },
      { signal: controller.signal }
    )
      .then((response) => {
        if (controller.signal.aborted) return;

        setMuseRecognitionResult(response?.recognitionResult || null);
        setMuseCurrentState(response?.currentState || fallbackMuseCurrentState);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;

        eegAnalysisRequestKeyRef.current = null;
        setMuseCurrentState(fallbackMuseCurrentState);
        console.error('Failed to submit EEG analysis:', error);
      });

    return () => controller.abort();
  }, [
    authStage,
    eegSessionId,
    fallbackMuseCurrentState,
    measuredEegDataLength,
    measurementCompletedAt,
    museFftAnalysis,
    sampleCount,
    selectedMeasurementDurationSec,
    setMuseCurrentState,
    setMuseRecognitionResult,
    surveyAnswers,
    surveyResult,
  ]);

  return resetMuseAnalysis;
};
