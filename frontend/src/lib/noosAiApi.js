import { buildNoosLiteRtFallbackResponse, runNoosLiteRtTask } from './noosLiteRtGemma';
import { API_BASE_URL } from './env';

const parseResponseBody = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const MIN_JOURNEY_DURATION_SEC = 10;
const MAX_JOURNEY_DURATION_SEC = 600;

const normalizeJourneyDurationSec = (value, fallback = 90) => {
  const numeric = Number(value);
  const fallbackNumeric = Number(fallback);
  const safeValue = Number.isFinite(numeric) ? numeric : fallbackNumeric;
  const rounded = Math.round(Number.isFinite(safeValue) ? safeValue : 90);
  return Math.min(MAX_JOURNEY_DURATION_SEC, Math.max(MIN_JOURNEY_DURATION_SEC, rounded));
};

const createBandMap = (analysis) =>
  Object.fromEntries((analysis?.bandPowers || []).map((band) => [band.key, Number(band.percent || 0) / 100]));

const inferCadenceLabel = (patternDetails) => {
  const cadenceBpm = Number(patternDetails?.cadence_bpm || 0);
  const cycleSec = Number(patternDetails?.cycle_sec || 0);

  if (!cadenceBpm && !cycleSec) {
    return '정적 유지';
  }
  if (Math.abs(cadenceBpm - 6) < 0.2) {
    return '6 breaths/min';
  }
  if (cycleSec > 0) {
    return `${Math.round(cycleSec)}초 사이클`;
  }
  return `${cadenceBpm.toFixed(1)} bpm`;
};

const buildCitationLabel = (citation) => {
  const title = String(citation?.title || '').trim();
  if (!title) return 'Research';
  const [firstChunk] = title.split(':');
  return firstChunk.length <= 42 ? firstChunk : `${firstChunk.slice(0, 39)}...`;
};

const normalizeApiUrl = (value) => {
  const url = String(value || '').trim();
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}/${url.replace(/^\.?\//, '')}`;
};

export const buildFallbackCurrentStateFromBandAnalysis = (analysis) => {
  const bands = createBandMap(analysis);
  const alpha = bands.alpha || 0;
  const beta = bands.beta || 0;
  const theta = bands.theta || 0;
  const delta = bands.delta || 0;
  const gamma = bands.gamma || 0;

  return {
    focus_readiness: clamp(beta * 0.45 + alpha * 0.2 + (1 - theta) * 0.2 + (1 - gamma) * 0.15),
    stress_load: clamp(beta * 0.55 + gamma * 0.2 + (1 - alpha) * 0.25),
    fatigue_risk: clamp(theta * 0.45 + delta * 0.2 + alpha * 0.2 + (1 - beta) * 0.15),
    relaxation_level: clamp(alpha * 0.5 + (1 - beta) * 0.3 + (1 - gamma) * 0.2),
    cortical_arousal: clamp(beta * 0.5 + gamma * 0.2 + (1 - theta) * 0.15 + (1 - delta) * 0.15),
    mental_workload: clamp(theta * 0.3 + beta * 0.3 + (1 - alpha) * 0.25 + gamma * 0.15),
  };
};

const isAbortError = (error) => error?.name === 'AbortError' || /aborted/i.test(String(error?.message || ''));

const postJson = async (path, body, signal, fallbackMessage) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  });

  const responseBody = await parseResponseBody(response);
  if (!response.ok) {
    const message =
      typeof responseBody === 'string'
        ? responseBody
        : responseBody?.message || `${fallbackMessage} with status ${response.status}`;
    throw new Error(message);
  }

  return responseBody;
};

export const stopWizLighting = async ({ signal, keepalive = false } = {}) => {
  const response = await fetch(`${API_BASE_URL}/api/lighting/wiz/stop`, {
    method: 'POST',
    signal,
    keepalive,
  });

  const responseBody = await parseResponseBody(response);
  if (!response.ok) {
    const message =
      typeof responseBody === 'string'
        ? responseBody
        : responseBody?.message || `WiZ lighting restore failed with status ${response.status}`;
    throw new Error(message);
  }

  return responseBody;
};

