const SUPPORTED_TASKS = new Set([
  'feedback-parse',
  'planet-recommendation',
  'state-explanation',
  'dashboard-summary',
  'session-coach',
  'device-troubleshoot',
]);

const PLANET_CATALOG = [
  {
    slug: 'mercury',
    title: 'Mercury',
    goal_label: '순간 점화 집중',
    category: 'ignition-focus',
    user_description:
      '망설임을 줄이고 빠르게 시작할 수 있도록 돕는 환경입니다. 짧은 시간 안에 집중을 켜고, 작업 진입 속도를 끌어올리고 싶을 때 적합합니다.',
  },
  {
    slug: 'venus',
    title: 'Venus',
    goal_label: '온기 있는 창의',
    category: 'warm-creativity',
    user_description:
      '감각과 감정을 부드럽게 깨워 아이디어가 자연스럽게 흐르도록 돕는 환경입니다. 글쓰기, 디자인, 브랜딩처럼 섬세한 표현과 연상이 필요한 순간에 어울립니다.',
  },
  {
    slug: 'earth',
    title: 'Earth',
    goal_label: '균형형 집중',
    category: 'balanced-sustain',
    user_description:
      '과하게 긴장하지 않으면서도 안정적으로 집중을 유지하도록 설계된 환경입니다. 장시간 업무, 학습, 루틴 작업을 편안하게 이어가고 싶을 때 적합합니다.',
  },
  {
    slug: 'mars',
    title: 'Mars',
    goal_label: '결단과 실행',
    category: 'action-drive',
    user_description:
      '미루고 있던 일을 바로 행동으로 옮길 수 있도록 추진력을 높이는 환경입니다. 빠른 결단, 실행, 돌파가 필요한 순간에 가장 잘 맞습니다.',
  },
  {
    slug: 'jupiter',
    title: 'Jupiter',
    goal_label: '전략적 존재감',
    category: 'strategic-presence',
    user_description:
      '큰 그림을 보고 판단의 중심을 잡을 수 있도록 돕는 환경입니다. 중요한 선택, 발표 준비, 리더십이 필요한 상황에서 넓고 단단한 사고를 지원합니다.',
  },
  {
    slug: 'saturn',
    title: 'Saturn',
    goal_label: '깊은 사유',
    category: 'deliberate-thinking',
    user_description:
      '느리고 정교한 사고를 오래 유지할 수 있도록 돕는 환경입니다. 기획, 연구, 구조 설계, 철학적 정리처럼 긴 호흡의 사고가 필요한 순간에 적합합니다.',
  },
  {
    slug: 'uranus',
    title: 'Uranus',
    goal_label: '전환형 창의',
    category: 'disruptive-creativity',
    user_description:
      '익숙한 방식에서 벗어나 새로운 관점으로 사고를 전환하도록 돕는 환경입니다. 막힌 아이디어를 깨고, 발상 전환이나 실험적 접근이 필요할 때 어울립니다.',
  },
  {
    slug: 'neptune',
    title: 'Neptune',
    goal_label: '딥워크 몰입',
    category: 'deep-work',
    user_description:
      '외부 잡음을 최대한 줄이고 좁고 깊은 집중 상태로 들어가도록 설계된 환경입니다. 코딩, 독서, 논문, 분석처럼 높은 몰입 밀도가 필요한 작업에 적합합니다.',
  },
  {
    slug: 'pluto',
    title: 'Pluto',
    goal_label: '회복과 리셋',
    category: 'recovery-reset',
    user_description:
      '긴장을 낮추고 감각을 천천히 가라앉히며 하루를 정리하도록 돕는 환경입니다. 과부하 이후 회복, 정서적 안정, 전환이 필요한 시간에 가장 잘 맞습니다.',
  },
];

const PLANET_BY_SLUG = Object.fromEntries(PLANET_CATALOG.map((item) => [item.slug, item]));

const TASK_INSTRUCTIONS = {
  'feedback-parse': 'Parse the user feedback into structured NOOS adjustments for music, lighting, and the next session.',
  'planet-recommendation': 'Recommend the best NOOS planet given the user intent, memo context, and current state vector.',
  'state-explanation': 'Explain the NOOS state vector in non-medical Korean, cautiously and usefully.',
  'dashboard-summary': 'Summarize NOOS feedback history and memo text into trends, wins, frictions, and next adjustments.',
  'session-coach': 'Turn the selected planet and user goal into a concise NOOS session brief and setup checklist.',
  'device-troubleshoot': 'Transform a device issue description into likely causes and safe troubleshooting steps.',
};

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const roundFloat = (value, digits = 3) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  const scale = 10 ** digits;
  return Math.round(numeric * scale) / scale;
};

