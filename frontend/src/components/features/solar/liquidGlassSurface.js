import { css } from 'styled-components';

export const liquidGlassSurface = css`
  border: 1px solid rgba(255, 255, 255, 0.22);
  background:
    linear-gradient(
      150deg,
      rgba(255, 255, 255, 0.2) 0%,
      rgba(255, 255, 255, 0.09) 32%,
      rgba(255, 255, 255, 0.03) 66%,
      rgba(255, 255, 255, 0.02) 100%
    ),
    rgba(12, 15, 27, 0.52);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.34),
    inset 0 -1px 0 rgba(255, 255, 255, 0.08),
    0 24px 44px rgba(0, 0, 0, 0.48);
  backdrop-filter: blur(22px) saturate(150%);
  -webkit-backdrop-filter: blur(22px) saturate(150%);
`;
