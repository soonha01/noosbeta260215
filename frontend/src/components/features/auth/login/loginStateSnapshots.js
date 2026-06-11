import {
  DEVICE_CONNECTION_RESULT,
  LIVE_MUSE_ANALYSIS_INTERVAL_SEC,
  LIVE_MUSE_BASELINE_DURATION_SEC,
  LIVE_MUSE_CSV_TEST_ANALYSIS_INTERVAL_SEC,
  LIVE_MUSE_CSV_TEST_BASELINE_SEC,
  LIVE_MUSE_NEUTRAL_STATE,
  createLiveMuseSessionPayload,
  createSurveyContextPayload,
} from './museSessionRuntime';

const LIVE_MUSE_STATE_CONCLUSION =
  '음악 세션 중 최근 5분 EEG 윈도우를 반복 분석해 음악 전환에 반영합니다.';

export const getLiveMuseModeConfig = (streamMode = 'web') => {
  const isCsvTest = streamMode === 'mock';
  const analysisIntervalSec = isCsvTest
    ? LIVE_MUSE_CSV_TEST_ANALYSIS_INTERVAL_SEC
    : LIVE_MUSE_ANALYSIS_INTERVAL_SEC;

  return {
    isCsvTest,
    deviceType: isCsvTest ? 'CSV Mock Muse' : 'Muse S Athena',
    source: isCsvTest ? 'csv-mock-live' : 'muse-live',
    sourceLabel: isCsvTest ? 'CSV mock EEG test stream' : 'Muse S Athena 실시간 측정',
    testMode: isCsvTest ? 'csv-mock' : null,
    baselineDurationSec: isCsvTest ? LIVE_MUSE_CSV_TEST_BASELINE_SEC : LIVE_MUSE_BASELINE_DURATION_SEC,
    analysisIntervalSec,
    analysisWindowSec: analysisIntervalSec,
  };
};

export const buildLiveMuseSessionPayloadOptions = ({
  connectedAt,
  eegSessionId,
  sampleCount,
  streamMode = 'web',
}) => {
  const modeConfig = getLiveMuseModeConfig(streamMode);

  return {
    deviceType: modeConfig.deviceType,
    status: 'connected',
    connectedAt,
    eegSessionId,
    sampleCount,
    streamMode,
    testMode: modeConfig.testMode,
    baselineDurationSec: modeConfig.baselineDurationSec,
    analysisIntervalSec: modeConfig.analysisIntervalSec,
    analysisWindowSec: modeConfig.analysisWindowSec,
  };
};

export const buildLiveMuseStateSnapshot = ({
  measuredAt,
  connectedAt,
  eegSessionId,
  sampleCount,
  streamMode = 'web',
}) => {
  const resolvedConnectedAt = connectedAt || measuredAt;
  const modeConfig = getLiveMuseModeConfig(streamMode);
  const liveMuseSession = createLiveMuseSessionPayload(
    resolvedConnectedAt,
    buildLiveMuseSessionPayloadOptions({
      connectedAt: resolvedConnectedAt,
      eegSessionId,
      sampleCount,
      streamMode,
    })
  );

  return {
    liveMuseSession,
    currentStateSnapshot: {
      source: modeConfig.source,
      sourceLabel: modeConfig.sourceLabel,
      title: DEVICE_CONNECTION_RESULT.title,
      summary: DEVICE_CONNECTION_RESULT.summary,
      conclusion: LIVE_MUSE_STATE_CONCLUSION,
      canonicalState: LIVE_MUSE_NEUTRAL_STATE,
      dominantState: 'live-session-pending',
      recognitionResult: null,
      liveMuseSession,
      measuredAt,
    },
  };
};

export const buildSurveyStateSnapshot = ({ surveyResult, measuredAt }) => ({
  source: 'survey',
  sourceLabel: '설문 기반 측정',
  title: surveyResult?.title || '상태 분석 결과',
  summary: surveyResult?.summary || '',
  conclusion: surveyResult?.conclusion || '',
  dimensions: surveyResult?.dimensions || [],
  keyIndicators: surveyResult?.keyIndicators || [],
  canonicalState: surveyResult?.canonicalState || null,
  measuredAt,
});

export const buildHybridMuseStateSnapshot = ({
  measuredAt,
  surveyResult,
  surveyAnswers,
  museFftAnalysis,
  museCurrentState,
  fallbackCurrentState,
  museRecognitionResult,
  totalMeasurementDurationText,
  selectedMeasurementDurationSec,
  eegUploadStats,
}) => {
  const resolvedCurrentState = museCurrentState || fallbackCurrentState;
  const resolvedRecognitionResult = museRecognitionResult || null;
  const museStateLabel = resolvedRecognitionResult?.state_profile?.label || DEVICE_CONNECTION_RESULT.title;
  const dominantState = resolvedRecognitionResult?.state_profile?.dominant_state || 'band-summary';

  return {
    source: 'hybrid',
    sourceLabel: 'Muse S Athena + 설문 기반 측정',
    title: museStateLabel,
    summary:
      resolvedRecognitionResult?.state_profile?.summary?.join(' · ') ||
      `${totalMeasurementDurationText} 뇌파 측정과 설문 기반 상태 요약이 준비되었습니다.`,
    recognitionResult: resolvedRecognitionResult,
    canonicalState: resolvedCurrentState,
    dominantState,
    bands: museFftAnalysis?.bandPowers || [],
    surveyContext: createSurveyContextPayload(surveyResult, surveyAnswers, 'muse-hybrid'),
    measurementDurationSec: selectedMeasurementDurationSec,
    eegUploadStats,
    measuredAt,
  };
};