const safeFloat = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const dedupePreserveOrder = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    if (item == null || item === '' || seen.has(item)) return false;
    seen.add(item);
    return true;
  });
};

const lowerText = (payload, key) => String(payload?.[key] || '').trim().toLowerCase();

const topAxes = (payload) => {
  const currentState = payload?.currentState || payload?.current_state || {};
  return {
    focus_readiness: safeFloat(currentState.focus_readiness, 0.5),
    stress_load: safeFloat(currentState.stress_load, 0.5),
    fatigue_risk: safeFloat(currentState.fatigue_risk, 0.5),
    relaxation_level: safeFloat(currentState.relaxation_level, 0.5),
    cortical_arousal: safeFloat(currentState.cortical_arousal, 0.5),
    mental_workload: safeFloat(currentState.mental_workload, 0.5),
  };
};

const deepMerge = (base, override) => {
  if (Array.isArray(base) || Array.isArray(override)) {
    return override == null ? structuredClone(base) : structuredClone(override);
  }
  if (base && typeof base === 'object' && override && typeof override === 'object') {
    const merged = { ...structuredClone(base) };
    Object.entries(override).forEach(([key, value]) => {
      merged[key] = deepMerge(base[key], value);
    });
    return merged;
  }
  if (override == null) {
    return structuredClone(base);
  }
  return structuredClone(override);
};

const keywordScore = (text, keywords) => keywords.reduce((sum, keyword) => sum + (text.includes(keyword) ? 1 : 0), 0);

