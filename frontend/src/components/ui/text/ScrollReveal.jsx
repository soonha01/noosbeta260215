import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";

export default function ScrollReveal({
  children,
  className = "",
  baseOpacity = 0.1,
  enableBlur = false,
  baseRotation = 0,
  blurStrength = 4,
  yOffset = 22,
  duration = 1,
  stagger = 0.025,
}) {
  const containerRef = useRef(null);
  const charRefs = useRef([]);

  const text = useMemo(() => {
    if (typeof children === "string") return children;
    return null;
  }, [children]);

  const chars = useMemo(() => {
    if (!text) return [];
    return Array.from(text);
  }, [text]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const targets = charRefs.current.filter(Boolean);
    const initialFilter = enableBlur ? `blur(${blurStrength}px)` : "blur(0px)";

    const ctx = gsap.context(() => {
      if (targets.length > 0) {
        gsap.set(targets, {
          opacity: baseOpacity,
          y: yOffset,
          rotation: baseRotation,
          filter: initialFilter,
          transformOrigin: "50% 100%",
          willChange: "transform, opacity, filter",
        });

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return;

            gsap.to(targets, {
              opacity: 1,
              y: 0,
              rotation: 0,
              filter: "blur(0px)",
              duration,
              ease: "power3.out",
              stagger,
            });

            observer.disconnect();
          },
          { threshold: 0.35 }
        );

        observer.observe(container);

        return () => observer.disconnect();
      }

      gsap.set(container, {
        opacity: baseOpacity,
        y: yOffset,
        rotation: baseRotation,
        filter: initialFilter,
        willChange: "transform, opacity, filter",
      });

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;

          gsap.to(container, {
            opacity: 1,
            y: 0,
            rotation: 0,
            filter: "blur(0px)",
            duration,
            ease: "power3.out",
          });

          observer.disconnect();
        },
        { threshold: 0.35 }
      );

      observer.observe(container);

      return () => observer.disconnect();
    }, container);

    return () => ctx.revert();
  }, [
    baseOpacity,
    baseRotation,
    blurStrength,
    chars.length,
    duration,
    enableBlur,
    stagger,
    yOffset,
  ]);

  charRefs.current = [];

  return (
    <div ref={containerRef} className={className}>
      {chars.length > 0 ? (
        chars.map((char, index) => (
          <span
            key={`${char}-${index}`}
            ref={(el) => {
              if (el) charRefs.current.push(el);
            }}
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))
      ) : (
        children
      )}
    </div>
  );
}
