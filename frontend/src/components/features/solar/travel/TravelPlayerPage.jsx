import React from 'react';
import styled, { keyframes } from 'styled-components';
import {
  Bot,
  LayoutDashboard,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Sparkles,
  UserRound,
  Volume2,
} from 'lucide-react';
import TravelLightingPreview from './TravelLightingPreview';
import {
  AiConnectedPanel,
  AiConnectedSub,
  AiConnectedTitle,
  AiDisconnectButton,
  BottomActions,
  ControlButton,
  DangerAction,
  IconActionButton,
  PlayButton,
  PlayerCard,
  PlayerIconActions,
  PlayerKicker,
  PlayerMeta,
  PlayerTitle,
  ProgressRange,
  ProgressRow,
  SecondaryAction,
  TimeText,
  TrackDuration,
  TrackHeader,
  TrackName,
  VolumeLabel,
  VolumeRange,
  VolumeRow,
  VolumeValue,
} from './spaceTravel.styles';

const planetTextureRoll = keyframes`
  from {
    background-position-x: 0px;
  }
  to {
    background-position-x: -1200px;
  }
`;

const Page = styled.div`
  min-height: 100%;
  box-sizing: border-box;
  padding: 0.95rem;
  background:
    radial-gradient(circle at 14% 10%, rgba(255, 255, 255, 0.06), transparent 32%),
    radial-gradient(circle at 84% 18%, rgba(255, 255, 255, 0.04), transparent 26%),
    #000;
  color: #f5f7ff;
`;

const Frame = styled.div`
  width: min(100%, 1320px);
  margin: 0 auto;
  display: grid;
  gap: 0.75rem;
`;

const HeaderCard = styled(PlayerCard)`
  padding: 0.9rem 1rem;
  gap: 0.7rem;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  align-items: flex-start;

  @media (max-width: 720px) {
    flex-direction: column;
  }
`;

const HeaderCopy = styled.div`
  display: grid;
  gap: 0.22rem;
  min-width: 0;
`;

const HeaderSummary = styled.p`
  margin: 0;
  color: rgba(232, 239, 252, 0.8);
  font-size: 13px;
  line-height: 1.72;
  max-width: 68ch;
`;

const NoticeBanner = styled.div`
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}36`};
  background: ${({ $accent }) => `${$accent || '#ffffff'}12`};
  color: rgba(241, 246, 255, 0.9);
  padding: 0.72rem 0.8rem;
  font-size: 12px;
  line-height: 1.6;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

const Chip = styled.span`
  min-height: 26px;
  padding: 0 0.58rem;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}52`};
  background: ${({ $accent }) => `${$accent || '#ffffff'}10`};
  color: ${({ $accent }) => $accent || '#fff'};
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

const SessionGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.06fr) minmax(320px, 0.94fr);
  gap: 0.75rem;
  align-items: start;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
`;

const Stack = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const PlanetStage = styled(PlayerCard)`
  position: relative;
  overflow: hidden;
  min-height: 420px;
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 0.7rem;
  background:
    radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.06), transparent 32%),
    linear-gradient(180deg, rgba(8, 8, 8, 0.94), rgba(2, 2, 2, 0.96));
`;

const PlanetAura = styled.div`
  position: absolute;
  inset: 50% auto auto 50%;
  width: clamp(260px, 34vw, 440px);
  height: clamp(260px, 34vw, 440px);
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: radial-gradient(circle, ${({ $accent }) => `${$accent || '#ffffff'}24`}, transparent 68%);
  filter: blur(26px);
`;

const PlanetOrb = styled.div`
  position: relative;
  z-index: 1;
  width: clamp(220px, 28vw, 360px);
  aspect-ratio: 1 / 1;
  border-radius: 999px;
  overflow: hidden;
  background: #060606;
  background-image: url(${({ $image }) => $image});
  background-repeat: repeat-x;
  background-size: auto 100%;
  background-position: 0 50%;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}78`};
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    0 24px 58px rgba(0, 0, 0, 0.58);
  will-change: background-position;
  animation: ${planetTextureRoll} ${({ $spinDurationSec = 24 }) => `${$spinDurationSec}s`} linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const PlanetLabel = styled.p`
  position: relative;
  z-index: 1;
  margin: 0;
  color: rgba(214, 224, 246, 0.72);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

