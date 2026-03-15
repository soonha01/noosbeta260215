import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, Chrome, Github } from 'lucide-react';
import Grainient from '../../ui/effects/Grainient';
import Stepper, { Step } from './Stepper';
import BackButton from '../../ui/buttons/BackButton';
import StateSurveyPage from './StateSurveyPage';
import StateSurveyResultPage from './StateSurveyResultPage';
import {
  STATE_SURVEY_SECTIONS,
  STATE_SURVEY_TOTAL_ITEMS,
  buildStateSurveyAnalysis,
  countAnsweredStateSurvey,
  createInitialStateSurveyAnswers,
} from '../../../lib/stateSurvey';

// import { MockMuseClient } from 'muse-js'; // 기기 없을 때 -> 나중에는 web-muse로 바꿔야함

const SolarExplorer = lazy(() => import('../solar/SolarExplorer'));

const RESULT_NEXT_STEP_MESSAGE =
  '원하시는 집중이나 감정상태를 행성을 선택하여 보다 나은 환경을 만들어보세요.';
const CURRENT_STATE_STORAGE_KEY = 'noos_current_state';
const DEVICE_CONNECTION_RESULT = {
  title: 'Muse S Athena 연결 완료',
  summary: '디바이스 연결 및 신호 확인이 완료되었습니다. Solar Explorer 진입 준비가 끝났습니다.',
  conclusion:
    '연결 상태가 안정적으로 확보되었습니다. 원하시는 집중이나 감정상태를 행성을 선택하여 보다 나은 환경을 만들어보세요.',
  keyIndicators: [
    '연결 품질 100/100',
    '센서 접촉 98/100',
    '신호 안정성 96/100',
    '전송 준비도 100/100',
  ],
  dimensions: [
    {
      key: 'connection',
      label: '연결 상태',
      scoreText: 'READY',
      detailText: '하드웨어 연결 및 동기화 완료',
      levelText: '완료',
    },
    {
      key: 'signal',
      label: '신호 품질',
      scoreText: '96/100',
      detailText: '노이즈 억제 및 안정 구간 확보',
      levelText: '안정',
    },
    {
      key: 'contact',
      label: '센서 접촉',
      scoreText: '98/100',
      detailText: '전극 접촉 상태 양호',
      levelText: '양호',
    },
    {
      key: 'sync',
      label: '데이터 동기화',
      scoreText: 'LIVE',
      detailText: '실시간 데이터 스트림 준비 완료',
      levelText: '활성',
    },
  ],
};
const SURVEY_METHOD_NOTE =
  '본 결과는 K-PANAS/KSS/PSS-4 기반의 비의료적 상태 스크리닝입니다.';
const AUTH_TO_WARP_FADE_DURATION_SEC = 1.95;
const DEVICE_NO_TO_SURVEY_FADE_OUT_MS = 760;
const DEVICE_CONNECTING_STAGE_DURATION_MS = 2100;
const DEVICE_COMPLETE_STAGE_DURATION_MS = 4250;
const DEVICE_SUCCESS_FADE_IN_DURATION_SEC = 3.35;
const RESULT_PRE_STAGE_FADE_OUT_DURATION_SEC = 1.35;
const WARP_EXIT_FADE_DURATION_MS = 2300;
const SOLAR_ENTRY_FADE_IN_DURATION_SEC = 2.8;
const SOLAR_ENTRY_WARP_OVERLAY_DURATION_MS = 2200;
const WARP_SCENE_FADE_IN_DURATION_SEC = 1.5;
const WARP_STAR_COUNT = 120;
const NOOP_PLANET_SELECT = () => {};
const saveCurrentStateSnapshot = (payload) => {
  try {
    window.localStorage.setItem(CURRENT_STATE_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to save current state snapshot:', error);
  }
};
const SURVEY_ITEMS = STATE_SURVEY_SECTIONS.flatMap((section) =>
  section.questions.map((question) => ({
    ...question,
    sectionId: section.id,
    sectionKicker: section.kicker,
    sectionTitle: section.title,
    sectionDescription: section.description,
    options: question.options ?? section.options,
  }))
);

const createWarpStars = () => {
  const seededRandom = (value) => {
    const x = Math.sin(value * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  return Array.from({ length: WARP_STAR_COUNT }, (_, index) => {
    const angleRad = seededRandom(index + 1) * Math.PI * 2;
    const angleDeg = (angleRad * 180) / Math.PI;
    const distance = 220 + seededRandom(index + 27) * 1800;
    const duration = 0.68 + seededRandom(index + 53) * 0.9;
    const delay = seededRandom(index + 87) * 0.72;
    const size = 1 + seededRandom(index + 121) * 2.4;
    const opacity = 0.38 + seededRandom(index + 157) * 0.62;

    return {
      id: `warp-star-${index}`,
      angleDeg,
      distance,
      duration,
      delay,
      size,
      opacity,
    };
  });
};

const WARP_STARS = createWarpStars();
const WARP_STAR_RENDER_DATA = WARP_STARS.map((star) => ({
  id: star.id,
  style: {
    '--angle': `${star.angleDeg}deg`,
    '--distance': `${star.distance}px`,
    '--duration': `${star.duration}s`,
    '--delay': `${star.delay}s`,
    '--size': `${star.size}px`,
    '--star-opacity': `${star.opacity}`,
  },
}));

const ENTRY_WARP_STAR_RENDER_DATA = WARP_STARS.map((star) => ({
  id: `entry-${star.id}`,
  style: {
    '--angle': `${star.angleDeg}deg`,
    '--distance': `${220 + star.distance * 0.8}px`,
    '--duration': `${0.95 + star.duration * 0.5}s`,
    '--delay': `${star.delay * 0.2}s`,
    '--size': `${Math.max(1, star.size * 0.95)}px`,
    '--star-opacity': `${Math.min(1, star.opacity + 0.08)}`,
  },
}));

const SolarExplorerFallback = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: '#000000',
    }}
  />
);

