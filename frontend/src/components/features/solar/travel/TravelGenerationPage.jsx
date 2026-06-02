import React, { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  Activity,
  ArrowRight,
  Brain,
  Check,
  Lightbulb,
  Music2,
  RotateCcw,
  Sparkles,
  Timer,
} from 'lucide-react';

const scan = keyframes`
  from {
    transform: translateX(-18%);
  }
  to {
    transform: translateX(118%);
  }
`;

const floatIn = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0, 18px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

const NoosMark = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    role="img"
    aria-label="NOOS"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="32" cy="32" rx="23" ry="13" stroke="currentColor" strokeWidth="4" />
    <path
      d="M17 34C25 26.8 35.5 24.4 47 29.2"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <circle cx="22" cy="38.5" r="1.6" fill="currentColor" />
    <circle cx="27" cy="40" r="1.6" fill="currentColor" />
    <circle cx="32" cy="40.6" r="1.6" fill="currentColor" />
    <circle cx="37" cy="40" r="1.6" fill="currentColor" />
    <circle cx="42" cy="38.5" r="1.6" fill="currentColor" />
  </svg>
);

const KOREAN_FONT = "'Pretendard Variable', 'Pretendard', 'Freesentation', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const UI_FONT = KOREAN_FONT;
const LABEL_FONT = "'Poppins', 'Pretendard Variable', 'Pretendard', 'Freesentation', sans-serif";
const DISPLAY_FONT = "'Instrument Serif', 'GowunBatang', 'Pretendard Variable', serif";

const Page = styled.div`
  height: 100%;
  min-height: 100%;
  box-sizing: border-box;
  padding: clamp(0.65rem, 1.6vw, 1.1rem);
  color: #171717;
  overflow: hidden;
  font-family: ${UI_FONT};
  word-break: keep-all;
  background:
    linear-gradient(120deg, rgba(0, 0, 0, 0.82), rgba(0, 0, 0, 0.38) 44%, rgba(0, 0, 0, 0.84)),
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
      radial-gradient(circle at 18% 20%, ${({ $accent }) => `${$accent || '#ffffff'}42`}, transparent 32%),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(rgba(255, 255, 255, 0.026) 1px, transparent 1px);
    background-size: auto, 18px 18px, 18px 18px;
    pointer-events: none;
  }

  @media (max-width: 980px), (max-height: 760px) {
    height: auto;
    overflow: auto;
  }
`;

const Stage = styled.div`
  height: calc(100vh - clamp(1.3rem, 3.2vw, 2.2rem));
  min-height: 0;
  display: grid;
  align-content: center;

  @media (max-width: 980px), (max-height: 760px) {
    height: auto;
    min-height: calc(100vh - clamp(1.3rem, 3.2vw, 2.2rem));
  }
`;

const Grid = styled.div`
  width: min(100%, 1180px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);
  align-items: start;
  gap: clamp(0.65rem, 1.4vw, 0.95rem);
  height: min(100%, 720px);
  min-height: 0;
  animation: ${floatIn} 0.5s ease both;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

const SketchCard = styled.section`
  position: relative;
  min-width: 0;
  border: 2px solid ${({ $accent }) => $accent || '#111'};
  border-radius: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 251, 0.94), rgba(239, 244, 229, 0.92)),
    repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.04) 0, rgba(0, 0, 0, 0.04) 1px, transparent 1px, transparent 18px);
  box-shadow:
    5px 5px 0 ${({ $accent }) => `${$accent || '#ffffff'}d4`},
    0 22px 62px rgba(0, 0, 0, 0.44);
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: clamp(0.7rem, 1.35vw, 0.95rem);
  display: grid;
  align-content: start;
  gap: 0.58rem;

  &::after {
    content: '';
    position: absolute;
    inset: 9px;
    border: 1px dashed ${({ $accent }) => `${$accent || '#111'}62`};
    pointer-events: none;
  }
`;

const Header = styled.header`
  position: relative;
  z-index: 1;
  display: grid;
  gap: 0.36rem;
`;

const TopLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
`;

const Stamp = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
  color: ${({ $accent }) => $accent || '#111'};
  font-family: ${LABEL_FONT};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const IconBox = styled.span`
  width: 30px;
  height: 30px;
  border: 2px solid ${({ $accent }) => $accent || '#111'};
  display: grid;
  place-items: center;
  background: #fff;
  color: ${({ $accent }) => $accent || '#111'};
  box-shadow: 3px 3px 0 ${({ $accent }) => `${$accent || '#111'}48`};
`;

