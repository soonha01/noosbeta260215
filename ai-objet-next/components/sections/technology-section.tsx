"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function ScrollRevealText({ text }: { text: string }) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Slower animation - more viewport range
      const startOffset = windowHeight * 0.9;
      const endOffset = windowHeight * 0.1;

      const totalDistance = startOffset - endOffset;
      const currentPosition = startOffset - rect.top;

      const newProgress = Math.max(0, Math.min(1, currentPosition / totalDistance));
      setProgress(newProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const words = text.split(" ");

  return (
    <p
      ref={containerRef}
      className="text-3xl font-semibold leading-snug text-white md:text-4xl lg:text-5xl"
    >
      {words.map((word, index) => {
        // Calculate blur and opacity based on scroll progress
        const appearProgress = progress * (words.length + 1);
        const wordAppearProgress = Math.max(0, Math.min(1, appearProgress - index));
        const wordOpacity = wordAppearProgress;
        const wordBlur = (1 - wordAppearProgress) * 40;

        return (
          <span
            key={index}
            className="inline-block"
            style={{
              opacity: wordOpacity,
              filter: `blur(${wordBlur}px)`,
              transition: 'opacity 0.1s linear, filter 0.1s linear',
              marginRight: '0.3em',
            }}
          >
            {word}
          </span>
        );
      })}
    </p>
  );
}

const sideImages = [
  {
    src: "/images/noos-side-light-channel.png",
    alt: "NOOS AI Objet 조명 채널 디테일 렌더",
    position: "left",
  },
  {
    src: "/images/noos-side-service-bay.png",
    alt: "NOOS AI Objet 후면 서비스 베이 렌더",
    position: "right",
  },
];

const soundSideImages = [
  {
    src: "/images/noos-sound-side-speaker.png",
    alt: "NOOS AI Objet 스피커 타공 사운드 디테일 렌더",
    position: "left",
  },
  {
    src: "/images/noos-sound-side-room.png",
    alt: "NOOS AI Objet 어쿠스틱 공간 사운드 렌더",
    position: "right",
  },
];

const featureSlides = [
  {
    title: "개인화된 아름다운 RGBW 조명.",
    src: "/images/noos-feature-scene-light.png",
    alt: "NOOS AI Objet RGBW 조명 상업 사진 렌더",
  },
  {
    title: "실시간 웹 연동.",
    src: "/images/noos-feature-scene-web.png",
    alt: "NOOS AI Objet 실시간 웹 연동 상업 사진 렌더",
  },
  {
    title: "개인화된 음악 경험",
    src: "/images/noos-feature-scene-sound.png",
    alt: "NOOS AI Objet 사운드 상업 사진 렌더",
  },
];

