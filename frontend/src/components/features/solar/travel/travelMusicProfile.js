export const buildMusicProfileSnapshot = ({
  planetMedia,
  generatedJourney,
  volumePercent,
  adaptiveVolumeScale,
}) => {
  const intervention = generatedJourney?.interventionResult || {};
  const musicSpec = intervention?.music_spec || {};
  return {
    trackName: generatedJourney?.trackName || planetMedia?.trackName || null,
    audioUrl: generatedJourney?.audioUrl || planetMedia?.audio || null,
    tempo: musicSpec?.bpm_target || musicSpec?.bpm || null,
    intensity: musicSpec?.intensity ?? intervention?.transition_plan?.transition_intensity ?? null,
    brightness: musicSpec?.brightness ?? null,
    density: musicSpec?.density ?? null,
    volumePercent,
    adaptiveVolumeScale,
  };
};