const runCopilotTask = async ({ task, payload, path, signal, errorMessage }) => {
  try {
    return await postJson(path, payload, signal, errorMessage);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    console.warn(`[NOOS Backend] ${task} remote Gemma failed:`, error);

    try {
      return await runNoosLiteRtTask(task, payload, { signal });
    } catch (localError) {
      if (isAbortError(localError)) {
        throw localError;
      }
      console.warn(`[NOOS LiteRT] ${task} browser fallback failed:`, localError);
      return buildNoosLiteRtFallbackResponse(
        task,
        payload,
        `${error?.message || 'Backend unavailable'} | ${localError?.message || 'LiteRT unavailable'}`
      );
    }
  }
};

const maybeAttachJourneyCopilotOutputs = async ({
  bundle,
  planet,
  currentState,
  recognitionResult,
  durationSec,
  intentContext,
  signal,
}) => {
  const nextBundle = { ...bundle };

  const explanationPayload = {
    title: recognitionResult?.state_profile?.label || nextBundle?.stateLabel || '현재 상태',
    stateLabel: recognitionResult?.state_profile?.label || nextBundle?.stateLabel || '현재 상태',
    summary: '현재 상태와 목표 행성 사이의 전환 계획을 설명합니다.',
    currentState: currentState || nextBundle?.currentState || null,
    targetPlanet: planet,
  };

  const coachPayload = {
    planet,
    intentText: intentContext?.intentText || '',
    recommendation: intentContext?.recommendation?.output || intentContext?.recommendation || null,
    recommendedDurationSec: durationSec,
  };

  if (!nextBundle?.llmStateExplanation?.output) {
    nextBundle.llmStateExplanation = await runCopilotTask({
      task: 'state-explanation',
      payload: explanationPayload,
      path: '/api/ai/state/explain',
      signal,
      errorMessage: 'State explanation failed',
    });
  }

  if (!nextBundle?.llmSessionCoach?.output) {
    nextBundle.llmSessionCoach = await runCopilotTask({
      task: 'session-coach',
      payload: coachPayload,
      path: '/api/ai/session/coach',
      signal,
      errorMessage: 'Session coach failed',
    });
  }

  return nextBundle;
};

export const generateJourneyBundle = async ({
  planet,
  currentState,
  recognitionResult,
  durationSec = 300,
  candidateCountOverride = 1,
  feedbackHistory = [],
  memoText = '',
  intentContext = null,
  signal,
}) => {
  const normalizedDurationSec = normalizeJourneyDurationSec(durationSec);
  const responseBody = await postJson(
    '/api/ai/intervention/music',
    {
      planet,
      currentState,
      recognitionResult,
      durationSec: normalizedDurationSec,
      candidateCountOverride,
      feedbackHistory,
      memoText,
      intentContext,
    },
    signal,
    'Journey generation failed'
  );

  if (!responseBody || typeof responseBody !== 'object') {
    return responseBody;
  }

  const normalizedBundle = {
    ...responseBody,
    audioUrl: normalizeApiUrl(responseBody.audioUrl),
  };

  return maybeAttachJourneyCopilotOutputs({
    bundle: normalizedBundle,
    planet,
    currentState,
    recognitionResult,
    durationSec: normalizedDurationSec,
    intentContext,
    signal,
  });
};

export const prewarmJourneyGeneration = async ({ signal } = {}) =>
  postJson(
    '/api/ai/intervention/prewarm',
    {},
    signal,
    'Journey generation prewarm failed'
  );

export const parseNaturalLanguageFeedback = async ({
  feedbackText,
  rating,
  planet,
  targetState,
  measuredState,
  measuredSource,
  currentState,
  signal,
}) =>
  runCopilotTask({
    task: 'feedback-parse',
    payload: {
      feedbackText,
      rating,
      planet,
      targetState,
      measuredState,
      measuredSource,
      currentState,
    },
    path: '/api/ai/feedback/parse',
    signal,
    errorMessage: 'Feedback parsing failed',
  });

export const requestPlanetRecommendation = async ({
  intentText,
  desiredOutcome,
  memoText,
  currentState,
  feedbackHistory,
  requestedDurationSec,
  signal,
}) =>
  runCopilotTask({
    task: 'planet-recommendation',
    payload: {
      intentText,
      desiredOutcome,
      memoText,
      currentState,
      feedbackHistory,
      requestedDurationSec,
    },
    path: '/api/ai/planet/recommend',
    signal,
    errorMessage: 'Planet recommendation failed',
  });

