import styled from 'styled-components';
import { DISPLAY_FONT, floatIn, LABEL_FONT, UI_FONT } from './travelGenerationTokens';

export const Page = styled.div`
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

export const Stage = styled.div`
  height: calc(100vh - clamp(1.3rem, 3.2vw, 2.2rem));
  min-height: 0;
  display: grid;
  align-content: center;

  @media (max-width: 980px), (max-height: 760px) {
    height: auto;
    min-height: calc(100vh - clamp(1.3rem, 3.2vw, 2.2rem));
  }
`;

export const Grid = styled.div`
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

export const SketchCard = styled.section`
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

export const Header = styled.header`
  position: relative;
  z-index: 1;
  display: grid;
  gap: 0.36rem;
`;

export const TopLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
`;

export const Stamp = styled.div`
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

export const IconBox = styled.span`
  width: 30px;
  height: 30px;
  border: 2px solid ${({ $accent }) => $accent || '#111'};
  display: grid;
  place-items: center;
  background: #fff;
  color: ${({ $accent }) => $accent || '#111'};
  box-shadow: 3px 3px 0 ${({ $accent }) => `${$accent || '#111'}48`};
`;

export const ProgressPill = styled.div`
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

export const Title = styled.h2`
  margin: 0;
  color: #111;
  font-family: ${DISPLAY_FONT};
  font-size: clamp(34px, 4.7vw, 58px);
  font-weight: 400;
  line-height: 0.9;
  letter-spacing: 0;
`;

export const Body = styled.p`
  margin: 0;
  max-width: 58ch;
  color: rgba(16, 16, 16, 0.72);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.46;
`;

export const InfoGrid = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.42rem;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const InfoTile = styled.div`
  border: 2px solid ${({ $accent }) => `${$accent || '#111'}a8`};
  background: rgba(255, 255, 255, 0.58);
  padding: 0.48rem 0.56rem;
  min-width: 0;
`;

export const TileLabel = styled.p`
  margin: 0;
  color: rgba(16, 16, 16, 0.54);
  font-family: ${LABEL_FONT};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

export const TileValue = styled.p`
  margin: 0.18rem 0 0;
  color: ${({ $accent }) => $accent || '#111'};
  font-size: 13px;
  font-weight: 800;
  line-height: 1.35;
`;
