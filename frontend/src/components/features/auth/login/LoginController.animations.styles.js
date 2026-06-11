import { css } from 'styled-components';

export const loginStyleAnimations = css`
  @keyframes connectionDotPulse {
    0%, 100% {
      transform: scale(0.9);
      opacity: 0.62;
    }
    50% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes analysisRingPulse {
    0%, 100% {
      opacity: 0.32;
      transform: translate(-50%, -50%) scale(0.94);
    }
    50% {
      opacity: 0.76;
      transform: translate(-50%, -50%) scale(1.03);
    }
  }

  @keyframes analysisCorePulse {
    0%, 100% {
      transform: scale(0.82);
      opacity: 0.7;
    }
    50% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes analysisTrackScan {
    from {
      transform: translateX(-130%);
    }
    to {
      transform: translateX(260%);
    }
  }
`;
