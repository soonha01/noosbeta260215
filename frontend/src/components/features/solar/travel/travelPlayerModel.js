export const AXIS_LABELS = {
  focus_readiness: 'Focus',
  stress_load: 'Stress',
  fatigue_risk: 'Fatigue',
  relaxation_level: 'Relax',
  cortical_arousal: 'Arousal',
  mental_workload: 'Workload',
};

export const AXIS_EXPLANATIONS = {
  focus_readiness: '몰입 진입 준비',
  stress_load: '완화할 긴장량',
  fatigue_risk: '지속 방해 피로',
};

export const LIVE_MUSE_STATUS_LABELS = {
  off: 'Muse live off',
  pending: 'Muse 연결 대기',
  connecting: 'Muse 연결 중',
  calibrating: '기준선 수집 중',
  active: 'Muse live active',
  analyzing: '최근 5분 분석 중',
  error: 'Muse 연결 오류',
};

export const LIVE_EEG_CHANNELS = [
  { key: 'TP9', color: '#7fe3ff' },
  { key: 'AF7', color: '#ff7fd1' },
  { key: 'AF8', color: '#efff72' },
  { key: 'TP10', color: '#52ff9a' },
];

export const LIVE_EEG_CHART_WIDTH = 420;
export const LIVE_EEG_CHART_HEIGHT = 188;
export const LIVE_EEG_CHART_MARGIN = { top: 16, right: 14, bottom: 20, left: 48 };
export const LIVE_EEG_RENDER_POINT_COUNT = 96;

export const PLAYER_SESSION_GUIDE_STEPS = [
  '뇌파 측정 중 몸을 많이 움직이면 신호가 흔들려 정확성이 떨어질 수 있으니 자세와 머리 움직임을 안정적으로 유지하세요.',
  'Muse S Athena가 머리에 적절히 고정될 만큼의 강도로 조여져 있는지 확인하세요. 너무 느슨하면 센서 접촉이 불안정해질 수 있습니다.',
];

export const DEFAULT_SESSION_GUIDE_COPY = '세션 시작 전에 착용 상태와 측정 자세를 확인합니다.';

export const getPlanetSpinDurationSec = (planetTitle) => {
  const key = String(planetTitle || '').trim().toLowerCase();

  switch (key) {
    case 'mercury':
      return 12;
    case 'venus':
      return 14;
    case 'earth':
      return 13;
    case 'mars':
      return 15;
    case 'jupiter':
      return 17;
    case 'saturn':
      return 16;
    case 'uranus':
      return 18;
    case 'neptune':
      return 19;
    case 'pluto':
      return 20;
    default:
      return 15;
  }
};

export const formatAxisName = (key) => AXIS_LABELS[key] || key;

export const getAxisExplanation = (key) => AXIS_EXPLANATIONS[key] || '';

export const toPercent = (value) => `${Math.round(Number(value || 0) * 100)}%`;

export const getLiveMuseStatusLabel = (status) => LIVE_MUSE_STATUS_LABELS[status] || status;

export const getSessionGuideCopy = (generatedJourney) => {
  const llmCoach = generatedJourney?.llmSessionCoach?.output || null;
  return llmCoach?.focus_frame || llmCoach?.success_signal || DEFAULT_SESSION_GUIDE_COPY;
};

export const buildAxisCards = (keys, axes, { includeBody = false } = {}) =>
  keys.map((key) => ({
    key,
    label: formatAxisName(key),
    value: toPercent(axes?.[key]),
    ...(includeBody ? { body: getAxisExplanation(key) } : {}),
  }));

export const buildCurrentStateCards = (axes) =>
  buildAxisCards(['focus_readiness', 'stress_load', 'fatigue_risk'], axes, { includeBody: true });

export const buildTargetStateCards = (axes) =>
  buildAxisCards(['focus_readiness', 'relaxation_level', 'cortical_arousal'], axes);

