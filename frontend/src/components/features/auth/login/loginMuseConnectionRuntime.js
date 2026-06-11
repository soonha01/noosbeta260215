import { createMuseClient } from '../../../../lib/muse';
import {
  attachSharedLiveMuseClient,
  updateSharedLiveMuseSession,
} from '../../../../lib/muse/liveMuseSession';
import { startEegSession } from '../../../../lib/eegAnalysisApi';
import {
  LIVE_MUSE_ANALYSIS_INTERVAL_SEC,
  LIVE_MUSE_BASELINE_DURATION_SEC,
  getMaxLocalEegBufferSize,
  saveLiveMuseSessionPreference,
} from './museSessionRuntime';
import {
  buildLiveMuseStateSnapshot,
  getLiveMuseModeConfig,
} from './loginStateSnapshots';

const pushBufferedReading = ({ reading, refs, maxEegBufferSize, scheduleEegFlush }) => {
  refs.collectedSampleCountRef.current += 1;
  refs.eegBufferRef.current.push(reading);

  if (refs.eegBufferRef.current.length > maxEegBufferSize) {
    refs.eegBufferRef.current.splice(0, refs.eegBufferRef.current.length - maxEegBufferSize);
  }

  scheduleEegFlush();
};

export const runMuseMeasurementSession = async ({
  refs,
  selectedMeasurementDurationSec,
  scheduleEegFlush,
  resetMuseStream,
  setEegUploadStats,
  setMeasurementProgressPercent,
  onAuthStageChange,
}) => {
  onAuthStageChange('device-connecting');
  resetMuseStream();

  try {
    const client = await createMuseClient({ mode: 'web' });
    refs.museClientRef.current = client;

    await client.connect();
    await client.start();

    const measuredAt = new Date().toISOString();
    refs.eegSessionMeasuredAtRef.current = measuredAt;

    try {
      const startedSession = await startEegSession({
        deviceType: 'Muse S Athena',
        measuredAt,
      });
      const eegSessionId = startedSession?.eegSessionId ?? null;
      refs.eegSessionIdRef.current = eegSessionId;
      setEegUploadStats((prev) => ({ ...prev, eegSessionId }));
    } catch (sessionError) {
      console.warn('Failed to start EEG session. Continuing with local band summary:', sessionError);
    }

    const maxEegBufferSize = getMaxLocalEegBufferSize(selectedMeasurementDurationSec);
    refs.museSubscriptionRef.current = client.subscribe((reading) => {
      pushBufferedReading({ reading, refs, maxEegBufferSize, scheduleEegFlush });
    });

    if (import.meta.env.DEV) {
      console.debug('Muse S Athena 활성화 완료');
    }
    setMeasurementProgressPercent(0);
    onAuthStageChange('device-complete');
  } catch (error) {
    console.error('Muse 기기 연결 오류:', error);
    resetMuseStream();
    onAuthStageChange('device-question');
  }
};

export const runLiveMuseConnectionSession = async ({
  mode,
  refs,
  resetMuseStream,
  scheduleEegFlush,
  setEegUploadStats,
  setLiveMuseConnectedAt,
  setLiveMuseConnectionError,
  setLiveMuseConnectionMode,
  setLiveMuseConnectionStatus,
}) => {
  const modeConfig = getLiveMuseModeConfig(mode);

  resetMuseStream();
  setLiveMuseConnectionError('');
  setLiveMuseConnectionMode(mode);
  setLiveMuseConnectionStatus('connecting');

  try {
    const client = await createMuseClient({ mode });
    refs.museClientRef.current = client;

    await client.connect();
    await client.start();

    const connectedAt = new Date().toISOString();
    refs.eegSessionMeasuredAtRef.current = connectedAt;
    setLiveMuseConnectedAt(connectedAt);

    try {
      const startedSession = await startEegSession({
        deviceType: modeConfig.deviceType,
        measuredAt: connectedAt,
      });
      const eegSessionId = startedSession?.eegSessionId ?? null;
      refs.eegSessionIdRef.current = eegSessionId;
      setEegUploadStats((prev) => ({ ...prev, eegSessionId }));
    } catch (sessionError) {
      console.warn('Failed to start live Muse EEG session. Continuing with local stream:', sessionError);
    }

    attachSharedLiveMuseClient(client, {
      mode,
      status: 'connected',
      startedAt: connectedAt,
      connectedAt,
      eegSessionId: refs.eegSessionIdRef.current,
    });
    const maxEegBufferSize = getMaxLocalEegBufferSize(
      LIVE_MUSE_BASELINE_DURATION_SEC + LIVE_MUSE_ANALYSIS_INTERVAL_SEC
    );
    refs.museSubscriptionRef.current = client.subscribe((reading) => {
      pushBufferedReading({ reading, refs, maxEegBufferSize, scheduleEegFlush });
    });

    const liveMuseSession = buildLiveMuseStateSnapshot({
      measuredAt: connectedAt,
      connectedAt,
      eegSessionId: refs.eegSessionIdRef.current,
      sampleCount: refs.collectedSampleCountRef.current,
      streamMode: mode,
    }).liveMuseSession;
    updateSharedLiveMuseSession({
      status: 'connected',
      connectedAt,
      eegSessionId: refs.eegSessionIdRef.current,
    });
    saveLiveMuseSessionPreference(liveMuseSession);
    setLiveMuseConnectionStatus('connected');

    if (import.meta.env.DEV) {
      console.debug('Muse S Athena live session connected');
    }
  } catch (error) {
    console.error('Muse live connection failed:', error);
    resetMuseStream();
    setLiveMuseConnectionStatus('error');
    setLiveMuseConnectionError(error instanceof Error ? error.message : String(error));
  }
};
