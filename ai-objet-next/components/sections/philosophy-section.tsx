"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { NoosHardwareLogo } from "@/components/noos-hardware-logo";

const titleItems = [
  { type: "text", value: "상태를 읽는 오브제." },
  { type: "text", value: "빛과 음악으로 개입." },
  { type: "text", value: "실제 부품을 위한 설계." },
  { type: "logo", value: "NOOS" },
];

export function PhilosophySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const [titleOpacity, setTitleOpacity] = useState(0);
  const [descriptionProgress, setDescriptionProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  const updateTransforms = useCallback(() => {
    if (!sectionRef.current) return;
    
    const rect = sectionRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const sectionHeight = sectionRef.current.offsetHeight;
    
    // Calculate progress based on scroll position
    const scrollableRange = sectionHeight - windowHeight;
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / scrollableRange));
    
    // Title rotates through each headline and finishes on the NOOS logo.
    setTitleOpacity(progress);

    // Description word animation
    if (descriptionRef.current) {
      const descRect = descriptionRef.current.getBoundingClientRect();
      const descTop = descRect.top;
      const descHeight = descRect.height;
      
      // Start animation when element enters viewport
      const startTrigger = windowHeight * 0.8;
      const endTrigger = windowHeight * 0.2;
      
      if (descTop < startTrigger && descTop > endTrigger - descHeight) {
        const descProgress = Math.max(0, Math.min(1, (startTrigger - descTop) / (startTrigger - endTrigger)));
        setDescriptionProgress(descProgress);
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      // Use requestAnimationFrame for smooth updates
      rafRef.current = requestAnimationFrame(updateTransforms);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateTransforms();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [updateTransforms]);

  return (
    <section id="products" className="bg-background">
      {/* Scroll-Animated Product Grid */}
      <div ref={sectionRef} className="relative" style={{ height: "240vh" }}>
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          <div className="relative w-full max-w-7xl px-4">
            {/* Title - centered with 3D rotation */}
            <div 
              className="flex items-center justify-center pointer-events-none"
              style={{ 
                perspective: '1000px',
              }}
            >
              <div className="relative w-full" style={{ transformStyle: 'preserve-3d', minHeight: '150px' }}>
                {titleItems.map((item, index) => {
                  // The final title remains visible at the end of the scroll cycle.
                  const isLastText = index === titleItems.length - 1;
                  
                  // Calculate which text should be visible based on scroll progress
                  const segmentSize = 1 / titleItems.length;
                  const startProgress = index * segmentSize;
                  const endProgress = (index + 1) * segmentSize;
                  
                  let rotateX = 0;
                  let opacity = 0;
                  
                  if (titleOpacity >= startProgress && titleOpacity < endProgress) {
                    // Active text - rotating in
                    const localProgress = (titleOpacity - startProgress) / segmentSize;
                    rotateX = (1 - localProgress) * 90;
                    opacity = localProgress;
                  } else if (titleOpacity >= endProgress) {
                    // Text that has passed - last text stays visible
                    if (isLastText) {
                      rotateX = 0;
                      opacity = 1;
                    } else {
                      rotateX = -90;
                      opacity = 0;
                    }
                  } else {
                    // Text that hasn't appeared yet
                    rotateX = 90;
                    opacity = 0;
                  }
                  
                  return (
                    <div 
                      key={index}
                      className="absolute inset-0 flex items-center justify-center text-[8vw] sm:text-[7vw] font-medium leading-tight tracking-tighter text-foreground md:text-[6vw] lg:text-[5vw] text-center px-4"
                      style={{
                        transform: `rotateX(${rotateX}deg) translateZ(0)`,
                        opacity,
                        transformStyle: 'preserve-3d',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        willChange: 'transform, opacity',
                        WebkitFontSmoothing: 'antialiased',
                      }}
                    >
                      {item.type === "logo" ? (
                        <>
                          <NoosHardwareLogo className="h-12 w-[244px] text-black sm:h-14 sm:w-[284px] md:h-16 md:w-[324px] lg:h-20 lg:w-[405px]" />
                          <span className="sr-only">NOOS</span>
                        </>
                      ) : (
                        <h2>{item.value}</h2>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div ref={descriptionRef} className="px-6 pt-8 pb-20 md:px-12 md:pt-12 md:pb-28 lg:px-20 lg:pt-16 lg:pb-36">
        <div className="text-center">
          
          <p className="mt-8 leading-relaxed text-muted-foreground text-3xl text-center">
            {("NOOS AI Objet는 Muse EEG와 설문으로 파악한 사용자의 상태를 음악, 조명, 환경 개입으로 이어 주는 물리적 인터페이스입니다. 외형은 조용한 오브제처럼 보이지만 내부는 Jetson Nano, ESP32, RGBW 디퓨저, 오디오, 전원, 흡배기, 서비스 접근을 기준으로 정리했습니다.").split(" ").map((word, index, array) => {
              const wordProgress = Math.max(0, Math.min(1, (descriptionProgress * array.length) - index));
              const opacity = wordProgress;
              const blur = (1 - wordProgress) * 40;
              
              return (
                <span
                  key={index}
                  style={{
                    opacity,
                    filter: `blur(${blur}px)`,
                    transition: 'opacity 0.3s ease, filter 0.3s ease',
                  }}
                >
                  {word}{index < array.length - 1 ? " " : ""}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    </section>
  );
}
