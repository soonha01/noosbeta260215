import { motion } from 'framer-motion';
import MuseSignalDashboard from '../../MuseSignalDashboard';
import StateSurveyResultPage from '../../StateSurveyResultPage';
import { PrismStageShell } from '../loginVisualTransitions';

const resultFrameStyle = {
  position: 'absolute',
  inset: 0,
  minHeight: 0,
  overflowY: 'auto',
  overflowX: 'hidden',
  WebkitOverflowScrolling: 'touch',
};

export const SurveyResultStage = ({
  surveyResult,
  aiInterpretation,
  resultNextStepMessage,
  isTransitioning,
  onConfirm,
  fadeDurationSec,
}) => (
  <PrismStageShell>
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: fadeDurationSec, ease: [0.16, 1, 0.3, 1] }}
      style={resultFrameStyle}
    >
      <StateSurveyResultPage
        surveyResult={surveyResult}
        aiInterpretation={aiInterpretation}
        resultNextStepMessage={resultNextStepMessage}
        isTransitioning={isTransitioning}
        onConfirm={onConfirm}
      />
    </motion.div>
  </PrismStageShell>
);

export const DeviceSuccessStage = ({
  eegData,
  fftAnalysis,
  recognitionResult,
  currentState,
  aiInterpretation,
  summary,
  resultNextStepMessage,
  measurementDurationSec,
  isTransitioning,
  onConfirm,
  fadeDurationSec,
}) => (
  <PrismStageShell>
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: fadeDurationSec, ease: [0.16, 1, 0.3, 1] }}
      style={resultFrameStyle}
    >
      <MuseSignalDashboard
        eegData={eegData}
        fftAnalysis={fftAnalysis}
        recognitionResult={recognitionResult}
        currentState={currentState}
        aiInterpretation={aiInterpretation}
        title="Muse S Athena + 설문 분석 완료"
        summary={summary}
        nextStepMessage={resultNextStepMessage}
        measurementDurationSec={measurementDurationSec}
        resultCurrentLabel="하이브리드 현재 상태"
        interpretationTitle="Hybrid State Summary"
        resultPanelTitle="Hybrid Scores"
        resultPanelSubtitle="뇌파 측정값과 설문 자기보고를 결합한 정량 지표"
        resultNextStepMessage={resultNextStepMessage}
        confirmLabel="Solar Explorer 이동"
        isTransitioning={isTransitioning}
        onConfirm={onConfirm}
      />
    </motion.div>
  </PrismStageShell>
);
