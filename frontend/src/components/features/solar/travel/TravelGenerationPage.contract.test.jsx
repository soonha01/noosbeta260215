import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import TravelGenerationPage from './TravelGenerationPage';

const noop = () => {};

const baseProps = {
  planetMedia: {
    title: 'Mars',
    trackName: 'Action Orbit',
    moodTarget: 'Action drive',
    description: 'A direct action session for fast cognitive ignition.',
    image: '/media/mars-thumb.jpg',
    backgroundImage: '/media/mars-bg.jpg',
    lightingPreview: {
      primaryHex: '#ff6a2a',
      secondaryHex: '#ffd6a3',
      accentHex: '#4f46e5',
      cctKelvin: 3200,
      luxAnchor: 420,
      patternCadence: 'ramp-hold',
    },
  },
  accentColor: '#ff6a2a',
  progressPercent: 137,
  statusLines: ['상태 벡터 분석', '음악 초안 생성', '조명 프리셋 정렬'],
  activeStatusIndex: 99,
  stateSnapshot: {
    title: '높은 집중 준비',
    sourceLabel: 'Muse live session',
    canonicalState: {
      focus_readiness: 0.316,
      stress_load: 0.482,
      fatigue_risk: 0.224,
    },
  },
  errorMessage: 'AI 생성 서버가 응답하지 않습니다.',
  onRetry: noop,
  onContinueFallback: noop,
};

describe('TravelGenerationPage contract', () => {
  it('renders current generation copy, bounded progress, status fallback, and metrics', () => {
    const html = renderToStaticMarkup(<TravelGenerationPage {...baseProps} />);

    expect(html).toContain('NOOS AI Engine');
    expect(html).toContain('Mars session is aligning.');
    expect(html).toContain('현재 상태 벡터와 목표 행성 프로필을 맞춘 뒤');
    expect(html).toContain('100%');
    expect(html).toContain('조명 프리셋 정렬');
    expect(html).toContain('높은 집중 준비');
    expect(html).toContain('Action drive');
    expect(html).toContain('Muse live session');
    expect(html).toContain('Focus readiness');
    expect(html).toContain('32%');
    expect(html).toContain('Stress load');
    expect(html).toContain('48%');
    expect(html).toContain('Fatigue risk');
    expect(html).toContain('22%');
  });

  it('renders error actions and lighting preview without external services', () => {
    const html = renderToStaticMarkup(<TravelGenerationPage {...baseProps} />);

    expect(html).toContain('AI 생성 서버가 응답하지 않습니다.');
    expect(html).toContain('다시 생성하기');
    expect(html).toContain('기본 플레이어로 이동');
    expect(html).toContain('Lighting prescription');
    expect(html).toContain('3200 K');
    expect(html).toContain('420 lx');
    expect(html).toContain('ramp-hold');
  });
});
