"use client";

import Image from "next/image";

const flow = [
  {
    step: "01",
    title: "상태 입력",
    body: "Muse S Athena EEG, 설문, 사용자 피드백을 바탕으로 현재 정서와 각성 상태를 읽습니다.",
  },
  {
    step: "02",
    title: "개입 계획",
    body: "NOOS AI가 상태를 해석하고 행성 테마, 조명 색, 음악 방향, 세션 흐름을 결정합니다.",
  },
  {
    step: "03",
    title: "콘텐츠 생성",
    body: "ACE-Step 기반 음악 생성과 WiZ/ESP32 조명 제어가 사용자의 공간에 맞게 실행됩니다.",
  },
  {
    step: "04",
    title: "오브제 출력",
    body: "AI Objet는 빛, 소리, 상태 피드백을 담는 물리적 인터페이스로 사용자의 주변에 놓입니다.",
  },
];

const specs = [
  { label: "AI 연산", value: "Jetson" },
  { label: "제어 MCU", value: "ESP32" },
  { label: "상태 입력", value: "Muse" },
  { label: "출력", value: "빛" },
];

export function EditorialSection() {
  return (
    <section id="system" className="bg-background">
      <div className="grid border-t border-border lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col justify-center px-6 py-20 md:px-12 lg:px-20 lg:py-28">
          <p className="text-sm font-medium text-muted-foreground">NOOS 시스템의 물리 인터페이스</p>
          <h2 className="mt-5 max-w-3xl text-3xl font-medium leading-tight tracking-tight text-foreground md:text-5xl">
            AI가 만든 세션을 집 안의 빛과 소리로 바꾸는 오브제
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            NOOS AI Objet는 Muse EEG와 피드백으로 읽은 사용자 상태를 조명, 음악, 환경 반응으로 이어 주는 집 안의 출력 장치입니다. 사용자가 화면을 계속 보지 않아도 세션의 변화가 오브제의 빛과 사운드로 자연스럽게 공간에 남도록 설계했습니다.
          </p>
        </div>

        <div className="relative min-h-[420px] overflow-hidden bg-secondary lg:min-h-[620px]">
          <Image
            src="/images/noos-system-role-home.png"
            alt="NOOS AI Objet 거실 배치 시스템 역할 렌더"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="grid border-t border-border md:grid-cols-4">
        {flow.map((item) => (
          <div key={item.step} className="border-b border-r border-border p-6 last:border-r-0 md:border-b-0 md:p-8">
            <p className="text-xs font-medium text-muted-foreground">{item.step}</p>
            <h3 className="mt-6 text-xl font-medium text-foreground">{item.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 border-t border-border md:grid-cols-4">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="border-b border-r border-border p-8 text-center last:border-r-0 md:border-b-0"
          >
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
              {spec.label}
            </p>
            <p className="text-4xl font-medium text-foreground md:text-5xl">
              {spec.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