export const requestStateExplanation = async ({
  title,
  stateLabel,
  summary,
  currentState,
  targetPlanet,
  signal,
}) =>
  runCopilotTask({
    task: 'state-explanation',
    payload: {
      title,
      stateLabel,
      summary,
      currentState,
      targetPlanet,
    },
    path: '/api/ai/state/explain',
    signal,
    errorMessage: 'State explanation failed',
  });

export const requestDashboardSummary = async ({
  feedbackHistory,
  memoText,
  currentState,
  signal,
}) =>
  runCopilotTask({
    task: 'dashboard-summary',
    payload: {
      feedbackHistory,
      memoText,
      currentState,
    },
    path: '/api/ai/dashboard/summary',
    signal,
    errorMessage: 'Dashboard summary failed',
  });

export const requestSessionCoach = async ({
  planet,
  intentText,
  recommendation,
  recommendedDurationSec,
  signal,
}) =>
  runCopilotTask({
    task: 'session-coach',
    payload: {
      planet,
      intentText,
      recommendation,
      recommendedDurationSec,
    },
    path: '/api/ai/session/coach',
    signal,
    errorMessage: 'Session coach failed',
  });

export const warmNoosLocalCopilot = async () => ({
  ready: true,
  engine: 'remote-gemma-backend',
});

export const buildLightingPreviewFromIntervention = (bundle) => {
  const interventionResult = bundle?.interventionResult || {};
  const lightingSpec = interventionResult?.lighting_spec || {};
  const program = lightingSpec?.program || {};
  const finalScene = lightingSpec?.final_scene || {};
  const finalPattern = finalScene?.pattern_details || {};
  const directEvidence = lightingSpec?.research_basis?.direct_evidence || [];
  const inferredEvidence = lightingSpec?.research_basis?.inferred_pattern_evidence || [];
  const citations = [...directEvidence, ...inferredEvidence].map((citation) => ({
    label: buildCitationLabel(citation),
    url: citation?.url,
  }));

  return {
    programLabel: program?.label || 'AI Lighting Prescription',
    summary: program?.intent || '현재 상태에서 목표 상태로 이동하기 위한 조명 프리셋입니다.',
    researchAnchor: program?.research_anchor || `${finalScene?.cct_kelvin || 0} K`,
    evidenceLabel: inferredEvidence.length ? '직접 논문값 + 패턴 추론' : '직접 논문값',
    deviceProfile: lightingSpec?.device_profile || 'cct-plus-rgb',
    cctKelvin: finalScene?.cct_kelvin || 0,
    luxAnchor: finalScene?.illuminance_lux_target || 0,
    brightnessPercent: finalScene?.brightness_percent || 0,
    primaryMode: finalScene?.primary_mode || 'cct',
    primaryCctKelvin: finalScene?.primary_cct_kelvin || finalScene?.cct_kelvin || 0,
    primaryHex: finalScene?.primary_hex || '#ffffff',
    secondaryHex: finalScene?.secondary_hex || '#ffffff',
    accentHex: finalScene?.accent_hex || '#ffffff',
    patternLabel: finalPattern?.label || finalScene?.animation_pattern || 'Static Hold',
    patternEvidence: finalPattern?.evidence_tier || 'direct_values',
    patternCadence: inferCadenceLabel(finalPattern),
    phases: (lightingSpec?.phases || []).map((phase) => ({
      label: phase?.label || phase?.name || 'Phase',
      durationText: `${Math.max(1, Math.round(Number(phase?.duration_sec || 0)))}초`,
      cctKelvin: phase?.cct_kelvin || 0,
      luxAnchor: phase?.illuminance_lux_target || 0,
      brightnessPercent: phase?.brightness_percent || 0,
      patternLabel: phase?.pattern_details?.label || phase?.animation_pattern || 'Static Hold',
      primaryMode: phase?.primary_mode || 'cct',
      primaryCctKelvin: phase?.primary_cct_kelvin || phase?.cct_kelvin || 0,
      primaryHex: phase?.primary_hex || '#ffffff',
      secondaryHex: phase?.secondary_hex || '#ffffff',
      accentHex: phase?.accent_hex || '#ffffff',
    })),
    citations,
  };
};
