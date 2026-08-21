"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type Direction = "up" | "left" | "right";

const HIDDEN_OFFSET: Record<Direction, string> = {
  up: "translate-y-10",
  left: "-translate-x-10",
  right: "translate-x-10",
};

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Reveals its children once, the first time they scroll into view — items
// from the side (direction="left"/"right") slide in from that side, items
// in the middle (direction="up", the default) rise up from below. Not used
// on the Program section per instruction.
export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Lazy initializer (not a setState call inside the effect) so reduced-
  // motion users skip the hidden starting state entirely — nothing to
  // reveal, nothing to flash.
  const [visible, setVisible] = useState(prefersReducedMotion);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-x-0 translate-y-0 opacity-100" : `opacity-0 ${HIDDEN_OFFSET[direction]}`
      } ${className}`}
    >
      {children}
    </div>
  );
}
