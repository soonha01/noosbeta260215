import { Apple, Chrome, Github } from 'lucide-react';
import NoosLogo from '../../../../brand/NoosLogo';

export const LoginFormStage = ({
  email,
  password,
  isLocalTestMode,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onGoogleLogin,
  onGithubLogin,
  onSkipLoginForTesting,
  onSignUpClick,
}) => (
  <form className="form" onSubmit={onSubmit}>
    <p className="auth-kicker">Login</p>
    <h1 className="auth-title auth-title-logo">
      <NoosLogo className="auth-title-logo__mark" />
    </h1>
    <p className="auth-subtitle">
      계정으로 로그인하여 개인 맞춤 몰입 환경을 시작하세요.
    </p>

    <div className="auth-fields">
      <label className="auth-label" htmlFor="login-email">Email</label>
      <input
        id="login-email"
        className="input auth-input"
        type="email"
        name="email"
        placeholder="you@example.com"
        required
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
      />

      <label className="auth-label" htmlFor="login-password">Password</label>
      <input
        id="login-password"
        className="input auth-input"
        type="password"
        name="password"
        placeholder="••••••••"
        required
        value={password}
        onChange={(event) => onPasswordChange(event.target.value)}
      />
    </div>

    <div className="social-login">
      <button
        type="button"
        className="social-button"
        aria-label="Login with Google"
        onClick={onGoogleLogin}
      >
        <Chrome aria-hidden="true" size={16} strokeWidth={1.8} />
      </button>

      <button
        type="button"
        className="social-button"
        aria-label="Login with GitHub"
        onClick={onGithubLogin}
      >
        <Github aria-hidden="true" size={16} strokeWidth={1.8} />
      </button>

      <button type="button" className="social-button" aria-label="Login with Apple">
        <Apple aria-hidden="true" size={16} strokeWidth={1.8} />
      </button>
    </div>

    <div className="auth-actions">
      <button type="submit" className="button-confirm auth-submit">
        Let&apos;s go!
      </button>
      {isLocalTestMode && (
        <button
          type="button"
          className="button-ghost auth-skip"
          onClick={onSkipLoginForTesting}
        >
          테스트로 건너뛰기
        </button>
      )}
    </div>

    {isLocalTestMode && (
      <p className="test-mode-note">
        Local test mode: 백엔드 로그인 없이 기기 선택 단계로 바로 이동합니다.
      </p>
    )}

    <p className="signup-link">
      Don&apos;t have an account?{' '}
      <button type="button" className="signup-text" onClick={onSignUpClick}>
        Sign Up
      </button>
    </p>
  </form>
);
