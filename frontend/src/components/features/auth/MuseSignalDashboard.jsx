import React, { useMemo } from 'react';
import {
  analyzeEegBands,
  CHANNEL_KEYS,
  DEFAULT_FFT_SIZE,
  DEFAULT_SAMPLE_RATE,
  getRecentChannelSeries,
} from '../../../lib/muse/signalProcessing';

const CHANNEL_COLORS = {
  TP9: '#7fe3ff',
  AF7: '#ff7fd1',
  AF8: '#efff72',
  TP10: '#52ff9a',
};

const BAND_GUIDE = [
  { key: 'delta', title: 'Delta', body: '깊은 휴식이나 회복 구간에서 상대적으로 커질 수 있는 느린 파형입니다.' },
  { key: 'theta', title: 'Theta', body: '졸림, 멍한 상태, 내적 집중과 자주 연결됩니다.' },
  { key: 'alpha', title: 'Alpha', body: '편안하지만 깨어 있는 이완 상태를 볼 때 참고합니다.' },
  { key: 'beta', title: 'Beta', body: '사고, 과제 수행, 각성된 집중과 자주 연결됩니다.' },
  { key: 'gamma', title: 'Gamma', body: '아주 빠른 성분으로 근전도나 노이즈 영향도 커서 단독 해석은 주의가 필요합니다.' },
];

const SECTION_STYLE = {
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
  background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.014))',
  boxShadow: '0 18px 48px rgba(0,0,0,0.2)',
};

const formatMicrovolts = (value) => `${value >= 0 ? '+' : ''}${value.toFixed(1)} uV`;

