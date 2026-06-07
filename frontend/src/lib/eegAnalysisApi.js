import { API_BASE_URL, EEG_ANALYSIS_ENDPOINT } from './env';

const EEG_SESSION_START_ENDPOINT = '/api/eeg/sessions/start';

const roundTo = (value, digits = 6) => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const parseResponseBody = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
};

export const createEegAnalysisPayload = ({
  eegSessionId = null,
  analysis,
  measuredAt,
  measurementDurationSec,
  analysisWindowSec = null,
  analysisMode = null,
  sampleRateHz = 256,
  deviceType = 'Muse S Athena',
  sampleCountOverride = null,
  surveyContext = null,
}) => {
  if (!analysis) {
    return null;
  }

  const bandPercentByKey = Object.fromEntries(
    (analysis.bandPowers || []).map((band) => [band.key, roundTo(band.percent, 2)])
  );

  return {
    eegSessionId,
    deviceType,
    measuredAt,
    measurementDurationSec,
    analysisWindowSec,
    analysisMode,
    sampleRateHz,
    sampleCount: sampleCountOverride ?? analysis.sampleCount ?? 0,
    dominantBand: analysis.dominantBand ?? null,
    delta: bandPercentByKey.delta ?? 0,
    theta: bandPercentByKey.theta ?? 0,
    alpha: bandPercentByKey.alpha ?? 0,
    beta: bandPercentByKey.beta ?? 0,
    gamma: bandPercentByKey.gamma ?? 0,
    surveyContext,
  };
};

export const startEegSession = async (
  { deviceType = 'Muse S Athena', measuredAt },
  { signal } = {}
) => {
  const response = await fetch(`${API_BASE_URL}${EEG_SESSION_START_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      deviceType,
      measuredAt,
    }),
    signal,
  });

  const responseBody = await parseResponseBody(response);
  if (!response.ok) {
    const message =
      typeof responseBody === 'string'
        ? responseBody
        : responseBody?.message || `EEG session start failed with status ${response.status}`;

    throw new Error(message);
  }

  return responseBody;
};

export const submitEegAnalysis = async (payload, { signal } = {}) => {
  const response = await fetch(`${API_BASE_URL}${EEG_ANALYSIS_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
    signal,
  });

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    const message =
      typeof responseBody === 'string'
        ? responseBody
        : responseBody?.message || `EEG analysis request failed with status ${response.status}`;

    throw new Error(message);
  }

  return responseBody;
};
