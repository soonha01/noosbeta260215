export const DeviceCompleteStage = ({
  totalMeasurementDurationText,
  measurementProgressPercent,
  measuredDurationLabel,
  totalMeasurementDurationLabel,
}) => (
  <div className="flow-card flow-card-analysis flow-card-device-complete">
    <p className="flow-kicker">측정 모드</p>
    <h2 className="flow-title">측정을 진행 중입니다.</h2>
    <p className="flow-description">
      Muse S Athena 연결 및 초기 동기화가 끝났습니다. {totalMeasurementDurationText} 동안 뇌파를 안정적으로 수집하고 있습니다.
    </p>
    <div style={{ width: 'min(100%, 520px)', marginTop: 22 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'rgba(255,255,255,0.68)',
          marginBottom: 10,
        }}
      >
        <span>진행률</span>
        <span>{measurementProgressPercent}%</span>
      </div>
      <div
        style={{
          width: '100%',
          height: 10,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.12)',
          overflow: 'hidden',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'block',
            width: `${measurementProgressPercent}%`,
            height: '100%',
            borderRadius: 999,
            background: 'linear-gradient(90deg, rgba(127,227,255,0.55), rgba(255,255,255,0.95))',
            boxShadow: '0 0 18px rgba(127,227,255,0.45)',
            transition: 'width 120ms linear',
          }}
        />
      </div>
    </div>
    <div className="connection-complete-badge" aria-hidden="true">
      <span className="connection-complete-dot" />
      <span className="connection-complete-label">{`${measuredDurationLabel} / ${totalMeasurementDurationLabel}`}</span>
    </div>
  </div>
);
