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

export const GenerationPage = styled.div`
  min-height: 100%;
  box-sizing: border-box;
  padding: 1rem;
  background:
    radial-gradient(circle at 18% 12%, rgba(255, 255, 255, 0.06), transparent 36%),
    radial-gradient(circle at 82% 18%, rgba(255, 255, 255, 0.04), transparent 30%),
    #000;
  color: #f5f7ff;
  display: grid;
  align-content: center;
`;

export const GenerationGrid = styled.div`
  width: min(100%, 1180px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.06fr) minmax(320px, 0.94fr);
  gap: 0.9rem;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const GenerationCard = styled.div`
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}42`};
  background: linear-gradient(165deg, rgba(10, 10, 10, 0.95), rgba(4, 4, 4, 0.9));
  padding: 1rem;
  display: grid;
  gap: 0.9rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.42);
`;

export const GenerationHeader = styled.div`
  display: grid;
  gap: 0.34rem;
`;

export const GenerationEyebrow = styled.p`
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: ${({ $accent }) => `${$accent || '#ffffff'}cc`};
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

export const GenerationTitle = styled.h2`
  margin: 0;
  color: ${({ $accent }) => $accent || '#fff'};
  font-size: clamp(28px, 3.3vw, 42px);
  line-height: 0.98;
  letter-spacing: -0.04em;
  font-family: 'Freesentation Black', 'Cardinal Fruit', sans-serif;
`;

export const GenerationBody = styled.p`
  margin: 0;
  color: rgba(232, 239, 252, 0.84);
  font-size: 14px;
  line-height: 1.7;
  max-width: 56ch;
`;

export const GenerationMeta = styled.p`
  margin: 0;
  color: rgba(210, 223, 246, 0.72);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.6;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

export const GenerationProgressLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  color: rgba(236, 242, 255, 0.88);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;

  strong {
    color: #fff;
    font-size: 14px;
    font-family: 'Freesentation Bold', 'Cardinal Fruit', sans-serif;
  }
`;

export const GenerationProgressBar = styled.div`
  margin-top: 0.32rem;
  width: 100%;
  height: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.06);
`;

export const GenerationProgressFill = styled.div`
  height: 100%;
  min-width: 6px;
  background: linear-gradient(
    90deg,
    ${({ $accent }) => `${$accent || '#ffffff'}80`},
    ${({ $accent }) => $accent || '#fff'}
  );
  transition: width 0.5s ease;
`;

export const GenerationStatusList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.44rem;
`;

export const GenerationStatusItem = styled.li`
  border: 1px solid
    ${({ $accent, $isActive }) =>
      $isActive ? `${$accent || '#ffffff'}68` : 'rgba(255, 255, 255, 0.12)'};
  background: ${({ $accent, $isActive }) =>
    $isActive ? `${$accent || '#ffffff'}14` : 'rgba(255, 255, 255, 0.03)'};
  color: ${({ $isActive }) => ($isActive ? 'rgba(248, 250, 255, 0.94)' : 'rgba(212, 224, 245, 0.62)')};
  padding: 0.72rem 0.78rem;
  font-size: 13px;
  line-height: 1.55;
  transition: border-color 0.24s ease, background 0.24s ease, color 0.24s ease;
`;

export const GenerationActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
`;

export const GenerationAction = styled.button`
  ${actionBase}
  min-width: 170px;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}88`};
  background: ${({ $accent }) => `${$accent || '#ffffff'}14`};
  color: ${({ $accent }) => $accent || '#fff'};
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: ${({ $accent }) => $accent || '#fff'};
    background: ${({ $accent }) => `${$accent || '#ffffff'}22`};
    transform: translateY(-1px);
  }
`;
