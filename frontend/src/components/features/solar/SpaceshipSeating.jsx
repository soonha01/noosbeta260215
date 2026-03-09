import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { getPlanetAccent } from '../../../lib/planetAccents';

const SEAT_COLUMNS = ['A', 'B', 'C', 'D'];
const ROWS = Array.from({ length: 10 }, (_, i) => i + 1);

const SpaceshipSeating = ({ planet, onSeatSelect, onBack }) => {
  const [selectedSeat, setSelectedSeat] = useState(null);

  const destination = planet || 'Mars';
  const accentColor = getPlanetAccent(destination);

  const handleConfirm = () => {
    if (selectedSeat) onSeatSelect(selectedSeat);
  };

  return (
    <Screen>
      <BackButton type="button" onClick={onBack}>
        ← Planets
      </BackButton>

      <Header
        initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <Eyebrow>Cabin Selection</Eyebrow>
        <Title $accent={accentColor}>Choose Your Seat</Title>
        <Subtitle>Destination: {destination}</Subtitle>
      </Header>

      <CabinCard
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <HullNose />

        <CabinFrame>
          <CabinTop>
            <DeckBadge>Deck A</DeckBadge>
            <CabinHint>좌석을 선택하고 탑승을 진행하세요</CabinHint>
          </CabinTop>

          <SeatBody>
            <AisleGuide aria-hidden="true" />
            <ColumnLegend>
              <LegendSpacer aria-hidden="true" />
              <LegendSlot>A</LegendSlot>
              <LegendSlot>B</LegendSlot>
              <AisleLabel>aisle</AisleLabel>
              <LegendSlot>C</LegendSlot>
              <LegendSlot>D</LegendSlot>
            </ColumnLegend>

            <SeatGrid>
              {ROWS.map((row) => (
                <SeatRow key={row}>
                  <RowLabel>{String(row).padStart(2, '0')}</RowLabel>
                  {SEAT_COLUMNS.map((column, colIdx) => {
                    const seatId = `${String(row).padStart(2, '0')}${column}`;
                    const isSelected = seatId === selectedSeat;

                    return (
                      <React.Fragment key={seatId}>
                        <SeatButton
                          type="button"
                          $isSelected={isSelected}
                          $accent={accentColor}
                          onClick={() => setSelectedSeat(seatId)}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.98 }}
                          aria-pressed={isSelected}
                        >
                          {column}
                        </SeatButton>
                        {colIdx === 1 && <AisleGap aria-hidden="true" />}
                      </React.Fragment>
                    );
                  })}
                </SeatRow>
              ))}
            </SeatGrid>
          </SeatBody>
        </CabinFrame>
      </CabinCard>

      <SelectionPanel
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <SelectionText>
          {selectedSeat ? (
            <>
              Selected Seat <strong>{selectedSeat}</strong>
            </>
          ) : (
            'Please select a seat'
          )}
        </SelectionText>
        <ConfirmButton
          type="button"
          onClick={handleConfirm}
          disabled={!selectedSeat}
          $accent={accentColor}
        >
          Confirm Seat
        </ConfirmButton>
      </SelectionPanel>
    </Screen>
  );
};

const Screen = styled.div`
  min-height: 100%;
  position: relative;
  padding: 4.8rem 1.2rem 1.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  color: #f4f7ff;
  font-family: 'Freesentation', 'SF Pro', sans-serif;
  background: #000;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
`;

const BackButton = styled.button`
  position: absolute;
  top: 1.4rem;
  left: 1.4rem;
  border: 1px solid rgba(255, 255, 255, 0.34);
  background: rgba(0, 0, 0, 0.8);
  color: rgba(241, 245, 255, 0.92);
  border-radius: 0;
  padding: 0.46rem 0.95rem;
  font-size: 12px;
  letter-spacing: 0.02em;
  font-family: 'Freesentation', 'Cardinal Fruit', sans-serif;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: rgba(18, 18, 18, 0.94);
    border-color: rgba(255, 255, 255, 0.6);
  }
`;

const Header = styled(motion.div)`
  text-align: center;
  margin-top: 0.5rem;
`;

const Eyebrow = styled.div`
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  color: rgba(255, 255, 255, 0.72);
`;

const Title = styled.h1`
  margin: 0.5rem 0 0;
  font-size: clamp(30px, 4vw, 44px);
  line-height: 1.08;
  color: ${({ $accent }) => $accent || '#ffffff'};
  letter-spacing: -0.02em;
  font-family: 'Freesentation Black', 'SF Pro', sans-serif;
`;

const Subtitle = styled.p`
  margin: 0.6rem 0 0;
  color: rgba(222, 231, 255, 0.86);
  font-size: 14px;
  letter-spacing: 0.02em;
`;

const CabinCard = styled(motion.div)`
  position: relative;
  width: min(92vw, 560px);
  border-radius: 26px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(8, 8, 8, 0.88);
  padding: 1.4rem 1.2rem 1.1rem;
  box-shadow: 0 28px 46px rgba(0, 0, 0, 0.56);

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 42%;
    width: 14px;
    height: 92px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    background: rgba(20, 20, 20, 0.88);
    z-index: 0;
  }

  &::before {
    left: -8px;
    border-radius: 10px 0 0 10px;
    transform: skewY(-6deg);
  }

  &::after {
    right: -8px;
    border-radius: 0 10px 10px 0;
    transform: skewY(6deg);
  }
`;

