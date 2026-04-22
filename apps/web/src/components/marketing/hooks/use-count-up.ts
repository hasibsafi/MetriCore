"use client";

import { useEffect, useState } from "react";

export function useCountUp(target: number, trigger: boolean, duration = 1200): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!trigger) {
      setValue(0);
      return;
    }

    let raf = 0;
    let start = 0;

    const step = (timestamp: number) => {
      if (!start) {
        start = timestamp;
      }
      const progress = Math.min(1, (timestamp - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setValue(target * eased);

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [duration, target, trigger]);

  return value;
}