const ProgressPill = styled.div`
  min-height: 30px;
  padding: 0 0.56rem;
  border: 2px solid ${({ $accent }) => $accent || '#111'};
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ $accent }) => `${$accent || '#111'}12`};
  color: ${({ $accent }) => $accent || '#111'};
  font-family: ${LABEL_FONT};
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
`;

const Title = styled.h2`
  margin: 0;
  color: #111;
  font-family: ${DISPLAY_FONT};
  font-size: clamp(34px, 4.7vw, 58px);
  font-weight: 400;
  line-height: 0.9;
  letter-spacing: 0;
`;

const Body = styled.p`
  margin: 0;
  max-width: 58ch;
  color: rgba(16, 16, 16, 0.72);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.46;
`;

const InfoGrid = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.42rem;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const InfoTile = styled.div`
  border: 2px solid ${({ $accent }) => `${$accent || '#111'}a8`};
  background: rgba(255, 255, 255, 0.58);
  padding: 0.48rem 0.56rem;
  min-width: 0;
`;

const TileLabel = styled.p`
  margin: 0;
  color: rgba(16, 16, 16, 0.54);
  font-family: ${LABEL_FONT};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const TileValue = styled.p`
  margin: 0.18rem 0 0;
  color: ${({ $accent }) => $accent || '#111'};
  font-size: 13px;
  font-weight: 800;
  line-height: 1.35;
`;

const ProgressPanel = styled.div`
  position: relative;
  z-index: 1;
  border: 2px solid #111;
  background: rgba(255, 255, 255, 0.72);
  padding: 0.56rem 0.68rem;
  display: grid;
  gap: 0.38rem;
`;

const ProgressHead = styled.div`
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
`;

const ProgressLabel = styled.div`
  display: grid;
  gap: 0.16rem;

  span {
    color: rgba(18, 18, 18, 0.58);
    font-family: ${LABEL_FONT};
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  strong {
    color: #111;
    font-size: clamp(22px, 2.4vw, 30px);
    line-height: 1;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
`;

const ActiveStatus = styled.p`
  margin: 0;
  color: ${({ $accent }) => $accent || '#111'};
  font-size: 10px;
  font-weight: 800;
  line-height: 1.45;
  text-align: right;

  @media (max-width: 620px) {
    text-align: left;
  }
`;

const Track = styled.div`
  position: relative;
  height: 12px;
  overflow: hidden;
  border: 2px solid #111;
  background: rgba(17, 17, 17, 0.08);
`;

const Fill = styled.div`
  position: relative;
  height: 100%;
  min-width: 10px;
  background: ${({ $accent }) => $accent || '#111'};
  transition: width 0.5s ease;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 46px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.54), transparent);
    animation: ${scan} 1.4s ease-in-out infinite;
  }
`;

const Metrics = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.42rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const MetricTile = styled.div`
  border: 2px solid ${({ $accent }) => `${$accent || '#111'}b8`};
  background: rgba(255, 255, 255, 0.64);
  padding: 0.5rem;
  display: grid;
  gap: 0.26rem;
`;

const MetricTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const MetricLabel = styled.p`
  margin: 0;
  color: rgba(16, 16, 16, 0.58);
  font-family: ${LABEL_FONT};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const MetricValue = styled.p`
  margin: 0;
  color: ${({ $accent }) => $accent || '#111'};
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
`;

const MetricBody = styled.p`
  margin: 0;
  color: rgba(20, 20, 20, 0.66);
  font-size: 9px;
  font-weight: 600;
  line-height: 1.34;
`;

const MiniBars = styled.div`
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  align-items: end;
  gap: 0.18rem;
  height: 26px;
`;

const MiniBar = styled.span`
  display: block;
  height: ${({ $height }) => `${$height}%`};
  min-height: 6px;
  border: 1px solid ${({ $accent }) => `${$accent || '#111'}aa`};
  background: ${({ $accent, $active }) => ($active ? $accent || '#111' : `${$accent || '#111'}1a`)};
`;

const StatusList = styled.ul`
  position: relative;
  z-index: 1;
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.36rem;

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const StatusItem = styled.li`
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  align-items: center;
  gap: 0.44rem;
  border: 2px solid ${({ $accent, $active }) => ($active ? $accent || '#111' : 'rgba(17, 17, 17, 0.22)')};
  background: ${({ $accent, $active }) => ($active ? `${$accent || '#111'}12` : 'rgba(255, 255, 255, 0.5)')};
  color: ${({ $active }) => ($active ? '#111' : 'rgba(17, 17, 17, 0.54)')};
  padding: 0.38rem;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.28;
