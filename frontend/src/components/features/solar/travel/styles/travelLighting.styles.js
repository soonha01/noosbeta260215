import styled from 'styled-components';

export const LightingPanel = styled.div`
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}38`};
  background: linear-gradient(180deg, rgba(11, 11, 11, 0.94), rgba(5, 5, 5, 0.9));
  padding: 0.58rem 0.62rem;
  display: grid;
  gap: 0.44rem;
  flex-shrink: 0;
`;

export const LightingTitle = styled.p`
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ $accent }) => `${$accent || '#ffffff'}d8`};
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

export const LightingSummary = styled.p`
  margin: 0;
  color: rgba(233, 239, 252, 0.86);
  font-size: 10px;
  line-height: 1.5;
`;

export const LightingTagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.26rem;
`;

export const LightingTag = styled.span`
  min-height: 22px;
  padding: 0 0.42rem;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}55`};
  background: ${({ $accent }) => `${$accent || '#ffffff'}10`};
  color: ${({ $accent }) => $accent || '#fff'};
  display: inline-flex;
  align-items: center;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

export const LightingSwatchRow = styled.div`
  display: flex;
  gap: 0.4rem;
  align-items: flex-start;

  > div {
    min-width: 0;
    flex: 1;
  }
`;

export const LightingSwatch = styled.div`
  width: 100%;
  height: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: #fff;
`;

export const LightingSwatchLabel = styled.p`
  margin: 0.18rem 0 0;
  color: rgba(214, 225, 248, 0.72);
  font-size: 9px;
  line-height: 1.4;
  word-break: break-word;
`;

export const LightingMetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.34rem;
`;

export const LightingMetricCard = styled.div`
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}2c`};
  background: rgba(255, 255, 255, 0.03);
  padding: 0.36rem 0.42rem;
  display: grid;
  gap: 0.12rem;
`;

export const LightingMetricLabel = styled.p`
  margin: 0;
  color: rgba(205, 217, 241, 0.66);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

export const LightingMetricValue = styled.p`
  margin: 0;
  color: #f5f7ff;
  font-size: 11px;
  line-height: 1.35;
  font-family: 'Freesentation Bold', 'Cardinal Fruit', sans-serif;
`;

export const LightingMeta = styled.p`
  margin: 0;
  color: rgba(223, 232, 248, 0.8);
  font-size: 10px;
  line-height: 1.45;
`;

export const LightingCode = styled.code`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.94);
  font-family: 'SF Mono', 'Menlo', monospace;
`;

export const LightingPhaseGrid = styled.div`
  display: grid;
  gap: 0.34rem;
`;

export const LightingPhaseCard = styled.div`
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}28`};
  background: rgba(255, 255, 255, 0.025);
  padding: 0.42rem;
  display: grid;
  gap: 0.22rem;
`;

export const LightingPhaseLabel = styled.p`
  margin: 0;
  color: ${({ $accent }) => $accent || '#fff'};
  font-size: 11px;
  font-family: 'Freesentation Bold', 'Cardinal Fruit', sans-serif;
`;

export const LightingPhaseMeta = styled.p`
  margin: 0;
  color: rgba(212, 224, 245, 0.72);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const LightingCitationRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.28rem;
`;

export const LightingCitationLink = styled.a`
  color: ${({ $accent }) => $accent || '#fff'};
  text-decoration: none;
  border-bottom: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}55`};
  font-size: 10px;
  line-height: 1.3;
`;
