import { css } from 'styled-components';

export const loginOptionStyles = css`
  .binary-actions {
    display: flex;
    gap: 12px;
    margin-top: 28px;
  }

  .option-button {
    flex: 1;
    min-height: 52px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 15px;
    font-weight: 700;
    border: 1px solid rgba(255, 255, 255, 0.28);
    color: white;
    background: rgba(255, 255, 255, 0.06);
    transition: all 0.2s ease;
    font-family: 'Cardinal Fruit', 'Freesentation Bold', 'SF Pro Bold', sans-serif;
    letter-spacing: 0.01em;
  }

  .option-button:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.55);
  }

  .option-yes {
    border-color: rgba(82, 39, 255, 0.75);
    background: rgba(82, 39, 255, 0.2);
  }

  .option-no {
    border-color: rgba(255, 255, 255, 0.35);
  }

  .flow-card-device .option-button {
    border-radius: 12px;
    min-height: 54px;
    border: 1px solid rgba(255, 255, 255, 0.24);
    background: rgba(255, 255, 255, 0.02);
    color: rgba(255, 255, 255, 0.92);
    font-family: 'Cardinal Fruit', 'Freesentation Bold', sans-serif;
    font-weight: 500;
  }

  .flow-card-device .option-button:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.09);
    border-color: rgba(255, 255, 255, 0.6);
  }

  .flow-card-device .option-yes {
    border-color: rgba(255, 255, 255, 0.95);
    background: #fff;
    color: #000;
  }

  .flow-card-device .option-yes:hover {
    background: rgba(255, 255, 255, 0.92);
    border-color: rgba(255, 255, 255, 0.95);
  }

  .flow-card-device .option-blue {
    border-color: rgba(74, 144, 255, 0.85);
    background: linear-gradient(135deg, rgba(52, 128, 255, 0.92), rgba(24, 83, 214, 0.76));
    color: #fff;
    box-shadow: 0 10px 24px rgba(32, 105, 235, 0.22);
  }

  .flow-card-device .option-blue:hover {
    background: linear-gradient(135deg, rgba(78, 156, 255, 0.98), rgba(36, 101, 232, 0.84));
    border-color: rgba(125, 180, 255, 0.95);
  }

  .flow-card-device .option-no {
    border-color: rgba(255, 255, 255, 0.34);
    background: rgba(255, 255, 255, 0.02);
    color: rgba(255, 255, 255, 0.86);
  }
`;