export function TechnologySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const descriptionText = "NOOS AI Objet는 전면 초승달형 조명 채널로 공간을 넓고 부드럽게 채우고, 웹 세션과 실시간으로 연동되어 상태 변화에 맞춰 조명과 음악을 제공, 조절합니다. 내부 사운드 구조는 ACE-Step으로 생성한 음악이 오브제 안에서 자연스럽게 퍼지도록 계획했고, 후면 서비스 베이와 흡배기 구조는 실제 프로토타입 운용을 위한 접근성, 쾌적성을 확보합니다.";

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const scrollableHeight = window.innerHeight * 4; // Increased for 3 text cycles
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));

      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Title fades out first (0 to 0.2)
  const titleOpacity = Math.max(0, 1 - (scrollProgress / 0.2));

  // Image transforms start after title fades (0.2 to 1)
  const imageProgress = Math.max(0, Math.min(1, (scrollProgress - 0.2) / 0.8));

  // Smooth interpolations
  const centerWidth = 100 - (imageProgress * 58); // 100% to 42%
  const centerHeight = 100 - (imageProgress * 30); // 100% to 70%
  const sideWidth = imageProgress * 22; // 0% to 22%
  const sideOpacity = imageProgress;
  const sideTranslateLeft = -100 + (imageProgress * 100); // -100% to 0%
  const sideTranslateRight = 100 - (imageProgress * 100); // 100% to 0%
  const gap = imageProgress * 16; // 0px to 16px
  const soundSideProgress = Math.max(0, Math.min(1, (scrollProgress - 2 / featureSlides.length) / 0.18));

  return (
    <section id="hardware" ref={sectionRef} className="relative bg-foreground">
      {/* Sticky container for scroll animation */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="flex h-full w-full items-center justify-center">
          {/* Bento Grid Container */}
          <div
            className="relative flex h-full w-full items-stretch justify-center"
            style={{ gap: `${gap}px`, padding: `${imageProgress * 16}px` }}
          >

            {/* Left Column */}
            <div
              className="relative overflow-hidden will-change-transform"
              style={{
                width: `${sideWidth}%`,
                height: "100%",
                transform: `translateX(${sideTranslateLeft}%)`,
                opacity: sideOpacity,
              }}
            >
              {sideImages.filter(img => img.position === "left").map((img, idx) => (
                <Image
                  key={idx}
                  src={img.src || "/placeholder.svg"}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  style={{
                    opacity: 1 - soundSideProgress,
                    transition: 'opacity 0.45s ease',
                  }}
                />
              ))}
              {soundSideImages.filter(img => img.position === "left").map((img, idx) => (
                <Image
                  key={`sound-${idx}`}
                  src={img.src || "/placeholder.svg"}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  style={{
                    opacity: soundSideProgress,
                    transition: 'opacity 0.45s ease',
                  }}
                />
              ))}
            </div>

            {/* Main Center Image */}
            <div
              className="relative overflow-hidden will-change-transform"
              style={{
                width: `${centerWidth}%`,
                height: "100%",
                flex: "0 0 auto",
              }}
            >
              {featureSlides.map((slide, index) => (
                <Image
                  key={slide.title}
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  className={`${index === 0 ? "" : "absolute inset-0 "}object-cover`}
                  style={{
                    opacity: index === 0 ? 1 : Math.max(0, Math.min(1, (scrollProgress - index / featureSlides.length) / 0.16)),
                    transition: 'opacity 0.4s ease',
                  }}
                />
              ))}

              <div className="absolute inset-0 bg-foreground/40" />

              {/* Title Text - Cycles through 3 texts with blur effect */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
              >
                {featureSlides.map((slide, cycleIndex) => {
                  // Each text cycle takes 1/3 of the scroll progress
                  const cycleStart = cycleIndex / featureSlides.length;
                  const cycleEnd = (cycleIndex + 1) / featureSlides.length;

                  const words = slide.title.split(" ");

                  return (
                    <h2
                      key={cycleIndex}
                      className="absolute max-w-3xl font-medium leading-tight tracking-tight text-white md:text-5xl lg:text-7xl text-5xl"
                    >
                      {words.map((word, wordIndex) => {
                        let wordOpacity = 0;
                        let wordBlur = 40;

                        if (scrollProgress >= cycleStart && scrollProgress < cycleEnd) {
                          const localProgress = (scrollProgress - cycleStart) / (cycleEnd - cycleStart);

                          // First half: appear (blur 40→0, opacity 0→1)
                          if (localProgress < 0.5) {
                            const appearProgress = (localProgress / 0.5) * (words.length + 1);
                            const wordAppearProgress = Math.max(0, Math.min(1, appearProgress - wordIndex));
                            wordOpacity = wordAppearProgress;
                            wordBlur = (1 - wordAppearProgress) * 40;
                          }
                          // Second half: disappear (blur 0→40, opacity 1→0)
                          else {
                            const disappearProgress = ((localProgress - 0.5) / 0.5) * (words.length + 1);
                            const wordDisappearProgress = Math.max(0, Math.min(1, disappearProgress - wordIndex));
                            wordOpacity = 1 - wordDisappearProgress;
                            wordBlur = wordDisappearProgress * 40;
                          }
                        }

                        return (
                          <span
                            key={wordIndex}
                            className="inline-block"
                            style={{
                              opacity: wordOpacity,
                              filter: `blur(${wordBlur}px)`,
                              transition: 'opacity 0.1s linear, filter 0.1s linear',
                              marginRight: '0.3em',
                            }}
                          >
                            {word}
                          </span>
                        );
                      })}
                    </h2>
                  );
                })}
              </div>
            </div>

            {/* Right Column */}
            <div
              className="relative overflow-hidden will-change-transform"
              style={{
                width: `${sideWidth}%`,
                height: "100%",
                transform: `translateX(${sideTranslateRight}%)`,
                opacity: sideOpacity,
              }}
            >
              {sideImages.filter(img => img.position === "right").map((img, idx) => (
                <Image
                  key={idx}
                  src={img.src || "/placeholder.svg"}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  style={{
                    opacity: 1 - soundSideProgress,
                    transition: 'opacity 0.45s ease',
                  }}
                />
              ))}
              {soundSideImages.filter(img => img.position === "right").map((img, idx) => (
                <Image
                  key={`sound-${idx}`}
                  src={img.src || "/placeholder.svg"}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  style={{
                    opacity: soundSideProgress,
                    transition: 'opacity 0.45s ease',
                  }}
                />
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Scroll space to enable animation - increased for 3 text cycles */}
      <div className="h-[400vh]" />

      {/* Description Section with Background Image and Scroll Reveal */}
      <div
        className="relative overflow-hidden px-6 py-24 md:px-12 md:py-32 lg:px-20 lg:py-40 bg-black"
      >
        {/* Gradient Overlay - Top to transparent */}
        <div
          className="absolute top-0 left-0 right-0 z-0 pointer-events-none"
          style={{
            height: '150px',
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)'
          }}
        />

        {/* Text Content */}
        <div className="relative z-10 mx-auto max-w-4xl">
          <ScrollRevealText text={descriptionText} />
        </div>
      </div>
    </section>
  );
}
