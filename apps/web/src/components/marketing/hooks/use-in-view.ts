"use client";

import { useEffect, useState, type RefObject } from "react";

export function useInView<T extends Element>(ref: RefObject<T | null>, once = true): boolean {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const element = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSeen(true);
            if (once) {
              observer.disconnect();
            }
          } else if (!once) {
            setSeen(false);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once, ref]);

  return seen;
}
