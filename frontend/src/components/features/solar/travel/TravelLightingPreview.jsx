import React from 'react';
import styled from 'styled-components';
import {
  LightingCitationLink,
  LightingCitationRow,
  LightingCode,
  LightingMeta,
  LightingMetricCard,
  LightingMetricGrid,
  LightingMetricLabel,
  LightingMetricValue,
  LightingPanel,
  LightingPhaseCard,
  LightingPhaseGrid,
  LightingPhaseLabel,
  LightingPhaseMeta,
  LightingSummary,
  LightingSwatch,
  LightingSwatchLabel,
  LightingSwatchRow,
  LightingTag,
  LightingTagRow,
  LightingTitle,
} from './spaceTravel.styles';

const Header = styled.div`
  display: grid;
  gap: 0.24rem;
`;

const Eyebrow = styled.p`
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(214, 224, 246, 0.72);
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

const PhaseBody = styled.p`
  margin: 0;
  color: rgba(223, 232, 248, 0.8);
  font-size: 10px;
  line-height: 1.45;
`;

const PhaseSwatchRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.34rem;
`;

const SwatchStack = styled.div`
  min-width: 0;
`;

const TravelLightingPreview = ({ preview, accentColor, compact = false }) => {
  if (!preview) return null;

  const citationList = compact ? preview.citations.slice(0, 2) : preview.citations;
  const phaseList = compact ? preview.phases.slice(0, 2) : preview.phases;
  const primaryMode = preview.primaryMode || 'cct';
  const primaryCctKelvin = preview.primaryCctKelvin || preview.cctKelvin || 0;
  const primaryIsCct = primaryMode === 'cct';

  return (
    <LightingPanel $accent={accentColor}>
      <Header>
        <Eyebrow>Lighting prescription</Eyebrow>
        <LightingTitle $accent={accentColor}>{preview.programLabel}</LightingTitle>
        <LightingSummary>{preview.summary}</LightingSummary>
      </Header>

      <LightingTagRow>
        <LightingTag $accent={accentColor}>{preview.researchAnchor}</LightingTag>
        <LightingTag $accent={accentColor}>{preview.evidenceLabel}</LightingTag>
      </LightingTagRow>

      <LightingSwatchRow>
        <SwatchStack>
          <LightingSwatch style={{ background: preview.primaryHex }} />
          <LightingSwatchLabel>
            {compact ? 'Primary' : primaryIsCct ? 'Primary CCT' : 'Primary tone'}
            <br />
            {primaryIsCct ? `${primaryCctKelvin} K` : preview.primaryHex}
          </LightingSwatchLabel>
        </SwatchStack>
        <SwatchStack>
          <LightingSwatch style={{ background: preview.secondaryHex }} />
          <LightingSwatchLabel>
            {compact ? 'Secondary' : 'Secondary tone'}
            <br />
            {preview.secondaryHex}
          </LightingSwatchLabel>
        </SwatchStack>
        <SwatchStack>
          <LightingSwatch style={{ background: preview.accentHex }} />
          <LightingSwatchLabel>
            Accent
            <br />
            {preview.accentHex}
          </LightingSwatchLabel>
        </SwatchStack>
      </LightingSwatchRow>

      <LightingMetricGrid>
        <LightingMetricCard $accent={accentColor}>
          <LightingMetricLabel>Target CCT</LightingMetricLabel>
          <LightingMetricValue>{preview.cctKelvin} K</LightingMetricValue>
        </LightingMetricCard>
        <LightingMetricCard $accent={accentColor}>
          <LightingMetricLabel>Research Lux</LightingMetricLabel>
          <LightingMetricValue>{preview.luxAnchor} lx</LightingMetricValue>
        </LightingMetricCard>
        <LightingMetricCard $accent={accentColor}>
          <LightingMetricLabel>Brightness</LightingMetricLabel>
          <LightingMetricValue>{preview.brightnessPercent}%</LightingMetricValue>
        </LightingMetricCard>
        <LightingMetricCard $accent={accentColor}>
          <LightingMetricLabel>Pattern</LightingMetricLabel>
          <LightingMetricValue>{preview.patternCadence}</LightingMetricValue>
        </LightingMetricCard>
      </LightingMetricGrid>

      <LightingMeta>
        Device payload <LightingCode>{preview.deviceProfile}</LightingCode> ·{' '}
        {primaryIsCct ? (
          <>
            primary CCT <LightingCode>{primaryCctKelvin} K</LightingCode>
          </>
        ) : (
          <>
            primary RGB <LightingCode>{hexToRgbString(preview.primaryHex)}</LightingCode>
          </>
        )}
      </LightingMeta>

      <LightingPhaseGrid>
        {phaseList.map((phase) => (
          <LightingPhaseCard key={`${preview.programLabel}-${phase.label}`} $accent={accentColor}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.7rem', alignItems: 'center' }}>
              <LightingPhaseLabel $accent={accentColor}>{phase.label}</LightingPhaseLabel>
              <LightingPhaseMeta>{phase.durationText}</LightingPhaseMeta>
            </div>
            <PhaseBody>
              {phase.cctKelvin} K · {phase.luxAnchor} lx · {phase.brightnessPercent}% · {phase.patternLabel}
            </PhaseBody>
            <PhaseSwatchRow>
              <LightingSwatch
                title={
                  (phase.primaryMode || 'cct') === 'cct'
                    ? `${phase.primaryCctKelvin || phase.cctKelvin || 0} K`
                    : phase.primaryHex
                }
                style={{ background: phase.primaryHex, height: 26 }}
              />
              <LightingSwatch style={{ background: phase.secondaryHex, height: 26 }} />
              <LightingSwatch style={{ background: phase.accentHex, height: 26 }} />
            </PhaseSwatchRow>
          </LightingPhaseCard>
        ))}
      </LightingPhaseGrid>

      <LightingCitationRow>
        {citationList.map((citation) => (
          <LightingCitationLink
            key={`${preview.programLabel}-${citation.label}`}
            href={citation.url}
            target="_blank"
            rel="noreferrer"
            $accent={accentColor}
          >
            {citation.label}
          </LightingCitationLink>
        ))}
      </LightingCitationRow>
    </LightingPanel>
  );
};

const hexToRgbString = (hex) => {
  const stripped = String(hex || '').replace('#', '');
  if (stripped.length !== 6) return '0, 0, 0';
  const red = Number.parseInt(stripped.slice(0, 2), 16);
  const green = Number.parseInt(stripped.slice(2, 4), 16);
  const blue = Number.parseInt(stripped.slice(4, 6), 16);
  return `${red}, ${green}, ${blue}`;
};

export default React.memo(TravelLightingPreview);