`;

const StatusMark = styled.span`
  width: 22px;
  height: 22px;
  border: 2px solid ${({ $accent, $active }) => ($active ? $accent || '#111' : 'rgba(17, 17, 17, 0.28)')};
  background: ${({ $accent, $active }) => ($active ? $accent || '#111' : 'transparent')};
  color: #fff;
  display: grid;
  place-items: center;
`;

const SideStack = styled.div`
  display: grid;
  align-content: start;
  align-items: start;
  grid-template-rows: minmax(0, 1fr) auto auto;
  gap: 0.62rem;
  height: 100%;
  min-width: 0;

  @media (max-width: 980px) {
    height: auto;
  }
`;

const PreviewCard = styled(SketchCard)`
  align-self: start;
  position: relative;
  height: 100%;
  min-height: 220px;
  padding: 0;
  overflow: hidden;
  display: block;
  isolation: isolate;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.52)),
    url(${({ $image }) => $image});
  background-size: cover;
  background-position: center;

  &::after {
    z-index: 2;
  }

  @media (max-width: 980px) {
    height: clamp(260px, 44vw, 420px);
  }
`;

const PlanetFrame = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  box-sizing: border-box;
  display: grid;
  align-content: end;
  padding: 0.78rem;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.58));

  @media (max-width: 620px) {
    padding: 0.68rem;
  }
`;

const PlanetNote = styled.div`
  width: min(100%, 320px);
  border: 2px solid ${({ $accent }) => $accent || '#111'};
  background: rgba(255, 255, 251, 0.9);
  box-shadow: 4px 4px 0 ${({ $accent }) => `${$accent || '#111'}cc`};
  padding: 0.62rem;
  display: grid;
  gap: 0.22rem;
`;

const PlanetLabel = styled.p`
  margin: 0;
  color: ${({ $accent }) => $accent || '#111'};
  font-family: ${LABEL_FONT};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

const PlanetTitle = styled.h3`
  margin: 0;
  color: #111;
  font-family: ${DISPLAY_FONT};
  font-size: clamp(28px, 3.4vw, 42px);
  font-weight: 400;
  line-height: 0.9;
`;

const PlanetBody = styled.p`
  margin: 0;
  color: rgba(17, 17, 17, 0.68);
  font-size: 10px;
  font-weight: 600;
  line-height: 1.38;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const DeviceCard = styled(SketchCard)`
  height: auto;
  gap: 0.45rem;
`;

const DeviceHeader = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
`;

const DeviceTitle = styled.h3`
  margin: 0;
  color: #111;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
`;

const SparkLine = styled.div`
  position: relative;
  z-index: 1;
  height: 56px;
  border: 2px solid #111;
  background:
    linear-gradient(rgba(17, 17, 17, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(17, 17, 17, 0.08) 1px, transparent 1px),
    rgba(255, 255, 255, 0.58);
  background-size: 100% 22px, 28px 100%, auto;
  overflow: hidden;

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

const LightingCompact = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.36rem;
`;

const LightingSwatch = styled.div`
  min-height: 44px;
  border: 2px solid ${({ $accent }) => `${$accent || '#111'}a8`};
  background: ${({ $color }) => $color || '#fff'};
`;

const LightingMeta = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.36rem;
`;

const LightingDatum = styled.div`
  border: 2px solid ${({ $accent }) => `${$accent || '#111'}86`};
  background: rgba(255, 255, 255, 0.58);
  padding: 0.42rem;
  min-width: 0;

  span {
    display: block;
    color: rgba(17, 17, 17, 0.58);
    font-family: ${LABEL_FONT};
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  strong {
    display: block;
    margin-top: 0.12rem;
    color: ${({ $accent }) => $accent || '#111'};
    font-size: 11px;
    font-weight: 800;
    line-height: 1.18;
  }
`;

const ErrorText = styled.p`
  position: relative;
  z-index: 1;
  margin: 0;
  border: 2px solid rgba(178, 30, 30, 0.86);
  background: rgba(255, 230, 230, 0.9);
  color: rgba(118, 12, 12, 0.92);
  padding: 0.72rem;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.55;
`;

const Actions = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
`;

const ActionButton = styled.button`
  min-height: 40px;
  border: 2px solid ${({ $accent }) => $accent || '#111'};
  border-radius: 0;
  background: ${({ $accent, $primary }) => ($primary ? $accent || '#111' : 'rgba(255, 255, 255, 0.74)')};
  color: ${({ $primary }) => ($primary ? '#fff' : '#111')};
  box-shadow: 4px 4px 0 rgba(17, 17, 17, 0.22);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0 0.86rem;
  font-family: ${LABEL_FONT};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 rgba(17, 17, 17, 0.22);
  }
