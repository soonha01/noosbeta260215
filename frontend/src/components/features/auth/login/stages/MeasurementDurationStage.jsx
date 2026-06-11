const measurementGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '0.75rem',
  margin: '1.25rem 0',
};

export const MeasurementDurationStage = ({
  measurementOptions,
  selectedMeasurementDurationSec,
  selectedMeasurementOption,
  onSelectMeasurementDuration,
  onBack,
  onStartMuseMeasurement,
}) => (
  <div className="flow-card flow-card-device">
    <p className="flow-kicker">Measurement Window</p>
    <h2 className="flow-title">뇌파 측정 시간을 선택해 주세요.</h2>
    <p className="flow-description">
      긴 측정일수록 EEG 반영 비율이 커지고, 짧은 측정은 설문 맥락을 더 크게 반영합니다.
    </p>

    <div style={measurementGridStyle}>
      {measurementOptions.map((option) => {
        const selected = selectedMeasurementDurationSec === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className={`option-button ${selected ? 'option-yes' : ''}`}
            onClick={() => onSelectMeasurementDuration(option.value)}
            style={{
              alignItems: 'flex-start',
              minHeight: 108,
              textAlign: 'left',
              borderColor: selected ? 'rgba(127,227,255,0.72)' : undefined,
              boxShadow: selected
                ? '0 0 0 1px rgba(127,227,255,0.32), 0 18px 44px rgba(127,227,255,0.12)'
                : undefined,
            }}
          >
            <span style={{ display: 'block', fontSize: 12, opacity: 0.62 }}>{option.title}</span>
            <span style={{ display: 'block', marginTop: 4, fontSize: 24, fontWeight: 700 }}>{option.label}</span>
            <span style={{ display: 'block', marginTop: 8, fontSize: 12, lineHeight: 1.45, opacity: 0.72 }}>
              EEG 기본 반영 {option.eegWeight}% / 설문 {100 - option.eegWeight}%
            </span>
          </button>
        );
      })}
    </div>

    <div className="binary-actions">
      <button type="button" className="option-button option-no" onClick={onBack}>
        이전
      </button>
      <button type="button" className="option-button option-yes" onClick={onStartMuseMeasurement}>
        {selectedMeasurementOption.label} 측정 시작
      </button>
    </div>
  </div>
);
