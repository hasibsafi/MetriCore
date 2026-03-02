type SkeletonChartProps = {
  heightClassName?: string;
};

export function SkeletonChart({ heightClassName = "h-[220px] sm:h-[260px] lg:h-[300px]" }: SkeletonChartProps) {
  return <div className={`w-full animate-pulse rounded-xl bg-slate-100 ${heightClassName}`} />;
}

export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-24 animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}
