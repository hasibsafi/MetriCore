"use client";

import { useEffect, useId, useState } from "react";

type Datum = Record<string, number | string | undefined>;

type AreaLineChartProps = {
  data: Datum[];
  seriesKeys?: string[];
  colors?: string[];
  height?: number;
  labels?: string[];
  yMax?: number;
  trigger?: boolean;
  showArea?: boolean;
};

export function AreaLineChart({
  data,
  seriesKeys = ["v1"],
  colors = ["#0ea5e9", "#38bdf8"],
  height = 240,
  labels = [],
  yMax,
  trigger = true,
  showArea = true
}: AreaLineChartProps) {
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
    yMax ??
    Math.max(
      ...data.flatMap((datum) => seriesKeys.map((key) => Number(datum[key] ?? 0))),
      1
    ) *
      1.08;
  const xStep = (width - pad.l - pad.r) / Math.max(data.length - 1, 1);
  const yFor = (value: number) => pad.t + (chartHeight - pad.t - pad.b) * (1 - value / max);
  const xFor = (index: number) => pad.l + index * xStep;
  const gridFractions = [0, 0.25, 0.5, 0.75, 1];
  const gridYs = gridFractions.map((fraction) => pad.t + (chartHeight - pad.t - pad.b) * fraction);
  const labelCount = Math.min(labels.length || data.length, 6);
  const labelIndices = Array.from({ length: labelCount }, (_, index) =>
    Math.round((index * (data.length - 1)) / Math.max(labelCount - 1, 1))
  );

  const gradientId = useId().replace(/:/g, "");
  const pathLength = width;

  return (
    <svg
      viewBox={`0 0 ${width} ${chartHeight}`}
      width="100%"
      height={chartHeight}
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={colors[0]} stopOpacity="0.22" />
          <stop offset="100%" stopColor={colors[0]} stopOpacity="0" />
        </linearGradient>
      </defs>

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
        const label = value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);

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

      {labelIndices.map((index) => {
        const datumLabel = labels[index] ?? data[index]?.label;
        const text = typeof datumLabel === "string" ? datumLabel : "";
        return (
          <text
            key={index}
            x={xFor(index)}
            y={chartHeight - 8}
            fontSize="11"
            fill="var(--chart-axis, #64748b)"
            textAnchor="middle"
          >
            {text}
          </text>
        );
      })}

      {seriesKeys.map((key, seriesIndex) => {
        const points = data.map((datum, index) => {
          const yValue = Number(datum[key] ?? 0);
          return `${xFor(index)},${yFor(yValue)}`;
        });
        const linePoints = points.join(" ");
        const firstValue = Number(data[0]?.[key] ?? 0);
        const areaPath = `M ${xFor(0)},${yFor(firstValue)} L ${points.join(" L ")} L ${xFor(
          data.length - 1
        )},${yFor(0)} Z`;
        const dash = seriesIndex > 0 ? "5 5" : undefined;

        return (
          <g key={key} style={{ opacity: trigger ? 1 : 0, transition: "opacity 400ms" }}>
            {seriesIndex === 0 && showArea ? (
              <path
                d={areaPath}
                fill={`url(#${gradientId})`}
                style={{ opacity: trigger ? 1 : 0, transition: "opacity 900ms ease 200ms" }}
              />
            ) : null}
            <polyline
              fill="none"
              stroke={colors[seriesIndex]}
              strokeWidth="2.2"
              strokeDasharray={dash ?? String(pathLength)}
              strokeDashoffset={reveal ? 0 : pathLength}
              style={{
                transition: `stroke-dashoffset 1400ms cubic-bezier(0.16,1,0.3,1) ${seriesIndex * 150}ms`
              }}
              points={linePoints}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {data.map((datum, index) => {
              const yValue = Number(datum[key] ?? 0);
              return (
                <circle
                  key={`${key}-${index}`}
                  cx={xFor(index)}
                  cy={yFor(yValue)}
                  r={seriesIndex === 0 ? 3 : 2.5}
                  fill={colors[seriesIndex]}
                  style={{
                    opacity: trigger ? 1 : 0,
                    transition: `opacity 300ms ease ${800 + index * 40}ms`
                  }}
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
