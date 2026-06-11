import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import SpaceshipSeating from '../SpaceshipSeating';
import SpaceTicket from '../SpaceTicket';
import TravelGenerationPage from './TravelGenerationPage';
import TravelPlayerPage from './TravelPlayerPage';
import TravelDashboardPage from './TravelDashboardPage';
import TravelProfilePage from './TravelProfilePage';
import { AiObjetDialog, ExitDialog, FeedbackDialog, LiveFeedbackDialog } from './TravelDialogs';
import {
  EXIT_TO_HOME,
  EXIT_TO_PLANETS,
  PLANET_MEDIA,
  STATE_STORAGE_KEY,
  STEP_DASHBOARD,
  STEP_GENERATING,
  STEP_PLAYER,
  STEP_PROFILE,
  STEP_SEATING,
  STEP_TICKET,
  TRACK_DURATION_SEC,
} from './constants';
import {
  applyWizLightingPlan,
  buildLightingPreviewFromIntervention,
  generateJourneyBundle,
  prewarmJourneyGeneration,
  buildFallbackCurrentStateFromBandAnalysis,
} from '../../../../lib/noosAiApi';
import { buildDashboardSummary } from '../../../../lib/noosDeterministicInsights';
import {
  LIVE_MUSE_SESSION_EVENT,
  getSharedLiveMuseSnapshot,
  startSharedLiveMuseSession,
  stopSharedLiveMuseSession,
  subscribeToSharedLiveMuseReadings,
  updateSharedLiveMuseSession,
} from '../../../../lib/muse/liveMuseSession';
import { DEFAULT_FFT_SIZE, analyzeEegBands } from '../../../../lib/muse/signalProcessing';
import {
  createEegAnalysisPayload,
  startEegSession,
  submitEegAnalysis,
} from '../../../../lib/eegAnalysisApi';
import {
  loadStorageJSON,
} from './storage';
import { useTravelPersistence } from './useTravelPersistence';
import { useJourneyExitCleanup } from './useJourneyExitCleanup';
import {
  buildBandComparisonFromHistory,
  buildStateComparisonFromBandComparison,
  createBandHistorySnapshot,
} from './travelBandComparison';
import { buildPreviewLightingSpecForWiz } from './travelLightingPlan';
import {
  readLiveMuseSessionPreference,
  writeLiveMuseSessionPreference,
} from './travelLiveMusePreference';
import { buildMusicProfileSnapshot } from './travelMusicProfile';
import { appendTravelRecord } from './travelRecords';
import {
  LIVE_MUSE_ANALYSIS_INTERVAL_MS,
  LIVE_MUSE_ANALYSIS_WINDOW_SEC,
  LIVE_MUSE_BASELINE_SEC,
  LIVE_MUSE_CROSSFADE_DURATION_SEC,
  LIVE_MUSE_CSV_TEST_ANALYSIS_INTERVAL_MS,
  LIVE_MUSE_CSV_TEST_BASELINE_SEC,
  LIVE_MUSE_FEEDBACK_CADENCE_MS,
  NEUTRAL_CANONICAL_STATE,
  createEmptyLiveMuseMetrics,
  createLiveMuseSessionFromSharedSnapshot,
  createQueueAction,
  resolveAdaptiveMusicAction,
  resolveLiveMuseAnalysisIntervalMs,
} from './spaceTravelRuntime';
import { getPlanetAccent } from '../../../../lib/planetAccents';
import { Shell, StepFrame } from './spaceTravel.styles';

const ENTRY_MODAL_FADE_OUT_MS = 1900;
const ENTRY_PLAYER_FADE_IN_SEC = 1.9;
const DEFAULT_PLAYER_FADE_IN_SEC = 1.15;
const ENTRY_SHELL_FADE_SEC = 1.35;
const DEFAULT_SHELL_FADE_SEC = 0.8;
const JOURNEY_GENERATION_DURATION_SEC = 120;
const GENERATION_PROGRESS_STEPS = [8, 16, 28, 41, 55, 68, 80, 89, 95];
const GENERATION_STATUS_LINES = [
  '현재 상태 벡터와 목표 행성 프로필을 정렬하는 중',
  '뇌파/설문 기반 상태 차이를 분석하는 중',
  'ACE-Step 음악 스펙과 조명 패턴을 동기화하는 중',
  '후보 트랙을 생성하고 최종 세션을 확정하는 중',
];
const EEG_SAMPLE_RATE = 256;
const LIVE_MUSE_MAX_LOCAL_BUFFER_SEC = LIVE_MUSE_ANALYSIS_WINDOW_SEC + LIVE_MUSE_BASELINE_SEC + 30;
const LIVE_EEG_PREVIEW_POINT_COUNT = 160;
const LIVE_BAND_SUMMARY_INTERVAL_MS = 15 * 1000;
const LIVE_BAND_SUMMARY_WINDOW_SEC = 30;
const LIVE_BAND_HISTORY_MAX_POINTS = 720;
const LIVE_MUSE_UI_UPDATE_MS = 1500;
const LIVE_MUSE_PREVIEW_REFRESH_MS = 1000;
const LIVE_MUSE_FEEDBACK_AFTER_ADAPT_MS = 90 * 1000;
const LIVE_MUSE_FEEDBACK_PROMPT_PROBABILITY = 0.1;
const LIVE_MUSE_MIN_REGEN_INTERVAL_MS = 4 * 60 * 1000;
const TRACK_QUEUE_PREFETCH_REMAINING_SEC = 70;
const TRACK_QUEUE_CROSSFADE_LEAD_SEC = LIVE_MUSE_CROSSFADE_DURATION_SEC + 0.6;
const TRACK_QUEUE_REPLACE_SAFE_REMAINING_SEC = 35;
const TRACK_QUEUE_RETRY_DELAY_MS = 30 * 1000;
const LIVE_MUSE_AUTO_ATTACH_RETRY_MS = 500;
const LIVE_MUSE_AUTO_ATTACH_POLL_WINDOW_MS = 15 * 1000;
const isAbortError = (error) =>
  error?.name === 'AbortError' || /aborted|abort/i.test(String(error?.message || ''));

const isAutoplayBlockedError = (error) => {
  const errorName = String(error?.name || '');
  const message = String(error?.message || '');
  return errorName === 'NotAllowedError' || /notallowed|user.*gesture/i.test(message);
};

