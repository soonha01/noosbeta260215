import { useCallback, useMemo, useState } from 'react';
import {
  STATE_SURVEY_SECTIONS,
  STATE_SURVEY_TOTAL_ITEMS,
  buildStateSurveyAnalysis,
  countAnsweredStateSurvey,
  createInitialStateSurveyAnswers,
} from '../../../../lib/stateSurvey';

export const SURVEY_ITEMS = STATE_SURVEY_SECTIONS.flatMap((section) =>
  section.questions.map((question) => ({
    ...question,
    sectionId: section.id,
    sectionKicker: section.kicker,
    sectionTitle: section.title,
    sectionDescription: section.description,
    options: question.options ?? section.options,
  }))
);

export const useLoginSurvey = () => {
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
  const currentSurveyAnswer = currentSurveyItem ? surveyAnswers[currentSurveyItem.key] : null;
  const surveyResult = useMemo(
    () => buildStateSurveyAnalysis(surveyAnswers),
    [surveyAnswers]
  );

  const resetSurvey = useCallback(() => {
    setSurveyAnswers(createInitialStateSurveyAnswers());
    setSurveyStepIndex(0);
  }, []);

  const handleSurveyAnswerChange = useCallback((key, value) => {
    setSurveyAnswers((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleSurveyStepMove = useCallback((direction) => {
    if (direction === 'prev') {
      setSurveyStepIndex((prev) => Math.max(0, prev - 1));
      return;
    }

    setSurveyStepIndex((prev) => Math.min(SURVEY_ITEMS.length - 1, prev + 1));
  }, []);

  const handleSurveyOptionSelect = useCallback((key, value) => {
    handleSurveyAnswerChange(key, value);

    if (surveyStepIndex < SURVEY_ITEMS.length - 1) {
      window.setTimeout(() => {
        setSurveyStepIndex((prev) => Math.min(SURVEY_ITEMS.length - 1, prev + 1));
      }, 90);
    }
  }, [handleSurveyAnswerChange, surveyStepIndex]);

  return {
    surveyAnswers,
    surveyStepIndex,
    answeredSurveyCount,
    isSurveyComplete,
    surveyProgressPercent,
    currentSurveyItem,
    isLastSurveyStep,
    currentSurveyAnswer,
    surveyResult,
    surveyItems: SURVEY_ITEMS,
    resetSurvey,
    handleSurveyAnswerChange,
    handleSurveyStepMove,
    handleSurveyOptionSelect,
  };
};
