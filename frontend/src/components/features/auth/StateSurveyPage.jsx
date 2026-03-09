import React, { useMemo } from 'react';
import './StateSurveyPage.css';

const QUESTION_GUIDE_BY_SECTION = Object.freeze({
  kpanas: '아래 문장이 현재 감정 상태를 얼마나 잘 설명하는지 선택해 주세요.',
  kss: '현재 순간의 각성/졸림 정도를 가장 가까운 단계로 선택해 주세요.',
  pss4: '지난 7일을 떠올리며, 각 문장이 얼마나 자주 해당됐는지 선택해 주세요.',
});

const StateSurveyPage = ({
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
  onSurveyOptionSelect,
  onPrev,
  onNext,
  onSubmit,
}) => {
  const options = currentSurveyItem.options || [];
  const isDense = options.length > 6;
  const questionGuide = useMemo(
    () =>
      QUESTION_GUIDE_BY_SECTION[currentSurveyItem.sectionId] ||
      QUESTION_GUIDE_BY_SECTION.pss4,
    [currentSurveyItem.sectionId]
  );

  return (
    <div className="state-survey-page">
      <form className="state-survey-card" onSubmit={onSubmit}>
        <div className="state-survey-head">
          <p className="state-survey-kicker">Validated Survey</p>
          <h2 className="state-survey-title">현재 심리/감정 상태를 측정합니다.</h2>
          <p className="state-survey-subtitle">K-PANAS(20), KSS(1), PSS-4(4) 검증 척도 기반 설문입니다.</p>
        </div>

        <div className="state-survey-progress-row">
          <span>응답 완료 {answeredSurveyCount}/{totalItems}</span>
          <span>{surveyProgressPercent}%</span>
        </div>
        <div className="state-survey-progress-track" aria-hidden="true">
          <span className="state-survey-progress-fill" style={{ width: `${surveyProgressPercent}%` }} />
        </div>

        <div className="state-survey-question-block">
          <div className="state-survey-question-meta">
            <span className="state-survey-section">{currentSurveyItem.sectionKicker}</span>
            <span className="state-survey-index">문항 {surveyStepIndex + 1}/{totalSteps}</span>
          </div>
          <p className="state-survey-topic">{currentSurveyItem.sectionTitle}</p>
          <p className="state-survey-guide">{questionGuide}</p>
          <p className="state-survey-question">{currentSurveyItem.label}</p>
        </div>

        <div className={`state-survey-options ${isDense ? 'dense' : ''}`}>
          {options.map((option) => (
            <button
              key={`${currentSurveyItem.key}-${option.value}`}
              type="button"
              className={`state-survey-option ${currentSurveyAnswer === option.value ? 'selected' : ''}`}
              onClick={() => onSurveyOptionSelect(currentSurveyItem.key, option.value)}
            >
              <span className="state-survey-option-value">{option.value}</span>
              <span className="state-survey-option-label">{option.label}</span>
            </button>
          ))}
        </div>

        {currentSurveyAnswer !== null && (
          <p className="state-survey-selected">
            선택됨: {options.find((option) => option.value === currentSurveyAnswer)?.label}
          </p>
        )}

        <div className="state-survey-actions">
          <button type="button" className="state-survey-nav" disabled={surveyStepIndex === 0} onClick={onPrev}>
            이전
          </button>

          {!isLastSurveyStep && (
            <button type="button" className="state-survey-next" disabled={currentSurveyAnswer === null} onClick={onNext}>
              다음 문항
            </button>
          )}

          {isLastSurveyStep && (
            <button type="submit" className="state-survey-next" disabled={!isSurveyComplete}>
              설문 제출
            </button>
          )}
        </div>

        <p className="state-survey-note">{surveyMethodNote}</p>
      </form>
    </div>
  );
};

export default React.memo(StateSurveyPage);
