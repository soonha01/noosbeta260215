export const AUTH_STAGE_FADE_DURATION_SEC = Object.freeze({
  default: 0.5,
  transitioning: 1.95,
  resultPreStage: 1.35,
});

export const LOGIN_STAGE_TRANSITIONS = Object.freeze({
  login: ['device-question'],
  'device-question': ['device-live-ready', 'survey'],
  'device-live-ready': ['warp-transition', 'device-question'],
  'measurement-duration': ['device-connecting', 'device-question'],
  'device-connecting': ['device-complete', 'device-question'],
  'device-complete': ['muse-survey'],
  'muse-survey': ['device-success'],
  'device-success': ['warp-transition'],
  survey: ['analysis-loading'],
  'analysis-loading': ['analysis-result'],
  'analysis-result': ['warp-transition'],
  'warp-transition': [],
});

export const isKnownLoginStage = (stage) =>
  Object.prototype.hasOwnProperty.call(LOGIN_STAGE_TRANSITIONS, stage);

export const isAllowedLoginStageTransition = (fromStage, toStage) =>
  LOGIN_STAGE_TRANSITIONS[fromStage]?.includes(toStage) ?? false;

export const getAuthStageFadeDurationSec = ({ authStage, isTransitioning }) => {
  if (isTransitioning) {
    return AUTH_STAGE_FADE_DURATION_SEC.transitioning;
  }

  if (authStage === 'device-complete' || authStage === 'analysis-loading') {
    return AUTH_STAGE_FADE_DURATION_SEC.resultPreStage;
  }

  return AUTH_STAGE_FADE_DURATION_SEC.default;
};
