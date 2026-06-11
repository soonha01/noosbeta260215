import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Shell = styled.div`
  position: relative;
  width: 100%;
  height: ${({ $standalone }) => ($standalone ? '100vh' : '100%')};
  min-height: ${({ $standalone }) => ($standalone ? '100vh' : '100%')};
  background: #000;
  color: #f4f6ff;
  overflow: hidden;
  opacity: ${({ $fadeOut }) => ($fadeOut ? 0 : 1)};
  filter: ${({ $fadeOut }) => ($fadeOut ? 'blur(8px)' : 'blur(0px)')};
  transform: ${({ $fadeOut }) => ($fadeOut ? 'scale(0.99)' : 'scale(1)')};
  transition:
    opacity ${({ $fadeDurationSec = 0.8 }) => `${$fadeDurationSec}s`} ease,
    filter ${({ $fadeDurationSec = 0.8 }) => `${$fadeDurationSec}s`} ease,
    transform ${({ $fadeDurationSec = 0.8 }) => `${$fadeDurationSec}s`} ease;
`;

export const StepFrame = styled(motion.div)`
  position: absolute;
  inset: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
`;
