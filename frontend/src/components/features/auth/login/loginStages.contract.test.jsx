// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  AnalysisLoadingStage,
  DeviceQuestionStage,
  LiveMuseReadyStage,
  LoginFormStage,
  MeasurementDurationStage,
} from './stages';

describe('login stage views', () => {
  it('renders the login form with current hooks and local bypass affordance', () => {
    const { container } = render(
      <LoginFormStage
        email="user@example.com"
        password="secret"
        isLocalTestMode={true}
        onEmailChange={vi.fn()}
        onPasswordChange={vi.fn()}
        onSubmit={(event) => event.preventDefault()}
        onGoogleLogin={vi.fn()}
        onGithubLogin={vi.fn()}
        onSkipLoginForTesting={vi.fn()}
        onSignUpClick={vi.fn()}
      />
    );

    expect(container.querySelector('.form')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Login with Google' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Login with GitHub' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '테스트로 건너뛰기' })).toBeTruthy();
  });

  it('renders the device question with the binary action hook classes', () => {
    const { container } = render(<DeviceQuestionStage onMuseChoice={vi.fn()} />);

    expect(container.querySelector('.flow-card.flow-card-device')).not.toBeNull();
    expect(container.querySelector('.binary-actions')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Yes, 보유 중입니다' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'No, 보유하지 않았어요' })).toBeTruthy();
  });

  it('keeps live Muse Solar entry disabled until connected', () => {
    const { container } = render(
      <LiveMuseReadyStage
        liveMuseConnectionStatus="idle"
        liveMuseConnectionError="Muse Bluetooth 연결을 먼저 완료해 주세요."
        onStartLiveMuseConnection={vi.fn()}
        onBack={vi.fn()}
        onContinueToSolarExplorer={vi.fn()}
      />
    );

    expect(container.querySelector('.connection-complete-badge')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Solar Explorer 이동' }).disabled).toBe(true);
    expect(screen.getByText('Muse Bluetooth 연결을 먼저 완료해 주세요.')).toBeTruthy();
  });

  it('renders measurement duration choices with selected option labels', () => {
    const options = [
      { value: 60, title: 'Short', label: '1분', eegWeight: 40 },
      { value: 180, title: 'Long', label: '3분', eegWeight: 60 },
    ];

    render(
      <MeasurementDurationStage
        measurementOptions={options}
        selectedMeasurementDurationSec={180}
        selectedMeasurementOption={options[1]}
        onSelectMeasurementDuration={vi.fn()}
        onBack={vi.fn()}
        onStartMuseMeasurement={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /3분 측정 시작/ })).toBeTruthy();
    expect(screen.getByText('EEG 기본 반영 60% / 설문 40%')).toBeTruthy();
  });

  it('renders the analysis loader with existing CSS hooks', () => {
    const { container } = render(<AnalysisLoadingStage />);

    expect(screen.getByText('현재 상태를 분석중입니다.')).toBeTruthy();
    expect(container.querySelector('.analysis-loader-shell')).not.toBeNull();
    expect(container.querySelector('.analysis-loading-track')).not.toBeNull();
  });
});
