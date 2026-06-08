import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Activity, ArrowLeft, Brain, CalendarClock, Gauge, Star } from 'lucide-react';
import styled from 'styled-components';
import {
  PLANET_MEDIA,
  TRAVEL_RECORDS_STORAGE_KEY,
} from '../../components/features/solar/travel/constants';
import { loadStorageJSON } from '../../components/features/solar/travel/storage';

const BAND_FALLBACKS = [
  { key: 'delta', label: 'Delta', color: '#84dcc6' },
  { key: 'theta', label: 'Theta', color: '#9f86ff' },
  { key: 'alpha', label: 'Alpha', color: '#ffd166' },
  { key: 'beta', label: 'Beta', color: '#ff7b72' },
  { key: 'gamma', label: 'Gamma', color: '#7ee787' },
];

const STATE_METRICS = [
  {
    key: 'focus_readiness',
    aliases: ['focusReadiness', 'focus_index', 'focusIndex'],
    label: '집중 준비도',
    description: '작업에 몰입할 준비가 된 정도',
    goodHigh: true,
  },
  {
    key: 'stress_load',
    aliases: ['stressLoad', 'stress_index', 'stressIndex'],
    label: '스트레스 지수',
    description: '긴장과 압박이 신호에 반영된 정도',
    goodHigh: false,
  },
  {
    key: 'fatigue_risk',
    aliases: ['fatigueRisk', 'fatigue_index', 'fatigueIndex'],
    label: '피로 위험도',
    description: '피로 누적 가능성이 보이는 정도',
    goodHigh: false,
  },
  {
    key: 'relaxation_level',
    aliases: ['relaxationLevel', 'relaxation_index', 'relaxationIndex'],
    label: '이완도',
    description: '몸과 마음이 풀린 정도',
    goodHigh: true,
  },
  {
    key: 'cortical_arousal',
    aliases: ['corticalArousal', 'arousal_index', 'arousalIndex'],
    label: '각성도',
    description: '두뇌 활성과 깨어있는 정도',
    goodHigh: true,
  },
  {
    key: 'mental_workload',
    aliases: ['mentalWorkload', 'workload_index', 'workloadIndex'],
    label: '인지 부하',
    description: '처리해야 하는 부담이 높은 정도',
    goodHigh: false,
  },
];

const NEUTRAL_STATE_AXES = {
  focus_readiness: 0.5,
  stress_load: 0.5,
  fatigue_risk: 0.5,
  relaxation_level: 0.5,
  cortical_arousal: 0.5,
  mental_workload: 0.5,
};

const Page = styled.main`
  min-height: 100vh;
  box-sizing: border-box;
  padding: clamp(0.75rem, 2vw, 1.45rem);
  color: #fff;
  background:
    radial-gradient(circle at 12% 6%, rgba(127, 227, 255, 0.14), transparent 28%),
    radial-gradient(circle at 86% 10%, rgba(255, 123, 114, 0.12), transparent 28%),
    linear-gradient(120deg, rgba(0, 0, 0, 0.95), rgba(8, 12, 20, 0.92)),
    #020308;
  font-family: 'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const Shell = styled.div`
  width: min(100%, 1320px);
  margin: 0 auto;
  display: grid;
  gap: 0.72rem;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

const BackLink = styled(Link)`
  min-height: 36px;
  padding: 0 0.78rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  text-decoration: none;
  font-size: 12px;
  font-weight: 850;
  backdrop-filter: blur(14px);
`;

const RouteBadge = styled.span`
  min-height: 32px;
  padding: 0 0.72rem;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.72);
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 850;
`;

const Hero = styled.header`
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 0.62rem;
  align-items: stretch;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const PlanetPreview = styled.div`
  min-height: 132px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.42)),
    url(${({ $image }) => $image});
  background-size: cover;
  background-position: center;
`;

const HeroBody = styled.div`
  min-width: 0;
  padding: clamp(0.72rem, 1.6vw, 1rem);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.035)),
    rgba(0, 0, 0, 0.34);
  display: grid;
  align-content: center;
  gap: 0.3rem;
`;

const Kicker = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.56);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

const Title = styled.h1`
  margin: 0;
  color: #fff;
  font-size: clamp(34px, 6vw, 64px);
  line-height: 0.95;
  font-weight: 850;
  letter-spacing: 0;
`;

const MetaLine = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 13px;
  line-height: 1.45;
`;

const SummaryGrid = styled.section`
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.46rem;
  align-items: stretch;
  justify-content: stretch;

  @media (max-width: 680px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryItem = styled.div`
  min-height: 58px;
  padding: 0.58rem 0.66rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  display: grid;
  align-content: space-between;
  gap: 0.22rem;
