import React, { useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import TextType from "./components/ui/text/TextType";
import ScrollReveal from "./components/ui/text/ScrollReveal";
import Aurora from "./components/ui/effects/Aurora";
import CircularGallery from "./components/features/solar/CircularGallery";
import MagicBento from "./components/ui/showcase/MagicBento";
import TrueFocus from "./components/ui/text/TrueFocus";
import BlurText from "./components/ui/text/BlurText";
import Grainient from "./components/ui/effects/Grainient";
import FirstLook from "./pages/home/FirstLook";
import Login from "./components/features/auth/Login";
import ClickSpark from "./components/ui/effects/ClickSpark";
import { DEFAULT_GALLERY_ITEMS } from "./lib/galleryItems";

// Gallery images - kept for potential future use

// Image assets - matched by name and purpose
const imgIcon1 = `${process.env.PUBLIC_URL}/media/icons/icon.png`; // Project logo/icon
const imgSection2Bg = `${process.env.PUBLIC_URL}/media/home/2section.png`; // Section 2 full background
const imgVector = `${process.env.PUBLIC_URL}/media/home/section5.png`; // Section 5 brand image

// Hardware/Product images
const imgImage22 = `${process.env.PUBLIC_URL}/media/hardware/muse.png`; // Muse S Athena
const imgImage23 = `${process.env.PUBLIC_URL}/media/hardware/aiobjet-modern.svg`; // AI Object main
const imgImage24 = `${process.env.PUBLIC_URL}/media/hardware/multiplatform-modern.svg`; // Multiplatform

// Process step images
const imgTSbhXcBw10HvxPaJ6SsTtRiiplkPng = `${process.env.PUBLIC_URL}/media/home/10 1.png`; // Step 1 illustration
const imgMX5DAhTlaceN4NDguCeAZcFbIPng = `${process.env.PUBLIC_URL}/media/home/10-2.png`; // Space travel illustration
const img7VSjm6K3MAQqqM3HtSKme77ZhCsPng = `${process.env.PUBLIC_URL}/media/home/10 3.png`; // Dashboard/past analysis illustration

// Background images for sections
const imgSection9Modern1 = `${process.env.PUBLIC_URL}/media/home/section9-modern-1.svg`; // Section 9 custom card 1
const imgSection9Modern2 = `${process.env.PUBLIC_URL}/media/home/section9-modern-2.svg`; // Section 9 custom card 2
const imgSection9Modern3 = `${process.env.PUBLIC_URL}/media/home/section9-modern-3.svg`; // Section 9 custom card 3
const imgSection9Modern4 = `${process.env.PUBLIC_URL}/media/home/section9-modern-4.svg`; // Section 9 custom card 4
const imgSection9Modern5 = `${process.env.PUBLIC_URL}/media/home/section9-modern-5.svg`; // Section 9 custom card 5

// Section 1 - Hero
const HeroSection = ({ onLoginClick }) => {
  return (
    <section className="bg-black relative min-h-screen overflow-hidden items-stretch justify-start">
      <div className="absolute inset-0 w-full h-full z-0">
        <Grainient
          color1="#000000"
          color2="#474747"
          color3="#787878"
          timeSpeed={0.3}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>
      <div className="w-full min-h-screen relative z-10">
        {/* Navigation Header */}
        <motion.nav
          className="absolute left-0 right-0 top-0 z-20 w-full py-1"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="mx-auto flex w-full max-w-[1920px] items-center justify-between px-4 md:px-8 lg:px-12">
            <motion.div
              className="flex items-center gap-5"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="h-[72px] w-[106px] overflow-hidden">
                <img
                  alt="Project NOOS Logo"
                  className="block max-w-none h-full w-full object-contain hover:scale-105 transition-transform duration-300"
                  height="72"
                  src={imgIcon1}
                  width="106"
                />
              </div>
              <div className="font-cardinal-fruit text-[16px] text-white">
                Project : NOOS
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-9"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <button
                onClick={() => {
                  const functionsSection =
                    document.getElementById("functions-section");
                  if (functionsSection) {
                    functionsSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="font-cardinal-fruit text-[16px] text-white hover:text-gray-300 cursor-pointer transition-all duration-300 hover:scale-105"
              >
                Functions
              </button>
              <Link
                to="/about"
                className="font-cardinal-fruit text-[16px] text-white hover:text-gray-300 cursor-pointer transition-all duration-300 hover:scale-105"
              >
                About us
              </Link>
              <button
                onClick={() => {
                  const contactSection =
                    document.getElementById("contact-section");
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="font-cardinal-fruit text-[16px] text-white hover:text-gray-300 cursor-pointer transition-all duration-300 hover:scale-105"
              >
                Contact us
              </button>
            </motion.div>
          </div>
        </motion.nav>

        <div className="absolute inset-0 flex items-center justify-center px-4">
          {/* Hero Content */}
          <motion.div
            className="mx-auto flex w-full max-w-[1512px] flex-col items-center justify-center px-4 text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          >
            <div className="mx-auto w-full max-w-5xl space-y-8 md:space-y-10">
              <motion.h1
                className="mx-auto w-full text-center font-cardinal-fruit text-[28px] leading-[1.2] tracking-[-0.02em] text-white md:text-[36px] lg:text-[44px] md:whitespace-nowrap"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
              >
                Redefining focus, creativity, and balance in real time.
              </motion.h1>

              <motion.div
                className="mx-auto max-w-2xl space-y-1.5 font-freesentation text-[13px] font-medium leading-relaxed text-[#9a9a9a] md:text-[14px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.3 }}
              >
                <div>당신의 생각과 감정을 읽어 최적의 몰입과 위로를</div>
                <div>선사하는 지능형 공간.</div>
              </motion.div>
            </div>

            <motion.div
              onClick={onLoginClick}
              className="mt-8 inline-flex cursor-pointer items-center justify-center rounded-[999px] border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.08)] px-6 py-3 backdrop-blur-[5px] transition-all duration-300 hover:scale-105 hover:border-[rgba(255,255,255,0.24)] hover:bg-[rgba(255,255,255,0.12)] hover:shadow-lg hover:shadow-white/10"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="font-cardinal-fruit text-[13px] tracking-[0.04em] text-[rgba(255,255,255,0.82)] md:text-[14px]">
                Available on Web
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Section 2 - About
const AboutSection = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.section
      ref={ref}
      className="relative min-h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      <div className="absolute inset-0 z-0">
        <img
          alt="Section 2 Background"
          src={imgSection2Bg}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
      </div>

      <motion.div
        className="relative z-10 min-h-screen w-full"
        initial={{ y: 100, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
      >
        <div className="absolute bottom-10 right-0 w-[min(680px,92vw)] px-4 md:bottom-14 md:px-6 lg:bottom-16 lg:px-8">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-3"
            >
              <motion.h2 className="font-cardinal-fruit text-[28px] md:text-[34px] lg:text-[44px] text-white leading-[1.08]">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={
                    isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }
                  }
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  Redefining
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={
                    isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }
                  }
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  focus, creativity, and balance
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={
                    isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }
                  }
                  transition={{ duration: 0.5, delay: 1.0 }}
                  className="text-[#929292]"
                >
                  - in real time
                </motion.div>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={
                  isInView
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.8 }
                }
                transition={{ duration: 0.6, delay: 1.2 }}
                className="font-freesentation-black text-[17px] md:text-[20px] text-white leading-[1.3]"
              >
                집중, 창의, 균형을 실시간으로 재정의.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="space-y-2 md:space-y-3 font-freesentation font-medium text-[13px] md:text-[15px] text-white leading-[1.32]"
            >
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.6, delay: 1.6 }}
              >
                저희는 현대 사회가 직면한 근본적인 문제를 해결하고자 하는
                고민에서 출발했습니다.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.6, delay: 1.8 }}
              >
                오늘날 우리는 디지털 기술과 AI의 발전 속에서 누구보다 빠르게
                연결되고 있지만,
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.6, delay: 2.0 }}
              >
                정작 집중력 결핍, 창의성 저하, 정서적 불안정과 같은 문제에
                끊임없이 노출되고 있습니다.
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
};

