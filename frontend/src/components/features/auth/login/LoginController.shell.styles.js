import styled from 'styled-components';

export const DeviceFloatingActions = styled.div`
  position: fixed;
  right: calc(12px + env(safe-area-inset-right, 0px));
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  z-index: 15000;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const DeviceFloatingButton = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(8, 8, 8, 0.92);
  color: rgba(255, 255, 255, 0.92);
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: none;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, color 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(255, 255, 255, 0.62);
    background: rgba(18, 18, 18, 0.96);
    color: #ffffff;
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.78);
    outline-offset: 4px;
  }

  @media (max-width: 640px) {
    width: 52px;
    height: 52px;
  }
`;

export const LoginContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 100dvh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(32px, 4vw, 72px);
  overflow-y: auto;
  z-index: 10;
`;

export const BackButtonWrapper = styled.div`
  position: absolute;
  top: 2rem;
  left: 2rem;
  z-index: 10;
`;

export const StepperWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 600px;
  height: auto;
  max-height: 80vh;
  z-index: 1000;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;

  h2 {
    color: white;
  }

  p {
    color: rgba(255, 255, 255, 0.8);
  }

  input {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;

    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    &:focus {
      border-color: rgba(255, 255, 255, 0.78);
      background: rgba(255, 255, 255, 0.16);
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.09);
    }
  }
`;
