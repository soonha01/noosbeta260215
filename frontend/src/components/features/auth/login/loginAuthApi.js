import {
  resolveLoginNetworkError,
  resolveLoginResponse,
} from './loginAuthModel';

const JSON_HEADERS = Object.freeze({
  'Content-Type': 'application/json',
});

export const fetchCurrentAuthSession = async (backendUrl, fetchImpl = fetch) => {
  const response = await fetchImpl(backendUrl('/api/auth/me'), {
    credentials: 'include',
  });

  return response.ok ? response.json() : null;
};

export const submitSignup = async (backendUrl, payload, fetchImpl = fetch) =>
  fetchImpl(backendUrl('/api/auth/signup'), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

export const submitLogin = async (backendUrl, payload, fetchImpl = fetch) => {
  try {
    const response = await fetchImpl(backendUrl('/api/auth/login'), {
      method: 'POST',
      credentials: 'include',
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    });
    const body = response.ok ? await response.json() : null;

    return resolveLoginResponse({
      ok: response.ok,
      status: response.status,
      body,
    });
  } catch (error) {
    return resolveLoginNetworkError(error);
  }
};
