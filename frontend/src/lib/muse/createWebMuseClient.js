const MUSE_SERVICE = 0xfe8d;
const CONTROL_CHARACTERISTIC = '273e0001-4c4d-454d-96be-f03bac821358';
const EEG_CHARACTERISTICS = [
  '273e0003-4c4d-454d-96be-f03bac821358',
  '273e0004-4c4d-454d-96be-f03bac821358',
  '273e0005-4c4d-454d-96be-f03bac821358',
  '273e0006-4c4d-454d-96be-f03bac821358',
];
const ATHENA_DATA_CHARACTERISTICS = [
  '273e0013-4c4d-454d-96be-f03bac821358',
  '273e0014-4c4d-454d-96be-f03bac821358',
  '273e0015-4c4d-454d-96be-f03bac821358',
];
const ELECTRODE_LABELS = ['TP9', 'AF7', 'AF8', 'TP10'];
const CHANNEL_ORDER = ['TP9', 'AF7', 'AF8', 'TP10'];
const EEG_SCALE = 0.48828125;
const EEG_OFFSET = 0x800;
const ATHENA_EEG_SCALE = 1450 / 16383;
const ATHENA_PACKET_HEADER_SIZE = 14;
const ATHENA_SUBPACKET_HEADER_SIZE = 5;
const ATHENA_SENSOR_CONFIG = {
  0x11: { type: 'EEG', channelCount: 4, sampleCount: 4, dataLength: 28 },
  0x12: { type: 'EEG', channelCount: 8, sampleCount: 2, dataLength: 28 },
  0x34: { type: 'OPTICS', dataLength: 30 },
  0x35: { type: 'OPTICS', dataLength: 40 },
  0x36: { type: 'OPTICS', dataLength: 40 },
  0x47: { type: 'ACCGYRO', dataLength: 36 },
  0x53: { type: 'UNKNOWN', dataLength: 24 },
  0x88: { type: 'BATTERY', dataLength: 188 },
  0x98: { type: 'BATTERY', dataLength: 20 },
};
const MAX_CHANNEL_QUEUE_SIZE = 1024;
const RAW_PACKET_LOG_DURATION_MS = 60 * 1000;
const RAW_PACKET_LOG_INTERVAL_MS = 1000;
const RAW_PACKET_TIMEOUT_MS = 3000;

const assertWebBluetoothAvailable = () => {
  if (!window.isSecureContext) {
    throw new Error('Web Bluetooth requires HTTPS or localhost.');
  }

  if (!navigator.bluetooth) {
    throw new Error('This browser does not support Web Bluetooth. Use Chrome or Edge on desktop.');
  }
};

const encodeCommand = (command) => {
  const encoded = new TextEncoder().encode(`X${command}\n`);
  encoded[0] = encoded.length - 1;
  return encoded;
};

const decodeUnsigned12BitSamples = (bytes) => {
  const samples = [];

  for (let index = 0; index < bytes.length; index += 1) {
    if (index % 3 === 0) {
      samples.push((bytes[index] << 4) | (bytes[index + 1] >> 4));
    } else {
      samples.push(((bytes[index] & 0x0f) << 8) | bytes[index + 1]);
      index += 1;
    }
  }

  return samples;
};

const decodeEegPacket = (event) => {
  const dataView = event?.target?.value;
  if (!dataView?.buffer) return [];

  const bytes = new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength).subarray(2);
  return decodeUnsigned12BitSamples(bytes).map((sample) => EEG_SCALE * (sample - EEG_OFFSET));
};

const getPacketUint8Array = (event) => {
  const dataView = event?.target?.value;
  if (!dataView?.buffer) return [];
  return new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength);
};

const getPacketBytes = (event) => Array.from(getPacketUint8Array(event));

const bytesToBits = (bytes, byteCount) => {
  const bits = [];
  const limit = Math.min(bytes.length, byteCount);

  for (let byteIndex = 0; byteIndex < limit; byteIndex += 1) {
    const byte = bytes[byteIndex];
    for (let bitIndex = 0; bitIndex < 8; bitIndex += 1) {
      bits.push((byte >> bitIndex) & 1);
    }
  }

  return bits;
};

