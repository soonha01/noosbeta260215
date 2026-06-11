const connectionPanelStyle = {
  width: 'min(100%, 520px)',
  margin: '1.25rem 0 0',
  display: 'grid',
  gap: '0.65rem',
};

const connectionBadgeStyle = {
  position: 'static',
  transform: 'none',
};

const errorTextStyle = {
  margin: 0,
  color: 'rgba(255, 146, 146, 0.88)',
  fontSize: 12,
  lineHeight: 1.5,
};

export const LiveMuseReadyStage = ({
  liveMuseConnectionStatus,
  liveMuseConnectionError,
  onStartLiveMuseConnection,
  onBack,
  onContinueToSolarExplorer,
}) => (
  <div className="flow-card flow-card-device flow-card-device-complete">
    <p className="flow-kicker">Muse Live Session</p>
    <h2 className="flow-title">Muse S Athena를 먼저 연결합니다.</h2>
    <p className="flow-description">
      이 화면에서 Bluetooth 페어링을 완료합니다. 연결되면 실시간 EEG 스트리밍을 유지하고,
      음악 세션에서는 1분 기준선 이후 5분마다 상태를 분석해 유지, 약한 조정, 크로스페이드 전환 중 하나를 적용합니다.
    </p>
    <div style={connectionPanelStyle}>
      <div className="connection-complete-badge" aria-hidden="true" style={connectionBadgeStyle}>
        <span
          className={`connection-complete-dot ${
            liveMuseConnectionStatus === 'connected' ? 'connection-complete-dot-connected' : ''
          }`}
        />
        <span className="connection-complete-label">
          {liveMuseConnectionStatus === 'connected'
            ? 'Muse Connected'
            : liveMuseConnectionStatus === 'connecting'
            ? 'bluetooth pairing · stream sync'
            : 'baseline 01:00 · analysis 05:00 · crossfade 00:05'}
        </span>
      </div>
      {liveMuseConnectionError && (
        <p style={errorTextStyle}>
          {liveMuseConnectionError}
        </p>
      )}
      {liveMuseConnectionStatus !== 'connected' && (
        <div className="binary-actions" style={{ gridTemplateColumns: '1fr' }}>
          <button
            type="button"
            className="option-button"
            onClick={onStartLiveMuseConnection}
            disabled={liveMuseConnectionStatus === 'connecting'}
          >
            {liveMuseConnectionStatus === 'connecting' ? 'Muse 연결 중...' : 'Muse Bluetooth 연결'}
          </button>
        </div>
      )}
      <div className="binary-actions">
        <button type="button" className="option-button option-no" onClick={onBack}>
          이전
        </button>
        <button
          type="button"
          className="option-button option-yes"
          onClick={onContinueToSolarExplorer}
          disabled={liveMuseConnectionStatus !== 'connected'}
          style={{
            opacity: liveMuseConnectionStatus === 'connected' ? 1 : 0.42,
            cursor: liveMuseConnectionStatus === 'connected' ? 'pointer' : 'not-allowed',
          }}
        >
          Solar Explorer 이동
        </button>
      </div>
    </div>
  </div>
);
