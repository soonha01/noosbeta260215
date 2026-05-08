import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import SpaceshipSeating from './SpaceshipSeating';
import SpaceTicket from './SpaceTicket';
import TravelGenerationPage from './travel/TravelGenerationPage';
import TravelPlayerPage from './travel/TravelPlayerPage';
import TravelDashboardPage from './travel/TravelDashboardPage';
import TravelProfilePage from './travel/TravelProfilePage';
import { AiObjetDialog, ExitDialog, FeedbackDialog } from './travel/TravelDialogs';
import {
  AI_CONTEXT_STORAGE_KEY,
  DEFAULT_PROFILE,
  EXIT_TO_HOME,
  EXIT_TO_PLANETS,
  FEEDBACK_STORAGE_KEY,
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
} from '../../../lib/noosAiApi';
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
const JOURNEY_GENERATION_DURATION_SEC = 90;
const GENERATION_PROGRESS_STEPS = [8, 16, 28, 41, 55, 68, 80, 89, 95];
const GENERATION_STATUS_LINES = [
  '현재 상태 벡터와 목표 행성 프로필을 정렬하는 중',
  '뇌파/설문 기반 상태 차이를 분석하는 중',
  'ACE-Step 음악 스펙과 조명 패턴을 동기화하는 중',
  '후보 트랙을 생성하고 최종 세션을 확정하는 중',
];
const NEUTRAL_CANONICAL_STATE = {
  focus_readiness: 0.5,
  stress_load: 0.5,
  fatigue_risk: 0.5,
  relaxation_level: 0.5,
  cortical_arousal: 0.5,
  mental_workload: 0.5,
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
  const audioPlayRetryRef = useRef(null);
  const audioPlayAttemptsRef = useRef(0);
  const journeyLightingJobRef = useRef(null);
  const lightingRestoreRequestedRef = useRef(false);
  const stateSnapshotRef = useRef(stateSnapshot);
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
    audio.volume = Math.max(0, Math.min(1, volumePercent / 100));
  }, [hasRealAudio, volumePercent]);

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
    const audio = audioRef.current;
    return () => {
      clearAiTimers();
      clearRouteTimers();
      if (audioPlayRetryRef.current) {
        clearTimeout(audioPlayRetryRef.current);
        audioPlayRetryRef.current = null;
      }
      restoreJourneyLighting('unmount');
      audio?.pause();
    };
  }, [clearAiTimers, clearRouteTimers, restoreJourneyLighting]);

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
        </>
      )}
    </Shell>
  );
};

export default SpaceTravel;
