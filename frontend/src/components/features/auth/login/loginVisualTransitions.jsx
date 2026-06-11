import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Grainient from '../../../ui/effects/Grainient';

export const WARP_STAR_COUNT = 120;
const WARP_SCENE_FADE_IN_DURATION_SEC = 1.5;

const LOGIN_STAGE_GRAINIENT_PROPS = Object.freeze({
  color1: '#000000',
  color2: '#474747',
  color3: '#787878',
  timeSpeed: 0.3,
  colorBalance: 0,
  warpStrength: 1,
  warpFrequency: 5,
  warpSpeed: 2,
  warpAmplitude: 50,
  blendAngle: 0,
  blendSoftness: 0.05,
  rotationAmount: 500,
  noiseScale: 2,
  grainAmount: 0.1,
  grainScale: 2,
  grainAnimated: false,
  contrast: 1.5,
  gamma: 1,
  saturation: 1,
  centerX: 0,
  centerY: 0,
  zoom: 0.9,
});

export const createWarpStars = () => {
  const seededRandom = (value) => {
    const x = Math.sin(value * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  return Array.from({ length: WARP_STAR_COUNT }, (_, index) => {
    const angleRad = seededRandom(index + 1) * Math.PI * 2;
    const angleDeg = (angleRad * 180) / Math.PI;
    const distance = 220 + seededRandom(index + 27) * 1800;
    const duration = 0.68 + seededRandom(index + 53) * 0.9;
    const delay = seededRandom(index + 87) * 0.72;
    const size = 1 + seededRandom(index + 121) * 2.4;
    const opacity = 0.38 + seededRandom(index + 157) * 0.62;

    return {
      id: `warp-star-${index}`,
      angleDeg,
      distance,
      duration,
      delay,
      size,
      opacity,
    };
  });
};

export const createWarpStarRenderData = (stars, { idPrefix = '', entryMode = false } = {}) =>
  stars.map((star) => ({
    id: `${idPrefix}${star.id}`,
    style: {
      '--angle': `${star.angleDeg}deg`,
      '--distance': entryMode ? `${220 + star.distance * 0.8}px` : `${star.distance}px`,
      '--duration': entryMode ? `${0.95 + star.duration * 0.5}s` : `${star.duration}s`,
      '--delay': entryMode ? `${star.delay * 0.2}s` : `${star.delay}s`,
      '--size': entryMode ? `${Math.max(1, star.size * 0.95)}px` : `${star.size}px`,
      '--star-opacity': entryMode ? `${Math.min(1, star.opacity + 0.08)}` : `${star.opacity}`,
    },
  }));

const WARP_STARS = createWarpStars();
const WARP_STAR_RENDER_DATA = createWarpStarRenderData(WARP_STARS);
const ENTRY_WARP_STAR_RENDER_DATA = createWarpStarRenderData(WARP_STARS, {
  idPrefix: 'entry-',
  entryMode: true,
});

export const SolarExplorerFallback = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: '#000000',
    }}
  />
);

export const PrismStageShell = ({ children }) => (
  <div
    style={{
      width: '100vw',
      minHeight: '100dvh',
      height: '100dvh',
      position: 'relative',
      overflow: 'hidden',
      background: '#000000',
      isolation: 'isolate',
    }}
  >
    <div style={{ position: 'absolute', inset: '-10%', width: '120%', height: '120%' }}>
      <Grainient {...LOGIN_STAGE_GRAINIENT_PROPS} centerX={-0.12} centerY={0.08} zoom={1.35} />
    </div>
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(circle at 50% 48%, rgba(255,255,255,0.08), transparent 42%), linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.42) 48%, rgba(0,0,0,0.16) 100%)',
        pointerEvents: 'none',
      }}
    />
    <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', minHeight: 0 }}>{children}</div>
  </div>
);

