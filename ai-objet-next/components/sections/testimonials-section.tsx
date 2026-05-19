"use client";

import Image from "next/image";

export function TestimonialsSection() {
  return (
    <section id="about" className="bg-background">
      {/* About Image with Text Overlay */}
      <div className="relative aspect-[16/9] w-full">
        <Image
          src="/images/hero-noos-objet.png"
          alt="NOOS AI Objet 제품 렌더"
          fill
          className="object-cover"
        />
        {/* Fade gradient overlay - dark at bottom fading to transparent at top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Text Overlay */}
        <div className="absolute inset-0 flex items-end justify-center px-6 pb-16 md:px-12 md:pb-24 lg:px-20 lg:pb-32">
          <p className="mx-auto max-w-5xl text-2xl leading-relaxed text-white md:text-3xl lg:text-[2.5rem] lg:leading-snug text-center">
            겉으로는 스피커처럼 보이지만, 안쪽은 연산, 제어, 센싱, 전원, 냉각, 배선까지 모든 하드웨어요소들을 품는 하드웨어입니다. Objet는 이 하드웨어들을 통해 상태 인식 결과를 빛과 소리의 경험으로 전환, 제공합니다.
          </p>
        </div>
      </div>
    </section>
  );
}
