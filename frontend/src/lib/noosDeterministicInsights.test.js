import { describe, expect, it } from 'vitest';
import {
  buildDashboardSummary,
  buildPlanetRecommendation,
  buildSessionGuide,
  buildStateBrief,
} from './noosDeterministicInsights';

describe('NOOS deterministic insights', () => {
  it('builds an empty dashboard summary without network data', () => {
    const result = buildDashboardSummary();

    expect(result).toMatchObject({
      task: 'dashboard-summary',
      response_source: 'local-deterministic',
      cached: false,
      output: {
        headline: '세션 기록을 기다리는 중',
        preferred_planets: [],
        memo_tags: [],
      },
    });
  });

  it('summarizes high feedback and memo tags deterministically', () => {
    const result = buildDashboardSummary({
      feedbackHistory: [
        { planet: 'Mars', rating: 5 },
        { planet: 'Mars', rating: 4 },
        { planet: 'Venus', rating: 3 },
      ],
      memoText: 'focus review calm',
      currentState: { focus_readiness: 0.72, stress_load: 0.33 },
    });

    expect(result.output.headline).toContain('평균 4.0점');
    expect(result.output.preferred_planets).toEqual(['Mars', 'Venus']);
    expect(result.output.memo_tags).toEqual(['focus', 'review', 'calm']);
    expect(result.output.key_axes[0]).toMatchObject({ key: 'focus_readiness', label: '집중 준비도' });
  });

  it('uses current state axes and non-diagnostic caution in state briefs', () => {
    const result = buildStateBrief({
      title: '집중 준비',
      currentState: { fatigue_risk: 0.61, relaxation_level: 0.22 },
    });

    expect(result.output.headline).toBe('집중 준비');
    expect(result.output.key_axes[0]).toMatchObject({ key: 'fatigue_risk', label: '피로 가능성' });
    expect(result.output.caution).toContain('진단이나 치료 판단이 아닙니다');
  });

  it('recommends a planet and session guide from intent text', () => {
    const recommendation = buildPlanetRecommendation({
      intentText: '논문 정리에 깊게 집중하고 싶어',
      currentState: { focus_readiness: 0.44 },
      fallbackPlanet: 'venus',
      requestedDurationSec: 900,
    });
    const guide = buildSessionGuide({
      planet: recommendation.output.recommended_planet,
      intentText: '논문 정리',
      recommendedDurationSec: recommendation.output.recommended_duration_sec,
    });

    expect(recommendation.output.recommended_planet).toBe('mars');
    expect(recommendation.output.recommended_duration_sec).toBe(600);
    expect(guide.output.session_prompt).toContain('MARS');
    expect(guide.output.setup_steps.length).toBeGreaterThan(1);
  });
});