const fallbackFeedbackParse = (payload) => {
  const text = lowerText(payload, 'feedbackText');
  const rating = clamp(safeFloat(payload?.rating, 3) / 5, 0, 1);

  const tooCool = ['차갑', 'blue', 'cool'].some((token) => text.includes(token));
  const tooWarm = ['너무 따뜻', 'warm', '붉', '노랗'].some((token) => text.includes(token));
  const tooBright = ['너무 밝', 'bright', '눈부'].some((token) => text.includes(token));
  const tooDim = ['어둡', 'dim'].some((token) => text.includes(token));
  const tooTense = ['긴장', '쫓기', '날카', '부담'].some((token) => text.includes(token));
  const tooBusy = ['산만', '복잡', '너무 많', 'busy'].some((token) => text.includes(token));
  const tooSlow = ['느리', '쳐지', 'sleepy'].some((token) => text.includes(token));
  const tooFast = ['빠르', '급하', 'rush'].some((token) => text.includes(token));
  const focusHelped = ['집중', '몰입', '도움'].some((token) => text.includes(token));
  const relaxHelped = ['편안', '차분', '안정', '이완'].some((token) => text.includes(token));
  const fatigueIncreased = ['피곤', '지침', 'fatigue'].some((token) => text.includes(token));

  const goalMatch = clamp(rating + (focusHelped || relaxHelped ? 0.06 : -0.04), 0, 1);
  const musicFit = clamp(rating - (tooTense || tooBusy ? 0.12 : 0) - (tooFast || tooSlow ? 0.08 : 0), 0, 1);
  const lightingFit = clamp(rating - (tooBright || tooDim || tooCool || tooWarm ? 0.14 : 0), 0, 1);

  const preferredPlanets = [];
  const avoidPlanets = [];
  if (relaxHelped && !tooSlow) preferredPlanets.push('earth', 'neptune', 'pluto');
  if (focusHelped && !tooTense) preferredPlanets.push('earth', 'neptune', 'saturn');
  if (tooTense || tooFast) avoidPlanets.push('mars');
  if (tooSlow) avoidPlanets.push('pluto');

  const summaryParts = [];
  if (tooTense) summaryParts.push('음악 긴장도를 낮추는 보정이 필요합니다.');
  if (tooBright || tooCool) summaryParts.push('조명은 더 따뜻하고 덜 밝은 방향이 적합합니다.');
  if (tooBusy) summaryParts.push('질감과 리듬 밀도를 낮춰 산만함을 줄여야 합니다.');
  if (focusHelped) summaryParts.push('집중 도움 효과는 유지하는 편이 좋습니다.');
  if (relaxHelped) summaryParts.push('이완 효과가 확인되어 안정 계열 세션과 궁합이 좋습니다.');
  if (!summaryParts.length) {
    summaryParts.push('현재 피드백은 전체 만족도는 보통이며 미세 조정이 필요한 상태입니다.');
  }

  return {
    summary: summaryParts.join(' '),
    structured_feedback: {
      goal_match: roundFloat(goalMatch, 3),
      music_fit: roundFloat(musicFit, 3),
      lighting_fit: roundFloat(lightingFit, 3),
      music_flags: dedupePreserveOrder([
        tooTense ? 'too_tense' : null,
        tooBusy ? 'too_busy' : null,
        tooFast ? 'too_fast' : null,
        tooSlow ? 'too_slow' : null,
      ]),
      lighting_flags: dedupePreserveOrder([
        tooCool ? 'too_cool' : null,
        tooWarm ? 'too_warm' : null,
        tooBright ? 'too_bright' : null,
        tooDim ? 'too_dim' : null,
      ]),
      state_effects: {
        focus_helped: focusHelped,
        relaxation_helped: relaxHelped,
        fatigue_increased: fatigueIncreased,
      },
      recommended_adjustments: {
        music_adjustments: {
          tempo_delta: tooFast ? -6 : tooSlow ? 4 : 0,
          energy_delta: roundFloat(tooTense ? -0.12 : tooSlow ? 0.05 : 0, 3),
          brightness_delta: roundFloat(tooTense ? -0.1 : tooBusy ? -0.06 : 0, 3),
          density_delta: roundFloat(tooBusy ? -0.12 : 0, 3),
          tension_delta: roundFloat(tooTense ? -0.14 : 0, 3),
          texture_delta: roundFloat(tooBusy ? -0.08 : focusHelped ? 0.02 : 0, 3),
        },
        lighting_adjustments: {
          cct_delta: tooCool ? -260 : tooWarm ? 220 : 0,
          brightness_delta: tooBright ? -8 : tooDim ? 6 : 0,
          lux_delta: tooBright ? -90 : tooDim ? 70 : 0,
          motion_delta: roundFloat(tooTense ? -0.06 : tooBusy ? -0.08 : 0, 3),
        },
        session_adjustments: {
          duration_delta_sec: tooBusy || fatigueIncreased ? -120 : focusHelped && rating >= 0.8 ? 60 : 0,
          preferred_planets: dedupePreserveOrder(preferredPlanets).slice(0, 3),
          avoid_planets: dedupePreserveOrder(avoidPlanets).slice(0, 3),
        },
      },
      confidence: roundFloat(0.56 + Math.min(0.28, text.split(/\s+/).filter(Boolean).length * 0.01), 3),
    },
    coach_note: '다음 세션에서는 현재 효과가 좋았던 축은 유지하고, 자극 과다로 지적된 요소만 먼저 줄이는 방식이 안전합니다.',
    next_session_prompt: '조명 온도와 음악 긴장도를 한 단계 낮춘 상태로 동일 목표를 다시 시도해 보세요.',
  };
};

