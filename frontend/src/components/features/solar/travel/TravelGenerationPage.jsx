import React, { useMemo } from 'react';
import {
  ArrowRight,
  Lightbulb,
  Music2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  buildGenerationMetricCards,
  clampProgressPercent,
  getActiveGenerationStatus,
  hasLightingPreview,
  resolveGenerationBackgroundImage,
} from './travelGenerationModel';
import TravelGenerationLightingCompact from './TravelGenerationLightingCompact';
import TravelGenerationMetrics from './TravelGenerationMetrics';
import TravelGenerationStatusList from './TravelGenerationStatusList';
import {
  ActionButton,
  Actions,
  ActiveStatus,
  Body,
  DeviceCard,
  DeviceHeader,
  DeviceTitle,
  ErrorText,
  Fill,
  Grid,
  Header,
  IconBox,
  InfoGrid,
  InfoTile,
  Page,
  PlanetBody,
  PlanetFrame,
  PlanetLabel,
  PlanetNote,
  PlanetTitle,
  PreviewCard,
  ProgressHead,
  ProgressLabel,
  ProgressPanel,
  ProgressPill,
  SideStack,
  SketchCard,
  SparkLine,
  Stage,
  Stamp,
  TileLabel,
  TileValue,
  Title,
  TopLine,
  Track,
} from './TravelGenerationPage.styles';

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
    () => buildGenerationMetricCards(stateSnapshot?.canonicalState),
    [stateSnapshot?.canonicalState]
  );

  const generationStatusLines = Array.isArray(statusLines) ? statusLines : [];
  const activeStatus = getActiveGenerationStatus(generationStatusLines, activeStatusIndex);
  const backgroundImage = resolveGenerationBackgroundImage(planetMedia);
  const progress = clampProgressPercent(progressPercent);
  const lightingPreview = hasLightingPreview(planetMedia) ? planetMedia.lightingPreview : null;

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

            <TravelGenerationMetrics accentColor={accentColor} metricCards={metricCards} />

            <TravelGenerationStatusList
              accentColor={accentColor}
              activeStatusIndex={activeStatusIndex}
              statusLines={generationStatusLines}
            />

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
              <TravelGenerationLightingCompact accentColor={accentColor} lightingPreview={lightingPreview} />
            </DeviceCard>
          </SideStack>
        </Grid>
      </Stage>
    </Page>
  );
};

export default React.memo(TravelGenerationPage);
