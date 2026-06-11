import { describe, expect, it } from 'vitest';
import { buildPreviewLightingSpecForWiz } from './travelLightingPlan';
import { buildMusicProfileSnapshot } from './travelMusicProfile';

describe('travel session artifact helpers', () => {
  it('summarizes generated journey music profile with static media fallback', () => {
    const profile = buildMusicProfileSnapshot({
      planetMedia: {
        trackName: 'Mars Static Track',
        audio: '/media/mars.mp3',
      },
      generatedJourney: {
        trackName: 'Generated Mars',
        audioUrl: '/api/ai/audio?path=mars.mp3',
        interventionResult: {
          music_spec: {
            bpm_target: 72,
            brightness: 0.22,
            density: 0.31,
          },
          transition_plan: {
            transition_intensity: 0.44,
          },
        },
      },
      volumePercent: 64,
      adaptiveVolumeScale: 0.92,
    });

    expect(profile).toEqual({
      trackName: 'Generated Mars',
      audioUrl: '/api/ai/audio?path=mars.mp3',
      tempo: 72,
      intensity: 0.44,
      brightness: 0.22,
      density: 0.31,
      volumePercent: 64,
      adaptiveVolumeScale: 0.92,
    });
  });

  it('normalizes preview lighting phases for WiZ handoff', () => {
    const spec = buildPreviewLightingSpecForWiz({
      programLabel: 'Deep Focus',
      summary: 'Cool focus light',
      researchAnchor: 'CCT anchor',
      deviceProfile: 'cct-plus-rgb',
      phases: [
        {
          label: 'Cool Hold',
          durationSec: 8,
          primaryMode: 'cct',
          primaryCctKelvin: 5100,
          primaryHex: '#f7f4ef',
          secondaryHex: '#8fd9ff',
          accentHex: '#ffffff',
          brightnessPercent: 46,
          luxAnchor: 600,
          patternLabel: 'Static Hold',
        },
      ],
    }, 120);

    expect(spec).toMatchObject({
      engine: 'noos-planet-preview-lighting',
      program: {
        label: 'Deep Focus',
        intent: 'Cool focus light',
        research_anchor: 'CCT anchor',
      },
      device_profile: 'cct-plus-rgb',
      final_scene: {
        name: 'cool_hold',
        duration_sec: 10,
        primary_cct_kelvin: 5100,
        brightness_percent: 46,
        illuminance_lux_target: 600,
      },
    });
    expect(spec.phases).toHaveLength(1);
  });
});
