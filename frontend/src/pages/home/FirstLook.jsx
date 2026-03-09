import React from "react";
import { motion } from "framer-motion";
import Stars from "../../components/ui/effects/Stars";
import Nebula from "../../components/ui/effects/Nebula";
import WhiteParticles from "../../components/ui/effects/WhiteParticles";
import GlowButton from "../../components/ui/buttons/GlowButton";
import styles from "./FirstLook.module.css";

const FirstLook = ({ onJump }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1.2,
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const titleVariants = {
    hidden: {
      scale: 0.5,
      opacity: 0,
      y: 100,
      rotateY: -45,
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      rotateY: 0,
      transition: {
        duration: 1.5,
        delay: 0.5,
      },
    },
  };

  const handleJump = () => {
    // 부드러운 전환을 위한 짧은 딜레이
    setTimeout(() => {
      if (onJump) {
        onJump();
      }
    }, 200); // 0.2초 후 전환 시작
  };

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 우주 배경 레이어들 */}
      <div className={styles.spaceBackground} />
      <Stars />
      <Nebula />
      <WhiteParticles />

      <motion.div className={styles.mainContent} variants={titleVariants}>
        <motion.h1
          className={styles.title}
          initial={{
            letterSpacing: "0.5em",
            opacity: 0,
            scale: 0.8,
            rotateZ: -5,
          }}
          animate={{
            letterSpacing: "-0.02em",
            opacity: 1,
            scale: 1,
            rotateZ: 0,
          }}
          transition={{
            duration: 2,
            delay: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <motion.span
            initial={{ display: "inline-block", y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            jump into
          </motion.span>
          <br />
          <motion.span
            initial={{ display: "inline-block", y: 50, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            Project : NOOS
          </motion.span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 2.2,
            ease: "easeOut"
          }}
        >
          <GlowButton
            onClick={handleJump}
            style={{
              "--glow-color": "rgb(180, 180, 180)",
              "--glow-spread-color": "rgba(150, 150, 150, 0.45)",
              "--enhanced-glow-color": "rgb(218, 218, 218)",
              "--btn-color": "rgb(92, 92, 92)",
              "--button-border-size": "0.2em",
              "--button-padding": "0.72em 2.25em",
              "--button-font-size": "13px",
              "--button-radius": "0.9em",
            }}
          >
            🚀 JUMP
          </GlowButton>
        </motion.div>
      </motion.div>

      <motion.div
        className={styles.glowEffect}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};

export default FirstLook;
