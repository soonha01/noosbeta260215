import { describe, expect, it } from 'vitest';
import {
  buildFallbackPhases,
  buildLiveWaveSeries,
  buildSessionRows,
  createLiveWavePath,
  formatAxisName,
  getAxisExplanation,
  getLiveMuseStatusLabel,
  getLiveReadingValue,
  getPlanetSpinDurationSec,
  getSessionGuideCopy,
  toPercent,
} from './travelPlayerModel';

describe('travel player model helpers', () => {
  it('formats player axis labels, percentages, status labels, and planet spin timing', () => {
    expect(getPlanetSpinDurationSec(' Mars ')).toBe(15);
    expect(getPlanetSpinDurationSec('neptune')).toBe(19);
    expect(getPlanetSpinDurationSec('unknown')).toBe(15);
    expect(formatAxisName('stress_load')).toBe('Stress');
    expect(formatAxisName('new_axis')).toBe('new_axis');
    expect(getAxisExplanation('fatigue_risk')).toBe('지속 방해 피로');
    expect(toPercent(0.426)).toBe('43%');
    expect(toPercent(undefined)).toBe('0%');
    expect(getLiveMuseStatusLabel('calibrating')).toBe('기준선 수집 중');
    expect(getLiveMuseStatusLabel('custom-state')).toBe('custom-state');
    expect(getSessionGuideCopy({ llmSessionCoach: { output: { focus_frame: 'Stay with breath.' } } })).toBe(
      'Stay with breath.',
    );
    expect(getSessionGuideCopy({ llmSessionCoach: { output: { success_signal: 'Soft landing.' } } })).toBe(
      'Soft landing.',
    );
    expect(getSessionGuideCopy({})).toBe('세션 시작 전에 착용 상태와 측정 자세를 확인합니다.');
  });

  it('builds fallback and generated session rows with current duration semantics', () => {
    const planetMedia = {
      title: 'Earth',
      moodTarget: 'Balanced sustain',
    };

    expect(buildFallbackPhases(planetMedia, 120)).toEqual([
      {
        name: 'Entry',
        duration_sec: 34,
        goals: ['Earth 목표 상태로 진입'],
      },
      {
        name: 'Immersion',
        duration_sec: 53,
        goals: ['Balanced sustain'],
      },
      {
        name: 'Return',
        duration_sec: 34,
        goals: ['감각 안정화'],
      },
    ]);

    expect(buildSessionRows([], planetMedia, 120)).toEqual([
      {
        id: 'Entry-0',
        title: 'Entry',
        body: 'Earth 목표 상태로 진입',
        duration: '34s',
      },
      {
        id: 'Immersion-1',
        title: 'Immersion',
        body: 'Balanced sustain',
        duration: '53s',
      },
      {
        id: 'Return-2',
        title: 'Return',
        body: '감각 안정화',
        duration: '34s',
      },
    ]);

    expect(buildSessionRows([
      { name: 'Hold', duration_sec: 12.6, goals: ['steady', 'listen'] },
      { duration_sec: 7 },
    ], planetMedia, 120)).toEqual([
      {
        id: 'Hold-0',
        title: 'Hold',
        body: 'steady · listen',
        duration: '13s',
      },
      {
        id: 'undefined-1',
        title: 'Phase 2',
        body: '세션 목표를 정렬하는 중입니다.',
        duration: '7s',
      },
    ]);
  });

  it('builds live EEG wave series and SVG paths from channel, raw, and sample fallbacks', () => {
    expect(getLiveReadingValue({ channels: { TP9: '5.5' }, raw: { TP9: 1 }, samples: [2] }, 'TP9')).toBe(5.5);
    expect(getLiveReadingValue({ raw: { AF7: -2.25 }, samples: [0, 3] }, 'AF7')).toBe(-2.25);
    expect(getLiveReadingValue({ samples: [1, 2, 3, 4] }, 'TP10')).toBe(4);
    expect(getLiveReadingValue({ channels: { TP9: 'bad' } }, 'TP9')).toBe(0);

    const readings = Array.from({ length: 100 }, (_, index) => ({
      channels: {
        TP9: index,
        AF7: -index,
      },
      samples: [index, index + 1, index + 2, index + 3],
    }));
    const series = buildLiveWaveSeries(readings);

    expect(series).toHaveLength(4);
    expect(series[0]).toMatchObject({
      key: 'TP9',
      color: '#7fe3ff',
    });
    expect(series[0].samples).toHaveLength(50);
    expect(series[0].samples.slice(0, 4)).toEqual([0, 2, 4, 6]);
    expect(Object.is(series[1].samples[0], -0)).toBe(true);
    expect(series[1].samples.slice(1, 3)).toEqual([-2, -4]);
    expect(series[3].samples.slice(0, 3)).toEqual([3, 5, 7]);

    expect(createLiveWavePath({
      samples: [0, 5, -5],
      baselineY: 50,
      rowAmplitude: 10,
      amplitude: 5,
      plotLeft: 20,
      plotWidth: 80,
    })).toBe('M 20.00 50.00 L 60.00 40.00 L 100.00 60.00');
    expect(createLiveWavePath({
      samples: [],
      baselineY: 50,
      rowAmplitude: 10,
      amplitude: 5,
      plotLeft: 20,
      plotWidth: 80,
    })).toBe('');
  });
});
