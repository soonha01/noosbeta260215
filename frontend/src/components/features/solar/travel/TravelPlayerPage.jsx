import React, { useMemo, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  Bot,
  LayoutDashboard,
  Music2,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sparkles,
  Star,
  UserRound,
  Volume2,
} from 'lucide-react';
import TravelLightingPreview from './TravelLightingPreview';

const cardIn = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0, 34px, 0) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
`;

const KOREAN_FONT = "'Pretendard Variable', 'Pretendard', 'Freesentation', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const DISPLAY_FONT = "'Instrument Serif', 'GowunBatang', 'Pretendard Variable', serif";
const UI_FONT = KOREAN_FONT;
const LABEL_FONT = "'Poppins', 'Pretendard Variable', 'Pretendard', 'Freesentation', sans-serif";
const NUMERIC_FONT = "'Poppins', 'SF Pro Display', 'Pretendard Variable', 'Freesentation', sans-serif";

const Page = styled.div`
  position: relative;
  min-height: 100%;
  box-sizing: border-box;
  padding: clamp(0.8rem, 2vw, 1.6rem);
  color: #fff;
  overflow: auto;
  font-family: ${UI_FONT};
  word-break: keep-all;
  background:
    linear-gradient(120deg, rgba(0, 0, 0, 0.84), rgba(0, 0, 0, 0.34) 48%, rgba(0, 0, 0, 0.82)),
    url(${({ $background }) => $background});
  background-size: cover;
  background-position: center;
  isolation: isolate;

  &::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: -2;
    background:
      radial-gradient(circle at 22% 18%, ${({ $accent }) => `${$accent || '#ffffff'}42`}, transparent 30%),
      radial-gradient(circle at 78% 78%, rgba(255, 255, 255, 0.18), transparent 26%),
      rgba(0, 0, 0, 0.34);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: fixed;
    inset: 0;
    z-index: -1;
    background:
      linear-gradient(180deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.72)),
      repeating-linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.025) 0,
        rgba(255, 255, 255, 0.025) 1px,
        transparent 1px,
        transparent 8px
      );
    pointer-events: none;
  }
`;

const Stage = styled.div`
  min-height: calc(100vh - clamp(1.6rem, 4vw, 3.2rem));
  display: grid;
  place-items: center;
`;

const GlassCard = styled.section`
  position: relative;
  width: min(100%, 1120px);
  height: min(720px, calc(100vh - 2rem));
  min-height: min(720px, calc(100vh - 2rem));
  overflow: hidden;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.08) 42%, rgba(0, 0, 0, 0.2)),
    ${({ $accent }) => `${$accent || '#ffffff'}12`};
  box-shadow:
    0 30px 90px rgba(0, 0, 0, 0.62),
    inset 1px 1px 0 rgba(255, 255, 255, 0.32);
  backdrop-filter: blur(18px) saturate(128%);
  animation: ${cardIn} 0.62s cubic-bezier(0.22, 1, 0.36, 1) both;

  @media (max-width: 940px) {
    height: auto;
    min-height: auto;
    border-radius: 20px;
  }
`;

const GlassNoise = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.64;
  background:
    radial-gradient(circle at 20% 28%, rgba(255, 255, 255, 0.08), transparent 28%),
    radial-gradient(circle at 84% 68%, rgba(255, 255, 255, 0.08), transparent 30%);
  mix-blend-mode: overlay;
`;

const GlassSpecular = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.34),
    inset -1px -1px 0 rgba(255, 255, 255, 0.08);
`;

const Content = styled.div`
  position: relative;
  z-index: 4;
  height: 100%;
  min-height: inherit;
  box-sizing: border-box;
  padding: clamp(1.15rem, 2.4vw, 2rem);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const TopBar = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
`;

const BrandLockup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
`;

const BrandIcon = styled.span`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: ${({ $accent }) => `${$accent || '#ffffff'}22`};
  color: #fff;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}55`};
`;

const BrandText = styled.div`
  display: grid;
  gap: 0.1rem;
  min-width: 0;
`;

const Kicker = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-family: ${LABEL_FONT};
`;

const BrandTitle = styled.h2`
  margin: 0;
  color: #fff;
  font-size: clamp(34px, 4.6vw, 54px);
  font-weight: 400;
  line-height: 0.9;
  letter-spacing: 0;
  font-family: ${DISPLAY_FONT};
`;

