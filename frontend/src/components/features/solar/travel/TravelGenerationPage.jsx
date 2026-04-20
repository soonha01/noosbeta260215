import React, { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import TravelLightingPreview from './TravelLightingPreview';
import {
  GenerationAction,
  GenerationActions,
  GenerationBody,
  GenerationCard,
  GenerationEyebrow,
  GenerationGrid,
  GenerationHeader,
  GenerationMeta,
  GenerationPage,
  GenerationProgressBar,
  GenerationProgressFill,
  GenerationProgressLabel,
  GenerationStatusItem,
  GenerationStatusList,
  GenerationTitle,
} from './spaceTravel.styles';

const orbFloat = keyframes`
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(0, -10px, 0) scale(1.012);
  }
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.55rem;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const MetaCard = styled.div`
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}2c`};
  background: ${({ $accent }) => `${$accent || '#ffffff'}08`};
  padding: 0.72rem 0.78rem;
  display: grid;
  gap: 0.16rem;
`;

const MetaLabel = styled.p`
  margin: 0;
  color: rgba(210, 223, 246, 0.68);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

const MetaValue = styled.p`
  margin: 0;
  color: ${({ $accent }) => $accent || '#fff'};
  font-size: 15px;
  letter-spacing: -0.02em;
  line-height: 1.35;
  font-family: 'Freesentation Bold', 'Cardinal Fruit', sans-serif;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.55rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div`
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}2c`};
  background: rgba(255, 255, 255, 0.03);
  padding: 0.78rem 0.82rem;
  display: grid;
  gap: 0.16rem;
`;

const MetricLabel = styled.p`
  margin: 0;
  color: rgba(205, 217, 241, 0.66);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

const MetricValue = styled.p`
  margin: 0;
  color: ${({ $accent }) => $accent || '#fff'};
  font-size: 22px;
  line-height: 1;
  letter-spacing: -0.05em;
  font-family: 'Freesentation Black', 'Cardinal Fruit', sans-serif;
`;

const MetricBody = styled.p`
  margin: 0.12rem 0 0;
  color: rgba(223, 232, 248, 0.76);
  font-size: 12px;
  line-height: 1.55;
`;

const VisualCard = styled(GenerationCard)`
  position: relative;
  overflow: hidden;
  align-content: center;
`;

const VisualStage = styled.div`
  position: relative;
  min-height: 380px;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}28`};
  background:
    radial-gradient(circle at 50% 34%, rgba(255, 255, 255, 0.06), transparent 30%),
    linear-gradient(180deg, rgba(9, 9, 9, 0.94), rgba(2, 2, 2, 0.96));
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 0.8rem;
  padding: 1rem;
`;

const VisualAura = styled.div`
  position: absolute;
  inset: 50% auto auto 50%;
  width: clamp(240px, 34vw, 420px);
  height: clamp(240px, 34vw, 420px);
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: radial-gradient(circle, ${({ $accent }) => `${$accent || '#ffffff'}26`}, transparent 68%);
  filter: blur(24px);
`;

const PlanetOrb = styled.div`
  position: relative;
  z-index: 1;
  width: clamp(210px, 28vw, 340px);
  aspect-ratio: 1 / 1;
  border-radius: 999px;
  overflow: hidden;
  background: #090909;
  background-image: url(${({ $image }) => $image});
  background-repeat: repeat-x;
  background-size: auto 100%;
  background-position: center;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}72`};
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    0 24px 58px rgba(0, 0, 0, 0.6);
  animation: ${orbFloat} 7.2s ease-in-out infinite;
`;

const VisualLabel = styled.p`
  position: relative;
  z-index: 1;
  margin: 0;
  color: rgba(211, 223, 246, 0.72);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

const VisualTitle = styled.h2`
  position: relative;
  z-index: 1;
  margin: 0;
  color: ${({ $accent }) => $accent || '#fff'};
  font-size: clamp(30px, 4vw, 46px);
  line-height: 0.95;
  letter-spacing: -0.05em;
  text-align: center;
  font-family: 'Freesentation Black', 'Cardinal Fruit', sans-serif;
`;

const VisualBody = styled.p`
  position: relative;
  z-index: 1;
  margin: 0;
  width: min(100%, 34ch);
  color: rgba(232, 239, 252, 0.8);
  font-size: 13px;
  line-height: 1.7;
  text-align: center;
