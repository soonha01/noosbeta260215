export const DeviceConnectingStage = ({ latestEegValue }) => (
  <div className="flow-card flow-card-analysis">
    <p className="flow-kicker">측정 모드</p>
    <h2 className="flow-title">Muse S Athena를 연결중입니다.</h2>

    <p style={{ fontSize: '12px', color: '#00ff00', fontFamily: 'monospace' }}>
      {latestEegValue !== null ? `Streaming: ${latestEegValue.toFixed(2)}uV` : 'Initializing...'}
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
);
