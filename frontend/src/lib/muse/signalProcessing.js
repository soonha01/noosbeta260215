export const CHANNEL_KEYS = ['TP9', 'AF7', 'AF8', 'TP10'];

export const EEG_BANDS = [
  { key: 'delta', label: 'Delta', minHz: 1, maxHz: 4, color: '#84dcc6' },
  { key: 'theta', label: 'Theta', minHz: 4, maxHz: 8, color: '#9f86ff' },
  { key: 'alpha', label: 'Alpha', minHz: 8, maxHz: 13, color: '#ffd166' },
  { key: 'beta', label: 'Beta', minHz: 13, maxHz: 30, color: '#ff7b72' },
  { key: 'gamma', label: 'Gamma', minHz: 30, maxHz: 45, color: '#7ee787' },
];

export const DEFAULT_SAMPLE_RATE = 256;
export const DEFAULT_FFT_SIZE = 256;
export const DEFAULT_MAX_WINDOW_COUNT = 48;

const createEmptyBandPowers = () =>
  EEG_BANDS.map((band) => ({
    ...band,
    power: 0,
    percent: 0,
  }));

const applyHammingWindow = (samples) =>
  samples.map((sample, index) => {
    const coefficient = 0.54 - 0.46 * Math.cos((2 * Math.PI * index) / (samples.length - 1));
    return sample * coefficient;
  });

const computeBandPowersForSamples = (samples, sampleRate) => {
  if (samples.length < 64) {
    return createEmptyBandPowers();
  }

  const mean = samples.reduce((total, value) => total + value, 0) / samples.length;
  const centeredSamples = samples.map((value) => value - mean);
  const windowedSamples = applyHammingWindow(centeredSamples);
  const bandTotals = new Map(EEG_BANDS.map((band) => [band.key, 0]));

  for (let bin = 1; bin < Math.floor(samples.length / 2); bin += 1) {
    const frequency = (bin * sampleRate) / samples.length;
    if (frequency > 45) break;

    let real = 0;
    let imaginary = 0;

    for (let index = 0; index < windowedSamples.length; index += 1) {
      const phase = (2 * Math.PI * bin * index) / windowedSamples.length;
      real += windowedSamples[index] * Math.cos(phase);
      imaginary -= windowedSamples[index] * Math.sin(phase);
    }

    const magnitude = Math.sqrt(real * real + imaginary * imaginary) / windowedSamples.length;
    const power = magnitude * magnitude;
    const matchedBand = EEG_BANDS.find(
      (band) => frequency >= band.minHz && frequency < band.maxHz
    );

    if (matchedBand) {
      bandTotals.set(matchedBand.key, bandTotals.get(matchedBand.key) + power);
    }
  }

  return EEG_BANDS.map((band) => ({
    ...band,
    power: bandTotals.get(band.key) ?? 0,
    percent: 0,
  }));
};

export const getRecentChannelSeries = (readings, maxPoints = 240) => {
  const recentReadings = readings.slice(-maxPoints);
  const timestamps = recentReadings.map((reading, index) => {
    const timestamp = Number(reading?.timestamp);
    return Number.isFinite(timestamp) ? timestamp : index;
  });

  return CHANNEL_KEYS.map((channelKey) => ({
    key: channelKey,
    timestamps,
    samples: recentReadings.map((reading) => reading?.channels?.[channelKey] ?? 0),
  }));
};

export const analyzeEegBands = (
  readings,
  { sampleRate = DEFAULT_SAMPLE_RATE, fftSize = DEFAULT_FFT_SIZE, maxWindowCount = DEFAULT_MAX_WINDOW_COUNT } = {}
) => {
  const totalReadings = Array.isArray(readings) ? readings : [];

  if (totalReadings.length < 64) {
    return {
      sampleCount: totalReadings.length,
      bandPowers: createEmptyBandPowers(),
      dominantBand: null,
      totalPower: 0,
    };
  }

  const windows = [];
  const availableWindowCount = Math.max(1, Math.floor(totalReadings.length / fftSize));
  const targetWindowCount = Math.min(Math.max(1, maxWindowCount), availableWindowCount);

  if (availableWindowCount <= 1) {
    windows.push(totalReadings.slice(-fftSize));
  } else {
    const selectedStartIndices = new Set();

    for (let index = 0; index < targetWindowCount; index += 1) {
      const ratio = targetWindowCount === 1 ? 1 : index / (targetWindowCount - 1);
      const windowIndex = Math.floor((availableWindowCount - 1) * ratio);
      const start = windowIndex * fftSize;
      if (selectedStartIndices.has(start)) continue;
      selectedStartIndices.add(start);
      windows.push(totalReadings.slice(start, start + fftSize));
    }
  }

  const aggregatedTotals = new Map(EEG_BANDS.map((band) => [band.key, 0]));
  let processedWindowCount = 0;

  windows.forEach((windowReadings) => {
    if (windowReadings.length < 64) return;
    processedWindowCount += 1;

    CHANNEL_KEYS.forEach((channelKey) => {
      const channelSamples = windowReadings.map((reading) => reading?.channels?.[channelKey] ?? 0);
      const bandPowers = computeBandPowersForSamples(channelSamples, sampleRate);

      bandPowers.forEach((band) => {
        aggregatedTotals.set(
          band.key,
          aggregatedTotals.get(band.key) + band.power / CHANNEL_KEYS.length
        );
      });
    });
  });

  const divisor = Math.max(1, processedWindowCount);

  const bandPowers = EEG_BANDS.map((band) => ({
    ...band,
    power: (aggregatedTotals.get(band.key) ?? 0) / divisor,
    percent: 0,
  }));

  const totalPower = bandPowers.reduce((total, band) => total + band.power, 0);
  const normalizedBandPowers = bandPowers.map((band) => ({
    ...band,
    percent: totalPower > 0 ? (band.power / totalPower) * 100 : 0,
  }));
  const dominantBand = normalizedBandPowers.reduce(
    (currentMax, band) => (band.power > currentMax.power ? band : currentMax),
    normalizedBandPowers[0]
  );

  return {
    sampleCount: totalReadings.length,
    bandPowers: normalizedBandPowers,
    dominantBand: dominantBand?.key ?? null,
    totalPower,
  };
};