const LOGIN_STAGE_GRAINIENT_PROPS = Object.freeze({
  color1: '#000000',
  color2: '#474747',
  color3: '#787878',
  timeSpeed: 0.3,
  colorBalance: 0,
  warpStrength: 1,
  warpFrequency: 5,
  warpSpeed: 2,
  warpAmplitude: 50,
  blendAngle: 0,
  blendSoftness: 0.05,
  rotationAmount: 500,
  noiseScale: 2,
  grainAmount: 0.1,
  grainScale: 2,
  grainAnimated: false,
  contrast: 1.5,
  gamma: 1,
  saturation: 1,
  centerX: 0,
  centerY: 0,
  zoom: 0.9,
});

const PrismStageShell = ({ children }) => (
  <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
    <div style={{ position: 'absolute', inset: 0 }}>
      <Grainient {...LOGIN_STAGE_GRAINIENT_PROPS} />
    </div>
    <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>{children}</div>
  </div>
);

const WarpTransitionScene = () => {
  return (
    <WarpTransitionWrapper
      initial={{ opacity: 0, scale: 1.016, filter: 'blur(6px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: WARP_SCENE_FADE_IN_DURATION_SEC, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="warp-grainient" aria-hidden="true">
        <Grainient {...LOGIN_STAGE_GRAINIENT_PROPS} />
      </div>

      <div className="warp-stars" aria-hidden="true">
        {WARP_STAR_RENDER_DATA.map((star) => (
          <span
            key={star.id}
            className="warp-star"
            style={star.style}
          />
        ))}
      </div>

      <div className="warp-core" aria-hidden="true" />

      <motion.div
        className="warp-text"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="warp-kicker">WARP DRIVE ENGAGED</p>
        <h1 className="warp-title">우주로 떠납니다.</h1>
        <p className="warp-subtitle">ENTERING SOLAR EXPLORER</p>
      </motion.div>
    </WarpTransitionWrapper>
  );
};

const SolarEntryWarpOverlay = () => {
  return (
    <SolarEntryWarpLayer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="entry-stars" aria-hidden="true">
        {ENTRY_WARP_STAR_RENDER_DATA.map((star) => (
          <span
            key={star.id}
            className="entry-star"
            style={star.style}
          />
        ))}
      </div>

      <motion.div
        className="entry-flash"
        initial={{ opacity: 0.9, scale: 0.3 }}
        animate={{ opacity: 0, scale: 1.2 }}
        transition={{ duration: 1.25, ease: [0.16, 1, 0.3, 1] }}
      />
    </SolarEntryWarpLayer>
  );
};

// 라이브러리 대신 우리가 직접 만든 가짜 기기 클래스
class MyMockMuseClient {
  constructor() {
    this.eegReadings = {
      subscribe: (callback) => {
        // 0.5초마다 가짜 뇌파 데이터를 생성해서 전달
        this.interval = setInterval(() => {
          callback({
            electrode: Math.floor(Math.random() * 4), // 0~3번 전극
            samples: Array.from({ length: 12 }, () => Math.random() * 100 - 50),
            timestamp: Date.now()
          });
        }, 500);
      }
    };
  }
  async connect() { return Promise.resolve(); } // 연결 성공 시뮬레이션
  async start() { return Promise.resolve(); }   // 시작 성공 시뮬레이션
}

const Login = ({ onBack }) => {
  const [showStepper, setShowStepper] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSolarExplorer, setShowSolarExplorer] = useState(false);
  const [showSolarEntryWarp, setShowSolarEntryWarp] = useState(false);
  const [authStage, setAuthStage] = useState('login');

  //뇌파 데이터
  const [eegData, setEegData] = useState(null);

  const warpExitTimerRef = useRef(null);

  //이름, 이메일 ,패스워드
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //Next스텝
  const [activeStep, setActiveStep] = useState(1);


  const [surveyAnswers, setSurveyAnswers] = useState(() => createInitialStateSurveyAnswers());
  const [surveyStepIndex, setSurveyStepIndex] = useState(0);

  const answeredSurveyCount = useMemo(
    () => countAnsweredStateSurvey(surveyAnswers),
    [surveyAnswers]
  );
  const isSurveyComplete = answeredSurveyCount === STATE_SURVEY_TOTAL_ITEMS;
  const surveyProgressPercent = Math.round(
    (answeredSurveyCount / Math.max(1, STATE_SURVEY_TOTAL_ITEMS)) * 100
  );
  const currentSurveyItem = SURVEY_ITEMS[surveyStepIndex];
  const isLastSurveyStep = surveyStepIndex === SURVEY_ITEMS.length - 1;
  const currentSurveyAnswer = currentSurveyItem
    ? surveyAnswers[currentSurveyItem.key]
    : null;

  const surveyResult = useMemo(
    () => buildStateSurveyAnalysis(surveyAnswers),
    [surveyAnswers]
  );
  const authStageFadeDurationSec = useMemo(() => {
    if (isTransitioning) return AUTH_TO_WARP_FADE_DURATION_SEC;
    if (authStage === 'device-complete' || authStage === 'analysis-loading') {
      return RESULT_PRE_STAGE_FADE_OUT_DURATION_SEC;
    }
    return 0.5;
  }, [authStage, isTransitioning]);

  useEffect(() => {
    const timeoutIds = [];

    if (authStage === 'device-connecting') {
      timeoutIds.push(setTimeout(() => setAuthStage('device-complete'), DEVICE_CONNECTING_STAGE_DURATION_MS));
    }

    if (authStage === 'device-complete') {
      timeoutIds.push(setTimeout(() => setAuthStage('device-success'), DEVICE_COMPLETE_STAGE_DURATION_MS));
    }

    if (authStage === 'analysis-loading') {
      timeoutIds.push(setTimeout(() => setAuthStage('analysis-result'), 2600));
    }

    if (authStage === 'warp-transition') {
      timeoutIds.push(setTimeout(() => setShowSolarExplorer(true), 4300));
    }

    return () => {
      timeoutIds.forEach((id) => clearTimeout(id));
      if (warpExitTimerRef.current) {
        clearTimeout(warpExitTimerRef.current);
        warpExitTimerRef.current = null;
      }
    };
  }, [authStage]);

  useEffect(() => {
    if (!showSolarExplorer) return undefined;

    setShowSolarEntryWarp(true);
    const timeoutId = setTimeout(() => {
      setShowSolarEntryWarp(false);
    }, SOLAR_ENTRY_WARP_OVERLAY_DURATION_MS);

    return () => clearTimeout(timeoutId);
  }, [showSolarExplorer]);

  const handleSignUpClick = () => {
    setShowStepper(true);
  };

  const handleStepperComplete = async() => {
    
    await fetch("http://localhost:8080/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      loginId: email,
      password: password,
      displayName: name
    })
  });

    setIsTransitioning(true);
    setTimeout(() => {
      setShowStepper(false);
      setIsTransitioning(false);
    }, 800);
  };

  // 백엔드의 구글 OAuth2 기본 진입점으로 리다이렉트
  const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:8080/oauth2/authorization/google'; };

  //로그인 클릭 시 백엔드 요청 POST
  const handleLoginClick = async (e) => {
  e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
  
  // 백엔드 <-> 프론트 구조 일치
  const loginPayload = {
    loginId: email,    // 사용자가 입력한 email 상태값
    password: password // 사용자가 입력한 password 상태값
  };

  try {
    setIsTransitioning(true);

    //백엔드로 로그인 요청 전송
    const response = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginPayload),
    });

    //응답 결과 처리
    if (response.ok) {
      const result = await response.text();
      
      if (result === "ok") {
        setTimeout(() => {
          setAuthStage('device-question');
          setIsTransitioning(false);
        }, 500);
      } else {
        setIsTransitioning(false);
        alert("아이디 또는 비밀번호가 올바르지 않습니다.");
      }
    } else {
      setIsTransitioning(false);
      alert("로그인 요청 중 서버 에러가 발생했습니다.");
    }
  } catch (error) {
    setIsTransitioning(false);
    console.error("통신 에러:", error);
    alert("서버와 연결할 수 없습니다.");
  }
};