// Section 3 - Problem Statement 1
const ProblemSection1 = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.section
      ref={ref}
      className="bg-black relative min-h-screen flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0, y: 100 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      <motion.div
        className="w-full max-w-6xl mx-auto px-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={
          isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }
        }
        transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateX: 15 }}
          animate={
            isInView
              ? { opacity: 1, scale: 1, rotateX: 0 }
              : { opacity: 0, scale: 0.9, rotateX: 15 }
          }
          transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
          className="font-sf-pro text-[28px] md:text-[35px] lg:text-[42px] text-center text-white tracking-[-0.9px] font-black space-y-3"
          style={{ perspective: "1000px" }}
        >
          <TextType
            text={"현대 사회는 몰입과 창의성,\n그리고 정서적 안정이 동시에 요구되지만\n이를 지원하는 환경은 부족합니다."}
            as="div"
            typingSpeed={80}
            initialDelay={1000}
            pauseDuration={3000}
            deletingSpeed={30}
            loop={true}
            className="leading-[1.16]"
            whiteSpace="pre"
            showCursor={true}
            cursorCharacter="_"
            cursorClassName="text-white opacity-90"
            startOnVisible={true}
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

// Section 4 - Problem Statement 2
const ProblemSection2 = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <motion.section
      ref={ref}
      className="bg-black relative min-h-screen flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 1.8, ease: "easeOut" }}
    >
      <motion.div
        className="bg-black relative size-full"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={
          isInView ? { scale: 1, opacity: 1 } : { scale: 1.2, opacity: 0 }
        }
        transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center w-full h-full"
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          animate={
            isInView
              ? { y: 0, opacity: 1, scale: 1 }
              : { y: 50, opacity: 0, scale: 0.9 }
          }
          transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
        >
          <ScrollReveal
            baseOpacity={0.1}
            enableBlur
            baseRotation={3}
            blurStrength={4}
            className="leading-[1.18] whitespace-pre text-[36px] md:text-[42px] lg:text-[48px] font-sf-pro-heavy font-black tracking-[-0.9px] text-center mx-auto text-white"
          >
            사람을 위한 기술, 함께 숨쉬는 공간.
          </ScrollReveal>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

