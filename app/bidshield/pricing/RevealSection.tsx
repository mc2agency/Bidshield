"use client";

import { useRef, useEffect } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function RevealSection({ children, className = "", delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect user's motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Apply initial hidden state after mount (so SSR content is visible by default)
    el.style.opacity = "0";
    el.style.transform = "translateY(14px)";
    el.style.transition = `opacity 0.22s ease-out ${delay}ms, transform 0.22s ease-out ${delay}ms`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px 0px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
