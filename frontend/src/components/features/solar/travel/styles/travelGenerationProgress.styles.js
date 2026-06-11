import styled from 'styled-components';
import { LABEL_FONT, scan } from './travelGenerationTokens';

export const ProgressPanel = styled.div`
  position: relative;
  z-index: 1;
  border: 2px solid #111;
  background: rgba(255, 255, 255, 0.72);
  padding: 0.56rem 0.68rem;
  display: grid;
  gap: 0.38rem;
`;

export const ProgressHead = styled.div`
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
`;

export const ProgressLabel = styled.div`
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

export const ActiveStatus = styled.p`
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

export const Track = styled.div`
  position: relative;
  height: 12px;
  overflow: hidden;
  border: 2px solid #111;
  background: rgba(17, 17, 17, 0.08);
`;

export const Fill = styled.div`
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
