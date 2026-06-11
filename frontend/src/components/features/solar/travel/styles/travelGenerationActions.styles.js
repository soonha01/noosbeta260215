import styled from 'styled-components';
import { LABEL_FONT } from './travelGenerationTokens';

export const ErrorText = styled.p`
  position: relative;
  z-index: 1;
  margin: 0;
  border: 2px solid rgba(178, 30, 30, 0.86);
  background: rgba(255, 230, 230, 0.9);
  color: rgba(118, 12, 12, 0.92);
  padding: 0.72rem;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.55;
`;

export const Actions = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
`;

export const ActionButton = styled.button`
  min-height: 40px;
  border: 2px solid ${({ $accent }) => $accent || '#111'};
  border-radius: 0;
  background: ${({ $accent, $primary }) => ($primary ? $accent || '#111' : 'rgba(255, 255, 255, 0.74)')};
  color: ${({ $primary }) => ($primary ? '#fff' : '#111')};
  box-shadow: 4px 4px 0 rgba(17, 17, 17, 0.22);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0 0.86rem;
  font-family: ${LABEL_FONT};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 rgba(17, 17, 17, 0.22);
  }
`;
