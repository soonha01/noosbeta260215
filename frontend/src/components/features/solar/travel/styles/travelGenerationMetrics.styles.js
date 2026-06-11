import styled from 'styled-components';
import { LABEL_FONT } from './travelGenerationTokens';

export const Metrics = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.42rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const MetricTile = styled.div`
  border: 2px solid ${({ $accent }) => `${$accent || '#111'}b8`};
  background: rgba(255, 255, 255, 0.64);
  padding: 0.5rem;
  display: grid;
  gap: 0.26rem;
`;

export const MetricTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

export const MetricLabel = styled.p`
  margin: 0;
  color: rgba(16, 16, 16, 0.58);
  font-family: ${LABEL_FONT};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const MetricValue = styled.p`
  margin: 0;
  color: ${({ $accent }) => $accent || '#111'};
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
`;

export const MetricBody = styled.p`
  margin: 0;
  color: rgba(20, 20, 20, 0.66);
  font-size: 9px;
  font-weight: 600;
  line-height: 1.34;
`;

export const MiniBars = styled.div`
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  align-items: end;
  gap: 0.18rem;
  height: 26px;
`;

export const MiniBar = styled.span`
  display: block;
  height: ${({ $height }) => `${$height}%`};
  min-height: 6px;
  border: 1px solid ${({ $accent }) => `${$accent || '#111'}aa`};
  background: ${({ $accent, $active }) => ($active ? $accent || '#111' : `${$accent || '#111'}1a`)};
`;
