const ELECTRODE_LABELS = ['TP9', 'AF7', 'AF8', 'TP10'];

const DEFAULT_MOCK_DATA_PATH = '/mock-data/resting-state.csv';

const parseCsvSamples = (csvText) => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error('Mock EEG CSV is empty.');
  }

  return lines.slice(1).map((line) => {
    const [timestampText, tp9Text, af7Text, af8Text, tp10Text] = line.split(',');
    const timestamp = Number(timestampText);
    const samples = [tp9Text, af7Text, af8Text, tp10Text].map((value) => Number(value));

    return {
      timestamp,
      samples,
      channels: {
        TP9: samples[0],
        AF7: samples[1],
        AF8: samples[2],
        TP10: samples[3],
      },
    };
  });
};

export function createMockMuseClient(options = {}) {
  const {
    connectDelayMs = 800,
    sampleIntervalMs,
    mockDataPath = DEFAULT_MOCK_DATA_PATH,
    loop = true,
  } = options;

  let intervalId = null;
  let isConnected = false;
  let mockSamples = [];
  let currentIndex = 0;
  const subscribers = new Set();

  const emit = () => {
    if (!mockSamples.length) return;

    const currentSample = mockSamples[currentIndex];
    const reading = {
      timestamp: Date.now(),
      sourceTimestamp: currentSample.timestamp,
      electrode: null,
      samples: currentSample.samples,
      channels: currentSample.channels,
      labels: ELECTRODE_LABELS,
      source: 'mock',
    };

    subscribers.forEach((callback) => callback(reading));

    if (currentIndex >= mockSamples.length - 1) {
      currentIndex = loop ? 0 : mockSamples.length - 1;
      return;
    }

    currentIndex += 1;
  };

  const subscribe = (callback) => {
    subscribers.add(callback);

    return {
      unsubscribe: () => {
        subscribers.delete(callback);
      },
    };
  };

  const resolveSampleIntervalMs = () => {
    if (sampleIntervalMs) return sampleIntervalMs;

    if (mockSamples.length < 2) {
      return 1000 / 256;
    }

    const deltas = [];

    for (let index = 1; index < mockSamples.length; index += 1) {
      const delta = mockSamples[index].timestamp - mockSamples[index - 1].timestamp;
      if (delta > 0) {
        deltas.push(delta);
      }
    }

    if (!deltas.length) {
      return 1000 / 256;
    }

    const averageDelta = deltas.reduce((total, delta) => total + delta, 0) / deltas.length;
    return Math.max(1, averageDelta);
  };

  const client = {
    async connect() {
      const response = await fetch(mockDataPath);

      if (!response.ok) {
        throw new Error(`Failed to load mock EEG data from ${mockDataPath}`);
      }

      mockSamples = parseCsvSamples(await response.text());
      currentIndex = 0;

      await new Promise((resolve) => setTimeout(resolve, connectDelayMs));
      isConnected = true;
      return client;
    },

    async start() {
      if (!isConnected) {
        throw new Error('Mock Muse client is not connected.');
      }

      if (!intervalId) {
        intervalId = window.setInterval(emit, resolveSampleIntervalMs());
      }

      return client;
    },

    subscribe,

    eegReadings: {
      subscribe,
    },

    async disconnect() {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = null;
      }

      subscribers.clear();
      isConnected = false;
    },
  };

  return client;
}

export default createMockMuseClient;
