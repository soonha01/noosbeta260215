import styled, { css, keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const planetTextureRoll = keyframes`
  from {
    background-position-x: 0px;
  }
  to {
    background-position-x: calc(var(--planet-roll-distance, 1200px) * -1);
  }
`;

export const Shell = styled.div`
  position: relative;
  width: 100%;
  height: ${({ $standalone }) => ($standalone ? '100vh' : '100%')};
  min-height: ${({ $standalone }) => ($standalone ? '100vh' : '100%')};
  background: #000;
  color: #f4f6ff;
  overflow: hidden;
  opacity: ${({ $fadeOut }) => ($fadeOut ? 0 : 1)};
  filter: ${({ $fadeOut }) => ($fadeOut ? 'blur(8px)' : 'blur(0px)')};
  transform: ${({ $fadeOut }) => ($fadeOut ? 'scale(0.99)' : 'scale(1)')};
  transition:
    opacity ${({ $fadeDurationSec = 0.8 }) => `${$fadeDurationSec}s`} ease,
    filter ${({ $fadeDurationSec = 0.8 }) => `${$fadeDurationSec}s`} ease,
    transform ${({ $fadeDurationSec = 0.8 }) => `${$fadeDurationSec}s`} ease;
`;

export const StepFrame = styled(motion.div)`
  position: absolute;
  inset: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
`;

export const PlayerStage = styled.div`
  min-height: 100%;
  box-sizing: border-box;
  padding: 0.9rem 0.95rem 0.82rem;
  display: grid;
  grid-template-columns: minmax(0, 1.03fr) minmax(320px, 0.97fr);
  grid-template-rows: auto minmax(0, 1fr);
  grid-template-areas:
    'header header'
    'left right';
  gap: 0.58rem;
  font-family: 'Freesentation', 'SF Pro', sans-serif;
  background: radial-gradient(circle at 20% 10%, rgba(255, 255, 255, 0.07), transparent 40%), #000;
  overflow: hidden;

  @media (max-width: 1020px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    grid-template-areas:
      'header'
      'right'
      'left';
    overflow-y: auto;
  }
`;

export const PlayerHeader = styled.div`
  grid-area: header;
  min-height: 0;
`;

export const PlayerLeftStack = styled.div`
  grid-area: left;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const PlayerRightPanel = styled.div`
  grid-area: right;
  min-height: 0;
  height: 100%;
`;

export const PlayerTopBar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  align-items: center;
`;

export const PlayerTopLeft = styled.div`
  min-width: 0;
`;

export const PlayerKicker = styled.p`
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.66);
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

export const PlayerTitle = styled.h2`
  margin: 0.22rem 0 0;
  font-size: clamp(24px, 3vw, 34px);
  line-height: 1;
  color: ${({ $accent }) => $accent || '#fff'};
  letter-spacing: -0.03em;
  font-family: 'Freesentation Black', 'Cardinal Fruit', sans-serif;
`;

export const PlayerMeta = styled.p`
  margin: 0.2rem 0 0;
  color: ${({ $accent }) => `${$accent || '#ffffff'}cc`};
  font-size: 11px;
`;

export const PlayerIconActions = styled.div`
  display: inline-flex;
  gap: 0.5rem;
`;

export const IconActionButton = styled.button`
  width: 34px;
  height: 34px;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}88`};
  border-radius: 0;
  background: ${({ $accent }) => `${$accent || '#ffffff'}14`};
  color: ${({ $accent }) => $accent || 'rgba(255, 255, 255, 0.92)'};
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: ${({ $accent }) => $accent || 'rgba(255, 255, 255, 0.64)'};
    background: ${({ $accent }) => `${$accent || '#ffffff'}24`};
    transform: translateY(-1px);
  }
`;

export const PlanetHero = styled.section`
  position: relative;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}40`};
  height: 100%;
  min-height: 0;
  flex-shrink: 0;
  overflow: hidden;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 0.62rem;
  padding: 0.8rem 0.76rem;
  background: radial-gradient(circle at 28% 18%, rgba(255, 255, 255, 0.07), rgba(0, 0, 0, 0) 44%), #030303;

  @media (max-width: 1020px) {
    height: clamp(240px, 34vh, 320px);
  }