`;

const ErrorText = styled.p`
  margin: 0;
  color: rgba(255, 182, 182, 0.88);
  font-size: 12px;
  line-height: 1.55;
`;

const AXIS_META = [
  {
    key: 'focus_readiness',
    label: 'Focus readiness',
    body: '현재 상태에서 곧바로 몰입으로 들어갈 준비 정도',
  },
  {
    key: 'stress_load',
    label: 'Stress load',
    body: '지금 완화가 필요한 긴장과 압박의 크기',
  },
  {
    key: 'fatigue_risk',
    label: 'Fatigue risk',
    body: '집중을 방해할 수 있는 피로·졸림 신호',
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

  return (
    <GenerationPage>
      <GenerationGrid>
        <GenerationCard $accent={accentColor}>
          <GenerationHeader>
            <GenerationEyebrow $accent={accentColor}>NOOS AI Engine</GenerationEyebrow>
            <GenerationTitle $accent={accentColor}>{planetMedia.title} session is aligning.</GenerationTitle>
            <GenerationBody>
              현재 상태 벡터와 목표 행성 프로필을 맞춘 뒤, 음악 생성 모델과 조명 프리셋을 하나의 세션으로
              정렬하고 있습니다. 출력 밀도와 패턴 변화도 함께 조율 중입니다.
            </GenerationBody>
          </GenerationHeader>

          <MetaGrid>
            <MetaCard $accent={accentColor}>
              <MetaLabel>Current state</MetaLabel>
              <MetaValue $accent={accentColor}>{stateSnapshot?.title || '측정 정보 없음'}</MetaValue>
            </MetaCard>
            <MetaCard $accent={accentColor}>
              <MetaLabel>Target vector</MetaLabel>
              <MetaValue $accent={accentColor}>{planetMedia.moodTarget}</MetaValue>
            </MetaCard>
            <MetaCard $accent={accentColor}>
              <MetaLabel>Source</MetaLabel>
              <MetaValue $accent={accentColor}>{stateSnapshot?.sourceLabel || 'NOOS baseline'}</MetaValue>
            </MetaCard>
          </MetaGrid>

          <div>
            <GenerationProgressLabel>
              <span>Session synthesis</span>
              <strong>{progressPercent}%</strong>
            </GenerationProgressLabel>
            <GenerationProgressBar aria-hidden="true">
              <GenerationProgressFill $accent={accentColor} style={{ width: `${progressPercent}%` }} />
            </GenerationProgressBar>
            <GenerationMeta>{activeStatus}</GenerationMeta>
          </div>

          <MetricGrid>
            {metricCards.map((metric) => (
              <MetricCard key={metric.key} $accent={accentColor}>
                <MetricLabel>{metric.label}</MetricLabel>
                <MetricValue $accent={accentColor}>{metric.percent}</MetricValue>
                <MetricBody>{metric.body}</MetricBody>
              </MetricCard>
            ))}
          </MetricGrid>

          <GenerationStatusList>
            {statusLines.map((line, index) => (
              <GenerationStatusItem key={`${line}-${index}`} $isActive={index <= activeStatusIndex} $accent={accentColor}>
                {line}
              </GenerationStatusItem>
            ))}
          </GenerationStatusList>

          {errorMessage && (
            <>
              <ErrorText>{errorMessage}</ErrorText>
              <GenerationActions>
                <GenerationAction type="button" onClick={onRetry} $accent={accentColor}>
                  다시 생성하기
                </GenerationAction>
                <GenerationAction type="button" onClick={onContinueFallback} $accent={accentColor}>
                  기본 플레이어로 이동
                </GenerationAction>
              </GenerationActions>
            </>
          )}
        </GenerationCard>

        <div style={{ display: 'grid', gap: '0.9rem' }}>
          <VisualCard $accent={accentColor}>
            <VisualStage $accent={accentColor}>
              <VisualAura $accent={accentColor} aria-hidden="true" />
              <VisualLabel>{planetMedia.title} Preview</VisualLabel>
              <PlanetOrb $image={planetMedia.image} $accent={accentColor} />
              <VisualTitle $accent={accentColor}>{planetMedia.trackName}</VisualTitle>
              <VisualBody>{planetMedia.description}</VisualBody>
            </VisualStage>
          </VisualCard>

          <TravelLightingPreview preview={planetMedia.lightingPreview} accentColor={accentColor} />
        </div>
      </GenerationGrid>
    </GenerationPage>
  );
};

export default React.memo(TravelGenerationPage);
