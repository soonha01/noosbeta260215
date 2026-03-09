import React from 'react';
import { motion } from 'framer-motion';

const Stars = () => {
  const generateStars = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      duration: Math.random() * 4 + 3,
      moveRange: Math.random() * 2 + 1,
      rotateSpeed: Math.random() * 2 + 1,
    }));
  };

  const stars = generateStars(100);

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
      {stars.map((star) => (
        <motion.div
          key={star.id}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: 'white',
            borderRadius: '50%',
            boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)`,
          }}
          animate={{
            opacity: [star.opacity, star.opacity * 0.3, star.opacity],
            scale: [1, 1.2, 1],
            x: [0, star.moveRange, -star.moveRange, 0],
            y: [0, -star.moveRange * 0.5, star.moveRange * 0.8, 0],
            rotate: [0, 180 * star.rotateSpeed, 360 * star.rotateSpeed],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default Stars;