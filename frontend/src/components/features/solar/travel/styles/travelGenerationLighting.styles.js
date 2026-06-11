import styled from 'styled-components';
import { LABEL_FONT } from './travelGenerationTokens';

export const LightingCompact = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.36rem;
`;

export const LightingSwatch = styled.div`
  min-height: 44px;
  border: 2px solid ${({ $accent }) => `${$accent || '#111'}a8`};
  background: ${({ $color }) => $color || '#fff'};
`;

export const LightingMeta = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.36rem;
`;

export const LightingDatum = styled.div`
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
