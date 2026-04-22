"use client";

import { useEffect, useState } from "react";

type BarDatum = {
  label: string;
  [key: string]: string | number;
};

type AnimatedBarChartProps = {
  data: BarDatum[];
  keys: string[];
  colors: string[];
  height?: number;
  trigger?: boolean;
  yFormatter?: (value: number) => string;
};

export function AnimatedBarChart({
  data,
  keys,
  colors,
  height = 220,
  trigger = true,
  yFormatter
}: AnimatedBarChartProps) {
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

  const width = 640;
  const chartHeight = height;
  const pad = { l: 40, r: 16, t: 14, b: 28 };
  const max =
    Math.max(
      ...data.flatMap((datum) => keys.map((key) => Number(datum[key] ?? 0))),
      1
    ) * 1.1;
  const innerWidth = width - pad.l - pad.r;
  const groupWidth = innerWidth / data.length;
  const barWidth = Math.max((groupWidth - 8) / keys.length, 4);
  const yFor = (value: number) => pad.t + (chartHeight - pad.t - pad.b) * (1 - value / max);
  const baseline = chartHeight - pad.b;
  const gridFractions = [0, 0.5, 1];
  const gridYs = gridFractions.map((fraction) => pad.t + (chartHeight - pad.t - pad.b) * fraction);

  return (
    <svg viewBox={`0 0 ${width} ${chartHeight}`} width="100%" height={chartHeight} style={{ display: "block" }}>
      {gridYs.map((y, index) => (
        <line
          key={index}
          x1={pad.l}
          x2={width - pad.r}
          y1={y}
          y2={y}
          stroke="var(--chart-grid, #e2e8f0)"
          strokeDasharray="3 3"
        />
      ))}

      {gridFractions.map((fraction, index) => {
        const value = Math.round(max * (1 - fraction));
        const label = yFormatter
          ? yFormatter(value)
          : value >= 1000
            ? `${(value / 1000).toFixed(1)}k`
            : String(value);
        return (
          <text
            key={index}
            x={pad.l - 8}
            y={gridYs[index] + 4}
            fontSize="11"
            fill="var(--chart-axis, #64748b)"
            textAnchor="end"
          >
            {label}
          </text>
        );
      })}

      {data.map((datum, index) => {
        const groupX = pad.l + index * groupWidth + 4;
        return (
          <g key={index}>
            {keys.map((key, keyIndex) => {
              const value = Number(datum[key] ?? 0);
              const y = yFor(value);
              const barHeight = reveal ? baseline - y : 0;

              return (
                <rect
                  key={key}
                  x={groupX + keyIndex * barWidth}
                  y={reveal ? y : baseline}
                  width={barWidth - 3}
                  height={barHeight}
                  fill={colors[keyIndex]}
                  rx="3"
                  style={{
                    transition: `y 900ms cubic-bezier(0.16,1,0.3,1) ${index * 40}ms, height 900ms cubic-bezier(0.16,1,0.3,1) ${index * 40}ms`
                  }}
                />
              );
            })}
            <text
              x={groupX + groupWidth / 2 - 4}
              y={chartHeight - 8}
              fontSize="11"
              fill="var(--chart-axis, #64748b)"
              textAnchor="middle"
            >
              {datum.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
