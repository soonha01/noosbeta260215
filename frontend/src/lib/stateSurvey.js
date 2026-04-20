const PANAS_1_TO_5_OPTIONS = [
  { value: 1, label: '전혀 아니다' },
  { value: 2, label: '조금 그렇다' },
  { value: 3, label: '보통이다' },
  { value: 4, label: '꽤 그렇다' },
  { value: 5, label: '매우 그렇다' },
];

const STAI_1_TO_4_OPTIONS = [
  { value: 1, label: '전혀 아니다' },
  { value: 2, label: '약간 그렇다' },
  { value: 3, label: '상당히 그렇다' },
  { value: 4, label: '매우 그렇다' },
];

const KSS_1_TO_9_OPTIONS = [
  { value: 1, label: '매우 또렷함' },
  { value: 2, label: '또렷함' },
  { value: 3, label: '약간 또렷함' },
  { value: 4, label: '보통' },
  { value: 5, label: '약간 졸림' },
  { value: 6, label: '졸림' },
  { value: 7, label: '매우 졸림' },
  { value: 8, label: '몹시 졸림' },
  { value: 9, label: '잠들기 직전' },
];

const MENTAL_EFFORT_1_TO_9_OPTIONS = [
  { value: 1, label: '매우 매우 낮음' },
  { value: 2, label: '매우 낮음' },
  { value: 3, label: '낮음' },
  { value: 4, label: '약간 낮음' },
  { value: 5, label: '보통' },
  { value: 6, label: '약간 높음' },
  { value: 7, label: '높음' },
  { value: 8, label: '매우 높음' },
  { value: 9, label: '매우 매우 높음' },
];

const ATTENTIVENESS_ITEMS = [
  { key: 'attn_alert', label: '지금 이 순간, 나는 또렷하게 깨어 있다.' },
  { key: 'attn_attentive', label: '지금 이 순간, 나는 주의가 잘 모인다.' },
  { key: 'attn_concentrating', label: '지금 이 순간, 나는 집중 상태에 들어갈 준비가 되어 있다.' },
  { key: 'attn_determined', label: '지금 이 순간, 나는 할 일을 붙잡고 밀어갈 수 있을 것 같다.' },
];

const SERENITY_ITEMS = [
  { key: 'serenity_calm', label: '지금 이 순간, 나는 차분하다.' },
  { key: 'serenity_relaxed', label: '지금 이 순간, 나는 몸과 마음이 이완되어 있다.' },
  { key: 'serenity_at_ease', label: '지금 이 순간, 나는 편안하다.' },
];

const STAI6_ITEMS = [
  { key: 'stai_calm', label: '지금 이 순간, 나는 차분하다.', reverseScored: true },
  { key: 'stai_tense', label: '지금 이 순간, 나는 긴장되어 있다.', reverseScored: false },
  { key: 'stai_upset', label: '지금 이 순간, 나는 마음이 흔들리거나 불편하다.', reverseScored: false },
  { key: 'stai_relaxed', label: '지금 이 순간, 나는 편안하게 풀려 있다.', reverseScored: true },
  { key: 'stai_content', label: '지금 이 순간, 나는 만족스럽고 안정적이다.', reverseScored: true },
  { key: 'stai_worried', label: '지금 이 순간, 나는 걱정이 많다.', reverseScored: false },
];

const FATIGUE_ITEMS = [
  { key: 'fatigue_sleepy', label: '지금 이 순간, 나는 졸리다.' },
  { key: 'fatigue_tired', label: '지금 이 순간, 나는 피곤하다.' },
  { key: 'fatigue_sluggish', label: '지금 이 순간, 나는 머리 회전이 둔하다.' },
  { key: 'fatigue_drowsy', label: '지금 이 순간, 나는 쉽게 가라앉을 것 같다.' },
];

const KSS_ITEM = [
  {
    key: 'kss_sleepiness',
    label: '지금 이 순간, 얼마나 졸리거나 각성되어 있나요?',
  },
];

