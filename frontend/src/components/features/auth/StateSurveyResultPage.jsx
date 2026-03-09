import React, { useMemo } from 'react';
import './StateSurveyResultPage.css';

const StateSurveyResultPage = ({
  surveyResult,
  resultNextStepMessage,
  isTransitioning,
  onConfirm,
  resultEyebrow = 'Analysis Complete',
  resultCurrentLabel = '현재 상태',
  interpretationTitle = 'State Interpretation',
  resultPanelTitle = 'Result Scores',
  resultPanelSubtitle = '검증 척도 기반 정량 지표',
  confirmLabel = '확인',
}) => {
  const parsedIndicators = useMemo(
    () =>
      (surveyResult?.keyIndicators || []).map((indicator) => {
        const matched = indicator.match(/^(.+?)\s(-?\d+(?:\/\d+)?)$/);
        if (!matched) {
          return {
            label: indicator,
            value: '',
          };
        }

        return {
          label: matched[1],
          value: matched[2],
        };
      }),
    [surveyResult?.keyIndicators]
  );

  return (
    <div className={`state-survey-result-page ${isTransitioning ? 'is-transitioning' : ''}`}>
      <div className="result-architecture-shell">
        <span className="result-light-cut result-light-cut-horizontal" aria-hidden="true" />
        <span className="result-light-cut result-light-cut-vertical" aria-hidden="true" />

        <header className="result-masthead">
          <p className="result-eyebrow">{resultEyebrow}</p>
          <div className="result-state-stack">
            <p className="result-current-label">{resultCurrentLabel}</p>
            <h2 className="result-main-title">{surveyResult.title}</h2>
          </div>
          <p className="result-header-summary">{surveyResult.summary}</p>
        </header>

        <div className="result-main-layout">
          <article className="result-conclusion-wall">
            <p className="result-panel-title">{interpretationTitle}</p>
            <p className="result-conclusion">{surveyResult.conclusion}</p>

            <div className="result-indicator-strip-grid">
              {parsedIndicators.map((indicator, index) => (
                <article className="result-indicator-strip" key={`${indicator.label}-${indicator.value}-${index}`}>
                  <p className="result-indicator-label">{indicator.label}</p>
                  <p className="result-indicator-value">{indicator.value || '-'}</p>
                </article>
              ))}
            </div>
          </article>

          <aside className="result-score-monolith" aria-label="점수 요약">
            <div className="result-panel-head">
              <p className="result-panel-title">{resultPanelTitle}</p>
              <p className="result-panel-subtitle">{resultPanelSubtitle}</p>
            </div>

            <div className="result-score-list">
              {(surveyResult?.dimensions || []).map((dimension) => (
                <article className="result-score-item" key={dimension.key}>
                  <div className="result-score-item-top">
                    <p className="result-score-name">{dimension.label}</p>
                    <p className="result-score-value">{dimension.scoreText}</p>
                  </div>
                  <div className="result-score-item-bottom">
                    <p className="result-score-detail">{dimension.detailText}</p>
                    <span className="result-score-level">{dimension.levelText}</span>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </div>

        <footer className="result-action-band">
          <p className="result-next-step">{resultNextStepMessage}</p>
          <button type="button" className="result-confirm-button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default React.memo(StateSurveyResultPage);