// Section 5 - Brand
const BrandSection = () => {
  return (
    <section className="bg-black relative min-h-screen overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 w-full h-full">
        <Aurora
          colorStops={["#000000", "#858585", "#ffffff"]}
          blend={0.5}
          amplitude={1.0}
          speed={1}
        />
      </div>

      <div className="relative z-10 max-w-[1512px] mx-auto px-4 h-full flex items-center justify-center">
        <div className="flex flex-col items-center text-center">
          {/* Brand Logo/Vector */}
          <motion.div
            className="flex items-center justify-center mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <img
              alt="NOOS Brand Vector"
              className="block max-w-none"
              height="92"
              src={imgVector}
              width="136"
            />
          </motion.div>

          {/* Brand Title */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          >
            <h1 className="font-cardinal-fruit text-3xl md:text-4xl lg:text-[50px] xl:text-[58px] text-white text-center leading-tight drop-shadow-2xl">
              Project : NOOS
            </h1>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Section 6 - Gallery
const GallerySection = () => {
  return (
    <section className="bg-black relative py-14 min-h-screen flex flex-col">
      {/* Header */}
      <div className="max-w-[1512px] mx-auto px-4 pt-10">
        <div className="text-center space-y-5">
          <div className="inline-flex items-center justify-center rounded-full border border-white/[0.26] bg-white/[0.04] px-4 py-2 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
            <span className="font-cardinal-fruit text-white/82 text-[11px] md:text-[12px] tracking-[0.16em] uppercase">
              Design
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="font-sf-pro-bold text-2xl md:text-3xl lg:text-4xl text-white text-center leading-[1.1] tracking-[-1.4px] font-bold">
              <div>광활하고도</div>
              <div>조용한 암흑으로부터.</div>
            </h2>

            <div className="font-freesentation text-[14px] md:text-[15px] text-[rgba(255,255,255,0.72)] text-center max-w-xl mx-auto space-y-1.5">
              <p>저희는 광활하고도 조용한, 암흑 속 우주에 대해</p>
              <p>디자인 영감을 받았습니다.</p>
              <p>각 행성별 테마를 느끼고, 떠나보세요.</p>
            </div>
          </div>

          <button
            type="button"
            className="group inline-flex items-center justify-center rounded-full border border-white/[0.3] bg-white/[0.06] px-6 py-2.5 backdrop-blur-xl transition-all duration-300 hover:bg-white hover:text-black"
          >
            <span className="font-cardinal-fruit text-[15px] md:text-[17px] text-white/82 tracking-[-0.08px] group-hover:text-black transition-colors duration-300">
              Discover More
            </span>
          </button>
        </div>
      </div>

      {/* CircularGallery - Full Width Below Button */}
      <div className="h-[530px] w-full -mt-12 md:-mt-16">
        <CircularGallery
          key="local-images-gallery"
          items={DEFAULT_GALLERY_ITEMS}
          bend={1.5}
          textColor="#ffffff"
          borderRadius={0.05}
          font="500 17px 'Cardinal Fruit'"
          scrollSpeed={2.5}
          scrollEase={0.08}
        />
      </div>
    </section>
  );
};

// Section 7 - Features
const FeaturesSection = () => {
  const headerRef = React.useRef(null);
  const bentoRef = React.useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.3 });
  const isBentoInView = useInView(bentoRef, { once: true, amount: 0.2 });

  return (
    <section className="bg-black relative py-12 md:py-16">
      <div className="max-w-[1220px] mx-auto px-4">
        {/* Header */}
        <motion.div
          ref={headerRef}
          className="text-center space-y-5 mb-8 md:mb-10"
          initial={{ opacity: 0, y: 80 }}
          animate={
            isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }
          }
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center justify-center rounded-full border border-white/[0.26] bg-white/[0.04] px-4 py-2 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              isHeaderInView
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.8 }
            }
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="font-cardinal-fruit text-white/82 text-[11px] md:text-[12px] tracking-[0.16em] uppercase">
              Features
            </span>
          </motion.div>

          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 30 }}
            animate={
              isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
            }
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.h2
              className="font-sf-pro-bold text-2xl md:text-3xl lg:text-[42px] text-white text-center leading-[1.06] tracking-[-0.02em] font-bold"
              initial={{ opacity: 0, x: -30 }}
              animate={
                isHeaderInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }
              }
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              강력한 기능.
            </motion.h2>
            <motion.h3
              className="font-cardinal-fruit text-2xl md:text-3xl lg:text-[40px] text-white/92 text-center leading-[1.06] tracking-[-0.02em]"
              initial={{ opacity: 0, x: 30 }}
              animate={
                isHeaderInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }
              }
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Project : NOOS
            </motion.h3>
            <motion.p
              className="mx-auto max-w-xl font-freesentation text-[13px] md:text-[14px] leading-[1.62] text-white/62"
              initial={{ opacity: 0, y: 12 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.6, delay: 0.95 }}
            >
              감정, 집중, 환경 데이터를 하나의 인터페이스로 정리해 즉시 반응하는 몰입 경험을 만듭니다.
            </motion.p>
          </motion.div>
        </motion.div>

        {/* MagicBento Grid */}
        <motion.div
          id="functions-section"
          ref={bentoRef}
          className="flex justify-center"
          initial={{ opacity: 0, y: 70, scale: 0.96 }}
          animate={
            isBentoInView
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 70, scale: 0.96 }
          }
          transition={{
            duration: 1,
            delay: 0.2,
            ease: "easeOut",
          }}
        >
          <div className="w-full max-w-[980px] rounded-none border border-white/[0.18] bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_34%,rgba(0,0,0,0.58)_100%)] p-1 md:p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.13)]">
            <MagicBento
              enableSpotlight={false}
              enableBorderGlow={true}
              enableStars={false}
              enableTilt={false}
              enableMagnetism={false}
              clickEffect={false}
              glowColor="255, 255, 255"
              particleCount={0}
              visualStyle="minimal"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Section 8 - Hardware Process
