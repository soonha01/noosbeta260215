import { css } from 'styled-components';

export const loginFlowStyles = css`
  .flow-card {
    --input-focus: #fff;
    color: white;
    padding: 26px;
    background: rgba(0, 0, 0, 0.9);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    max-width: 760px;
    width: 100%;
    font-family: 'Freesentation', 'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .flow-kicker {
    color: rgba(255, 255, 255, 0.65);
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 10px;
    font-weight: 700;
    font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  }

  .flow-title {
    margin: 0;
    font-size: 28px;
    line-height: 1.25;
    font-weight: 900;
    font-family: 'Freesentation Black', 'Cardinal Fruit', 'SF Pro Heavy', sans-serif;
    letter-spacing: -0.01em;
  }

  .flow-description {
    margin: 14px 0 0;
    color: rgba(255, 255, 255, 0.78);
    line-height: 1.6;
    font-size: 15px;
    font-family: 'Freesentation', 'SF Pro', sans-serif;
  }

  .flow-card-device {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02)),
      rgba(0, 0, 0, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 18px 34px rgba(0, 0, 0, 0.5);
    max-width: 780px;
  }

  .flow-card-device .flow-kicker {
    color: rgba(255, 255, 255, 0.58);
    letter-spacing: 0.14em;
  }

  .flow-card-device .flow-title {
    color: #fff;
    letter-spacing: -0.015em;
  }

  .flow-card-device .flow-description {
    color: rgba(255, 255, 255, 0.74);
  }

  .flow-card-device .binary-actions {
    margin-top: 24px;
    gap: 10px;
  }

  .flow-card-analysis {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02)),
      rgba(0, 0, 0, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.22);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.09),
      0 18px 34px rgba(0, 0, 0, 0.56);
    max-width: 780px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .flow-card-analysis .flow-kicker {
    color: rgba(255, 255, 255, 0.56);
    letter-spacing: 0.14em;
  }

  .flow-card-analysis .flow-title {
    letter-spacing: -0.015em;
  }

  .flow-card-analysis .flow-description {
    color: rgba(255, 255, 255, 0.72);
    max-width: 560px;
    margin-left: auto;
    margin-right: auto;
  }

  .flow-card-device-complete {
    min-height: 368px;
    justify-content: center;
  }

  .connection-complete-badge {
    margin-top: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 10px 16px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.06);
    border-radius: 999px;
    color: rgba(255, 255, 255, 0.92);
    font-family: 'Cardinal Fruit', 'Freesentation Bold', sans-serif;
    font-size: 12px;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  .connection-complete-dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #fff;
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.68);
    animation: connectionDotPulse 1.25s ease-in-out infinite;
  }

  .connection-complete-dot-connected {
    background: #7effc7;
    box-shadow: 0 0 14px rgba(126, 255, 199, 0.86);
  }

  .connection-complete-label {
    display: inline-block;
    transform: translateY(1px);
  }
`;
