"use client";

import { useLayoutEffect, useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import clsx from "clsx";

type Props = {
  children: ReactNode;
  as?: ElementType;
  /** up = fade+geser, mask = naik dari balik garis (untuk heading), line = garis memanjang */
  variant?: "up" | "mask" | "line";
  delay?: number;
  className?: string;
};

export default function Reveal({ children, as: Tag = "div", variant = "up", delay = 0, className }: Props) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const from =
        variant === "line"
          ? { scaleX: 0, transformOrigin: "left center" }
          : variant === "mask"
            ? { yPercent: 105 }
            : { y: 24, opacity: 0 };
      gsap.from(el, {
        ...from,
        duration: 0.45,
        delay: Math.min(delay, 0.15),
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 95%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [variant, delay]);

  const node = (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
  return variant === "mask" ? <span className={clsx("block overflow-hidden")}>{node}</span> : node;
}