const MENTAL_EFFORT_ITEM = [
  {
    key: 'mental_effort',
    label: '지금 이 순간, 머리가 감당하고 있는 정신적 노력량은 어느 정도인가요?',
  },
];

export const STATE_SURVEY_HEADER_TITLE = 'AI 상태 인식을 위한 설문을 진행합니다.';
export const STATE_SURVEY_HEADER_SUBTITLE =
  'STAI-6, PANAS-X, KSS, Paas mental effort 기반의 현재 상태 설문입니다.';
export const STATE_SURVEY_METHOD_NOTE =
  '본 결과는 STAI-6, PANAS-X 하위척도, KSS, Paas mental effort를 조합한 비의료적 상태 추정입니다.';

export const STATE_SURVEY_SECTIONS = [
  {
    id: 'attentiveness',
    kicker: 'PANAS-X Attentiveness (4)',
    title: '주의집중 준비도',
    description: '지금 이 순간의 주의집중과 진입 준비 상태를 선택해 주세요.',
    options: PANAS_1_TO_5_OPTIONS,
    questions: ATTENTIVENESS_ITEMS,
  },
  {
    id: 'serenity',
    kicker: 'PANAS-X Serenity (3)',
    title: '이완/안정 수준',
    description: '몸과 마음이 얼마나 차분하고 편안한지 선택해 주세요.',
    options: PANAS_1_TO_5_OPTIONS,
    questions: SERENITY_ITEMS,
  },
  {
    id: 'stai6',
    kicker: 'STAI-6 (6)',
    title: '긴장/불안 상태',
    description: '지금 이 순간의 긴장과 걱정 강도를 선택해 주세요.',
    options: STAI_1_TO_4_OPTIONS,
    questions: STAI6_ITEMS.map((item) => ({
      key: item.key,
      label: item.label,
    })),
  },
  {
    id: 'fatigue',
    kicker: 'PANAS-X Fatigue (4)',
    title: '피로/졸림 신호',
    description: '지금 느끼는 피로와 둔화 정도를 선택해 주세요.',
    options: PANAS_1_TO_5_OPTIONS,
    questions: FATIGUE_ITEMS,
  },
  {
    id: 'kss',
    kicker: 'KSS (1)',
    title: '즉시 각성 수준',
    description: '현재 졸림 정도를 가장 가까운 단계로 선택해 주세요.',
    options: KSS_1_TO_9_OPTIONS,
    questions: KSS_ITEM,
  },
  {
    id: 'mental_effort',
    kicker: 'Paas Mental Effort (1)',
    title: '주관적 정신 부하',
    description: '현재 머리가 쓰고 있는 정신적 노력량을 선택해 주세요.',
    options: MENTAL_EFFORT_1_TO_9_OPTIONS,
    questions: MENTAL_EFFORT_ITEM,
  },
];

export const STATE_SURVEY_TOTAL_ITEMS = STATE_SURVEY_SECTIONS.reduce(
  (count, section) => count + section.questions.length,
  0
);

export const createInitialStateSurveyAnswers = () => {
  const entries = STATE_SURVEY_SECTIONS.flatMap((section) =>
    section.questions.map((question) => [question.key, null])
  );
  return Object.fromEntries(entries);
};

export const countAnsweredStateSurvey = (answers) => {
  return STATE_SURVEY_SECTIONS.reduce((count, section) => {
    return (
      count +
      section.questions.reduce((sectionCount, question) => {
        return sectionCount + (answers[question.key] !== null ? 1 : 0);
      }, 0)
    );
  }, 0);
};

const STAI_REVERSE_KEYS = STAI6_ITEMS.filter((item) => item.reverseScored).map((item) => item.key);
const STAI_DIRECT_KEYS = STAI6_ITEMS.filter((item) => !item.reverseScored).map((item) => item.key);
const ATTENTION_KEYS = ATTENTIVENESS_ITEMS.map((item) => item.key);
const SERENITY_KEYS = SERENITY_ITEMS.map((item) => item.key);
const FATIGUE_KEYS = FATIGUE_ITEMS.map((item) => item.key);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toNumber = (value, fallback) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const normalizeRange = (score, min, max) => clamp((score - min) / Math.max(1, max - min), 0, 1);

