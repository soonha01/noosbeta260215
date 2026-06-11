const DEFAULT_PREVIEW_LIGHTING_DURATION_SEC = 120;

export const normalizeLightingPhaseForWiz = (phase, preview, fallbackDurationSec) => ({
  name: String(phase?.label || preview?.programLabel || 'planet-preview')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'planet_preview',
  label: phase?.label || preview?.programLabel || 'Planet Preview',
  duration_sec: Math.max(10, Math.round(Number(phase?.durationSec || fallbackDurationSec) || fallbackDurationSec)),
  primary_mode: phase?.primaryMode || preview?.primaryMode || 'cct',
  primary_cct_kelvin: phase?.primaryCctKelvin || phase?.cctKelvin || preview?.primaryCctKelvin || preview?.cctKelvin || 4200,
  cct_kelvin: phase?.cctKelvin || preview?.cctKelvin || 4200,
  primary_hex: phase?.primaryHex || preview?.primaryHex || '#ffffff',
  secondary_hex: phase?.secondaryHex || preview?.secondaryHex || phase?.primaryHex || preview?.primaryHex || '#ffffff',
  accent_hex: phase?.accentHex || preview?.accentHex || '#ffffff',
  brightness_percent: phase?.brightnessPercent || preview?.brightnessPercent || 42,
  illuminance_lux_target: phase?.luxAnchor || preview?.luxAnchor || 300,
  animation_pattern: phase?.patternLabel || preview?.patternLabel || 'Static Hold',
});

export const buildPreviewLightingSpecForWiz = (
  preview,
  durationSec = DEFAULT_PREVIEW_LIGHTING_DURATION_SEC
) => {
  if (!preview) return null;
  const sourcePhases = Array.isArray(preview.phases) && preview.phases.length ? preview.phases : [preview];
  const phases = sourcePhases.map((phase) => normalizeLightingPhaseForWiz(phase, preview, durationSec));
  const finalScene = phases[phases.length - 1] || null;

  return {
    engine: 'noos-planet-preview-lighting',
    program: {
      label: preview.programLabel || 'Planet Preview Lighting',
      intent: preview.summary || '',
      research_anchor: preview.researchAnchor || '',
    },
    device_profile: preview.deviceProfile || 'cct-plus-rgb',
    phases,
    final_scene: finalScene,
  };
};