const ActionGroup = styled.div`
  display: inline-flex;
  gap: 0.45rem;
`;

const IconButton = styled.button`
  width: 38px;
  height: 38px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  backdrop-filter: blur(12px);
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    background: ${({ $accent }) => `${$accent || '#ffffff'}25`};
    border-color: ${({ $accent }) => `${$accent || '#ffffff'}82`};
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
  gap: clamp(1rem, 2.6vw, 2rem);
  min-height: 0;
  flex: 1;

  @media (max-width: 940px) {
    grid-template-columns: 1fr;
  }
`;

const LeftStack = styled.div`
  display: grid;
  align-content: start;
  gap: 1rem;
  min-width: 0;
`;

const CoverCard = styled.div`
  width: min(100%, 312px);
  margin: 0 auto;
  padding: 0.76rem;
  border-radius: 24px;
  background: rgba(0, 0, 0, 0.34);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.18);
`;

const CoverImage = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.26)),
    url(${({ $image }) => $image});
  background-size: cover;
  background-position: center;
  box-shadow:
    0 22px 50px rgba(0, 0, 0, 0.38),
    inset 0 0 0 1px rgba(255, 255, 255, 0.12);
`;

const ControlPanel = styled.div`
  border-radius: 22px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(18px);
`;

const TrackCopy = styled.div`
  display: grid;
  gap: 0.25rem;
  margin-bottom: 0.9rem;
`;

const TrackTitle = styled.h3`
  margin: 0;
  color: #fff;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: 0;
  font-family: ${DISPLAY_FONT};
`;

const TrackMeta = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.68);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.45;
`;

const ProgressLine = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.55rem;
  align-items: center;
  margin-bottom: 0.9rem;
`;

const TimeText = styled.span`
  color: rgba(255, 255, 255, 0.88);
  font-size: 11px;
  font-family: ${NUMERIC_FONT};
  font-weight: 500;
  font-variant-numeric: tabular-nums;
`;

const Range = styled.input`
  width: 100%;
  accent-color: ${({ $accent }) => $accent || '#fff'};
  cursor: pointer;

  &[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.3);
    outline: none;
  }

  &[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 13px;
    height: 13px;
    border-radius: 999px;
    background: #fff;
    border: 2px solid ${({ $accent }) => $accent || '#fff'};
    box-shadow: 0 0 14px ${({ $accent }) => `${$accent || '#ffffff'}88`};
  }

  &[type='range']::-moz-range-thumb {
    width: 13px;
    height: 13px;
    border-radius: 999px;
    background: #fff;
    border: 2px solid ${({ $accent }) => $accent || '#fff'};
  }
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PlayerButtons = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.62rem;

  @media (max-width: 520px) {
    justify-content: center;
  }
`;

const SmallButton = styled.button`
  border: 0;
  background: transparent;
  color: #fff;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;

  &:hover {
    transform: scale(1.08);
    background: rgba(255, 255, 255, 0.1);
  }
`;

const PlayButton = styled.button`
  border: 0;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #fff;
  color: #101010;
  cursor: pointer;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.28);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.08);
  }
`;

const VolumeControl = styled.div`
  display: grid;
  grid-template-columns: auto 86px;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.82);

  @media (max-width: 520px) {
    grid-template-columns: auto minmax(0, 1fr);
  }
`;

const RightPanel = styled.div`
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PanelScroll = styled.div`
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.4rem;
  display: grid;
  gap: 0.7rem;

  &::-webkit-scrollbar {
    width: 0;
  }

  @media (max-width: 940px) {
    overflow: visible;
    padding-right: 0;
  }
`;

const GlassPanel = styled.div`
  border-radius: 18px;
  padding: 0.84rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.22);
  box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.08);
`;

const PanelHeader = styled.div`
  display: grid;
  gap: 0.2rem;
  margin-bottom: 0.65rem;
`;

const PanelLabel = styled.p`
  margin: 0;
  color: ${({ $accent }) => `${$accent || '#ffffff'}d4`};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-family: ${LABEL_FONT};
`;

const PanelTitle = styled.h3`
  margin: 0;
  color: #fff;
  font-size: 22px;
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: 0;
  font-family: ${DISPLAY_FONT};
`;

const BodyText = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.58;
`;

const SessionRows = styled.div`
  display: grid;
  gap: 0.48rem;