const sumKeys = (answers, keys, fallback) =>
  keys.reduce((sum, key) => sum + toNumber(answers[key], fallback), 0);

const percentOf = (value) => Math.round(clamp(value, 0, 1) * 100);

const getBandLevel = (score) => {
  if (score < 0.2) return { key: 'very_low', label: '매우 낮음' };
  if (score < 0.4) return { key: 'low', label: '낮음' };
  if (score < 0.6) return { key: 'moderate', label: '중간' };
  if (score < 0.8) return { key: 'elevated', label: '높음' };
  return { key: 'high', label: '매우 높음' };
};

const buildAxisDetail = (axis, score) => {
  const level = getBandLevel(score).key;

  switch (axis) {
    case 'focus_readiness':
      if (level === 'high' || level === 'elevated') {
        return '집중 상태로 진입하고 유지하기에 유리한 상태입니다.';
      }
      if (level === 'moderate') {
        return '집중은 가능하지만 외부 자극이나 피로의 영향을 받을 수 있습니다.';
      }
      return '집중 진입 전 안정화나 각성 보정이 먼저 필요한 상태입니다.';
    case 'stress_load':
      if (level === 'high' || level === 'elevated') {
        return '긴장과 걱정 신호가 커서 먼저 안정화가 필요한 상태입니다.';
      }
      if (level === 'moderate') {
        return '긴장 신호가 일부 존재하지만 통제 가능한 범위입니다.';
      }
      return '긴장/불안 신호가 상대적으로 낮은 상태입니다.';
    case 'fatigue_risk':
      if (level === 'high' || level === 'elevated') {
        return '졸림과 둔화가 누적되어 회복 우선 신호가 큽니다.';
      }
      if (level === 'moderate') {
        return '피로가 쌓이기 시작한 구간으로 보입니다.';
      }
      return '즉시적인 피로 위험은 낮은 편입니다.';
    case 'relaxation_level':
      if (level === 'high' || level === 'elevated') {
        return '신체와 정서가 비교적 차분하고 안정적인 상태입니다.';
      }
      if (level === 'moderate') {
        return '안정감은 있으나 긴장 완화 여지가 남아 있습니다.';
      }
      return '이완감이 낮고 몸과 마음이 경직되어 있을 수 있습니다.';
    case 'cortical_arousal':
      if (level === 'high' || level === 'elevated') {
        return '각성 수준이 충분하여 반응성과 시작 속도가 좋은 상태입니다.';
      }
      if (level === 'moderate') {
        return '과도하게 낮지도 높지도 않은 중간 각성 구간입니다.';
      }
      return '각성 수준이 낮아 속도와 반응성이 떨어질 수 있습니다.';
    case 'mental_workload':
      if (level === 'high' || level === 'elevated') {
        return '현재 머리가 감당하는 정신 부하가 큰 상태입니다.';
      }
      if (level === 'moderate') {
        return '정신 부하가 존재하지만 아직 관리 가능한 수준입니다.';
      }
      return '정신 부하는 상대적으로 낮은 편입니다.';
    default:
      return '현재 상태를 정량화한 결과입니다.';
  }
};

const formatRatio = (score, max) => `${score}/${max}`;

