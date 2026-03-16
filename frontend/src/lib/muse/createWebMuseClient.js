const ELECTRODE_LABELS = ['TP9', 'AF7', 'AF8', 'TP10'];

const dynamicImport = (specifier) =>
  // eslint-disable-next-line no-new-func
  new Function('moduleName', 'return import(moduleName);')(specifier);

const extractLastNumericValue = (value) => {
  if (typeof value === 'number') return value;

  if (Array.isArray(value)) {
    return extractLastNumericValue(value[value.length - 1]);
  }

  if (value && typeof value === 'object') {
    if (typeof value.value === 'number') return value.value;
    if (Array.isArray(value.values)) return extractLastNumericValue(value.values);
    if (Array.isArray(value.samples)) return extractLastNumericValue(value.samples);
  }

  return null;
};

const normalizeReading = (rawReads) => {
  const samples = rawReads.map((value) => extractLastNumericValue(value));

  return {
    timestamp: Date.now(),
    electrode: null,
    samples,
    channels: {
      TP9: samples[0] ?? null,
      AF7: samples[1] ?? null,
      AF8: samples[2] ?? null,
      TP10: samples[3] ?? null,
    },
    labels: ELECTRODE_LABELS,
    raw: rawReads,
    source: 'web-muse',
  };
};

export async function createWebMuseClient(options = {}) {
  const {
    mock = false,
    mockDataPath,
    pollIntervalMs = 1000 / 32,
  } = options;

  let module;

  try {
    module = await dynamicImport('web-muse');
  } catch (error) {
    throw new Error(
      'web-muse dependency is not installed. Add it to frontend/package.json before using the real Muse client.'
    );
  }

  const connectMuse = module.connectMuse ?? module.default?.connectMuse;

  if (typeof connectMuse !== 'function') {
    throw new Error('web-muse does not export connectMuse().');
  }

  let muse = null;
  let pollId = null;
  const subscribers = new Set();

  const emit = () => {
    if (!muse || !Array.isArray(muse.eeg)) return;

    const rawReads = muse.eeg.map((buffer) => {
      if (!buffer || typeof buffer.read !== 'function') return null;
      return buffer.read();
    });

    subscribers.forEach((callback) => callback(normalizeReading(rawReads)));
  };

  const subscribe = (callback) => {
    subscribers.add(callback);

    return {
      unsubscribe: () => {
        subscribers.delete(callback);
      },
    };
  };

  const startPolling = () => {
    if (!pollId) {
      pollId = window.setInterval(emit, pollIntervalMs);
    }
  };

  const stopPolling = () => {
    if (pollId) {
      window.clearInterval(pollId);
      pollId = null;
    }
  };

  const client = {
    async connect() {
      muse = await connectMuse({
        ...(mock ? { mock: true } : {}),
        ...(mockDataPath ? { mockDataPath } : {}),
      });

      return client;
    },

    async start() {
      if (!muse) {
        throw new Error('Muse device is not connected.');
      }

      if (typeof muse.start === 'function') {
        await muse.start();
      }

      startPolling();
      return client;
    },

    subscribe,

    eegReadings: {
      subscribe,
    },

    async disconnect() {
      stopPolling();
      subscribers.clear();

      if (muse && typeof muse.disconnect === 'function') {
        await muse.disconnect();
      }

      muse = null;
    },
  };

  return client;
}

export default createWebMuseClient;
