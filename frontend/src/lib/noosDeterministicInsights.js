const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const MIN_SESSION_DURATION_SEC = 10;
const MAX_SESSION_DURATION_SEC = 600;

const normalizeSessionDurationSec = (value, fallback = 90) => {
  const numeric = Number(value);
  const fallbackNumeric = Number(fallback);
  const safeValue = Number.isFinite(numeric) ? numeric : fallbackNumeric;
  const rounded = Math.round(Number.isFinite(safeValue) ? safeValue : 90);
  return Math.min(MAX_SESSION_DURATION_SEC, Math.max(MIN_SESSION_DURATION_SEC, rounded));
};

const STATE_AXIS_LABELS = {
  focus_readiness: '집중 준비도',
  stress_load: '긴장 부하',
  fatigue_risk: '피로 가능성',
  relaxation_level: '이완 수준',
  cortical_arousal: '각성도',
  mental_workload: '인지 부하',
};

const PLANET_BY_NEED = [
  { planet: 'mercury', tokens: ['빠르게', '정리', '짧게', '전환', '기민'] },
  { planet: 'venus', tokens: ['안정', '회복', '편안', '부드럽', '감정'] },
  { planet: 'earth', tokens: ['균형', '루틴', '차분', '일상', '기본'] },
  { planet: 'mars', tokens: ['집중', '논문', '작업', '몰입', '생산'] },
  { planet: 'jupiter', tokens: ['확장', '기획', '아이디어', '창의', '전략'] },
  { planet: 'saturn', tokens: ['구조', '계획', '검토', '집요', '완성'] },
  { planet: 'uranus', tokens: ['새로운', '실험', '전환', '탐색', '창발'] },
  { planet: 'neptune', tokens: ['수면', '명상', '이완', '상상', '휴식'] },
];

const normalizeHistory = (feedbackHistory) => (Array.isArray(feedbackHistory) ? feedbackHistory : []);

const topStateAxes = (currentState = {}, limit = 3) =>
  Object.entries(currentState || {})
    .map(([key, value]) => [key, Number(value)])
    .filter(([, value]) => Number.isFinite(value))
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([key, value]) => ({
      key,
      label: STATE_AXIS_LABELS[key] || key.replaceAll('_', ' '),
      value,
    }));

const intentTokens = (intentText = '') =>
  String(intentText)
    .toLowerCase()
    .split(/[^a-z0-9가-힣]+/u)
    .filter(Boolean);

const inferPlanetFromIntent = (intentText, fallbackPlanet = 'earth') => {
  const tokens = intentTokens(intentText);
  const scored = PLANET_BY_NEED.map((entry) => ({
    planet: entry.planet,
    score: entry.tokens.reduce(
      (total, token) => total + (tokens.some((item) => item.includes(token) || token.includes(item)) ? 1 : 0),
      0
    ),
  })).sort((left, right) => right.score - left.score);

  return scored[0]?.score > 0 ? scored[0].planet : String(fallbackPlanet || 'earth').toLowerCase();
};

export const buildStateBrief = ({
  title,
  stateLabel,
  summary,
  currentState,
  targetPlanet,
} = {}) => {
  const axes = topStateAxes(currentState);
  const axisCopy = axes.length
    ? axes.map((axis) => `${axis.label} ${Math.round(axis.value * 100)}%`).join(', ')
    : '상태 축 데이터가 아직 충분하지 않습니다';

  return {
    task: 'state-brief',
    response_source: 'local-deterministic',
    cached: false,
    output: {
      headline: title || stateLabel || '현재 상태 요약',
      summary: summary || `${axisCopy} 기준으로 현재 세션 출발점을 정리했습니다.`,
      key_axes: axes,
      target_planet: targetPlanet || null,
      caution: '이 요약은 NOOS 입력값을 정리한 참고 정보이며 진단이나 치료 판단이 아닙니다.',
    },
  };
};