`;

export const PlanetHeroImage = styled.div`
  width: clamp(220px, 30vw, 370px);
  aspect-ratio: 1 / 1;
  position: relative;
  overflow: hidden;
  border-radius: 999px;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}78`};
  background: #060606;
  background-image: url(${({ $image }) => $image});
  background-repeat: repeat-x;
  background-size: auto 100%;
  background-position: 0 50%;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.12),
    0 24px 58px rgba(0, 0, 0, 0.58);
  display: block;
  will-change: background-position;
  transform: translateZ(0);
  animation: ${planetTextureRoll} ${({ $spinDurationSec = 24 }) => `${$spinDurationSec}s`} linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const PlanetHeroTint = styled.div`
  display: none;
`;

export const PlanetHeroInfo = styled.div`
  position: static;
  width: min(100%, 420px);
  padding: 0;
  display: grid;
  gap: 0.2rem;
  background: none;
  text-align: center;
  justify-items: center;
`;

export const HeroLabel = styled.p`
  margin: 0;
  width: fit-content;
  height: 21px;
  padding: 0 0.42rem;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}77`};
  display: inline-flex;
  align-items: center;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: ${({ $accent }) => $accent || 'rgba(255, 255, 255, 0.76)'};
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

export const HeroTitle = styled.h3`
  margin: 0;
  color: ${({ $accent }) => $accent || '#fff'};
  font-size: clamp(18px, 2.6vw, 26px);
  letter-spacing: -0.02em;
  line-height: 1;
  font-family: 'Freesentation Bold', 'Cardinal Fruit', sans-serif;
`;

export const HeroBody = styled.p`
  margin: 0;
  color: rgba(236, 241, 252, 0.84);
  font-size: 10px;
  line-height: 1.42;
  text-align: center;
`;

export const PlayerCard = styled.div`
  border: 1px solid ${({ $accent }) => `${$accent}66`};
  background: linear-gradient(165deg, rgba(16, 16, 16, 0.95), rgba(4, 4, 4, 0.95));
  padding: 0.58rem 0.62rem;
  display: grid;
  gap: 0.4rem;
  flex-shrink: 0;
`;

export const TrackHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
`;

export const TrackName = styled.p`
  margin: 0;
  color: ${({ $accent }) => $accent || '#fff'};
  font-size: 14px;
  letter-spacing: -0.01em;
  font-family: 'Freesentation Bold', 'Cardinal Fruit', sans-serif;
`;

export const TrackDuration = styled.span`
  color: rgba(223, 233, 255, 0.72);
  font-size: 10px;
`;

export const ProgressRow = styled.div`
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  gap: 0.4rem;
`;

export const TimeText = styled.span`
  color: rgba(215, 226, 250, 0.72);
  font-size: 10px;
  text-align: center;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

export const ProgressRange = styled.input`
  width: 100%;
  appearance: none;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    ${({ $accent }) => $accent} 0%,
    ${({ $accent, value, max }) => $accent} ${({ $accent, value, max }) =>
      `${(Number(value) / Number(max || 1)) * 100}%`},
    rgba(255, 255, 255, 0.2) ${({ $accent, value, max }) =>
      `${(Number(value) / Number(max || 1)) * 100}%`},
    rgba(255, 255, 255, 0.2) 100%
  );
  outline: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.84);
    background: #fff;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.84);
    background: #fff;
    cursor: pointer;
  }
`;

export const PlayerControls = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.7rem;
`;

export const VolumeRow = styled.div`
  display: grid;
  grid-template-columns: 24px minmax(88px, 132px) 40px;
  align-items: center;
  gap: 0.4rem;
  justify-content: center;
`;

export const VolumeLabel = styled.span`
  width: 24px;
  height: 24px;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}55`};
  color: ${({ $accent }) => $accent || '#fff'};
  display: grid;
  place-items: center;
  background: ${({ $accent }) => `${$accent || '#ffffff'}12`};
`;

export const VolumeRange = styled.input`
  width: 100%;
  appearance: none;
  height: 5px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    ${({ $accent }) => $accent} 0%,
    ${({ $accent, value, max }) => $accent} ${({ value, max }) => `${(Number(value) / Number(max || 1)) * 100}%`},
    rgba(255, 255, 255, 0.2) ${({ value, max }) => `${(Number(value) / Number(max || 1)) * 100}%`},
    rgba(255, 255, 255, 0.2) 100%
  );
  outline: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.84);
    background: #fff;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.84);
    background: #fff;
    cursor: pointer;
  }