//Muse기기 유무 확인
  const handleMuseChoice = async(choice) => {
    if (isTransitioning) return;

    if (choice === 'yes') {
      setAuthStage('device-connecting');

      try {
        //가짜 기기 생성 및 시작
        const client = new MyMockMuseClient();
        
        //실제 블루투스 팝업 대기 느낌을 위해 약간의 딜레이
        await new Promise(resolve => setTimeout(resolve, 800)); 
        
        await client.connect();
        await client.start();

        // 데이터 스트림 구독 (콘솔에서 확인)
        client.eegReadings.subscribe(reading => {
          //나중에 Spring Boot 웹소켓으로 쏨
          console.log("EEG Stream (Mock):", reading.samples);
          setEegData(reading.samples);
        });
        

        console.log("Muse S Athena Simulator 활성화 완료");

      } catch (error) {
        console.error("기기 시뮬레이션 오류:", error);
        setAuthStage('device-question');
      }
      return;
    }


    setIsTransitioning(true);
    window.setTimeout(() => {
      setSurveyAnswers(createInitialStateSurveyAnswers());
      setSurveyStepIndex(0);
      setAuthStage('survey');
      setIsTransitioning(false);
    }, DEVICE_NO_TO_SURVEY_FADE_OUT_MS);
  };

  const handleSurveyAnswerChange = (key, value) => {
    setSurveyAnswers((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSurveySubmit = (e) => {
    e.preventDefault();
    if (!isSurveyComplete) return;
    setAuthStage('analysis-loading');
  };

  const handleSurveyStepMove = (direction) => {
    if (direction === 'prev') {
      setSurveyStepIndex((prev) => Math.max(0, prev - 1));
      return;
    }

    setSurveyStepIndex((prev) => Math.min(SURVEY_ITEMS.length - 1, prev + 1));
  };

  const handleSurveyOptionSelect = (key, value) => {
    handleSurveyAnswerChange(key, value);

    if (surveyStepIndex < SURVEY_ITEMS.length - 1) {
      window.setTimeout(() => {
        setSurveyStepIndex((prev) => Math.min(SURVEY_ITEMS.length - 1, prev + 1));
      }, 90);
    }
  };

  const handleContinueToSolarExplorer = () => {
    const now = new Date().toISOString();
    if (authStage === 'analysis-result') {
      saveCurrentStateSnapshot({
        source: 'survey',
        sourceLabel: '설문 기반 측정',
        title: surveyResult?.title || '상태 분석 결과',
        summary: surveyResult?.summary || '',
        conclusion: surveyResult?.conclusion || '',
        dimensions: surveyResult?.dimensions || [],
        keyIndicators: surveyResult?.keyIndicators || [],
        measuredAt: now,
      });
    } else if (authStage === 'device-success') {
      saveCurrentStateSnapshot({
        source: 'muse',
        sourceLabel: 'Muse S Athena 측정',
        title: DEVICE_CONNECTION_RESULT.title,
        summary: DEVICE_CONNECTION_RESULT.summary,
        conclusion: DEVICE_CONNECTION_RESULT.conclusion,
        dimensions: DEVICE_CONNECTION_RESULT.dimensions,
        keyIndicators: DEVICE_CONNECTION_RESULT.keyIndicators,
        measuredAt: now,
      });
    }

    setIsTransitioning(true);
    if (warpExitTimerRef.current) {
      clearTimeout(warpExitTimerRef.current);
    }
    warpExitTimerRef.current = setTimeout(() => {
      setAuthStage('warp-transition');
      warpExitTimerRef.current = null;
    }, WARP_EXIT_FADE_DURATION_MS);
  };

  if (showSolarExplorer) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 1.02, y: 14, filter: 'blur(6px)' }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.99 }}
        transition={{ duration: SOLAR_ENTRY_FADE_IN_DURATION_SEC, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}
      >
        <Suspense fallback={<SolarExplorerFallback />}>
          <SolarExplorer onPlanetSelect={NOOP_PLANET_SELECT} />
        </Suspense>
        <AnimatePresence>
          {showSolarEntryWarp && <SolarEntryWarpOverlay />}
        </AnimatePresence>
      </motion.div>
    );
  }

  if (authStage === 'warp-transition') {
    return <WarpTransitionScene />;
  }

  if (authStage === 'survey' && currentSurveyItem) {
    return (
      <PrismStageShell>
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <StateSurveyPage
            currentSurveyItem={currentSurveyItem}
            surveyStepIndex={surveyStepIndex}
            totalSteps={SURVEY_ITEMS.length}
            answeredSurveyCount={answeredSurveyCount}
            totalItems={STATE_SURVEY_TOTAL_ITEMS}
            surveyProgressPercent={surveyProgressPercent}
            currentSurveyAnswer={currentSurveyAnswer}
            isLastSurveyStep={isLastSurveyStep}
            isSurveyComplete={isSurveyComplete}
            surveyMethodNote={SURVEY_METHOD_NOTE}
            onSurveyOptionSelect={handleSurveyOptionSelect}
            onPrev={() => handleSurveyStepMove('prev')}
            onNext={() => handleSurveyStepMove('next')}
            onSubmit={handleSurveySubmit}
          />
        </motion.div>
      </PrismStageShell>
    );
  }

  if (authStage === 'analysis-result') {
    return (
      <PrismStageShell>
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: DEVICE_SUCCESS_FADE_IN_DURATION_SEC, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <StateSurveyResultPage
            surveyResult={surveyResult}
            resultNextStepMessage={RESULT_NEXT_STEP_MESSAGE}
            isTransitioning={isTransitioning}
            onConfirm={handleContinueToSolarExplorer}
          />
        </motion.div>
      </PrismStageShell>
    );
  }

  if (authStage === 'device-success') {
    return (
      <PrismStageShell>
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: DEVICE_SUCCESS_FADE_IN_DURATION_SEC, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <StateSurveyResultPage
            surveyResult={DEVICE_CONNECTION_RESULT}
            resultEyebrow="Connection Complete"
            resultCurrentLabel="연결 상태"
            interpretationTitle="Connection Summary"
            resultPanelTitle="Connection Scores"
            resultPanelSubtitle="디바이스 점검 기반 정량 지표"
            resultNextStepMessage={RESULT_NEXT_STEP_MESSAGE}
            confirmLabel="Solar Explorer 이동"
            isTransitioning={isTransitioning}
            onConfirm={handleContinueToSolarExplorer}
          />
        </motion.div>
      </PrismStageShell>
    );
  }

  return (
    <PrismStageShell>
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
              <StepperWrapper>
                <Stepper
                  initialStep={1}
                  onFinalStepCompleted={handleStepperComplete}
                  backButtonText="Previous"
                  nextButtonText="Next"

                  onStepChange={(newStep) => setActiveStep(newStep)}
                  disableStepIndicators={true}
                  nextButtonProps={{
                    disabled: 
                      (activeStep === 2 && !name.trim()) || // 1단계: 이름이 비어있으면 막음
                      (activeStep === 3 && (!email.trim() || !password.trim())) // 2단계: 이메일이나 비번이 비어있으면 막음
                  }}
                >
                  <Step>
                    <h2>Welcome to Sign Up!</h2>
                    <p>Let's get you started with your account!</p>
                  </Step>
                  <Step>
                    <h2>Personal Information</h2>
                    <input
                     //회원가입->(이름입력)
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      style={{
                        width: '100%',
                        padding: '10px',
                        margin: '10px 0',
                        borderRadius: '5px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: '#fff'
                      }}
                    />
                  </Step>
                  <Step>
                    <h2>Account Details</h2>
                    <input
                    //회원가입->(이메일 입력)
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      style={{
                        width: '100%',
                        padding: '10px',
                        margin: '5px 0',
                        borderRadius: '5px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: '#fff'
                      }}
                    />
                    <input
                    ////회원가입->(비밀번호 입력)
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      style={{
                        width: '100%',
                        padding: '10px',
                        margin: '5px 0',
                        borderRadius: '5px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: '#fff'
                      }}
                    />
                  </Step>
                  <Step>
                    <h2>Welcome Aboard!</h2>
                    <p>Your account has been created successfully!</p>
                  </Step>
                </Stepper>
              </StepperWrapper>
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
                  <form className="form" onSubmit={handleLoginClick}>
                    <p className="auth-kicker">Login</p>
                    <h1 className="auth-title">Project : NOOS</h1>
                    <p className="auth-subtitle">
                      계정으로 로그인하여 개인 맞춤 몰입 환경을 시작하세요.
                    </p>

                    <div className="auth-fields">
                      <label className="auth-label" htmlFor="login-email">Email</label>
                      <input
                        id="login-email"
                        className="input auth-input"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        required

                        //이메일
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                      />

                      <label className="auth-label" htmlFor="login-password">Password</label>
                      <input
                        id="login-password"
                        className="input auth-input"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        required

                        //패스워드
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>

                    <div className="social-login">
                      <button 
                        type="button" 
                        className="social-button" 
                        aria-label="Login with Google"
                        onClick={handleGoogleLogin} // 클릭 이벤트 추가
                      >
                        <Chrome aria-hidden="true" size={16} strokeWidth={1.8} />
                      </button>

                      <button 
                        type="button" 
                        className="social-button" 
                        aria-label="Login with GitHub"
                          >
                        <Github aria-hidden="true" size={16} strokeWidth={1.8} />
                      </button>

                      <button 
                        type="button" 
                        className="social-button" 
                        aria-label="Login with Apple"
                        >
                        <Apple aria-hidden="true" size={16} strokeWidth={1.8} />
                      </button>
                    </div>

                    <div className="auth-actions">
                      <button type="submit" className="button-confirm auth-submit">
                        Let's go!
                      </button>
                    </div>

                    <p className="signup-link">
                      Don&apos;t have an account? <button type="button" className="signup-text" onClick={handleSignUpClick}>Sign Up</button>
                    </p>
                  </form>
                )}

                {authStage === 'device-question' && (
                  <div className="flow-card flow-card-device">
                    <p className="flow-kicker">Device Check</p>
                    <h2 className="flow-title">"Muse S Athena"를 보유하고 계신가요?</h2>
                    <p className="flow-description">
                      Project NOOS의 집중/감정 분석을 위해 장치 보유 여부를 먼저 확인합니다.
                    </p>
                    <div className="binary-actions">
                      <button
                        type="button"
                        className="option-button option-yes"
                        onClick={() => handleMuseChoice('yes')}
                      >
                        Yes, 보유 중입니다
                      </button>
                      <button
                        type="button"
                        className="option-button option-no"
                        onClick={() => handleMuseChoice('no')}
                      >
                        No, 보유하지 않았어요
                      </button>
                    </div>
                  </div>
                )}

                {authStage === 'device-connecting' && (
                  <div className="flow-card flow-card-analysis">
                    <p className="flow-kicker">Device Connection</p>
                    <h2 className="flow-title">Muse S Athena를 연결중입니다.</h2>

                    {/* 데이터 수신 확인용) */}
                    <p style={{ fontSize: '12px', color: '#00ff00', fontFamily: 'monospace' }}>
                      {eegData ? `Streaming: ${eegData[0].toFixed(2)}μV` : 'Initializing...'}
                    </p>
                    <p className="flow-description">
                      응답 분석과 동일한 처리 흐름으로 디바이스 상태를 점검하고 있습니다.
                    </p>
                    <div className="analysis-loader-shell" aria-hidden="true">
                      <span className="analysis-loader-ring analysis-loader-ring-1" />
                      <span className="analysis-loader-ring analysis-loader-ring-2" />
                      <span className="analysis-loader-core" />
                    </div>
                    <div className="analysis-loading-track" aria-hidden="true">
                      <span className="analysis-loading-track-fill" />
                    </div>
                    <div className="analysis-loading-meta">
                      <span>Connection</span>
                      <span>Signal</span>
                      <span>Sync</span>
                    </div>
                  </div>
                )}

                {authStage === 'device-complete' && (
                  <div className="flow-card flow-card-analysis flow-card-device-complete">
                    <p className="flow-kicker">Device Connection</p>
                    <h2 className="flow-title">연결완료!</h2>
                    <p className="flow-description">
                      Muse S Athena 연결 및 초기 동기화가 끝났습니다. 연결 상태를 불러오고 있습니다.
                    </p>
                    <div className="connection-complete-badge" aria-hidden="true">
                      <span className="connection-complete-dot" />
                      <span className="connection-complete-label">Connected</span>
                    </div>
                  </div>
                )}

                {authStage === 'analysis-loading' && (
                  <div className="flow-card flow-card-analysis">
                    <p className="flow-kicker">Mind Analysis</p>
                    <h2 className="flow-title">현재 상태를 분석중입니다.</h2>
                    <p className="flow-description">
                      응답 데이터를 기반으로 감정/집중 상태를 정리하고 있습니다.
                    </p>
                    <div className="analysis-loader-shell" aria-hidden="true">
                      <span className="analysis-loader-ring analysis-loader-ring-1" />
                      <span className="analysis-loader-ring analysis-loader-ring-2" />
                      <span className="analysis-loader-core" />
                    </div>
                    <div className="analysis-loading-track" aria-hidden="true">
                      <span className="analysis-loading-track-fill" />
                    </div>
                    <div className="analysis-loading-meta">
                      <span>Affect</span>
                      <span>Focus</span>
                      <span>Stress</span>
                    </div>
                  </div>
                )}

              </StyledWrapper>
            </motion.div>
          )}
        </AnimatePresence>
      </LoginContainer>
    </PrismStageShell>
  );
};

