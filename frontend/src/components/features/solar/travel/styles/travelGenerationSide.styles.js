import styled from 'styled-components';
import { DISPLAY_FONT, LABEL_FONT } from './travelGenerationTokens';
import { SketchCard } from './travelGenerationLayout.styles';

export const SideStack = styled.div`
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

export const PreviewCard = styled(SketchCard)`
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

export const PlanetFrame = styled.div`
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

export const PlanetNote = styled.div`
  width: min(100%, 320px);
  border: 2px solid ${({ $accent }) => $accent || '#111'};
  background: rgba(255, 255, 251, 0.9);
  box-shadow: 4px 4px 0 ${({ $accent }) => `${$accent || '#111'}cc`};
  padding: 0.62rem;
  display: grid;
  gap: 0.22rem;
`;

export const PlanetLabel = styled.p`
  margin: 0;
  color: ${({ $accent }) => $accent || '#111'};
  font-family: ${LABEL_FONT};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

export const PlanetTitle = styled.h3`
  margin: 0;
  color: #111;
  font-family: ${DISPLAY_FONT};
  font-size: clamp(28px, 3.4vw, 42px);
  font-weight: 400;
  line-height: 0.9;
`;

export const PlanetBody = styled.p`
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

export const DeviceCard = styled(SketchCard)`
  height: auto;
  gap: 0.45rem;
`;

export const DeviceHeader = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
`;

export const DeviceTitle = styled.h3`
  margin: 0;
  color: #111;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
`;

export const SparkLine = styled.div`
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