const isPlayRequestInterruptedError = (error) => {
  const errorName = String(error?.name || '');
  const message = String(error?.message || '');
  return (
    errorName === 'AbortError' ||
    /play\(\).*interrupted|play.*interrupted|interrupted by (?:a new load request|a call to pause)/i.test(message)
  );
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
  const [sessionBandComparison, setSessionBandComparison] = useState(null);
  const [isRouteFadingOut, setIsRouteFadingOut] = useState(false);
  const [liveMuseSession, setLiveMuseSession] = useState(readLiveMuseSessionPreference);
  const [liveMuseStatus, setLiveMuseStatus] = useState(liveMuseSession ? 'pending' : 'off');
  const [liveMuseMetrics, setLiveMuseMetrics] = useState(createEmptyLiveMuseMetrics);
  const [liveMusePreviewReadings, setLiveMusePreviewReadings] = useState([]);
  const [liveMuseCurrentState, setLiveMuseCurrentState] = useState(null);
  const [adaptiveMusicState, setAdaptiveMusicState] = useState({
    type: 'idle',
    label: liveMuseSession ? 'Muse 연결 대기 중입니다.' : 'Muse live adaptation off',
    reason: '',
    isGenerating: false,
    isCrossfading: false,
  });
  const [pendingAdaptiveAudio, setPendingAdaptiveAudio] = useState(null);
  const [queuedAdaptiveAudio, setQueuedAdaptiveAudio] = useState(null);
  const [showLiveFeedbackDialog, setShowLiveFeedbackDialog] = useState(false);
  const [liveFeedbackRating, setLiveFeedbackRating] = useState(0);

  const {
    stateSnapshot,
    setStateSnapshot,
    refreshStateSnapshot,
    saveStateSnapshot,
    feedbackHistory,
    saveFeedbackHistory,
    memoText,
    setMemoText,
    saveMemo,
    profileForm,
    updateProfileInput,
    saveProfile,
  } = useTravelPersistence();
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
  const audioSourceAutoResumeRef = useRef(false);
  const audioPlaybackUnlockedRef = useRef(false);
  const journeyLightingJobRef = useRef(null);
  const lightingRestoreRequestedRef = useRef(false);
  const stateSnapshotRef = useRef(stateSnapshot);
  const liveMuseSessionRef = useRef(liveMuseSession);
  const currentStepRef = useRef(currentStep);
  const museClientRef = useRef(null);
  const museSubscriptionRef = useRef(null);
  const liveEegBufferRef = useRef([]);
  const liveBandHistoryRef = useRef([]);
  const liveEegSessionIdRef = useRef(null);
  const liveAnalysisTimerRef = useRef(null);
  const liveBandHistoryTimerRef = useRef(null);
  const liveCalibrationTimerRef = useRef(null);
  const liveUiTimerRef = useRef(null);
  const liveFeedbackTimerRef = useRef(null);
  const liveLastFeedbackAtRef = useRef(0);
  const liveLastAdaptiveGenerationAtRef = useRef(0);
  const liveSessionStartedAtMsRef = useRef(null);
  const livePreviousStateRef = useRef(stateSnapshot?.canonicalState || NEUTRAL_CANONICAL_STATE);
  const liveAnalysisSequenceRef = useRef(0);
  const runLiveMuseAnalysisRef = useRef(null);
  const liveMuseAutoAttachAttemptedRef = useRef(false);
  const liveMuseUsesSharedSessionRef = useRef(false);
  const crossfadeTimerRef = useRef(null);
  const crossfadeHandoffRef = useRef(null);
  const queuedAdaptiveAudioRef = useRef(null);
  const pendingAdaptiveAudioRef = useRef(null);
  const queueGenerationInFlightRef = useRef(false);
  const queueGenerationAbortControllerRef = useRef(null);
  const queueRetryAfterMsRef = useRef(0);
  const latestQueueActionRef = useRef(null);
  const latestQueueSnapshotRef = useRef(stateSnapshot || null);
  const requestQueuedJourneyRef = useRef(null);
  const promoteQueuedAudioToCrossfadeRef = useRef(null);
  const playheadSecRef = useRef(playheadSec);
  const trackDurationSecRef = useRef(trackDurationSec);
  const isPlayingRef = useRef(isPlaying);
  const playbackIntentRef = useRef(isPlaying);
  const adaptiveVolumeScaleRef = useRef(adaptiveVolumeScale);
  const journeyExitInProgressRef = useRef(false);
  const hasRealAudio = Boolean(effectivePlanetMedia?.audio);

  const setPlaybackActive = useCallback((nextIsPlaying) => {
    const normalizedIsPlaying = Boolean(nextIsPlaying);
    playbackIntentRef.current = normalizedIsPlaying;
    isPlayingRef.current = normalizedIsPlaying;
    setIsPlaying(normalizedIsPlaying);
  }, []);

  const shouldResumePrimaryAudio = useCallback(() => (
    !journeyExitInProgressRef.current &&
    playbackIntentRef.current &&
    currentStepRef.current === STEP_PLAYER
  ), []);

  const playPrimaryAudio = useCallback((reason = 'auto-resume', options = {}) => {
    const audio = audioRef.current;
    if (!hasRealAudio || !audio) {
      return false;
    }

    const maxAttempts = Math.max(1, Number(options.maxAttempts || 12));
    const retryDelayMs = Math.max(80, Number(options.retryDelayMs || 180));

    if (audioPlayRetryRef.current) {
      clearTimeout(audioPlayRetryRef.current);
      audioPlayRetryRef.current = null;
    }

    audioSourceAutoResumeRef.current = true;
    setPlaybackActive(true);

    const attemptPlay = (attemptIndex = 0) => {
      if (!shouldResumePrimaryAudio()) {
        audioSourceAutoResumeRef.current = false;
        audioPlayAttemptsRef.current = 0;
        return;
      }

      const playPromise = audio.play();
      if (!playPromise || typeof playPromise.catch !== 'function') {
        audioPlaybackUnlockedRef.current = true;
        audioSourceAutoResumeRef.current = false;
        audioPlayAttemptsRef.current = 0;
        setPlaybackNotice('');
        return;
      }

      playPromise
        .then(() => {
          audioPlaybackUnlockedRef.current = true;
          audioSourceAutoResumeRef.current = false;
          audioPlayAttemptsRef.current = 0;
          setPlaybackNotice('');
        })
        .catch((error) => {
          if (!shouldResumePrimaryAudio()) {
            audioSourceAutoResumeRef.current = false;
            audioPlayAttemptsRef.current = 0;
            return;
          }

          const autoplayBlocked = isAutoplayBlockedError(error);
          const retryableAutoplayBlock = autoplayBlocked && audioPlaybackUnlockedRef.current;
          const retryable =
            isPlayRequestInterruptedError(error) ||
            retryableAutoplayBlock ||
            !autoplayBlocked;

          if (!retryable || attemptIndex >= maxAttempts) {
            audioSourceAutoResumeRef.current = false;
            audioPlayAttemptsRef.current = 0;
            setPlaybackActive(false);
            setPlaybackNotice(
              autoplayBlocked
                ? '브라우저 재생 제한으로 다음 음악이 자동 시작되지 않았습니다. PLAY를 눌러 재생을 시작하세요.'
                : '다음 음악 재생을 시작하지 못했습니다. 잠시 후 PLAY를 다시 눌러 주세요.'
            );
            console.warn(`Primary audio ${reason} failed:`, error);
            return;
          }

          audioSourceAutoResumeRef.current = true;
          audioPlayAttemptsRef.current = attemptIndex + 1;
          audioPlayRetryRef.current = window.setTimeout(() => {
            audioPlayRetryRef.current = null;
            attemptPlay(attemptIndex + 1);
          }, retryDelayMs);
        });
    };

    attemptPlay(0);
    return true;
  }, [hasRealAudio, setPlaybackActive, shouldResumePrimaryAudio]);

  const clearAiTimers = useCallback(() => {
    aiTimersRef.current.forEach((timerId) => clearTimeout(timerId));
    aiTimersRef.current = [];
  }, []);

  const clearRouteTimers = useCallback(() => {
    routeTimersRef.current.forEach((timerId) => clearTimeout(timerId));
    routeTimersRef.current = [];
  }, []);

  const {
    clearLiveMuseTimers,
    restoreJourneyLighting,
    stopJourneyPlaybackAndBackgroundWork,
  } = useJourneyExitCleanup({
    audioRef,
    audioPlayRetryRef,
    audioSourceAutoResumeRef,
    clearAiTimers,
    crossfadeHandoffRef,
    crossfadeTimerRef,
    journeyExitInProgressRef,
    journeyLightingJobRef,
    latestQueueActionRef,
    lightingRestoreRequestedRef,
    liveAnalysisTimerRef,
    liveBandHistoryTimerRef,
    liveCalibrationTimerRef,
    liveFeedbackTimerRef,
    liveUiTimerRef,
    nextAudioRef,
    pendingAdaptiveAudioRef,
    queueGenerationAbortControllerRef,
    queueGenerationInFlightRef,
    queueRetryAfterMsRef,
    queuedAdaptiveAudioRef,
    setAdaptiveMusicState,
    setPendingAdaptiveAudio,
    setPlaybackActive,
    setQueuedAdaptiveAudio,
    setShowLiveFeedbackDialog,
  });

  const syncLiveMusePreviewReadings = useCallback((options = {}) => {
    if (journeyExitInProgressRef.current) {
      return 0;
    }

    const maxBufferSize = EEG_SAMPLE_RATE * LIVE_MUSE_MAX_LOCAL_BUFFER_SEC;
    const localReadings = Array.isArray(liveEegBufferRef.current) ? liveEegBufferRef.current : [];
    let sourceReadings = localReadings;
    let sharedSnapshot = null;

    if (options.includeSharedSnapshot || !sourceReadings.length) {
      sharedSnapshot = getSharedLiveMuseSnapshot();
      const sharedReadings = Array.isArray(sharedSnapshot?.readings) ? sharedSnapshot.readings : [];
      if (sharedReadings.length > sourceReadings.length) {
        sourceReadings = sharedReadings.slice(-maxBufferSize);
        liveEegBufferRef.current = sourceReadings;
      }
    }

    if (sourceReadings.length > maxBufferSize) {
      sourceReadings = sourceReadings.slice(-maxBufferSize);
      liveEegBufferRef.current = sourceReadings;
    }

    const previewReadings = sourceReadings.slice(-LIVE_EEG_PREVIEW_POINT_COUNT);
    const latestReading = previewReadings[previewReadings.length - 1] || sourceReadings[sourceReadings.length - 1] || null;
    const latestValue = Number(
      latestReading?.samples?.[0] ??
        latestReading?.channels?.TP9 ??
        latestReading?.raw?.TP9 ??
        Number.NaN
    );

    setLiveMusePreviewReadings(previewReadings);
    setLiveMuseMetrics((prev) => ({
      ...prev,
      eegSessionId: liveEegSessionIdRef.current || sharedSnapshot?.eegSessionId || prev.eegSessionId,
      sampleCount: sourceReadings.length,
      latestValue: Number.isFinite(latestValue) ? latestValue : prev.latestValue,
    }));

    return previewReadings.length;
  }, []);

  const handleLiveMuseReading = useCallback((reading) => {
    const maxBufferSize = EEG_SAMPLE_RATE * LIVE_MUSE_MAX_LOCAL_BUFFER_SEC;
    liveEegBufferRef.current.push(reading);
    if (liveEegBufferRef.current.length > maxBufferSize) {
      liveEegBufferRef.current.splice(0, liveEegBufferRef.current.length - maxBufferSize);
    }

    if (liveEegBufferRef.current.length === 1) {
      syncLiveMusePreviewReadings();
    }

    if (!liveUiTimerRef.current) {
      liveUiTimerRef.current = window.setTimeout(() => {
        liveUiTimerRef.current = null;
        syncLiveMusePreviewReadings();
      }, LIVE_MUSE_UI_UPDATE_MS);
    }
  }, [syncLiveMusePreviewReadings]);

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

  const appendLiveBandHistorySnapshot = useCallback((analysis, options = {}) => {
    if (!analysis || Number(analysis.sampleCount || 0) < 64) {
      return null;
    }

    const measuredAt = options.measuredAt || new Date().toISOString();
    const measuredAtMs = Date.parse(measuredAt);
    const startedAtMs = liveSessionStartedAtMsRef.current || measuredAtMs || Date.now();
    const elapsedSec = Number.isFinite(measuredAtMs)
      ? (measuredAtMs - startedAtMs) / 1000
      : (Date.now() - startedAtMs) / 1000;
    const snapshot = createBandHistorySnapshot({
      analysis,
      measuredAt,
      elapsedSec,
      windowSec: options.windowSec || LIVE_BAND_SUMMARY_WINDOW_SEC,
      sequence: options.sequence,
      source: options.source,
    });

    liveBandHistoryRef.current.push(snapshot);
    if (liveBandHistoryRef.current.length > LIVE_BAND_HISTORY_MAX_POINTS) {
      liveBandHistoryRef.current.splice(0, liveBandHistoryRef.current.length - LIVE_BAND_HISTORY_MAX_POINTS);
    }

    return snapshot;
  }, []);

  const recordLiveBandSummaryWindow = useCallback(() => {
    const windowReadings = liveEegBufferRef.current.slice(-(EEG_SAMPLE_RATE * LIVE_BAND_SUMMARY_WINDOW_SEC));
    if (windowReadings.length < EEG_SAMPLE_RATE * 10) {
      return;
    }

    const analysis = analyzeEegBands(windowReadings, {
      sampleRate: EEG_SAMPLE_RATE,
      fftSize: DEFAULT_FFT_SIZE,
    });
    appendLiveBandHistorySnapshot(analysis, {
      measuredAt: new Date().toISOString(),
      windowSec: LIVE_BAND_SUMMARY_WINDOW_SEC,
      source: 'front-live-summary',
    });
  }, [appendLiveBandHistorySnapshot]);

  const startAdaptiveCrossfade = useCallback((queuedAudio, transitionReason = 'queue-transition') => {
    if (journeyExitInProgressRef.current) {
      return;
    }

    const bundle = queuedAudio?.bundle || queuedAudio;
    const action = queuedAudio?.action || createQueueAction(transitionReason, '다음 음악으로 부드럽게 전환합니다.');
    const nextAudioUrl = queuedAudio?.audioUrl || bundle?.audioUrl;
    const currentAudioUrl = effectivePlanetMedia?.audio || null;

    if (!nextAudioUrl || !hasRealAudio || !audioRef.current || nextAudioUrl === currentAudioUrl) {
      setGeneratedJourney(bundle);
      setGenerationNotice(action?.label || bundle?.generationWarning || '');
      setPlayheadSec(0);
      setPlaybackActive(true);
      return;
    }

    setPendingAdaptiveAudio({
      bundle,
      action,
      audioUrl: nextAudioUrl,
      transitionReason,
      startedAt: new Date().toISOString(),
    });
    setAdaptiveMusicState((prev) => ({
      ...prev,
      isCrossfading: true,
      label: action?.label || '새 음악으로 부드럽게 전환합니다.',
    }));
  }, [effectivePlanetMedia?.audio, hasRealAudio, setPlaybackActive]);

  const requestQueuedJourney = useCallback(async ({ reason = 'queue-prefetch', action, snapshot, replace = false } = {}) => {
    if (journeyExitInProgressRef.current || currentStepRef.current !== STEP_PLAYER) {
      return null;
    }

    const now = Date.now();
    if (queueGenerationInFlightRef.current) {
      return null;
    }
    if (!replace && queuedAdaptiveAudioRef.current?.audioUrl) {
      return queuedAdaptiveAudioRef.current;
    }
    if (now < queueRetryAfterMsRef.current) {
      return null;
    }

    const queueAction = action || latestQueueActionRef.current || createQueueAction(reason);
    const queueSnapshot = snapshot || latestQueueSnapshotRef.current || stateSnapshotRef.current || null;
    latestQueueActionRef.current = queueAction;
    latestQueueSnapshotRef.current = queueSnapshot || latestQueueSnapshotRef.current;
    queueGenerationInFlightRef.current = true;
    const controller = new AbortController();
    queueGenerationAbortControllerRef.current = controller;

    setAdaptiveMusicState((prev) => ({
      ...prev,
      isGenerating: true,
      label: reason === 'muse-analysis'
        ? '최근 Muse 분석을 다음 queue 음악에 반영합니다.'
        : '현재곡은 유지하고 다음 2분 음악을 미리 준비합니다.',
    }));

    try {
      const bundle = await generateJourneyBundle({
        planet: selectedPlanet,
        currentState: queueSnapshot?.canonicalState || NEUTRAL_CANONICAL_STATE,
        recognitionResult: queueSnapshot?.recognitionResult || null,
        durationSec: JOURNEY_GENERATION_DURATION_SEC,
        candidateCountOverride: 1,
        feedbackHistory: feedbackHistory.slice(0, 12),
        memoText,
        intentContext: {
          queuePrefetch: true,
          queueReason: reason,
          liveMuse: Boolean(liveMuseSessionRef.current?.enabled),
          adaptiveAction: queueAction,
          musicProfile: buildMusicProfileSnapshot({
            planetMedia,
            generatedJourney,
            volumePercent,
            adaptiveVolumeScale: adaptiveVolumeScaleRef.current,
          }),
        },
        signal: controller.signal,
      });

      if (controller.signal.aborted || journeyExitInProgressRef.current || currentStepRef.current !== STEP_PLAYER) {
        return null;
      }

      const audioUrl = bundle?.audioUrl;
      if (!audioUrl) {
        queueRetryAfterMsRef.current = Date.now() + TRACK_QUEUE_RETRY_DELAY_MS;
        if (!journeyExitInProgressRef.current) {
          setGenerationNotice(bundle?.generationWarning || '다음 음악 생성이 지연되어 현재 트랙을 유지합니다.');
        }
        return null;
      }

      const queuedAudio = {
        bundle,
        action: queueAction,
        audioUrl,
        reason,
        preparedAt: new Date().toISOString(),
      };

      queuedAdaptiveAudioRef.current = queuedAudio;
      setQueuedAdaptiveAudio(queuedAudio);
      queueRetryAfterMsRef.current = 0;
      setAdaptiveMusicState((prev) => ({
        ...prev,
        isGenerating: false,
        label: '다음 2분 음악 준비 완료. 곡 끝에서 자연스럽게 전환합니다.',
        reason: queueAction?.reason || prev.reason,
      }));
      return queuedAudio;
    } catch (error) {
      if (isAbortError(error) || journeyExitInProgressRef.current) {
        return null;
      }
      console.error('Failed to generate queued Muse journey:', error);
      queueRetryAfterMsRef.current = Date.now() + TRACK_QUEUE_RETRY_DELAY_MS;
      setGenerationNotice('다음 음악 생성이 지연되어 현재 트랙을 유지합니다.');
      return null;
    } finally {
      if (queueGenerationAbortControllerRef.current === controller) {
        queueGenerationAbortControllerRef.current = null;
      }
      queueGenerationInFlightRef.current = false;
      if (!journeyExitInProgressRef.current && !controller.signal.aborted) {
        setAdaptiveMusicState((prev) => ({ ...prev, isGenerating: false }));
      }
    }
  }, [
    feedbackHistory,
    generatedJourney,
    memoText,
    planetMedia,
    selectedPlanet,
    volumePercent,
  ]);

  const requestAdaptiveJourney = useCallback(async ({ action, nextSnapshot }) => {
    if (journeyExitInProgressRef.current) {
      return;
    }

    const queueAction = action || createQueueAction('muse-analysis');
    latestQueueActionRef.current = queueAction;
    latestQueueSnapshotRef.current = nextSnapshot || latestQueueSnapshotRef.current;

    const hasQueuedAudio = Boolean(queuedAdaptiveAudioRef.current?.audioUrl);
    const remainingSec = Math.max(0, trackDurationSecRef.current - playheadSecRef.current);
    const shouldRefreshQueue = !hasQueuedAudio || remainingSec > TRACK_QUEUE_REPLACE_SAFE_REMAINING_SEC;

    if (action?.type !== 'crossfade') {
      if (!hasQueuedAudio) {
        await requestQueuedJourney({
          reason: 'muse-analysis',
          action: queueAction,
          snapshot: nextSnapshot,
        });
      }
      return;
    }

    const now = Date.now();
    if (
      hasQueuedAudio &&
      now - liveLastAdaptiveGenerationAtRef.current < LIVE_MUSE_MIN_REGEN_INTERVAL_MS
    ) {
      setAdaptiveMusicState((prev) => ({
        ...prev,
        label: '최근 Muse 분석은 다음 queue 방향에 반영됩니다.',
        reason: queueAction.reason || prev.reason,
      }));
      return;
    }

    if (shouldRefreshQueue) {
      liveLastAdaptiveGenerationAtRef.current = now;
      await requestQueuedJourney({
        reason: 'muse-analysis',
        action: queueAction,
        snapshot: nextSnapshot,
        replace: true,
      });
    } else {
      setAdaptiveMusicState((prev) => ({
        ...prev,
        label: '현재 준비된 queue를 유지하고, 다음 생성부터 Muse 분석을 반영합니다.',
        reason: queueAction.reason || prev.reason,
      }));
    }

    scheduleLiveFeedbackPrompt();
  }, [requestQueuedJourney, scheduleLiveFeedbackPrompt]);

  const promoteQueuedAudioToCrossfade = useCallback((transitionReason = 'queue-transition') => {
    if (journeyExitInProgressRef.current) {
      return false;
    }

    if (pendingAdaptiveAudioRef.current?.audioUrl) {
      return false;
    }

    const queuedAudio = queuedAdaptiveAudioRef.current;
    if (!queuedAudio?.audioUrl) {
      return false;
    }

    queuedAdaptiveAudioRef.current = null;
    setQueuedAdaptiveAudio(null);
    startAdaptiveCrossfade(queuedAudio, transitionReason);
    return true;
  }, [startAdaptiveCrossfade]);

  const runLiveMuseAnalysis = useCallback(async () => {
    if (journeyExitInProgressRef.current) {
      return;
    }

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
    appendLiveBandHistorySnapshot(analysis, {
      measuredAt,
      windowSec: activeAnalysisWindowSec,
      sequence: liveAnalysisSequenceRef.current,
      source: isCsvTest ? 'csv-analysis-window' : 'muse-analysis-window',
    });
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

    if (journeyExitInProgressRef.current || currentStepRef.current !== STEP_PLAYER) {
      return;
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

    saveStateSnapshot(nextSnapshot);
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
      isCrossfading: false,
    });

    if (action.type === 'crossfade') {
      await requestAdaptiveJourney({ action, nextSnapshot });
    } else if (action.type === 'parameter-adjust') {
      scheduleLiveFeedbackPrompt();
    }

    setLiveMuseStatus('active');
  }, [
    appendLiveBandHistorySnapshot,
    fadeAdaptiveVolumeScaleTo,
    generatedJourney,
    planetMedia,
    planetSlug,
    requestAdaptiveJourney,
    saveStateSnapshot,
    scheduleLiveFeedbackPrompt,
    selectedPlanet,
    volumePercent,
  ]);

  const stopLiveMuseStream = useCallback(async ({ disablePreference = false, disconnect = false } = {}) => {
    clearLiveMuseTimers();

    museSubscriptionRef.current?.unsubscribe?.();
    museSubscriptionRef.current = null;

    let disconnectPromise = null;
    if (disconnect) {
      disconnectPromise = liveMuseUsesSharedSessionRef.current
        ? stopSharedLiveMuseSession({ disconnect: true })
        : museClientRef.current?.disconnect?.();
    } else if (!liveMuseUsesSharedSessionRef.current) {
      disconnectPromise = museClientRef.current?.disconnect?.();
    }

    museClientRef.current = null;
    liveMuseUsesSharedSessionRef.current = false;

    liveEegBufferRef.current = [];
    liveEegSessionIdRef.current = null;
    liveAnalysisSequenceRef.current = 0;
    setLiveMusePreviewReadings([]);
    setLiveMuseMetrics(createEmptyLiveMuseMetrics());
    setLiveMuseCurrentState(null);
    setAdaptiveVolumeScale(1);
    adaptiveVolumeScaleRef.current = 1;

    try {
      await Promise.resolve(disconnectPromise);
    } catch (error) {
      console.warn('Failed to disconnect live Muse stream:', error);
    }

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

    const reuseSharedOnly = Boolean(options?.reuseSharedOnly);
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
    liveBandHistoryRef.current = [];
    liveSessionStartedAtMsRef.current = Date.parse(startedAt) || Date.now();
    setSessionBandComparison(null);
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
      let sharedSnapshot = getSharedLiveMuseSnapshot();
      if (!sharedSnapshot.isActive) {
        if (reuseSharedOnly) {
          setLiveMuseStatus('pending');
          setAdaptiveMusicState({
            type: 'pending',
            label: 'Muse 연결 세션을 기다리는 중입니다. 연결 완료 후 실시간 그래프가 자동으로 표시됩니다.',
            reason: '',
            isGenerating: false,
            isCrossfading: false,
          });
          return;
        }

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
            deviceType: isCsvTest ? 'CSV Mock Muse' : 'Muse S Athena',
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
      const connectedAtMs = Date.parse(sharedSnapshot.connectedAt || startedAt);
      liveSessionStartedAtMsRef.current = Number.isFinite(connectedAtMs) ? connectedAtMs : Date.now();
      liveEegBufferRef.current = seededReadings;
      syncLiveMusePreviewReadings({ includeSharedSnapshot: true });
      museSubscriptionRef.current = subscribeToSharedLiveMuseReadings(handleLiveMuseReading);

      setLiveMuseStatus('calibrating');
      setLiveMuseMetrics((prev) => ({
        ...prev,
        eegSessionId: liveEegSessionIdRef.current,
        sampleCount: seededReadings.length,
        latestValue: latestSeedReading
          ? Number(latestSeedReading?.samples?.[0] ?? latestSeedReading?.channels?.TP9 ?? 0)
          : prev.latestValue,
        nextAnalysisAt: new Date(Date.now() + analysisIntervalMs).toISOString(),
        testMode: isCsvTest ? 'csv-mock' : null,
        analysisIntervalSec: Math.round(analysisIntervalMs / 1000),
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

      const baselineElapsedMs = Number.isFinite(connectedAtMs) ? Math.max(0, Date.now() - connectedAtMs) : 0;
      const baselineRemainingMs = Math.max(0, (baselineDurationSec * 1000) - baselineElapsedMs);

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
      recordLiveBandSummaryWindow();
      liveBandHistoryTimerRef.current = window.setInterval(
        recordLiveBandSummaryWindow,
        LIVE_BAND_SUMMARY_INTERVAL_MS
      );
    } catch (error) {
      console.error('Failed to start live Muse session:', error);
      if (reuseSharedOnly) {
        liveMuseAutoAttachAttemptedRef.current = false;
      }
      await stopLiveMuseStream({ disconnect: !reuseSharedOnly });
      setLiveMuseStatus('pending');
      setAdaptiveMusicState({
        type: 'error',
        label: 'Muse 연결에 실패했습니다. 다시 연결을 시도할 수 있습니다.',
        reason: error instanceof Error ? error.message : String(error),
        isGenerating: false,
        isCrossfading: false,
      });
    }
  }, [
    handleLiveMuseReading,
    liveMuseStatus,
    recordLiveBandSummaryWindow,
    runLiveMuseAnalysis,
    stopLiveMuseStream,
    syncLiveMusePreviewReadings,
  ]);

  useEffect(() => {
    const hydrateLiveMuseSession = (event) => {
      const sessionFromStorage = readLiveMuseSessionPreference();
      const sessionFromShared = createLiveMuseSessionFromSharedSnapshot(event?.detail);
      const nextSession = sessionFromStorage || sessionFromShared;

      if (!nextSession?.enabled) {
        return;
      }

      setLiveMuseSession((prev) => ({
        ...(prev || {}),
        ...nextSession,
      }));
      setLiveMuseStatus((status) => (status === 'off' ? 'pending' : status));
      setAdaptiveMusicState((prev) => {
        if (prev.type !== 'off' && prev.label !== 'Muse live adaptation off') {
          return prev;
        }

        return {
          ...prev,
          type: 'idle',
          label: 'Muse 연결 대기 중입니다.',
        };
      });
    };

    hydrateLiveMuseSession();
    window.addEventListener(LIVE_MUSE_SESSION_EVENT, hydrateLiveMuseSession);
    window.addEventListener('storage', hydrateLiveMuseSession);

    return () => {
      window.removeEventListener(LIVE_MUSE_SESSION_EVENT, hydrateLiveMuseSession);
      window.removeEventListener('storage', hydrateLiveMuseSession);
    };
  }, []);

  useEffect(() => {
    if (
      entryOnly ||
      liveMuseAutoAttachAttemptedRef.current ||
      liveMuseStatus !== 'pending' ||
      !liveMuseSession?.enabled
    ) {
      return undefined;
    }

    let stopped = false;
    let intervalId = null;

    const tryAttachSharedMuseSession = () => {
      if (
        stopped ||
        liveMuseAutoAttachAttemptedRef.current ||
        museClientRef.current ||
        liveMuseStatus !== 'pending'
      ) {
        return true;
      }

      const sharedSnapshot = getSharedLiveMuseSnapshot();
      if (!sharedSnapshot.isActive) {
        return false;
      }

      const sessionFromShared = createLiveMuseSessionFromSharedSnapshot(sharedSnapshot);
      if (sessionFromShared) {
        setLiveMuseSession((prev) => ({
          ...(prev || {}),
          ...sessionFromShared,
        }));
      }

      liveMuseAutoAttachAttemptedRef.current = true;
      void handleStartLiveMuse({ reuseSharedOnly: true });
      return true;
    };

    if (tryAttachSharedMuseSession()) {
      return undefined;
    }

    const handleSharedMuseChange = () => {
      if (tryAttachSharedMuseSession() && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    window.addEventListener(LIVE_MUSE_SESSION_EVENT, handleSharedMuseChange);
    intervalId = window.setInterval(handleSharedMuseChange, LIVE_MUSE_AUTO_ATTACH_RETRY_MS);

    const timeoutId = window.setTimeout(() => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      if (!stopped && !liveMuseAutoAttachAttemptedRef.current) {
        setAdaptiveMusicState((prev) => ({
          ...prev,
          type: 'pending',
          label: 'Muse 연결 세션을 기다리는 중입니다. 연결 완료 후 실시간 그래프가 자동으로 표시됩니다.',
          isGenerating: false,
          isCrossfading: false,
        }));
      }
    }, LIVE_MUSE_AUTO_ATTACH_POLL_WINDOW_MS);

    return () => {
      stopped = true;
      window.removeEventListener(LIVE_MUSE_SESSION_EVENT, handleSharedMuseChange);
      if (intervalId) clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [entryOnly, handleStartLiveMuse, liveMuseSession?.enabled, liveMuseStatus]);

  useEffect(() => {
    if (
      entryOnly ||
      journeyExitInProgressRef.current ||
      currentStep !== STEP_PLAYER ||
      !liveMuseSession?.enabled ||
      liveMuseStatus === 'off'
    ) {
      return undefined;
    }

    const refreshPreview = () => {
      syncLiveMusePreviewReadings({ includeSharedSnapshot: true });
    };

    refreshPreview();
    const intervalId = window.setInterval(refreshPreview, LIVE_MUSE_PREVIEW_REFRESH_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [
    currentStep,
    entryOnly,
    liveMuseSession?.enabled,
    liveMuseStatus,
    syncLiveMusePreviewReadings,
  ]);

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

  const goToTravelRecords = useCallback(() => {
    restoreJourneyLighting('travel-records');
    if (typeof onEndJourney === 'function') {
      onEndJourney();
      return;
    }
    navigate('/travel-records', { replace: true });
  }, [navigate, onEndJourney, restoreJourneyLighting]);

  useEffect(() => {
    stateSnapshotRef.current = stateSnapshot;
    latestQueueSnapshotRef.current = stateSnapshot || latestQueueSnapshotRef.current;
  }, [stateSnapshot]);

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    liveMuseSessionRef.current = liveMuseSession;
  }, [liveMuseSession]);

  useEffect(() => {
    playheadSecRef.current = playheadSec;
  }, [playheadSec]);

  useEffect(() => {
    trackDurationSecRef.current = trackDurationSec;
  }, [trackDurationSec]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    playbackIntentRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    queuedAdaptiveAudioRef.current = queuedAdaptiveAudio;
  }, [queuedAdaptiveAudio]);

  useEffect(() => {
    pendingAdaptiveAudioRef.current = pendingAdaptiveAudio;
  }, [pendingAdaptiveAudio]);

  useEffect(() => {
    requestQueuedJourneyRef.current = requestQueuedJourney;
  }, [requestQueuedJourney]);

  useEffect(() => {
    promoteQueuedAudioToCrossfadeRef.current = promoteQueuedAudioToCrossfade;
  }, [promoteQueuedAudioToCrossfade]);

  useEffect(() => {
    adaptiveVolumeScaleRef.current = adaptiveVolumeScale;
  }, [adaptiveVolumeScale]);

  useEffect(() => {
    queuedAdaptiveAudioRef.current = null;
    pendingAdaptiveAudioRef.current = null;
    latestQueueActionRef.current = null;
    journeyExitInProgressRef.current = false;
    queueGenerationAbortControllerRef.current?.abort?.();
    queueGenerationAbortControllerRef.current = null;
    queueGenerationInFlightRef.current = false;
    queueRetryAfterMsRef.current = 0;
    setQueuedAdaptiveAudio(null);
    setPendingAdaptiveAudio(null);
  }, [generationAttempt, selectedPlanet]);

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
    setPlaybackActive(true);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setCurrentStep(entryOnly ? STEP_SEATING : STEP_GENERATING);
  }, [clearAiTimers, entryOnly, selectedPlanet, setPlaybackActive]);

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

    const previewLightingSpec = buildPreviewLightingSpecForWiz(
      planetMedia.lightingPreview,
      JOURNEY_GENERATION_DURATION_SEC
    );
    if (previewLightingSpec) {
      applyWizLightingPlan({ lightingSpec: previewLightingSpec, signal: controller.signal })
        .then((status) => {
          if (isCancelled) return;
          const lightingJobId = status?.jobId || (status?.active ? 'active' : '');
          if (lightingJobId) {
            journeyLightingJobRef.current = lightingJobId;
            lightingRestoreRequestedRef.current = false;
          }
        })
        .catch((error) => {
          if (!isAbortError(error)) {
            console.warn('Planet preview lighting apply failed:', error);
          }
        });
    }

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
          durationSec: JOURNEY_GENERATION_DURATION_SEC,
          candidateCountOverride: 1,
          feedbackHistory: feedbackHistory.slice(0, 12),
          memoText,
          intentContext: null,
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
        setPlaybackActive(true);
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
        setPlaybackActive(true);
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
  }, [
    currentStep,
    entryOnly,
    feedbackHistory,
    generationAttempt,
    memoText,
    planetMedia.lightingPreview,
    planetMedia.title,
    selectedPlanet,
    setPlaybackActive,
  ]);

  useEffect(() => {
    if (entryOnly) return;
    const lightingJobId = generatedJourney?.wizLighting?.jobId || (generatedJourney?.wizLighting?.active ? 'active' : '');
    if (!lightingJobId || journeyExitInProgressRef.current) return;

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
    if (journeyExitInProgressRef.current || entryOnly || currentStep !== STEP_PLAYER || pendingAdaptiveAudio?.audioUrl) return;
    if (queuedAdaptiveAudio?.audioUrl || queueGenerationInFlightRef.current) return;

    requestQueuedJourney({ reason: 'player-entry-prefetch' });
  }, [
    currentStep,
    entryOnly,
    generatedJourney?.audioUrl,
    pendingAdaptiveAudio?.audioUrl,
    queuedAdaptiveAudio?.audioUrl,
    requestQueuedJourney,
  ]);

  useEffect(() => {
    if (journeyExitInProgressRef.current || entryOnly || currentStep !== STEP_PLAYER || !hasRealAudio || !isPlaying) return;
    if (pendingAdaptiveAudio?.audioUrl) return;

    const remainingSec = Math.max(0, trackDurationSec - playheadSec);

    if (remainingSec <= TRACK_QUEUE_CROSSFADE_LEAD_SEC) {
      if (promoteQueuedAudioToCrossfade('track-ending')) {
        return;
      }
      if (!queueGenerationInFlightRef.current) {
        requestQueuedJourney({ reason: 'track-ending-recovery' });
      }
      return;
    }

    if (
      remainingSec <= TRACK_QUEUE_PREFETCH_REMAINING_SEC &&
      !queuedAdaptiveAudio?.audioUrl &&
      !queueGenerationInFlightRef.current
    ) {
      requestQueuedJourney({ reason: 'near-end-prefetch' });
    }
  }, [
    currentStep,
    entryOnly,
    hasRealAudio,
    isPlaying,
    pendingAdaptiveAudio?.audioUrl,
    playheadSec,
    promoteQueuedAudioToCrossfade,
    queuedAdaptiveAudio?.audioUrl,
    requestQueuedJourney,
    trackDurationSec,
  ]);

  useEffect(() => {
    if (journeyExitInProgressRef.current || entryOnly || currentStep !== STEP_PLAYER || !hasRealAudio || !isPlaying) return;
    if (pendingAdaptiveAudio?.audioUrl || !queuedAdaptiveAudio?.audioUrl) return;
    if (!['track-ended-recovery', 'track-ending-recovery'].includes(queuedAdaptiveAudio.reason)) return;

    promoteQueuedAudioToCrossfade('delayed-recovery-queue');
  }, [
    currentStep,
    entryOnly,
    hasRealAudio,
    isPlaying,
    pendingAdaptiveAudio?.audioUrl,
    promoteQueuedAudioToCrossfade,
    queuedAdaptiveAudio,
  ]);

  useEffect(() => {
    if (journeyExitInProgressRef.current || hasRealAudio || !isPlaying || currentStep !== STEP_PLAYER) return undefined;

    const intervalId = window.setInterval(() => {
      setPlayheadSec((prev) => {
        if (prev >= trackDurationSec) {
          setPlaybackActive(false);
          return trackDurationSec;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [currentStep, hasRealAudio, isPlaying, setPlaybackActive, trackDurationSec]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!hasRealAudio || !audio) {
      setTrackDurationSec(TRACK_DURATION_SEC);
      return undefined;
    }

    const shouldAutoResume = () =>
      !journeyExitInProgressRef.current &&
      playbackIntentRef.current &&
      currentStepRef.current === STEP_PLAYER;

    const handleLoadedMetadata = () => {
      const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? Math.round(audio.duration) : TRACK_DURATION_SEC;
      setTrackDurationSec(duration);
      setPlaybackNotice('');

      const handoff = crossfadeHandoffRef.current;
      if (handoff?.audioUrl === effectivePlanetMedia?.audio) {
        const handoffTime = Math.max(0, Math.min(Number(handoff.currentTime || 0), Math.max(duration - 0.25, 0)));
        try {
          audio.currentTime = handoffTime;
          setPlayheadSec(handoffTime);
        } catch (error) {
          console.warn('Failed to restore audio handoff time:', error);
        }
      }
    };
    const handleCanPlay = () => {
      setPlaybackNotice('');
      if (audioSourceAutoResumeRef.current || shouldAutoResume()) {
        playPrimaryAudio('canplay', { maxAttempts: 14, retryDelayMs: 180 });
      }
    };
    const handleTimeUpdate = () => {
      setPlayheadSec(audio.currentTime || 0);
    };
    const handleEnded = () => {
      if (journeyExitInProgressRef.current) {
        setPlaybackActive(false);
        return;
      }

      if (promoteQueuedAudioToCrossfadeRef.current?.('track-ended')) {
        return;
      }

      requestQueuedJourneyRef.current?.({ reason: 'track-ended-recovery' });
      setPlaybackNotice('다음 음악을 준비하는 동안 현재 트랙을 한 번 더 유지합니다.');
      audio.currentTime = 0;
      setPlayheadSec(0);
      audioSourceAutoResumeRef.current = true;
      playPrimaryAudio('track-loop-recovery', { maxAttempts: 14, retryDelayMs: 180 });
    };
    const handlePlay = () => {
      if (journeyExitInProgressRef.current) {
        audio.pause();
        return;
      }
      audioPlaybackUnlockedRef.current = true;
      setPlaybackActive(true);
    };
    const handlePause = () => {
      if (audioSourceAutoResumeRef.current || shouldAutoResume()) {
        return;
      }
      setPlaybackActive(false);
    };
    const handleError = () => {
      const message = hasGeneratedJourneyAudio
        ? '생성된 오디오를 불러오지 못했습니다. 잠시 후 다시 시도하거나 PLAY를 눌러 재시도하세요.'
        : '오디오를 불러오지 못했습니다. 잠시 후 다시 시도하세요.';
      setPlaybackNotice(message);
      setPlaybackActive(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audioSourceAutoResumeRef.current =
      !journeyExitInProgressRef.current &&
      (playbackIntentRef.current || isPlayingRef.current) &&
      currentStepRef.current === STEP_PLAYER;
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
  }, [
    effectivePlanetMedia?.audio,
    hasGeneratedJourneyAudio,
    hasRealAudio,
    playPrimaryAudio,
    setPlaybackActive,
  ]);

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

    if (journeyExitInProgressRef.current || currentStep !== STEP_PLAYER || !isPlaying) {
      audioSourceAutoResumeRef.current = false;
      audio.pause();
      audioPlayAttemptsRef.current = 0;
      return;
    }

    playPrimaryAudio('playback-effect', { maxAttempts: 14, retryDelayMs: 180 });
  }, [currentStep, effectivePlanetMedia?.audio, hasRealAudio, isPlaying, playPrimaryAudio]);

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
      if (cancelled || journeyExitInProgressRef.current) return;
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
      audioSourceAutoResumeRef.current = true;
      playbackIntentRef.current = true;
      isPlayingRef.current = true;
      audioPlayAttemptsRef.current = 0;
      setGeneratedJourney(pendingAdaptiveAudio.bundle);
      setTrackDurationSec(Number.isFinite(bundleDuration) && bundleDuration > 0 ? Math.round(bundleDuration) : JOURNEY_GENERATION_DURATION_SEC);
      setPlayheadSec(handoffTime);
      setPlaybackActive(true);
      setPlaybackNotice('');
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
        if (journeyExitInProgressRef.current) return;
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
        audioSourceAutoResumeRef.current = true;
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
  }, [pendingAdaptiveAudio, setPlaybackActive, volumePercent]);

  useEffect(() => {
    const handoff = crossfadeHandoffRef.current;
    const audio = audioRef.current;
    if (journeyExitInProgressRef.current || !handoff || !audio || effectivePlanetMedia?.audio !== handoff.audioUrl) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      const baseVolume = Math.max(0, Math.min(1, (volumePercent / 100) * adaptiveVolumeScaleRef.current));
      try {
        audio.currentTime = handoff.currentTime || 0;
      } catch (error) {
        console.warn('Adaptive crossfade handoff seek failed:', error);
      }
      audio.volume = baseVolume;
      if (playbackIntentRef.current || isPlaying) {
        audioSourceAutoResumeRef.current = true;
        playbackIntentRef.current = true;
        setPlaybackActive(true);
        playPrimaryAudio('crossfade-handoff', { maxAttempts: 18, retryDelayMs: 180 });
      }
      crossfadeHandoffRef.current = null;
    }, 80);

    return () => clearTimeout(timeoutId);
  }, [effectivePlanetMedia?.audio, isPlaying, playPrimaryAudio, setPlaybackActive, volumePercent]);

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
      stopLiveMuseStream({ disconnect: false });
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

  useEffect(() => {
    if (entryOnly || currentStep !== STEP_DASHBOARD) return undefined;

    setIsDashboardSummaryLoading(true);
    const summary = buildDashboardSummary({
      feedbackHistory,
      memoText,
      currentState: stateSnapshot?.canonicalState || generatedJourney?.currentState || NEUTRAL_CANONICAL_STATE,
    });
    setDashboardSummary(summary);
    setIsDashboardSummaryLoading(false);
    return undefined;
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
    setPlaybackActive(true);
    if (hasRealAudio && audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [
    clearRouteTimers,
    entryOnly,
    hasRealAudio,
    onEntryComplete,
    onEntryFadeOutStart,
    selectedPlanet,
    setPlaybackActive,
    ticketData?.seat,
  ]);

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
    setPlaybackActive(true);
    setCurrentStep(STEP_PLAYER);
  }, [planetMedia.title, setPlaybackActive]);

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
    audioSourceAutoResumeRef.current = false;

    if (audioPlayRetryRef.current) {
      clearTimeout(audioPlayRetryRef.current);
      audioPlayRetryRef.current = null;
    }

    const shouldPlay = !isPlayingRef.current;
    const audio = audioRef.current;

    if (!shouldPlay) {
      audio?.pause();
      audioPlayAttemptsRef.current = 0;
      setPlaybackActive(false);
      return;
    }

    setPlaybackActive(true);

    if (!hasRealAudio || !audio) {
      return;
    }

    const playPromise = audio.play();
    if (!playPromise || typeof playPromise.catch !== 'function') {
      audioPlaybackUnlockedRef.current = true;
      return;
    }

    playPromise
      .then(() => {
        audioPlaybackUnlockedRef.current = true;
        audioPlayAttemptsRef.current = 0;
        setPlaybackNotice('');
      })
      .catch((error) => {
        console.warn('User-initiated audio play failed:', error);
        audioPlayAttemptsRef.current = 0;
        if (
          isPlayRequestInterruptedError(error) &&
          playbackIntentRef.current &&
          currentStepRef.current === STEP_PLAYER &&
          !journeyExitInProgressRef.current
        ) {
          audioSourceAutoResumeRef.current = true;
          return;
        }
        setPlaybackActive(false);
        setPlaybackNotice(
          isAutoplayBlockedError(error)
            ? '브라우저 재생 제한으로 시작되지 않았습니다. PLAY를 다시 눌러 재생을 시작하세요.'
            : '오디오 재생을 시작하지 못했습니다. 잠시 후 PLAY를 다시 눌러 주세요.'
        );
      });
  }, [hasRealAudio, setPlaybackActive]);

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
    const sharedSnapshot = getSharedLiveMuseSnapshot();
    const comparisonReadings = liveEegBufferRef.current.length
      ? liveEegBufferRef.current
      : sharedSnapshot.readings || [];
    setSessionBandComparison(
      buildBandComparisonFromHistory({
        snapshots: liveBandHistoryRef.current,
        readings: comparisonReadings,
        sampleRate: EEG_SAMPLE_RATE,
      })
    );
    stopJourneyPlaybackAndBackgroundWork('journey-exit-intent');
    void stopLiveMuseStream({ disablePreference: true, disconnect: true });
    setShowExitDialog(true);
  }, [stopJourneyPlaybackAndBackgroundWork, stopLiveMuseStream]);

  const handleChooseExitType = useCallback((exitType) => {
    setShowExitDialog(false);
    setPendingExitType(exitType);
    setFeedbackScore(0);
    setShowFeedbackDialog(true);
  }, []);

  const persistFeedbackAndNavigate = useCallback(async () => {
    if (!feedbackScore || !pendingExitType) return;

    const sharedSnapshot = getSharedLiveMuseSnapshot();
    const comparisonReadings = liveEegBufferRef.current.length
      ? liveEegBufferRef.current
      : sharedSnapshot.readings || [];
    const resolvedBandComparison = sessionBandComparison || buildBandComparisonFromHistory({
      snapshots: liveBandHistoryRef.current,
      readings: comparisonReadings,
      sampleRate: EEG_SAMPLE_RATE,
    });
    const eegStateComparison = buildStateComparisonFromBandComparison(resolvedBandComparison);
    const fallbackAfterStateAxes =
      liveMuseCurrentState ||
      stateSnapshot?.canonicalState ||
      generatedJourney?.currentState ||
      NEUTRAL_CANONICAL_STATE;
    const fallbackBeforeStateAxes =
      generatedJourney?.currentState ||
      stateSnapshot?.canonicalState ||
      NEUTRAL_CANONICAL_STATE;
    const recordStateAxes = eegStateComparison?.after || fallbackAfterStateAxes;
    const recordBeforeStateAxes = eegStateComparison?.before || fallbackBeforeStateAxes;
    const recordStateComparison = {
      beforeLabel: eegStateComparison?.beforeLabel || 'Before',
      afterLabel: eegStateComparison?.afterLabel || 'After',
      sourceLabel: eegStateComparison?.sourceLabel || null,
      pointCount: eegStateComparison?.pointCount || null,
      pointLabel: eegStateComparison?.pointLabel || null,
      before: recordBeforeStateAxes,
      after: recordStateAxes,
    };
    const dominantBand = (resolvedBandComparison?.bands || []).reduce((strongest, band) => {
      if (!strongest) return band;
      return Number(band.after || 0) > Number(strongest.after || 0) ? band : strongest;
    }, null);

    try {
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        rating: feedbackScore,
        planet: selectedPlanet,
        planetSlug,
        targetState: planetMedia.moodTarget,
        measuredState: stateSnapshot?.title || '측정 데이터 없음',
        measuredSource: recordStateComparison.sourceLabel || stateSnapshot?.sourceLabel || '측정 정보 없음',
        createdAt: new Date().toISOString(),
        route: pendingExitType,
        eegBandComparison: resolvedBandComparison,
        stateAxesBefore: recordBeforeStateAxes,
        stateAxesAfter: recordStateAxes,
        stateAxes: recordStateAxes,
        stateComparison: recordStateComparison,
        dominantBand: dominantBand?.key || null,
      };

      const nextHistory = [entry, ...feedbackHistory].slice(0, 40);
      saveFeedbackHistory(nextHistory);
      appendTravelRecord({
        id: entry.id,
        createdAt: entry.createdAt,
        planet: planetMedia.title || selectedPlanet,
        planetSlug,
        moodTarget: planetMedia.moodTarget,
        trackName: generatedJourney?.trackName || planetMedia.trackName,
        sessionDurationSec: Math.round(Number(playheadSec || 0)),
        trackDurationSec: Math.round(Number(trackDurationSec || 0)),
        route: pendingExitType,
        rating: feedbackScore,
        bandComparison: resolvedBandComparison,
        stateAxesBefore: recordBeforeStateAxes,
        stateAxesAfter: recordStateAxes,
        stateAxes: recordStateAxes,
        stateComparison: recordStateComparison,
        stateTitle: stateSnapshot?.title || '측정 데이터 없음',
        stateSource: recordStateComparison.sourceLabel || stateSnapshot?.sourceLabel || '측정 정보 없음',
        dominantState: stateSnapshot?.dominantState || null,
        dominantBand: dominantBand?.key || null,
        dominantBandLabel: dominantBand?.label || null,
      });

      setShowFeedbackDialog(false);
      setIsRouteFadingOut(true);
      await stopLiveMuseStream({ disablePreference: true, disconnect: true });

      clearRouteTimers();
      const timerId = window.setTimeout(() => {
        if (pendingExitType === EXIT_TO_PLANETS) {
          goToExplorer();
          return;
        }

        if (pendingExitType === EXIT_TO_HOME) {
          goToTravelRecords();
        }
      }, 880);
      routeTimersRef.current.push(timerId);
    } catch (error) {
      console.error('Failed to persist NOOS feedback:', error);
    }
  }, [
    clearRouteTimers,
    feedbackHistory,
    feedbackScore,
    generatedJourney?.currentState,
    generatedJourney?.trackName,
    goToExplorer,
    goToTravelRecords,
    liveMuseCurrentState,
    pendingExitType,
    planetMedia.moodTarget,
    planetMedia.trackName,
    planetSlug,
    playheadSec,
    saveFeedbackHistory,
    selectedPlanet,
    sessionBandComparison,
    stateSnapshot?.canonicalState,
    stateSnapshot?.dominantState,
    stateSnapshot?.sourceLabel,
    stateSnapshot?.title,
    stopLiveMuseStream,
    trackDurationSec,
  ]);

  const handleSubmitLiveFeedback = useCallback(() => {
    if (!liveFeedbackRating) return;

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      feedbackType: 'product-improvement',
      rating: liveFeedbackRating,
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
    saveFeedbackHistory(nextHistory);
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
    saveFeedbackHistory,
    selectedPlanet,
    stateSnapshot,
    volumePercent,
  ]);

  const displayedLiveMuseReadings = liveMusePreviewReadings.length
    ? liveMusePreviewReadings
    : liveEegBufferRef.current.slice(-LIVE_EEG_PREVIEW_POINT_COUNT);

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
              durationSec={trackDurationSec}
              isPlaying={isPlaying}
              onOpenDashboard={handleOpenDashboard}
              onOpenProfile={handleOpenProfile}
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
              liveMuseReadings={displayedLiveMuseReadings}
              adaptiveMusicState={adaptiveMusicState}
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
              onSaveMemo={saveMemo}
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
              onInput={updateProfileInput}
              onSave={saveProfile}
              onBack={handleBackToPlayer}
            />
          </StepFrame>
        )}
      </AnimatePresence>

      {!entryOnly && (
        <>
          <audio ref={audioRef} src={effectivePlanetMedia?.audio || undefined} preload="metadata" hidden />
          <audio
            ref={nextAudioRef}
            src={pendingAdaptiveAudio?.audioUrl || queuedAdaptiveAudio?.audioUrl || undefined}
            preload="auto"
            hidden
          />
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
