import React, { lazy, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../../../ui/buttons/BackButton';
import { STATE_SURVEY_METHOD_NOTE, STATE_SURVEY_TOTAL_ITEMS } from '../../../../lib/stateSurvey';
import { useLoginSurvey } from './useLoginSurvey';
import { buildStateBrief } from '../../../../lib/noosDeterministicInsights';
import { apiUrl } from '../../../../lib/env';
import {
  DEVICE_CONNECTION_RESULT,
  MEASUREMENT_DURATION_OPTIONS,
  formatMeasurementClock,
  formatMeasurementDurationText,
} from './museSessionRuntime';
import MuseConnectionNotice from './MuseConnectionNotice';
import { PrismStageShell } from './loginVisualTransitions';
import {
  getInitialAuthStage,
  isLocalAuthTestHost,
  redirectToRoute,
  resolveAuthSession,
} from './loginAuthModel';
import { fetchCurrentAuthSession } from './loginAuthApi';
import { getAuthStageFadeDurationSec } from './loginFlowModel';
import { useLoginAuthHandlers } from './useLoginAuthHandlers';
import { useLoginMuseSession } from './useLoginMuseSession';
import { useLoginStageTimers } from './useLoginStageTimers';
import {
  AnalysisLoadingStage,
  DeviceCompleteStage,
  DeviceConnectingStage,
  DeviceQuestionStage,
  DeviceSuccessStage,
  LiveMuseReadyStage,
  LoginFormStage,
  MeasurementDurationStage,
  QuickAccessActions,
  SignupStepperStage,
  SolarExplorerStage,
  SurveyResultStage,
  SurveyStage,
  WarpTransitionStage,
} from './stages';
import {
  BackButtonWrapper,
  DeviceFloatingActions,
  DeviceFloatingButton,
  LoginContainer,
  StepperWrapper,
  StyledWrapper,
} from './LoginController.styles';

const SolarExplorer = lazy(() => import('../../solar/SolarExplorer'));

const RESULT_NEXT_STEP_MESSAGE =
  '원하시는 집중이나 감정상태를 행성을 선택하여 보다 나은 환경을 만들어보세요.';
const DEVICE_SUCCESS_FADE_IN_DURATION_SEC = 3.35;
const backendUrl = apiUrl;
const SOLAR_ENTRY_FADE_IN_DURATION_SEC = 2.8;
const NOOP_PLANET_SELECT = () => {};

const Login = ({ onBack }) => {
  const [showStepper, setShowStepper] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSolarExplorer, setShowSolarExplorer] = useState(false);
  const [showSolarEntryWarp, setShowSolarEntryWarp] = useState(false);
  const isLocalTestMode = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return isLocalAuthTestHost(window.location.hostname);
  }, []);

  //주소창을 확인해서 로그인 성공이면 바로 기기 체크 화면으로 이동
  const [authStage, setAuthStage] = useState(() => getInitialAuthStage(window.location.search));

  useEffect(() => {
    let canceled = false;

    fetchCurrentAuthSession(backendUrl)
      .then((session) => {
        if (canceled) {
          return;
        }

        const nextAuthStep = resolveAuthSession(session);
        if (nextAuthStep.action === 'redirect') {
          redirectToRoute(nextAuthStep.route);
          return;
        }

        if (nextAuthStep.action === 'stage') {
          setAuthStage(nextAuthStep.stage);
        }
      })
      .catch(() => {});

    return () => {
      canceled = true;
    };
  }, []);

  //이름, 이메일 ,패스워드
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //Next스텝
  const [activeStep, setActiveStep] = useState(1);


  const {
    surveyAnswers,
    surveyStepIndex,
    answeredSurveyCount,
    isSurveyComplete,
    surveyProgressPercent,
    currentSurveyItem,
    isLastSurveyStep,
    currentSurveyAnswer,
    surveyResult,
    surveyItems,
    resetSurvey,
    handleSurveyStepMove,
    handleSurveyOptionSelect,
  } = useLoginSurvey();
  const {
    eegData,
    measuredEegData,
    selectedMeasurementDurationSec,
    setSelectedMeasurementDurationSec,
    measurementProgressPercent,
    setMeasurementProgressPercent,
    eegUploadStats,
    museRecognitionResult,
    museCurrentState,
    fallbackMuseCurrentState,
    liveMuseConnectionStatus,
    liveMuseConnectionError,
    setLiveMuseConnectionError,
    liveMuseConnectedAt,
    liveMuseConnectionMode,
    museFftAnalysis,
    eegSessionId,
    collectedSampleCount,
    resetLiveMuseGate,
    startMuseMeasurement,
    startLiveMuseConnection,
    completeMeasurement,
    preserveLiveMuseConnection,
  } = useLoginMuseSession({
    authStage,
    isTransitioning,
    surveyResult,
    surveyAnswers,
    onAuthStageChange: setAuthStage,
  });
  const latestEegReading = eegData.length ? eegData[eegData.length - 1] : null;
  const latestEegValue = latestEegReading?.samples?.[0] ?? null;
  const resultEegData = measuredEegData.length ? measuredEegData : eegData;
  const selectedMeasurementOption = useMemo(
    () =>
      MEASUREMENT_DURATION_OPTIONS.find((option) => option.value === selectedMeasurementDurationSec) ||
      MEASUREMENT_DURATION_OPTIONS[0],
    [selectedMeasurementDurationSec]
  );
  const measuredDurationLabel = formatMeasurementClock(
    Math.round((measurementProgressPercent / 100) * selectedMeasurementDurationSec)
  );
  const totalMeasurementDurationLabel = formatMeasurementClock(selectedMeasurementDurationSec);
  const totalMeasurementDurationText = formatMeasurementDurationText(selectedMeasurementDurationSec);

  const authStageFadeDurationSec = useMemo(
    () => getAuthStageFadeDurationSec({ authStage, isTransitioning }),
    [authStage, isTransitioning]
  );

  //소셜 로그인 성공 로직 추가
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'success') {
      // 로그인 완료 플래그만 제거하고 개발/테스트용 파라미터는 유지합니다.
      const timeoutId = setTimeout(() => {
        const nextParams = new URLSearchParams(window.location.search);
        nextParams.delete('login');
        const nextSearch = nextParams.toString();
        window.history.replaceState(
          {},
          document.title,
          `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}`
        );
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, []);

  useLoginStageTimers({
    authStage,
    selectedMeasurementDurationSec,
    showSolarExplorer,
    setMeasurementProgressPercent,
    completeMeasurement,
    resetSurvey,
    setAuthStage,
    setShowSolarExplorer,
    setShowSolarEntryWarp,
  });

  const surveyStateBrief = useMemo(() => {
    if (!surveyResult?.canonicalState) {
      return null;
    }

    return buildStateBrief({
      title: surveyResult?.title || '설문 기반 상태',
      stateLabel: surveyResult?.title || '설문 기반 상태',
      summary: surveyResult?.summary || '',
      currentState: surveyResult?.canonicalState || null,
      targetPlanet: null,
    })?.output || null;
  }, [surveyResult?.canonicalState, surveyResult?.summary, surveyResult?.title]);

  const museStateBrief = useMemo(() => {
    if (!museCurrentState) {
      return null;
    }

    return buildStateBrief({
      title: museRecognitionResult?.state_profile?.label || DEVICE_CONNECTION_RESULT.title,
      stateLabel: museRecognitionResult?.state_profile?.label || DEVICE_CONNECTION_RESULT.title,
      summary:
        museRecognitionResult?.state_profile?.summary?.join(' · ') ||
        `${totalMeasurementDurationText} 측정 기반 상태 요약이 준비되었습니다.`,
      currentState: museCurrentState,
      targetPlanet: null,
    })?.output || null;
  }, [authStage, museCurrentState, museRecognitionResult?.state_profile?.label, museRecognitionResult?.state_profile?.summary, totalMeasurementDurationText]);

  const {
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
  } = useLoginAuthHandlers({
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
  });

  const liveMuseNotice = (
    <MuseConnectionNotice
      status={liveMuseConnectionStatus}
      hasBack={Boolean(onBack) && !showSolarExplorer}
    />
  );

  if (showSolarExplorer) {
    return (
      <SolarExplorerStage
        SolarExplorer={SolarExplorer}
        fadeDurationSec={SOLAR_ENTRY_FADE_IN_DURATION_SEC}
        showSolarEntryWarp={showSolarEntryWarp}
        onPlanetSelect={NOOP_PLANET_SELECT}
        liveMuseNotice={liveMuseNotice}
      />
    );
  }

  if (authStage === 'warp-transition') {
    return <WarpTransitionStage liveMuseNotice={liveMuseNotice} />;
  }

  if ((authStage === 'survey' || authStage === 'muse-survey') && currentSurveyItem) {
    const isMuseSurvey = authStage === 'muse-survey';
    return (
      <SurveyStage
        isMuseSurvey={isMuseSurvey}
        currentSurveyItem={currentSurveyItem}
        surveyStepIndex={surveyStepIndex}
        totalSteps={surveyItems.length}
        answeredSurveyCount={answeredSurveyCount}
        totalItems={STATE_SURVEY_TOTAL_ITEMS}
        surveyProgressPercent={surveyProgressPercent}
        currentSurveyAnswer={currentSurveyAnswer}
        isLastSurveyStep={isLastSurveyStep}
        isSurveyComplete={isSurveyComplete}
        surveyMethodNote={STATE_SURVEY_METHOD_NOTE}
        totalMeasurementDurationText={totalMeasurementDurationText}
        onSurveyOptionSelect={handleSurveyOptionSelect}
        onPrev={() => handleSurveyStepMove('prev')}
        onNext={() => handleSurveyStepMove('next')}
        onSubmit={handleSurveySubmit}
      />
    );
  }

  if (authStage === 'analysis-result') {
    return (
      <SurveyResultStage
        surveyResult={surveyResult}
        aiInterpretation={surveyStateBrief}
        resultNextStepMessage={RESULT_NEXT_STEP_MESSAGE}
        isTransitioning={isTransitioning}
        onConfirm={handleContinueToSolarExplorer}
        fadeDurationSec={DEVICE_SUCCESS_FADE_IN_DURATION_SEC}
      />
    );
  }

  if (authStage === 'device-success') {
    return (
      <DeviceSuccessStage
        eegData={resultEegData}
        fftAnalysis={museFftAnalysis}
        recognitionResult={museRecognitionResult}
        currentState={museCurrentState || fallbackMuseCurrentState}
        aiInterpretation={museStateBrief}
        summary={`${totalMeasurementDurationLabel} 뇌파 측정과 설문 응답을 함께 반영했습니다. 선택 시간 기준 EEG ${selectedMeasurementOption.eegWeight}% / 설문 ${100 - selectedMeasurementOption.eegWeight}%에서 신호 품질로 보정됩니다.`}
        resultNextStepMessage={RESULT_NEXT_STEP_MESSAGE}
        measurementDurationSec={selectedMeasurementDurationSec}
        isTransitioning={isTransitioning}
        onConfirm={handleContinueToSolarExplorer}
        fadeDurationSec={DEVICE_SUCCESS_FADE_IN_DURATION_SEC}
      />
    );
  }

  return (
    <PrismStageShell>
      {liveMuseNotice}
      <LoginContainer>
        {onBack && (
          <BackButtonWrapper>
            <BackButton onClick={onBack} />
          </BackButtonWrapper>
        )}

        <AnimatePresence mode="wait">
          {showStepper ? (
            <motion.div
              key="stepper"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: isTransitioning ? 0 : 1, scale: isTransitioning ? 0.95 : 1, y: isTransitioning ? 20 : 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <SignupStepperStage
                StepperWrapperComponent={StepperWrapper}
                activeStep={activeStep}
                name={name}
                email={email}
                password={password}
                onNameChange={setName}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onStepChange={setActiveStep}
                onFinalStepCompleted={handleStepperComplete}
              />
            </motion.div>
          ) : (
            <motion.div
              key={authStage}
              initial={{ opacity: 0, scale: 0.95, y: 20, filter: 'blur(0px)' }}
              animate={{
                opacity: isTransitioning ? 0 : 1,
                scale: isTransitioning ? 0.88 : 1,
                y: isTransitioning ? 40 : 0,
                filter: isTransitioning ? 'blur(8px)' : 'blur(0px)',
              }}
              exit={{ opacity: 0, scale: 0.95, y: 20, filter: 'blur(6px)' }}
              transition={{ duration: authStageFadeDurationSec, ease: "easeInOut" }}
            >
              <StyledWrapper>
                {authStage === 'login' && (
                  <LoginFormStage
                    email={email}
                    password={password}
                    isLocalTestMode={isLocalTestMode}
                    onEmailChange={setEmail}
                    onPasswordChange={setPassword}
                    onSubmit={handleLoginClick}
                    onGoogleLogin={handleGoogleLogin}
                    onGithubLogin={handleGithubLogin}
                    onSkipLoginForTesting={handleSkipLoginForTesting}
                    onSignUpClick={handleSignUpClick}
                  />
                )}

                {authStage === 'device-question' && (
                  <DeviceQuestionStage onMuseChoice={handleMuseChoice} />
                )}

                {authStage === 'device-live-ready' && (
                  <LiveMuseReadyStage
                    liveMuseConnectionStatus={liveMuseConnectionStatus}
                    liveMuseConnectionError={liveMuseConnectionError}
                    onStartLiveMuseConnection={startLiveMuseConnection}
                    onBack={() => setAuthStage('device-question')}
                    onContinueToSolarExplorer={handleContinueToSolarExplorer}
                  />
                )}

                {authStage === 'measurement-duration' && (
                  <MeasurementDurationStage
                    measurementOptions={MEASUREMENT_DURATION_OPTIONS}
                    selectedMeasurementDurationSec={selectedMeasurementDurationSec}
                    selectedMeasurementOption={selectedMeasurementOption}
                    onSelectMeasurementDuration={setSelectedMeasurementDurationSec}
                    onBack={() => setAuthStage('device-question')}
                    onStartMuseMeasurement={startMuseMeasurement}
                  />
                )}

                {authStage === 'device-connecting' && (
                  <DeviceConnectingStage latestEegValue={latestEegValue} />
                )}

                {authStage === 'device-complete' && (
                  <DeviceCompleteStage
                    totalMeasurementDurationText={totalMeasurementDurationText}
                    measurementProgressPercent={measurementProgressPercent}
                    measuredDurationLabel={measuredDurationLabel}
                    totalMeasurementDurationLabel={totalMeasurementDurationLabel}
                  />
                )}

                {authStage === 'analysis-loading' && (
                  <AnalysisLoadingStage />
                )}

              </StyledWrapper>
            </motion.div>
          )}
        </AnimatePresence>

        {authStage === 'device-question' && !showSolarExplorer && (
          <QuickAccessActions
            ActionsComponent={DeviceFloatingActions}
            ButtonComponent={DeviceFloatingButton}
            onOpenBoardPage={openBoardPage}
            onOpenLiveChatPage={openLiveChatPage}
          />
        )}

      </LoginContainer>
    </PrismStageShell>
  );
};

export default Login;
