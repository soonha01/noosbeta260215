const DEFAULT_API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080').replace(
  /\/$/,
  ''
);

const DEFAULT_EEG_ANALYSIS_ENDPOINT =
  process.env.REACT_APP_EEG_ANALYSIS_ENDPOINT || '/api/eeg/results';

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
  analysis,
  measuredAt,
  measurementDurationSec,
  deviceType = 'Muse S Athena',
}) => {
  if (!analysis) {
    return null;
  }

  const bandPercentByKey = Object.fromEntries(
    (analysis.bandPowers || []).map((band) => [band.key, roundTo(band.percent, 2)])
  );

  return {
    deviceType,
    measuredAt,
    measurementDurationSec,
    sampleCount: analysis.sampleCount ?? 0,
    dominantBand: analysis.dominantBand ?? null,
    delta: bandPercentByKey.delta ?? 0,
    theta: bandPercentByKey.theta ?? 0,
    alpha: bandPercentByKey.alpha ?? 0,
    beta: bandPercentByKey.beta ?? 0,
    gamma: bandPercentByKey.gamma ?? 0,
  };
};

export const submitEegAnalysis = async (payload, { signal } = {}) => {
  const response = await fetch(`${DEFAULT_API_BASE_URL}${DEFAULT_EEG_ANALYSIS_ENDPOINT}`, {
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
