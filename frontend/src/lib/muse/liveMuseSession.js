import { createMuseClient } from './index';

const EEG_SAMPLE_RATE = 256;
const MAX_SHARED_BUFFER_SEC = 390;
const MAX_SHARED_READING_COUNT = EEG_SAMPLE_RATE * MAX_SHARED_BUFFER_SEC;

const sharedLiveMuseSession = {
  client: null,
  status: 'idle',
  mode: 'web',
  startedAt: null,
  connectedAt: null,
  eegSessionId: null,
  sampleCount: 0,
  lastReading: null,
  readings: [],
  broadcasterSubscription: null,
  subscribers: new Set(),
};

const isConnectedStatus = (status) => ['connecting', 'connected', 'streaming'].includes(status);

const pushSharedReading = (reading) => {
  sharedLiveMuseSession.sampleCount += 1;
  sharedLiveMuseSession.lastReading = reading;
  sharedLiveMuseSession.readings.push(reading);

  if (sharedLiveMuseSession.readings.length > MAX_SHARED_READING_COUNT) {
    sharedLiveMuseSession.readings.splice(0, sharedLiveMuseSession.readings.length - MAX_SHARED_READING_COUNT);
  }

  sharedLiveMuseSession.subscribers.forEach((callback) => {
    try {
      callback(reading);
    } catch (error) {
      console.warn('Shared Muse subscriber failed:', error);
    }
  });
};

const ensureBroadcasterSubscription = () => {
  const client = sharedLiveMuseSession.client;
  if (!client || sharedLiveMuseSession.broadcasterSubscription) {
    return;
  }

  sharedLiveMuseSession.broadcasterSubscription = client.subscribe(pushSharedReading);
};

export const attachSharedLiveMuseClient = (client, metadata = {}) => {
  if (!client) {
    return getSharedLiveMuseSnapshot();
  }

  if (sharedLiveMuseSession.client && sharedLiveMuseSession.client !== client) {
    sharedLiveMuseSession.broadcasterSubscription?.unsubscribe?.();
    sharedLiveMuseSession.broadcasterSubscription = null;
    sharedLiveMuseSession.readings = [];
    sharedLiveMuseSession.sampleCount = 0;
    sharedLiveMuseSession.lastReading = null;
  }

  sharedLiveMuseSession.client = client;
  sharedLiveMuseSession.status = metadata.status || 'connected';
  sharedLiveMuseSession.mode = metadata.mode || sharedLiveMuseSession.mode || 'web';
  sharedLiveMuseSession.startedAt = metadata.startedAt || sharedLiveMuseSession.startedAt || new Date().toISOString();
  sharedLiveMuseSession.connectedAt = metadata.connectedAt || sharedLiveMuseSession.connectedAt || sharedLiveMuseSession.startedAt;
  sharedLiveMuseSession.eegSessionId = metadata.eegSessionId ?? sharedLiveMuseSession.eegSessionId;

  ensureBroadcasterSubscription();
  return getSharedLiveMuseSnapshot();
};

export const startSharedLiveMuseSession = async ({ mode = 'web', metadata = {} } = {}) => {
  if (sharedLiveMuseSession.client && isConnectedStatus(sharedLiveMuseSession.status)) {
    return getSharedLiveMuseSnapshot();
  }

  const startedAt = metadata.startedAt || new Date().toISOString();
  sharedLiveMuseSession.status = 'connecting';
  sharedLiveMuseSession.mode = mode;
  sharedLiveMuseSession.startedAt = startedAt;

  const client = await createMuseClient({ mode });
  await client.connect();
  await client.start();

  return attachSharedLiveMuseClient(client, {
    ...metadata,
    mode,
    status: 'connected',
    startedAt,
    connectedAt: metadata.connectedAt || new Date().toISOString(),
  });
};

export const subscribeToSharedLiveMuseReadings = (callback) => {
  sharedLiveMuseSession.subscribers.add(callback);

  return {
    unsubscribe: () => {
      sharedLiveMuseSession.subscribers.delete(callback);
    },
  };
};

export const updateSharedLiveMuseSession = (metadata = {}) => {
  if (metadata.status) sharedLiveMuseSession.status = metadata.status;
  if (metadata.startedAt) sharedLiveMuseSession.startedAt = metadata.startedAt;
  if (metadata.connectedAt) sharedLiveMuseSession.connectedAt = metadata.connectedAt;
  if (metadata.eegSessionId !== undefined) sharedLiveMuseSession.eegSessionId = metadata.eegSessionId;
  if (metadata.mode) sharedLiveMuseSession.mode = metadata.mode;
  return getSharedLiveMuseSnapshot();
};

export const hasActiveSharedLiveMuseSession = () =>
  Boolean(sharedLiveMuseSession.client && isConnectedStatus(sharedLiveMuseSession.status));

export const getSharedLiveMuseSnapshot = () => ({
  client: sharedLiveMuseSession.client,
  status: sharedLiveMuseSession.status,
  mode: sharedLiveMuseSession.mode,
  startedAt: sharedLiveMuseSession.startedAt,
  connectedAt: sharedLiveMuseSession.connectedAt,
  eegSessionId: sharedLiveMuseSession.eegSessionId,
  sampleCount: sharedLiveMuseSession.sampleCount,
  lastReading: sharedLiveMuseSession.lastReading,
  readings: sharedLiveMuseSession.readings.slice(),
  isActive: hasActiveSharedLiveMuseSession(),
});

export const stopSharedLiveMuseSession = async ({ disconnect = true } = {}) => {
  sharedLiveMuseSession.status = 'disconnecting';
  sharedLiveMuseSession.broadcasterSubscription?.unsubscribe?.();
  sharedLiveMuseSession.broadcasterSubscription = null;
  sharedLiveMuseSession.subscribers.clear();

  const client = sharedLiveMuseSession.client;
  sharedLiveMuseSession.client = null;

  if (disconnect) {
    await client?.disconnect?.();
  }

  sharedLiveMuseSession.status = 'idle';
  sharedLiveMuseSession.startedAt = null;
  sharedLiveMuseSession.connectedAt = null;
  sharedLiveMuseSession.eegSessionId = null;
  sharedLiveMuseSession.sampleCount = 0;
  sharedLiveMuseSession.lastReading = null;
  sharedLiveMuseSession.readings = [];
};
