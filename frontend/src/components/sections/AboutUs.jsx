import React, { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DecryptedText from "../ui/text/DecryptedText";
import CircularText from "../ui/text/CircularText";
import FaultyTerminal from "../ui/effects/FaultyTerminal";
import ShineButton from "../ui/buttons/ShineButton";
import ArrowButton from "../ui/buttons/ArrowButton";
import { ChromaGrid } from "../ui/showcase/ChromaGrid";

gsap.registerPlugin(ScrollTrigger);

const TEAM_MEMBERS = [
  {
    image: "/media/team/suhwan.jpg",
    title: "전수환",
    subtitle: "Teamleader, AI Engineer, FrontEND",
    handle: "@suhw__an",
    borderColor: "#4F46E5",
    gradient: "linear-gradient(145deg, #4F46E5, #000)",
    url: "https://github.com/",
  },
  {
    image: "/media/team/김성은.JPG",
    title: "김성은",
    subtitle: "App developer(IOS,Android)",
    handle: "@s_ungeun318",
    borderColor: "#10B981",
    gradient: "linear-gradient(210deg, #10B981, #000)",
    url: "https://github.com/",
  },
  {
    image: "/media/team/권순하.JPG",
    title: "권순하",
    subtitle: "BackEND Developer, Dataset",
    handle: "@sunha",
    borderColor: "#F59E0B",
    gradient: "linear-gradient(165deg, #F59E0B, #000)",
    url: "https://github.com/",
  },
  {
    image: "/media/team/박지호.JPG",
    title: "박지호",
    subtitle: "BackEND Developer, Dataset",
    handle: "@mmoo_0301",
    borderColor: "#06B6D4",
    gradient: "linear-gradient(135deg, #06B6D4, #000)",
    url: "https://github.com/",
  },
];

const BASE_FADE_IN = Object.freeze({ opacity: 0, y: 50 });
const BASE_FADE_OUT = Object.freeze({ opacity: 1, y: 0 });
const DEFAULT_TRANSITION = Object.freeze({ duration: 0.8 });
const VIEWPORT_ONCE = Object.freeze({ once: true });
const VISION_H2_SCROLL_TRIGGER = Object.freeze({
  start: "top 80%",
  end: "bottom 20%",
  toggleActions: "play none none reverse",
});
const VISION_P_SCROLL_TRIGGER = Object.freeze({
  start: "top 70%",
  end: "bottom 20%",
  toggleActions: "play none none reverse",
});
const FAULTY_TERMINAL_PROPS = Object.freeze({
  scale: 1.5,
  gridMul: [2, 1],
  digitSize: 1.2,
  timeScale: 0.5,
  pause: false,
  scanlineIntensity: 0.5,
  glitchAmount: 1,
  flickerAmount: 1,
  noiseAmp: 1,
  chromaticAberration: 0,
  dither: 0,
  curvature: 0.1,
  tint: "#A7EF9E",
  mouseReact: false,
  mouseStrength: 0.5,
  pageLoadAnimation: true,
  brightness: 0.6,
  dpr: 1,
});
const JOIN_BUTTON_CLASS =
  "h-12 px-8 border border-gray-500 bg-gray-600 text-white font-cardinal-fruit text-sm tracking-[0.08em] uppercase transition-all duration-300 " +
  "shadow-[0_0_14px_rgba(255,255,255,0.24),inset_0_0_8px_rgba(255,255,255,0.08)] hover:bg-gray-500 hover:border-gray-300 " +
  "hover:shadow-[0_0_24px_rgba(255,255,255,0.38),inset_0_0_12px_rgba(255,255,255,0.14)]";

const AboutUs = () => {
  const navigate = useNavigate();
  const visionTitleRef = useRef(null);
  const visionContentRef = useRef(null);
  const handleGoHome = useCallback(() => {
    navigate("/?main=true");
  }, [navigate]);

  useEffect(() => {
    if (!visionTitleRef.current || !visionContentRef.current) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        visionTitleRef.current,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: visionTitleRef.current,
            ...VISION_H2_SCROLL_TRIGGER,
          },
        }
      );

      gsap.fromTo(
        visionContentRef.current,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: visionTitleRef.current,
            ...VISION_P_SCROLL_TRIGGER,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-y-auto">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Static Background */}
        <div className="absolute inset-0">
          <img
            src="/media/home/about%20us.png"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Additional gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black/55"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed top-6 left-6 z-50"
          >
            <ArrowButton onClick={handleGoHome}>
              홈으로 돌아가기
            </ArrowButton>
          </motion.div>

          <motion.div
            initial={BASE_FADE_IN}
            animate={BASE_FADE_OUT}
            transition={DEFAULT_TRANSITION}
            className="mb-6 flex justify-center"
          >
            <div className="relative flex h-[260px] w-[260px] items-center justify-center">
              <CircularText
                text="TEAM:AXIS*TEAM:AXIS*TEAM:AXIS*"
                onHover="speedUp"
                spinDuration={20}
                className="team-axis-circular"
              />
              <h1 className="pointer-events-none absolute text-[1.9rem] md:text-[2.5rem] lg:text-[2.9rem] font-black text-center text-white font-cardinal-fruit">
                Team:AXIS
              </h1>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Vision Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <FaultyTerminal {...FAULTY_TERMINAL_PROPS} />
        </div>
        <div className="absolute inset-0 bg-black/58" aria-hidden="true" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="mb-20 text-center">
            <h2
              ref={visionTitleRef}
              className="font-cardinal-fruit text-4xl md:text-6xl lg:text-7xl text-white mb-8"
            >
              Our Vision
            </h2>
            <p
              ref={visionContentRef}
              className="font-cardinal-fruit text-base md:text-lg text-white/80 leading-relaxed max-w-4xl mx-auto"
            >
              불안정한 국제 사회 속, 우주와 같은 고요와 안정을 선사한다
            </p>
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={DEFAULT_TRANSITION}
            viewport={VIEWPORT_ONCE}
            className="font-cardinal-fruit text-4xl md:text-6xl text-center mb-16 text-white"
          >
            Teammates
          </motion.h2>

          {/* ChromaGrid로 팀원 표시 */}
          <motion.div
            initial={BASE_FADE_IN}
            whileInView={BASE_FADE_OUT}
            transition={DEFAULT_TRANSITION}
            viewport={VIEWPORT_ONCE}
            className="max-w-6xl mx-auto"
          >
            <ChromaGrid
              items={TEAM_MEMBERS}
              columns={4}
              rows={1}
              radius={250}
              damping={0.4}
              fadeOut={0.7}
              className="min-h-[400px]"
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={BASE_FADE_IN}
            whileInView={BASE_FADE_OUT}
            transition={DEFAULT_TRANSITION}
            viewport={VIEWPORT_ONCE}
          >
            <h2 className="font-cardinal-fruit text-3xl md:text-5xl text-white mb-8">
              <DecryptedText
                text="Join Our Journey"
                className="text-white"
                animateOn="view"
                sequential={true}
                speed={80}
                maxIterations={8}
              />
            </h2>
            <p className="font-inter text-base md:text-lg text-gray-300 mb-12 leading-relaxed">
              함께 미래를 만들어갈 동료를 찾고 있습니다. 혁신적인 기술로 세상을
              변화시키고 싶다면 언제든 연락주세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                type="button"
                className={JOIN_BUTTON_CLASS}
              >
                팀 합류하기
              </button>
              <ShineButton>프로젝트 문의</ShineButton>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