const planetScore = (slug, axes, text) => {
  let score = 0;
  if (slug === 'neptune') {
    score += 1.4 * axes.focus_readiness;
    score += 1.0 * (1 - axes.stress_load);
    score += 1.3 * keywordScore(text, ['코딩', '논문', 'deep work', '분석', '몰입', '집중']);
  } else if (slug === 'earth') {
    score += 1.1 * (1 - axes.stress_load);
    score += 0.9 * (1 - axes.fatigue_risk);
    score += 1.0 * keywordScore(text, ['루틴', '업무', '장시간', 'steady', 'balance', '균형']);
  } else if (slug === 'saturn') {
    score += 1.1 * axes.mental_workload;
    score += 1.2 * keywordScore(text, ['기획', '설계', '연구', '생각', '전략', '철학']);
  } else if (slug === 'venus') {
    score += 1.2 * axes.relaxation_level;
    score += 1.3 * keywordScore(text, ['글쓰기', '브랜딩', '감성', '디자인', '창의', 'writing']);
  } else if (slug === 'uranus') {
    score += 1.2 * keywordScore(text, ['새로운', '전환', '막힘', '아이디어', '실험', 'brainstorm']);
    score += 0.6 * (1 - axes.relaxation_level);
  } else if (slug === 'mars') {
    score += 1.3 * axes.cortical_arousal;
    score += 1.4 * keywordScore(text, ['실행', '결단', '바로', 'action', 'push', 'deadline']);
  } else if (slug === 'jupiter') {
    score += 1.2 * keywordScore(text, ['발표', '리더십', '결정', '큰 그림', 'meeting', 'presentation']);
    score += 0.8 * axes.focus_readiness;
  } else if (slug === 'mercury') {
    score += 1.2 * keywordScore(text, ['시작', '진입', '착수', 'kickoff', 'start']);
    score += 0.9 * axes.cortical_arousal;
  } else if (slug === 'pluto') {
    score += 1.4 * axes.fatigue_risk;
    score += 1.3 * keywordScore(text, ['회복', '정리', '안정', 'calm', 'rest', 'recover']);
  }

  if (axes.stress_load > 0.72 && ['mars', 'mercury'].includes(slug)) score -= 0.9;
  if (axes.fatigue_risk > 0.72 && ['mars', 'mercury'].includes(slug)) score -= 0.8;

  return score;
};

const fallbackPlanetRecommendation = (payload) => {
  const text = [payload?.intentText, payload?.desiredOutcome, payload?.memoText]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const axes = topAxes(payload);
  const ranking = PLANET_CATALOG.map((planet) => [planet.slug, planetScore(planet.slug, axes, text)]).sort(
    (left, right) => right[1] - left[1]
  );
  const recommended = ranking[0]?.[0] || 'earth';
  const alternates = ranking.slice(1, 3).map(([slug]) => slug);
  const profile = PLANET_BY_SLUG[recommended] || PLANET_BY_SLUG.earth;
  const tags = dedupePreserveOrder([
    ['코딩', '논문', '분석', '집중'].some((token) => text.includes(token)) ? 'deep_work' : null,
    ['아이디어', '브랜딩', '디자인', '창의'].some((token) => text.includes(token)) ? 'creative' : null,
    ['회복', '피곤', '안정', 'rest'].some((token) => text.includes(token)) ? 'recovery' : null,
    ['실행', '착수', '결단', 'deadline'].some((token) => text.includes(token)) ? 'execution' : null,
  ]);

  return {
    recommended_planet: recommended,
    confidence: roundFloat(0.62 + Math.min(0.2, Math.max(0, (ranking[0]?.[1] || 0) - (ranking[1]?.[1] || 0)) * 0.08), 3),
    headline: `${profile.title}를 먼저 추천합니다.`,
    summary: `${profile.goal_label} 성향이 현재 상태와 작업 의도에 가장 잘 맞습니다.`,
    justification: [
      `현재 상태 기준으로 ${profile.goal_label} 벡터와의 거리가 가장 짧습니다.`,
      `입력한 목적 문장과 가장 잘 맞는 카테고리는 ${profile.category}입니다.`,
    ],
    alternate_planets: alternates,
    intent_tags: tags,
    setup_steps: [
      '세션 시작 전 1문장으로 오늘 해야 할 일을 다시 고정합니다.',
      '세션 중 다른 앱 전환을 줄이고 하나의 작업만 유지합니다.',
    ],
    avoid: ['현재 긴장도가 높다면 지나치게 공격적인 목표 상태로 바로 점프하지 않습니다.'],
    recommended_duration_sec: Math.round(safeFloat(payload?.requestedDurationSec, 900)),
  };
};

