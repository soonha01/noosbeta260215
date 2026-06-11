import {
  buildFallbackCurrentStateFromBandAnalysis,
} from '../../../../lib/noosAiApi';
import { DEFAULT_FFT_SIZE, analyzeEegBands } from '../../../../lib/muse/signalProcessing';

const EEG_SAMPLE_RATE = 256;
const LIVE_BAND_COMPARE_WINDOW_SEC = 180;

export const LIVE_BAND_COMPARE_BANDS = [
  { key: 'delta', label: 'Delta', color: '#84dcc6' },
  { key: 'theta', label: 'Theta', color: '#9f86ff' },
  { key: 'alpha', label: 'Alpha', color: '#ffd166' },
  { key: 'beta', label: 'Beta', color: '#ff7b72' },
  { key: 'gamma', label: 'Gamma', color: '#7ee787' },
];

export const getBandPercent = (analysis, bandKey) => {
  const matchedBand = (analysis?.bandPowers || []).find((band) => band.key === bandKey);
  const value = Number(matchedBand?.percent);
  return Number.isFinite(value) ? value : 0;
};

export const createBandHistorySnapshot = ({ analysis, measuredAt, elapsedSec, windowSec, sequence, source }) => ({
  measuredAt,
  elapsedSec: Math.max(0, Number(elapsedSec) || 0),
  windowSec: Math.max(0, Number(windowSec) || 0),
  sequence: sequence || null,
  source: source || 'live-summary',
  sampleCount: Number(analysis?.sampleCount || 0),
  dominantBand: analysis?.dominantBand || null,
  bands: Object.fromEntries(
    LIVE_BAND_COMPARE_BANDS.map((band) => [band.key, getBandPercent(analysis, band.key)])
  ),
});

const getSnapshotBandValue = (snapshot, bandKey) => {
  const value = Number(snapshot?.bands?.[bandKey] ?? snapshot?.[bandKey]);
  return Number.isFinite(value) ? value : 0;
};

const averageBandSnapshots = (snapshots) => {
  const validSnapshots = (snapshots || []).filter(Boolean);
  if (!validSnapshots.length) return null;

  return Object.fromEntries(
    LIVE_BAND_COMPARE_BANDS.map((band) => {
      const total = validSnapshots.reduce((sum, snapshot) => sum + getSnapshotBandValue(snapshot, band.key), 0);
      return [band.key, total / validSnapshots.length];
    })
  );
};

export const createBandComparison = ({
  before,
  after,
  beforeLabel,
  afterLabel,
  sourceLabel,
  pointCount,
  pointLabel = 'windows',
}) => {
  if (!before || !after) {
    return {
      hasData: false,
      message: '실시간 EEG 요약 데이터가 아직 충분하지 않습니다.',
    };
  }

  return {
    hasData: true,
    beforeLabel,
    afterLabel,
    sourceLabel,
    pointCount,
    pointLabel,
    bands: LIVE_BAND_COMPARE_BANDS.map((band) => {
      const beforeValue = Number(before[band.key] || 0);
      const afterValue = Number(after[band.key] || 0);
      return {
        ...band,
        before: beforeValue,
        after: afterValue,
        delta: afterValue - beforeValue,
      };
    }),
  };
};

export const buildBandComparisonFromReadings = (readings, sampleRate = EEG_SAMPLE_RATE) => {
  const safeReadings = Array.isArray(readings) ? readings : [];
  const totalSec = Math.floor(safeReadings.length / sampleRate);

  if (totalSec < 5) {
    return {
      hasData: false,
      message: '최소 5초 이상 측정되면 before/after 비교가 표시됩니다.',
    };
  }

  const segmentSec = Math.min(LIVE_BAND_COMPARE_WINDOW_SEC, Math.max(5, Math.floor(totalSec / 3)));
  const segmentSamples = Math.max(64, segmentSec * sampleRate);
  const beforeReadings = safeReadings.slice(0, segmentSamples);
  const afterReadings = safeReadings.slice(-segmentSamples);
  const beforeAnalysis = analyzeEegBands(beforeReadings, {
    sampleRate,
    fftSize: DEFAULT_FFT_SIZE,
  });
  const afterAnalysis = analyzeEegBands(afterReadings, {
    sampleRate,
    fftSize: DEFAULT_FFT_SIZE,
  });

  return createBandComparison({
    before: Object.fromEntries(
      LIVE_BAND_COMPARE_BANDS.map((band) => [band.key, getBandPercent(beforeAnalysis, band.key)])
    ),
    after: Object.fromEntries(
      LIVE_BAND_COMPARE_BANDS.map((band) => [band.key, getBandPercent(afterAnalysis, band.key)])
    ),
    beforeLabel: segmentSec >= LIVE_BAND_COMPARE_WINDOW_SEC ? 'First 3 min' : `First ${segmentSec}s`,
    afterLabel: segmentSec >= LIVE_BAND_COMPARE_WINDOW_SEC ? 'Last 3 min' : `Last ${segmentSec}s`,
    sourceLabel: 'front raw buffer',
    pointCount: safeReadings.length,
    pointLabel: 'samples',
  });
};