`;

const AXIS_META = [
  {
    key: 'focus_readiness',
    label: 'Focus readiness',
    body: '현재 상태에서 곧바로 몰입으로 들어갈 준비 정도',
    icon: Brain,
    bars: [28, 38, 44, 52, 58, 65, 72, 78],
  },
  {
    key: 'stress_load',
    label: 'Stress load',
    body: '지금 완화가 필요한 긴장과 압박의 크기',
    icon: Activity,
    bars: [74, 68, 62, 58, 54, 48, 42, 36],
  },
  {
    key: 'fatigue_risk',
    label: 'Fatigue risk',
    body: '집중을 방해할 수 있는 피로·졸림 신호',
    icon: Timer,
    bars: [34, 38, 31, 28, 30, 26, 24, 22],
  },
];

const TravelGenerationPage = ({
  planetMedia,
  accentColor,
  progressPercent,
  statusLines,
  activeStatusIndex,
  stateSnapshot,
  errorMessage,
  onRetry,
  onContinueFallback,
}) => {
  const metricCards = useMemo(
    () =>
      AXIS_META.map((axis) => {
        const value = Number(stateSnapshot?.canonicalState?.[axis.key] || 0);
        return {
          ...axis,
          percent: `${Math.round(value * 100)}%`,
        };
      }),
    [stateSnapshot?.canonicalState]
  );

  const activeStatus = statusLines[Math.min(activeStatusIndex, statusLines.length - 1)] || 'Session preparing';
  const backgroundImage = planetMedia?.backgroundImage || planetMedia?.image;
  const progress = Math.max(0, Math.min(100, Number(progressPercent) || 0));
  const lightingPreview = planetMedia?.lightingPreview;

  return (
    <Page $background={backgroundImage} $accent={accentColor}>
      <Stage>
        <Grid>
          <SketchCard $accent={accentColor}>
            <Header>
              <TopLine>
                <Stamp $accent={accentColor}>
                  <IconBox $accent={accentColor}>
                    <NoosMark size={21} />
                  </IconBox>
                  NOOS AI Engine
                </Stamp>
                <ProgressPill $accent={accentColor}>
                  <Sparkles size={15} />
                  {progress}%
                </ProgressPill>
              </TopLine>

              <Title>{planetMedia.title} session is aligning.</Title>
              <Body>
                현재 상태 벡터와 목표 행성 프로필을 맞춘 뒤, 음악 생성 모델과 조명 프리셋을 하나의 세션으로
                정렬하고 있습니다. 분석 선과 진행 상태는 현재 선택된 행성 컬러에 맞춰 동기화됩니다.
              </Body>
            </Header>

            <InfoGrid>
              <InfoTile $accent={accentColor}>
                <TileLabel>Current state</TileLabel>
                <TileValue $accent={accentColor}>{stateSnapshot?.title || '측정 정보 없음'}</TileValue>
              </InfoTile>
              <InfoTile $accent={accentColor}>
                <TileLabel>Target vector</TileLabel>
                <TileValue $accent={accentColor}>{planetMedia.moodTarget}</TileValue>
              </InfoTile>
              <InfoTile $accent={accentColor}>
                <TileLabel>Source</TileLabel>
                <TileValue $accent={accentColor}>{stateSnapshot?.sourceLabel || 'NOOS baseline'}</TileValue>
              </InfoTile>
            </InfoGrid>

            <ProgressPanel>
              <ProgressHead>
                <ProgressLabel>
                  <span>Session synthesis</span>
                  <strong>{progress}%</strong>
                </ProgressLabel>
                <ActiveStatus $accent={accentColor}>{activeStatus}</ActiveStatus>
              </ProgressHead>
              <Track aria-hidden="true">
                <Fill $accent={accentColor} style={{ width: `${progress}%` }} />
              </Track>
            </ProgressPanel>

            <Metrics>
              {metricCards.map((metric, metricIndex) => {
                const Icon = metric.icon;
                return (
                  <MetricTile key={metric.key} $accent={accentColor}>
                    <MetricTop>
                      <MetricLabel>{metric.label}</MetricLabel>
                      <Icon size={16} color={accentColor} />
                    </MetricTop>
                    <MetricValue $accent={accentColor}>{metric.percent}</MetricValue>
                    <MetricBody>{metric.body}</MetricBody>
                    <MiniBars aria-hidden="true">
                      {metric.bars.map((height, index) => (
                        <MiniBar
                          key={`${metric.key}-${height}-${index}`}
                          $height={height}
                          $accent={accentColor}
                          $active={index <= metricIndex + 4}
                        />
                      ))}
                    </MiniBars>
                  </MetricTile>
                );
              })}
            </Metrics>

            <StatusList>
              {statusLines.map((line, index) => {
                const active = index <= activeStatusIndex;
                return (
                  <StatusItem key={`${line}-${index}`} $active={active} $accent={accentColor}>
                    <StatusMark $active={active} $accent={accentColor}>{active ? <Check size={16} /> : index + 1}</StatusMark>
                    {line}
                  </StatusItem>
                );
              })}
            </StatusList>

            {errorMessage && (
              <>
                <ErrorText>{errorMessage}</ErrorText>
                <Actions>
                  <ActionButton type="button" onClick={onRetry} $accent={accentColor} $primary>
                    <RotateCcw size={14} />
                    다시 생성하기
                  </ActionButton>
                  <ActionButton type="button" onClick={onContinueFallback} $accent={accentColor}>
                    기본 플레이어로 이동
                    <ArrowRight size={14} />
                  </ActionButton>
                </Actions>
              </>
            )}
          </SketchCard>

          <SideStack>
            <PreviewCard $accent={accentColor} $image={backgroundImage}>
              <PlanetFrame>
                <PlanetNote $accent={accentColor}>
                  <PlanetLabel $accent={accentColor}>Music draft</PlanetLabel>
                  <PlanetTitle>{planetMedia.trackName}</PlanetTitle>
                  <PlanetBody>{planetMedia.description}</PlanetBody>
                </PlanetNote>
              </PlanetFrame>
            </PreviewCard>

            <DeviceCard $accent={accentColor}>
              <DeviceHeader>
                <Stamp $accent={accentColor}>
                  <IconBox $accent={accentColor}>
                    <Music2 size={17} />
                  </IconBox>
                  Signal route
                </Stamp>
                <Lightbulb size={18} color={accentColor} />
              </DeviceHeader>
              <SparkLine aria-hidden="true">
                <svg viewBox="0 0 360 88" preserveAspectRatio="none">
                  <polyline
                    points="0,62 42,54 84,60 126,34 168,42 210,20 252,32 294,18 360,26"
                    fill="none"
                    stroke={accentColor}
                    strokeWidth="4"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <polyline
                    points="0,72 42,68 84,72 126,58 168,61 210,48 252,54 294,44 360,46"
                    fill="none"
                    stroke="#111"
                    strokeOpacity="0.28"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
              </SparkLine>
            </DeviceCard>

            <DeviceCard $accent={accentColor}>
              <DeviceHeader>
                <DeviceTitle>Lighting prescription</DeviceTitle>
                <Sparkles size={18} color={accentColor} />
              </DeviceHeader>
              {lightingPreview ? (
                <>
                  <LightingCompact>
                    <LightingSwatch $accent={accentColor} $color={lightingPreview.primaryHex} />
                    <LightingSwatch $accent={accentColor} $color={lightingPreview.secondaryHex} />
                    <LightingSwatch $accent={accentColor} $color={lightingPreview.accentHex} />
                  </LightingCompact>
                  <LightingMeta>
                    <LightingDatum $accent={accentColor}>
                      <span>CCT</span>
                      <strong>{lightingPreview.cctKelvin} K</strong>
                    </LightingDatum>
                    <LightingDatum $accent={accentColor}>
                      <span>Lux</span>
                      <strong>{lightingPreview.luxAnchor} lx</strong>
                    </LightingDatum>
                    <LightingDatum $accent={accentColor}>
                      <span>Pattern</span>
                      <strong>{lightingPreview.patternCadence}</strong>
                    </LightingDatum>
                  </LightingMeta>
                </>
              ) : null}
            </DeviceCard>
          </SideStack>
        </Grid>
      </Stage>
    </Page>
  );
};

export default React.memo(TravelGenerationPage);
