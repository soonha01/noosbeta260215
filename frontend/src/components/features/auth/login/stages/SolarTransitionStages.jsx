import { Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  SolarEntryWarpOverlay,
  SolarExplorerFallback,
  WarpTransitionScene,
} from '../loginVisualTransitions';

const solarStageStyle = {
  width: '100%',
  height: '100vh',
  position: 'relative',
  overflow: 'hidden',
};

export const SolarExplorerStage = ({
  SolarExplorer,
  fadeDurationSec,
  showSolarEntryWarp,
  onPlanetSelect,
  liveMuseNotice,
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 1.02, y: 14, filter: 'blur(6px)' }}
    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
    exit={{ opacity: 0, scale: 0.99 }}
    transition={{ duration: fadeDurationSec, ease: [0.16, 1, 0.3, 1] }}
    style={solarStageStyle}
  >
    <Suspense fallback={<SolarExplorerFallback />}>
      <SolarExplorer onPlanetSelect={onPlanetSelect} />
    </Suspense>
    <AnimatePresence>
      {showSolarEntryWarp && <SolarEntryWarpOverlay />}
    </AnimatePresence>
    {liveMuseNotice}
  </motion.div>
);

export const WarpTransitionStage = ({ liveMuseNotice }) => (
  <>
    <WarpTransitionScene />
    {liveMuseNotice}
  </>
);
