export const DeviceQuestionStage = ({ onMuseChoice }) => (
  <div className="flow-card flow-card-device">
    <p className="flow-kicker">Device Check</p>
    <h2 className="flow-title">&quot;Muse S Athena&quot;를 보유하고 계신가요?</h2>
    <p className="flow-description">
      Muse가 있으면 음악 세션 중 뇌파를 계속 측정하고, 최근 5분 상태에 맞춰 음악을 자연스럽게 조정합니다.
    </p>
    <div className="binary-actions">
      <button
        type="button"
        className="option-button option-yes"
        onClick={() => onMuseChoice('yes')}
      >
        Yes, 보유 중입니다
      </button>
      <button
        type="button"
        className="option-button option-no"
        onClick={() => onMuseChoice('no')}
      >
        No, 보유하지 않았어요
      </button>
    </div>
  </div>
);
