import { describe, expect, it } from 'vitest';
import {
  AUTH_STAGE_FADE_DURATION_SEC,
  LOGIN_STAGE_TRANSITIONS,
  getAuthStageFadeDurationSec,
  isAllowedLoginStageTransition,
  isKnownLoginStage,
} from './loginFlowModel';

describe('loginFlowModel', () => {
  it('keeps current auth stage fade durations', () => {
    expect(getAuthStageFadeDurationSec({ authStage: 'login', isTransitioning: false })).toBe(
      AUTH_STAGE_FADE_DURATION_SEC.default
    );
    expect(getAuthStageFadeDurationSec({ authStage: 'survey', isTransitioning: true })).toBe(
      AUTH_STAGE_FADE_DURATION_SEC.transitioning
    );
    expect(getAuthStageFadeDurationSec({ authStage: 'device-complete', isTransitioning: false })).toBe(
      AUTH_STAGE_FADE_DURATION_SEC.resultPreStage
    );
    expect(getAuthStageFadeDurationSec({ authStage: 'analysis-loading', isTransitioning: false })).toBe(
      AUTH_STAGE_FADE_DURATION_SEC.resultPreStage
    );
  });

  it('lists every current auth stage in the transition table', () => {
    const currentStages = [
      'login',
      'device-question',
      'device-live-ready',
      'measurement-duration',
      'device-connecting',
      'device-complete',
      'muse-survey',
      'device-success',
      'survey',
      'analysis-loading',
      'analysis-result',
      'warp-transition',
    ];

    expect(Object.keys(LOGIN_STAGE_TRANSITIONS).sort()).toEqual([...currentStages].sort());
    for (const stage of currentStages) {
      expect(isKnownLoginStage(stage)).toBe(true);
    }
    expect(isKnownLoginStage('solar-explorer')).toBe(false);
  });

  it('keeps the current allowed stage transition table explicit', () => {
    expect(isAllowedLoginStageTransition('login', 'device-question')).toBe(true);
    expect(isAllowedLoginStageTransition('device-question', 'device-live-ready')).toBe(true);
    expect(isAllowedLoginStageTransition('device-question', 'survey')).toBe(true);
    expect(isAllowedLoginStageTransition('device-live-ready', 'warp-transition')).toBe(true);
    expect(isAllowedLoginStageTransition('device-live-ready', 'device-question')).toBe(true);
    expect(isAllowedLoginStageTransition('measurement-duration', 'device-connecting')).toBe(true);
    expect(isAllowedLoginStageTransition('measurement-duration', 'device-question')).toBe(true);
    expect(isAllowedLoginStageTransition('device-connecting', 'device-complete')).toBe(true);
    expect(isAllowedLoginStageTransition('device-connecting', 'device-question')).toBe(true);
    expect(isAllowedLoginStageTransition('device-complete', 'muse-survey')).toBe(true);
    expect(isAllowedLoginStageTransition('muse-survey', 'device-success')).toBe(true);
    expect(isAllowedLoginStageTransition('device-success', 'warp-transition')).toBe(true);
    expect(isAllowedLoginStageTransition('survey', 'analysis-loading')).toBe(true);
    expect(isAllowedLoginStageTransition('analysis-loading', 'analysis-result')).toBe(true);
    expect(isAllowedLoginStageTransition('analysis-result', 'warp-transition')).toBe(true);
    expect(isAllowedLoginStageTransition('warp-transition', 'login')).toBe(false);
    expect(isAllowedLoginStageTransition('login', 'analysis-result')).toBe(false);
  });
});
