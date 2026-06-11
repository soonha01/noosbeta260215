import {
  AUTH_ROUTES,
  createLoginPayload,
  createSignupPayload,
  redirectToOAuthProvider,
  redirectToRoute,
} from './loginAuthModel';
import {
  submitLogin,
  submitSignup,
} from './loginAuthApi';
import {
  saveCurrentStateSnapshot,
  saveLiveMuseSessionPreference,
} from './museSessionRuntime';
import {
  buildHybridMuseStateSnapshot,
  buildLiveMuseStateSnapshot,
  buildSurveyStateSnapshot,
} from './loginStateSnapshots';

const DEVICE_NO_TO_SURVEY_FADE_OUT_MS = 760;

export const useLoginAuthHandlers = ({
  backendUrl,
  name,
  email,
  password,
  isLocalTestMode,
  isTransitioning,
  authStage,
  isSurveyComplete,
  surveyResult,
  surveyAnswers,
  liveMuseConnectionStatus,
  liveMuseConnectedAt,
  liveMuseConnectionMode,
  eegSessionId,
  collectedSampleCount,
  museFftAnalysis,
  museCurrentState,
  fallbackMuseCurrentState,
  museRecognitionResult,
  totalMeasurementDurationText,
  selectedMeasurementDurationSec,
  eegUploadStats,
  setShowStepper,
  setIsTransitioning,
  setAuthStage,
  resetSurvey,
  resetLiveMuseGate,
  setLiveMuseConnectionError,
  preserveLiveMuseConnection,
}) => {
  const handleSignUpClick = () => {
    setShowStepper(true);
  };

  const handleStepperComplete = async () => {
    await submitSignup(backendUrl, createSignupPayload({ email, password, name }));

    setIsTransitioning(true);
    setTimeout(() => {
      setShowStepper(false);
      setIsTransitioning(false);
    }, 800);
  };

  const handleGoogleLogin = () => {
    redirectToOAuthProvider(backendUrl, 'google');
  };

  const handleGithubLogin = () => {
    redirectToOAuthProvider(backendUrl, 'github');
  };

  const handleLoginClick = async (event) => {
    event.preventDefault();
    const loginPayload = createLoginPayload({ email, password });

    try {
      setIsTransitioning(true);

      const loginResult = await submitLogin(backendUrl, loginPayload);

      if (loginResult.action === 'authenticated') {
        window.dispatchEvent(new Event('noos-auth-changed'));
        if (loginResult.session.role === 'ADMIN') {
          redirectToRoute(AUTH_ROUTES.admin);
          return;
        }

        setTimeout(() => {
          setAuthStage('device-question');
          setIsTransitioning(false);
        }, 500);
        return;
      }

      setIsTransitioning(false);
      alert(loginResult.alertMessage);
      if (loginResult.action === 'network-error') {
        console.error('통신 에러:', loginResult.error);
      }
    } catch (error) {
      setIsTransitioning(false);
      console.error('통신 에러:', error);
      alert('서버와 연결할 수 없습니다.');
    }
  };

  const handleSkipLoginForTesting = () => {
    if (!isLocalTestMode || isTransitioning) return;

    setIsTransitioning(true);
    window.setTimeout(() => {
      setAuthStage('device-question');
      setIsTransitioning(false);
    }, 420);
  };

  const openBoardPage = () => {
    redirectToRoute(AUTH_ROUTES.board);
  };

  const openLiveChatPage = () => {
    redirectToRoute(AUTH_ROUTES.livechat);
  };

  const handleMuseChoice = async (choice) => {
    if (isTransitioning) return;

    if (choice === 'yes') {
      setIsTransitioning(true);
      resetLiveMuseGate();
      window.setTimeout(() => {
        setAuthStage('device-live-ready');
        setIsTransitioning(false);
      }, 520);
      return;
    }

    setIsTransitioning(true);
    window.setTimeout(() => {
      resetSurvey();
      setAuthStage('survey');
      setIsTransitioning(false);
    }, DEVICE_NO_TO_SURVEY_FADE_OUT_MS);
  };

  const handleSurveySubmit = (event) => {
    event.preventDefault();
    if (!isSurveyComplete) return;
    if (authStage === 'muse-survey') {
      setAuthStage('device-success');
      return;
    }
    setAuthStage('analysis-loading');
  };

  const handleContinueToSolarExplorer = () => {
    const now = new Date().toISOString();
    if (authStage === 'device-live-ready') {
      if (liveMuseConnectionStatus !== 'connected') {
        setLiveMuseConnectionError('Muse Bluetooth 연결을 먼저 완료해 주세요.');
        return;
      }

      preserveLiveMuseConnection();
      const { liveMuseSession, currentStateSnapshot } = buildLiveMuseStateSnapshot({
        measuredAt: now,
        connectedAt: liveMuseConnectedAt || now,
        eegSessionId,
        sampleCount: collectedSampleCount,
        streamMode: liveMuseConnectionMode,
      });
      saveLiveMuseSessionPreference(liveMuseSession);
      saveCurrentStateSnapshot(currentStateSnapshot);
    } else if (authStage === 'analysis-result') {
      saveCurrentStateSnapshot(buildSurveyStateSnapshot({ surveyResult, measuredAt: now }));
    } else if (authStage === 'device-success') {
      saveCurrentStateSnapshot(buildHybridMuseStateSnapshot({
        measuredAt: now,
        surveyResult,
        surveyAnswers,
        museFftAnalysis,
        museCurrentState,
        fallbackCurrentState: fallbackMuseCurrentState,
        museRecognitionResult,
        totalMeasurementDurationText,
        selectedMeasurementDurationSec,
        eegUploadStats,
      }));
    }

    setIsTransitioning(false);
    setAuthStage('warp-transition');
  };

  return {
    handleContinueToSolarExplorer,
    handleGithubLogin,
    handleGoogleLogin,
    handleLoginClick,
    handleMuseChoice,
    handleSignUpClick,
    handleSkipLoginForTesting,
    handleStepperComplete,
    handleSurveySubmit,
    openBoardPage,
    openLiveChatPage,
  };
};
