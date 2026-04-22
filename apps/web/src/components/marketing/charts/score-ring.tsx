"use client";

import { useEffect, useState } from "react";

type ScoreRingProps = {
  value?: number;
  size?: number;
  stroke?: number;
  label?: string;
  trigger?: boolean;
  color?: string;
};

export function ScoreRing({
  value = 92,
  size = 140,
  stroke = 10,
  label = "Performance",
  trigger = true,
  color = "#0ea5e9"
}: ScoreRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!trigger) {
      setShown(0);
      return;
    }

    let raf = 0;
    let start = 0;

    const step = (timestamp: number) => {
      if (!start) {
        start = timestamp;
      }

      const progress = Math.min(1, (timestamp - start) / 1400);
      const eased = 1 - (1 - progress) ** 3;
      setShown(value * eased);

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(step);
    });

    return () => cancelAnimationFrame(raf);
  }, [trigger, value]);

  const offset = circumference - (shown / 100) * circumference;

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        flexShrink: 0
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--chart-grid, #e2e8f0)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 600,
            color: "var(--fg-primary)"
          }}
        >
          {Math.round(shown)}
        </div>
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--fg-muted)"
        }}
      >
        {label}
      </div>
    </div>
  );
}