const fallbackStateExplanation = (payload) => {
  const axes = topAxes(payload);
  const title = String(payload?.title || payload?.stateLabel || '현재 상태');
  const targetPlanet = String(payload?.targetPlanet || '').trim().toLowerCase();
  const focus = axes.focus_readiness;
  const stress = axes.stress_load;
  const fatigue = axes.fatigue_risk;
  const relaxation = axes.relaxation_level;

  let headline = '중간 수준의 혼합 상태로, 과한 자극 없이 방향을 정해주는 개입이 적합합니다.';
  if (stress >= 0.7) {
    headline = '긴장 신호가 높아 바로 강한 자극을 주기보다 안정화가 먼저 필요한 상태입니다.';
  } else if (fatigue >= 0.7) {
    headline = '피로 신호가 커서 회복 우선 접근이 안전한 상태입니다.';
  } else if (focus >= 0.7) {
    headline = '집중 준비도가 충분해 목표 상태로 비교적 부드럽게 들어갈 수 있습니다.';
  }

  const whyNow = [];
  if (focus >= 0.65) whyNow.push('집중 준비도는 충분한 편입니다.');
  if (stress >= 0.6) whyNow.push('긴장 축이 올라가 있어 자극 강도는 보수적으로 가져가는 편이 좋습니다.');
  if (fatigue >= 0.6) whyNow.push('피로 축이 높아 세션 길이와 밀도는 다소 낮추는 편이 안전합니다.');
  if (relaxation >= 0.6) whyNow.push('이완 기반이 확보되어 차분한 몰입형 행성과 궁합이 좋습니다.');

  let caution = '이 해석은 비의료적 상태 설명이며, 이번 세션의 품질과 자기보고 문맥에 따라 달라질 수 있습니다.';
  if (targetPlanet) {
    const profile = PLANET_BY_SLUG[targetPlanet];
    caution = `${profile?.title || targetPlanet} 목표를 선택했다면 변화 폭보다 안정적인 진입을 먼저 확인하세요.`;
  }

  return {
    headline,
    summary: `${title} 기준으로 현재 상태의 주된 특징을 요약했습니다.`,
    why_now: whyNow.length ? whyNow : ['현재 상태는 뚜렷한 단일 축보다 복합적인 특징을 보입니다.'],
    do_now: [
      '첫 3분은 변화량보다 안정감을 확인합니다.',
      '산만함이 올라가면 즉시 강도보다 구조를 단순화합니다.',
    ],
    caution,
    confidence_note: '이 설명은 NOOS 상태 벡터와 최근 세션 문맥을 함께 반영한 비의료적 해석입니다.',
  };
};

const fallbackDashboardSummary = (payload) => {
  const feedbackHistory = Array.isArray(payload?.feedbackHistory) ? payload.feedbackHistory : [];
  const memoText = String(payload?.memoText || '').trim();
  const ratings = feedbackHistory.map((entry) => safeFloat(entry?.rating, 0)).filter((rating) => rating > 0);
  const avgRating = ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
  const planetScores = {};

  feedbackHistory.forEach((entry) => {
    const planet = String(entry?.planetSlug || entry?.planet || '').toLowerCase();
    if (!planet) return;
    const rating = safeFloat(entry?.rating, 0);
    if (!planetScores[planet]) planetScores[planet] = [];
    planetScores[planet].push(rating);
  });

  const orderedPlanets = Object.entries(planetScores)
    .map(([planet, scores]) => [planet, scores.reduce((sum, rating) => sum + rating, 0) / scores.length])
    .sort((left, right) => right[1] - left[1]);

  const topPlanets = orderedPlanets.slice(0, 3).map(([planet]) => planet);
  const weakPlanets = orderedPlanets.length >= 2 ? orderedPlanets.slice(-2).map(([planet]) => planet) : [];
  const lowerMemo = memoText.toLowerCase();
  const memoTags = dedupePreserveOrder([
    ['집중', '몰입', 'focus'].some((token) => lowerMemo.includes(token)) ? 'focus' : null,
    ['긴장', '불안', 'stress'].some((token) => lowerMemo.includes(token)) ? 'stress' : null,
    ['피곤', '졸림', 'fatigue'].some((token) => lowerMemo.includes(token)) ? 'fatigue' : null,
    ['아이디어', '디자인', '창의'].some((token) => lowerMemo.includes(token)) ? 'creative' : null,
  ]);

  return {
    headline: '최근 세션 기록을 기반으로 개인화 경향을 정리했습니다.',
    summary: ratings.length
      ? `현재 저장된 세션 평균 만족도는 ${avgRating.toFixed(1)}/5.0입니다.`
      : '아직 충분한 피드백 기록이 없어 초기 요약만 제공합니다.',
    wins: [
      '최근 높은 평가를 받은 행성 패턴은 다음 추천 우선순위에 반영됩니다.',
      ...(topPlanets.length ? [`상대적으로 안정적인 행성: ${topPlanets.join(', ')}`] : []),
    ],
    frictions: [
      ...(weakPlanets.length ? [`재검토가 필요한 행성: ${weakPlanets.join(', ')}`] : []),
      '피드백 텍스트가 더 구체적일수록 음악/조명 보정이 정밀해집니다.',
    ],
    memo_tags: memoTags,
    preferred_planets: topPlanets,
    adjustments: [
      '낮은 평가가 반복된 세션은 먼저 자극 강도와 밝기를 낮추는 방향으로 보정합니다.',
      '메모에 집중/피로 태그가 반복되면 세션 길이와 리듬 밀도를 함께 조정합니다.',
    ],
    coach_note:
      '다음 세션 전에는 오늘의 목적을 한 문장으로 남기고, 종료 후에는 무엇이 과했는지 한 줄로 적는 것이 가장 큰 개선 폭을 만듭니다.',
  };
};