const HullNose = styled.div`
  width: 98px;
  height: 44px;
  margin: 0 auto 0.58rem;
  border-radius: 70px 70px 14px 14px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(14, 14, 14, 0.94);
`;

const CabinFrame = styled.div`
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(4, 4, 4, 0.82);
  border-radius: 14px;
  padding: 0.95rem 0.9rem 0.82rem;
`;

const CabinTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.72rem;
  gap: 0.7rem;
`;

const DeckBadge = styled.span`
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: 999px;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.32rem 0.58rem;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  color: rgba(255, 255, 255, 0.9);
`;

const CabinHint = styled.span`
  font-size: 11px;
  color: rgba(216, 225, 255, 0.68);
`;

const SeatBody = styled.div`
  --seat-size: 54px;
  --seat-gap: 0.36rem;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  padding: 0.66rem 0.58rem 0.52rem;
  background: rgba(8, 8, 8, 0.86);

  @media (max-width: 620px) {
    --seat-size: 48px;
    --seat-gap: 0.28rem;
  }
`;

const AisleGuide = styled.div`
  position: absolute;
  top: 30px;
  bottom: 10px;
  left: calc(36px + var(--seat-size, 54px) * 2 + var(--seat-gap, 0.36rem) * 2 + 15px);
  width: 1px;
  background: rgba(255, 255, 255, 0.2);
  pointer-events: none;
`;

const ColumnLegend = styled.div`
  --seat-size: 54px;
  --seat-gap: 0.36rem;
  display: grid;
  grid-template-columns: 36px var(--seat-size) var(--seat-size) 30px var(--seat-size) var(--seat-size);
  justify-content: center;
  align-items: center;
  margin-bottom: 0.4rem;
  gap: var(--seat-gap);
  padding: 0 2px;

  @media (max-width: 620px) {
    --seat-size: 48px;
    --seat-gap: 0.28rem;
  }
`;

const LegendSpacer = styled.span`
  display: block;
  width: 100%;
`;

const LegendSlot = styled.span`
  text-align: center;
  color: rgba(227, 236, 255, 0.78);
  font-size: 11px;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  letter-spacing: 0.08em;
`;

const AisleLabel = styled.span`
  text-align: center;
  color: rgba(182, 196, 235, 0.45);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const SeatGrid = styled.div`
  --seat-size: 54px;
  --seat-gap: 0.36rem;
  display: flex;
  flex-direction: column;
  gap: 0.42rem;

  @media (max-width: 620px) {
    --seat-size: 48px;
    --seat-gap: 0.28rem;
  }
`;

const SeatRow = styled.div`
  display: grid;
  grid-template-columns: 36px var(--seat-size) var(--seat-size) 30px var(--seat-size) var(--seat-size);
  justify-content: center;
  gap: var(--seat-gap);
  align-items: center;
`;

const RowLabel = styled.span`
  text-align: center;
  color: rgba(202, 213, 243, 0.72);
  font-size: 11px;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

const SeatButton = styled(motion.button)`
  height: 35px;
  border-radius: 10px;
  border: 1px solid ${({ $isSelected, $accent }) => ($isSelected ? ($accent || '#ffffff') : 'rgba(255, 255, 255, 0.24)')};
  background: ${({ $isSelected, $accent }) => ($isSelected ? ($accent || '#ffffff') : 'rgba(0, 0, 0, 0.78)')};
  color: ${({ $isSelected }) => ($isSelected ? '#000000' : 'rgba(228, 236, 255, 0.86)')};
  font-size: 12px;
  letter-spacing: 0.04em;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;

  &:hover {
    border-color: ${({ $isSelected, $accent }) => ($isSelected ? ($accent || '#ffffff') : '#ffffff')};
    color: ${({ $isSelected }) => ($isSelected ? '#000000' : '#ffffff')};
  }
`;

const AisleGap = styled.div`
  width: 30px;
`;

const SelectionPanel = styled(motion.div)`
  width: min(92vw, 560px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(6, 6, 6, 0.86);
  border-radius: 10px;
  padding: 0.82rem 0.92rem;
`;

const SelectionText = styled.p`
  margin: 0;
  font-size: 14px;
  color: rgba(236, 241, 255, 0.9);

  strong {
    font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
    color: #fff;
    margin-left: 0.25rem;
    letter-spacing: 0.04em;
  }
`;

const ConfirmButton = styled.button`
  border: 1px solid ${({ $accent }) => $accent || '#ffffff'};
  background: ${({ $accent }) => $accent || '#ffffff'};
  color: #000000;
  border-radius: 11px;
  padding: 0.58rem 0.9rem;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease, opacity 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.08);
  }

  &:disabled {
    opacity: 0.42;
    border-color: ${({ $accent }) => $accent || '#ffffff'};
    background: ${({ $accent }) => $accent || '#ffffff'};
    color: #000000;
    cursor: not-allowed;
    transform: none;
    filter: grayscale(0.1);
  }
`;

export default React.memo(SpaceshipSeating);
