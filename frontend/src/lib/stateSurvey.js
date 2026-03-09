const LIKERT_1_TO_5_OPTIONS = [
  { value: 1, label: '전혀 아니다' },
  { value: 2, label: '약간 그렇다' },
  { value: 3, label: '보통이다' },
  { value: 4, label: '상당히 그렇다' },
  { value: 5, label: '매우 그렇다' },
];

const PSS_0_TO_4_OPTIONS = [
  { value: 0, label: '전혀 없었다' },
  { value: 1, label: '거의 없었다' },
  { value: 2, label: '가끔 있었다' },
  { value: 3, label: '자주 있었다' },
  { value: 4, label: '매우 자주 있었다' },
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

const PANAS_ITEMS = [
  { key: 'pa_interested', label: '지금 이 순간, 나는 흥미를 느끼고 있나요?', polarity: 'positive' },
  { key: 'pa_excited', label: '지금 이 순간, 나는 들뜨거나 기대되는 기분인가요?', polarity: 'positive' },
  { key: 'pa_strong', label: '지금 이 순간, 나는 내적으로 단단하고 강하다고 느끼나요?', polarity: 'positive' },
  { key: 'pa_enthusiastic', label: '지금 이 순간, 나는 열정이 살아 있다고 느끼나요?', polarity: 'positive' },
  { key: 'pa_proud', label: '지금 이 순간, 나는 나 자신이 자랑스럽게 느껴지나요?', polarity: 'positive' },
  { key: 'pa_alert', label: '지금 이 순간, 나는 또렷하고 깨어 있는 상태인가요?', polarity: 'positive' },
  { key: 'pa_inspired', label: '지금 이 순간, 나는 영감이 떠오르는 느낌이 있나요?', polarity: 'positive' },
  { key: 'pa_determined', label: '지금 이 순간, 나는 결심이 분명하고 단호한가요?', polarity: 'positive' },
  { key: 'pa_attentive', label: '지금 이 순간, 나는 주의집중이 잘 되고 있나요?', polarity: 'positive' },
  { key: 'pa_active', label: '지금 이 순간, 나는 활기 있고 에너지가 느껴지나요?', polarity: 'positive' },
  { key: 'na_distressed', label: '지금 이 순간, 나는 괴롭거나 불편한 감정이 있나요?', polarity: 'negative' },
  { key: 'na_upset', label: '지금 이 순간, 나는 마음이 상하거나 흔들린 느낌인가요?', polarity: 'negative' },
  { key: 'na_guilty', label: '지금 이 순간, 나는 죄책감을 느끼고 있나요?', polarity: 'negative' },
  { key: 'na_scared', label: '지금 이 순간, 나는 겁이 나거나 위축되는 느낌인가요?', polarity: 'negative' },
  { key: 'na_hostile', label: '지금 이 순간, 나는 공격적이거나 적대적인 마음이 있나요?', polarity: 'negative' },
  { key: 'na_irritable', label: '지금 이 순간, 나는 예민하고 쉽게 짜증이 나나요?', polarity: 'negative' },
  { key: 'na_ashamed', label: '지금 이 순간, 나는 부끄럽거나 위축된 감정이 있나요?', polarity: 'negative' },
  { key: 'na_nervous', label: '지금 이 순간, 나는 긴장되어 있거나 신경이 곤두서 있나요?', polarity: 'negative' },
  { key: 'na_jittery', label: '지금 이 순간, 나는 안절부절못하고 불안정한가요?', polarity: 'negative' },
  { key: 'na_afraid', label: '지금 이 순간, 나는 두려움을 느끼고 있나요?', polarity: 'negative' },
];

const PSS4_ITEMS = [
  {
    key: 'pss_unexpected',
    label: '지난 7일 동안, 예상치 못한 일이 생겼을 때 당황했다고 느꼈다.',
    reverseScored: false,
  },
  {
    key: 'pss_uncontrollable',
    label: '지난 7일 동안, 중요한 일들을 통제할 수 없다고 느꼈다.',
    reverseScored: false,
  },
  {
    key: 'pss_confident',
    label: '지난 7일 동안, 문제를 처리할 수 있다는 자신감이 있었다.',
    reverseScored: true,
  },
  {
    key: 'pss_things_going_well',
    label: '지난 7일 동안, 일이 내 뜻대로 잘 풀리고 있다고 느꼈다.',
    reverseScored: true,
  },
];

const KSS_ITEM = [
  {
    key: 'kss_sleepiness',
    label: '지금 이 순간, 얼마나 졸리거나 각성되어 있나요?',
  },
];

export const STATE_SURVEY_SECTIONS = [
  {
    id: 'kpanas',
    kicker: 'K-PANAS (20)',
    title: '현재 정서 상태',
    description: '각 문항은 지금 이 순간의 감정 강도를 선택해 주세요.',
    options: LIKERT_1_TO_5_OPTIONS,
    questions: PANAS_ITEMS.map((item) => ({
      key: item.key,
      label: item.label,
    })),
  },
  {
    id: 'kss',
    kicker: 'KSS (1)',
    title: '각성/졸림 수준',
    description: '현재 졸림 정도를 가장 가까운 단계로 선택해 주세요.',
    options: KSS_1_TO_9_OPTIONS,
    questions: KSS_ITEM,
  },
  {
    id: 'pss4',
    kicker: 'PSS-4 (4)',
    title: '인지된 스트레스',
    description: '지난 7일을 기준으로 해당 경험 빈도를 선택해 주세요.',
    options: PSS_0_TO_4_OPTIONS,
    questions: PSS4_ITEMS.map((item) => ({
      key: item.key,
      label: item.label,
    })),
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

const PANAS_POSITIVE_KEYS = PANAS_ITEMS.filter((item) => item.polarity === 'positive').map(
  (item) => item.key
);
const PANAS_NEGATIVE_KEYS = PANAS_ITEMS.filter((item) => item.polarity === 'negative').map(
  (item) => item.key
);
const PSS_DIRECT_KEYS = PSS4_ITEMS.filter((item) => !item.reverseScored).map((item) => item.key);
const PSS_REVERSE_KEYS = PSS4_ITEMS.filter((item) => item.reverseScored).map((item) => item.key);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toNumber = (value, fallback) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const sumKeys = (answers, keys, fallback) =>
  keys.reduce((sum, key) => sum + toNumber(answers[key], fallback), 0);

const getPaLevel = (score) => {
  if (score <= 23) return { key: 'low', label: '낮음', detail: '긍정 정서 활성도가 낮은 편입니다.' };
  if (score <= 36) return { key: 'moderate', label: '중간', detail: '긍정 정서가 평균 범위입니다.' };
  return { key: 'high', label: '높음', detail: '긍정 정서 활성도가 높은 편입니다.' };
};

const getNaLevel = (score) => {
  if (score <= 20) return { key: 'low', label: '낮음', detail: '부정 정서 부담이 낮은 편입니다.' };
  if (score <= 31) return { key: 'moderate', label: '중간', detail: '부정 정서가 평균 범위입니다.' };
  return { key: 'high', label: '높음', detail: '부정 정서 부담이 높은 편입니다.' };
};

const getKssLevel = (score) => {
  if (score <= 3) return { key: 'alert', label: '각성 양호', detail: '또렷한 각성 수준입니다.' };
  if (score <= 6) return { key: 'neutral', label: '각성 저하 시작', detail: '가벼운 졸림이 동반될 수 있습니다.' };
  return { key: 'drowsy', label: '고도 졸림', detail: '각성 수준이 낮아 피로 신호가 큽니다.' };
};

const getPss4Level = (score) => {
  if (score <= 5) return { key: 'low', label: '낮음', detail: '인지된 스트레스가 낮은 편입니다.' };
  if (score <= 10) return { key: 'moderate', label: '중간', detail: '인지된 스트레스가 중간 범위입니다.' };
  return { key: 'high', label: '높음', detail: '인지된 스트레스가 높은 편입니다.' };
};

const getAffectBalanceLevel = (score) => {
  if (score >= 12) return { key: 'positive-dominant', label: '긍정 우세' };
  if (score >= 4) return { key: 'slightly-positive', label: '약한 긍정 우세' };
  if (score > -4) return { key: 'balanced', label: '균형' };
  if (score > -12) return { key: 'slightly-negative', label: '약한 부정 우세' };
  return { key: 'negative-dominant', label: '부정 우세' };
};

const formatSignedNumber = (value) => (value > 0 ? `+${value}` : `${value}`);

export const buildStateSurveyAnalysis = (answers) => {
  const paScore = sumKeys(answers, PANAS_POSITIVE_KEYS, 3);
  const naScore = sumKeys(answers, PANAS_NEGATIVE_KEYS, 3);
  const kssScore = toNumber(answers.kss_sleepiness, 5);

  const pssDirect = sumKeys(answers, PSS_DIRECT_KEYS, 2);
  const pssReverse = PSS_REVERSE_KEYS.reduce(
    (sum, key) => sum + (4 - toNumber(answers[key], 2)),
    0
  );
  const pssScore = pssDirect + pssReverse;

  const paNormalized = clamp((paScore - 10) / 40, 0, 1);
  const naNormalized = clamp((naScore - 10) / 40, 0, 1);
  const stressNormalized = clamp(pssScore / 16, 0, 1);
  const wakefulnessNormalized = clamp((9 - kssScore) / 8, 0, 1);
  const affectBalance = paScore - naScore;
  const paLevel = getPaLevel(paScore);
  const naLevel = getNaLevel(naScore);
  const kssLevel = getKssLevel(kssScore);
  const pssLevel = getPss4Level(pssScore);
  const affectBalanceLevel = getAffectBalanceLevel(affectBalance);

  const focusReadiness = clamp(
    Math.round(paNormalized * 45 + wakefulnessNormalized * 30 + (1 - stressNormalized) * 25),
    0,
    100
  );
  const emotionalLoad = clamp(
    Math.round((naNormalized * 0.6 + stressNormalized * 0.4) * 100),
    0,
    100
  );
  const stressPressure = clamp(
    Math.round((stressNormalized * 0.7 + naNormalized * 0.3) * 100),
    0,
    100
  );
  const emotionalRecoveryNeed = clamp(
    Math.round(((1 - paNormalized) * 0.45 + naNormalized * 0.3 + stressNormalized * 0.25) * 100),
    0,
    100
  );

  let title = '균형 조정 상태';
  let summary = '핵심 지표가 혼합되어 있어 상태가 한쪽으로 크게 치우치지 않은 구간입니다.';

  if (kssLevel.key === 'drowsy' && pssLevel.key === 'high') {
    title = '피로-스트레스 복합 과부하 상태';
    summary = '각성 저하와 스트레스 상승이 동시에 나타난 복합 과부하 패턴입니다.';
  } else if (kssLevel.key === 'drowsy' && affectBalanceLevel.key.includes('negative')) {
    title = '정서 저활성 상태';
    summary = '졸림 신호와 부정 정서 우세가 함께 관측된 회복 우선 패턴입니다.';
  } else if (kssLevel.key === 'drowsy') {
    title = '저각성 피로 상태';
    summary = '주요 특징은 각성 저하이며, 현재 집중 지속력이 떨어질 수 있는 패턴입니다.';
  } else if (pssLevel.key === 'high' && naLevel.key === 'high') {
    title = '정서 압박 상태';
    summary = '부정 정서와 인지 스트레스가 모두 높아 심리적 압박이 큰 패턴입니다.';
  } else if (pssLevel.key === 'high' && paLevel.key === 'high') {
    title = '긴장 기반 활성 상태';
    summary = '활성도는 높지만 스트레스 신호가 커 긴장 기반의 각성 패턴입니다.';
  } else if (pssLevel.key === 'high') {
    title = '인지 부하 상태';
    summary = '전반적으로 과제/환경에 대한 부담 인식이 높은 패턴입니다.';
  } else if (
    paLevel.key === 'high' &&
    naLevel.key === 'low' &&
    pssLevel.key === 'low' &&
    kssLevel.key === 'alert'
  ) {
    title = '최적 몰입 준비 상태';
    summary = '긍정 정서와 각성이 높고 스트레스·부정 정서가 낮은 안정적 몰입 패턴입니다.';
  } else if (
    paLevel.key !== 'low' &&
    pssLevel.key !== 'high' &&
    kssLevel.key !== 'drowsy' &&
    !affectBalanceLevel.key.includes('negative')
  ) {
    title = '안정 집중 가능 상태';
    summary = '정서 균형과 각성이 비교적 안정적이며 집중 유지가 가능한 패턴입니다.';
  } else if (affectBalanceLevel.key.includes('negative') || paLevel.key === 'low') {
    title = '정서 회복 필요 상태';
    summary = '긍정 정서 대비 부정 정서 비중이 높아 정서 회복 우선 패턴으로 보입니다.';
  }

  const conclusion =
    `종합적으로 PA ${paScore}/50(${paLevel.label}), NA ${naScore}/50(${naLevel.label}), ` +
    `KSS ${kssScore}/9(${kssLevel.label}), PSS-4 ${pssScore}/16(${pssLevel.label})로 나타났습니다. ` +
    `정서 균형은 ${formatSignedNumber(affectBalance)}점(${affectBalanceLevel.label})이며, ` +
    `최종적으로 '${title}' 패턴으로 해석됩니다.`;

  return {
    title,
    description: summary,
    summary,
    conclusion,
    dimensions: [
      {
        key: 'pa',
        label: '긍정 정서 (PA)',
        scoreText: `${paScore}/50`,
        levelText: paLevel.label,
        detailText: paLevel.detail,
      },
      {
        key: 'na',
        label: '부정 정서 (NA)',
        scoreText: `${naScore}/50`,
        levelText: naLevel.label,
        detailText: naLevel.detail,
      },
      {
        key: 'kss',
        label: '졸림/각성 (KSS)',
        scoreText: `${kssScore}/9`,
        levelText: kssLevel.label,
        detailText: kssLevel.detail,
      },
      {
        key: 'pss',
        label: '인지 스트레스 (PSS-4)',
        scoreText: `${pssScore}/16`,
        levelText: pssLevel.label,
        detailText: pssLevel.detail,
      },
    ],
    keyIndicators: [
      `정서 균형 ${formatSignedNumber(affectBalance)}`,
      `집중 준비도 ${focusReadiness}/100`,
      `정서 부담도 ${emotionalLoad}/100`,
      `스트레스 압력 ${stressPressure}/100`,
      `회복 필요도 ${emotionalRecoveryNeed}/100`,
    ],
    tags: [
      `긍정 정서(PA) ${paScore}/50`,
      `부정 정서(NA) ${naScore}/50`,
      `졸림 지수(KSS) ${kssScore}/9`,
      `인지 스트레스(PSS-4) ${pssScore}/16`,
      `정서 부담도 ${emotionalLoad}/100`,
      `집중 준비도 ${focusReadiness}/100`,
    ],
  };
};
