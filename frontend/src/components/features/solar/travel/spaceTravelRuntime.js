export const LIVE_MUSE_BASELINE_SEC = 60;
export const LIVE_MUSE_ANALYSIS_WINDOW_SEC = 300;
export const LIVE_MUSE_ANALYSIS_INTERVAL_MS = LIVE_MUSE_ANALYSIS_WINDOW_SEC * 1000;
export const LIVE_MUSE_CSV_TEST_BASELINE_SEC = 5;
export const LIVE_MUSE_CSV_TEST_ANALYSIS_INTERVAL_MS = 30 * 1000;
export const LIVE_MUSE_CROSSFADE_DURATION_SEC = 5;
export const LIVE_MUSE_FEEDBACK_CADENCE_MS = 15 * 60 * 1000;

export const NEUTRAL_CANONICAL_STATE = {
  focus_readiness: 0.5,
  stress_load: 0.5,
  fatigue_risk: 0.5,
  relaxation_level: 0.5,
  cortical_arousal: 0.5,
  mental_workload: 0.5,
};

export const clamp01 = (value) => Math.max(0, Math.min(1, Number(value) || 0));

export const createLiveMuseSessionFromSharedSnapshot = (snapshot) => {
  if (!snapshot?.isActive) return null;

  const mode = snapshot.mode || 'web';
  const isCsvTest = mode === 'mock';
  const analysisIntervalSec = isCsvTest
    ? Math.round(LIVE_MUSE_CSV_TEST_ANALYSIS_INTERVAL_MS / 1000)
    : Math.round(LIVE_MUSE_ANALYSIS_INTERVAL_MS / 1000);

  return {
    enabled: true,
    deviceType: isCsvTest ? 'CSV Mock Muse' : 'Muse S Athena',
    status: snapshot.status || 'connected',
    startedAt: snapshot.startedAt || snapshot.connectedAt || new Date().toISOString(),
    connectedAt: snapshot.connectedAt || snapshot.startedAt || new Date().toISOString(),
    eegSessionId: snapshot.eegSessionId || null,
    sampleCount: snapshot.sampleCount || 0,
    streamMode: mode,
    testMode: isCsvTest ? 'csv-mock' : null,
    baselineDurationSec: isCsvTest ? LIVE_MUSE_CSV_TEST_BASELINE_SEC : LIVE_MUSE_BASELINE_SEC,
    analysisIntervalSec,
    analysisWindowSec: isCsvTest ? analysisIntervalSec : LIVE_MUSE_ANALYSIS_WINDOW_SEC,
    transitionMode: 'crossfade',
    crossfadeDurationSec: LIVE_MUSE_CROSSFADE_DURATION_SEC,
    feedbackCadenceSec: LIVE_MUSE_FEEDBACK_CADENCE_MS / 1000,
  };
};

export const createEmptyLiveMuseMetrics = () => ({
  sampleCount: 0,
  analysisCount: 0,
  eegSessionId: null,
  lastAnalyzedAt: null,
  nextAnalysisAt: null,
  qualityScore: null,
  latestValue: null,
});

export const resolveLiveMuseAnalysisIntervalMs = (session) =>
  session?.testMode === 'csv-mock' ? LIVE_MUSE_CSV_TEST_ANALYSIS_INTERVAL_MS : LIVE_MUSE_ANALYSIS_INTERVAL_MS;

export const createQueueAction = (reason = 'queue-prefetch', label = '다음 2분 음악을 미리 준비합니다.') => ({
  type: 'queue-prefetch',
  reason,
  label,
  volumeScale: 1,
});

export const getPlanetAdaptationMode = (planetSlug) => {
  if (['venus', 'earth', 'pluto'].includes(planetSlug)) return 'calm';
  if (['mercury', 'mars', 'jupiter', 'neptune'].includes(planetSlug)) return 'focus';
  if (planetSlug === 'saturn') return 'deep';
  return 'balanced';
};

export const resolveAdaptiveMusicAction = ({ currentState, previousState, qualityScore, planetSlug }) => {
  if (qualityScore > 0 && qualityScore < 0.35) {
    return {
      type: 'hold',
      reason: 'low-signal-quality',
      label: '신호 품질이 낮아 음악을 유지합니다.',
      volumeScale: 1,
    };
  }

  const previous = previousState || NEUTRAL_CANONICAL_STATE;
  const focusDelta = clamp01(currentState?.focus_readiness) - clamp01(previous?.focus_readiness);
  const stressDelta = clamp01(currentState?.stress_load) - clamp01(previous?.stress_load);
  const fatigueDelta = clamp01(currentState?.fatigue_risk) - clamp01(previous?.fatigue_risk);
  const relaxationDelta = clamp01(currentState?.relaxation_level) - clamp01(previous?.relaxation_level);
  const movement =
    Math.abs(focusDelta) + Math.abs(stressDelta) + Math.abs(fatigueDelta) + Math.abs(relaxationDelta);
  const mode = getPlanetAdaptationMode(planetSlug);
  const stress = clamp01(currentState?.stress_load);
  const fatigue = clamp01(currentState?.fatigue_risk);
  const focus = clamp01(currentState?.focus_readiness);
  const relaxation = clamp01(currentState?.relaxation_level);

  if (movement < 0.16) {
    return {
      type: 'hold',
      reason: 'stable-state',
      label: '상태 변화가 작아 현재 음악을 유지합니다.',
      volumeScale: 1,
    };
  }

  const shouldChangeTrack =
    movement >= 0.42 ||
    stress >= 0.72 ||
    fatigue >= 0.74 ||
    (mode === 'focus' && focus < 0.38) ||
    (mode === 'calm' && relaxation < 0.36);

  if (shouldChangeTrack) {
    const desiredChange =
      stress >= 0.72 || fatigue >= 0.74 || mode === 'calm'
        ? 'calmer-crossfade'
        : 'focus-crossfade';
    return {
      type: 'crossfade',
      reason: desiredChange,
      label: desiredChange === 'calmer-crossfade'
        ? '긴장/피로 신호가 커져 더 차분한 음악으로 전환합니다.'
        : '집중 신호를 보강하기 위해 새 음악으로 전환합니다.',
      volumeScale: desiredChange === 'calmer-crossfade' ? 0.88 : 1.04,
    };
  }

  return {
    type: 'parameter-adjust',
    reason: mode === 'calm' || stressDelta > 0.08 ? 'soften-current-track' : 'energize-current-track',
    label: mode === 'calm' || stressDelta > 0.08
      ? '현재 트랙을 더 부드럽게 조정합니다.'
      : '현재 트랙의 에너지를 조금 올립니다.',
    volumeScale: mode === 'calm' || stressDelta > 0.08 ? 0.92 : 1.06,
  };
};