export const buildStateSurveyAnalysis = (answers) => {
  const attentionScore = sumKeys(answers, ATTENTION_KEYS, 3);
  const serenityScore = sumKeys(answers, SERENITY_KEYS, 3);
  const fatigueScore = sumKeys(answers, FATIGUE_KEYS, 3);
  const kssScore = toNumber(answers.kss_sleepiness, 5);
  const mentalEffortScore = toNumber(answers.mental_effort, 5);

  const staiDirect = sumKeys(answers, STAI_DIRECT_KEYS, 2);
  const staiReverse = STAI_REVERSE_KEYS.reduce(
    (sum, key) => sum + (5 - toNumber(answers[key], 2)),
    0
  );
  const staiScore = staiDirect + staiReverse;

  const attentionNorm = normalizeRange(attentionScore, 4, 20);
  const serenityNorm = normalizeRange(serenityScore, 3, 15);
  const fatigueNorm = normalizeRange(fatigueScore, 4, 20);
  const staiNorm = normalizeRange(staiScore, 6, 24);
  const sleepinessNorm = normalizeRange(kssScore, 1, 9);
  const wakefulnessNorm = 1 - sleepinessNorm;
  const effortNorm = normalizeRange(mentalEffortScore, 1, 9);

  const canonicalState = {
    focus_readiness: clamp(
      attentionNorm * 0.4 +
        wakefulnessNorm * 0.25 +
        serenityNorm * 0.15 +
        (1 - staiNorm) * 0.1 +
        (1 - effortNorm) * 0.1,
      0,
      1
    ),
    stress_load: clamp(staiNorm * 0.65 + (1 - serenityNorm) * 0.25 + effortNorm * 0.1, 0, 1),
    fatigue_risk: clamp(fatigueNorm * 0.5 + sleepinessNorm * 0.35 + (1 - attentionNorm) * 0.15, 0, 1),
    relaxation_level: clamp(serenityNorm * 0.6 + (1 - staiNorm) * 0.25 + (1 - effortNorm) * 0.15, 0, 1),
    cortical_arousal: clamp(
      wakefulnessNorm * 0.45 + attentionNorm * 0.25 + (1 - fatigueNorm) * 0.15 + effortNorm * 0.15,
      0,
      1
    ),
    mental_workload: clamp(effortNorm * 0.5 + staiNorm * 0.25 + (1 - serenityNorm) * 0.15 + attentionNorm * 0.1, 0, 1),
  };

  const focusReadiness = percentOf(canonicalState.focus_readiness);
  const stressLoad = percentOf(canonicalState.stress_load);
  const fatigueRisk = percentOf(canonicalState.fatigue_risk);
  const relaxationLevel = percentOf(canonicalState.relaxation_level);
  const corticalArousal = percentOf(canonicalState.cortical_arousal);
  const mentalWorkload = percentOf(canonicalState.mental_workload);

  let title = '균형 조정 상태';
  let summary = '집중, 각성, 긴장, 피로가 혼합된 중간 구간으로 보입니다.';

  if (fatigueRisk >= 68 && corticalArousal <= 42) {
    title = '저각성 피로 상태';
    summary = '졸림과 피로 신호가 커서 먼저 각성 회복이 필요한 상태입니다.';
  } else if (stressLoad >= 65 && mentalWorkload >= 60) {
    title = '긴장 기반 과부하 상태';
    summary = '긴장과 정신 부하가 함께 높아 안정화 후 집중 전환이 필요한 상태입니다.';
  } else if (relaxationLevel >= 70 && stressLoad <= 35 && focusReadiness >= 55) {
    title = '안정 집중 가능 상태';
    summary = '차분함과 주의집중이 함께 확보되어 비교적 안정적으로 몰입 가능한 상태입니다.';
  } else if (focusReadiness >= 72 && stressLoad <= 38 && fatigueRisk <= 35) {
    title = '딥워크 준비 상태';
    summary = '집중 준비도와 각성이 좋고 부담 신호가 낮아 깊은 몰입으로 넘어가기 좋은 상태입니다.';
  } else if (relaxationLevel >= 75 && mentalWorkload <= 40) {
    title = '회복 친화 상태';
    summary = '긴장보다 이완이 우세하며 회복, 정리, 전환에 적합한 상태입니다.';
  } else if (mentalWorkload >= 60) {
    title = '인지 부하 상태';
    summary = '머리가 감당하는 정신적 노력량이 높아 단순화나 정돈이 필요한 상태입니다.';
  } else if (stressLoad >= 55) {
    title = '정서 긴장 상태';
    summary = '긴장과 걱정 신호가 비교적 높아 안정화 처방이 우선인 상태입니다.';
  } else if (focusReadiness >= 58) {
    title = '집중 진입 가능 상태';
    summary = '즉시 집중으로 넘어갈 수 있으나 피로와 긴장 변화는 계속 점검할 필요가 있습니다.';
  }

  const conclusion =
    `주의집중 ${formatRatio(attentionScore, 20)}, 이완 ${formatRatio(serenityScore, 15)}, ` +
    `STAI-6 ${formatRatio(staiScore, 24)}, 피로 ${formatRatio(fatigueScore, 20)}, ` +
    `KSS ${formatRatio(kssScore, 9)}, 정신노력 ${formatRatio(mentalEffortScore, 9)}로 나타났습니다. ` +
    `이를 AI 엔진 상태 벡터로 변환하면 집중 준비도 ${focusReadiness}/100, 스트레스 부하 ${stressLoad}/100, ` +
    `피로 위험 ${fatigueRisk}/100, 이완 수준 ${relaxationLevel}/100, 각성 수준 ${corticalArousal}/100, ` +
    `정신 부하 ${mentalWorkload}/100이며, 최종적으로 '${title}' 패턴으로 해석됩니다.`;

  return {
    title,
    description: summary,
    summary,
    conclusion,
    dimensions: [
      {
        key: 'focus_readiness',
        label: '집중 준비도',
        scoreText: `${focusReadiness}/100`,
        levelText: getBandLevel(canonicalState.focus_readiness).label,
        detailText: buildAxisDetail('focus_readiness', canonicalState.focus_readiness),
      },
      {
        key: 'stress_load',
        label: '스트레스 부하',
        scoreText: `${stressLoad}/100`,
        levelText: getBandLevel(canonicalState.stress_load).label,
        detailText: buildAxisDetail('stress_load', canonicalState.stress_load),
      },
      {
        key: 'fatigue_risk',
        label: '피로 위험',
        scoreText: `${fatigueRisk}/100`,
        levelText: getBandLevel(canonicalState.fatigue_risk).label,
        detailText: buildAxisDetail('fatigue_risk', canonicalState.fatigue_risk),
      },
      {
        key: 'relaxation_level',
        label: '이완 수준',
        scoreText: `${relaxationLevel}/100`,
        levelText: getBandLevel(canonicalState.relaxation_level).label,
        detailText: buildAxisDetail('relaxation_level', canonicalState.relaxation_level),
      },
      {
        key: 'cortical_arousal',
        label: '각성 수준',
        scoreText: `${corticalArousal}/100`,
        levelText: getBandLevel(canonicalState.cortical_arousal).label,
        detailText: buildAxisDetail('cortical_arousal', canonicalState.cortical_arousal),
      },
      {
        key: 'mental_workload',
        label: '정신 부하',
        scoreText: `${mentalWorkload}/100`,
        levelText: getBandLevel(canonicalState.mental_workload).label,
        detailText: buildAxisDetail('mental_workload', canonicalState.mental_workload),
      },
    ],
    keyIndicators: [
      `주의집중 ${formatRatio(attentionScore, 20)}`,
      `이완 ${formatRatio(serenityScore, 15)}`,
      `STAI-6 ${formatRatio(staiScore, 24)}`,
      `피로 ${formatRatio(fatigueScore, 20)}`,
      `KSS ${formatRatio(kssScore, 9)}`,
      `정신노력 ${formatRatio(mentalEffortScore, 9)}`,
    ],
    tags: [
      'STAI-6',
      'PANAS-X Attentiveness',
      'PANAS-X Serenity',
      'PANAS-X Fatigue',
      'KSS',
      'Paas Mental Effort',
    ],
    canonicalState,
  };
};