`;

export const VolumeValue = styled.span`
  color: rgba(215, 226, 250, 0.82);
  font-size: 10px;
  text-align: right;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

export const ControlButton = styled.button`
  width: 30px;
  height: 30px;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}88`};
  border-radius: 0;
  background: ${({ $accent }) => `${$accent || '#ffffff'}14`};
  color: ${({ $accent }) => $accent || '#fff'};
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;

  &:hover {
    border-color: ${({ $accent }) => $accent || 'rgba(255, 255, 255, 0.65)'};
    background: ${({ $accent }) => `${$accent || '#ffffff'}24`};
  }
`;

export const PlayButton = styled.button`
  min-width: 104px;
  height: 32px;
  border: 1px solid ${({ $accent }) => $accent};
  border-radius: 0;
  background: ${({ $accent }) => $accent};
  color: #000;
  font-size: 10px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.42rem;
  cursor: pointer;
  transition: filter 0.2s ease, transform 0.2s ease;

  &:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }
`;

export const DescriptionPanel = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(8, 8, 8, 0.88);
  padding: 0.52rem 0.58rem;
  flex-shrink: 0;
`;

export const DescriptionTitle = styled.p`
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ $accent }) => `${$accent || '#ffffff'}cc`};
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

export const DescriptionText = styled.p`
  margin: 0.24rem 0 0;
  color: rgba(236, 241, 252, 0.88);
  font-size: 10px;
  line-height: 1.42;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const AiConnectedPanel = styled.div`
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}88`};
  background: rgba(9, 9, 9, 0.92);
  padding: 0.46rem 0.52rem;
  display: grid;
  gap: 0.2rem;
  flex-shrink: 0;
`;

export const AiConnectedTitle = styled.p`
  margin: 0;
  color: ${({ $accent }) => $accent || '#fff'};
  font-size: 12px;
  font-family: 'Freesentation Bold', 'Cardinal Fruit', sans-serif;
`;

export const AiConnectedSub = styled.p`
  margin: 0;
  color: rgba(228, 236, 252, 0.78);
  font-size: 10px;
`;

export const AiDisconnectButton = styled.button`
  width: fit-content;
  min-width: 86px;
  height: 26px;
  border: 1px solid ${({ $accent }) => $accent || 'rgba(255, 255, 255, 0.34)'};
  border-radius: 0;
  background: ${({ $accent }) => $accent || '#ffffff'};
  color: #000;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  cursor: pointer;
`;

export const BottomActions = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 0.34rem;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  margin-top: auto;
`;

const actionBase = css`
  height: 32px;
  border-radius: 0;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  padding: 0 0.6rem;
  cursor: pointer;
`;

export const SecondaryAction = styled.button`
  ${actionBase}
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}88`};
  background: ${({ $accent }) => `${$accent || '#ffffff'}14`};
  color: ${({ $accent }) => $accent || 'rgba(255, 255, 255, 0.94)'};
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  justify-content: center;
  flex: 1;
`;

export const DangerAction = styled.button`
  ${actionBase}
  border: 1px solid ${({ $accent }) => $accent || 'rgba(255, 255, 255, 0.55)'};
  background: ${({ $accent }) => $accent || '#fff'};
  color: #000;
  flex: 1;
`;

export const PanelPage = styled.div`
  min-height: 100%;
  background: #000;
  color: #f5f7ff;
  padding: 1.5rem 1.2rem 1.2rem;
  display: grid;
  align-content: start;
  gap: 1rem;
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
`;

export const PanelBackButton = styled.button`
  height: 36px;
  padding: 0 0.84rem;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}88`};
  border-radius: 0;
  background: ${({ $accent }) => `${$accent || '#ffffff'}14`};
  color: ${({ $accent }) => $accent || 'rgba(245, 248, 255, 0.94)'};
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  cursor: pointer;
`;

export const PanelTitle = styled.h2`
  margin: 0;
  color: ${({ $accent }) => $accent || '#fff'};
  font-size: 30px;
  line-height: 1;
  letter-spacing: -0.02em;
  font-family: 'Freesentation Black', 'Cardinal Fruit', sans-serif;
`;

