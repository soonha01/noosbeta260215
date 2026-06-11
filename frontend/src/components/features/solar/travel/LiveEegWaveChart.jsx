import React, { useMemo } from 'react';
import styled from 'styled-components';
import {
  LIVE_EEG_CHANNELS,
  LIVE_EEG_CHART_HEIGHT,
  LIVE_EEG_CHART_WIDTH,
  buildLiveWaveChartMetrics,
  buildLiveWaveSeries,
  createLiveWavePath,
} from './travelPlayerModel';

const LABEL_FONT = "'Poppins', 'Pretendard Variable', 'Pretendard', 'Freesentation', sans-serif";
const NUMERIC_FONT = "'Poppins', 'SF Pro Display', 'Pretendard Variable', 'Freesentation', sans-serif";

const LiveWaveFrame = styled.div`
  position: relative;
  min-height: 246px;
  margin-top: 0.68rem;
  padding: 0.72rem;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background:
    radial-gradient(circle at 18% 12%, rgba(127, 227, 255, 0.13), transparent 34%),
    radial-gradient(circle at 86% 70%, rgba(82, 255, 154, 0.1), transparent 32%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.025)),
    rgba(0, 0, 0, 0.31);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 18px 38px rgba(0, 0, 0, 0.22);
`;

const LiveWaveHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.8rem;
  position: relative;
  z-index: 2;
`;

const LiveWaveTitle = styled.div`
  display: grid;
  gap: 0.16rem;
`;

const LiveWaveKicker = styled.span`
  color: rgba(255, 255, 255, 0.52);
  font-size: 9px;
  font-family: ${LABEL_FONT};
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
`;

const LiveWaveName = styled.span`
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.1;
`;

const LiveWaveStatus = styled.span`
  min-height: 25px;
  padding: 0 0.58rem;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(82, 255, 154, 0.48)' : 'rgba(255, 255, 255, 0.16)')};
  background: ${({ $active }) => ($active ? 'rgba(82, 255, 154, 0.13)' : 'rgba(255, 255, 255, 0.07)')};
  color: ${({ $active }) => ($active ? '#9fffc4' : 'rgba(255, 255, 255, 0.68)')};
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-family: ${LABEL_FONT};
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const LiveWaveStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.42rem;
  margin-top: 0.52rem;
  position: relative;
  z-index: 2;
`;

const LiveWaveStat = styled.span`
  min-height: 23px;
  padding: 0 0.5rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.065);
  color: rgba(255, 255, 255, 0.68);
  font-size: 10px;
  font-family: ${NUMERIC_FONT};
  font-weight: 600;
`;

const LiveWaveSvg = styled.svg`
  display: block;
  width: 100%;
  height: 188px;
  margin-top: 0.56rem;
  position: relative;
  z-index: 1;
`;

const LiveWaveEmpty = styled.div`
  position: absolute;
  inset: 4.2rem 0 0;
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.58);
  font-size: 12px;
  font-weight: 600;
`;

const LiveWaveLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.42rem;
  margin-top: 0.56rem;
`;

const LiveWaveLegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.32rem;
  color: rgba(255, 255, 255, 0.72);
  font-size: 10px;
  font-family: ${LABEL_FONT};
  font-weight: 600;
`;

const LiveWaveLegendDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: ${({ $color }) => $color};
`;

const LiveEegWaveChart = ({ readings }) => {
  const series = useMemo(() => buildLiveWaveSeries(readings), [readings]);
  const {
    sampleCount,
    amplitude,
    latestTp9,
    plotLeft,
    plotTop,
    plotWidth,
    plotHeight,
    rowHeight,
    rowAmplitude,
  } = buildLiveWaveChartMetrics(readings, series);

  return (
    <>
      <LiveWaveFrame>
        <LiveWaveHeader>
          <LiveWaveTitle>
            <LiveWaveKicker>front buffer only</LiveWaveKicker>
            <LiveWaveName>Raw EEG Stream</LiveWaveName>
          </LiveWaveTitle>
          <LiveWaveStatus $active={sampleCount > 0}>{sampleCount ? 'live' : 'waiting'}</LiveWaveStatus>
        </LiveWaveHeader>
        <LiveWaveStats>
          <LiveWaveStat>{sampleCount} samples</LiveWaveStat>
          <LiveWaveStat>scale ±{amplitude.toFixed(0)} uV</LiveWaveStat>
          <LiveWaveStat>TP9 {latestTp9.toFixed(1)} uV</LiveWaveStat>
        </LiveWaveStats>
        <LiveWaveSvg viewBox={`0 0 ${LIVE_EEG_CHART_WIDTH} ${LIVE_EEG_CHART_HEIGHT}`} preserveAspectRatio="none">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={`v-${ratio}`}
              x1={plotLeft + plotWidth * ratio}
              y1={plotTop}
              x2={plotLeft + plotWidth * ratio}
              y2={plotTop + plotHeight}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />
          ))}
          {series.map((channel, index) => {
            const baselineY = plotTop + rowHeight * index + rowHeight / 2;
            const path = createLiveWavePath({
              samples: channel.samples,
              baselineY,
              rowAmplitude,
              amplitude,
              plotLeft,
              plotWidth,
            });
            return (
              <g key={channel.key}>
                <rect
                  x={plotLeft}
                  y={baselineY - rowHeight * 0.42}
                  width={plotWidth}
                  height={rowHeight * 0.84}
                  fill={index % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.01)'}
                />
                <line
                  x1={plotLeft}
                  y1={baselineY}
                  x2={plotLeft + plotWidth}
                  y2={baselineY}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1"
                />
                <text
                  x={plotLeft - 10}
                  y={baselineY + 3}
                  fill={channel.color}
                  fontSize="10"
                  textAnchor="end"
                  fontWeight="700"
                >
                  {channel.key}
                </text>
                <path
                  d={path}
                  fill="none"
                  stroke={channel.color}
                  strokeWidth="1.55"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.96"
                />
              </g>
            );
          })}
        </LiveWaveSvg>
        {!sampleCount ? <LiveWaveEmpty>실시간 EEG 수신 대기 중입니다.</LiveWaveEmpty> : null}
      </LiveWaveFrame>
      <LiveWaveLegend>
        {LIVE_EEG_CHANNELS.map((channel) => (
          <LiveWaveLegendItem key={channel.key}>
            <LiveWaveLegendDot $color={channel.color} />
            {channel.key}
          </LiveWaveLegendItem>
        ))}
      </LiveWaveLegend>
    </>
  );
};

export default React.memo(LiveEegWaveChart);