const WarpTransitionWrapper = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
  background: #000;

  .warp-grainient {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .warp-stars {
    position: absolute;
    inset: -22%;
    pointer-events: none;
    z-index: 1;
  }

  .warp-star {
    position: absolute;
    left: 50%;
    top: 50%;
    width: var(--size);
    height: calc(var(--size) * 9);
    transform-origin: center center;
    border-radius: 999px;
    opacity: 0;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.98) 0%,
      rgba(176, 208, 255, 0.74) 44%,
      rgba(176, 208, 255, 0) 100%
    );
    filter: drop-shadow(0 0 10px rgba(161, 203, 255, 0.68));
    animation: warpStar var(--duration) linear var(--delay) infinite;
  }

  .warp-core {
    position: absolute;
    z-index: 2;
    width: 240px;
    height: 240px;
    border-radius: 999px;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.7) 0%,
      rgba(171, 205, 255, 0.42) 24%,
      rgba(171, 205, 255, 0) 74%
    );
    filter: blur(2px);
    animation: corePulse 1.4s ease-in-out infinite alternate;
  }

  .warp-text {
    position: relative;
    z-index: 3;
    text-align: center;
    color: #fff;
    text-shadow: 0 10px 35px rgba(0, 0, 0, 0.6);
  }

  .warp-kicker {
    margin: 0 0 12px;
    font-family: "Cardinal Fruit", "SF Pro Bold", sans-serif;
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.74);
  }

  .warp-title {
    margin: 0;
    font-family: "Freesentation Black", "Freesentation Bold", sans-serif;
    font-size: clamp(34px, 5vw, 62px);
    letter-spacing: -0.02em;
    color: #fff;
  }

  .warp-subtitle {
    margin: 14px 0 0;
    font-family: "Cardinal Fruit", "SF Pro Bold", sans-serif;
    font-size: 13px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(196, 220, 255, 0.92);
  }

  @keyframes warpStar {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scaleY(0.1);
    }
    18% {
      opacity: var(--star-opacity);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateY(var(--distance)) scaleY(1.25);
    }
  }

  @keyframes corePulse {
    from {
      transform: scale(0.92);
      opacity: 0.7;
    }
    to {
      transform: scale(1.08);
      opacity: 1;
    }
  }