`;

const SessionRow = styled.div`
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.58rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.2s ease, background 0.2s ease;

  &:hover {
    transform: translateX(3px);
    background: rgba(255, 255, 255, 0.12);
  }
`;

const RowThumb = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background:
    radial-gradient(circle at center, ${({ $accent }) => `${$accent || '#ffffff'}5d`}, transparent 60%),
    url(${({ $image }) => $image});
  background-size: cover;
  background-position: center;
`;

const RowCopy = styled.div`
  min-width: 0;
`;

const RowTitle = styled.p`
  margin: 0;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.25;
  font-family: ${UI_FONT};
`;

const RowBody = styled.p`
  margin: 0.18rem 0 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 11px;
  font-weight: 500;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RowTime = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  font-family: ${NUMERIC_FONT};
  font-weight: 500;
  font-variant-numeric: tabular-nums;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.45rem;

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const MetaCard = styled.div`
  padding: 0.62rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const MetaLabel = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.56);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: ${LABEL_FONT};
`;

const MetaValue = styled.p`
  margin: 0.18rem 0 0;
  color: ${({ $accent }) => $accent || '#fff'};
  font-size: 24px;
  font-weight: 600;
  line-height: 1;
  font-family: ${NUMERIC_FONT};
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

const Chip = styled.span`
  min-height: 24px;
  padding: 0 0.55rem;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}66`};
  background: ${({ $accent }) => `${$accent || '#ffffff'}14`};
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: ${LABEL_FONT};
`;

const InsightList = styled.div`
  display: grid;
  gap: 0.42rem;
`;

const InsightItem = styled.div`
  padding: 0.58rem 0.64rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.76);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
`;

const AiPanel = styled(GlassPanel)`
  border-color: ${({ $accent }) => `${$accent || '#ffffff'}4d`};
  background: ${({ $accent }) => `${$accent || '#ffffff'}16`};
`;

const ActionButton = styled.button`
  min-height: 40px;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}62`};
  border-radius: 14px;
  background: ${({ $danger, $accent }) => ($danger ? 'rgba(255, 84, 84, 0.14)' : `${$accent || '#ffffff'}1c`)};
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0 0.8rem;
  font-size: 12px;
  font-family: ${UI_FONT};
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    background: ${({ $danger, $accent }) => ($danger ? 'rgba(255, 84, 84, 0.22)' : `${$accent || '#ffffff'}2c`)};
  }
`;

const BottomActionRow = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 0.55rem;

  @media (max-width: 520px) {
    ${ActionButton} {
      flex: 1 1 100%;
    }
  }
`;

const Notice = styled.div`
  padding: 0.62rem 0.72rem;
  border-radius: 14px;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}44`};
  background: ${({ $accent }) => `${$accent || '#ffffff'}14`};
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
`;

const AXIS_LABELS = {
  focus_readiness: 'Focus',
  stress_load: 'Stress',
  fatigue_risk: 'Fatigue',
  relaxation_level: 'Relax',
  cortical_arousal: 'Arousal',
  mental_workload: 'Workload',
};

const AXIS_EXPLANATIONS = {
  focus_readiness: '몰입 진입 준비',
  stress_load: '완화할 긴장량',
  fatigue_risk: '지속 방해 피로',
};

const LIVE_MUSE_STATUS_LABELS = {
  off: 'Muse live off',
  pending: 'Muse 연결 대기',
  connecting: 'Muse 연결 중',
  calibrating: '기준선 수집 중',
  active: 'Muse live active',
  analyzing: '최근 5분 분석 중',
  error: 'Muse 연결 오류',
};

const getPlanetSpinDurationSec = (planetTitle) => {
  const key = String(planetTitle || '').trim().toLowerCase();

  switch (key) {
    case 'mercury':
      return 12;
    case 'venus':
      return 14;
    case 'earth':
      return 13;
    case 'mars':
      return 15;
    case 'jupiter':
      return 17;
    case 'saturn':
      return 16;
    case 'uranus':
      return 18;
    case 'neptune':
      return 19;
    case 'pluto':
      return 20;
    default:
      return 15;
  }
};

const formatAxisName = (key) => AXIS_LABELS[key] || key;
const toPercent = (value) => `${Math.round(Number(value || 0) * 100)}%`;
const formatPhaseGoals = (phase) => {
  const goals = Array.isArray(phase?.goals) ? phase.goals : [];
  return goals.join(' · ') || '세션 목표를 정렬하는 중입니다.';
};

