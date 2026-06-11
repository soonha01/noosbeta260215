export const AnalysisLoadingStage = () => (
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
);
