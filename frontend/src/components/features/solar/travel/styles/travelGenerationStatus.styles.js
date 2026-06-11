import styled from 'styled-components';

export const StatusList = styled.ul`
  position: relative;
  z-index: 1;
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.36rem;

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

export const StatusItem = styled.li`
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  align-items: center;
  gap: 0.44rem;
  border: 2px solid ${({ $accent, $active }) => ($active ? $accent || '#111' : 'rgba(17, 17, 17, 0.22)')};
  background: ${({ $accent, $active }) => ($active ? `${$accent || '#111'}12` : 'rgba(255, 255, 255, 0.5)')};
  color: ${({ $active }) => ($active ? '#111' : 'rgba(17, 17, 17, 0.54)')};
  padding: 0.38rem;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.28;
`;

export const StatusMark = styled.span`
  width: 22px;
  height: 22px;
  border: 2px solid ${({ $accent, $active }) => ($active ? $accent || '#111' : 'rgba(17, 17, 17, 0.28)')};
  background: ${({ $accent, $active }) => ($active ? $accent || '#111' : 'transparent')};
  color: #fff;
  display: grid;
  place-items: center;
`;