const buildFallbackPhases = (planetMedia, durationSec) => [
  {
    name: 'Entry',
    duration_sec: Math.round((durationSec || 90) * 0.28),
    goals: [`${planetMedia.title} 목표 상태로 진입`],
  },
  {
    name: 'Immersion',
    duration_sec: Math.round((durationSec || 90) * 0.44),
    goals: [planetMedia.moodTarget],
  },
  {
    name: 'Return',
    duration_sec: Math.round((durationSec || 90) * 0.28),
    goals: ['감각 안정화'],
  },
];

const TravelPlayerPage = ({
  planetMedia,
  accentColor,
  playheadSec,
  durationSec,
  remainingSec,
  isPlaying,
  formatClock,
  onOpenDashboard,
  onOpenProfile,
  onSeek,
  onRewind,
  onForward,
  onTogglePlay,
  volumePercent,
  onVolumeChange,
  onAskAiObjet,
  onDisconnectAiObjet,
  onExitIntent,
  aiConnected,
  generatedJourney,
  hasGeneratedAudio = false,
  generationNotice,
  stateSnapshot,
  liveMuseStatus = 'off',
  liveMuseMetrics = {},
  adaptiveMusicState = null,
  onStartLiveMuse,
  onStopLiveMuse,
}) => {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const interventionResult = generatedJourney?.interventionResult || {};
  const transitionPlan = interventionResult?.transition_plan || {};
  const currentStateAxes =
    interventionResult?.current_state_axes || generatedJourney?.currentState || stateSnapshot?.canonicalState || {};
  const targetStateAxes = interventionResult?.target_state_axes || {};
  const priorityAxes = (transitionPlan?.change_priority || []).slice(0, 4);
  const transitionPhases = transitionPlan?.phases || [];
  const transitionIntensity = Number(transitionPlan?.transition_intensity || 0);
  const transitionReliability = Number(transitionPlan?.transition_reliability || 0);
  const qualityScore = Number(interventionResult?.input_summary?.quality_score || 0);
  const llmExplanation = generatedJourney?.llmStateExplanation?.output || null;
  const llmCoach = generatedJourney?.llmSessionCoach?.output || null;
  const sessionNotice = generationNotice || generatedJourney?.generationWarning || '';
  const playerMax = Math.max(durationSec || 0, 1);
  const planetSpinDurationSec = getPlanetSpinDurationSec(planetMedia?.title);
  const backgroundImage = planetMedia?.backgroundImage || planetMedia?.image;
  const sessionStatus = hasGeneratedAudio ? 'AI audio generated' : generatedJourney ? 'AI plan synced' : 'planet preset';
  const isCsvMuseTest = liveMuseMetrics?.testMode === 'csv-mock';
  const liveMuseStatusLabel = LIVE_MUSE_STATUS_LABELS[liveMuseStatus] || liveMuseStatus;
  const liveMuseQualityLabel = Number.isFinite(Number(liveMuseMetrics?.qualityScore))
    ? `${Math.round(Number(liveMuseMetrics.qualityScore) * 100)}%`
    : '대기';
  const liveMuseNextLabel = liveMuseMetrics?.nextAnalysisAt
    ? new Date(liveMuseMetrics.nextAnalysisAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: isCsvMuseTest ? '2-digit' : undefined,
      })
    : '대기';
  const liveMuseBaselineChip = isCsvMuseTest ? 'baseline 5s' : 'baseline 1m';
  const liveMuseAnalysisChip = isCsvMuseTest ? 'CSV analysis 30s' : 'analysis 5m';
  const liveMuseNextCaption = isCsvMuseTest ? 'CSV test window' : '5분 윈도우';
  const canStartLiveMuse = ['off', 'pending', 'error'].includes(liveMuseStatus);
  const canStopLiveMuse = ['connecting', 'calibrating', 'active', 'analyzing'].includes(liveMuseStatus);

  const currentStateCards = ['focus_readiness', 'stress_load', 'fatigue_risk'].map((key) => ({
    key,
    label: formatAxisName(key),
    value: toPercent(currentStateAxes?.[key]),
    body: AXIS_EXPLANATIONS[key],
  }));

  const targetStateCards = ['focus_readiness', 'relaxation_level', 'cortical_arousal'].map((key) => ({
    key,
    label: formatAxisName(key),
    value: toPercent(targetStateAxes?.[key]),
  }));

  const sessionRows = useMemo(() => {
    const phases = transitionPhases.length ? transitionPhases : buildFallbackPhases(planetMedia, durationSec);
    return phases.map((phase, index) => ({
      id: `${phase.name}-${index}`,
      title: phase.name || `Phase ${index + 1}`,
      body: formatPhaseGoals(phase),
      duration: `${Math.round(Number(phase.duration_sec || 0))}s`,
    }));
  }, [durationSec, planetMedia, transitionPhases]);

  const handleMouseMove = (event) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    setMousePos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  return (
    <Page $background={backgroundImage} $accent={accentColor}>
      <Stage>
        <GlassCard ref={cardRef} $accent={accentColor} onMouseMove={handleMouseMove}>
          <GlassNoise aria-hidden="true" />
          <GlassSpecular
            aria-hidden="true"
            style={{
              background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.18), rgba(255,255,255,0.05) 32%, transparent 62%)`,
            }}
          />

          <Content>
            <TopBar>
              <BrandLockup>
                <BrandIcon $accent={accentColor}>
                  <Music2 size={21} />
                </BrandIcon>
                <BrandText>
                  <Kicker>NOOS immersive playback</Kicker>
                  <BrandTitle>{planetMedia.title}</BrandTitle>
                </BrandText>
              </BrandLockup>

              <ActionGroup>
                <IconButton type="button" onClick={onOpenProfile} $accent={accentColor} title="Profile">
                  <UserRound size={17} />
                </IconButton>
              </ActionGroup>
            </TopBar>

            <MainGrid>
              <LeftStack>
                <CoverCard>
                  <CoverImage $image={backgroundImage} />
                </CoverCard>

                <ControlPanel>
                  <TrackCopy>
                    <TrackTitle>{planetMedia.trackName}</TrackTitle>
                    <TrackMeta>
                      {hasGeneratedAudio
                        ? `${formatClock(durationSec)} 동안 현재 상태에서 목표 상태 방향으로 이동하도록 설계된 세션`
                        : generatedJourney
                        ? `${formatClock(durationSec)} 동안 AI 개입 벡터와 조명 계획을 유지하는 플레이어`
                        : `${formatClock(durationSec)} 기본 행성 트랙`}
                    </TrackMeta>
                  </TrackCopy>

                  <ProgressLine>
                    <TimeText>{formatClock(playheadSec)}</TimeText>
                    <Range
                      type="range"
                      min={0}
                      max={playerMax}
                      value={Math.min(playheadSec, playerMax)}
                      onChange={(event) => onSeek(Number(event.target.value))}
                      $accent={accentColor}
                    />
                    <TimeText>{formatClock(remainingSec)}</TimeText>
                  </ProgressLine>

                  <ControlRow>
                    <PlayerButtons>
                      <SmallButton type="button" title="Favorite session">
                        <Star size={18} />
                      </SmallButton>
                      <SmallButton type="button" onClick={onRewind} title="Rewind">
                        <SkipBack size={18} />
                      </SmallButton>
                      <PlayButton type="button" onClick={onTogglePlay} title={isPlaying ? 'Pause' : 'Play'}>
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                      </PlayButton>
                      <SmallButton type="button" onClick={onForward} title="Forward">
                        <SkipForward size={18} />
                      </SmallButton>
                      <SmallButton type="button" title="Session loop">
                        <RotateCcw size={17} />
                      </SmallButton>
                    </PlayerButtons>

                    <VolumeControl>
                      <Volume2 size={16} />
                      <Range
                        type="range"
                        min={0}
                        max={100}
                        value={volumePercent}
                        onChange={(event) => onVolumeChange(Number(event.target.value))}
                        $accent={accentColor}
                      />
                    </VolumeControl>
                  </ControlRow>
                </ControlPanel>

                <BottomActionRow>
                  <ActionButton type="button" onClick={onAskAiObjet} $accent={accentColor}>
                    <Bot size={14} />
                    AI Objet 연결
                  </ActionButton>
                  <ActionButton type="button" onClick={onExitIntent} $accent={accentColor} $danger>
                    <Sparkles size={14} />
                    여정 종료
                  </ActionButton>
                  <ActionButton type="button" onClick={onOpenDashboard} $accent={accentColor}>
                    <LayoutDashboard size={14} />
                    대시보드
                  </ActionButton>
                </BottomActionRow>
              </LeftStack>

              <RightPanel>
                <PanelScroll>
                  <GlassPanel>
                    <PanelHeader>
                      <PanelLabel $accent={accentColor}>Session queue</PanelLabel>
                      <PanelTitle>{transitionPlan?.transition_mode || `${planetMedia.moodTarget} flow`}</PanelTitle>
                      <BodyText>
                        {generatedJourney
                          ? '오른쪽 영역은 노래 목록 대신 현재 세션의 페이즈와 상태 개입 정보를 보여줍니다.'
                          : 'AI 생성 정보가 없을 때는 행성 기본 세션 흐름을 기준으로 표시됩니다.'}
                      </BodyText>
                    </PanelHeader>

                    <SessionRows>
                      {sessionRows.map((row) => (
                        <SessionRow key={row.id}>
                          <RowThumb $image={planetMedia.image} $accent={accentColor} />
                          <RowCopy>
                            <RowTitle>{row.title}</RowTitle>
                            <RowBody>{row.body}</RowBody>
                          </RowCopy>
                          <RowTime>{row.duration}</RowTime>
                        </SessionRow>
                      ))}
                    </SessionRows>
                  </GlassPanel>

                  <GlassPanel>
                    <PanelHeader>
                      <PanelLabel $accent={accentColor}>Current state</PanelLabel>
                      <PanelTitle>Session vectors</PanelTitle>
                    </PanelHeader>

                    <MetaGrid>
                      {currentStateCards.map((card) => (
                        <MetaCard key={card.key}>
                          <MetaLabel>{card.label}</MetaLabel>
                          <MetaValue $accent={accentColor}>{card.value}</MetaValue>
                          <BodyText>{card.body}</BodyText>
                        </MetaCard>
                      ))}
                    </MetaGrid>
                  </GlassPanel>

                  <GlassPanel>
                    <PanelHeader>
                      <PanelLabel $accent={accentColor}>Muse live adaptation</PanelLabel>
                      <PanelTitle>{liveMuseStatusLabel}</PanelTitle>
                      <BodyText>
                        {adaptiveMusicState?.label ||
                          'Muse가 연결되면 최근 5분 EEG를 기준으로 유지, 약한 조정, 크로스페이드 전환을 선택합니다.'}
                      </BodyText>
                    </PanelHeader>

                    <MetaGrid>
                      <MetaCard>
                        <MetaLabel>Samples</MetaLabel>
                        <MetaValue $accent={accentColor}>{Math.round(Number(liveMuseMetrics?.sampleCount || 0))}</MetaValue>
                        <BodyText>최근 로컬 버퍼</BodyText>
                      </MetaCard>
                      <MetaCard>
                        <MetaLabel>Quality</MetaLabel>
                        <MetaValue $accent={accentColor}>{liveMuseQualityLabel}</MetaValue>
                        <BodyText>마지막 분석</BodyText>
                      </MetaCard>
                      <MetaCard>
                        <MetaLabel>Next</MetaLabel>
                        <MetaValue $accent={accentColor} style={{ fontSize: 18 }}>{liveMuseNextLabel}</MetaValue>
                        <BodyText>{liveMuseNextCaption}</BodyText>
                      </MetaCard>
                    </MetaGrid>

                    <ChipRow style={{ marginTop: '0.65rem' }}>
                      <Chip $accent={accentColor}>{liveMuseBaselineChip}</Chip>
                      <Chip $accent={accentColor}>{liveMuseAnalysisChip}</Chip>
                      <Chip $accent={accentColor}>crossfade 30s</Chip>
                      {adaptiveMusicState?.reason ? <Chip $accent={accentColor}>{adaptiveMusicState.reason}</Chip> : null}
                    </ChipRow>

                    <BottomActionRow style={{ marginTop: '0.72rem' }}>
                      {canStartLiveMuse ? (
                        <ActionButton type="button" $accent={accentColor} onClick={onStartLiveMuse}>
                          Muse 연결
                        </ActionButton>
                      ) : null}
                      {canStopLiveMuse ? (
                        <ActionButton type="button" $accent={accentColor} onClick={onStopLiveMuse}>
                          Muse 중지
                        </ActionButton>
                      ) : null}
                    </BottomActionRow>
                  </GlassPanel>

                  <GlassPanel>
                    <PanelHeader>
                      <PanelLabel $accent={accentColor}>Target state</PanelLabel>
                      <PanelTitle>{interventionResult?.planet_profile?.goal_label || planetMedia.moodTarget}</PanelTitle>
                      <BodyText>
                        {interventionResult?.planet_profile?.user_description || planetMedia.description}
                      </BodyText>
                    </PanelHeader>

                    <MetaGrid>
                      {targetStateCards.map((card) => (
                        <MetaCard key={card.key}>
                          <MetaLabel>{card.label}</MetaLabel>
                          <MetaValue $accent={accentColor}>{card.value}</MetaValue>
                        </MetaCard>
                      ))}
                    </MetaGrid>
                  </GlassPanel>

                  <GlassPanel>
                    <PanelHeader>
                      <PanelLabel $accent={accentColor}>AI intervention</PanelLabel>
                      <PanelTitle>
                        {Math.round(transitionIntensity * 100)}% intensity · {Math.round(transitionReliability * 100)}%
                        reliability
                      </PanelTitle>
                      <BodyText>
                        입력 품질 {Math.round(qualityScore * 100)}% 기준으로 음악, 조명, 페이즈가 정렬됩니다.
                      </BodyText>
                    </PanelHeader>

                    <ChipRow>
                      <Chip $accent={accentColor}>track {planetMedia.trackName}</Chip>
                      <Chip $accent={accentColor}>{sessionStatus}</Chip>
                      <Chip $accent={accentColor}>source {stateSnapshot?.sourceLabel || 'NOOS baseline'}</Chip>
                      {priorityAxes.map((axis) => (
                        <Chip key={axis} $accent={accentColor}>
                          {formatAxisName(axis)}
                        </Chip>
                      ))}
                    </ChipRow>
                  </GlassPanel>

                  {sessionNotice ? <Notice $accent={accentColor}>{sessionNotice}</Notice> : null}

                  {llmExplanation ? (
                    <GlassPanel>
                      <PanelHeader>
                        <PanelLabel $accent={accentColor}>NOOS brief</PanelLabel>
                        <PanelTitle>{llmExplanation.summary}</PanelTitle>
                      </PanelHeader>
                      {!!llmExplanation.why_now?.length && (
                        <InsightList>
                          {llmExplanation.why_now.map((item) => (
                            <InsightItem key={item}>{item}</InsightItem>
                          ))}
                        </InsightList>
                      )}
                    </GlassPanel>
                  ) : null}

                  {llmCoach ? (
                    <GlassPanel>
                      <PanelHeader>
                        <PanelLabel $accent={accentColor}>Session coach</PanelLabel>
                        <PanelTitle>{llmCoach.session_prompt || '세션 준비 가이드'}</PanelTitle>
                        <BodyText>{llmCoach.focus_frame || llmCoach.success_signal}</BodyText>
                      </PanelHeader>
                      {!!llmCoach.setup_steps?.length && (
                        <InsightList>
                          {llmCoach.setup_steps.map((step) => (
                            <InsightItem key={step}>{step}</InsightItem>
                          ))}
                        </InsightList>
                      )}
                    </GlassPanel>
                  ) : null}

                  <GlassPanel>
                    <PanelHeader>
                      <PanelLabel $accent={accentColor}>Lighting</PanelLabel>
                      <PanelTitle>{planetMedia.title} light pattern</PanelTitle>
                    </PanelHeader>
                    <TravelLightingPreview preview={planetMedia.lightingPreview} accentColor={accentColor} compact />
                  </GlassPanel>

                  {aiConnected ? (
                    <AiPanel $accent={accentColor}>
                      <PanelHeader>
                        <PanelLabel $accent={accentColor}>AI Objet connected</PanelLabel>
                        <PanelTitle>Control channel is open</PanelTitle>
                        <BodyText>
                          현재 세션 제어 채널이 열려 있습니다. 필요하면 연결을 해제하고 행성 플레이어만 유지할 수 있습니다.
                        </BodyText>
                      </PanelHeader>
                      <ActionButton type="button" $accent={accentColor} onClick={onDisconnectAiObjet}>
                        Disconnect
                      </ActionButton>
                    </AiPanel>
                  ) : null}

                </PanelScroll>
              </RightPanel>
            </MainGrid>
          </Content>

        </GlassCard>
      </Stage>
    </Page>
  );
};

export default React.memo(TravelPlayerPage);
