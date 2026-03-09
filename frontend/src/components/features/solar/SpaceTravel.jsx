import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import SpaceshipSeating from './SpaceshipSeating';
import SpaceTicket from './SpaceTicket';
import TravelPlayerPage from './travel/TravelPlayerPage';
import TravelDashboardPage from './travel/TravelDashboardPage';
import TravelProfilePage from './travel/TravelProfilePage';
import { AiObjetDialog, ExitDialog, FeedbackDialog } from './travel/TravelDialogs';
import {
  DEFAULT_PROFILE,
  EXIT_TO_HOME,
  EXIT_TO_PLANETS,
  FEEDBACK_STORAGE_KEY,
  MEMO_STORAGE_KEY,
  PLANET_MEDIA,
  PROFILE_STORAGE_KEY,
  STATE_STORAGE_KEY,
  STEP_DASHBOARD,
  STEP_PLAYER,
  STEP_PROFILE,
  STEP_SEATING,
  STEP_TICKET,
  TRACK_DURATION_SEC,
} from './travel/constants';
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

  const [currentStep, setCurrentStep] = useState(entryOnly ? STEP_SEATING : STEP_PLAYER);
  const [ticketData, setTicketData] = useState(null);

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
  const [isRouteFadingOut, setIsRouteFadingOut] = useState(false);

  const [stateSnapshot, setStateSnapshot] = useState(() => loadStorageJSON(STATE_STORAGE_KEY, null));
  const [feedbackHistory, setFeedbackHistory] = useState(() => loadStorageJSON(FEEDBACK_STORAGE_KEY, []));
  const [memoText, setMemoText] = useState(() => readStorageText(MEMO_STORAGE_KEY, ''));
  const [profileForm, setProfileForm] = useState(() =>
    loadStorageJSON(PROFILE_STORAGE_KEY, DEFAULT_PROFILE)
  );

  const aiTimersRef = useRef([]);
  const routeTimersRef = useRef([]);
  const audioRef = useRef(null);
  const audioPlayRetryRef = useRef(null);
  const audioPlayAttemptsRef = useRef(0);
  const hasRealAudio = Boolean(planetMedia?.audio);

  const clearAiTimers = useCallback(() => {
    aiTimersRef.current.forEach((timerId) => clearTimeout(timerId));
    aiTimersRef.current = [];
  }, []);

  const clearRouteTimers = useCallback(() => {
    routeTimersRef.current.forEach((timerId) => clearTimeout(timerId));
    routeTimersRef.current = [];
  }, []);

  const goToExplorer = useCallback(() => {
    if (typeof onBack === 'function') {
      onBack();
      return;
    }
    navigate('/solar-explorer', { replace: true });
  }, [navigate, onBack]);

  const goToHome = useCallback(() => {
    if (typeof onEndJourney === 'function') {
      onEndJourney();
      return;
    }
    navigate('/', { replace: true });
  }, [navigate, onEndJourney]);

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

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.load();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [hasRealAudio, planetMedia?.audio]);

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
        })
        .catch(() => {
          if (audioPlayAttemptsRef.current >= 8) {
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
      audio?.pause();
    };
  }, [clearAiTimers, clearRouteTimers]);

  const feedbackAverage = useMemo(() => {
    if (!feedbackHistory.length) return null;
    const sum = feedbackHistory.reduce((acc, entry) => acc + Number(entry.rating || 0), 0);
    return (sum / feedbackHistory.length).toFixed(1);
  }, [feedbackHistory]);

  const refreshStateSnapshot = useCallback(() => {
    setStateSnapshot(loadStorageJSON(STATE_STORAGE_KEY, null));
  }, []);

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
        setCurrentStep(STEP_PLAYER);
        setIsRouteFadingOut(false);
      }, ENTRY_MODAL_FADE_OUT_MS);
      routeTimersRef.current.push(timerId);
      return;
    }

    setCurrentStep(STEP_PLAYER);
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
    setShowFeedbackDialog(true);
  }, []);

  const persistFeedbackAndNavigate = useCallback(() => {
    if (!feedbackScore || !pendingExitType) return;

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      rating: feedbackScore,
      planet: selectedPlanet,
      planetSlug,
      targetState: planetMedia.moodTarget,
      measuredState: stateSnapshot?.title || '측정 데이터 없음',
      measuredSource: stateSnapshot?.sourceLabel || '측정 정보 없음',
      createdAt: new Date().toISOString(),
      route: pendingExitType,
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
  }, [
    clearRouteTimers,
    feedbackHistory,
    feedbackScore,
    goToExplorer,
    goToHome,
    pendingExitType,
    planetMedia.moodTarget,
    planetSlug,
    selectedPlanet,
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

        {!entryOnly && currentStep === STEP_PLAYER && (
          <StepFrame
            key={STEP_PLAYER}
            style={{ overflowY: 'hidden' }}
            initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -14, filter: 'blur(10px)' }}
            transition={{ duration: playerFadeInDuration, ease: [0.16, 1, 0.3, 1] }}
          >
            <TravelPlayerPage
              planetMedia={planetMedia}
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
              planetMedia={planetMedia}
              accentColor={accentColor}
              feedbackAverage={feedbackAverage}
              feedbackHistory={feedbackHistory}
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
          <audio ref={audioRef} src={planetMedia?.audio || undefined} preload="metadata" hidden />
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
        </>
      )}
    </Shell>
  );
};

export default SpaceTravel;
