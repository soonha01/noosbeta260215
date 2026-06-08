import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import SpaceshipSeating from './SpaceshipSeating';
import SpaceTicket from './SpaceTicket';
import TravelGenerationPage from './travel/TravelGenerationPage';
import TravelPlayerPage from './travel/TravelPlayerPage';
import TravelDashboardPage from './travel/TravelDashboardPage';
import TravelProfilePage from './travel/TravelProfilePage';
import { AiObjetDialog, ExitDialog, FeedbackDialog, LiveFeedbackDialog } from './travel/TravelDialogs';
import {
  AI_CONTEXT_STORAGE_KEY,
  DEFAULT_PROFILE,
  EXIT_TO_HOME,
  EXIT_TO_PLANETS,
  FEEDBACK_STORAGE_KEY,
  LIVE_MUSE_SESSION_STORAGE_KEY,
  MEMO_STORAGE_KEY,
  PLANET_MEDIA,
  PROFILE_STORAGE_KEY,
  STATE_STORAGE_KEY,
  STEP_DASHBOARD,
  STEP_GENERATING,
  STEP_PLAYER,
  STEP_PROFILE,
  STEP_SEATING,
  STEP_TICKET,
  TRACK_DURATION_SEC,
} from './travel/constants';
import {
  buildLightingPreviewFromIntervention,
  generateJourneyBundle,
  prewarmJourneyGeneration,
  parseNaturalLanguageFeedback,
  requestDashboardSummary,
  stopWizLighting,
  buildFallbackCurrentStateFromBandAnalysis,
} from '../../../lib/noosAiApi';
import {
  getSharedLiveMuseSnapshot,
  hasActiveSharedLiveMuseSession,
  startSharedLiveMuseSession,
  stopSharedLiveMuseSession,
  subscribeToSharedLiveMuseReadings,
  updateSharedLiveMuseSession,
} from '../../../lib/muse/liveMuseSession';
import { DEFAULT_FFT_SIZE, analyzeEegBands } from '../../../lib/muse/signalProcessing';
import {
  createEegAnalysisPayload,
  startEegSession,
  submitEegAnalysis,
} from '../../../lib/eegAnalysisApi';
import {
  loadStorageJSON,
  readStorageText,
  saveStorageJSON,
  writeStorageText,
} from './travel/storage';
import { formatClock } from './travel/utils';
import { getPlanetAccent } from '../../../lib/planetAccents';
import { Shell, StepFrame } from './travel/spaceTravel.styles';

const ENTRY_MODAL_FADE_OUT_MS = 1900;
const ENTRY_PLAYER_FADE_IN_SEC = 1.9;
const DEFAULT_PLAYER_FADE_IN_SEC = 1.15;
const ENTRY_SHELL_FADE_SEC = 1.35;
const DEFAULT_SHELL_FADE_SEC = 0.8;
const JOURNEY_GENERATION_DURATION_SEC = 300;
const GENERATION_PROGRESS_STEPS = [8, 16, 28, 41, 55, 68, 80, 89, 95];
const GENERATION_STATUS_LINES = [
  '현재 상태 벡터와 목표 행성 프로필을 정렬하는 중',
  '뇌파/설문 기반 상태 차이를 분석하는 중',
  'ACE-Step 음악 스펙과 조명 패턴을 동기화하는 중',
  '후보 트랙을 생성하고 최종 세션을 확정하는 중',
];
const EEG_SAMPLE_RATE = 256;
const LIVE_MUSE_BASELINE_SEC = 60;
const LIVE_MUSE_ANALYSIS_WINDOW_SEC = 300;
const LIVE_MUSE_ANALYSIS_INTERVAL_MS = LIVE_MUSE_ANALYSIS_WINDOW_SEC * 1000;
const LIVE_MUSE_CSV_TEST_BASELINE_SEC = 5;
const LIVE_MUSE_CSV_TEST_ANALYSIS_INTERVAL_MS = 30 * 1000;
const LIVE_MUSE_MAX_LOCAL_BUFFER_SEC = LIVE_MUSE_ANALYSIS_WINDOW_SEC + LIVE_MUSE_BASELINE_SEC + 30;
const LIVE_MUSE_UI_UPDATE_MS = 900;
const LIVE_MUSE_CROSSFADE_DURATION_SEC = 5;
const LIVE_MUSE_FEEDBACK_CADENCE_MS = 15 * 60 * 1000;
const LIVE_MUSE_FEEDBACK_AFTER_ADAPT_MS = 90 * 1000;
const LIVE_MUSE_FEEDBACK_PROMPT_PROBABILITY = 0.1;
const LIVE_MUSE_MIN_REGEN_INTERVAL_MS = 4 * 60 * 1000;
const NEUTRAL_CANONICAL_STATE = {
  focus_readiness: 0.5,
  stress_load: 0.5,
  fatigue_risk: 0.5,
  relaxation_level: 0.5,
  cortical_arousal: 0.5,
  mental_workload: 0.5,
};

const clamp01 = (value) => Math.max(0, Math.min(1, Number(value) || 0));

const readLiveMuseSessionPreference = () => {
  const saved = loadStorageJSON(LIVE_MUSE_SESSION_STORAGE_KEY, null);
  return saved?.enabled ? saved : null;
};

const writeLiveMuseSessionPreference = (nextValue) => {
  saveStorageJSON(LIVE_MUSE_SESSION_STORAGE_KEY, nextValue);
};

const resolveLiveMuseAnalysisIntervalMs = (session) =>
  session?.testMode === 'csv-mock' ? LIVE_MUSE_CSV_TEST_ANALYSIS_INTERVAL_MS : LIVE_MUSE_ANALYSIS_INTERVAL_MS;

const getPlanetAdaptationMode = (planetSlug) => {
  if (['venus', 'earth', 'pluto'].includes(planetSlug)) return 'calm';
  if (['mercury', 'mars', 'jupiter', 'neptune'].includes(planetSlug)) return 'focus';
  if (planetSlug === 'saturn') return 'deep';
  return 'balanced';
};

const buildMusicProfileSnapshot = ({ planetMedia, generatedJourney, volumePercent, adaptiveVolumeScale }) => {
  const intervention = generatedJourney?.interventionResult || {};
  const musicSpec = intervention?.music_spec || {};
  return {
    trackName: generatedJourney?.trackName || planetMedia?.trackName || null,
    audioUrl: generatedJourney?.audioUrl || planetMedia?.audio || null,
    tempo: musicSpec?.bpm_target || musicSpec?.bpm || null,
    intensity: musicSpec?.intensity ?? intervention?.transition_plan?.transition_intensity ?? null,
    brightness: musicSpec?.brightness ?? null,
    density: musicSpec?.density ?? null,
    volumePercent,
    adaptiveVolumeScale,
  };
};

