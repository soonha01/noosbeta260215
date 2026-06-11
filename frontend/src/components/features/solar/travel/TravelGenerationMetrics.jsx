import React from 'react';
import { Activity, Brain, Timer } from 'lucide-react';
import {
  MetricBody,
  MetricLabel,
  MetricTile,
  MetricTop,
  MetricValue,
  Metrics,
  MiniBar,
  MiniBars,
} from './TravelGenerationPage.styles';

const METRIC_ICONS = {
  activity: Activity,
  brain: Brain,
  timer: Timer,
};

const TravelGenerationMetrics = ({ accentColor, metricCards }) => (
  <Metrics>
    {metricCards.map((metric, metricIndex) => {
      const Icon = METRIC_ICONS[metric.iconKey] || Brain;

      return (
        <MetricTile key={metric.key} $accent={accentColor}>
          <MetricTop>
            <MetricLabel>{metric.label}</MetricLabel>
            <Icon size={16} color={accentColor} />
          </MetricTop>
          <MetricValue $accent={accentColor}>{metric.percent}</MetricValue>
          <MetricBody>{metric.body}</MetricBody>
          <MiniBars aria-hidden="true">
            {metric.bars.map((height, index) => (
              <MiniBar
                key={`${metric.key}-${height}-${index}`}
                $height={height}
                $accent={accentColor}
                $active={index <= metricIndex + 4}
              />
            ))}
          </MiniBars>
        </MetricTile>
      );
    })}
  </Metrics>
);

export default React.memo(TravelGenerationMetrics);