export const buildBandComparisonFromHistory = ({ snapshots, readings, sampleRate = EEG_SAMPLE_RATE }) => {
  const validSnapshots = (snapshots || [])
    .filter((snapshot) => Number.isFinite(Number(snapshot?.elapsedSec)))
    .sort((a, b) => Number(a.elapsedSec) - Number(b.elapsedSec));

  if (validSnapshots.length >= 2) {
    const firstSnapshot = validSnapshots[0];
    const lastSnapshot = validSnapshots[validSnapshots.length - 1];
    const elapsedSpanSec = Number(lastSnapshot.elapsedSec) - Number(firstSnapshot.elapsedSec);
    let beforeSnapshots = [];
    let afterSnapshots = [];
    let beforeLabel = 'First 3 min';
    let afterLabel = 'Last 3 min';

    if (elapsedSpanSec >= LIVE_BAND_COMPARE_WINDOW_SEC * 2) {
      const beforeEdgeSec = Number(firstSnapshot.elapsedSec) + LIVE_BAND_COMPARE_WINDOW_SEC;
      const afterEdgeSec = Number(lastSnapshot.elapsedSec) - LIVE_BAND_COMPARE_WINDOW_SEC;
      beforeSnapshots = validSnapshots.filter((snapshot) => Number(snapshot.elapsedSec) <= beforeEdgeSec);
      afterSnapshots = validSnapshots.filter((snapshot) => Number(snapshot.elapsedSec) >= afterEdgeSec);
    } else {
      const segmentCount = Math.max(1, Math.ceil(validSnapshots.length * 0.34));
      beforeSnapshots = validSnapshots.slice(0, segmentCount);
      afterSnapshots = validSnapshots.slice(-segmentCount);
      beforeLabel = 'Early window';
      afterLabel = 'Late window';
    }

    const before = averageBandSnapshots(beforeSnapshots);
    const after = averageBandSnapshots(afterSnapshots);

    if (before && after) {
      return createBandComparison({
        before,
        after,
        beforeLabel,
        afterLabel,
        sourceLabel: 'live band windows',
        pointCount: validSnapshots.length,
      });
    }
  }

  return buildBandComparisonFromReadings(readings, sampleRate);
};

const buildStateAxesFromBandPercentMap = (bands) =>
  buildFallbackCurrentStateFromBandAnalysis({
    bandPowers: LIVE_BAND_COMPARE_BANDS.map((band) => ({
      ...band,
      percent: Number(bands?.[band.key] || 0),
    })),
  });

export const buildStateComparisonFromBandComparison = (comparison) => {
  if (!comparison?.hasData || !Array.isArray(comparison?.bands) || !comparison.bands.length) {
    return null;
  }

  const beforeBands = Object.fromEntries(
    comparison.bands.map((band) => [band.key, Number(band.before || 0)])
  );
  const afterBands = Object.fromEntries(
    comparison.bands.map((band) => [band.key, Number(band.after || 0)])
  );

  return {
    beforeLabel: comparison.beforeLabel || 'Before',
    afterLabel: comparison.afterLabel || 'After',
    sourceLabel: comparison.sourceLabel || null,
    pointCount: comparison.pointCount || null,
    pointLabel: comparison.pointLabel || null,
    before: buildStateAxesFromBandPercentMap(beforeBands),
    after: buildStateAxesFromBandPercentMap(afterBands),
  };
};
