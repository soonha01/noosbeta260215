import styled from 'styled-components';
import { motion } from 'framer-motion';

export const ModalLayer = styled(motion.div)`
  position: absolute;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.68);
  display: grid;
  place-items: center;
  padding: 1rem;
`;

export const ModalCard = styled(motion.div)`
  width: min(92vw, 460px);
  border-radius: 0;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}4d`};
  background:
    radial-gradient(circle at 18% 16%, ${({ $accent }) => `${$accent || '#ffffff'}10`}, transparent 36%),
    linear-gradient(165deg, rgba(10, 10, 10, 0.97), rgba(4, 4, 4, 0.94));
  color: #f5f7ff;
  padding: 1rem;
  display: grid;
  gap: 0.8rem;
  position: relative;
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.42);
`;

export const ModalTitle = styled.h3`
  margin: 0;
  color: ${({ $accent }) => $accent || '#fff'};
  font-size: 24px;
  line-height: 1.1;
  letter-spacing: -0.04em;
  font-family: 'Freesentation Black', 'Cardinal Fruit', sans-serif;
`;

export const ModalBody = styled.p`
  margin: 0;
  color: rgba(226, 236, 255, 0.82);
  font-size: 14px;
  line-height: 1.6;
`;

export const ModalButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
`;

export const ModalPrimaryButton = styled.button`
  flex: 1;
  min-width: 170px;
  height: 40px;
  border: 1px solid ${({ $accent }) => $accent || '#fff'};
  border-radius: 0;
  background: ${({ $accent }) => $accent || '#fff'};
  color: #000;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  cursor: pointer;
  transition: filter 0.2s ease, transform 0.2s ease;

  &:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const ModalGhostButton = styled.button`
  flex: 1;
  min-width: 140px;
  height: 40px;
  border: 1px solid ${({ $accent }) => `${$accent || '#ffffff'}88`};
  border-radius: 0;
  background: ${({ $accent }) => `${$accent || '#ffffff'}12`};
  color: ${({ $accent }) => $accent || '#fff'};
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: ${({ $accent }) => $accent || '#fff'};
    background: ${({ $accent }) => `${$accent || '#ffffff'}20`};
    transform: translateY(-1px);
  }
`;

export const CloseModalButton = styled.button`
  position: absolute;
  top: 0.62rem;
  right: 0.62rem;
  width: 28px;
  height: 28px;
  border: 1px solid ${({ $accent }) => ($accent ? `${$accent}66` : 'rgba(255, 255, 255, 0.25)')};
  border-radius: 0;
  background: ${({ $accent }) => ($accent ? `${$accent}14` : 'rgba(14, 14, 14, 0.84)')};
  color: ${({ $accent }) => ($accent ? $accent : '#fff')};
  display: grid;
  place-items: center;
  cursor: pointer;
`;

export const Loader = styled.div`
  margin: 20px auto 0;
  width: 102px;
  height: 102px;
  position: relative;
  border-radius: 999px;
  justify-self: center;
  align-self: center;
  border: 1px solid ${({ $accent }) => ($accent ? `${$accent}40` : 'rgba(255, 255, 255, 0.2)')};
  background:
    radial-gradient(circle at 50% 44%, ${({ $accent }) => ($accent ? `${$accent}24` : 'rgba(255, 255, 255, 0.12)')}, rgba(255, 255, 255, 0.01) 62%),
    rgba(0, 0, 0, 0.58);
  display: grid;
  place-items: center;
  overflow: hidden;

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 999px;
    border: 1px solid ${({ $accent }) => ($accent ? `${$accent}66` : 'rgba(255, 255, 255, 0.26)')};
    animation: aiObjetRingPulse 1.8s ease-in-out infinite;
  }

  &::before {
    width: 54px;
    height: 54px;
  }

  &::after {
    width: 80px;
    height: 80px;
    animation-delay: 0.28s;
    opacity: 0.62;
  }

  .loader-core {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    background: ${({ $accent }) => $accent || '#fff'};
    box-shadow: 0 0 18px ${({ $accent }) => ($accent ? `${$accent}8f` : 'rgba(255, 255, 255, 0.56)')};
    animation: aiObjetCorePulse 1.2s ease-in-out infinite;
  }

  @keyframes aiObjetRingPulse {
    0% {
      transform: translate(-50%, -50%) scale(0.92);
      opacity: 0.35;
    }
    60% {
      opacity: 0.92;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.1);
      opacity: 0.28;
    }
  }

  @keyframes aiObjetCorePulse {
    0%,
    100% {
      transform: scale(0.9);
      opacity: 0.72;
    }
    50% {
      transform: scale(1.12);
      opacity: 1;
    }
  }
`;

export const RatingRow = styled.div`
  display: inline-flex;
  gap: 0.45rem;
`;

export const RatingButton = styled.button`
  width: 36px;
  height: 36px;
  border: 1px solid
    ${({ $active, $accent }) =>
      $active ? ($accent || 'rgba(255, 255, 255, 0.65)') : ($accent ? `${$accent}70` : 'rgba(255, 255, 255, 0.3)')};
  border-radius: 0;
  background: ${({ $active, $accent }) => ($active ? ($accent || '#fff') : ($accent ? `${$accent}14` : 'rgba(16, 16, 16, 0.92)'))};
  color: ${({ $active }) => ($active ? '#000' : '#fff')};
  font-size: 13px;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  cursor: pointer;
`;