export const WarpTransitionScene = () => {
  return (
    <WarpTransitionWrapper
      initial={{ opacity: 0, scale: 1.016, filter: 'blur(6px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: WARP_SCENE_FADE_IN_DURATION_SEC, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="warp-grainient" aria-hidden="true">
        <Grainient {...LOGIN_STAGE_GRAINIENT_PROPS} />
      </div>

      <div className="warp-stars" aria-hidden="true">
        {WARP_STAR_RENDER_DATA.map((star) => (
          <span
            key={star.id}
            className="warp-star"
            style={star.style}
          />
        ))}
      </div>

      <div className="warp-core" aria-hidden="true" />

      <motion.div
        className="warp-text"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="warp-kicker">WARP DRIVE ENGAGED</p>
        <h1 className="warp-title">우주로 떠납니다.</h1>
        <p className="warp-subtitle">ENTERING SOLAR EXPLORER</p>
      </motion.div>
    </WarpTransitionWrapper>
  );
};

export const SolarEntryWarpOverlay = () => {
  return (
    <SolarEntryWarpLayer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="entry-stars" aria-hidden="true">
        {ENTRY_WARP_STAR_RENDER_DATA.map((star) => (
          <span
            key={star.id}
            className="entry-star"
            style={star.style}
          />
        ))}
      </div>

      <motion.div
        className="entry-flash"
        initial={{ opacity: 0.9, scale: 0.3 }}
        animate={{ opacity: 0, scale: 1.2 }}
        transition={{ duration: 1.25, ease: [0.16, 1, 0.3, 1] }}
      />
    </SolarEntryWarpLayer>
  );
};

const WarpTransitionWrapper = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
  background: #000;

  .warp-grainient {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .warp-stars {
    position: absolute;
    inset: -22%;
    pointer-events: none;
    z-index: 1;
  }

  .warp-star {
    position: absolute;
    left: 50%;
    top: 50%;
    width: var(--size);
    height: calc(var(--size) * 9);
    transform-origin: center center;
    border-radius: 999px;
    opacity: 0;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.98) 0%,
      rgba(176, 208, 255, 0.74) 44%,
      rgba(176, 208, 255, 0) 100%
    );
    filter: drop-shadow(0 0 10px rgba(161, 203, 255, 0.68));
    animation: warpStar var(--duration) linear var(--delay) infinite;
  }

  .warp-core {
    position: absolute;
    z-index: 2;
    width: 240px;
    height: 240px;
    border-radius: 999px;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.7) 0%,
      rgba(171, 205, 255, 0.42) 24%,
      rgba(171, 205, 255, 0) 74%
    );
    filter: blur(2px);
    animation: corePulse 1.4s ease-in-out infinite alternate;
  }

  .warp-text {
    position: relative;
    z-index: 3;
    text-align: center;
    color: #fff;
    text-shadow: 0 10px 35px rgba(0, 0, 0, 0.6);
  }

  .warp-kicker {
    margin: 0 0 12px;
    font-family: "Cardinal Fruit", "SF Pro Bold", sans-serif;
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.74);
  }

  .warp-title {
    margin: 0;
    font-family: "Freesentation Black", "Freesentation Bold", sans-serif;
    font-size: clamp(34px, 5vw, 62px);
    letter-spacing: -0.02em;
    color: #fff;
  }

  .warp-subtitle {
    margin: 14px 0 0;
    font-family: "Cardinal Fruit", "SF Pro Bold", sans-serif;
    font-size: 13px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(196, 220, 255, 0.92);
  }

  @keyframes warpStar {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scaleY(0.1);
    }
    18% {
      opacity: var(--star-opacity);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateY(var(--distance)) scaleY(1.25);
    }
  }

  @keyframes corePulse {
    from {
      transform: scale(0.92);
      opacity: 0.7;
    }
    to {
      transform: scale(1.08);
      opacity: 1;
    }
  }
`;

const SolarEntryWarpLayer = styled(motion.div)`
  position: absolute;
  inset: 0;
  z-index: 80;
  pointer-events: none;
  overflow: hidden;
  background: radial-gradient(circle at 50% 50%, rgba(185, 215, 255, 0.18) 0%, rgba(12, 18, 46, 0.16) 34%, rgba(0, 0, 0, 0) 76%);
  mix-blend-mode: normal;

  .entry-stars {
    position: absolute;
    inset: -22%;
  }

  .entry-star {
    position: absolute;
    left: 50%;
    top: 50%;
    width: var(--size);
    height: calc(var(--size) * 11);
    transform-origin: center center;
    border-radius: 999px;
    opacity: 0;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 1) 0%,
      rgba(183, 212, 255, 0.74) 42%,
      rgba(183, 212, 255, 0) 100%
    );
    filter: drop-shadow(0 0 13px rgba(184, 221, 255, 0.88));
    animation: entryWarpStar var(--duration) linear var(--delay) forwards;
  }

  .entry-flash {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 300px;
    height: 300px;
    transform: translate(-50%, -50%);
    border-radius: 999px;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.88) 0%,
      rgba(205, 225, 255, 0.52) 30%,
      rgba(205, 225, 255, 0) 74%
    );
    filter: blur(2px);
  }

  @keyframes entryWarpStar {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scaleY(0.08);
    }
    16% {
      opacity: var(--star-opacity);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateY(var(--distance)) scaleY(1.55);
    }
  }
`;
