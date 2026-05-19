"use client";

import { FadeImage } from "@/components/fade-image";

const features = [
  {
    image: "/images/featured-noos-objet-01.png",
    span: "col-span-2 row-span-2", // Large
  },
  {
    image: "/images/featured-noos-objet-02.png",
    span: "col-span-1 row-span-1", // Small
  },
  {
    image: "/images/featured-noos-objet-03.png",
    span: "col-span-1 row-span-1", // Small
  },
  {
    image: "/images/featured-noos-objet-04.png",
    span: "col-span-1 row-span-2", // Tall
  },
  {
    image: "/images/featured-noos-objet-05.png",
    span: "col-span-1 row-span-1", // Small
  },
  {
    image: "/images/featured-noos-objet-06.png",
    span: "col-span-2 row-span-1", // Wide
  },
  {
    image: "/images/featured-noos-objet-07.png",
    span: "col-span-1 row-span-1", // Small
  },
  {
    image: "/images/featured-noos-objet-08.png",
    span: "col-span-1 row-span-2", // Tall
  },
  {
    image: "/images/featured-noos-objet-09.png",
    span: "col-span-2 row-span-1", // Wide
  },
  {
    image: "/images/featured-noos-objet-10.png",
    span: "col-span-1 row-span-1", // Small
  },
];

export function FeaturedProductsSection() {
  return (
    <section id="form" className="relative bg-background py-20 md:py-32">
      <div className="px-4 md:px-12 lg:px-20">
        <div className="mx-auto mb-10 flex w-full max-w-7xl flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-3xl text-3xl font-medium tracking-tight text-foreground md:text-5xl">
            외형과 내부 구조를 함께 보는 설계 스케치
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            사용자가 보게 될 바디와 제작자가 확인해야 할 포트, 흡배기, LED 채널, 내부 부품 배치를 스케치로 미리 설계해보았습니다.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-7xl mx-auto auto-rows-[180px] md:auto-rows-[220px]">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-lg border border-gray-200 ${feature.span}`}
            >
              <FadeImage
                src={feature.image || "/placeholder.svg"}
                alt={`NOOS AI Objet 설계 참고 이미지 ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