export const formatPhaseGoals = (phase) => {
  const goals = Array.isArray(phase?.goals) ? phase.goals : [];
  return goals.join(' · ') || '세션 목표를 정렬하는 중입니다.';
};

export const buildFallbackPhases = (planetMedia, durationSec) => [
  {
    name: 'Entry',
    duration_sec: Math.round((durationSec || 90) * 0.28),
    goals: [`${planetMedia.title} 목표 상태로 진입`],
  },
  {
    name: 'Immersion',
    duration_sec: Math.round((durationSec || 90) * 0.44),
    goals: [planetMedia.moodTarget],
  },
  {
    name: 'Return',
    duration_sec: Math.round((durationSec || 90) * 0.28),
    goals: ['감각 안정화'],
  },
];

export const buildSessionRows = (transitionPhases, planetMedia, durationSec) => {
  const phases = transitionPhases.length ? transitionPhases : buildFallbackPhases(planetMedia, durationSec);
  return phases.map((phase, index) => ({
    id: `${phase.name}-${index}`,
    title: phase.name || `Phase ${index + 1}`,
    body: formatPhaseGoals(phase),
    duration: `${Math.round(Number(phase.duration_sec || 0))}s`,
  }));
};

export const getLiveReadingValue = (reading, channelKey) => {
  const channelIndex = LIVE_EEG_CHANNELS.findIndex((channel) => channel.key === channelKey);
  const value =
    reading?.channels?.[channelKey] ??
    reading?.raw?.[channelKey] ??
    (channelIndex >= 0 ? reading?.samples?.[channelIndex] : null);
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const buildLiveWaveSeries = (readings) => {
  const safeReadings = Array.isArray(readings) ? readings : [];
  const stride = Math.max(1, Math.ceil(safeReadings.length / LIVE_EEG_RENDER_POINT_COUNT));
  const chartReadings = safeReadings.filter((_, index) => index % stride === 0).slice(-LIVE_EEG_RENDER_POINT_COUNT);

  return LIVE_EEG_CHANNELS.map((channel) => ({
    ...channel,
    samples: chartReadings.map((reading) => getLiveReadingValue(reading, channel.key)),
  }));
};

export const createLiveWavePath = ({ samples, baselineY, rowAmplitude, amplitude, plotLeft, plotWidth }) => {
  if (!samples.length) return '';
  const lastIndex = Math.max(1, samples.length - 1);

  return samples
    .map((sample, index) => {
      const x = plotLeft + (index / lastIndex) * plotWidth;
      const y = baselineY - (sample / amplitude) * rowAmplitude;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
};

export const buildLiveWaveChartMetrics = (readings, series) => {
  const sampleCount = Array.isArray(readings) ? readings.length : 0;
  const allSamples = series.flatMap((channel) => channel.samples);
  const amplitude = Math.max(1, ...allSamples.map((sample) => Math.abs(sample)));
  const latestReading = Array.isArray(readings) && readings.length ? readings[readings.length - 1] : null;
  const latestTp9 = latestReading ? getLiveReadingValue(latestReading, 'TP9') : 0;
  const plotLeft = LIVE_EEG_CHART_MARGIN.left;
  const plotTop = LIVE_EEG_CHART_MARGIN.top;
  const plotWidth = LIVE_EEG_CHART_WIDTH - LIVE_EEG_CHART_MARGIN.left - LIVE_EEG_CHART_MARGIN.right;
  const plotHeight = LIVE_EEG_CHART_HEIGHT - LIVE_EEG_CHART_MARGIN.top - LIVE_EEG_CHART_MARGIN.bottom;
  const rowHeight = plotHeight / LIVE_EEG_CHANNELS.length;
  const rowAmplitude = rowHeight * 0.34;

  return {
    sampleCount,
    amplitude,
    latestTp9,
    plotLeft,
    plotTop,
    plotWidth,
    plotHeight,
    rowHeight,
    rowAmplitude,
  };
};
