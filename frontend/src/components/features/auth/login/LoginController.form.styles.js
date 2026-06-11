import { css } from 'styled-components';

export const loginFormStyles = css`
  .form {
    width: 100%;
    min-height: min(780px, calc(100dvh - 112px));
    padding: clamp(38px, 3.4vw, 62px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: clamp(15px, 1.2vw, 21px);
    border-radius: 0;
    border: 1px solid rgba(168, 168, 168, 0.45);
    background: rgba(6, 6, 6, 0.9);
    backdrop-filter: blur(14px);
    box-shadow: 0 16px 42px rgba(0, 0, 0, 0.52);
    position: relative;
    font-family: 'Freesentation', 'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .auth-kicker {
    margin: 0;
    color: rgba(255, 255, 255, 0.66);
    font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .auth-title {
    margin: 2px 0 0;
    color: #fff;
    font-family: 'Cardinal Fruit', 'Freesentation Black', sans-serif;
    font-size: clamp(30px, 3.3vw, 42px);
    letter-spacing: -0.02em;
    line-height: 1.04;
    font-weight: 500;
  }

  .auth-title-logo {
    display: flex;
    align-items: center;
    margin-top: 8px;
  }

  .auth-title-logo__mark {
    width: min(70vw, 260px);
    height: auto;
    color: #ffffff;
  }

  .auth-subtitle {
    margin: 4px 0 0;
    color: rgba(255, 255, 255, 0.74);
    font-size: 14px;
    line-height: 1.55;
    max-width: 46ch;
  }

  .auth-fields {
    margin-top: 4px;
    display: grid;
    gap: 10px;
  }

  .auth-label {
    color: rgba(255, 255, 255, 0.58);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  }

  .input.auth-input {
    width: 100%;
    height: 46px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.22);
    background: rgba(255, 255, 255, 0.05);
    font-size: 15px;
    font-weight: 500;
    color: #fff;
    padding: 0 14px;
    outline: none;
    transition: all 0.2s ease;
  }

  .input.auth-input::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  .input.auth-input:focus {
    border-color: rgba(255, 255, 255, 0.72);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.08);
  }

  .auth-actions {
    margin-top: 8px;
    display: flex;
    gap: 10px;
  }

  .social-login {
    margin-top: 8px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .social-button {
    height: 42px;
    border-radius: 0;
    border: 1px solid rgba(255, 255, 255, 0.26);
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease, color 0.2s ease;
  }

  .social-button:hover {
    border-color: rgba(255, 255, 255, 0.55);
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    transform: translateY(-1px);
  }

  .social-button:active {
    transform: scale(0.98);
  }

  .social-button svg {
    width: 16px;
    height: 16px;
  }

  .button-confirm.auth-submit {
    flex: 1;
    height: 46px;
    border-radius: 10px;
    border: 1px solid #fff;
    background: #fff;
    color: #000;
    font-family: 'Cardinal Fruit', 'Freesentation Bold', sans-serif;
    font-size: 13px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .button-confirm.auth-submit:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-1px);
  }

  .button-ghost.auth-skip {
    min-width: 162px;
    height: 46px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.22);
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.9);
    font-family: 'Cardinal Fruit', 'Freesentation Bold', sans-serif;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s ease;
  }

  .button-ghost.auth-skip:hover {
    border-color: rgba(255, 255, 255, 0.46);
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  .button-confirm:active {
    transform: scale(0.98);
  }

  .test-mode-note {
    margin: 2px 0 0;
    color: rgba(255, 255, 255, 0.56);
    font-size: 12px;
    line-height: 1.55;
    text-align: left;
    font-family: 'Freesentation', 'SF Pro', sans-serif;
  }

  .signup-link {
    margin: 2px 0 0;
    color: rgba(255, 255, 255, 0.68);
    font-size: 13px;
    line-height: 1.5;
    text-align: center;
    font-family: 'Freesentation', 'SF Pro', sans-serif;
  }

  .signup-text {
    padding: 0;
    margin: 0;
    border: 0;
    background: transparent;
    color: #fff;
    font-family: 'Cardinal Fruit', 'Freesentation Bold', sans-serif;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .signup-text:hover {
    color: rgba(255, 255, 255, 0.86);
  }
`;