const extractPackedInt = (bits, bitStart, bitWidth) => {
  let value = 0;

  for (let bitIndex = 0; bitIndex < bitWidth; bitIndex += 1) {
    if (bits[bitStart + bitIndex]) {
      value |= 1 << bitIndex;
    }
  }

  return value;
};

const decodeAthenaEegData = (dataBytes, channelCount) => {
  if (dataBytes.length < 28) return [];

  const sampleCount = channelCount === 4 ? 4 : 2;
  const bits = bytesToBits(dataBytes, 28);
  const rows = [];

  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
    const row = [];

    for (let channelIndex = 0; channelIndex < channelCount; channelIndex += 1) {
      const bitStart = (sampleIndex * channelCount + channelIndex) * 14;
      const rawValue = extractPackedInt(bits, bitStart, 14);
      row.push(rawValue * ATHENA_EEG_SCALE);
    }

    rows.push(row);
  }

  return rows;
};

const parseAthenaDataPacket = (event) => {
  const payload = getPacketUint8Array(event);
  const eegRows = [];
  const packetTags = [];
  let offset = 0;

  while (offset < payload.length) {
    if (offset + ATHENA_PACKET_HEADER_SIZE > payload.length) break;

    const packetLength = payload[offset];
    if (!packetLength || offset + packetLength > payload.length) break;

    const packet = payload.subarray(offset, offset + packetLength);
    const packetTag = packet[9];
    const packetConfig = ATHENA_SENSOR_CONFIG[packetTag];
    const packetData = packet.subarray(ATHENA_PACKET_HEADER_SIZE);
    let dataOffset = 0;

    packetTags.push(`0x${packetTag.toString(16).padStart(2, '0')}`);

    if (packetConfig?.dataLength) {
      const dataEnd = dataOffset + packetConfig.dataLength;

      if (dataEnd <= packetData.length) {
        if (packetConfig.type === 'EEG') {
          eegRows.push(...decodeAthenaEegData(packetData.subarray(dataOffset, dataEnd), packetConfig.channelCount));
        }

        dataOffset = dataEnd;
      }
    }

    while (dataOffset + ATHENA_SUBPACKET_HEADER_SIZE <= packetData.length) {
      const tag = packetData[dataOffset];
      const config = ATHENA_SENSOR_CONFIG[tag];

      if (!config?.dataLength) break;

      const dataStart = dataOffset + ATHENA_SUBPACKET_HEADER_SIZE;
      const dataEnd = dataStart + config.dataLength;
      if (dataEnd > packetData.length) break;

      packetTags.push(`0x${tag.toString(16).padStart(2, '0')}`);

      if (config.type === 'EEG') {
        eegRows.push(...decodeAthenaEegData(packetData.subarray(dataStart, dataEnd), config.channelCount));
      }

      dataOffset = dataEnd;
    }

    offset += packetLength;
  }

  return { eegRows, packetTags };
};

const decodeControlText = (event) => {
  const bytes = getPacketUint8Array(event);
  if (!bytes.length) return '';

  const payloadLength = bytes[0];
  const payload =
    payloadLength > 0 && payloadLength <= bytes.length - 1
      ? bytes.subarray(1, 1 + payloadLength)
      : bytes;

  return new TextDecoder().decode(payload);
};

const getAvailableCharacteristicUuids = async (service) => {
  if (typeof service.getCharacteristics !== 'function') {
    return [];
  }

  try {
    const characteristics = await service.getCharacteristics();
    return characteristics.map((characteristic) => characteristic.uuid);
  } catch (error) {
    console.warn('Could not enumerate Muse service characteristics:', error);
    return [];
  }
};

const getCharacteristicWithContext = async (service, uuid, label, availableUuids) => {
  try {
    return await service.getCharacteristic(uuid);
  } catch (error) {
    const availableList = availableUuids.length
      ? ` Available UUIDs: ${availableUuids.join(', ')}`
      : ' Available UUIDs could not be enumerated.';
    throw new Error(`Muse ${label} characteristic ${uuid} was not found.${availableList}`);
  }
};