`;

const SolarEntryWarpLayer = styled(motion.div)`
  position: absolute;
  inset: 0;
  z-index: 80;
  pointer-events: none;
  overflow: hidden;
  background: radial-gradient(circle at 50% 50%, rgba(185, 215, 255, 0.18) 0%, rgba(12, 18, 46, 0.16) 34%, rgba(0, 0, 0, 0) 76%);
  mix-blend-mode: normal;

  .entry-stars {
    position: absolute;
    inset: -22%;
  }

  .entry-star {
    position: absolute;
    left: 50%;
    top: 50%;
    width: var(--size);
    height: calc(var(--size) * 11);
    transform-origin: center center;
    border-radius: 999px;
    opacity: 0;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 1) 0%,
      rgba(183, 212, 255, 0.74) 42%,
      rgba(183, 212, 255, 0) 100%
    );
    filter: drop-shadow(0 0 13px rgba(184, 221, 255, 0.88));
    animation: entryWarpStar var(--duration) linear var(--delay) forwards;
  }

  .entry-flash {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 300px;
    height: 300px;
    transform: translate(-50%, -50%);
    border-radius: 999px;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.88) 0%,
      rgba(205, 225, 255, 0.52) 30%,
      rgba(205, 225, 255, 0) 74%
    );
    filter: blur(2px);
  }

  @keyframes entryWarpStar {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scaleY(0.08);
    }
    16% {
      opacity: var(--star-opacity);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateY(var(--distance)) scaleY(1.55);
    }
  }
