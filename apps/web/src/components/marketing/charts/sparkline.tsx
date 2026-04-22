"use client";

import { useEffect, useId, useState } from "react";

type SparklineProps = {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  trigger?: boolean;
};

export function Sparkline({
  data,
  color = "#0ea5e9",
  width = 120,
  height = 36,
  trigger = true
}: SparklineProps) {
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    if (!trigger) {
      setReveal(false);
      return;
    }

    let rafOne = 0;
    let rafTwo = 0;
    rafOne = requestAnimationFrame(() => {
      rafTwo = requestAnimationFrame(() => {
        setReveal(true);
      });
    });

    return () => {
      cancelAnimationFrame(rafOne);
      cancelAnimationFrame(rafTwo);
    };
  }, [trigger]);

  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  const areaPath = `M 0,${height} L ${points.join(" L ")} L ${width},${height} Z`;
  const linePoints = points.join(" ");
  const gradientId = useId().replace(/:/g, "");

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={areaPath}
        fill={`url(#${gradientId})`}
        style={{ opacity: reveal ? 1 : 0, transition: "opacity 800ms ease 200ms" }}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        points={linePoints}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={width * 2}
        strokeDashoffset={reveal ? 0 : width * 2}
        style={{ transition: "stroke-dashoffset 1100ms cubic-bezier(0.16,1,0.3,1)" }}
      />
    </svg>
  );
}