const resolveAdaptiveMusicAction = ({ currentState, previousState, qualityScore, planetSlug }) => {
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

const SpaceTravel = ({
  planet,
  onBack,
  onEndJourney,
  entryOnly = false,
  onEntryComplete,
  onEntryFadeOutStart,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedPlanet = useMemo(() => {
    const routePlanet = location?.state?.planet;
    const queryPlanet = new URLSearchParams(location?.search || '').get('planet');
    return planet || routePlanet || queryPlanet || 'Mars';
  }, [location?.search, location?.state?.planet, planet]);

  const planetSlug = String(selectedPlanet).toLowerCase();
  const accentColor = getPlanetAccent(selectedPlanet);
  const planetMedia = PLANET_MEDIA[planetSlug] || PLANET_MEDIA.mars;
  const isStandalonePage = !entryOnly && typeof onBack !== 'function';
  const playerFadeInDuration = isStandalonePage ? ENTRY_PLAYER_FADE_IN_SEC : DEFAULT_PLAYER_FADE_IN_SEC;
  const shellFadeDurationSec = entryOnly ? ENTRY_SHELL_FADE_SEC : DEFAULT_SHELL_FADE_SEC;

  const [currentStep, setCurrentStep] = useState(entryOnly ? STEP_SEATING : STEP_GENERATING);
  const [ticketData, setTicketData] = useState(null);
  const [generatedJourney, setGeneratedJourney] = useState(null);
  const [generationError, setGenerationError] = useState('');
  const [generationNotice, setGenerationNotice] = useState('');
  const [playbackNotice, setPlaybackNotice] = useState('');
  const [generationAttempt, setGenerationAttempt] = useState(0);
  const [generationProgressPercent, setGenerationProgressPercent] = useState(
    entryOnly ? 100 : GENERATION_PROGRESS_STEPS[0]
  );
  const [generationStatusIndex, setGenerationStatusIndex] = useState(0);

  const [isPlaying, setIsPlaying] = useState(true);
  const [playheadSec, setPlayheadSec] = useState(0);
  const [volumePercent, setVolumePercent] = useState(72);
  const [adaptiveVolumeScale, setAdaptiveVolumeScale] = useState(1);
  const [trackDurationSec, setTrackDurationSec] = useState(TRACK_DURATION_SEC);

  const [aiConnected, setAiConnected] = useState(false);
  const [aiModalStage, setAiModalStage] = useState('none');

  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [pendingExitType, setPendingExitType] = useState(null);
  const [feedbackScore, setFeedbackScore] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [parsedFeedback, setParsedFeedback] = useState(null);
  const [isFeedbackParsing, setIsFeedbackParsing] = useState(false);
  const [isRouteFadingOut, setIsRouteFadingOut] = useState(false);
  const [liveMuseSession, setLiveMuseSession] = useState(readLiveMuseSessionPreference);
  const [liveMuseStatus, setLiveMuseStatus] = useState(liveMuseSession ? 'pending' : 'off');
  const [liveMuseMetrics, setLiveMuseMetrics] = useState({
    sampleCount: 0,
    analysisCount: 0,
    eegSessionId: null,
    lastAnalyzedAt: null,
    nextAnalysisAt: null,
    qualityScore: null,
    latestValue: null,
  });
  const [liveMuseCurrentState, setLiveMuseCurrentState] = useState(null);
  const [adaptiveMusicState, setAdaptiveMusicState] = useState({
    type: 'idle',
    label: liveMuseSession ? 'Muse 연결 대기 중입니다.' : 'Muse live adaptation off',
    reason: '',
    isGenerating: false,
    isCrossfading: false,
  });
  const [pendingAdaptiveAudio, setPendingAdaptiveAudio] = useState(null);
  const [showLiveFeedbackDialog, setShowLiveFeedbackDialog] = useState(false);
  const [liveFeedbackRating, setLiveFeedbackRating] = useState(0);

  const [stateSnapshot, setStateSnapshot] = useState(() => loadStorageJSON(STATE_STORAGE_KEY, null));
  const [feedbackHistory, setFeedbackHistory] = useState(() => loadStorageJSON(FEEDBACK_STORAGE_KEY, []));
  const [memoText, setMemoText] = useState(() => readStorageText(MEMO_STORAGE_KEY, ''));
  const [profileForm, setProfileForm] = useState(() =>
    loadStorageJSON(PROFILE_STORAGE_KEY, DEFAULT_PROFILE)
  );
  const [assistantContext, setAssistantContext] = useState(() => loadStorageJSON(AI_CONTEXT_STORAGE_KEY, null));
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [isDashboardSummaryLoading, setIsDashboardSummaryLoading] = useState(false);
  const hasGeneratedJourneyAudio = Boolean(generatedJourney?.audioUrl);

  const effectivePlanetMedia = useMemo(() => {
    const generatedLightingPreview = generatedJourney
      ? buildLightingPreviewFromIntervention(generatedJourney)
      : null;

    return {
      ...planetMedia,
      audio: hasGeneratedJourneyAudio ? generatedJourney.audioUrl : planetMedia.audio,
      trackName: hasGeneratedJourneyAudio ? generatedJourney?.trackName || planetMedia.trackName : planetMedia.trackName,
      lightingPreview: generatedLightingPreview || planetMedia.lightingPreview,
    };
  }, [generatedJourney, hasGeneratedJourneyAudio, planetMedia]);

  const aiTimersRef = useRef([]);
  const routeTimersRef = useRef([]);
  const audioRef = useRef(null);
  const nextAudioRef = useRef(null);
  const audioPlayRetryRef = useRef(null);
  const audioPlayAttemptsRef = useRef(0);
  const journeyLightingJobRef = useRef(null);
  const lightingRestoreRequestedRef = useRef(false);
  const stateSnapshotRef = useRef(stateSnapshot);
  const liveMuseSessionRef = useRef(liveMuseSession);
  const currentStepRef = useRef(currentStep);
  const museClientRef = useRef(null);
  const museSubscriptionRef = useRef(null);
  const liveEegBufferRef = useRef([]);
  const liveEegSessionIdRef = useRef(null);
  const liveAnalysisTimerRef = useRef(null);
  const liveCalibrationTimerRef = useRef(null);
  const liveUiTimerRef = useRef(null);
  const liveFeedbackTimerRef = useRef(null);
  const liveLastFeedbackAtRef = useRef(0);
  const liveLastAdaptiveGenerationAtRef = useRef(0);
  const livePreviousStateRef = useRef(stateSnapshot?.canonicalState || NEUTRAL_CANONICAL_STATE);
  const liveAnalysisSequenceRef = useRef(0);
  const runLiveMuseAnalysisRef = useRef(null);
  const liveMuseAutoAttachAttemptedRef = useRef(false);
  const liveMuseUsesSharedSessionRef = useRef(false);
  const crossfadeTimerRef = useRef(null);
  const crossfadeHandoffRef = useRef(null);
  const adaptiveVolumeScaleRef = useRef(adaptiveVolumeScale);
  const hasRealAudio = Boolean(effectivePlanetMedia?.audio);

  const clearAiTimers = useCallback(() => {
    aiTimersRef.current.forEach((timerId) => clearTimeout(timerId));
    aiTimersRef.current = [];
  }, []);

  const clearRouteTimers = useCallback(() => {
    routeTimersRef.current.forEach((timerId) => clearTimeout(timerId));
    routeTimersRef.current = [];
  }, []);

  const restoreJourneyLighting = useCallback((reason = 'route-leave') => {
    if (!journeyLightingJobRef.current || lightingRestoreRequestedRef.current) return;

    lightingRestoreRequestedRef.current = true;
    journeyLightingJobRef.current = null;

    stopWizLighting({ keepalive: true }).catch((error) => {
      console.warn(`Failed to restore WiZ lighting after ${reason}:`, error);
    });
  }, []);

  const clearLiveMuseTimers = useCallback(() => {
    if (liveAnalysisTimerRef.current) {
      clearInterval(liveAnalysisTimerRef.current);
      liveAnalysisTimerRef.current = null;
    }
    if (liveCalibrationTimerRef.current) {
      clearTimeout(liveCalibrationTimerRef.current);
      liveCalibrationTimerRef.current = null;
    }
    if (liveUiTimerRef.current) {
      clearTimeout(liveUiTimerRef.current);
      liveUiTimerRef.current = null;
    }
    if (liveFeedbackTimerRef.current) {
      clearTimeout(liveFeedbackTimerRef.current);
      liveFeedbackTimerRef.current = null;
    }
  }, []);

  const queueLiveRawChunkUpload = useCallback((chunkReadings) => {
    const eegSessionId = liveEegSessionIdRef.current;
    if (!eegSessionId || liveRawUploadFailedRef.current || !chunkReadings.length) {
      return;
    }

    const chunkIndex = liveRawChunkIndexRef.current;
    liveRawChunkIndexRef.current += 1;

    liveRawUploadChainRef.current = liveRawUploadChainRef.current
      .catch(() => undefined)
      .then(async () => {
        const response = await uploadEegRawReadingsChunk({
          eegSessionId,
          rawReadings: chunkReadings,
          sampleRateHz: EEG_SAMPLE_RATE,
          chunkIndex,
          baseTimestamp: liveRawChunkBaseTimestampRef.current,
        });

        if (response) {
          setLiveMuseMetrics((prev) => ({
            ...prev,
            eegSessionId,
            chunkCount: Math.max(prev.chunkCount, chunkIndex + 1),
          }));
        }
      })
      .catch((error) => {
        liveRawUploadFailedRef.current = true;
        console.warn('Failed to upload live Muse EEG raw chunk. Continuing with local summary:', error);
      });
  }, []);

  const flushLiveRawChunk = useCallback((force = false) => {
    const shouldFlush =
      liveRawChunkBufferRef.current.length >= LIVE_MUSE_RAW_CHUNK_SAMPLE_COUNT ||
      (force && liveRawChunkBufferRef.current.length > 0);

    if (!shouldFlush) {
      return;
    }

    const chunkReadings = liveRawChunkBufferRef.current.splice(0, liveRawChunkBufferRef.current.length);
    queueLiveRawChunkUpload(chunkReadings);
  }, [queueLiveRawChunkUpload]);

  const handleLiveMuseReading = useCallback((reading) => {
    const maxBufferSize = EEG_SAMPLE_RATE * LIVE_MUSE_MAX_LOCAL_BUFFER_SEC;
    liveEegBufferRef.current.push(reading);
    if (liveEegBufferRef.current.length > maxBufferSize) {
      liveEegBufferRef.current.splice(0, liveEegBufferRef.current.length - maxBufferSize);
    }

    if (liveRawChunkBaseTimestampRef.current === null) {
      liveRawChunkBaseTimestampRef.current = Number.isFinite(Number(reading?.timestamp))
        ? Number(reading.timestamp)
        : Date.now();
    }

    liveRawChunkBufferRef.current.push(reading);
    flushLiveRawChunk(false);

    if (!liveUiTimerRef.current) {
      liveUiTimerRef.current = window.setTimeout(() => {
        liveUiTimerRef.current = null;
        setLiveMuseMetrics((prev) => ({
          ...prev,
          eegSessionId: liveEegSessionIdRef.current,
          sampleCount: liveEegBufferRef.current.length,
          latestValue: Number(reading?.samples?.[0] ?? reading?.channels?.TP9 ?? 0),
        }));
      }, LIVE_MUSE_UI_UPDATE_MS);
    }
  }, [flushLiveRawChunk]);

  const fadeAdaptiveVolumeScaleTo = useCallback((targetScale, durationMs = 18000) => {
    const from = adaptiveVolumeScaleRef.current;
    const to = Math.max(0.72, Math.min(1.16, Number(targetScale) || 1));
    const startedAt = Date.now();

    const step = () => {
      const progress = Math.min(1, (Date.now() - startedAt) / durationMs);
      const eased = 1 - ((1 - progress) ** 3);
      const next = from + ((to - from) * eased);
      adaptiveVolumeScaleRef.current = next;
      setAdaptiveVolumeScale(next);

      if (progress < 1) {
        window.setTimeout(step, 120);
      }
    };

    step();
  }, []);

  const scheduleLiveFeedbackPrompt = useCallback((delayMs = LIVE_MUSE_FEEDBACK_AFTER_ADAPT_MS) => {
    const now = Date.now();
    if (now - liveLastFeedbackAtRef.current < LIVE_MUSE_FEEDBACK_CADENCE_MS) {
      return;
    }
    if (Math.random() > LIVE_MUSE_FEEDBACK_PROMPT_PROBABILITY) {
      return;
    }
    if (liveFeedbackTimerRef.current) {
      clearTimeout(liveFeedbackTimerRef.current);
    }

    liveFeedbackTimerRef.current = window.setTimeout(() => {
      liveFeedbackTimerRef.current = null;
      liveLastFeedbackAtRef.current = Date.now();
      setLiveFeedbackRating(0);
      setShowLiveFeedbackDialog(true);
    }, delayMs);
  }, []);

  const startAdaptiveCrossfade = useCallback((bundle, action) => {
    const nextAudioUrl = bundle?.audioUrl;
    const currentAudioUrl = effectivePlanetMedia?.audio || null;

    if (!nextAudioUrl || !hasRealAudio || !audioRef.current || nextAudioUrl === currentAudioUrl) {
      setGeneratedJourney(bundle);
      setGenerationNotice(action?.label || bundle?.generationWarning || '');
      setPlayheadSec(0);
      setIsPlaying(true);
      return;
    }

    setPendingAdaptiveAudio({
      bundle,
      action,
      audioUrl: nextAudioUrl,
      startedAt: new Date().toISOString(),
    });
    setAdaptiveMusicState((prev) => ({
      ...prev,
      isCrossfading: true,
      label: action?.label || '새 음악으로 부드럽게 전환합니다.',
    }));
  }, [effectivePlanetMedia?.audio, hasRealAudio]);

  const requestAdaptiveJourney = useCallback(async ({ action, nextSnapshot }) => {
    if (currentStepRef.current !== STEP_PLAYER) {
      return;
    }

    const now = Date.now();
    if (now - liveLastAdaptiveGenerationAtRef.current < LIVE_MUSE_MIN_REGEN_INTERVAL_MS) {
      return;
    }

    liveLastAdaptiveGenerationAtRef.current = now;
    setAdaptiveMusicState((prev) => ({
      ...prev,
      isGenerating: true,
      label: '플레이어는 유지한 채 백그라운드에서 다음 음악을 준비합니다.',
    }));

    try {
      const bundle = await generateJourneyBundle({
        planet: selectedPlanet,
        currentState: nextSnapshot?.canonicalState || NEUTRAL_CANONICAL_STATE,
        recognitionResult: nextSnapshot?.recognitionResult || null,
        durationSec: LIVE_MUSE_ANALYSIS_WINDOW_SEC,
        candidateCountOverride: 1,
        feedbackHistory: feedbackHistory.slice(0, 12),
        memoText,
        intentContext: {
          ...(assistantContext || {}),
          liveMuse: true,
          adaptiveAction: action,
          musicProfile: buildMusicProfileSnapshot({
            planetMedia,
            generatedJourney,
            volumePercent,
            adaptiveVolumeScale: adaptiveVolumeScaleRef.current,
          }),
        },
      });

      startAdaptiveCrossfade(bundle, action);
      scheduleLiveFeedbackPrompt();
    } catch (error) {
      console.error('Failed to generate adaptive Muse journey:', error);
      setGenerationNotice('라이브 EEG 기반 새 음악 생성이 지연되어 현재 트랙을 유지합니다.');
    } finally {
      setAdaptiveMusicState((prev) => ({ ...prev, isGenerating: false }));
    }
  }, [
    assistantContext,
    feedbackHistory,
    generatedJourney,
    memoText,
    planetMedia,
    scheduleLiveFeedbackPrompt,
    selectedPlanet,
    startAdaptiveCrossfade,
    volumePercent,
  ]);

  const runLiveMuseAnalysis = useCallback(async () => {
    const windowReadings = liveEegBufferRef.current.slice(-(EEG_SAMPLE_RATE * LIVE_MUSE_ANALYSIS_WINDOW_SEC));
    if (windowReadings.length < EEG_SAMPLE_RATE * 20) {
      setAdaptiveMusicState((prev) => ({
        ...prev,
        label: '분석에 필요한 Muse 샘플을 더 수집하는 중입니다.',
      }));
      return;
    }

    const liveSession = liveMuseSessionRef.current || {};
    const isCsvTest = liveSession.testMode === 'csv-mock';
    const analysisIntervalMs = resolveLiveMuseAnalysisIntervalMs(liveSession);
    const activeAnalysisWindowSec = isCsvTest
      ? Math.min(
          LIVE_MUSE_ANALYSIS_WINDOW_SEC,
          Math.max(20, Math.round(windowReadings.length / EEG_SAMPLE_RATE)),
        )
      : LIVE_MUSE_ANALYSIS_WINDOW_SEC;
    const measuredAt = new Date().toISOString();
    const analysis = analyzeEegBands(windowReadings, {
      sampleRate: EEG_SAMPLE_RATE,
      fftSize: DEFAULT_FFT_SIZE,
    });
    if (!analysis || analysis.sampleCount < 64) {
      return;
    }

    liveAnalysisSequenceRef.current += 1;
    setLiveMuseStatus('analyzing');

    const musicProfile = buildMusicProfileSnapshot({
      planetMedia,
      generatedJourney,
      volumePercent,
      adaptiveVolumeScale: adaptiveVolumeScaleRef.current,
    });
    const payload = createEegAnalysisPayload({
      eegSessionId: liveEegSessionIdRef.current,
      analysis,
      measuredAt,
      measurementDurationSec: activeAnalysisWindowSec,
      analysisWindowSec: activeAnalysisWindowSec,
      analysisMode: 'muse-live-window',
      sampleRateHz: EEG_SAMPLE_RATE,
      sampleCountOverride: windowReadings.length,
      surveyContext: {
        mode: 'muse-live-window',
        source: isCsvTest ? 'csv-mock' : 'continuous-muse',
        targetPlanet: selectedPlanet,
        adaptiveWindow: {
          sequence: liveAnalysisSequenceRef.current,
          windowSec: activeAnalysisWindowSec,
          analyzedAt: measuredAt,
        },
        musicProfile,
      },
    });

    let response = null;
    try {
      response = payload ? await submitEegAnalysis(payload) : null;
    } catch (error) {
      console.warn('Live Muse backend analysis failed. Using local band summary fallback:', error);
    }

    const fallbackState = buildFallbackCurrentStateFromBandAnalysis(analysis);
    const recognitionResult = response?.recognitionResult || null;
    const nextCurrentState = response?.currentState || fallbackState;
    const qualityScore = Number(recognitionResult?.quality?.score ?? 0.55);
    const nextSnapshot = {
      source: isCsvTest ? 'csv-mock-live' : 'muse-live',
      sourceLabel: isCsvTest ? 'CSV mock EEG test stream' : 'Muse S Athena 실시간 측정',
      title: recognitionResult?.state_profile?.label || 'Muse Live EEG 상태',
      summary:
        recognitionResult?.state_profile?.summary?.join(' · ') ||
        '최근 5분 EEG 윈도우를 기반으로 음악 세션을 갱신했습니다.',
      canonicalState: nextCurrentState,
      dominantState: recognitionResult?.state_profile?.dominant_state || 'live-window',
      recognitionResult,
      bands: analysis?.bandPowers || [],
      liveMuseSession: {
        ...(liveMuseSessionRef.current || {}),
        status: 'active',
        analysisCount: liveAnalysisSequenceRef.current,
        lastAnalyzedAt: measuredAt,
      },
      musicProfile,
      measuredAt,
    };

    setStateSnapshot(nextSnapshot);
    saveStorageJSON(STATE_STORAGE_KEY, nextSnapshot);
    setLiveMuseCurrentState(nextCurrentState);
    setLiveMuseMetrics((prev) => ({
      ...prev,
      analysisCount: liveAnalysisSequenceRef.current,
      lastAnalyzedAt: measuredAt,
      nextAnalysisAt: new Date(Date.now() + analysisIntervalMs).toISOString(),
      qualityScore,
      testMode: isCsvTest ? 'csv-mock' : null,
      analysisIntervalSec: Math.round(analysisIntervalMs / 1000),
    }));

    const action = resolveAdaptiveMusicAction({
      currentState: nextCurrentState,
      previousState: livePreviousStateRef.current,
      qualityScore,
      planetSlug,
    });
    livePreviousStateRef.current = nextCurrentState;
    fadeAdaptiveVolumeScaleTo(action.volumeScale);
    setAdaptiveMusicState({
      type: action.type,
      label: action.label,
      reason: action.reason,
      isGenerating: false,
      isCrossfading: action.type === 'crossfade',
    });

    if (action.type === 'crossfade') {
      await requestAdaptiveJourney({ action, nextSnapshot });
    } else if (action.type === 'parameter-adjust') {
      scheduleLiveFeedbackPrompt();
    }

    setLiveMuseStatus('active');
  }, [
    fadeAdaptiveVolumeScaleTo,
    generatedJourney,
    planetMedia,
    planetSlug,
    requestAdaptiveJourney,
    scheduleLiveFeedbackPrompt,
    selectedPlanet,
    volumePercent,
  ]);

  const stopLiveMuseStream = useCallback(async ({ disablePreference = false } = {}) => {
    clearLiveMuseTimers();

    museSubscriptionRef.current?.unsubscribe?.();
    museSubscriptionRef.current = null;

    const disconnectPromise = liveMuseUsesSharedSessionRef.current
      ? stopSharedLiveMuseSession({ disconnect: true })
      : museClientRef.current?.disconnect?.();
    museClientRef.current = null;
    liveMuseUsesSharedSessionRef.current = false;
    Promise.resolve(disconnectPromise).catch((error) => {
      console.warn('Failed to disconnect live Muse stream:', error);
    });

    liveEegBufferRef.current = [];
    liveEegSessionIdRef.current = null;
    liveAnalysisSequenceRef.current = 0;
    setLiveMuseCurrentState(null);
    setAdaptiveVolumeScale(1);
    adaptiveVolumeScaleRef.current = 1;

    if (disablePreference) {
      writeLiveMuseSessionPreference({ enabled: false, disabledAt: new Date().toISOString() });
      setLiveMuseSession(null);
      setLiveMuseStatus('off');
      setAdaptiveMusicState({
        type: 'off',
        label: 'Muse live adaptation off',
        reason: '',
        isGenerating: false,
        isCrossfading: false,
      });
      return;
    }

    setLiveMuseStatus(liveMuseSessionRef.current?.enabled ? 'pending' : 'off');
  }, [clearLiveMuseTimers]);

  const handleStartLiveMuse = useCallback(async (options = {}) => {
    if (museClientRef.current || liveMuseStatus === 'connecting') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get('muse') === 'mock' ? 'mock' : null;
    const savedMode =
      liveMuseSessionRef.current?.streamMode ||
      (liveMuseSessionRef.current?.testMode === 'csv-mock' ? 'mock' : null);
    const mode = options?.modeOverride || urlMode || savedMode || 'web';
    const isCsvTest = mode === 'mock';
    const baselineDurationSec = isCsvTest ? LIVE_MUSE_CSV_TEST_BASELINE_SEC : LIVE_MUSE_BASELINE_SEC;
    const analysisIntervalMs = isCsvTest ? LIVE_MUSE_CSV_TEST_ANALYSIS_INTERVAL_MS : LIVE_MUSE_ANALYSIS_INTERVAL_MS;
    const analysisWindowSec = isCsvTest ? Math.round(analysisIntervalMs / 1000) : LIVE_MUSE_ANALYSIS_WINDOW_SEC;
    const savedEegSessionId = Number(liveMuseSessionRef.current?.eegSessionId) || null;
    liveEegSessionIdRef.current = savedEegSessionId;
    const startedAt = new Date().toISOString();
    const nextSession = {
      ...(liveMuseSessionRef.current || {}),
      enabled: true,
      deviceType: isCsvTest ? 'CSV Mock Muse' : 'Muse S Athena',
      status: 'connecting',
      startedAt,
      eegSessionId: savedEegSessionId,
      baselineDurationSec,
      analysisIntervalSec: Math.round(analysisIntervalMs / 1000),
      analysisWindowSec,
      streamMode: mode,
      testMode: isCsvTest ? 'csv-mock' : null,
      transitionMode: 'crossfade',
      crossfadeDurationSec: LIVE_MUSE_CROSSFADE_DURATION_SEC,
      feedbackCadenceSec: LIVE_MUSE_FEEDBACK_CADENCE_MS / 1000,
    };
    setLiveMuseSession(nextSession);
    writeLiveMuseSessionPreference(nextSession);
    setLiveMuseStatus('connecting');
    setAdaptiveMusicState({
      type: 'connecting',
      label: isCsvTest ? 'CSV EEG 테스트 스트림을 시작합니다.' : 'Muse S Athena 연결을 시작합니다.',
      reason: '',
      isGenerating: false,
      isCrossfading: false,
    });

    try {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('muse') === 'mock' ? 'mock' : 'web';
      let sharedSnapshot = getSharedLiveMuseSnapshot();
      if (!sharedSnapshot.isActive) {
        sharedSnapshot = await startSharedLiveMuseSession({
          mode,
          metadata: { startedAt },
        });
      }

      const client = sharedSnapshot.client;
      if (!client) {
        throw new Error('Muse shared session is not available.');
      }

      museClientRef.current = client;
      liveMuseUsesSharedSessionRef.current = true;

      let eegSessionId = sharedSnapshot.eegSessionId || null;
      try {
        if (!eegSessionId) {
          const startedSession = await startEegSession({
            deviceType: 'Muse S Athena',
            measuredAt: sharedSnapshot.connectedAt || startedAt,
          });
          eegSessionId = startedSession?.eegSessionId || null;
          updateSharedLiveMuseSession({ eegSessionId });
        }
        liveEegSessionIdRef.current = eegSessionId;
      } catch (error) {
        console.warn('Live Muse backend session could not be started. Continuing local live analysis:', error);
      }

      const maxBufferSize = EEG_SAMPLE_RATE * LIVE_MUSE_MAX_LOCAL_BUFFER_SEC;
      const seededReadings = (sharedSnapshot.readings || []).slice(-maxBufferSize);
      const latestSeedReading = seededReadings[seededReadings.length - 1] || null;
      liveEegBufferRef.current = seededReadings;
      museSubscriptionRef.current = subscribeToSharedLiveMuseReadings(handleLiveMuseReading);

      setLiveMuseStatus('calibrating');
      setLiveMuseMetrics((prev) => ({
        ...prev,
        eegSessionId: liveEegSessionIdRef.current,
        sampleCount: seededReadings.length,
        latestValue: latestSeedReading
          ? Number(latestSeedReading?.samples?.[0] ?? latestSeedReading?.channels?.TP9 ?? 0)
          : prev.latestValue,
        nextAnalysisAt: new Date(Date.now() + LIVE_MUSE_ANALYSIS_INTERVAL_MS).toISOString(),
      }));
      setAdaptiveMusicState({
        type: 'calibrating',
        label: isCsvTest
          ? 'CSV 테스트 데이터를 수집합니다. 30초마다 동적 분석을 저장합니다.'
          : '1분 기준선을 수집한 뒤 5분마다 음악을 조정합니다.',
        reason: '',
        isGenerating: false,
        isCrossfading: false,
      });

      const connectedAtMs = Date.parse(sharedSnapshot.connectedAt || startedAt);
      const baselineElapsedMs = Number.isFinite(connectedAtMs) ? Math.max(0, Date.now() - connectedAtMs) : 0;
      const baselineRemainingMs = Math.max(0, (LIVE_MUSE_BASELINE_SEC * 1000) - baselineElapsedMs);

      liveCalibrationTimerRef.current = window.setTimeout(() => {
        liveCalibrationTimerRef.current = null;
        setLiveMuseStatus('active');
        setAdaptiveMusicState((prev) => ({
          ...prev,
          type: 'active',
          label: isCsvTest
            ? 'CSV EEG 테스트 스트림을 수집 중입니다. 다음 30초 분석에서 DB 저장을 확인할 수 있습니다.'
            : 'Muse live EEG를 수집 중입니다. 다음 5분 윈도우에서 음악을 갱신합니다.',
        }));
      }, baselineRemainingMs);

      liveAnalysisTimerRef.current = window.setInterval(() => {
        runLiveMuseAnalysisRef.current?.();
      }, analysisIntervalMs);
    } catch (error) {
      console.error('Failed to start live Muse session:', error);
      await stopLiveMuseStream();
      setLiveMuseStatus('pending');
      setAdaptiveMusicState({
        type: 'error',
        label: 'Muse 연결에 실패했습니다. 다시 연결을 시도할 수 있습니다.',
        reason: error instanceof Error ? error.message : String(error),
        isGenerating: false,
        isCrossfading: false,
      });
    }
  }, [handleLiveMuseReading, liveMuseStatus, runLiveMuseAnalysis, stopLiveMuseStream]);

  const handleStopLiveMuse = useCallback(() => {
    stopLiveMuseStream({ disablePreference: true });
  }, [stopLiveMuseStream]);

  useEffect(() => {
    if (
      entryOnly ||
      liveMuseAutoAttachAttemptedRef.current ||
      liveMuseStatus !== 'pending' ||
      !liveMuseSession?.enabled ||
      !hasActiveSharedLiveMuseSession()
    ) {
      return;
    }

    liveMuseAutoAttachAttemptedRef.current = true;
    handleStartLiveMuse();
  }, [entryOnly, handleStartLiveMuse, liveMuseSession?.enabled, liveMuseStatus]);

  useEffect(() => {
    runLiveMuseAnalysisRef.current = runLiveMuseAnalysis;
  }, [runLiveMuseAnalysis]);

  const goToExplorer = useCallback(() => {
    restoreJourneyLighting('solar-explorer');
    if (typeof onBack === 'function') {
      onBack();
      return;
    }
    navigate('/solar-explorer', { replace: true });
  }, [navigate, onBack, restoreJourneyLighting]);

  const goToHome = useCallback(() => {
    restoreJourneyLighting('home');
    if (typeof onEndJourney === 'function') {
      onEndJourney();
      return;
    }
    navigate('/', { replace: true });
  }, [navigate, onEndJourney, restoreJourneyLighting]);

  useEffect(() => {
    stateSnapshotRef.current = stateSnapshot;
  }, [stateSnapshot]);

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    liveMuseSessionRef.current = liveMuseSession;
  }, [liveMuseSession]);

  useEffect(() => {
    adaptiveVolumeScaleRef.current = adaptiveVolumeScale;
  }, [adaptiveVolumeScale]);

  useEffect(() => {
    clearAiTimers();
    setAiConnected(false);
    setAiModalStage('none');
    setGeneratedJourney(null);
    setDashboardSummary(null);
    setGenerationError('');
    setGenerationNotice('');
    setPlaybackNotice('');
    setGenerationAttempt(0);
    setGenerationStatusIndex(0);
    setGenerationProgressPercent(entryOnly ? 100 : GENERATION_PROGRESS_STEPS[0]);
    setTrackDurationSec(TRACK_DURATION_SEC);
    setPlayheadSec(0);
    setIsPlaying(true);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setAssistantContext(loadStorageJSON(AI_CONTEXT_STORAGE_KEY, null));
    setCurrentStep(entryOnly ? STEP_SEATING : STEP_GENERATING);
  }, [clearAiTimers, entryOnly, selectedPlanet]);

  useEffect(() => {
    if (entryOnly) return undefined;

    const controller = new AbortController();

    prewarmJourneyGeneration({ signal: controller.signal }).catch((error) => {
      if (!controller.signal.aborted) {
        console.warn('Journey generation prewarm failed:', error);
      }
    });

    return () => controller.abort();
  }, [entryOnly, selectedPlanet]);

  useEffect(() => {
    if (entryOnly || currentStep !== STEP_GENERATING) return undefined;

    const persistedSnapshot = loadStorageJSON(STATE_STORAGE_KEY, null);
    const journeySnapshot = persistedSnapshot || stateSnapshotRef.current || null;
    const normalizedIntentContext = assistantContext
      ? {
          intentText: assistantContext?.intentText || '',
          recommendation: assistantContext?.recommendation?.output || null,
          coach: assistantContext?.coach?.output || null,
          intent_tags: assistantContext?.recommendation?.output?.intent_tags || [],
          recommendedDurationSec:
            assistantContext?.coach?.output?.recommended_duration_sec ||
            assistantContext?.recommendation?.output?.recommended_duration_sec ||
            JOURNEY_GENERATION_DURATION_SEC,
        }
      : null;
    if (persistedSnapshot) {
      setStateSnapshot(persistedSnapshot);
    }

    const controller = new AbortController();
    let isCancelled = false;
    let progressIndex = 0;

    setGenerationError('');
    setGenerationNotice('');
    setPlaybackNotice('');
    setGenerationProgressPercent(GENERATION_PROGRESS_STEPS[0]);
    setGenerationStatusIndex(0);

    const progressTimerId = window.setInterval(() => {
      progressIndex = Math.min(progressIndex + 1, GENERATION_PROGRESS_STEPS.length - 1);
      setGenerationProgressPercent((prev) => Math.max(prev, GENERATION_PROGRESS_STEPS[progressIndex]));
    }, 2600);

    const statusTimerId = window.setInterval(() => {
      setGenerationStatusIndex((prev) => Math.min(prev + 1, GENERATION_STATUS_LINES.length - 1));
    }, 4300);

    const startTimerId = window.setTimeout(async () => {
      try {
        const bundle = await generateJourneyBundle({
          planet: selectedPlanet,
          currentState: journeySnapshot?.canonicalState || NEUTRAL_CANONICAL_STATE,
          recognitionResult: journeySnapshot?.recognitionResult || null,
          durationSec: normalizedIntentContext?.recommendedDurationSec || JOURNEY_GENERATION_DURATION_SEC,
          candidateCountOverride: 1,
          feedbackHistory: feedbackHistory.slice(0, 12),
          memoText,
          intentContext: normalizedIntentContext,
          signal: controller.signal,
        });

        if (isCancelled) return;

        const nextDuration = Number(bundle?.audioDurationSec);
        const lightingJobId = bundle?.wizLighting?.jobId || (bundle?.wizLighting?.active ? 'active' : '');
        if (lightingJobId) {
          journeyLightingJobRef.current = lightingJobId;
          lightingRestoreRequestedRef.current = false;
        }
        setGeneratedJourney(bundle);
        setGenerationNotice(
          bundle?.generationWarning ||
            (bundle?.aceStepAvailable === false
              ? `${planetMedia.title} AI 음악 생성 서버가 연결되지 않아 기본 세션 오디오로 전환했습니다.`
              : '')
        );
        setTrackDurationSec(Number.isFinite(nextDuration) && nextDuration > 0 ? Math.round(nextDuration) : TRACK_DURATION_SEC);
        setPlayheadSec(0);
        setIsPlaying(true);
        setGenerationProgressPercent(100);
        setGenerationStatusIndex(GENERATION_STATUS_LINES.length - 1);
        setCurrentStep(STEP_PLAYER);
      } catch (error) {
        if (controller.signal.aborted || isCancelled) return;

        const errorMessage = error instanceof Error ? error.message : '세션 생성에 실패했습니다.';
        console.error('Journey generation failed. Falling back to base player.', error);
        setGeneratedJourney(null);
        setGenerationError('');
        setGenerationNotice(
          `${planetMedia.title} AI 세션 생성이 일시적으로 불안정해 기본 플레이어로 전환했습니다.${
            errorMessage ? ` (${errorMessage})` : ''
          }`
        );
        setTrackDurationSec(TRACK_DURATION_SEC);
        setPlayheadSec(0);
        setIsPlaying(true);
        setGenerationProgressPercent(100);
        setGenerationStatusIndex(GENERATION_STATUS_LINES.length - 1);
        setCurrentStep(STEP_PLAYER);
      }
    }, 120);

    return () => {
      isCancelled = true;
      controller.abort();
      clearInterval(progressTimerId);
      clearInterval(statusTimerId);
      clearTimeout(startTimerId);
    };
  }, [assistantContext, currentStep, entryOnly, feedbackHistory, generationAttempt, memoText, planetMedia.title, selectedPlanet]);

  useEffect(() => {
    if (entryOnly) return;
    const lightingJobId = generatedJourney?.wizLighting?.jobId || (generatedJourney?.wizLighting?.active ? 'active' : '');
    if (!lightingJobId) return;

    journeyLightingJobRef.current = lightingJobId;
    lightingRestoreRequestedRef.current = false;
  }, [entryOnly, generatedJourney?.wizLighting?.active, generatedJourney?.wizLighting?.jobId]);

  useEffect(() => {
    if (entryOnly) return undefined;

    const handlePageHide = () => {
      restoreJourneyLighting('pagehide');
    };
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [entryOnly, restoreJourneyLighting]);

  useEffect(() => {
    if (hasRealAudio || !isPlaying || currentStep !== STEP_PLAYER) return undefined;

    const intervalId = window.setInterval(() => {
      setPlayheadSec((prev) => {
        if (prev >= trackDurationSec) {
          setIsPlaying(false);
          return trackDurationSec;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [currentStep, hasRealAudio, isPlaying, trackDurationSec]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!hasRealAudio || !audio) {
      setTrackDurationSec(TRACK_DURATION_SEC);
      return undefined;
    }

    const handleLoadedMetadata = () => {
      const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? Math.round(audio.duration) : TRACK_DURATION_SEC;
      setTrackDurationSec(duration);
      setPlaybackNotice('');
    };
    const handleCanPlay = () => {
      setPlaybackNotice('');
    };
    const handleTimeUpdate = () => {
      setPlayheadSec(audio.currentTime || 0);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setPlayheadSec(audio.duration || TRACK_DURATION_SEC);
    };
    const handlePlay = () => {
      setIsPlaying(true);
    };
    const handlePause = () => {
      setIsPlaying(false);
    };
    const handleError = () => {
      const message = hasGeneratedJourneyAudio
        ? '생성된 오디오를 불러오지 못했습니다. 잠시 후 다시 시도하거나 PLAY를 눌러 재시도하세요.'
        : '오디오를 불러오지 못했습니다. 잠시 후 다시 시도하세요.';
      setPlaybackNotice(message);
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.load();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [effectivePlanetMedia?.audio, hasGeneratedJourneyAudio, hasRealAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!hasRealAudio || !audio) return;
    audio.volume = Math.max(0, Math.min(1, (volumePercent / 100) * adaptiveVolumeScale));
  }, [adaptiveVolumeScale, hasRealAudio, volumePercent]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!hasRealAudio || !audio) return;

    if (audioPlayRetryRef.current) {
      clearTimeout(audioPlayRetryRef.current);
      audioPlayRetryRef.current = null;
    }

    if (currentStep !== STEP_PLAYER || !isPlaying) {
      audio.pause();
      audioPlayAttemptsRef.current = 0;
      return;
    }

    const tryPlay = () => {
      const playPromise = audio.play();
      if (!playPromise || typeof playPromise.catch !== 'function') return;

      playPromise
        .then(() => {
          audioPlayAttemptsRef.current = 0;
          setPlaybackNotice('');
        })
        .catch((error) => {
          const errorName = String(error?.name || '');
          const isAutoplayBlocked =
            errorName === 'NotAllowedError' || /notallowed/i.test(String(error?.message || ''));

          if (isAutoplayBlocked) {
            setPlaybackNotice('브라우저 자동재생 제한으로 시작되지 않았습니다. PLAY를 눌러 재생을 시작하세요.');
            setIsPlaying(false);
            audioPlayAttemptsRef.current = 0;
            return;
          }

          if (audioPlayAttemptsRef.current >= 8) {
            setPlaybackNotice('오디오 재생을 시작하지 못했습니다. 잠시 후 PLAY를 다시 눌러 주세요.');
            setIsPlaying(false);
            audioPlayAttemptsRef.current = 0;
            return;
          }

          audioPlayAttemptsRef.current += 1;
          audioPlayRetryRef.current = window.setTimeout(() => {
            tryPlay();
          }, 160);
        });
    };

    tryPlay();
  }, [currentStep, hasRealAudio, isPlaying]);

  useEffect(() => {
    if (!pendingAdaptiveAudio?.audioUrl) return undefined;

    const currentAudio = audioRef.current;
    const nextAudio = nextAudioRef.current;
    if (!currentAudio || !nextAudio) return undefined;

    let cancelled = false;
    let intervalId = 0;
    const durationMs = LIVE_MUSE_CROSSFADE_DURATION_SEC * 1000;
    const baseVolume = Math.max(0, Math.min(1, (volumePercent / 100) * adaptiveVolumeScaleRef.current));

    const finishCrossfade = () => {
      if (cancelled) return;
      const handoffTime = nextAudio.currentTime || 0;
      crossfadeHandoffRef.current = {
        audioUrl: pendingAdaptiveAudio.audioUrl,
        currentTime: handoffTime,
      };

      currentAudio.pause();
      currentAudio.volume = baseVolume;
      nextAudio.pause();
      nextAudio.volume = 0;

      const bundleDuration = Number(pendingAdaptiveAudio.bundle?.audioDurationSec);
      setGeneratedJourney(pendingAdaptiveAudio.bundle);
      setTrackDurationSec(Number.isFinite(bundleDuration) && bundleDuration > 0 ? Math.round(bundleDuration) : LIVE_MUSE_ANALYSIS_WINDOW_SEC);
      setPlayheadSec(handoffTime);
      setIsPlaying(true);
      setGenerationNotice(pendingAdaptiveAudio.action?.label || pendingAdaptiveAudio.bundle?.generationWarning || '');
      setPendingAdaptiveAudio(null);
      setAdaptiveMusicState((prev) => ({
        ...prev,
        isCrossfading: false,
        type: 'active',
      }));
    };

    const beginCrossfade = async () => {
      try {
        nextAudio.pause();
        nextAudio.currentTime = 0;
        nextAudio.volume = 0;
        nextAudio.load();
        await nextAudio.play();

        const startedAt = Date.now();
        intervalId = window.setInterval(() => {
          const progress = Math.min(1, (Date.now() - startedAt) / durationMs);
          const eased = 1 - ((1 - progress) ** 2);

          currentAudio.volume = baseVolume * (1 - eased);
          nextAudio.volume = baseVolume * eased;

          if (progress >= 1) {
            clearInterval(intervalId);
            intervalId = 0;
            finishCrossfade();
          }
        }, 120);
      } catch (error) {
        console.warn('Adaptive crossfade failed. Switching track without overlap:', error);
        finishCrossfade();
      }
    };

    beginCrossfade();

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
      nextAudio.pause();
      nextAudio.volume = 0;
      currentAudio.volume = baseVolume;
    };
  }, [pendingAdaptiveAudio, volumePercent]);

  useEffect(() => {
    const handoff = crossfadeHandoffRef.current;
    const audio = audioRef.current;
    if (!handoff || !audio || effectivePlanetMedia?.audio !== handoff.audioUrl) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      const baseVolume = Math.max(0, Math.min(1, (volumePercent / 100) * adaptiveVolumeScaleRef.current));
      audio.currentTime = handoff.currentTime || 0;
      audio.volume = baseVolume;
      if (isPlaying) {
        audio.play().catch((error) => {
          console.warn('Adaptive crossfade handoff play failed:', error);
        });
      }
      crossfadeHandoffRef.current = null;
    }, 80);

    return () => clearTimeout(timeoutId);
  }, [effectivePlanetMedia?.audio, isPlaying, volumePercent]);

  useEffect(() => {
    const audio = audioRef.current;
    const nextAudio = nextAudioRef.current;
    return () => {
      clearAiTimers();
      clearRouteTimers();
      if (audioPlayRetryRef.current) {
        clearTimeout(audioPlayRetryRef.current);
        audioPlayRetryRef.current = null;
      }
      if (crossfadeTimerRef.current) {
        clearInterval(crossfadeTimerRef.current);
        crossfadeTimerRef.current = null;
      }
      stopLiveMuseStream();
      restoreJourneyLighting('unmount');
      audio?.pause();
      nextAudio?.pause();
    };
  }, [clearAiTimers, clearRouteTimers, restoreJourneyLighting, stopLiveMuseStream]);

  const feedbackAverage = useMemo(() => {
    if (!feedbackHistory.length) return null;
    const sum = feedbackHistory.reduce((acc, entry) => acc + Number(entry.rating || 0), 0);
    return (sum / feedbackHistory.length).toFixed(1);
  }, [feedbackHistory]);

  const refreshStateSnapshot = useCallback(() => {
    setStateSnapshot(loadStorageJSON(STATE_STORAGE_KEY, null));
  }, []);

  useEffect(() => {
    if (entryOnly || currentStep !== STEP_DASHBOARD) return undefined;

    const controller = new AbortController();
    setIsDashboardSummaryLoading(true);

    requestDashboardSummary({
      feedbackHistory,
      memoText,
      currentState: stateSnapshot?.canonicalState || generatedJourney?.currentState || NEUTRAL_CANONICAL_STATE,
      signal: controller.signal,
    })
      .then((response) => {
        if (controller.signal.aborted) return;
        setDashboardSummary(response);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error('Failed to summarize dashboard:', error);
        setDashboardSummary(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsDashboardSummaryLoading(false);
        }
      });

    return () => controller.abort();
  }, [currentStep, entryOnly, feedbackHistory, generatedJourney?.currentState, memoText, stateSnapshot?.canonicalState]);

  const handleSeatSelect = useCallback(
    (seat) => {
      setTicketData({
        planet: selectedPlanet,
        seat,
      });
      setCurrentStep(STEP_TICKET);
    },
    [selectedPlanet]
  );

  const handleTicketTorn = useCallback(() => {
    if (entryOnly) {
      if (typeof onEntryFadeOutStart === 'function') {
        onEntryFadeOutStart();
      }
      setIsRouteFadingOut(true);
      clearRouteTimers();
      const timerId = window.setTimeout(() => {
        if (typeof onEntryComplete === 'function') {
          onEntryComplete({
            planet: selectedPlanet,
            seat: ticketData?.seat || null,
          });
          return;
        }
        setCurrentStep(STEP_GENERATING);
        setIsRouteFadingOut(false);
      }, ENTRY_MODAL_FADE_OUT_MS);
      routeTimersRef.current.push(timerId);
      return;
    }

    setCurrentStep(STEP_GENERATING);
    setGeneratedJourney(null);
    setGenerationError('');
    setGenerationNotice('');
    setGenerationStatusIndex(0);
    setGenerationProgressPercent(GENERATION_PROGRESS_STEPS[0]);
    setGenerationAttempt((prev) => prev + 1);
    setPlayheadSec(0);
    setIsPlaying(true);
    if (hasRealAudio && audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [clearRouteTimers, entryOnly, hasRealAudio, onEntryComplete, onEntryFadeOutStart, selectedPlanet, ticketData?.seat]);

  const handleOpenDashboard = useCallback(() => {
    refreshStateSnapshot();
    setCurrentStep(STEP_DASHBOARD);
  }, [refreshStateSnapshot]);

  const handleOpenProfile = useCallback(() => {
    setCurrentStep(STEP_PROFILE);
  }, []);

  const handleBackToPlayer = useCallback(() => {
    setCurrentStep(STEP_PLAYER);
  }, []);

  const handleRetryGeneration = useCallback(() => {
    setGeneratedJourney(null);
    setGenerationError('');
    setGenerationNotice('');
    setPlaybackNotice('');
    setGenerationStatusIndex(0);
    setGenerationProgressPercent(GENERATION_PROGRESS_STEPS[0]);
    setGenerationAttempt((prev) => prev + 1);
  }, []);

  const handleContinueWithFallback = useCallback(() => {
    setGenerationError('');
    setGenerationNotice(`${planetMedia.title} 기본 플레이어로 전환했습니다.`);
    setPlaybackNotice('');
    setTrackDurationSec(TRACK_DURATION_SEC);
    setPlayheadSec(0);
    setIsPlaying(true);
    setCurrentStep(STEP_PLAYER);
  }, [planetMedia.title]);

  const handleSaveMemo = useCallback(() => {
    writeStorageText(MEMO_STORAGE_KEY, memoText);
  }, [memoText]);

  const handleProfileInput = useCallback((key, value) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSaveProfile = useCallback(() => {
    saveStorageJSON(PROFILE_STORAGE_KEY, profileForm);
  }, [profileForm]);

  const handleSeek = useCallback((nextSec) => {
    const clamped = Math.max(0, Math.min(trackDurationSec, Number(nextSec) || 0));
    setPlayheadSec(clamped);
    if (hasRealAudio && audioRef.current) {
      audioRef.current.currentTime = clamped;
    }
  }, [hasRealAudio, trackDurationSec]);

  const handleRewind = useCallback(() => {
    setPlayheadSec((prev) => {
      const next = Math.max(prev - 10, 0);
      if (hasRealAudio && audioRef.current) {
        audioRef.current.currentTime = next;
      }
      return next;
    });
  }, [hasRealAudio]);

  const handleForward = useCallback(() => {
    setPlayheadSec((prev) => {
      const next = Math.min(prev + 10, trackDurationSec);
      if (hasRealAudio && audioRef.current) {
        audioRef.current.currentTime = next;
      }
      return next;
    });
  }, [hasRealAudio, trackDurationSec]);

  const handleTogglePlay = useCallback(() => {
    setPlaybackNotice('');
    setIsPlaying((prev) => !prev);
  }, []);

  const handleVolumeChange = useCallback((nextVolume) => {
    const numericValue = Number(nextVolume);
    const clamped = Number.isFinite(numericValue) ? Math.max(0, Math.min(100, numericValue)) : 0;
    setVolumePercent(clamped);
  }, []);

  const handleAskAiObjet = useCallback(() => {
    setAiModalStage('ask');
  }, []);

  const handleAiChoice = useCallback(
    (choice) => {
      if (choice === 'no') {
        setAiModalStage('none');
        return;
      }

      clearAiTimers();
      setAiModalStage('connecting');

      aiTimersRef.current.push(
        window.setTimeout(() => {
          setAiModalStage('success');
        }, 1800)
      );

      aiTimersRef.current.push(
        window.setTimeout(() => {
          setAiConnected(true);
          setAiModalStage('none');
        }, 3300)
      );
    },
    [clearAiTimers]
  );

  const handleDisconnectAiObjet = useCallback(() => {
    clearAiTimers();
    setAiModalStage('disconnecting');
    aiTimersRef.current.push(
      window.setTimeout(() => {
        setAiConnected(false);
        setAiModalStage('none');
      }, 1700)
    );
  }, [clearAiTimers]);

  const handleExitIntent = useCallback(() => {
    setShowExitDialog(true);
  }, []);

  const handleChooseExitType = useCallback((exitType) => {
    setShowExitDialog(false);
    setPendingExitType(exitType);
    setFeedbackScore(0);
    setFeedbackText('');
    setParsedFeedback(null);
    setShowFeedbackDialog(true);
  }, []);

  const handlePreviewFeedbackParse = useCallback(async () => {
    if (!feedbackScore && !feedbackText.trim()) return;

    setIsFeedbackParsing(true);
    try {
      const response = await parseNaturalLanguageFeedback({
        feedbackText,
        rating: feedbackScore || 3,
        planet: selectedPlanet,
        targetState: planetMedia.moodTarget,
        measuredState: stateSnapshot?.title || '측정 데이터 없음',
        measuredSource: stateSnapshot?.sourceLabel || '측정 정보 없음',
        currentState: stateSnapshot?.canonicalState || generatedJourney?.currentState || NEUTRAL_CANONICAL_STATE,
      });
      setParsedFeedback(response);
    } catch (error) {
      console.error('Failed to preview NOOS feedback parse:', error);
    } finally {
      setIsFeedbackParsing(false);
    }
  }, [
    feedbackScore,
    feedbackText,
    generatedJourney?.currentState,
    planetMedia.moodTarget,
    selectedPlanet,
    stateSnapshot?.canonicalState,
    stateSnapshot?.sourceLabel,
    stateSnapshot?.title,
  ]);

  const persistFeedbackAndNavigate = useCallback(async () => {
    if (!feedbackScore || !pendingExitType) return;

    setIsFeedbackParsing(true);
    let feedbackResponse = parsedFeedback;

    try {
      if (!feedbackResponse) {
        feedbackResponse = await parseNaturalLanguageFeedback({
          feedbackText,
          rating: feedbackScore,
          planet: selectedPlanet,
          targetState: planetMedia.moodTarget,
          measuredState: stateSnapshot?.title || '측정 데이터 없음',
          measuredSource: stateSnapshot?.sourceLabel || '측정 정보 없음',
          currentState: stateSnapshot?.canonicalState || generatedJourney?.currentState || NEUTRAL_CANONICAL_STATE,
        });
      }

      setParsedFeedback(feedbackResponse);

      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        rating: feedbackScore,
        feedbackText,
        planet: selectedPlanet,
        planetSlug,
        targetState: planetMedia.moodTarget,
        measuredState: stateSnapshot?.title || '측정 데이터 없음',
        measuredSource: stateSnapshot?.sourceLabel || '측정 정보 없음',
        createdAt: new Date().toISOString(),
        route: pendingExitType,
        llm: feedbackResponse?.output || null,
      };

      const nextHistory = [entry, ...feedbackHistory].slice(0, 40);
      setFeedbackHistory(nextHistory);
      saveStorageJSON(FEEDBACK_STORAGE_KEY, nextHistory);

      setShowFeedbackDialog(false);
      setIsRouteFadingOut(true);

      clearRouteTimers();
      const timerId = window.setTimeout(() => {
        if (pendingExitType === EXIT_TO_PLANETS) {
          goToExplorer();
          return;
        }

        if (pendingExitType === EXIT_TO_HOME) {
          goToHome();
        }
      }, 880);
      routeTimersRef.current.push(timerId);
    } catch (error) {
      console.error('Failed to persist NOOS feedback:', error);
    } finally {
      setIsFeedbackParsing(false);
    }
  }, [
    clearRouteTimers,
    feedbackHistory,
    feedbackScore,
    feedbackText,
    generatedJourney?.currentState,
    goToExplorer,
    goToHome,
    parsedFeedback,
    pendingExitType,
    planetMedia.moodTarget,
    planetSlug,
    selectedPlanet,
    stateSnapshot?.canonicalState,
    stateSnapshot?.sourceLabel,
    stateSnapshot?.title,
  ]);

  const handleSubmitLiveFeedback = useCallback(() => {
    if (!liveFeedbackRating) return;

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      feedbackType: 'product-improvement',
      rating: liveFeedbackRating,
      feedbackText: `제품 개선 피드백 ${liveFeedbackRating}점`,
      desiredChange: 'product_improvement',
      planet: selectedPlanet,
      planetSlug,
      targetState: planetMedia.moodTarget,
      measuredState: stateSnapshot?.title || 'Muse Live EEG 상태',
      measuredSource: stateSnapshot?.sourceLabel || 'Muse S Athena 실시간 측정',
      currentState: liveMuseCurrentState || stateSnapshot?.canonicalState || generatedJourney?.currentState || NEUTRAL_CANONICAL_STATE,
      musicProfile: buildMusicProfileSnapshot({
        planetMedia,
        generatedJourney,
        volumePercent,
        adaptiveVolumeScale: adaptiveVolumeScaleRef.current,
      }),
      recentAction: adaptiveMusicState,
      eegQuality: liveMuseMetrics.qualityScore,
      createdAt: new Date().toISOString(),
      route: 'live-popup',
      llm: null,
    };

    const nextHistory = [entry, ...feedbackHistory].slice(0, 40);
    setFeedbackHistory(nextHistory);
    saveStorageJSON(FEEDBACK_STORAGE_KEY, nextHistory);
    setShowLiveFeedbackDialog(false);
    setLiveFeedbackRating(0);
  }, [
    adaptiveMusicState,
    feedbackHistory,
    generatedJourney,
    liveFeedbackRating,
    liveMuseCurrentState,
    liveMuseMetrics.qualityScore,
    planetMedia,
    planetSlug,
    selectedPlanet,
    stateSnapshot,
    volumePercent,
  ]);

  return (
    <Shell
      $fadeOut={isRouteFadingOut}
      $standalone={isStandalonePage}
      $fadeDurationSec={shellFadeDurationSec}
    >
      <AnimatePresence mode="wait">
        {currentStep === STEP_SEATING && (
          <StepFrame
            key={STEP_SEATING}
            initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
            transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
          >
            <SpaceshipSeating planet={selectedPlanet} onSeatSelect={handleSeatSelect} onBack={goToExplorer} />
          </StepFrame>
        )}

        {currentStep === STEP_TICKET && (
          <StepFrame
            key={STEP_TICKET}
            initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(10px)' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <SpaceTicket ticketData={ticketData} onBack={goToExplorer} onTicketTorn={handleTicketTorn} />
          </StepFrame>
        )}

        {!entryOnly && currentStep === STEP_GENERATING && (
          <StepFrame
            key={STEP_GENERATING}
            initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -14, filter: 'blur(10px)' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <TravelGenerationPage
              planetMedia={effectivePlanetMedia}
              accentColor={accentColor}
              progressPercent={generationProgressPercent}
              statusLines={GENERATION_STATUS_LINES}
              activeStatusIndex={generationStatusIndex}
              stateSnapshot={stateSnapshot}
              errorMessage={generationError}
              onRetry={handleRetryGeneration}
              onContinueFallback={handleContinueWithFallback}
            />
          </StepFrame>
        )}

        {!entryOnly && currentStep === STEP_PLAYER && (
          <StepFrame
            key={STEP_PLAYER}
            style={{ overflowY: 'auto' }}
            initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -14, filter: 'blur(10px)' }}
            transition={{ duration: playerFadeInDuration, ease: [0.16, 1, 0.3, 1] }}
          >
            <TravelPlayerPage
              planetMedia={effectivePlanetMedia}
              accentColor={accentColor}
              playheadSec={playheadSec}
              durationSec={trackDurationSec}
              remainingSec={Math.max(trackDurationSec - playheadSec, 0)}
              isPlaying={isPlaying}
              formatClock={formatClock}
              onOpenDashboard={handleOpenDashboard}
              onOpenProfile={handleOpenProfile}
              onSeek={handleSeek}
              onRewind={handleRewind}
              onForward={handleForward}
              onTogglePlay={handleTogglePlay}
              volumePercent={volumePercent}
              onVolumeChange={handleVolumeChange}
              onAskAiObjet={handleAskAiObjet}
              onDisconnectAiObjet={handleDisconnectAiObjet}
              onExitIntent={handleExitIntent}
              aiConnected={aiConnected}
              generatedJourney={generatedJourney}
              hasGeneratedAudio={hasGeneratedJourneyAudio}
              generationNotice={[generationNotice, playbackNotice].filter(Boolean).join(' ')}
              stateSnapshot={stateSnapshot}
              liveMuseStatus={liveMuseStatus}
              liveMuseMetrics={liveMuseMetrics}
              adaptiveMusicState={adaptiveMusicState}
              onStartLiveMuse={handleStartLiveMuse}
              onStopLiveMuse={handleStopLiveMuse}
            />
          </StepFrame>
        )}

        {!entryOnly && currentStep === STEP_DASHBOARD && (
          <StepFrame
            key={STEP_DASHBOARD}
            initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -14, filter: 'blur(10px)' }}
            transition={{ duration: 0.64, ease: [0.16, 1, 0.3, 1] }}
          >
            <TravelDashboardPage
              stateSnapshot={stateSnapshot}
              planetMedia={effectivePlanetMedia}
              accentColor={accentColor}
              feedbackAverage={feedbackAverage}
              feedbackHistory={feedbackHistory}
              dashboardSummary={dashboardSummary}
              isDashboardSummaryLoading={isDashboardSummaryLoading}
              memoText={memoText}
              onMemoChange={setMemoText}
              onSaveMemo={handleSaveMemo}
              onBack={handleBackToPlayer}
            />
          </StepFrame>
        )}

        {!entryOnly && currentStep === STEP_PROFILE && (
          <StepFrame
            key={STEP_PROFILE}
            initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -14, filter: 'blur(10px)' }}
            transition={{ duration: 0.64, ease: [0.16, 1, 0.3, 1] }}
          >
            <TravelProfilePage
              profileForm={profileForm}
              accentColor={accentColor}
              onInput={handleProfileInput}
              onSave={handleSaveProfile}
              onBack={handleBackToPlayer}
            />
          </StepFrame>
        )}
      </AnimatePresence>

      {!entryOnly && (
        <>
          <audio ref={audioRef} src={effectivePlanetMedia?.audio || undefined} preload="metadata" hidden />
          <audio ref={nextAudioRef} src={pendingAdaptiveAudio?.audioUrl || undefined} preload="auto" hidden />
          <AiObjetDialog
            stage={aiModalStage}
            onChoose={handleAiChoice}
            onClose={() => setAiModalStage('none')}
            accentColor={accentColor}
          />
          <ExitDialog
            open={showExitDialog}
            onSelect={handleChooseExitType}
            onClose={() => setShowExitDialog(false)}
            accentColor={accentColor}
          />
          <FeedbackDialog
            open={showFeedbackDialog}
            value={feedbackScore}
            onChange={setFeedbackScore}
            feedbackText={feedbackText}
            onFeedbackTextChange={setFeedbackText}
            parsedFeedback={parsedFeedback?.output || null}
            isParsing={isFeedbackParsing}
            onPreviewParse={handlePreviewFeedbackParse}
            onSubmit={persistFeedbackAndNavigate}
            onClose={() => setShowFeedbackDialog(false)}
            accentColor={accentColor}
          />
          <LiveFeedbackDialog
            open={showLiveFeedbackDialog}
            value={liveFeedbackRating}
            onChange={setLiveFeedbackRating}
            onSubmit={handleSubmitLiveFeedback}
            onClose={() => setShowLiveFeedbackDialog(false)}
            accentColor={accentColor}
            adaptiveMusicState={adaptiveMusicState}
          />
        </>
      )}
    </Shell>
  );
};

export default SpaceTravel;
