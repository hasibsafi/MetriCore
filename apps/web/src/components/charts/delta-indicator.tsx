type DeltaDirection = "up" | "down" | "flat";

type DeltaIndicatorProps = {
  percent: number;
  direction: DeltaDirection;
  invertSentiment?: boolean;
};

function getSentimentClass(percent: number, direction: DeltaDirection, invertSentiment: boolean) {
  if (direction === "flat" || Math.abs(percent) < 2) {
    return "bg-slate-100 text-slate-500";
  }

  const positive = invertSentiment ? direction === "down" : direction === "up";
  return positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600";
}

function getArrow(direction: DeltaDirection) {
  if (direction === "up") {
    return "↑";
  }

  if (direction === "down") {
    return "↓";
  }

  return "—";
}

export function DeltaIndicator({ percent, direction, invertSentiment = false }: DeltaIndicatorProps) {
  const sentimentClass = getSentimentClass(percent, direction, invertSentiment);
  const arrow = getArrow(direction);
  const formatted = `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`;

  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${sentimentClass}`}>{arrow} {formatted}</span>;
}