const HardwareSection = () => {
  const processes = [
    {
      number: "01",
      title: "Muse S Athena",
      description:
        "EEG와 fNIRS를 함께 활용해 집중·피로·회복 상태를 정밀하게 측정하는 뉴로 웨어러블.",
      image: imgImage22,
    },
    {
      number: "02",
      title: "AI Objet",
      description:
        "측정 데이터를 AI가 해석해 조명·사운드·습도·온도를 상황에 맞게 실시간으로 최적화.",
      image: imgImage23,
    },
    {
      number: "03",
      title: "Multi-Platform",
      description:
        "iOS, Android, Web을 하나의 흐름으로 연결해 어디서든 동일한 몰입 환경을 제공.",
      image: imgImage24,
    },
  ];

  const ProcessCard = ({ process, index }) => {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });

    return (
      <motion.div
        key={index}
        ref={ref}
        className="relative overflow-hidden border border-white/[0.12] bg-black"
        initial={{ opacity: 0, y: 52 }}
        animate={
          isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 52 }
        }
        transition={{
          duration: 0.55,
          delay: index * 0.1,
          ease: "easeOut",
        }}
      >
        {index === 0 && (
          <span className="pointer-events-none absolute -top-2.5 left-5 h-5 w-5 rounded-full border border-black bg-white" />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.12fr]">
          {/* Image Section */}
          <motion.div
            className="relative min-h-[180px] lg:min-h-[260px] xl:min-h-[300px] border-b lg:border-b-0 lg:border-r border-white/[0.12]"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.12 }}
          >
            <img
              src={process.image}
              alt={process.title}
              className="w-full h-full object-cover opacity-[0.88]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/18 via-transparent to-transparent" />
          </motion.div>

          <motion.div
            className="px-4 py-4 md:px-5 md:py-5 lg:px-6 lg:py-6"
            initial={{ opacity: 0, x: 14 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 14 }}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-4 md:gap-6 items-start">
              <div className="flex items-baseline gap-2 md:gap-2.5">
                <span className="font-cardinal-fruit text-[16px] md:text-[20px] leading-[0.95] tracking-[-0.01em] text-white/44">
                  {process.number}
                </span>
                <h3 className="font-freesentation-bold text-[20px] md:text-[26px] leading-[1.06] tracking-[-0.01em] text-white">
                  {process.title}
                </h3>
              </div>
              <div className="border-l border-white/[0.12] pl-4 md:pl-5">
                <p className="max-w-[34ch] font-freesentation text-[12px] md:text-[14px] leading-[1.52] text-[#7f7f83]">
                  {process.description}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  return (
    <section className="bg-black relative pt-14 pb-10 md:pt-20 md:pb-12">
      <div className="mx-auto w-full max-w-[1120px] px-4 md:px-5">
        <div className="mb-3.5 md:mb-4 border-b border-white/[0.14] pb-3 md:pb-3.5">
          <div className="flex justify-center">
            <div className="inline-flex items-center justify-center rounded-full border border-white/[0.24] bg-white/[0.04] px-5 py-2 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
              <p className="font-cardinal-fruit text-[12px] md:text-[13px] leading-none tracking-[0.14em] text-white/90 uppercase">
                Hardware
              </p>
            </div>
          </div>
          <div className="mt-3">
            <TrueFocus
              sentence="누구보다 빠르고 정확하게"
              manualMode={false}
              blurAmount={3.4}
              borderColor="rgba(255,255,255,0.45)"
              glowColor="rgba(255,255,255,0.24)"
              animationDuration={0.75}
              pauseBetweenAnimations={1.35}
              containerClassName="relative flex gap-3 justify-center items-center flex-wrap"
              wordClassName="relative font-freesentation-bold text-[22px] md:text-[30px] lg:text-[36px] leading-[1.06] text-white/72 tracking-[-0.015em] cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-2.5 md:space-y-3">
          {processes.map((process, index) => (
            <ProcessCard key={index} process={process} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Section 9 - Media Gallery
const MediaGallerySection = () => {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragBounds, setDragBounds] = useState({ min: 0, max: 0 });
  const viewportRef = React.useRef(null);
  const trackRef = React.useRef(null);
  const dragStartXRef = React.useRef(0);
  const dragStartOffsetRef = React.useRef(0);

  const cards = [
    {
      id: "focus-stream",
      image: imgSection9Modern1,
      title: ["Focus Stream", "몰입 레이어", "", "선명하게."],
    },
    {
      id: "ambient-grid",
      image: imgSection9Modern2,
      title: ["Ambient Grid", "반응 흐름", "", "정돈되게."],
    },
    {
      id: "archive",
      image: imgSection9Modern3,
      title: ["Focus Archive", "패턴 분석", "", "한눈에."],
    },
    {
      id: "control",
      image: imgSection9Modern4,
      title: ["Immersive Control", "기기 연결", "", "끊김 없이."],
    },
    {
      id: "unified-space",
      image: imgSection9Modern5,
      title: ["Unified Space", "플랫폼 경험", "", "하나로."],
    },
  ];

  const clampOffset = React.useCallback(
    (value) => Math.max(dragBounds.min, Math.min(dragBounds.max, value)),
    [dragBounds]
  );

  const updateDragBounds = React.useCallback(() => {
    if (!viewportRef.current || !trackRef.current) return;
    const viewportWidth = viewportRef.current.clientWidth;
    const trackWidth = trackRef.current.scrollWidth;
    const overflow = Math.max(0, trackWidth - viewportWidth);
    const nextBounds = { min: -overflow, max: 0 };
    setDragBounds(nextBounds);
    setDragOffset((prev) =>
      Math.max(nextBounds.min, Math.min(nextBounds.max, prev))
    );
  }, []);

  React.useEffect(() => {
    updateDragBounds();
    const raf = requestAnimationFrame(updateDragBounds);
    window.addEventListener("resize", updateDragBounds);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateDragBounds);
    };
  }, [updateDragBounds]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartOffsetRef.current = dragOffset;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStartXRef.current;
    setDragOffset(clampOffset(dragStartOffsetRef.current + delta));
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  return (
    <section className="bg-black relative py-20 min-h-screen flex items-center justify-center overflow-hidden">
      <div className="w-full">
        <div
          ref={viewportRef}
          className="mx-auto w-full max-w-[1500px] overflow-hidden px-4 select-none"
        >
          <div
            ref={trackRef}
            className={`flex w-max gap-4 ${isDragging ? "cursor-grabbing" : "cursor-grab"} transition-transform duration-200 ease-out`}
            style={{
              transform: `translateX(${dragOffset}px)`,
              transition: isDragging ? "none" : "transform 0.3s ease-out",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {cards.map((card, index) => (
              <div
                key={card.id}
                className="relative h-[480px] w-[720px] flex-shrink-0 overflow-hidden rounded-[28px] shadow-2xl"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${card.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/34 via-black/8 to-transparent" />
                <div
                  className={`absolute z-10 ${
                    index % 2 === 0 ? "top-12 left-12" : "bottom-12 left-12"
                  }`}
                >
                  <div className="font-sf-pro-bold text-[32px] leading-[40px] font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]">
                    {card.title.map((line, lineIndex) => (
                      <p key={`${card.id}-${lineIndex}`} className="mb-2">
                        {line || "\u00A0"}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Drag Hint */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <p className="text-white/60 text-sm font-cardinal-fruit">
          좌우로 드래그해보세요
        </p>
      </div>
    </section>
  );
};

// Section 10 - How it Works
const HowItWorksSection = () => {
  const steps = [
    {
      title: "측정하고, 바로 집중 시작.",
      description:
        "강력한 Muse S Athena의 뇌파 측정 기능을 이용하여, 최적화된 환경을 제공받아 바로 집중 시작.",
      image: imgTSbhXcBw10HvxPaJ6SsTtRiiplkPng,
      imageFit: "contain",
      frameClassName: "h-[360px] w-[520px]",
      reverse: false,
    },
    {
      title: "꿈에 그리던 우주여행을 현실로.",
      description:
        "집중, 휴식과 같은 테마별로 다른 행성을 여행하며 순간 집중, 편안한 휴식까지.",
      image: imgMX5DAhTlaceN4NDguCeAZcFbIPng,
      imageFit: "contain",
      frameClassName: "h-[360px] w-[520px]",
      reverse: true,
    },
    {
      title: "과연 과거는 과거일뿐?",
      description:
        "강력한 Dashboard기능을 통한 이번달의 나는 어땠는지 일순간에 확인.",
      image: img7VSjm6K3MAQqqM3HtSKme77ZhCsPng,
      reverse: false,
    },
  ];

  const StepCard = ({ step, index }) => {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });
    const imageFrameClassName =
      step.frameClassName ?? "h-[550.59px] w-[270px]";

    return (
      <motion.div
        key={index}
        ref={ref}
        className={`content-stretch flex gap-[20px] items-center justify-start relative shrink-0 w-full ${
          step.reverse ? "flex-row-reverse" : ""
        }`}
        initial={{ opacity: 0, y: 100 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
        transition={{
          duration: 0.8,
          delay: index * 0.2,
          ease: "easeOut",
          type: "spring",
          bounce: 0.2,
        }}
      >
        <motion.div
          className="flex items-center justify-center px-0 py-[40px] relative shrink-0 w-[497.78px]"
          initial={{ opacity: 0, x: step.reverse ? 50 : -50 }}
          animate={
            isInView
              ? { opacity: 1, x: 0 }
              : { opacity: 0, x: step.reverse ? 50 : -50 }
          }
          transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
        >
          <div
            className={`${imageFrameClassName} relative shrink-0 overflow-hidden rounded-lg`}
          >
            <img
              src={step.image}
              alt={step.title}
              className={`w-full h-full ${step.imageFit === "contain" ? "object-contain" : "object-cover"}`}
            />
          </div>
        </motion.div>
        <motion.div
          className="content-stretch flex flex-col gap-[15.095px] items-start justify-center relative shrink-0 w-[622.22px]"
          initial={{ opacity: 0, x: step.reverse ? -50 : 50 }}
          animate={
            isInView
              ? { opacity: 1, x: 0 }
              : { opacity: 0, x: step.reverse ? -50 : 50 }
          }
          transition={{ duration: 0.6, delay: index * 0.2 + 0.4 }}
        >
          <div className="content-stretch flex flex-col items-start justify-start min-w-[622.22px] relative shrink-0">
              <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full">
              <div className="capitalize flex flex-col font-sf-pro-bold justify-center leading-[0] relative shrink-0 text-[42px] text-nowrap text-white tracking-[-2.2px] font-bold">
                <p className="leading-[42px] whitespace-pre">{step.title}</p>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col items-start justify-start relative shrink-0">
            <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full">
              <div
                className="flex flex-col font-cardinal-fruit justify-center leading-[23px] relative shrink-0 text-[14px] text-[rgba(255,255,255,0.7)] text-nowrap whitespace-pre"
                style={{ fontVariationSettings: "'wght' 400" }}
              >
                <p className="leading-[23px]">{step.description}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <section className="bg-black relative py-20">
      <div className="box-border content-stretch flex flex-col gap-[140px] items-center justify-center px-[150px] py-[95px] relative size-full">
        <div className="content-stretch flex flex-col gap-[28px] items-center justify-center max-w-[500px] relative shrink-0 w-[500px]">
          <div className="box-border content-stretch flex items-center justify-center pb-[10px] pt-[9px] px-[18px] relative rounded-[100px] shrink-0 border border-[rgba(255,255,255,0.26)] bg-[rgba(255,255,255,0.03)]">
            <div className="content-stretch flex flex-col items-start justify-start relative shrink-0">
              <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full">
                <div className="capitalize flex flex-col font-cardinal-fruit font-medium justify-center leading-[0] not-italic relative shrink-0 text-[rgba(255,255,255,0.86)] text-[15px] text-nowrap tracking-[0.03em]">
                  <p className="leading-[17px] whitespace-pre text-[13px]">
                    How It Works
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full">
            <div className="content-stretch flex flex-col items-center justify-start relative shrink-0 w-full">
              <BlurText
                text="생각을 몰입으로,"
                delay={150}
                className="font-sf-pro-bold text-[38px] text-center text-white tracking-[-1.6px] font-bold leading-[40px]"
                animateBy="words"
                direction="top"
              />
            </div>
            <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4px] px-0 relative shrink-0 w-full">
              <div className="content-stretch flex flex-col items-center justify-start relative shrink-0 w-full space-y-4">
                <BlurText
                  text="감정을 인식으로"
                  delay={200}
                  className="font-sf-pro-bold text-[44px] text-center text-white tracking-[-1.8px] font-bold leading-[44px]"
                  animateBy="words"
                  direction="top"
                />
                <div className="whitespace-nowrap">
                  <BlurText
                    text="눈깜짝한 순간어느새 최적화."
                    delay={250}
                    className="font-sf-pro-bold text-[44px] text-center text-white tracking-[-1.8px] font-bold leading-[44px] whitespace-nowrap inline-flex"
                    animateBy="words"
                    direction="top"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[60px] items-start justify-start relative shrink-0 w-full">
          {steps.map((step, index) => (
            <StepCard key={index} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const PRICING_PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "Free",
    description: "Project NOOS 핵심 흐름을 가볍게 시작하는 플랜",
    features: ["웹 기반 기본 이용", "Solar Explorer 기본 접근", "기본 분석 결과 확인"],
    cta: "Start Basic",
    emphasis: "subtle",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9.99",
    description: "몰입 경험을 더 깊게 확장하는 고급 플랜",
    features: ["확장된 탐험/경험 흐름", "우선 기능 접근", "프리미엄 환경 연동 준비"],
    cta: "Start Pro",
    emphasis: "strong",
  },
];

// Section 11 - Pricing
const PricingSection = () => {
  const headerRef = React.useRef(null);
  const cardsRef = React.useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.3 });
  const isCardsInView = useInView(cardsRef, { once: true, amount: 0.2 });

  return (
    <section className="bg-black relative px-4 py-24 md:py-28">
      <div className="mx-auto max-w-[1360px]">
        <motion.div
          ref={headerRef}
          className="mx-auto mb-12 flex max-w-[980px] flex-col items-start gap-5 md:mb-14"
          initial={{ opacity: 0, y: 46 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 46 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <p className="font-cardinal-fruit text-[12px] uppercase tracking-[0.2em] text-[rgba(255,255,255,0.62)]">
            Pricing
          </p>
          <h2 className="font-sf-pro-heavy text-[38px] leading-[1.02] tracking-[-0.03em] text-white md:text-[62px]">
            당신을 위한 합리적 가격.
          </h2>
          <p className="max-w-[640px] font-freesentation text-[15px] leading-[1.7] text-[rgba(255,255,255,0.65)]">
            불필요한 장식을 덜어내고, 필요한 경험만 남긴 두 가지 플랜입니다.
          </p>
        </motion.div>

        <motion.div
          ref={cardsRef}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6"
          initial={{ opacity: 0, y: 70 }}
          animate={isCardsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 70 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
        >
          {PRICING_PLANS.map((plan, index) => {
            const isStrong = plan.emphasis === "strong";

            return (
              <motion.article
                key={plan.id}
                className={`relative overflow-hidden rounded-[30px] border p-7 md:p-10 ${
                  isStrong
                    ? "border-[rgba(255,255,255,0.48)] bg-[rgba(255,255,255,0.08)]"
                    : "border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.02)]"
                }`}
                initial={{ opacity: 0, x: index === 0 ? -40 : 40, y: 20 }}
                animate={
                  isCardsInView
                    ? { opacity: 1, x: 0, y: 0 }
                    : { opacity: 0, x: index === 0 ? -40 : 40, y: 20 }
                }
                transition={{ duration: 0.85, delay: 0.25 + index * 0.16, ease: "easeOut" }}
              >
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute left-0 top-0 h-[1px] w-full bg-[rgba(255,255,255,0.24)]" />
                  <div className="absolute left-0 top-0 h-full w-[1px] bg-[rgba(255,255,255,0.18)]" />
                </div>

                <div className="relative flex min-h-[340px] flex-col">
                  <div className="mb-10">
                    <p className="font-cardinal-fruit text-[13px] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.62)]">
                      {plan.name}
                    </p>
                    <p className="mt-3 font-sf-pro-heavy text-[46px] leading-none tracking-[-0.03em] text-white md:text-[58px]">
                      {plan.price}
                    </p>
                    <p className="mt-4 max-w-[380px] font-freesentation text-[15px] leading-[1.65] text-[rgba(255,255,255,0.72)]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-9 border-t border-[rgba(255,255,255,0.14)] pt-6">
                    <p className="mb-4 font-cardinal-fruit text-[12px] uppercase tracking-[0.16em] text-[rgba(255,255,255,0.58)]">
                      Included
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-3 font-freesentation text-[15px] leading-[1.6] text-[rgba(255,255,255,0.82)]"
                        >
                          <span className="mt-[9px] block h-[5px] w-[5px] shrink-0 rounded-full bg-[rgba(255,255,255,0.72)]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    className={`mt-auto inline-flex h-[48px] items-center justify-center rounded-full border px-7 font-cardinal-fruit text-[14px] uppercase tracking-[0.12em] transition-all duration-300 ${
                      isStrong
                        ? "border-white bg-white text-black hover:bg-[rgba(255,255,255,0.88)]"
                        : "border-[rgba(255,255,255,0.42)] bg-transparent text-white hover:border-white hover:bg-[rgba(255,255,255,0.12)]"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

// Section 12 - CTA
const CtaSection = () => {
  const ctaRef = React.useRef(null);
  const isCtaInView = useInView(ctaRef, { once: true, amount: 0.3 });

  return (
    <section id="contact-section" className="relative bg-black px-4 pb-10 pt-6 md:pb-14 md:pt-8">
      <motion.div
        ref={ctaRef}
        className="relative mx-auto max-w-[1360px] overflow-hidden border-t border-[rgba(255,255,255,0.2)] pt-10 md:pt-14"
        initial={{ opacity: 0, y: 54 }}
        animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 54 }}
        transition={{ duration: 0.95, ease: "easeOut" }}
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_12%,rgba(255,255,255,0.1),rgba(0,0,0,0)_46%)]" />

        <div className="relative z-10 grid grid-cols-1 gap-8 pb-2 md:grid-cols-[1.65fr_auto] md:items-end md:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={isCtaInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -28 }}
            transition={{ duration: 0.82, delay: 0.14, ease: "easeOut" }}
            className="flex flex-col"
          >
            <div>
              <p className="font-cardinal-fruit text-[12px] uppercase tracking-[0.2em] text-[rgba(255,255,255,0.58)]">
                Contact
              </p>
              <h3 className="mt-6 max-w-[720px] font-freesentation-bold text-[30px] leading-[1.22] text-white md:text-[42px] md:leading-[1.16]">
                불안정한 국제사회 속, 우리는 안정된 사회를 만들어나가기 위해 노력합니다.
              </h3>
            </div>

            <div className="mt-7 inline-flex w-fit items-center gap-3 rounded-full border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.03)] px-3 py-2">
              <div className="h-[34px] w-[34px] rounded-full border border-[rgba(255,255,255,0.28)] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.45),rgba(255,255,255,0.05))]" />
              <div className="flex flex-col">
                <span className="font-cardinal-fruit text-[13px] leading-none text-white">Team: AXIS</span>
                <span className="mt-1 font-cardinal-fruit text-[12px] leading-none text-[rgba(255,255,255,0.6)]">
                  Univ Student
                </span>
              </div>
            </div>
          </motion.div>

          <motion.button
            type="button"
            initial={{ opacity: 0, x: 28 }}
            animate={isCtaInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 28 }}
            transition={{ duration: 0.82, delay: 0.22, ease: "easeOut" }}
            className="inline-flex h-[48px] w-fit items-center justify-center rounded-full border border-white bg-white px-7 font-cardinal-fruit text-[14px] uppercase tracking-[0.14em] text-black transition-colors duration-300 hover:bg-[rgba(255,255,255,0.88)]"
          >
            Let&apos;s work together
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
};

// 부드러운 전환 효과 컴포넌트 (나중에 변경 예정)
const SmoothTransition = () => {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{ pointerEvents: 'none' }}
    />
  );
};

// Main App Component
function App() {
  const [showFirstLook, setShowFirstLook] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoginTransitioning, setIsLoginTransitioning] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
  // 주소창에서 파라미터들을 읽어옵니다.
  const loginStatus = searchParams.get('login');
  const isMain = searchParams.get('main');

  //소셜 로그인 성공 시 (?login=success)
  if (loginStatus === 'success') {
    setShowFirstLook(false); // 인트로 화면을 끄고
    setShowLogin(true);      // 로그인 컴포넌트(Login.jsx)를 강제로 띄움
  } 
  
  //메인 이동 시 (?main=true)
  else if (isMain === 'true') {
    setShowFirstLook(false);
  }
}, [searchParams]);

  const handleJumpToMain = () => {
    setIsTransitioning(true);

    // 부드러운 전환 후 메인 페이지 표시
    setTimeout(() => {
      setShowFirstLook(false);
      setIsTransitioning(false);
    }, 800); // 0.8초 후 전환 완료
  };

  const handleLoginClick = () => {
    setIsLoginTransitioning(true);

    // 부드러운 전환 후 로그인 페이지 표시
    setTimeout(() => {
      setShowLogin(true);
      setIsLoginTransitioning(false);
    }, 500); // 0.5초 후 전환 완료
  };

  const handleBackFromLogin = () => {
    setIsLoginTransitioning(true);

    // 부드러운 전환 후 메인 페이지로 복귀
    setTimeout(() => {
      setShowLogin(false);
      setIsLoginTransitioning(false);
    }, 500); // 0.5초 후 전환 완료
  };

  const handleNavigateFromLogin = (path) => {
    setIsLoginTransitioning(true);

    // Login 상태를 false로 변경하고 라우터 이동
    setTimeout(() => {
      setShowLogin(false);
      setIsLoginTransitioning(false);
      // basename을 고려한 URL로 이동
      const basename = window.location.pathname.startsWith('/figadev') ? '/figadev' : '';
      window.location.href = basename + path;
    }, 500);
  };

  if (showLogin) {
    return (
      <ClickSpark
        sparkColor='#fff'
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <Login onBack={handleBackFromLogin} onNavigate={handleNavigateFromLogin} />
        </motion.div>
      </ClickSpark>
    );
  }

  if (showFirstLook) {
    return (
      <ClickSpark
        sparkColor='#fff'
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <FirstLook onJump={handleJumpToMain} />
        {isTransitioning && <SmoothTransition />}
      </ClickSpark>
    );
  }

  return (
    <ClickSpark
      sparkColor='#fff'
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <motion.div
        className="App bg-black text-white h-screen overflow-y-auto overflow-x-hidden scroll-smooth snap-y snap-mandatory"
        style={{
          scrollBehavior: "smooth",
          scrollPaddingTop: "0px",
          willChange: "scroll-position",
          transform: "translateZ(0)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoginTransitioning ? 0 : 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {/* Login Transition Overlay */}
        {isLoginTransitioning && (
          <motion.div
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            />
          </motion.div>
        )}

      <div
        className="snap-start min-h-screen"
        style={{ willChange: "transform", backfaceVisibility: "hidden" }}
      >
        <HeroSection onLoginClick={handleLoginClick} />
      </div>
      <div
        className="snap-start min-h-screen pt-4 md:pt-6"
        style={{ willChange: "transform", backfaceVisibility: "hidden" }}
      >
        <AboutSection />
      </div>
      <div
        className="snap-start min-h-screen pt-4 md:pt-6"
        style={{ willChange: "transform", backfaceVisibility: "hidden" }}
      >
        <ProblemSection1 />
      </div>
      <div
        className="snap-start min-h-screen pt-4 md:pt-6"
        style={{ willChange: "transform", backfaceVisibility: "hidden" }}
      >
        <ProblemSection2 />
      </div>
      <div
        className="snap-start min-h-screen pt-4 md:pt-6"
        style={{ willChange: "transform", backfaceVisibility: "hidden" }}
      >
        <BrandSection />
      </div>
      <div
        className="snap-start min-h-screen pt-4 md:pt-6"
        style={{ willChange: "transform", backfaceVisibility: "hidden" }}
      >
        <GallerySection />
      </div>
      <div
        className="snap-start min-h-screen pt-4 md:pt-6"
        style={{ willChange: "transform", backfaceVisibility: "hidden" }}
      >
        <FeaturesSection />
      </div>
      <div
        className="snap-start min-h-screen pt-4 md:pt-6"
        style={{ willChange: "transform", backfaceVisibility: "hidden" }}
      >
        <HardwareSection />
      </div>
      <div
        className="snap-start min-h-screen pt-4 md:pt-6"
        style={{ willChange: "transform", backfaceVisibility: "hidden" }}
      >
        <MediaGallerySection />
      </div>
      <div
        className="snap-start min-h-screen pt-4 md:pt-6"
        style={{ willChange: "transform", backfaceVisibility: "hidden" }}
      >
        <HowItWorksSection />
      </div>
      <div
        className="snap-start min-h-screen pt-4 md:pt-6"
        style={{ willChange: "transform", backfaceVisibility: "hidden" }}
      >
        <PricingSection />
      </div>
      <div className="snap-end pt-4 md:pt-6">
        <CtaSection />
      </div>
    </motion.div>
    </ClickSpark>
  );
}

export default App;
