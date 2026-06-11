import styled, { keyframes } from 'styled-components';

const planetTextureRoll = keyframes`
  from {
    background-position-x: 0px;
  }
  to {
    background-position-x: calc(var(--planet-roll-distance, 1200px) * -1);
  }
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