`;

const SummaryLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.36rem;
  color: rgba(255, 255, 255, 0.58);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
`;

const SummaryValue = styled.strong`
  color: #fff;
  font-size: clamp(15px, 2vw, 20px);
  line-height: 1.15;
`;

const AnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(360px, 0.9fr) minmax(520px, 1.1fr);
  gap: 0.56rem;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.section`
  min-height: 0;
  padding: clamp(0.62rem, 1.2vw, 0.82rem);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.055);
  display: grid;
  gap: 0.5rem;
  align-items: stretch;
  justify-content: stretch;
  align-content: start;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.46rem;

  @media (max-width: 640px) {
    display: grid;
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: #fff;
  font-size: clamp(18px, 2.3vw, 24px);
  line-height: 1.15;
`;

const SectionMeta = styled.p`
  margin: 0.18rem 0 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 12px;
  line-height: 1.45;
`;

const DataBadge = styled.span`
  min-height: 28px;
  padding: 0 0.66rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.78);
  font-size: 11px;
  font-weight: 850;
  white-space: nowrap;
`;

const BandRows = styled.div`
  display: grid;
  gap: 0.38rem;
`;

const BandRow = styled.div`
  display: grid;
  grid-template-columns: 68px minmax(0, 1fr) 110px;
  gap: 0.46rem;
  align-items: center;

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const BandLabel = styled.span`
  color: ${({ $color }) => $color || '#fff'};
  font-size: 12px;
  font-weight: 900;
`;

const BarStack = styled.div`
  display: grid;
  gap: 0.16rem;
`;

const BarLine = styled.div`
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 0.44rem;
  align-items: center;
`;

const BarLabel = styled.span`
  color: rgba(255, 255, 255, 0.56);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
`;

const BarTrack = styled.div`
  height: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  width: ${({ $value }) => `${Math.max(2, Math.min(100, Number($value) || 0))}%`};
  background: ${({ $color, $muted }) =>
    $muted
      ? `linear-gradient(90deg, rgba(255,255,255,0.22), ${$color || '#fff'}66)`
      : `linear-gradient(90deg, ${$color || '#fff'}99, ${$color || '#fff'})`};
`;

const Values = styled.div`
  display: grid;
  justify-items: end;
  gap: 0.12rem;
  color: rgba(255, 255, 255, 0.72);
  font-size: 11px;
  font-weight: 850;
  font-variant-numeric: tabular-nums;

  @media (max-width: 620px) {
    justify-items: start;
  }
`;

const DeltaValue = styled.span`
  color: ${({ $positive }) => ($positive ? '#7ee787' : '#ff9b9b')};
`;

const StateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.42rem;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div`
  min-height: 98px;
  padding: 0.6rem;
  border: 1px solid ${({ $color }) => `${$color || '#ffffff'}30`};
  border-radius: 8px;
  background:
    linear-gradient(135deg, ${({ $color }) => `${$color || '#ffffff'}12`}, rgba(255, 255, 255, 0.035)),
    rgba(0, 0, 0, 0.22);
  display: grid;
  gap: 0.32rem;
`;

const MetricTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.56rem;
  align-items: flex-start;
`;

const MetricName = styled.strong`
  color: #fff;
  font-size: 14px;
`;

const MetricStatus = styled.span`
  color: ${({ $color }) => $color || '#fff'};
  font-size: 11px;
  font-weight: 900;
  white-space: nowrap;
`;

const MetricDescription = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 11px;
  line-height: 1.42;
`;

const MetricBars = styled.div`
  display: grid;
  gap: 0.16rem;
`;

const MetricLine = styled.div`
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 38px;
  gap: 0.38rem;
  align-items: center;
`;

const MetricNumber = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  font-weight: 850;
  text-align: right;
  font-variant-numeric: tabular-nums;
`;

const Empty = styled.div`
  min-height: 220px;
  padding: 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.72);
  display: grid;
  align-content: center;
  line-height: 1.6;
`;

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '날짜 없음';

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatPercent = (value) => `${Math.round(Number(value || 0))}%`;

const formatDelta = (value) => {
  const rounded = Math.round(Number(value || 0));
  return `${rounded >= 0 ? '+' : ''}${rounded}%`;
};

const getRecordKey = (record, index) => String(record?.id || record?.createdAt || `record-${index}`);

const getRecordBands = (record) => {
  const bands = record?.bandComparison?.bands || record?.eegBandComparison?.bands;
  if (Array.isArray(bands) && bands.length) return bands;
  return BAND_FALLBACKS.map((band) => ({ ...band, before: 0, after: 0, delta: 0 }));
};