export const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;

  .dash-note {
    grid-column: 1 / -1;
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;

    .dash-note {
      grid-column: auto;
    }
  }
`;

export const DashCard = styled.div`
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}4d`};
  background: rgba(9, 9, 9, 0.9);
  padding: 0.9rem;
  display: grid;
  gap: 0.45rem;
`;

export const DashLabel = styled.p`
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ $accent }) => `${$accent || '#ffffff'}cc`};
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

export const DashHeadline = styled.h3`
  margin: 0;
  color: ${({ $accent }) => $accent || '#fff'};
  font-size: 24px;
  line-height: 1.1;
  letter-spacing: -0.02em;
  font-family: 'Freesentation Bold', 'Cardinal Fruit', sans-serif;
`;

export const DashBody = styled.p`
  margin: 0;
  color: rgba(226, 236, 255, 0.84);
  font-size: 13px;
  line-height: 1.6;
`;

export const DashMeta = styled.p`
  margin: 0.24rem 0 0;
  color: ${({ $accent }) => `${$accent || '#ffffff'}bf`};
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

export const FeedbackList = styled.div`
  margin-top: 0.18rem;
  display: grid;
  gap: 0.32rem;
`;

export const FeedbackItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}3d`};
  padding: 0.38rem 0.5rem;
  font-size: 12px;
  color: rgba(228, 236, 251, 0.88);
`;

export const MemoInput = styled.textarea`
  width: 100%;
  min-height: 170px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 0;
  background: rgba(6, 6, 6, 0.92);
  color: #fff;
  padding: 0.68rem;
  resize: vertical;
  font-size: 13px;
  line-height: 1.56;
  font-family: 'Freesentation', 'SF Pro', sans-serif;
`;

export const MemoActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const MemoSaveButton = styled.button`
  height: 36px;
  border: 1px solid ${({ $accent }) => $accent || 'rgba(255, 255, 255, 0.58)'};
  border-radius: 0;
  background: ${({ $accent }) => $accent || '#fff'};
  color: #000;
  padding: 0 0.82rem;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  cursor: pointer;
`;

export const ProfileForm = styled.div`
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}4d`};
  background: rgba(8, 8, 8, 0.9);
  padding: 1rem;
  display: grid;
  gap: 0.62rem;
`;

export const ProfileRow = styled.div`
  display: grid;
  gap: 0.3rem;

  label {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${({ $accent }) => `${$accent || '#ffffff'}cc`};
    font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  }

  input {
    width: 100%;
    height: 40px;
    border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}55`};
    border-radius: 0;
    background: rgba(5, 5, 5, 0.9);
    color: #fff;
    padding: 0 0.64rem;
    font-size: 14px;
    font-family: 'Freesentation', 'SF Pro', sans-serif;
  }
`;

export const ProfileSaveButton = styled.button`
  margin-top: 0.3rem;
  height: 40px;
  width: fit-content;
  padding: 0 1rem;
  border: 1px solid ${({ $accent }) => $accent || 'rgba(255, 255, 255, 0.56)'};
  border-radius: 0;
  background: ${({ $accent }) => $accent || '#fff'};
  color: #000;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  cursor: pointer;
`;

export const ModalLayer = styled(motion.div)`
  position: absolute;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.68);
  display: grid;
  place-items: center;
  padding: 1rem;
`;

export const ModalCard = styled(motion.div)`
  width: min(92vw, 460px);
  border: 1px solid ${({ $accent }) => ($accent ? `${$accent}70` : 'rgba(255, 255, 255, 0.24)')};
  background: rgba(7, 7, 7, 0.96);
  color: #fff;
  padding: 1rem;
  display: grid;
  gap: 0.8rem;
  position: relative;
`;

export const ModalTitle = styled.h3`
  margin: 0;
  color: ${({ $accent }) => ($accent ? $accent : '#fff')};
  font-size: 24px;
  line-height: 1.1;
  letter-spacing: -0.02em;
  font-family: 'Freesentation Bold', 'Cardinal Fruit', sans-serif;
`;

