type PageShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