export const buildPlanetRecommendation = ({
  intentText,
  desiredOutcome,
  memoText,
  currentState,
  feedbackHistory,
  requestedDurationSec,
  fallbackPlanet = 'earth',
} = {}) => {
  const recommendedPlanet = inferPlanetFromIntent(`${intentText || ''} ${desiredOutcome || ''}`, fallbackPlanet);
  const history = normalizeHistory(feedbackHistory);
  const averageRating = history.length
    ? history.reduce((total, item) => total + Number(item?.rating || 0), 0) / history.length
    : 0;
  const axes = topStateAxes(currentState, 2);
  const durationSec = normalizeSessionDurationSec(requestedDurationSec, 300);
  const tags = intentTokens(`${intentText || ''} ${memoText || ''}`).slice(0, 4);

  return {
    task: 'planet-recommendation',
    response_source: 'local-deterministic',
    cached: false,
    output: {
      recommended_planet: recommendedPlanet,
      recommended_duration_sec: durationSec,
      confidence: clamp(0.58 + Math.min(0.24, tags.length * 0.04) + (averageRating >= 4 ? 0.08 : 0)),
      headline: `${recommendedPlanet.toUpperCase()} 세션이 현재 목적에 가장 가깝습니다.`,
      summary: desiredOutcome || intentText || '현재 입력을 기준으로 다음 세션 방향을 정리했습니다.',
      intent_tags: tags,
      key_axes: axes,
      justification: [
        axes.length ? `${axes[0].label} 축을 우선 반영했습니다.` : '명시된 목적을 우선 반영했습니다.',
        history.length ? `최근 피드백 ${history.length}건을 함께 고려했습니다.` : '최근 피드백이 없어서 현재 입력 중심으로 계산했습니다.',
      ],
    },
  };
};

export const buildSessionGuide = ({
  planet,
  intentText,
  recommendation,
  recommendedDurationSec,
} = {}) => {
  const durationSec = normalizeSessionDurationSec(recommendedDurationSec, 300);
  const planetName = String(planet || recommendation?.recommended_planet || 'earth').toUpperCase();

  return {
    task: 'session-guide',
    response_source: 'local-deterministic',
    cached: false,
    output: {
      session_prompt: `${planetName} ${Math.round(durationSec / 60)}분 세션으로 시작하세요.`,
      focus_frame: intentText || '세션 목표를 한 문장으로 정하고 첫 1분은 호흡과 자세를 안정화합니다.',
      setup_steps: [
        '재생 전 착용감과 주변 조도를 확인합니다.',
        '첫 페이즈에서는 움직임을 줄이고 현재 상태를 관찰합니다.',
        '불편감이 있으면 세션을 중단하고 기본 조명으로 복귀합니다.',
      ],
      caution: '세션 가이드는 사용자가 입력한 목적과 상태값을 정리한 참고 정보입니다.',
    },
  };
};

export const buildDashboardSummary = ({
  feedbackHistory,
  memoText,
  currentState,
} = {}) => {
  const history = normalizeHistory(feedbackHistory);
  const axes = topStateAxes(currentState);
  const averageRating = history.length
    ? history.reduce((total, item) => total + Number(item?.rating || 0), 0) / history.length
    : 0;
  const preferredPlanets = [...new Set(history.map((item) => item?.planet).filter(Boolean))].slice(0, 3);
  const memoTags = intentTokens(memoText).slice(0, 5);

  return {
    task: 'dashboard-summary',
    response_source: 'local-deterministic',
    cached: false,
    output: {
      headline: history.length ? `최근 ${history.length}개 세션 평균 ${averageRating.toFixed(1)}점` : '세션 기록을 기다리는 중',
      summary: memoText || '피드백과 메모가 쌓이면 선호 행성과 조정 방향을 이곳에 정리합니다.',
      preferred_planets: preferredPlanets,
      memo_tags: memoTags,
      key_axes: axes,
      next_adjustments: axes.map((axis) => `${axis.label} ${Math.round(axis.value * 100)}% 기준으로 다음 세션 강도를 조절`),
    },
  };
};
