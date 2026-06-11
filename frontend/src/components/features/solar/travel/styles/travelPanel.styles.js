import styled from 'styled-components';

export const PanelPage = styled.div`
  min-height: 100%;
  background: #000;
  color: #f5f7ff;
  padding: 1.5rem 1.2rem 1.2rem;
  display: grid;
  align-content: start;
  gap: 1rem;
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
`;

export const PanelBackButton = styled.button`
  height: 36px;
  padding: 0 0.84rem;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}88`};
  border-radius: 0;
  background: ${({ $accent }) => `${$accent || '#ffffff'}14`};
  color: ${({ $accent }) => $accent || 'rgba(245, 248, 255, 0.94)'};
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  cursor: pointer;
`;

export const PanelTitle = styled.h2`
  margin: 0;
  color: ${({ $accent }) => $accent || '#fff'};
  font-size: 30px;
  line-height: 1;
  letter-spacing: -0.02em;
  font-family: 'Freesentation Black', 'Cardinal Fruit', sans-serif;
`;

export const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;

  .dash-wide {
    grid-column: 1 / -1;
  }

  .dash-note {
    grid-column: 1 / -1;
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;

    .dash-wide {
      grid-column: auto;
    }

    .dash-note {
      grid-column: auto;
    }
  }
`;

export const DashCard = styled.div`
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}4d`};
  background: rgba(9, 9, 9, 0.9);
  padding: 0.9rem;
  display: grid;
  gap: 0.45rem;
`;

export const DashLabel = styled.p`
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ $accent }) => `${$accent || '#ffffff'}cc`};
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

export const DashHeadline = styled.h3`
  margin: 0;
  color: ${({ $accent }) => $accent || '#fff'};
  font-size: 24px;
  line-height: 1.1;
  letter-spacing: -0.02em;
  font-family: 'Freesentation Bold', 'Cardinal Fruit', sans-serif;
`;

export const DashBody = styled.p`
  margin: 0;
  color: rgba(226, 236, 255, 0.84);
  font-size: 13px;
  line-height: 1.6;
`;

export const DashMeta = styled.p`
  margin: 0.24rem 0 0;
  color: ${({ $accent }) => `${$accent || '#ffffff'}bf`};
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

export const FeedbackList = styled.div`
  margin-top: 0.18rem;
  display: grid;
  gap: 0.32rem;
`;

export const FeedbackItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}3d`};
  padding: 0.38rem 0.5rem;
  font-size: 12px;
  color: rgba(228, 236, 251, 0.88);
`;

export const MemoInput = styled.textarea`
  width: 100%;
  min-height: 170px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 0;
  background: rgba(6, 6, 6, 0.92);
  color: #fff;
  padding: 0.68rem;
  resize: vertical;
  font-size: 13px;
  line-height: 1.56;
  font-family: 'Freesentation', 'SF Pro', sans-serif;
`;

export const MemoActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const MemoSaveButton = styled.button`
  height: 36px;
  border: 1px solid ${({ $accent }) => $accent || 'rgba(255, 255, 255, 0.58)'};
  border-radius: 0;
  background: ${({ $accent }) => $accent || '#fff'};
  color: #000;
  padding: 0 0.82rem;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  cursor: pointer;
`;

export const ProfileForm = styled.div`
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}4d`};
  background: rgba(8, 8, 8, 0.9);
  padding: 1rem;
  display: grid;
  gap: 0.62rem;
`;

export const ProfileRow = styled.div`
  display: grid;
  gap: 0.3rem;

  label {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${({ $accent }) => `${$accent || '#ffffff'}cc`};
    font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  }

  input {
    width: 100%;
    height: 40px;
    border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}55`};
    border-radius: 0;
    background: rgba(5, 5, 5, 0.9);
    color: #fff;
    padding: 0 0.64rem;
    font-size: 14px;
    font-family: 'Freesentation', 'SF Pro', sans-serif;
  }
`;

export const ProfileSaveButton = styled.button`
  margin-top: 0.3rem;
  height: 40px;
  width: fit-content;
  padding: 0 1rem;
  border: 1px solid ${({ $accent }) => $accent || 'rgba(255, 255, 255, 0.56)'};
  border-radius: 0;
  background: ${({ $accent }) => $accent || '#fff'};
  color: #000;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  cursor: pointer;
`;