const createWavePath = (samples, width, height) => {
  if (!samples.length) return '';

  const amplitude = Math.max(
    1,
    ...samples.map((sample) => Math.abs(Number.isFinite(sample) ? sample : 0))
  );

  return samples
    .map((sample, index) => {
      const x = (index / Math.max(1, samples.length - 1)) * width;
      const normalized = (Number.isFinite(sample) ? sample : 0) / amplitude;
      const y = height / 2 - normalized * (height * 0.3);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
};

const WaveCard = ({ series }) => {
  const latestValue = series.samples.length ? series.samples[series.samples.length - 1] : 0;

  return (
    <article
      style={{
        padding: '10px 12px 8px',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            aria-hidden="true"
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: CHANNEL_COLORS[series.key],
              boxShadow: `0 0 14px ${CHANNEL_COLORS[series.key]}`,
            }}
          />
          <strong style={{ fontSize: 15 }}>{series.key}</strong>
        </div>
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.74)' }}>
          {formatMicrovolts(latestValue)}
        </span>
      </div>

      <svg viewBox="0 0 300 64" preserveAspectRatio="none" style={{ width: '100%', height: 64, display: 'block' }}>
        <path
          d="M 0 32 L 300 32"
          fill="none"
          stroke="rgba(255,255,255,0.11)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <path
          d={createWavePath(series.samples, 300, 64)}
          fill="none"
          stroke={CHANNEL_COLORS[series.key]}
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </article>
  );
};

const MuseSignalDashboard = ({
  eegData,
  isTransitioning,
  onConfirm,
  title = 'Muse S Athena 측정 완료',
  summary = '8초 기준선 측정이 완료되었습니다. raw 파형과 주파수 대역을 확인한 뒤 다음 단계로 이동하세요.',
  nextStepMessage = '원하시는 집중이나 감정상태에 맞는 행성을 선택해 다음 단계로 이동하세요.',
  measurementDurationSec = 8,
}) => {
  const waveformSeries = useMemo(() => getRecentChannelSeries(eegData, 120), [eegData]);
  const fftAnalysis = useMemo(
    () => analyzeEegBands(eegData, { sampleRate: DEFAULT_SAMPLE_RATE, fftSize: DEFAULT_FFT_SIZE }),
    [eegData]
  );

  const guideByKey = useMemo(
    () => Object.fromEntries(BAND_GUIDE.map((item) => [item.key, item])),
    []
  );
  const dominantGuide = fftAnalysis.dominantBand ? guideByKey[fftAnalysis.dominantBand] : null;

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '14px 16px 18px',
        color: '#f5f5f5',
        opacity: isTransitioning ? 0.55 : 1,
        transition: 'opacity 240ms ease',
        background:
          'radial-gradient(circle at top left, rgba(92,191,255,0.08), transparent 24%), linear-gradient(180deg, #050505 0%, #0a0a0a 58%, #060606 100%)',
      }}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: 1160,
          margin: '0 auto',
          padding: '16px 18px',
          borderRadius: 26,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(9,9,9,0.93)',
          boxShadow: '0 24px 90px rgba(0,0,0,0.42)',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '140px 140px',
            pointerEvents: 'none',
            maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.98), rgba(0,0,0,0.45))',
          }}
        />

        <header
          style={{
            position: 'relative',
            display: 'grid',
            gap: 10,
            marginBottom: 14,
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.46)',
              }}
            >
              Measurement Complete
            </p>
            <h2
              style={{
                margin: '8px 0 6px',
                fontSize: 'clamp(2rem, 3.2vw, 3rem)',
                lineHeight: 1.02,
              }}
            >
              {title}
            </h2>
            <p
              style={{
                margin: 0,
                maxWidth: 880,
                color: 'rgba(255,255,255,0.74)',
                lineHeight: 1.45,
              }}
            >
              {summary}
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[`${measurementDurationSec}초 측정`, `${eegData.length}개 샘플`, `${CHANNEL_KEYS.length}채널`, '고정 결과'].map(
              (item) => (
                <span
                  key={item}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'rgba(255,255,255,0.82)',
                    fontSize: 13,
                  }}
                >
                  {item}
                </span>
              )
            )}
          </div>
        </header>

        <div
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.06fr) minmax(360px, 0.94fr)',
            gap: 14,
            alignItems: 'start',
          }}
        >
          <div style={{ ...SECTION_STYLE, padding: 16, alignSelf: 'start', height: 'fit-content' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 12,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ maxWidth: 280 }}>
                <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.46)' }}>
                  RAW EEG
                </p>
                <h3 style={{ margin: '8px 0 4px', fontSize: '1.65rem', lineHeight: 1.05 }}>측정 파형</h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.68)', lineHeight: 1.42 }}>
                  측정이 끝난 기준선 구간을 고정해서 보여줍니다.
                </p>
              </div>

              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 999,
                  border: '1px solid rgba(127,227,255,0.26)',
                  color: '#7fe3ff',
                  background: 'rgba(127,227,255,0.05)',
                  fontSize: 13,
                  whiteSpace: 'nowrap',
                }}
              >
                측정 결과 스냅샷
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 10,
              }}
            >
              {waveformSeries.map((series) => (
                <WaveCard key={series.key} series={series} />
              ))}
            </div>
          </div>

          <div style={{ ...SECTION_STYLE, padding: 16, alignSelf: 'start', height: 'fit-content' }}>
            <div style={{ display: 'grid', gap: 12 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(150px, 0.62fr) minmax(0, 1.38fr)',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>우세 대역</p>
                  <p style={{ margin: '8px 0 0', fontSize: '1.85rem', fontWeight: 700 }}>
                    {dominantGuide?.title ?? '분석 중'}
                  </p>
                </div>

                <div
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>의미</p>
                  <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                    {dominantGuide?.body ?? '표시할 수 있을 만큼 충분한 샘플이 모이면 이 영역에 해석을 보여줍니다.'}
                  </p>
                </div>
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <div style={{ marginBottom: 10 }}>
                  <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.46)' }}>
                    FFT 대역 분포
                  </p>
                  <h3 style={{ margin: '8px 0 0', fontSize: '1.35rem' }}>요약 막대</h3>
                </div>

                <div style={{ display: 'grid', gap: 9 }}>
                  {fftAnalysis.bandPowers.map((band) => (
                    <article key={band.key}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          marginBottom: 5,
                        }}
                      >
                        <strong style={{ fontSize: 14 }}>{band.label}</strong>
                        <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.78)', fontSize: 12 }}>
                          {band.percent.toFixed(1)}%
                        </span>
                      </div>

                      <div
                        style={{
                          width: '100%',
                          height: 10,
                          borderRadius: 999,
                          background: 'rgba(255,255,255,0.08)',
                          overflow: 'hidden',
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            display: 'block',
                            width: `${Math.max(4, band.percent)}%`,
                            height: '100%',
                            borderRadius: 999,
                            background: `linear-gradient(90deg, ${band.color}, rgba(255,255,255,0.92))`,
                          }}
                        />
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            ...SECTION_STYLE,
            position: 'relative',
            marginTop: 14,
            padding: 14,
            alignSelf: 'start',
            height: 'fit-content',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 10,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.46)' }}>
                대역 의미 가이드
              </p>
              <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.66)', lineHeight: 1.42 }}>
                아래 설명은 각 대역이 보통 어떤 상태와 연결되는지 빠르게 읽기 위한 참고입니다.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
              gap: 10,
            }}
          >
            {BAND_GUIDE.map((guide) => (
              <article
                key={guide.key}
                style={{
                  padding: '12px 12px 10px',
                  borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.018)',
                }}
              >
                <strong style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>{guide.title}</strong>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.68)', lineHeight: 1.4, fontSize: 13 }}>
                  {guide.body}
                </p>
              </article>
            ))}
          </div>
        </div>

        <footer
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            marginTop: 14,
            paddingTop: 14,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            flexWrap: 'wrap',
          }}
        >
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.74)', lineHeight: 1.42, flex: '1 1 360px' }}>
            {nextStepMessage}
          </p>

          <button
            type="button"
            onClick={onConfirm}
            style={{
              border: 0,
              borderRadius: 14,
              padding: '14px 22px',
              fontSize: '1rem',
              background: '#f7f4ef',
              color: '#111',
              cursor: 'pointer',
              minWidth: 210,
            }}
          >
            Solar Explorer 이동
          </button>
        </footer>
      </div>
    </div>
  );
};

export default React.memo(MuseSignalDashboard);