const normalizeAxisPercent = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 50;
  if (numeric <= 1) return Math.round(Math.max(0, Math.min(1, numeric)) * 100);
  return Math.round(Math.max(0, Math.min(100, numeric)));
};

const readMetricValue = (axes, metric) => {
  const source = axes || {};
  const value = [metric.key, ...(metric.aliases || [])]
    .map((key) => source[key])
    .find((item) => item !== undefined && item !== null);
  return normalizeAxisPercent(value ?? NEUTRAL_STATE_AXES[metric.key]);
};

const getStateAxes = (record) =>
  record?.stateAxesAfter ||
  record?.afterStateAxes ||
  record?.stateComparison?.after ||
  record?.stateAxes ||
  record?.currentState ||
  record?.canonicalState ||
  record?.state ||
  NEUTRAL_STATE_AXES;

const getStateComparison = (record) => {
  const after = getStateAxes(record);
  const before =
    record?.stateAxesBefore ||
    record?.beforeStateAxes ||
    record?.stateComparison?.before ||
    record?.initialStateAxes ||
    NEUTRAL_STATE_AXES;

  return {
    before,
    after,
    beforeLabel: record?.stateComparison?.beforeLabel || 'Before',
    afterLabel: record?.stateComparison?.afterLabel || 'After',
  };
};

const getMetricColor = (metric, value) => {
  if (metric.goodHigh) {
    if (value >= 70) return '#7ee787';
    if (value >= 42) return '#ffd166';
    return '#ff9b9b';
  }

  if (value >= 70) return '#ff9b9b';
  if (value >= 42) return '#ffd166';
  return '#7ee787';
};

const getMetricStatus = (metric, value) => {
  if (metric.goodHigh) {
    if (value >= 70) return '좋음';
    if (value >= 42) return '보통';
    return '낮음';
  }

  if (value >= 70) return '높음';
  if (value >= 42) return '보통';
  return '낮음';
};

const findDominantBand = (bands) =>
  (bands || []).reduce((strongest, band) => {
    if (!strongest) return band;
    return Number(band.after || 0) > Number(strongest.after || 0) ? band : strongest;
  }, null);

