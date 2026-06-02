import { API_BASE_URL, EEG_ANALYSIS_ENDPOINT } from './env';

const EEG_CHANNEL_KEYS = ['TP9', 'AF7', 'AF8', 'TP10'];
const EEG_SESSION_START_ENDPOINT = '/api/eeg/sessions/start';
const EEG_RAW_CHUNK_ENDPOINT = '/api/eeg/raw/chunks';
const DEFAULT_RAW_CHUNK_DURATION_SEC = 10;

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

const getFiniteNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const createRawEegReadingsPayload = (rawReadings) => {
  if (!Array.isArray(rawReadings) || !rawReadings.length) {
    return [];
  }

  return rawReadings
    .map((reading, index) => {
      const timestamp =
        getFiniteNumber(reading?.sourceTimestamp) ??
        getFiniteNumber(reading?.timestamp) ??
        index;

      const channels = Object.fromEntries(
        EEG_CHANNEL_KEYS.map((channelKey) => [
          channelKey,
          getFiniteNumber(reading?.channels?.[channelKey]),
        ])
      );

      const hasAllChannels = EEG_CHANNEL_KEYS.every(
        (channelKey) => Number.isFinite(channels[channelKey])
      );

      if (!hasAllChannels) {
        return null;
      }

      return {
        timestamp,
        source:
          typeof reading?.source === 'string' && reading.source.trim()
            ? reading.source
            : 'frontend-muse-reading',
        channels,
      };
    })
    .filter(Boolean);
};

const buildChunkSamples = (chunkReadings) => {
  if (!chunkReadings.length) {
    return [];
  }

  const chunkBaseTimestamp = chunkReadings[0].timestamp ?? 0;

  return chunkReadings.map((reading) => [
    Math.max(0, Math.round((reading.timestamp ?? chunkBaseTimestamp) - chunkBaseTimestamp)),
    reading.channels.TP9,
    reading.channels.AF7,
    reading.channels.AF8,
    reading.channels.TP10,
  ]);
};

const createRawChunkPayloads = ({
  eegSessionId,
  rawReadings,
  sampleRateHz = 256,
  chunkDurationSec = DEFAULT_RAW_CHUNK_DURATION_SEC,
}) => {
  const normalizedReadings = createRawEegReadingsPayload(rawReadings);
  if (!eegSessionId || !normalizedReadings.length) {
    return [];
  }

  const chunkSize = Math.max(64, Math.floor(sampleRateHz * Math.max(1, chunkDurationSec)));
  const baseTimestamp = normalizedReadings[0].timestamp ?? 0;
  const chunks = [];

  for (let chunkIndex = 0; chunkIndex * chunkSize < normalizedReadings.length; chunkIndex += 1) {
    const start = chunkIndex * chunkSize;
    const chunkReadings = normalizedReadings.slice(start, start + chunkSize);
    if (!chunkReadings.length) {
      continue;
    }

    const chunkBaseTimestamp = chunkReadings[0].timestamp ?? baseTimestamp;
    chunks.push({
      eegSessionId,
      sampleRateHz,
      chunkIndex,
      startOffsetMs: Math.max(0, Math.round(chunkBaseTimestamp - baseTimestamp)),
      samples: buildChunkSamples(chunkReadings),
    });
  }

  return chunks;
};

export const createRawChunkPayload = ({
  eegSessionId,
  rawReadings,
  sampleRateHz = 256,
  chunkIndex = 0,
  baseTimestamp = null,
}) => {
  const normalizedReadings = createRawEegReadingsPayload(rawReadings);
  if (!eegSessionId || !normalizedReadings.length) {
    return null;
  }

  const resolvedBaseTimestamp = getFiniteNumber(baseTimestamp) ?? normalizedReadings[0].timestamp ?? 0;
  const chunkBaseTimestamp = normalizedReadings[0].timestamp ?? resolvedBaseTimestamp;

  return {
    eegSessionId,
    sampleRateHz,
    chunkIndex,
    startOffsetMs: Math.max(0, Math.round(chunkBaseTimestamp - resolvedBaseTimestamp)),
    samples: buildChunkSamples(normalizedReadings),
  };
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

export const uploadEegRawChunk = async (payload, { signal } = {}) => {
  if (!payload?.eegSessionId || !Array.isArray(payload.samples) || !payload.samples.length) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}${EEG_RAW_CHUNK_ENDPOINT}`, {
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
        : responseBody?.message || `EEG raw chunk upload failed with status ${response.status}`;

    throw new Error(message);
  }

  return responseBody;
};

export const uploadEegRawReadingsChunk = async (
  {
    eegSessionId,
    rawReadings,
    sampleRateHz = 256,
    chunkIndex = 0,
    baseTimestamp = null,
  },
  { signal } = {}
) => {
  const payload = createRawChunkPayload({
    eegSessionId,
    rawReadings,
    sampleRateHz,
    chunkIndex,
    baseTimestamp,
  });

  return uploadEegRawChunk(payload, { signal });
};

export const uploadEegRawChunks = async (
  {
    eegSessionId,
    rawReadings,
    sampleRateHz = 256,
    chunkDurationSec = DEFAULT_RAW_CHUNK_DURATION_SEC,
  },
  { signal } = {}
) => {
  const chunkPayloads = createRawChunkPayloads({
    eegSessionId,
    rawReadings,
    sampleRateHz,
    chunkDurationSec,
  });

  if (!chunkPayloads.length) {
    return null;
  }

  for (const payload of chunkPayloads) {
    await uploadEegRawChunk(payload, { signal });
  }

  return {
    eegSessionId: chunkPayloads[0].eegSessionId,
    chunkCount: chunkPayloads.length,
    sampleCount: createRawEegReadingsPayload(rawReadings).length,
  };
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
