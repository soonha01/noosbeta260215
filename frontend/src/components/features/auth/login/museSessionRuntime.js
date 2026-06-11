import { LIVE_MUSE_SESSION_STORAGE_KEY } from '../../solar/travel/constants';

export const CURRENT_STATE_STORAGE_KEY = 'noos_current_state';
export const DEVICE_CONNECTION_RESULT = {
  title: 'Muse S Athena Live 준비 완료',
  summary: '음악 세션에서 Muse EEG를 계속 측정하고 5분마다 음악 조정에 반영합니다.',
};
export const DEFAULT_MEASUREMENT_DURATION_SEC = 60;
export const MEASUREMENT_DURATION_OPTIONS = [
  { value: 60, label: '1분', title: 'Quick Check', eegWeight: 35 },
  { value: 600, label: '10분', title: 'Standard', eegWeight: 55 },
  { value: 1800, label: '30분', title: 'Deep Session', eegWeight: 70 },
  { value: 3600, label: '1시간', title: 'Long Baseline', eegWeight: 80 },
];
export const EEG_SAMPLE_RATE = 256;
export const MAX_LOCAL_EEG_ANALYSIS_BUFFER_SEC = 600;
export const EEG_UI_WINDOW_SEC = 12;
export const MAX_EEG_UI_BUFFER_SIZE = EEG_SAMPLE_RATE * EEG_UI_WINDOW_SEC;
export const EEG_UI_FLUSH_INTERVAL_MS = 50;
export const LIVE_MUSE_BASELINE_DURATION_SEC = 60;
export const LIVE_MUSE_ANALYSIS_INTERVAL_SEC = 300;
export const LIVE_MUSE_CSV_TEST_BASELINE_SEC = 6;
export const LIVE_MUSE_CSV_TEST_ANALYSIS_INTERVAL_SEC = 30;
export const LIVE_MUSE_CROSSFADE_DURATION_SEC = 5;
export const LIVE_MUSE_FEEDBACK_CADENCE_SEC = 900;

export const formatMeasurementClock = (seconds) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
};

export const formatMeasurementDurationText = (seconds) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;

  if (minutes && remainder) {
    return `${minutes}분 ${remainder}초`;
  }

  if (minutes) {
    return `${minutes}분`;
  }

  return `${remainder}초`;
};

export const getMaxLocalEegBufferSize = (durationSec) =>
  EEG_SAMPLE_RATE * Math.min(durationSec, MAX_LOCAL_EEG_ANALYSIS_BUFFER_SEC) + 512;

export const createSurveyContextPayload = (surveyResult, surveyAnswers, mode = 'survey') => ({
  mode,
  source: 'state-survey',
  answers: surveyAnswers,
  title: surveyResult?.title || null,
  summary: surveyResult?.summary || null,
  conclusion: surveyResult?.conclusion || null,
  dimensions: surveyResult?.dimensions || [],
  keyIndicators: surveyResult?.keyIndicators || [],
  canonicalState: surveyResult?.canonicalState || null,
});

export const LIVE_MUSE_NEUTRAL_STATE = Object.freeze({
  focus_readiness: 0.5,
  stress_load: 0.45,
  fatigue_risk: 0.35,
  relaxation_level: 0.5,
  cortical_arousal: 0.5,
  mental_workload: 0.45,
});

export const createLiveMuseSessionPayload = (createdAt, overrides = {}) => ({
  enabled: true,
  deviceType: 'Muse S Athena',
  status: 'pending_player_connection',
  createdAt,
  baselineDurationSec: LIVE_MUSE_BASELINE_DURATION_SEC,
  analysisIntervalSec: LIVE_MUSE_ANALYSIS_INTERVAL_SEC,
  analysisWindowSec: LIVE_MUSE_ANALYSIS_INTERVAL_SEC,
  transitionMode: 'crossfade',
  crossfadeDurationSec: LIVE_MUSE_CROSSFADE_DURATION_SEC,
  feedbackCadenceSec: LIVE_MUSE_FEEDBACK_CADENCE_SEC,
  ...overrides,
});

export const saveLiveMuseSessionPreference = (payload) => {
  try {
    window.localStorage.setItem(LIVE_MUSE_SESSION_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to save live Muse session preference:', error);
  }
};

export const saveCurrentStateSnapshot = (payload) => {
  try {
    window.localStorage.setItem(CURRENT_STATE_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to save current state snapshot:', error);
  }
};