const fallbackSessionCoach = (payload) => {
  const recommendation = payload?.recommendation && typeof payload.recommendation === 'object' ? payload.recommendation : {};
  const planet = String(payload?.planet || recommendation?.recommended_planet || 'earth').toLowerCase();
  const profile = PLANET_BY_SLUG[planet] || PLANET_BY_SLUG.earth;
  const intentText = String(payload?.intentText || '').trim();
  const duration = Math.round(safeFloat(payload?.recommendedDurationSec || recommendation?.recommended_duration_sec, 900));

  return {
    session_prompt: `${profile.title} 세션은 ${profile.goal_label} 방향으로 현재 상태를 정렬합니다.`,
    focus_frame: intentText || '오늘 해야 할 핵심 작업 하나를 세션 시작 전에 고정합니다.',
    success_signal: '시작 5분 내 산만함이 줄고, 작업 대상에 주의가 머무는지 확인합니다.',
    caution: '너무 많은 목표를 동시에 잡지 말고, 한 세션에는 하나의 방향만 유지합니다.',
    recommended_duration_sec: duration,
    setup_steps: [
      '브라우저 탭과 알림을 정리합니다.',
      '세션 중간 평가 기준을 한 줄로 정합니다.',
      '조명과 음악은 동일 목표를 향하도록 동시에 유지합니다.',
    ],
  };
};

const fallbackDeviceTroubleshoot = (payload) => {
  const issueText = lowerText(payload, 'issueText');
  const stage = String(payload?.stage || 'device-question');

  if (['bluetooth', '블루투스', 'pair', '페어', '검색'].some((token) => issueText.includes(token))) {
    return {
      issue_label: 'Muse 연결/페어링 문제',
      summary: '현재 입력 기준으로 가장 가능성이 높은 원인과 안전한 조치 순서를 정리했습니다.',
      probable_causes: [
        '브라우저의 Bluetooth 권한이 차단되어 있을 수 있습니다.',
        'Muse S Athena가 이미 다른 기기와 연결된 상태일 수 있습니다.',
      ],
      steps: [
        'macOS 블루투스와 브라우저 권한을 다시 확인합니다.',
        'Muse 전원을 껐다 켜고, 다른 앱과의 연결을 해제합니다.',
        'Chrome 계열 브라우저에서 다시 검색을 시도합니다.',
      ],
      avoid: [
        '연결이 불안정한 상태에서 여러 번 빠르게 재시도하지 않습니다.',
        '신호가 나쁘다고 바로 상태 해석을 믿지 않습니다.',
      ],
      escalate_if: '권한 확인과 재연결 후에도 동일 현상이 3회 이상 반복되면 장치 상태 또는 브라우저 호환성을 별도로 점검합니다.',
    };
  }

  if (['signal', '노이즈', 'stream', '파형', '0'].some((token) => issueText.includes(token))) {
    return {
      issue_label: '신호 수집/스트리밍 문제',
      summary: '현재 입력 기준으로 가장 가능성이 높은 원인과 안전한 조치 순서를 정리했습니다.',
      probable_causes: [
        '센서 접촉이 불안정하거나 전극이 건조할 수 있습니다.',
        '측정 시작 직후 아직 안정화가 끝나지 않았을 수 있습니다.',
      ],
      steps: [
        '센서 접촉부를 다시 맞추고 피부 접촉을 안정화합니다.',
        '머리 위치를 고정한 채 10~20초 더 기다립니다.',
        '파형이 계속 0에 가깝다면 연결을 다시 시작합니다.',
      ],
      avoid: [
        '연결이 불안정한 상태에서 여러 번 빠르게 재시도하지 않습니다.',
        '신호가 나쁘다고 바로 상태 해석을 믿지 않습니다.',
      ],
      escalate_if: '권한 확인과 재연결 후에도 동일 현상이 3회 이상 반복되면 장치 상태 또는 브라우저 호환성을 별도로 점검합니다.',
    };
  }

  return {
    issue_label: '일반 측정 흐름 문제',
    summary: '현재 입력 기준으로 가장 가능성이 높은 원인과 안전한 조치 순서를 정리했습니다.',
    probable_causes: [`현재 단계(${stage})에서 권한/연결/동기화 중 하나가 지연되고 있을 수 있습니다.`],
    steps: [
      '브라우저 탭을 새로고침하기 전에 먼저 연결 권한 상태를 확인합니다.',
      '다른 블루투스 연결을 줄이고 Muse만 다시 연결합니다.',
      '동일 문제가 반복되면 설문 모드로 임시 진행하고, 이후 장치 환경을 재점검합니다.',
    ],
    avoid: [
      '연결이 불안정한 상태에서 여러 번 빠르게 재시도하지 않습니다.',
      '신호가 나쁘다고 바로 상태 해석을 믿지 않습니다.',
    ],
    escalate_if: '권한 확인과 재연결 후에도 동일 현상이 3회 이상 반복되면 장치 상태 또는 브라우저 호환성을 별도로 점검합니다.',
  };
};

