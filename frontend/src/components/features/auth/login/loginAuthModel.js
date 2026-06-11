export const AUTH_ROUTES = Object.freeze({
  admin: '/admin',
  board: '/board',
  livechat: '/livechat',
});

export const AUTH_STAGES = Object.freeze({
  login: 'login',
  deviceQuestion: 'device-question',
});

export const LOGIN_ALERT_MESSAGES = Object.freeze({
  invalidCredentials: '아이디 또는 비밀번호가 올바르지 않습니다.',
  serverError: '로그인 요청 중 서버 에러가 발생했습니다.',
  networkError: '서버와 연결할 수 없습니다.',
});

export const getInitialAuthStage = (search = '') => {
  const params = new URLSearchParams(search);
  return params.get('login') === 'success' ? AUTH_STAGES.deviceQuestion : AUTH_STAGES.login;
};

export const isLocalAuthTestHost = (hostname = '') => ['localhost', '127.0.0.1'].includes(hostname);

export const createLoginPayload = ({ email, password }) => ({
  loginId: email,
  password,
});

export const createSignupPayload = ({ email, password, name }) => ({
  loginId: email,
  password,
  displayName: name,
});

export const resolveAuthSession = (session) => {
  if (!session?.authenticated) {
    return { action: 'none' };
  }

  if (session.role === 'ADMIN') {
    return { action: 'redirect', route: AUTH_ROUTES.admin };
  }

  return { action: 'stage', stage: AUTH_STAGES.deviceQuestion };
};

export const getOAuthAuthorizationPath = (provider) => `/oauth2/authorization/${provider}`;

export const buildOAuthAuthorizationUrl = (backendUrl, provider) =>
  backendUrl(getOAuthAuthorizationPath(provider));

export const resolveLoginResponse = ({ ok, status, body }) => {
  if (ok && body?.authenticated) {
    return { action: 'authenticated', session: body };
  }

  if (ok || status === 401) {
    return {
      action: 'invalid-credentials',
      alertMessage: LOGIN_ALERT_MESSAGES.invalidCredentials,
    };
  }

  return {
    action: 'server-error',
    alertMessage: LOGIN_ALERT_MESSAGES.serverError,
  };
};

export const resolveLoginNetworkError = (error) => ({
  action: 'network-error',
  alertMessage: LOGIN_ALERT_MESSAGES.networkError,
  error,
});

export const redirectToRoute = (route, location = window.location) => {
  location.assign(route);
};

export const redirectToOAuthProvider = (backendUrl, provider, location = window.location) => {
  location.href = buildOAuthAuthorizationUrl(backendUrl, provider);
};