const PlanetTitle = styled.h2`
  position: relative;
  z-index: 1;
  margin: 0;
  color: ${({ $accent }) => $accent || '#fff'};
  font-size: clamp(28px, 4vw, 44px);
  line-height: 0.96;
  letter-spacing: -0.05em;
  text-align: center;
  font-family: 'Freesentation Black', 'Cardinal Fruit', sans-serif;
`;

const PlanetBody = styled.p`
  position: relative;
  z-index: 1;
  margin: 0;
  width: min(100%, 36ch);
  color: rgba(232, 239, 252, 0.82);
  font-size: 13px;
  line-height: 1.68;
  text-align: center;
`;

const SectionHead = styled.div`
  display: grid;
  gap: 0.2rem;
`;

const SectionLabel = styled.p`
  margin: 0;
  color: ${({ $accent }) => `${$accent || '#ffffff'}cc`};
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

const SectionTitle = styled.h3`
  margin: 0;
  color: ${({ $accent }) => $accent || '#fff'};
  font-size: 22px;
  line-height: 1.05;
  letter-spacing: -0.03em;
  font-family: 'Freesentation Bold', 'Cardinal Fruit', sans-serif;
`;

const SectionBody = styled.p`
  margin: 0;
  color: rgba(226, 236, 255, 0.82);
  font-size: 13px;
  line-height: 1.65;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.45rem;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const MetaCard = styled.div`
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}2c`};
  background: rgba(255, 255, 255, 0.03);
  padding: 0.72rem 0.76rem;
  display: grid;
  gap: 0.14rem;
`;

const MetaLabel = styled.p`
  margin: 0;
  color: rgba(205, 217, 241, 0.66);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

const MetaValue = styled.p`
  margin: 0;
  color: ${({ $accent }) => $accent || '#fff'};
  font-size: 20px;
  line-height: 1;
  letter-spacing: -0.05em;
  font-family: 'Freesentation Black', 'Cardinal Fruit', sans-serif;
`;

const MetaBody = styled.p`
  margin: 0.14rem 0 0;
  color: rgba(223, 232, 248, 0.74);
  font-size: 12px;
  line-height: 1.55;
`;

const InsightList = styled.div`
  display: grid;
  gap: 0.4rem;
`;

const InsightItem = styled.div`
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}24`};
  background: rgba(255, 255, 255, 0.025);
  padding: 0.58rem 0.62rem;
  color: rgba(232, 239, 252, 0.82);
  font-size: 12px;
  line-height: 1.58;
`;

const PriorityRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.36rem;
`;

const PriorityChip = styled.span`
  min-height: 24px;
  padding: 0 0.5rem;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}55`};
  background: ${({ $accent }) => `${$accent || '#ffffff'}12`};
  color: ${({ $accent }) => $accent || '#fff'};
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

const PhaseList = styled.div`
  display: grid;
  gap: 0.38rem;
`;

const PhaseCard = styled.div`
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}24`};
  background: rgba(255, 255, 255, 0.025);
  padding: 0.62rem;
  display: grid;
  gap: 0.2rem;
`;

const PhaseTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.6rem;
  align-items: center;
`;

const PhaseTitle = styled.p`
  margin: 0;
  color: ${({ $accent }) => $accent || '#fff'};
  font-size: 12px;
  font-family: 'Freesentation Bold', 'Cardinal Fruit', sans-serif;
`;

const PhaseMeta = styled.p`
  margin: 0;
  color: rgba(212, 224, 245, 0.72);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const PhaseBody = styled.p`
  margin: 0;
  color: rgba(223, 232, 248, 0.78);
  font-size: 11px;
  line-height: 1.55;
