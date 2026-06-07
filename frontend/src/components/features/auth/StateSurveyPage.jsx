import React, { useMemo } from 'react';
import {
  STATE_SURVEY_HEADER_SUBTITLE,
  STATE_SURVEY_HEADER_TITLE,
} from '../../../lib/stateSurvey';
import './StateSurveyPage.css';

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
  headerKicker = 'Validated Survey',
  headerTitle = STATE_SURVEY_HEADER_TITLE,
  headerSubtitle = STATE_SURVEY_HEADER_SUBTITLE,
  submitLabel = '설문 제출',
  onSurveyOptionSelect,
  onPrev,
  onNext,
  onSubmit,
}) => {
  const options = currentSurveyItem.options || [];
  const isDense = options.length > 6;
  const questionGuide = useMemo(
    () => currentSurveyItem.sectionDescription || '현재 상태를 가장 잘 설명하는 응답을 선택해 주세요.',
    [currentSurveyItem.sectionDescription]
  );

  return (
    <div className="state-survey-page">
      <form className="state-survey-card" onSubmit={onSubmit}>
        <div className="state-survey-head">
          <p className="state-survey-kicker">{headerKicker}</p>
          <h2 className="state-survey-title">{headerTitle}</h2>
          <p className="state-survey-subtitle">{headerSubtitle}</p>
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
              {submitLabel}
            </button>
          )}
        </div>

        <p className="state-survey-note">{surveyMethodNote}</p>
      </form>
    </div>
  );
};

export default React.memo(StateSurveyPage);
