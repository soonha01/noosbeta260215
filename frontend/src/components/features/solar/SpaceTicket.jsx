import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { getPlanetAccent } from '../../../lib/planetAccents';
const TICKET_TEAR_THRESHOLD = 132;
const TICKET_TEAR_EXIT_Y = 264;

const hexToRgb = (hex) => {
  const raw = String(hex || '')
    .trim()
    .replace('#', '');
  if (!raw) return null;
  const full = raw.length === 3 ? raw.split('').map((ch) => `${ch}${ch}`).join('') : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const int = parseInt(full, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

const rgbaFromHex = (hex, alpha, fallback = '255, 255, 255') => {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(${fallback}, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

const buildDepartureDate = () => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (Math.random() * 30 + 7) * 24 * 60 * 60 * 1000);
  const day = futureDate.getDate();
  const month = futureDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const year = futureDate.getFullYear();
  return `${day} ${month} ${year}`;
};

const buildCarriage = () => Math.floor(Math.random() * 10) + 1;

const SpaceTicket = ({ ticketData, onBack, onTicketTorn }) => {
  const destination = ticketData?.planet || 'Mars';
  const seatNumber = ticketData?.seat || '--';
  const [isTorn, setIsTorn] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const routingTimeoutRef = useRef(null);

  const ticketTheme = useMemo(() => {
    const accent = getPlanetAccent(destination);
    return {
      accent,
      borderStrong: rgbaFromHex(accent, 0.5),
      borderSoft: rgbaFromHex(accent, 0.3),
      glow: rgbaFromHex(accent, 0.35),
      glassHighlight: rgbaFromHex(accent, 0.22),
      glassMid: rgbaFromHex(accent, 0.12),
      glassLow: rgbaFromHex(accent, 0.04),
      panelBg: rgbaFromHex(accent, 0.2),
      panelDeep: rgbaFromHex(accent, 0.08),
      railBg: rgbaFromHex(accent, 0.22),
      railDeep: rgbaFromHex(accent, 0.1),
      infoBg: rgbaFromHex(accent, 0.18),
      infoBorder: rgbaFromHex(accent, 0.36),
      tearLine: rgbaFromHex(accent, 0.62),
      softText: rgbaFromHex(accent, 0.7, '205, 218, 252'),
    };
  }, [destination]);

  const departureDate = useMemo(() => buildDepartureDate(), []);
  const carriage = useMemo(() => buildCarriage(), []);
  const boardingCode = useMemo(
    () =>
      `${String(Math.floor(Math.random() * 900000) + 100000)}-${seatNumber}`.replace(/\s/g, ''),
    [seatNumber]
  );

  useEffect(() => {
    return () => {
      if (routingTimeoutRef.current) {
        clearTimeout(routingTimeoutRef.current);
        routingTimeoutRef.current = null;
      }
    };
  }, []);
  const railY = useMotionValue(0);
  const guideOpacity = useTransform(
    railY,
    [0, TICKET_TEAR_THRESHOLD * 0.72, TICKET_TEAR_THRESHOLD],
    [0.88, 0.42, 0.2]
  );
  const gripScale = useTransform(
    railY,
    [0, TICKET_TEAR_THRESHOLD * 0.7, TICKET_TEAR_THRESHOLD],
    [1, 1.04, 1.08]
  );
  const tearLineOpacity = useTransform(railY, [0, TICKET_TEAR_THRESHOLD], [0.24, 0.5]);

  const handleRailDragEnd = (_, info) => {
    if (info.offset.y >= TICKET_TEAR_THRESHOLD) {
      setIsTorn(true);
      animate(railY, TICKET_TEAR_EXIT_Y, {
        type: 'spring',
        stiffness: 220,
        damping: 24,
      });
      if (!isRouting && typeof onTicketTorn === 'function') {
        setIsRouting(true);
        routingTimeoutRef.current = window.setTimeout(() => {
          onTicketTorn({
            destination,
            seat: seatNumber,
            boardingCode,
          });
          routingTimeoutRef.current = null;
        }, 900);
      }
      return;
    }

    animate(railY, 0, {
      type: 'spring',
      stiffness: 280,
      damping: 30,
    });
  };

  return (
    <Screen>
      <BackButton type="button" onClick={onBack}>
        ← Back to Planets
      </BackButton>

      <TicketCard
        $theme={ticketTheme}
        $isTorn={isTorn}
        initial={{ opacity: 0, y: 18, scale: 0.985, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
      >
        <TicketMain $theme={ticketTheme}>
          <TopMeta>
            <Kicker style={{ color: ticketTheme.accent }}>Space Boarding Pass</Kicker>
            <RouteLine>
              <RouteFrom>Earth Station</RouteFrom>
              <RouteArrow>→</RouteArrow>
              <RouteTo>{destination}</RouteTo>
            </RouteLine>
          </TopMeta>

          <InfoGrid>
            <InfoItem $theme={ticketTheme}>
              <InfoLabel>Passenger</InfoLabel>
              <InfoValue>Space Traveler</InfoValue>
            </InfoItem>
            <InfoItem $theme={ticketTheme}>
              <InfoLabel>Date</InfoLabel>
              <InfoValue>{departureDate}</InfoValue>
            </InfoItem>
            <InfoItem $theme={ticketTheme}>
              <InfoLabel>Time</InfoLabel>
              <InfoValue>11:00 AM</InfoValue>
            </InfoItem>
            <InfoItem $theme={ticketTheme}>
              <InfoLabel>Car</InfoLabel>
              <InfoValue>{carriage}</InfoValue>
            </InfoItem>
            <InfoItem $theme={ticketTheme}>
              <InfoLabel>Seat</InfoLabel>
              <InfoValue>{seatNumber}</InfoValue>
            </InfoItem>
            <InfoItem $theme={ticketTheme}>
              <InfoLabel>Status</InfoLabel>
              <InfoValue>Boarding Ready</InfoValue>
            </InfoItem>
          </InfoGrid>

          <FinePrint>
            탑승은 출발 30분 전부터 시작됩니다. 본 탑승권은 디지털 확인용이며 환불 불가입니다.
          </FinePrint>

          <TearGuideRow>
            <TearGuide style={{ opacity: guideOpacity }}>
              절취선을 위에서 아래로 드래그해 탑승권을 분리하세요
            </TearGuide>
            <AnimatePresence mode="wait">
              {isTorn ? (
                <TornState
                  key="torn"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                >
                  <span>{isRouting ? '탑승 절차를 진행합니다...' : '절취 완료'}</span>
                </TornState>
              ) : (
                <TearHint
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  drag ticket stub ↓
                </TearHint>
              )}
            </AnimatePresence>
          </TearGuideRow>
        </TicketMain>

        <TicketRail
          $theme={ticketTheme}
          $isTorn={isTorn}
          style={{ borderColor: `${ticketTheme.accent}66`, y: railY }}
          drag={!isTorn ? 'y' : false}
          dragConstraints={{ top: 0, bottom: TICKET_TEAR_EXIT_Y }}
          dragElastic={0.18}
          dragMomentum={false}
          onDragEnd={handleRailDragEnd}
        >
          <PerforationLine style={{ opacity: tearLineOpacity }} $theme={ticketTheme} />
          <RailGrip
            $theme={ticketTheme}
            style={{ scale: gripScale }}
            title={isTorn ? 'ticket stub detached' : 'drag to tear'}
            aria-hidden="true"
          >
            ⠿
          </RailGrip>
          <RailHeader style={{ color: ticketTheme.accent }}>Gate 9¾</RailHeader>
          <RailDestination>{destination}</RailDestination>
          <RailSeat>Seat {seatNumber}</RailSeat>
          <BarcodeWrap aria-label="barcode" $theme={ticketTheme}>
            <Barcode />
          </BarcodeWrap>
          <Code $theme={ticketTheme}>{boardingCode}</Code>
        </TicketRail>
      </TicketCard>
    </Screen>
  );
};

const Screen = styled.div`
  min-height: 100%;
  position: relative;
  padding: 2.2rem 1.2rem 1.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Freesentation', 'SF Pro', sans-serif;
  color: #eff3ff;
  background: #000;
  overflow: hidden;
`;

const BackButton = styled.button`
  position: absolute;
  top: 1.4rem;
  left: 1.4rem;
  border: 1px solid rgba(255, 255, 255, 0.34);
  background: rgba(0, 0, 0, 0.82);
  color: rgba(241, 245, 255, 0.92);
  border-radius: 0;
  padding: 0.46rem 0.95rem;
  font-size: 12px;
  letter-spacing: 0.02em;
  font-family: 'Freesentation', 'Cardinal Fruit', sans-serif;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: rgba(16, 16, 16, 0.94);
    border-color: rgba(255, 255, 255, 0.6);
  }
`;

const TicketCard = styled(motion.div)`
  width: min(94vw, 860px);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 170px;
  background: transparent;
  overflow: visible;
  box-shadow: 0 28px 46px rgba(0, 0, 0, 0.58);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TicketMain = styled.div`
  padding: 1.2rem 1.2rem 1rem;
  border: 1px solid ${({ $theme }) => $theme.borderStrong};
  border-right: none;
  border-radius: 10px 0 0 10px;
  background: rgba(4, 4, 4, 0.88);

  @media (max-width: 768px) {
    border-right: 1px solid ${({ $theme }) => $theme.borderStrong};
    border-radius: 10px 10px 0 0;
  }
`;

const TopMeta = styled.div`
  padding-bottom: 0.9rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
`;

const Kicker = styled.div`
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

const RouteLine = styled.div`
  margin-top: 0.55rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
  font-family: 'Freesentation Black', 'SF Pro', sans-serif;
`;

const RouteFrom = styled.span`
  font-size: clamp(20px, 3vw, 30px);
`;

const RouteArrow = styled.span`
  font-size: clamp(18px, 2.4vw, 26px);
  color: rgba(220, 229, 255, 0.72);
`;

const RouteTo = styled.span`
  font-size: clamp(20px, 3vw, 30px);
`;

const InfoGrid = styled.div`
  margin-top: 0.95rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.68rem;

  @media (max-width: 680px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const InfoItem = styled.div`
  border: 1px solid ${({ $theme }) => $theme.infoBorder};
  border-radius: 8px;
  background: rgba(10, 10, 10, 0.88);
  padding: 0.65rem 0.72rem;
  min-height: 68px;
`;

const InfoLabel = styled.div`
  color: rgba(203, 215, 250, 0.64);
  font-size: 10px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

const InfoValue = styled.div`
  margin-top: 0.38rem;
  color: rgba(250, 252, 255, 0.96);
  font-size: 16px;
  line-height: 1.15;
  font-family: 'Freesentation Bold', 'SF Pro Bold', sans-serif;
`;

const FinePrint = styled.p`
  margin: 0.9rem 0 0;
  color: rgba(199, 212, 245, 0.62);
  font-size: 11px;
  line-height: 1.45;
`;

const TearGuideRow = styled.div`
  margin-top: 0.72rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
`;

const TearGuide = styled(motion.p)`
  margin: 0;
  font-size: 11px;
  color: rgba(201, 214, 248, 0.72);
  letter-spacing: 0.02em;
`;

const TearHint = styled(motion.span)`
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(205, 218, 252, 0.58);
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

const TornState = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(224, 236, 255, 0.85);
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

const TicketRail = styled(motion.aside)`
  position: relative;
  border: 1px solid ${({ $theme }) => $theme.borderStrong};
  border-left: none;
  padding: 1rem 0.9rem;
  background: rgba(6, 6, 6, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  border-radius: 0 10px 10px 0;
  touch-action: pan-x;
  user-select: none;
  cursor: ${({ $isTorn }) => ($isTorn ? 'default' : 'grab')};

  @media (max-width: 768px) {
    border-left: 1px solid ${({ $theme }) => $theme.borderStrong};
    border-top: 1px dashed ${({ $theme }) => $theme.tearLine};
    padding: 0.95rem 1.2rem 1rem;
    border-radius: 0 0 10px 10px;
  }
`;

const RailGrip = styled(motion.div)`
  position: absolute;
  left: -9px;
  top: 10px;
  width: 18px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid ${({ $theme }) => $theme.borderSoft};
  background: rgba(12, 12, 12, 0.92);
  color: rgba(232, 240, 255, 0.86);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  line-height: 1;
  pointer-events: none;
`;

const PerforationLine = styled(motion.div)`
  position: absolute;
  left: -1px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  pointer-events: none;
  border-left: 2px dashed ${({ $theme }) => $theme.tearLine};
`;

const RailHeader = styled.div`
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

const RailDestination = styled.div`
  color: #ffffff;
  font-size: 22px;
  line-height: 1;
  font-family: 'Freesentation Black', 'SF Pro', sans-serif;
`;

const RailSeat = styled.div`
  color: rgba(221, 231, 255, 0.85);
  font-size: 13px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

const BarcodeWrap = styled.div`
  width: 100%;
  margin-top: 0.2rem;
  padding: 0.45rem 0.35rem;
  border-radius: 6px;
  border: 1px solid ${({ $theme }) => $theme.infoBorder};
  background: rgba(10, 10, 10, 0.9);
`;

const Barcode = styled.div`
  width: 100%;
  height: 72px;
  border-radius: 7px;
  background-color: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='72' viewBox='0 0 120 72'%3E%3Crect width='120' height='72' fill='white'/%3E%3Cg fill='black'%3E%3Crect x='2' y='0' width='2' height='72'/%3E%3Crect x='7' y='0' width='1' height='72'/%3E%3Crect x='11' y='0' width='3' height='72'/%3E%3Crect x='18' y='0' width='2' height='72'/%3E%3Crect x='23' y='0' width='1' height='72'/%3E%3Crect x='27' y='0' width='4' height='72'/%3E%3Crect x='35' y='0' width='2' height='72'/%3E%3Crect x='40' y='0' width='1' height='72'/%3E%3Crect x='45' y='0' width='3' height='72'/%3E%3Crect x='51' y='0' width='2' height='72'/%3E%3Crect x='56' y='0' width='1' height='72'/%3E%3Crect x='61' y='0' width='4' height='72'/%3E%3Crect x='69' y='0' width='2' height='72'/%3E%3Crect x='74' y='0' width='1' height='72'/%3E%3Crect x='79' y='0' width='3' height='72'/%3E%3Crect x='85' y='0' width='2' height='72'/%3E%3Crect x='90' y='0' width='1' height='72'/%3E%3Crect x='95' y='0' width='4' height='72'/%3E%3Crect x='103' y='0' width='2' height='72'/%3E%3Crect x='108' y='0' width='1' height='72'/%3E%3Crect x='112' y='0' width='3' height='72'/%3E%3C/g%3E%3C/svg%3E");
  background-repeat: repeat-x;
  background-size: auto 100%;
`;

const Code = styled.div`
  color: ${({ $theme }) => $theme.softText};
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

export default React.memo(SpaceTicket);
