import { describe, expect, it } from 'vitest';
import {
  LIVE_MUSE_ANALYSIS_INTERVAL_SEC,
  LIVE_MUSE_BASELINE_DURATION_SEC,
  LIVE_MUSE_CSV_TEST_ANALYSIS_INTERVAL_SEC,
  LIVE_MUSE_CSV_TEST_BASELINE_SEC,
  LIVE_MUSE_NEUTRAL_STATE,
} from './museSessionRuntime';
import {
  buildHybridMuseStateSnapshot,
  buildLiveMuseStateSnapshot,
  buildSurveyStateSnapshot,
} from './loginStateSnapshots';

const measuredAt = '2026-06-11T10:00:00.000Z';
const connectedAt = '2026-06-11T09:59:00.000Z';

const surveyResult = {
  title: '집중 준비 상태',
  summary: '주의가 안정되어 있습니다.',
  conclusion: '짧은 몰입 세션에 적합합니다.',
  dimensions: [{ key: 'focus', score: 0.7 }],
  keyIndicators: ['steady-focus'],
  canonicalState: { focus_readiness: 0.72 },
};

const surveyAnswers = {
  focus_energy: 4,
};

describe('loginStateSnapshots', () => {
  it('builds the current survey snapshot payload without storage side effects', () => {
    expect(buildSurveyStateSnapshot({ surveyResult, measuredAt })).toEqual({
      source: 'survey',
      sourceLabel: '설문 기반 측정',
      title: '집중 준비 상태',
      summary: '주의가 안정되어 있습니다.',
      conclusion: '짧은 몰입 세션에 적합합니다.',
      dimensions: [{ key: 'focus', score: 0.7 }],
      keyIndicators: ['steady-focus'],
      canonicalState: { focus_readiness: 0.72 },
      measuredAt,
    });
  });

  it('builds the current web live Muse session and state snapshot payload', () => {
    const snapshot = buildLiveMuseStateSnapshot({
      measuredAt,
      connectedAt,
      eegSessionId: 'eeg-live-1',
      sampleCount: 42,
      streamMode: 'web',
    });

    expect(snapshot.liveMuseSession).toMatchObject({
      enabled: true,
      deviceType: 'Muse S Athena',
      status: 'connected',
      connectedAt,
      eegSessionId: 'eeg-live-1',
      sampleCount: 42,
      streamMode: 'web',
      testMode: null,
      baselineDurationSec: LIVE_MUSE_BASELINE_DURATION_SEC,
      analysisIntervalSec: LIVE_MUSE_ANALYSIS_INTERVAL_SEC,
      analysisWindowSec: LIVE_MUSE_ANALYSIS_INTERVAL_SEC,
    });
    expect(snapshot.currentStateSnapshot).toMatchObject({
      source: 'muse-live',
      sourceLabel: 'Muse S Athena 실시간 측정',
      canonicalState: LIVE_MUSE_NEUTRAL_STATE,
      dominantState: 'live-session-pending',
      recognitionResult: null,
      measuredAt,
    });
    expect(snapshot.currentStateSnapshot.liveMuseSession).toBe(snapshot.liveMuseSession);
  });

  it('builds the current CSV mock live Muse session and state snapshot payload', () => {
    const snapshot = buildLiveMuseStateSnapshot({
      measuredAt,
      connectedAt,
      eegSessionId: 'eeg-mock-1',
      sampleCount: 7,
      streamMode: 'mock',
    });

    expect(snapshot.liveMuseSession).toMatchObject({
      deviceType: 'CSV Mock Muse',
      streamMode: 'mock',
      testMode: 'csv-mock',
      baselineDurationSec: LIVE_MUSE_CSV_TEST_BASELINE_SEC,
      analysisIntervalSec: LIVE_MUSE_CSV_TEST_ANALYSIS_INTERVAL_SEC,
      analysisWindowSec: LIVE_MUSE_CSV_TEST_ANALYSIS_INTERVAL_SEC,
    });
    expect(snapshot.currentStateSnapshot).toMatchObject({
      source: 'csv-mock-live',
      sourceLabel: 'CSV mock EEG test stream',
      dominantState: 'live-session-pending',
      measuredAt,
    });
  });

  it('builds the current hybrid Muse snapshot payload', () => {
    const recognitionResult = {
      state_profile: {
        label: 'Alpha readiness',
        dominant_state: 'alpha-dominant',
        summary: ['alpha 안정', 'beta 완만'],
      },
    };
    const museFftAnalysis = {
      bandPowers: [{ key: 'alpha', percent: 48 }],
    };

    expect(buildHybridMuseStateSnapshot({
      measuredAt,
      surveyResult,
      surveyAnswers,
      museFftAnalysis,
      museCurrentState: null,
      fallbackCurrentState: { focus_readiness: 0.64 },
      museRecognitionResult: recognitionResult,
      totalMeasurementDurationText: '1분',
      selectedMeasurementDurationSec: 60,
      eegUploadStats: { eegSessionId: 'eeg-1', sampleCount: 128, failed: false },
    })).toEqual({
      source: 'hybrid',
      sourceLabel: 'Muse S Athena + 설문 기반 측정',
      title: 'Alpha readiness',
      summary: 'alpha 안정 · beta 완만',
      recognitionResult,
      canonicalState: { focus_readiness: 0.64 },
      dominantState: 'alpha-dominant',
      bands: [{ key: 'alpha', percent: 48 }],
      surveyContext: {
        mode: 'muse-hybrid',
        source: 'state-survey',
        answers: surveyAnswers,
        title: '집중 준비 상태',
        summary: '주의가 안정되어 있습니다.',
        conclusion: '짧은 몰입 세션에 적합합니다.',
        dimensions: [{ key: 'focus', score: 0.7 }],
        keyIndicators: ['steady-focus'],
        canonicalState: { focus_readiness: 0.72 },
      },
      measurementDurationSec: 60,
      eegUploadStats: { eegSessionId: 'eeg-1', sampleCount: 128, failed: false },
      measuredAt,
    });
  });

  it('falls back to current hybrid labels without diagnostic wording', () => {
    const snapshot = buildHybridMuseStateSnapshot({
      measuredAt,
      surveyResult,
      surveyAnswers,
      museFftAnalysis: null,
      museCurrentState: { focus_readiness: 0.77 },
      fallbackCurrentState: { focus_readiness: 0.4 },
      museRecognitionResult: null,
      totalMeasurementDurationText: '10분',
      selectedMeasurementDurationSec: 600,
      eegUploadStats: { eegSessionId: null, sampleCount: 0, failed: true },
    });

    expect(snapshot.title).toBe('Muse S Athena Live 준비 완료');
    expect(snapshot.summary).toBe('10분 뇌파 측정과 설문 기반 상태 요약이 준비되었습니다.');
    expect(snapshot.dominantState).toBe('band-summary');
    expect(JSON.stringify(snapshot)).not.toMatch(/diagnosis|treatment|disease|medical/i);
  });
});