`;

const RightActions = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const AXIS_LABELS = {
  focus_readiness: 'Focus readiness',
  stress_load: 'Stress load',
  fatigue_risk: 'Fatigue risk',
  relaxation_level: 'Relaxation',
  cortical_arousal: 'Arousal',
  mental_workload: 'Mental workload',
};

const AXIS_EXPLANATIONS = {
  focus_readiness: '몰입으로 진입할 준비 정도',
  stress_load: '우선 완화가 필요한 긴장량',
  fatigue_risk: '세션 지속을 방해할 수 있는 피로 신호',
};

const getPlanetSpinDurationSec = (planetTitle) => {
  const key = String(planetTitle || '')
    .trim()
    .toLowerCase();

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
}) => {
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
  const currentStateCards = ['focus_readiness', 'stress_load', 'fatigue_risk'].map((key) => ({
    key,
    label: formatAxisName(key),
    value: toPercent(currentStateAxes?.[key]),
    body: AXIS_EXPLANATIONS[key],
  }));
  const playerMax = Math.max(durationSec || 0, 1);
  const planetSpinDurationSec = getPlanetSpinDurationSec(planetMedia?.title);

  return (
    <Page>
      <Frame>
        <HeaderCard $accent={accentColor}>
          <HeaderTop>
            <HeaderCopy>
              <PlayerKicker>NOOS immersive playback</PlayerKicker>
              <PlayerTitle $accent={accentColor}>{planetMedia.title}</PlayerTitle>
              <PlayerMeta $accent={accentColor}>{planetMedia.moodTarget}</PlayerMeta>
            </HeaderCopy>

            <PlayerIconActions>
              <IconActionButton type="button" onClick={onOpenDashboard} $accent={accentColor} title="Dashboard">
                <LayoutDashboard size={15} />
              </IconActionButton>
              <IconActionButton type="button" onClick={onOpenProfile} $accent={accentColor} title="Profile">
                <UserRound size={15} />
              </IconActionButton>
            </PlayerIconActions>
          </HeaderTop>

          <HeaderSummary>
            {hasGeneratedAudio
              ? `${planetMedia.title} 세션이 현재 상태와 목표 상태의 차이를 기준으로 다시 조합되었습니다. 음악과 조명은 같은 리듬으로 움직이도록 동기화되어 있습니다.`
              : generatedJourney
              ? `${planetMedia.title} 세션 개입 계획은 현재 상태와 목표 상태의 차이를 기준으로 다시 조합되었습니다. 조명과 상태 벡터는 개인화되었지만, 오디오 생성이 연결되지 않아 현재는 기본 플레이어 경로를 유지하고 있습니다.`
              : `${planetMedia.title} 행성 기본 세션을 재생 중입니다. AI 생성 세션이 연결되면 이 영역에 개인화 개입 정보가 반영됩니다.`}
          </HeaderSummary>

          {sessionNotice ? <NoticeBanner $accent={accentColor}>{sessionNotice}</NoticeBanner> : null}

          <ChipRow>
            <Chip $accent={accentColor}>track {planetMedia.trackName}</Chip>
            <Chip $accent={accentColor}>
              session {hasGeneratedAudio ? 'ai audio generated' : generatedJourney ? 'ai plan synced' : 'planet preset'}
            </Chip>
            <Chip $accent={accentColor}>source {stateSnapshot?.sourceLabel || 'NOOS baseline'}</Chip>
          </ChipRow>
        </HeaderCard>

        <SessionGrid>
          <Stack>
            <PlanetStage $accent={accentColor}>
              <PlanetAura $accent={accentColor} aria-hidden="true" />
              <PlanetLabel>{planetMedia.title} environment</PlanetLabel>
              <PlanetOrb
                $image={planetMedia.image}
                $accent={accentColor}
                $spinDurationSec={planetSpinDurationSec}
              />
              <PlanetTitle $accent={accentColor}>{planetMedia.trackName}</PlanetTitle>
              <PlanetBody>{planetMedia.description}</PlanetBody>
            </PlanetStage>

            <PlayerCard $accent={accentColor}>
              <TrackHeader>
                <div>
                  <TrackName $accent={accentColor}>{planetMedia.trackName}</TrackName>
                  <SectionBody>
                    {hasGeneratedAudio
                      ? `${formatClock(durationSec)} 동안 현재 상태에서 목표 상태 방향으로 이동하도록 설계된 세션`
                      : generatedJourney
                      ? `${formatClock(durationSec)} 동안 AI 개입 벡터와 조명 계획을 유지하는 플레이어`
                      : `${formatClock(durationSec)} 기본 행성 트랙`}
                  </SectionBody>
                </div>
                <TrackDuration>{formatClock(durationSec)}</TrackDuration>
              </TrackHeader>

              <ProgressRow>
                <TimeText>{formatClock(playheadSec)}</TimeText>
                <ProgressRange
                  type="range"
                  min={0}
                  max={playerMax}
                  value={Math.min(playheadSec, playerMax)}
                  onChange={(event) => onSeek(Number(event.target.value))}
                  $accent={accentColor}
                />
                <TimeText>{formatClock(remainingSec)}</TimeText>
              </ProgressRow>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.65rem',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'inline-flex', gap: '0.6rem', alignItems: 'center' }}>
                  <ControlButton type="button" onClick={onRewind} $accent={accentColor}>
                    <SkipBack size={14} />
                  </ControlButton>
                  <PlayButton type="button" onClick={onTogglePlay} $accent={accentColor}>
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </PlayButton>
                  <ControlButton type="button" onClick={onForward} $accent={accentColor}>
                    <SkipForward size={14} />
                  </ControlButton>
                </div>

                <VolumeRow>
                  <VolumeLabel $accent={accentColor}>
                    <Volume2 size={13} />
                  </VolumeLabel>
                  <VolumeRange
                    type="range"
                    min={0}
                    max={100}
                    value={volumePercent}
                    onChange={(event) => onVolumeChange(Number(event.target.value))}
                    $accent={accentColor}
                  />
                  <VolumeValue>{volumePercent}%</VolumeValue>
                </VolumeRow>
              </div>
            </PlayerCard>

            <PlayerCard $accent={accentColor}>
              <SectionHead>
                <SectionLabel $accent={accentColor}>Current state snapshot</SectionLabel>
                <SectionTitle $accent={accentColor}>Session vectors</SectionTitle>
                <SectionBody>재생 직전 기준으로 NOOS가 읽은 핵심 축을 정리한 상태 카드입니다.</SectionBody>
              </SectionHead>

              <MetaGrid>
                {currentStateCards.map((card) => (
                  <MetaCard key={card.key} $accent={accentColor}>
                    <MetaLabel>{card.label}</MetaLabel>
                    <MetaValue $accent={accentColor}>{card.value}</MetaValue>
                    <MetaBody>{card.body}</MetaBody>
                  </MetaCard>
                ))}
              </MetaGrid>

              {llmExplanation && (
                <>
                  <SectionLabel $accent={accentColor}>NOOS brief</SectionLabel>
                  <SectionBody>{llmExplanation.summary}</SectionBody>
                  {!!llmExplanation.why_now?.length && (
                    <InsightList>
                      {llmExplanation.why_now.map((item) => (
                        <InsightItem key={item} $accent={accentColor}>
                          {item}
                        </InsightItem>
                      ))}
                    </InsightList>
                  )}
                </>
              )}
            </PlayerCard>

            <PlayerCard $accent={accentColor}>
              <SectionHead>
                <SectionLabel $accent={accentColor}>AI intervention</SectionLabel>
                <SectionTitle $accent={accentColor}>{transitionPlan?.transition_mode || 'Planetary preset'}</SectionTitle>
                <SectionBody>
                  {generatedJourney
                    ? '생성 엔진은 현재 상태와 목표 행성 사이의 차이를 계산해 세션 강도와 페이즈를 정렬했습니다.'
                    : '아직 AI 생성 결과가 없어서 행성 기본 처방을 재생하고 있습니다.'}
                </SectionBody>
              </SectionHead>

              <MetaGrid>
                <MetaCard $accent={accentColor}>
                  <MetaLabel>Transition intensity</MetaLabel>
                  <MetaValue $accent={accentColor}>{Math.round(transitionIntensity * 100)}%</MetaValue>
                  <MetaBody>상태를 얼마나 크게 움직이려는지에 대한 개입 강도</MetaBody>
                </MetaCard>
                <MetaCard $accent={accentColor}>
                  <MetaLabel>Reliability</MetaLabel>
                  <MetaValue $accent={accentColor}>{Math.round(transitionReliability * 100)}%</MetaValue>
                  <MetaBody>현재 입력 품질과 상태 해석을 바탕으로 계산한 신뢰도</MetaBody>
                </MetaCard>
                <MetaCard $accent={accentColor}>
                  <MetaLabel>Input quality</MetaLabel>
                  <MetaValue $accent={accentColor}>{Math.round(qualityScore * 100)}%</MetaValue>
                  <MetaBody>측정 또는 설문 입력의 안정성 수준</MetaBody>
                </MetaCard>
              </MetaGrid>

              {priorityAxes.length > 0 && (
                <>
                  <SectionLabel $accent={accentColor}>Change priority</SectionLabel>
                  <PriorityRow>
                    {priorityAxes.map((axis) => (
                      <PriorityChip key={axis} $accent={accentColor}>
                        {formatAxisName(axis)}
                      </PriorityChip>
                    ))}
                  </PriorityRow>
                </>
              )}

              {transitionPhases.length > 0 && (
                <>
                  <SectionLabel $accent={accentColor}>Session flow</SectionLabel>
                  <PhaseList>
                    {transitionPhases.map((phase) => (
                      <PhaseCard key={`${phase.name}-${phase.duration_sec}`} $accent={accentColor}>
                        <PhaseTop>
                          <PhaseTitle $accent={accentColor}>{phase.name}</PhaseTitle>
                          <PhaseMeta>{Math.round(Number(phase.duration_sec || 0))} sec</PhaseMeta>
                        </PhaseTop>
                        <PhaseBody>{formatPhaseGoals(phase)}</PhaseBody>
                      </PhaseCard>
                    ))}
                  </PhaseList>
                </>
              )}
            </PlayerCard>

            {llmCoach && (
              <PlayerCard $accent={accentColor}>
                <SectionHead>
                  <SectionLabel $accent={accentColor}>Session coach</SectionLabel>
                  <SectionTitle $accent={accentColor}>{llmCoach.session_prompt || '세션 준비 가이드'}</SectionTitle>
                  <SectionBody>{llmCoach.focus_frame || llmCoach.success_signal}</SectionBody>
                </SectionHead>

                {!!llmCoach.setup_steps?.length && (
                  <InsightList>
                    {llmCoach.setup_steps.map((step) => (
                      <InsightItem key={step} $accent={accentColor}>
                        {step}
                      </InsightItem>
                    ))}
                  </InsightList>
                )}
              </PlayerCard>
            )}
          </Stack>

          <RightActions>
            <TravelLightingPreview preview={planetMedia.lightingPreview} accentColor={accentColor} compact />

            <PlayerCard $accent={accentColor}>
              <SectionHead>
                <SectionLabel $accent={accentColor}>Target state</SectionLabel>
                <SectionTitle $accent={accentColor}>
                  {interventionResult?.planet_profile?.goal_label || planetMedia.moodTarget}
                </SectionTitle>
                <SectionBody>
                  {interventionResult?.planet_profile?.user_description || planetMedia.description}
                </SectionBody>
              </SectionHead>

              <MetaGrid>
                {['focus_readiness', 'relaxation_level', 'cortical_arousal'].map((key) => (
                  <MetaCard key={key} $accent={accentColor}>
                    <MetaLabel>{formatAxisName(key)}</MetaLabel>
                    <MetaValue $accent={accentColor}>{toPercent(targetStateAxes?.[key])}</MetaValue>
                    <MetaBody>목표 행성이 지향하는 상태 축의 기준값</MetaBody>
                  </MetaCard>
                ))}
              </MetaGrid>
            </PlayerCard>

            {aiConnected && (
              <AiConnectedPanel $accent={accentColor}>
                <AiConnectedTitle $accent={accentColor}>AI Objet connected</AiConnectedTitle>
                <AiConnectedSub>
                  현재 세션 제어 채널이 열려 있습니다. 필요하면 연결을 해제하고 행성 플레이어만 유지할 수 있습니다.
                </AiConnectedSub>
                <AiDisconnectButton type="button" $accent={accentColor} onClick={onDisconnectAiObjet}>
                  Disconnect
                </AiDisconnectButton>
              </AiConnectedPanel>
            )}

            <BottomActions>
              <SecondaryAction type="button" onClick={onAskAiObjet} $accent={accentColor}>
                <Bot size={13} />
                AI Objet 연결
              </SecondaryAction>
              <DangerAction type="button" onClick={onExitIntent} $accent={accentColor}>
                <Sparkles size={13} />
                여행 종료
              </DangerAction>
            </BottomActions>
          </RightActions>
        </SessionGrid>
      </Frame>
    </Page>
  );
};

export default React.memo(TravelPlayerPage);
