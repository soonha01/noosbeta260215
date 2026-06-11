import { keyframes } from 'styled-components';

export const scan = keyframes`
  from {
    transform: translateX(-18%);
  }
  to {
    transform: translateX(118%);
  }
`;

export const floatIn = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0, 18px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

export const KOREAN_FONT = "'Pretendard Variable', 'Pretendard', 'Freesentation', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
export const UI_FONT = KOREAN_FONT;
export const LABEL_FONT = "'Poppins', 'Pretendard Variable', 'Pretendard', 'Freesentation', sans-serif";
export const DISPLAY_FONT = "'Instrument Serif', 'GowunBatang', 'Pretendard Variable', serif";