const FALLBACK_BUILDERS = {
  'feedback-parse': fallbackFeedbackParse,
  'planet-recommendation': fallbackPlanetRecommendation,
  'state-explanation': fallbackStateExplanation,
  'dashboard-summary': fallbackDashboardSummary,
  'session-coach': fallbackSessionCoach,
  'device-troubleshoot': fallbackDeviceTroubleshoot,
};

const buildMessages = (task, payload) => {
  if (!SUPPORTED_TASKS.has(task)) {
    throw new Error(`Unsupported NOOS LiteRT task: ${task}`);
  }

  const fallback = FALLBACK_BUILDERS[task](payload);
  const systemPrompt = [
    'You are NOOS Local Copilot running on Gemma 4 E2B Web via LiteRT.',
    'Return exactly one valid JSON object and nothing else.',
    'Use Korean for explanation strings.',
    'Use lowercase slugs for planet ids.',
    'Do not produce medical claims, diagnoses, or warnings beyond non-medical caution.',
    'Preserve the same top-level keys as the example JSON shape.',
  ].join(' ');

  const userPrompt = [
    `Task: ${TASK_INSTRUCTIONS[task]}`,
    `Planet catalog:\n${JSON.stringify(PLANET_CATALOG, null, 2)}`,
    `Input payload:\n${JSON.stringify(payload, null, 2)}`,
    `Expected JSON shape example:\n${JSON.stringify(fallback, null, 2)}`,
    'Return only JSON.',
  ].join('\n\n');

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
};

const buildGemma4Prompt = (messages) =>
  messages
    .map((message) => `<|turn>${message.role}\n${message.content}<turn|>`)
    .join('\n') + '\n<|turn>model\n';

const extractFirstJsonObject = (text) => {
  const source = String(text || '');
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (start === -1) {
      if (char === '{') {
        start = index;
        depth = 1;
      }
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') {
      depth += 1;
      continue;
    }

    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  return null;
};

const normalizeOutput = (task, payload, parsed) => {
  const fallback = FALLBACK_BUILDERS[task](payload);
  if (!parsed || typeof parsed !== 'object') {
    return fallback;
  }
  return deepMerge(fallback, parsed);
};

export const getNoosLiteRtFallbackOutput = (task, payload) => {
  if (!SUPPORTED_TASKS.has(task)) {
    throw new Error(`Unsupported NOOS LiteRT task: ${task}`);
  }
  return FALLBACK_BUILDERS[task](payload);
};

export const buildNoosLiteRtPrompt = (task, payload) => buildGemma4Prompt(buildMessages(task, payload));

export const parseNoosLiteRtOutput = (task, payload, rawText) => {
  let parsed = null;
  try {
    const jsonChunk = extractFirstJsonObject(rawText);
    parsed = jsonChunk ? JSON.parse(jsonChunk) : null;
  } catch {
    parsed = null;
  }
  return normalizeOutput(task, payload, parsed);
};

export { SUPPORTED_TASKS };