`;

const LoginContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  z-index: 10;
`;

const BackButtonWrapper = styled.div`
  position: absolute;
  top: 2rem;
  left: 2rem;
  z-index: 10;
`;

const StepperWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 600px;
  height: auto;
  max-height: 80vh;
  z-index: 1000;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;

  h2 {
    color: white;
  }

  p {
    color: rgba(255, 255, 255, 0.8);
  }

  input {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;

    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    &:focus {
      border-color: rgba(255, 255, 255, 0.78);
      background: rgba(255, 255, 255, 0.16);
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.09);
    }
  }
`;

const StyledWrapper = styled.div`
  @keyframes connectionDotPulse {
    0%, 100% {
      transform: scale(0.9);
      opacity: 0.62;
    }
    50% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes analysisRingPulse {
    0%, 100% {
      opacity: 0.32;
      transform: translate(-50%, -50%) scale(0.94);
    }
    50% {
      opacity: 0.76;
      transform: translate(-50%, -50%) scale(1.03);
    }
  }

  @keyframes analysisCorePulse {
    0%, 100% {
      transform: scale(0.82);
      opacity: 0.7;
    }
    50% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes analysisTrackScan {
    from {
      transform: translateX(-130%);
    }
    to {
      transform: translateX(260%);
    }
  }

  .form {
    width: min(100%, 560px);
    padding: 28px 30px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    border-radius: 0;
    border: 1px solid rgba(168, 168, 168, 0.45);
    background: rgba(6, 6, 6, 0.9);
    backdrop-filter: blur(14px);
    box-shadow: 0 16px 42px rgba(0, 0, 0, 0.52);
    position: relative;
    font-family: 'Freesentation', 'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .auth-kicker {
    margin: 0;
    color: rgba(255, 255, 255, 0.66);
    font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .auth-title {
    margin: 2px 0 0;
    color: #fff;
    font-family: 'Cardinal Fruit', 'Freesentation Black', sans-serif;
    font-size: clamp(30px, 3.3vw, 42px);
    letter-spacing: -0.02em;
    line-height: 1.04;
    font-weight: 500;
  }

  .auth-subtitle {
    margin: 4px 0 0;
    color: rgba(255, 255, 255, 0.74);
    font-size: 14px;
    line-height: 1.55;
    max-width: 46ch;
  }

  .auth-fields {
    margin-top: 4px;
    display: grid;
    gap: 10px;
  }

  .auth-label {
    color: rgba(255, 255, 255, 0.58);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  }

  .input.auth-input {
    width: 100%;
    height: 46px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.22);
    background: rgba(255, 255, 255, 0.05);
    font-size: 15px;
    font-weight: 500;
    color: #fff;
    padding: 0 14px;
    outline: none;
    transition: all 0.2s ease;
  }

  .input.auth-input::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  .input.auth-input:focus {
    border-color: rgba(255, 255, 255, 0.72);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.08);
  }

  .auth-actions {
    margin-top: 8px;
    display: flex;
    gap: 10px;
  }

  .social-login {
    margin-top: 8px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .social-button {
    height: 42px;
    border-radius: 0;
    border: 1px solid rgba(255, 255, 255, 0.26);
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease, color 0.2s ease;
  }

  .social-button:hover {
    border-color: rgba(255, 255, 255, 0.55);
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    transform: translateY(-1px);
  }

  .social-button:active {
    transform: scale(0.98);
  }

  .social-button svg {
    width: 16px;
    height: 16px;
  }

  .button-confirm.auth-submit {
    flex: 1;
    height: 46px;
    border-radius: 10px;
    border: 1px solid #fff;
    background: #fff;
    color: #000;
    font-family: 'Cardinal Fruit', 'Freesentation Bold', sans-serif;
    font-size: 13px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .button-confirm.auth-submit:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-1px);
  }

  .button-confirm:active {
    transform: scale(0.98);
  }

  .signup-link {
    margin: 2px 0 0;
    color: rgba(255, 255, 255, 0.68);
    font-size: 13px;
    line-height: 1.5;
    text-align: center;
    font-family: 'Freesentation', 'SF Pro', sans-serif;
  }

  .signup-text {
    padding: 0;
    margin: 0;
    border: 0;
    background: transparent;
    color: #fff;
    font-family: 'Cardinal Fruit', 'Freesentation Bold', sans-serif;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .signup-text:hover {
    color: rgba(255, 255, 255, 0.86);
  }

  .flow-card {
    --input-focus: #fff;
    color: white;
    padding: 26px;
    background: rgba(0, 0, 0, 0.9);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    max-width: 760px;
    width: 100%;
    font-family: 'Freesentation', 'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .flow-kicker {
    color: rgba(255, 255, 255, 0.65);
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 10px;
    font-weight: 700;
    font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  }

  .flow-title {
    margin: 0;
    font-size: 28px;
    line-height: 1.25;
    font-weight: 900;
    font-family: 'Freesentation Black', 'Cardinal Fruit', 'SF Pro Heavy', sans-serif;
    letter-spacing: -0.01em;
  }

  .flow-description {
    margin: 14px 0 0;
    color: rgba(255, 255, 255, 0.78);
    line-height: 1.6;
    font-size: 15px;
    font-family: 'Freesentation', 'SF Pro', sans-serif;
  }

  .flow-card-device {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02)),
      rgba(0, 0, 0, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 18px 34px rgba(0, 0, 0, 0.5);
    max-width: 780px;
  }

  .flow-card-device .flow-kicker {
    color: rgba(255, 255, 255, 0.58);
    letter-spacing: 0.14em;
  }

  .flow-card-device .flow-title {
    color: #fff;
    letter-spacing: -0.015em;
  }

  .flow-card-device .flow-description {
    color: rgba(255, 255, 255, 0.74);
  }

  .flow-card-device .binary-actions {
    margin-top: 24px;
    gap: 10px;
  }

  .flow-card-analysis {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02)),
      rgba(0, 0, 0, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.22);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.09),
      0 18px 34px rgba(0, 0, 0, 0.56);
    max-width: 780px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .flow-card-analysis .flow-kicker {
    color: rgba(255, 255, 255, 0.56);
    letter-spacing: 0.14em;
  }

  .flow-card-analysis .flow-title {
    letter-spacing: -0.015em;
  }

  .flow-card-analysis .flow-description {
    color: rgba(255, 255, 255, 0.72);
    max-width: 560px;
    margin-left: auto;
    margin-right: auto;
  }

  .flow-card-device-complete {
    min-height: 368px;
    justify-content: center;
  }

  .connection-complete-badge {
    margin-top: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 10px 16px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.06);
    border-radius: 999px;
    color: rgba(255, 255, 255, 0.92);
    font-family: 'Cardinal Fruit', 'Freesentation Bold', sans-serif;
    font-size: 12px;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  .connection-complete-dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #fff;
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.68);
    animation: connectionDotPulse 1.25s ease-in-out infinite;
  }

  .connection-complete-label {
    display: inline-block;
    transform: translateY(1px);
  }

  .analysis-loader-shell {
    margin: 28px auto 0;
    width: 102px;
    height: 102px;
    position: relative;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background:
      radial-gradient(circle at 50% 44%, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.01) 62%),
      rgba(0, 0, 0, 0.58);
    display: grid;
    place-items: center;
    overflow: hidden;
  }

  .analysis-loader-ring {
    position: absolute;
    left: 50%;
    top: 50%;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.26);
    animation: analysisRingPulse 1.8s ease-in-out infinite;
  }

  .analysis-loader-ring-1 {
    width: 54px;
    height: 54px;
  }

  .analysis-loader-ring-2 {
    width: 80px;
    height: 80px;
    animation-delay: 0.28s;
    opacity: 0.6;
  }

  .analysis-loader-core {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    background: #fff;
    box-shadow: 0 0 18px rgba(255, 255, 255, 0.56);
    animation: analysisCorePulse 1.2s ease-in-out infinite;
  }

  .analysis-loading-track {
    margin: 22px auto 0;
    width: min(100%, 520px);
    height: 6px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    overflow: hidden;
    position: relative;
  }

  .analysis-loading-track-fill {
    width: 34%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    border-radius: inherit;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0), #fff 38%, rgba(255, 255, 255, 0));
    animation: analysisTrackScan 1.55s linear infinite;
  }

  .analysis-loading-meta {
    margin: 16px auto 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    font-size: 11px;
    line-height: 1.3;
    color: rgba(255, 255, 255, 0.58);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-family: 'Cardinal Fruit', 'Freesentation Bold', sans-serif;
  }

  .binary-actions {
    display: flex;
    gap: 12px;
    margin-top: 28px;
  }

  .option-button {
    flex: 1;
    min-height: 52px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 15px;
    font-weight: 700;
    border: 1px solid rgba(255, 255, 255, 0.28);
    color: white;
    background: rgba(255, 255, 255, 0.06);
    transition: all 0.2s ease;
    font-family: 'Cardinal Fruit', 'Freesentation Bold', 'SF Pro Bold', sans-serif;
    letter-spacing: 0.01em;
  }

  .option-button:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.55);
  }

  .option-yes {
    border-color: rgba(82, 39, 255, 0.75);
    background: rgba(82, 39, 255, 0.2);
  }

  .option-no {
    border-color: rgba(255, 255, 255, 0.35);
  }

  .flow-card-device .option-button {
    border-radius: 12px;
    min-height: 54px;
    border: 1px solid rgba(255, 255, 255, 0.24);
    background: rgba(255, 255, 255, 0.02);
    color: rgba(255, 255, 255, 0.92);
    font-family: 'Cardinal Fruit', 'Freesentation Bold', sans-serif;
    font-weight: 500;
  }

  .flow-card-device .option-button:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.09);
    border-color: rgba(255, 255, 255, 0.6);
  }

  .flow-card-device .option-yes {
    border-color: rgba(255, 255, 255, 0.95);
    background: #fff;
    color: #000;
  }

  .flow-card-device .option-yes:hover {
    background: rgba(255, 255, 255, 0.92);
    border-color: rgba(255, 255, 255, 0.95);
  }

  .flow-card-device .option-no {
    border-color: rgba(255, 255, 255, 0.34);
    background: rgba(255, 255, 255, 0.02);
    color: rgba(255, 255, 255, 0.86);
  }

  @media (max-width: 640px) {
    .form,
    .flow-card {
      padding: 18px;
      max-width: 94vw;
    }

    .flow-title {
      font-size: 24px;
    }

    .analysis-loader-shell {
      width: 88px;
      height: 88px;
      margin-top: 22px;
    }

    .analysis-loading-track {
      width: 100%;
      margin-top: 18px;
    }

    .analysis-loading-meta {
      gap: 10px;
      font-size: 10px;
    }

    .binary-actions {
      flex-direction: column;
    }

    .option-button {
      width: 100%;
    }

    .auth-actions {
      flex-direction: column;
    }

    .social-login {
      grid-template-columns: 1fr;
    }

    .button-confirm.auth-submit {
      width: 100%;
    }
  }
`;

export default Login;
