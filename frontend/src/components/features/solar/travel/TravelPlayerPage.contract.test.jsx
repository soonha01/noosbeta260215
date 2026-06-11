import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import TravelPlayerPage from './TravelPlayerPage';

const noop = () => {};

const baseProps = {
  planetMedia: {
    title: 'Mars',
    trackName: 'Action Orbit',
    moodTarget: 'Action drive',
    description: 'A direct action session.',
    image: '/media/mars-thumb.jpg',
    backgroundImage: '/media/mars-bg.jpg',
    lightingPreview: null,
  },
  accentColor: '#ff8a24',
  durationSec: 120,
  isPlaying: false,
  onOpenDashboard: noop,
  onOpenProfile: noop,
  onRewind: noop,
  onForward: noop,
  onTogglePlay: noop,
  volumePercent: 54,
  onVolumeChange: noop,
  onAskAiObjet: noop,
  onDisconnectAiObjet: noop,
  onExitIntent: noop,
  aiConnected: true,
  hasGeneratedAudio: true,
  generationNotice: 'Generated with fallback material.',
  stateSnapshot: {
    sourceLabel: 'unit baseline',
    canonicalState: {
      focus_readiness: 0.31,
      stress_load: 0.48,
      fatigue_risk: 0.22,
    },
  },
  liveMuseStatus: 'active',
  liveMuseMetrics: {
    sampleCount: 2,
    qualityScore: 0.82,
    testMode: 'csv-mock',
  },
  liveMuseReadings: [
    { channels: { TP9: 2.4, AF7: -1.2, AF8: 0.5, TP10: 1.1 } },
    { raw: { TP9: 3.5, AF7: -0.6, AF8: 0.9, TP10: 1.7 } },
  ],
  adaptiveMusicState: {
    label: 'Crossfade to lower density',
    reason: 'stress drop',
  },
  generatedJourney: {
    generationWarning: '',
    llmSessionCoach: {
      output: {
        focus_frame: 'Generated focus frame from coach.',
        success_signal: 'Generated success signal from coach.',
      },
    },
    interventionResult: {
      current_state_axes: {
        focus_readiness: 0.42,
        stress_load: 0.54,
        fatigue_risk: 0.18,
      },
      target_state_axes: {
        focus_readiness: 0.68,
        relaxation_level: 0.47,
        cortical_arousal: 0.73,
      },
      planet_profile: {
        goal_label: 'Action drive aligned',
        user_description: 'A measured action transition.',
      },
      input_summary: {
        quality_score: 0.77,
      },
      transition_plan: {
        transition_mode: 'ramp_hold',
        transition_intensity: 0.63,
        transition_reliability: 0.81,
        change_priority: ['focus_readiness', 'stress_load'],
        phases: [
          {
            name: 'Launch',
            duration_sec: 33.4,
            goals: ['prime attention', 'reduce hesitation'],
          },
        ],
      },
    },
  },
};

describe('TravelPlayerPage contract', () => {
  it('keeps generated session, Muse, AI Objet, and EEG display copy stable', () => {
    const html = renderToStaticMarkup(<TravelPlayerPage {...baseProps} />);

    expect(html).toContain('NOOS immersive playback');
    expect(html).toContain('Mars');
    expect(html).toContain('Action Orbit');
    expect(html).toContain('Launch');
    expect(html).toContain('prime attention · reduce hesitation');
    expect(html).toContain('Muse live active');
    expect(html).toContain('Crossfade to lower density');
    expect(html).toContain('2 samples');
    expect(html).toContain('TP9 3.5 uV');
    expect(html).toContain('CSV analysis 30s');
    expect(html).toContain('Generated with fallback material.');
    expect(html).toContain('Generated focus frame from coach.');
    expect(html).toContain('Control channel is open');
  });
});