export const ModalBody = styled.p`
  margin: 0;
  color: ${({ $accent }) => ($accent ? `${$accent}cc` : 'rgba(224, 233, 250, 0.84)')};
  font-size: 14px;
  line-height: 1.6;
`;

export const ModalButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
`;

export const ModalPrimaryButton = styled.button`
  flex: 1;
  min-width: 170px;
  height: 40px;
  border: 1px solid ${({ $accent }) => $accent || 'rgba(255, 255, 255, 0.62)'};
  border-radius: 0;
  background: ${({ $accent }) => $accent || '#fff'};
  color: #000;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const ModalGhostButton = styled.button`
  flex: 1;
  min-width: 140px;
  height: 40px;
  border: 1px solid ${({ $accent }) => ($accent ? `${$accent}70` : 'rgba(255, 255, 255, 0.32)')};
  border-radius: 0;
  background: ${({ $accent }) => ($accent ? `${$accent}14` : 'rgba(14, 14, 14, 0.9)')};
  color: ${({ $accent }) => ($accent ? $accent : 'rgba(255, 255, 255, 0.92)')};
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  cursor: pointer;
`;

export const CloseModalButton = styled.button`
  position: absolute;
  top: 0.62rem;
  right: 0.62rem;
  width: 28px;
  height: 28px;
  border: 1px solid ${({ $accent }) => ($accent ? `${$accent}66` : 'rgba(255, 255, 255, 0.25)')};
  border-radius: 0;
  background: ${({ $accent }) => ($accent ? `${$accent}14` : 'rgba(14, 14, 14, 0.84)')};
  color: ${({ $accent }) => ($accent ? $accent : '#fff')};
  display: grid;
  place-items: center;
  cursor: pointer;
`;

export const Loader = styled.div`
  margin: 20px auto 0;
  width: 102px;
  height: 102px;
  position: relative;
  border-radius: 999px;
  justify-self: center;
  align-self: center;
  border: 1px solid ${({ $accent }) => ($accent ? `${$accent}40` : 'rgba(255, 255, 255, 0.2)')};
  background:
    radial-gradient(circle at 50% 44%, ${({ $accent }) => ($accent ? `${$accent}24` : 'rgba(255, 255, 255, 0.12)')}, rgba(255, 255, 255, 0.01) 62%),
    rgba(0, 0, 0, 0.58);
  display: grid;
  place-items: center;
  overflow: hidden;

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 999px;
    border: 1px solid ${({ $accent }) => ($accent ? `${$accent}66` : 'rgba(255, 255, 255, 0.26)')};
    animation: aiObjetRingPulse 1.8s ease-in-out infinite;
  }

  &::before {
    width: 54px;
    height: 54px;
  }

  &::after {
    width: 80px;
    height: 80px;
    animation-delay: 0.28s;
    opacity: 0.62;
  }

  .loader-core {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    background: ${({ $accent }) => $accent || '#fff'};
    box-shadow: 0 0 18px ${({ $accent }) => ($accent ? `${$accent}8f` : 'rgba(255, 255, 255, 0.56)')};
    animation: aiObjetCorePulse 1.2s ease-in-out infinite;
  }

  @keyframes aiObjetRingPulse {
    0% {
      transform: translate(-50%, -50%) scale(0.92);
      opacity: 0.35;
    }
    60% {
      opacity: 0.92;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.1);
      opacity: 0.28;
    }
  }

  @keyframes aiObjetCorePulse {
    0%,
    100% {
      transform: scale(0.9);
      opacity: 0.72;
    }
    50% {
      transform: scale(1.12);
      opacity: 1;
    }
  }
`;

export const RatingRow = styled.div`
  display: inline-flex;
  gap: 0.45rem;
`;

export const RatingButton = styled.button`
  width: 36px;
  height: 36px;
  border: 1px solid
    ${({ $active, $accent }) =>
      $active ? ($accent || 'rgba(255, 255, 255, 0.65)') : ($accent ? `${$accent}70` : 'rgba(255, 255, 255, 0.3)')};
  border-radius: 0;
  background: ${({ $active, $accent }) => ($active ? ($accent || '#fff') : ($accent ? `${$accent}14` : 'rgba(16, 16, 16, 0.92)'))};
  color: ${({ $active }) => ($active ? '#000' : '#fff')};
  font-size: 13px;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  cursor: pointer;
`;
