import { css } from 'styled-components';

export const loginAnalysisStyles = css`
  .analysis-loader-shell {
    margin: 28px auto 0;
    width: 102px;
    height: 102px;
    position: relative;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background:
      radial-gradient(circle at 50% 44%, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.01) 62%),
      rgba(0, 0, 0, 0.58);
    display: grid;
    place-items: center;
    overflow: hidden;
  }

  .analysis-loader-ring {
    position: absolute;
    left: 50%;
    top: 50%;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.26);
    animation: analysisRingPulse 1.8s ease-in-out infinite;
  }

  .analysis-loader-ring-1 {
    width: 54px;
    height: 54px;
  }

  .analysis-loader-ring-2 {
    width: 80px;
    height: 80px;
    animation-delay: 0.28s;
    opacity: 0.6;
  }

  .analysis-loader-core {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    background: #fff;
    box-shadow: 0 0 18px rgba(255, 255, 255, 0.56);
    animation: analysisCorePulse 1.2s ease-in-out infinite;
  }

  .analysis-loading-track {
    margin: 22px auto 0;
    width: min(100%, 520px);
    height: 6px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    overflow: hidden;
    position: relative;
  }

  .analysis-loading-track-fill {
    width: 34%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    border-radius: inherit;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0), #fff 38%, rgba(255, 255, 255, 0));
    animation: analysisTrackScan 1.55s linear infinite;
  }

  .analysis-loading-meta {
    margin: 16px auto 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    font-size: 11px;
    line-height: 1.3;
    color: rgba(255, 255, 255, 0.58);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-family: 'Cardinal Fruit', 'Freesentation Bold', sans-serif;
  }
`;
