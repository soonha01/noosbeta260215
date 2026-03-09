import React from 'react';
import { motion } from 'framer-motion';

const Nebula = () => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      zIndex: 1,
    }}>
      <motion.div
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '300px',
          height: '200px',
          background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(50px)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '400px',
          height: '250px',
          background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 50%, transparent 80%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
        }}
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scale: [1.2, 1, 1.2],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          top: '10%',
          right: '30%',
          width: '200px',
          height: '150px',
          background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 60%, transparent 90%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
        }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

export default Nebula;