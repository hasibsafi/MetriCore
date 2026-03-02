type PlaceholderCardProps = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export function PlaceholderCard({ title, subtitle, children }: PlaceholderCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </article>
  );
}
