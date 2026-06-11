import React from 'react';
import {
  LightingCompact,
  LightingDatum,
  LightingMeta,
  LightingSwatch,
} from './TravelGenerationPage.styles';

const TravelGenerationLightingCompact = ({ accentColor, lightingPreview }) => {
  if (!lightingPreview) {
    return null;
  }

  return (
    <>
      <LightingCompact>
        <LightingSwatch $accent={accentColor} $color={lightingPreview.primaryHex} />
        <LightingSwatch $accent={accentColor} $color={lightingPreview.secondaryHex} />
        <LightingSwatch $accent={accentColor} $color={lightingPreview.accentHex} />
      </LightingCompact>
      <LightingMeta>
        <LightingDatum $accent={accentColor}>
          <span>CCT</span>
          <strong>{lightingPreview.cctKelvin} K</strong>
        </LightingDatum>
        <LightingDatum $accent={accentColor}>
          <span>Lux</span>
          <strong>{lightingPreview.luxAnchor} lx</strong>
        </LightingDatum>
        <LightingDatum $accent={accentColor}>
          <span>Pattern</span>
          <strong>{lightingPreview.patternCadence}</strong>
        </LightingDatum>
      </LightingMeta>
    </>
  );
};

export default React.memo(TravelGenerationLightingCompact);
