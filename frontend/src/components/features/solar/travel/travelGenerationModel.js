export const DEFAULT_GENERATION_STATUS = 'Session preparing';

export const GENERATION_AXIS_META = [
  {
    key: 'focus_readiness',
    iconKey: 'brain',
    label: 'Focus readiness',
    body: '현재 상태에서 곧바로 몰입으로 들어갈 준비 정도',
    bars: [28, 38, 44, 52, 58, 65, 72, 78],
  },
  {
    key: 'stress_load',
    iconKey: 'activity',
    label: 'Stress load',
    body: '지금 완화가 필요한 긴장과 압박의 크기',
    bars: [74, 68, 62, 58, 54, 48, 42, 36],
  },
  {
    key: 'fatigue_risk',
    iconKey: 'timer',
    label: 'Fatigue risk',
    body: '집중을 방해할 수 있는 피로·졸림 신호',
    bars: [34, 38, 31, 28, 30, 26, 24, 22],
  },
];

export const clampProgressPercent = (value) => Math.max(0, Math.min(100, Number(value) || 0));

export const getActiveGenerationStatus = (statusLines, activeStatusIndex) => {
  const lines = Array.isArray(statusLines) ? statusLines : [];
  const numericIndex = Number(activeStatusIndex);
  const selectedIndex = Math.min(Number.isNaN(numericIndex) ? Number.NaN : numericIndex, lines.length - 1);

  return lines[selectedIndex] || DEFAULT_GENERATION_STATUS;
};

export const buildGenerationMetricCards = (canonicalState) =>
  GENERATION_AXIS_META.map((axis) => {
    const value = Number(canonicalState?.[axis.key] || 0);

    return {
      ...axis,
      percent: `${Math.round(value * 100)}%`,
    };
  });

export const resolveGenerationBackgroundImage = (planetMedia) => planetMedia?.backgroundImage || planetMedia?.image;

export const hasLightingPreview = (planetMedia) => Boolean(planetMedia?.lightingPreview);
