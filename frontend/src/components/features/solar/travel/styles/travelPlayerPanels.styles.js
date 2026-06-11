import styled, { css } from 'styled-components';

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
