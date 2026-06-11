import { css } from 'styled-components';

export const loginResponsiveStyles = css`
  @media (max-width: 640px) {
    width: min(94vw, 520px);
    max-width: 94vw;

    .form,
    .flow-card {
      padding: 18px;
      max-width: 94vw;
    }

    .flow-title {
      font-size: 24px;
    }

    .analysis-loader-shell {
      width: 88px;
      height: 88px;
      margin-top: 22px;
    }

    .analysis-loading-track {
      width: 100%;
      margin-top: 18px;
    }

    .analysis-loading-meta {
      gap: 10px;
      font-size: 10px;
    }

    .binary-actions {
      flex-direction: column;
    }

    .option-button {
      width: 100%;
    }

    .auth-actions {
      flex-direction: column;
    }

    .social-login {
      grid-template-columns: 1fr;
    }

    .button-confirm.auth-submit {
      width: 100%;
    }
  }
`;
