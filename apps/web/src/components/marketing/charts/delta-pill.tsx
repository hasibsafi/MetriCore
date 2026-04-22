"use client";

type DeltaPillProps = {
  value: number;
  invert?: boolean;
};

export function DeltaPill({ value, invert = false }: DeltaPillProps) {
  const positive = invert ? value < 0 : value > 0;
  const neutral = Math.abs(value) < 0.1;

  const styles = neutral
    ? { background: "var(--bg-muted)", color: "var(--fg-muted)" }
    : positive
      ? { background: "var(--success-bg)", color: "var(--success-fg)" }
      : { background: "var(--danger-bg)", color: "var(--danger-fg)" };

  const arrow = neutral ? "—" : value > 0 ? "↑" : "↓";
  const sign = value > 0 ? "+" : "";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        borderRadius: 9999,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 600,
        ...styles
      }}
    >
      {arrow} {sign}
      {value.toFixed(1)}%
    </span>
  );
}
