import React, { useEffect, useRef, useState } from 'react';
import { Bot, LayoutDashboard, Pause, Play, SkipBack, SkipForward, UserRound, Volume2 } from 'lucide-react';
import {
  AiConnectedPanel,
  AiConnectedSub,
  AiConnectedTitle,
  AiDisconnectButton,
  BottomActions,
  ControlButton,
  DangerAction,
  DescriptionPanel,
  DescriptionText,
  DescriptionTitle,
  HeroBody,
  HeroLabel,
  HeroTitle,
  IconActionButton,
  PlanetHero,
  PlanetHeroImage,
  PlanetHeroInfo,
  PlayerCard,
  PlayerControls,
  PlayerHeader,
  PlayerIconActions,
  PlayerKicker,
  PlayerLeftStack,
  PlayerMeta,
  PlayerRightPanel,
  PlayerStage,
  PlayerTitle,
  PlayerTopBar,
  PlayerTopLeft,
  PlayButton,
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

const getPlanetSpinDurationSec = (planetTitle) => {
  const key = String(planetTitle || '')
    .trim()
    .toLowerCase();

  switch (key) {
    case 'mercury':
      return 58;
    case 'venus':
      return 76;
    case 'earth':
      return 72;
    case 'mars':
      return 84;
    case 'jupiter':
      return 110;
    case 'saturn':
      return 98;
    case 'uranus':
      return 94;
    case 'neptune':
      return 118;
    case 'pluto':
      return 128;
    default:
      return 84;
  }
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
}) => {
  const planetSpinDurationSec = getPlanetSpinDurationSec(planetMedia?.title);
  const planetTextureRef = useRef(null);
  const [rollDistancePx, setRollDistancePx] = useState(1200);

  useEffect(() => {
    const node = planetTextureRef.current;
    const imageSrc = planetMedia?.image;
    if (!node || !imageSrc) return undefined;

    let resizeObserver;
    const image = new Image();

    const measure = () => {
      const rect = node.getBoundingClientRect();
      const height = Math.max(rect.height, 1);
      const ratio = image.naturalHeight ? image.naturalWidth / image.naturalHeight : 1;
      const nextDistance = Math.max(height * ratio, rect.width, 300);
      setRollDistancePx((prev) => (Math.abs(prev - nextDistance) > 0.5 ? nextDistance : prev));
    };

    image.onload = () => {
      measure();
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(node);
    };
    image.src = imageSrc;

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [planetMedia?.image]);

  return (
    <PlayerStage>
      <PlayerHeader>
        <PlayerTopBar>
          <PlayerTopLeft>
            <PlayerKicker>Now Boarding</PlayerKicker>
            <PlayerTitle $accent={accentColor}>{planetMedia.title}</PlayerTitle>
            <PlayerMeta $accent={accentColor}>{planetMedia.moodTarget}</PlayerMeta>
          </PlayerTopLeft>
          <PlayerIconActions>
            <IconActionButton type="button" onClick={onOpenDashboard} title="Dashboard" $accent={accentColor}>
              <LayoutDashboard size={16} />
            </IconActionButton>
            <IconActionButton type="button" onClick={onOpenProfile} title="Profile" $accent={accentColor}>
              <UserRound size={16} />
            </IconActionButton>
          </PlayerIconActions>
        </PlayerTopBar>
      </PlayerHeader>

      <PlayerLeftStack>
        <PlayerCard $accent={accentColor}>
          <TrackHeader>
            <TrackName $accent={accentColor}>{planetMedia.trackName}</TrackName>
            <TrackDuration>{formatClock(durationSec)}</TrackDuration>
          </TrackHeader>

          <ProgressRow>
            <TimeText>{formatClock(playheadSec)}</TimeText>
            <ProgressRange
              type="range"
              min={0}
              max={durationSec}
              value={playheadSec}
              $accent={accentColor}
              onChange={(event) => onSeek(Number(event.target.value))}
            />
            <TimeText>{formatClock(remainingSec)}</TimeText>
          </ProgressRow>

          <PlayerControls>
            <ControlButton type="button" onClick={onRewind} $accent={accentColor}>
              <SkipBack size={16} />
            </ControlButton>
            <PlayButton type="button" onClick={onTogglePlay} $accent={accentColor}>
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </PlayButton>
            <ControlButton type="button" onClick={onForward} $accent={accentColor}>
              <SkipForward size={16} />
            </ControlButton>
          </PlayerControls>

          <VolumeRow>
            <VolumeLabel $accent={accentColor} aria-hidden="true">
              <Volume2 size={12} />
            </VolumeLabel>
            <VolumeRange
              type="range"
              min={0}
              max={100}
              value={volumePercent}
              $accent={accentColor}
              onChange={(event) => onVolumeChange(Number(event.target.value))}
            />
            <VolumeValue>{volumePercent}%</VolumeValue>
          </VolumeRow>
        </PlayerCard>

        <DescriptionPanel>
          <DescriptionTitle $accent={accentColor}>Planet Brief</DescriptionTitle>
          <DescriptionText>{planetMedia.description}</DescriptionText>
        </DescriptionPanel>

        {aiConnected && (
          <AiConnectedPanel $accent={accentColor}>
            <AiConnectedTitle $accent={accentColor}>AI Objet에 연결되어있습니다.</AiConnectedTitle>
            <AiConnectedSub>ai objet에 연결되었습니다.</AiConnectedSub>
            <AiDisconnectButton type="button" onClick={onDisconnectAiObjet} $accent={accentColor}>
              연결 종료
            </AiDisconnectButton>
          </AiConnectedPanel>
        )}

        <BottomActions>
          <SecondaryAction type="button" onClick={onAskAiObjet} $accent={accentColor}>
            <Bot size={16} />
            AI Objet 연결하기
          </SecondaryAction>
          <DangerAction type="button" onClick={onExitIntent} $accent={accentColor}>
            우주 여행 종료하기
          </DangerAction>
        </BottomActions>
      </PlayerLeftStack>

      <PlayerRightPanel>
        <PlanetHero $accent={accentColor}>
          <PlanetHeroImage
            ref={planetTextureRef}
            role="img"
            aria-label={`${planetMedia.title} visual`}
            $image={planetMedia.image}
            $accent={accentColor}
            $spinDurationSec={planetSpinDurationSec}
            style={{ '--planet-roll-distance': `${rollDistancePx}px` }}
          />
          <PlanetHeroInfo>
            <HeroLabel $accent={accentColor}>{planetMedia.title} Environment</HeroLabel>
            <HeroTitle $accent={accentColor}>{planetMedia.trackName}</HeroTitle>
            <HeroBody>{planetMedia.moodTarget}</HeroBody>
          </PlanetHeroInfo>
        </PlanetHero>
      </PlayerRightPanel>
    </PlayerStage>
  );
};

export default React.memo(TravelPlayerPage);