export default function TravelRecordDetailPage() {
  const { recordId } = useParams();
  const records = useMemo(() => loadStorageJSON(TRAVEL_RECORDS_STORAGE_KEY, []), []);
  const safeRecords = Array.isArray(records) ? records : [];
  const decodedRecordId = decodeURIComponent(recordId || '');
  const record = safeRecords.find((item, index) => getRecordKey(item, index) === decodedRecordId);

  if (!record) {
    return (
      <Page>
        <Shell>
          <BackLink to="/travel-records">
            <ArrowLeft size={15} aria-hidden="true" /> 나의 여행기록
          </BackLink>
          <Empty>해당 여행기록을 찾을 수 없습니다.</Empty>
        </Shell>
      </Page>
    );
  }

  const planetSlug = String(record.planetSlug || record.planet || 'mars').toLowerCase();
  const planetMedia = PLANET_MEDIA[planetSlug] || PLANET_MEDIA.mars;
  const bands = getRecordBands(record);
  const comparison = record.bandComparison || record.eegBandComparison || null;
  const dominantBand = findDominantBand(bands);
  const stateComparison = getStateComparison(record);
  const metricValues = STATE_METRICS.map((metric) => {
    const before = readMetricValue(stateComparison.before, metric);
    const after = readMetricValue(stateComparison.after, metric);
    return {
      ...metric,
      before,
      after,
      delta: after - before,
    };
  });
  const dominantMetric = metricValues.reduce((strongest, metric) => {
    if (!strongest) return metric;
    return metric.after > strongest.after ? metric : strongest;
  }, null);
  const biggestChange = metricValues.reduce((strongest, metric) => {
    if (!strongest) return metric;
    return Math.abs(metric.delta) > Math.abs(strongest.delta) ? metric : strongest;
  }, null);
  const durationMin = Math.max(0, Math.round(Number(record.sessionDurationSec || 0) / 60));

  return (
    <Page>
      <Shell>
        <TopBar>
          <BackLink to="/travel-records">
            <ArrowLeft size={15} aria-hidden="true" /> 나의 여행기록
          </BackLink>
          <RouteBadge>{comparison?.hasData === false ? '측정 데이터 부족' : 'Before / After 분석'}</RouteBadge>
        </TopBar>

        <Hero>
          <PlanetPreview $image={planetMedia.image} />
          <HeroBody>
            <Kicker>Journey detail</Kicker>
            <Title>{planetMedia.title || record.planet}</Title>
            <MetaLine>
              {formatDate(record.createdAt)}
              {record.trackName || planetMedia.trackName ? ` · ${record.trackName || planetMedia.trackName}` : ''}
            </MetaLine>
            <MetaLine>
              {record.moodTarget || planetMedia.moodTarget}
              {durationMin ? ` · ${durationMin}분 여행` : ''}
            </MetaLine>
          </HeroBody>
        </Hero>

        <SummaryGrid>
          <SummaryItem>
            <SummaryLabel>
              <CalendarClock size={14} aria-hidden="true" /> 여행 시간
            </SummaryLabel>
            <SummaryValue>{formatDate(record.createdAt)}</SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>
              <Activity size={14} aria-hidden="true" /> 우세 EEG
            </SummaryLabel>
            <SummaryValue>
              {dominantBand?.label || '데이터 없음'} {dominantBand ? formatPercent(dominantBand.after) : ''}
            </SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>
              <Brain size={14} aria-hidden="true" /> 상태 변화
            </SummaryLabel>
            <SummaryValue>
              {biggestChange?.label || '상태값 없음'} {biggestChange ? formatDelta(biggestChange.delta) : ''}
            </SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>
              <Star size={14} aria-hidden="true" /> 점수
            </SummaryLabel>
            <SummaryValue>{record.rating ? `${record.rating}/5점` : '점수 없음'}</SummaryValue>
          </SummaryItem>
        </SummaryGrid>

        <AnalysisGrid>
          <Section>
            <SectionHeader>
              <div>
                <SectionTitle>Before / After 뇌파 밴드</SectionTitle>
                <SectionMeta>
                  {comparison?.beforeLabel || 'Before'} vs {comparison?.afterLabel || 'After'}
                  {comparison?.sourceLabel ? ` · ${comparison.sourceLabel}` : ''}
                </SectionMeta>
              </div>
              <DataBadge>
                {comparison?.hasData === false ? '데이터 부족' : `${comparison?.pointCount || bands.length} points`}
              </DataBadge>
            </SectionHeader>

            <BandRows>
              {bands.map((band) => (
                <BandRow key={band.key || band.label}>
                  <BandLabel $color={band.color}>{band.label}</BandLabel>
                  <BarStack>
                    <BarLine>
                      <BarLabel>Before</BarLabel>
                      <BarTrack>
                        <BarFill $value={band.before} $color={band.color} $muted />
                      </BarTrack>
                    </BarLine>
                    <BarLine>
                      <BarLabel>After</BarLabel>
                      <BarTrack>
                        <BarFill $value={band.after} $color={band.color} />
                      </BarTrack>
                    </BarLine>
                  </BarStack>
                  <Values>
                    <span>{formatPercent(band.before)} → {formatPercent(band.after)}</span>
                    <DeltaValue $positive={Number(band.delta || 0) >= 0}>{formatDelta(band.delta)}</DeltaValue>
                  </Values>
                </BandRow>
              ))}
            </BandRows>
          </Section>

          <Section>
            <SectionHeader>
              <div>
                <SectionTitle>Before / After 상태 지표</SectionTitle>
                <SectionMeta>
                  {record.stateTitle || 'Muse Live EEG 상태'}
                  {record.stateSource ? ` · ${record.stateSource}` : ''}
                  {dominantMetric ? ` · 우세 ${dominantMetric.label} ${dominantMetric.after}%` : ''}
                </SectionMeta>
              </div>
              <DataBadge>
                <Gauge size={13} aria-hidden="true" /> EEG state axes
              </DataBadge>
            </SectionHeader>

            <StateGrid>
              {metricValues.map((metric) => {
                const color = getMetricColor(metric, metric.after);
                return (
                  <MetricCard key={metric.key} $color={color}>
                    <MetricTop>
                      <MetricName>{metric.label}</MetricName>
                      <MetricStatus $color={color}>
                        {getMetricStatus(metric, metric.after)} · {formatDelta(metric.delta)}
                      </MetricStatus>
                    </MetricTop>
                    <MetricDescription>{metric.description}</MetricDescription>
                    <MetricBars>
                      <MetricLine>
                        <BarLabel>{stateComparison.beforeLabel}</BarLabel>
                        <BarTrack>
                          <BarFill $value={metric.before} $color={color} $muted />
                        </BarTrack>
                        <MetricNumber>{metric.before}%</MetricNumber>
                      </MetricLine>
                      <MetricLine>
                        <BarLabel>{stateComparison.afterLabel}</BarLabel>
                        <BarTrack>
                          <BarFill $value={metric.after} $color={color} />
                        </BarTrack>
                        <MetricNumber>{metric.after}%</MetricNumber>
                      </MetricLine>
                    </MetricBars>
                  </MetricCard>
                );
              })}
            </StateGrid>
          </Section>
        </AnalysisGrid>
      </Shell>
    </Page>
  );
}
