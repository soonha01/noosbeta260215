import { motion } from 'framer-motion';
import StateSurveyPage from '../../StateSurveyPage';
import { PrismStageShell } from '../loginVisualTransitions';

export const SurveyStage = ({
  isMuseSurvey,
  currentSurveyItem,
  surveyStepIndex,
  totalSteps,
  answeredSurveyCount,
  totalItems,
  surveyProgressPercent,
  currentSurveyAnswer,
  isLastSurveyStep,
  isSurveyComplete,
  surveyMethodNote,
  totalMeasurementDurationText,
  onSurveyOptionSelect,
  onPrev,
  onNext,
  onSubmit,
}) => (
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
        totalSteps={totalSteps}
        answeredSurveyCount={answeredSurveyCount}
        totalItems={totalItems}
        surveyProgressPercent={surveyProgressPercent}
        currentSurveyAnswer={currentSurveyAnswer}
        isLastSurveyStep={isLastSurveyStep}
        isSurveyComplete={isSurveyComplete}
        surveyMethodNote={surveyMethodNote}
        headerKicker={isMuseSurvey ? 'Hybrid Calibration' : undefined}
        headerTitle={isMuseSurvey ? '뇌파 측정값과 함께 반영할 현재 상태를 입력합니다.' : undefined}
        headerSubtitle={
          isMuseSurvey
            ? `${totalMeasurementDurationText} Muse 측정 후 자기보고 상태를 더해 최종 상태를 계산합니다.`
            : undefined
        }
        submitLabel={isMuseSurvey ? '하이브리드 분석 시작' : undefined}
        onSurveyOptionSelect={onSurveyOptionSelect}
        onPrev={onPrev}
        onNext={onNext}
        onSubmit={onSubmit}
      />
    </motion.div>
  </PrismStageShell>
);
