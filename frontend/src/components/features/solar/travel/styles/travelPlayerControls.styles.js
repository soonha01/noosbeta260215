import styled from 'styled-components';

export const PlayerCard = styled.div`
  border: 1px solid ${({ $accent }) => `${$accent}66`};
  background: linear-gradient(165deg, rgba(16, 16, 16, 0.95), rgba(4, 4, 4, 0.95));
  padding: 0.58rem 0.62rem;
  display: grid;
  gap: 0.4rem;
  flex-shrink: 0;
`;

export const TrackHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
`;

export const TrackName = styled.p`
  margin: 0;
  color: ${({ $accent }) => $accent || '#fff'};
  font-size: 14px;
  letter-spacing: -0.01em;
  font-family: 'Freesentation Bold', 'Cardinal Fruit', sans-serif;
`;

export const TrackDuration = styled.span`
  color: rgba(223, 233, 255, 0.72);
  font-size: 10px;
`;

export const ProgressRow = styled.div`
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  gap: 0.4rem;
`;

export const TimeText = styled.span`
  color: rgba(215, 226, 250, 0.72);
  font-size: 10px;
  text-align: center;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

export const ProgressRange = styled.input`
  width: 100%;
  appearance: none;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    ${({ $accent }) => $accent} 0%,
    ${({ $accent, value, max }) => $accent} ${({ $accent, value, max }) =>
      `${(Number(value) / Number(max || 1)) * 100}%`},
    rgba(255, 255, 255, 0.2) ${({ $accent, value, max }) =>
      `${(Number(value) / Number(max || 1)) * 100}%`},
    rgba(255, 255, 255, 0.2) 100%
  );
  outline: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.84);
    background: #fff;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.84);
    background: #fff;
    cursor: pointer;
  }
`;

export const PlayerControls = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.7rem;
`;

export const VolumeRow = styled.div`
  display: grid;
  grid-template-columns: 24px minmax(88px, 132px) 40px;
  align-items: center;
  gap: 0.4rem;
  justify-content: center;
`;

export const VolumeLabel = styled.span`
  width: 24px;
  height: 24px;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}55`};
  color: ${({ $accent }) => $accent || '#fff'};
  display: grid;
  place-items: center;
  background: ${({ $accent }) => `${$accent || '#ffffff'}12`};
`;

export const VolumeRange = styled.input`
  width: 100%;
  appearance: none;
  height: 5px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    ${({ $accent }) => $accent} 0%,
    ${({ $accent, value, max }) => $accent} ${({ value, max }) => `${(Number(value) / Number(max || 1)) * 100}%`},
    rgba(255, 255, 255, 0.2) ${({ value, max }) => `${(Number(value) / Number(max || 1)) * 100}%`},
    rgba(255, 255, 255, 0.2) 100%
  );
  outline: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.84);
    background: #fff;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.84);
    background: #fff;
    cursor: pointer;
  }
`;

export const VolumeValue = styled.span`
  color: rgba(215, 226, 250, 0.82);
  font-size: 10px;
  text-align: right;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

export const ControlButton = styled.button`
  width: 30px;
  height: 30px;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}88`};
  border-radius: 0;
  background: ${({ $accent }) => `${$accent || '#ffffff'}14`};
  color: ${({ $accent }) => $accent || '#fff'};
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;

  &:hover {
    border-color: ${({ $accent }) => $accent || 'rgba(255, 255, 255, 0.65)'};
    background: ${({ $accent }) => `${$accent || '#ffffff'}24`};
  }
`;

export const PlayButton = styled.button`
  min-width: 104px;
  height: 32px;
  border: 1px solid ${({ $accent }) => $accent};
  border-radius: 0;
  background: ${({ $accent }) => $accent};
  color: #000;
  font-size: 10px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.42rem;
  cursor: pointer;
  transition: filter 0.2s ease, transform 0.2s ease;

  &:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }
`;
