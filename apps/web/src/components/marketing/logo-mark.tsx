type LogoMarkProps = {
  size?: number;
};

export function LogoMark({ size = 24 }: LogoMarkProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        background: "var(--accent)",
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 6px rgba(14, 165, 233, 0.25)"
      }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 18h14" />
        <path d="M7 15l4-4 3 3 4-6" />
      </svg>
    </div>
  );
}