const createReading = (samplesByLabel) => {
  const samples = CHANNEL_ORDER.map((label) => samplesByLabel[label]);

  return {
    timestamp: Date.now(),
    electrode: null,
    samples,
    channels: {
      TP9: samplesByLabel.TP9,
      AF7: samplesByLabel.AF7,
      AF8: samplesByLabel.AF8,
      TP10: samplesByLabel.TP10,
    },
    labels: CHANNEL_ORDER,
    raw: { ...samplesByLabel },
    source: 'web-bluetooth-muse',
  };
};

export async function createWebMuseClient(options = {}) {
  const {
    pollIntervalMs = 1000 / 256,
    streamPreset = 'p1041',
  } = options;

  let device = null;
  let gatt = null;
  let controlCharacteristic = null;
  let pollId = null;
  let isStarted = false;
  let rawPacketTimeoutId = null;
  const eegCharacteristics = [];
  const channelQueues = ELECTRODE_LABELS.map(() => []);
  const latestSamples = Object.fromEntries(CHANNEL_ORDER.map((label) => [label, null]));
  const subscribers = new Set();
  let rawPacketLogCount = 0;
  let rawPacketDebugPacketCount = 0;
  let rawPacketLogStartedAt = null;
  let rawPacketLastLoggedAt = 0;
  let rawPacketDebugCompletedLogged = false;
  let controlInfoFragment = '';

  const stopPolling = () => {
    if (pollId) {
      window.clearInterval(pollId);
      pollId = null;
    }
  };

  const stopRawPacketTimeout = () => {
    if (rawPacketTimeoutId) {
      window.clearTimeout(rawPacketTimeoutId);
      rawPacketTimeoutId = null;
    }
  };

  const startRawPacketTimeout = () => {
    stopRawPacketTimeout();
    rawPacketTimeoutId = window.setTimeout(() => {
      rawPacketTimeoutId = null;

      if (rawPacketLogCount === 0) {
        console.warn(
          'Muse Athena data characteristics are subscribed, but no notification packets arrived yet. The stream preset/command may need to be different for this firmware.'
        );
      }
    }, RAW_PACKET_TIMEOUT_MS);
  };

  const resetRawPacketDebugWindow = () => {
    rawPacketLogCount = 0;
    rawPacketDebugPacketCount = 0;
    rawPacketLogStartedAt = Date.now();
    rawPacketLastLoggedAt = 0;
    rawPacketDebugCompletedLogged = false;
  };

  const emit = () => {
    ELECTRODE_LABELS.forEach((label, channelIndex) => {
      const nextSample = channelQueues[channelIndex].shift();
      if (Number.isFinite(nextSample)) {
        latestSamples[label] = nextSample;
      }
    });

    if (CHANNEL_ORDER.every((label) => latestSamples[label] === null)) {
      return;
    }

    subscribers.forEach((callback) => callback(createReading(latestSamples)));
  };

  const startPolling = () => {
    if (!pollId) {
      pollId = window.setInterval(emit, pollIntervalMs);
    }
  };

  const enqueueChannelSamples = (channelIndex, samples) => {
    const queue = channelQueues[channelIndex];
    queue.push(...samples);

    if (queue.length > MAX_CHANNEL_QUEUE_SIZE) {
      queue.splice(0, queue.length - MAX_CHANNEL_QUEUE_SIZE);
    }
  };

  const enqueueAthenaEegRows = (rows) => {
    rows.forEach((row) => {
      ELECTRODE_LABELS.forEach((label, channelIndex) => {
        const sample = row[channelIndex];
        if (Number.isFinite(sample)) {
          enqueueChannelSamples(channelIndex, [sample]);
        }
      });
    });
  };

  const logRawPacketSample = (label, uuid, event, decodedSamples, metadata = {}) => {
    stopRawPacketTimeout();

    const loggedAt = Date.now();
    if (!rawPacketLogStartedAt) {
      rawPacketLogStartedAt = loggedAt;
    }

    rawPacketDebugPacketCount += 1;

    const elapsedMs = loggedAt - rawPacketLogStartedAt;
    if (elapsedMs > RAW_PACKET_LOG_DURATION_MS) {
      if (!rawPacketDebugCompletedLogged) {
        rawPacketDebugCompletedLogged = true;
        console.info('Muse raw data packet debug window completed', {
          durationSec: RAW_PACKET_LOG_DURATION_MS / 1000,
          packetCount: rawPacketDebugPacketCount,
          loggedPacketCount: rawPacketLogCount,
        });
      }
      return;
    }

    const shouldLogFirstPacket = rawPacketLogCount === 0;
    const shouldLogInterval = loggedAt - rawPacketLastLoggedAt >= RAW_PACKET_LOG_INTERVAL_MS;
    if (!shouldLogFirstPacket && !shouldLogInterval) return;

    rawPacketLogCount += 1;
    rawPacketLastLoggedAt = loggedAt;

    const bytes = getPacketBytes(event);
    const hex = bytes.map((byte) => byte.toString(16).padStart(2, '0')).join(' ');
    const decodedPreview = Array.isArray(decodedSamples?.[0])
      ? decodedSamples.slice(0, 4)
      : decodedSamples.slice(0, 12);

    console.info('Muse raw data packet', {
      label,
      uuid,
      byteLength: bytes.length,
      elapsedSec: Number((elapsedMs / 1000).toFixed(2)),
      packetCount: rawPacketDebugPacketCount,
      debugWindowSec: RAW_PACKET_LOG_DURATION_MS / 1000,
      hex,
      decodedPreview,
      ...metadata,
    });
  };

  const logControlResponse = (event) => {
    const text = decodeControlText(event);
    if (!text) return;

    controlInfoFragment = `${controlInfoFragment}${text}`.slice(-4096);
    console.info('Muse control response:', text);

    const objectEndIndex = controlInfoFragment.lastIndexOf('}');
    const objectStartIndex = controlInfoFragment.lastIndexOf('{', objectEndIndex);
    if (objectStartIndex === -1 || objectEndIndex === -1 || objectStartIndex >= objectEndIndex) return;

    try {
      const info = JSON.parse(controlInfoFragment.slice(objectStartIndex, objectEndIndex + 1));
      console.info('Muse control info:', info);
      controlInfoFragment = '';
    } catch {
      // Keep collecting fragmented control messages until a full JSON object arrives.
    }
  };

  const sendCommand = async (command) => {
    if (!controlCharacteristic) {
      throw new Error('Muse control characteristic is not connected.');
    }

    console.info('Sending Muse command:', command);
    const encodedCommand = encodeCommand(command);

    if (typeof controlCharacteristic.writeValueWithoutResponse === 'function') {
      await controlCharacteristic.writeValueWithoutResponse(encodedCommand);
      return;
    }

    await controlCharacteristic.writeValue(encodedCommand);
  };

  const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  const sendCommandStep = async (command, delayMs = 200, optional = false) => {
    try {
      await sendCommand(command);
    } catch (error) {
      if (!optional) throw error;
      console.warn(`Optional Muse command ${command} failed:`, error);
    }

    if (delayMs > 0) {
      await sleep(delayMs);
    }
  };

  const sendAthenaStartSequence = async () => {
    await sendCommandStep('v6', 200, true);
    await sendCommandStep('s', 200, true);
    await sendCommandStep('h', 200, true);
    await sendCommandStep(streamPreset, 200);
    await sendCommandStep('s', 200, true);
    await sendCommandStep('dc001', 50);
    await sendCommandStep('dc001', 100);
    await sendCommandStep('L1', 300, true);
    await sendCommandStep('s', 200, true);
  };

  const handleDisconnected = () => {
    isStarted = false;
    controlCharacteristic = null;
    gatt = null;
    device = null;
    eegCharacteristics.splice(0, eegCharacteristics.length);
    controlInfoFragment = '';
    stopPolling();
    stopRawPacketTimeout();
  };

  const subscribe = (callback) => {
    subscribers.add(callback);

    return {
      unsubscribe: () => {
        subscribers.delete(callback);
      },
    };
  };

  const client = {
    async connect() {
      assertWebBluetoothAvailable();

      device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [MUSE_SERVICE] }],
      });
      device.addEventListener('gattserverdisconnected', handleDisconnected);

      gatt = await device.gatt.connect();
      const service = await gatt.getPrimaryService(MUSE_SERVICE);
      const availableCharacteristicUuids = await getAvailableCharacteristicUuids(service);
      console.info('Muse service characteristic UUIDs:', availableCharacteristicUuids);

      controlCharacteristic = await getCharacteristicWithContext(
        service,
        CONTROL_CHARACTERISTIC,
        'control',
        availableCharacteristicUuids
      );
      controlCharacteristic.addEventListener('characteristicvaluechanged', logControlResponse);
      try {
        await controlCharacteristic.startNotifications();
        console.info('Subscribed to Muse control characteristic:', CONTROL_CHARACTERISTIC);
      } catch (error) {
        console.warn('Muse control notifications could not be started:', error);
      }

      const hasClassicEegCharacteristics = EEG_CHARACTERISTICS.every((characteristicId) =>
        availableCharacteristicUuids.includes(characteristicId)
      );
      const dataCharacteristicDescriptors = hasClassicEegCharacteristics
        ? EEG_CHARACTERISTICS.map((uuid, channelIndex) => ({
            uuid,
            channelIndex,
            label: ELECTRODE_LABELS[channelIndex],
            decoder: 'classic',
          }))
        : ATHENA_DATA_CHARACTERISTICS
            .filter((uuid) => availableCharacteristicUuids.includes(uuid))
            .map((uuid, channelIndex) => ({
              uuid,
              channelIndex,
              label: `Athena data ${channelIndex + 1}`,
              decoder: 'athena',
            }));

      if (!hasClassicEegCharacteristics) {
        console.warn(
          'Classic Muse EEG characteristics were not found. Falling back to Athena candidate data characteristics.',
          dataCharacteristicDescriptors.map(({ uuid }) => uuid)
        );
      }

      if (!dataCharacteristicDescriptors.length) {
        throw new Error(
          `No usable Muse data characteristics were found. Available UUIDs: ${availableCharacteristicUuids.join(', ')}`
        );
      }

      await Promise.all(
        dataCharacteristicDescriptors.map(async ({ uuid, channelIndex, label, decoder }) => {
          const characteristic = await getCharacteristicWithContext(
            service,
            uuid,
            label,
            availableCharacteristicUuids
          );
          characteristic.addEventListener('characteristicvaluechanged', (event) => {
            if (decoder === 'athena') {
              const { eegRows, packetTags } = parseAthenaDataPacket(event);
              logRawPacketSample(label, uuid, event, eegRows, {
                packetTags,
                eegRowCount: eegRows.length,
              });
              enqueueAthenaEegRows(eegRows);
              return;
            }

            const decodedSamples = decodeEegPacket(event);
            logRawPacketSample(label, uuid, event, decodedSamples);
            enqueueChannelSamples(channelIndex % channelQueues.length, decodedSamples);
          });
          await characteristic.startNotifications();
          console.info('Subscribed to Muse data characteristic:', { label, uuid });
          eegCharacteristics[channelIndex] = characteristic;
        })
      );

      return client;
    },

    async start() {
      if (!controlCharacteristic || !gatt?.connected) {
        throw new Error('Muse device is not connected.');
      }

      if (!isStarted) {
        await sendAthenaStartSequence();
        console.info('Muse stream command sequence completed:', { streamPreset });
        isStarted = true;
      }

      resetRawPacketDebugWindow();
      startPolling();
      startRawPacketTimeout();
      return client;
    },

    subscribe,

    eegReadings: {
      subscribe,
    },

    async disconnect() {
      stopPolling();
      stopRawPacketTimeout();
      subscribers.clear();
      isStarted = false;
      rawPacketLogStartedAt = null;
      rawPacketLastLoggedAt = 0;
      rawPacketDebugCompletedLogged = false;

      await Promise.all(
        eegCharacteristics.map((characteristic) =>
          characteristic?.stopNotifications?.().catch(() => undefined)
        )
      );
      eegCharacteristics.splice(0, eegCharacteristics.length);

      if (controlCharacteristic) {
        controlCharacteristic.removeEventListener('characteristicvaluechanged', logControlResponse);
        await controlCharacteristic.stopNotifications?.().catch(() => undefined);
      }

      if (device) {
        device.removeEventListener('gattserverdisconnected', handleDisconnected);
      }

      if (gatt?.connected) {
        gatt.disconnect();
      }

      controlCharacteristic = null;
      controlInfoFragment = '';
      gatt = null;
      device = null;
    },
  };

  return client;
}

export default createWebMuseClient;
