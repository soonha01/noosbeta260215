import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import LiveEegWaveChart from './LiveEegWaveChart';

describe('LiveEegWaveChart', () => {
  it('renders the waiting state for empty live Muse readings', () => {
    const html = renderToStaticMarkup(<LiveEegWaveChart readings={[]} />);

    expect(html).toContain('Raw EEG Stream');
    expect(html).toContain('waiting');
    expect(html).toContain('0 samples');
    expect(html).toContain('실시간 EEG 수신 대기 중입니다.');
  });

  it('renders live EEG stats and channel labels for incoming readings', () => {
    const html = renderToStaticMarkup(
      <LiveEegWaveChart
        readings={[
          { channels: { TP9: 1.5, AF7: -2, AF8: 0.5, TP10: 0.25 } },
          { raw: { TP9: 3.25, AF7: -1, AF8: 2, TP10: 1 } },
        ]}
      />,
    );

    expect(html).toContain('live');
    expect(html).toContain('2 samples');
    expect(html).toContain('scale ±3 uV');
    expect(html).toContain('TP9 3.3 uV');
    expect(html).toContain('TP9');
    expect(html).toContain('AF7');
    expect(html).toContain('AF8');
    expect(html).toContain('TP10');
  });
});
