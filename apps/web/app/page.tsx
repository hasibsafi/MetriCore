export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <div>
            <div className="flex items-center gap-3">
              <img src="/favicon-96x96.png" alt="MetriCore logo" className="h-9 w-9" />
              <div>
                <p className="text-sm font-semibold text-slate-900">MetriCore</p>
                <p className="text-xs text-slate-500">Unified analytics for every site you manage</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a className="rounded-[10px] border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900" href="/sign-in">
              Sign in
            </a>
            <a className="rounded-[10px] bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600" href="/sign-up">
              Get started
            </a>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">Client portal</p>
            <h1 className="text-[28px] font-semibold text-slate-900 sm:text-4xl">
              Track health, traffic, and search impact without jumping between tools.
            </h1>
            <p className="text-sm text-slate-600 sm:text-base">
              MetriCore connects GA4, Search Console, and PageSpeed into a single view. Capture snapshots, compare ranges, and turn metrics into clear next steps.
            </p>
            <div className="flex flex-wrap gap-3">
              <a className="rounded-[10px] bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600" href="/sign-up">
                Create your organization
              </a>
              <a className="rounded-[10px] bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-900" href="/sign-in">
                I already have an account
              </a>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <span>GA4 + GSC + PageSpeed</span>
              <span>Multi-site snapshots</span>
              <span>Actionable recommendations</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Traffic overview</p>
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">30d</span>
            </div>
            <div className="mt-4 h-[260px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <img
                src="/assets/images/google%20traffic%20analytics.jpg"
                alt="Traffic overview preview"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { title: "Total Visitors", value: "12,450", trend: "+15.8%" },
            { title: "Conversion Rate", value: "4.8%", trend: "+1.2%" },
            { title: "Bounce Rate", value: "38.2%", trend: "-2.3%" }
          ].map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
              <p className="text-sm text-slate-500">{item.title}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
              <p className="mt-2 inline-flex rounded-full bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">{item.trend}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <p className="text-sm font-semibold text-slate-900">Search performance</p>
            <p className="text-xs text-slate-500">Clicks and impressions</p>
            <div className="mt-4 h-[240px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <img
                src="/assets/images/google%20search%20analytics.avif"
                alt="Search performance preview"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <p className="text-sm font-semibold text-slate-900">Recommendations</p>
            <p className="text-xs text-slate-500">Prioritized fixes across your sites</p>
            <div className="mt-4 space-y-3">
              {["Optimize hero images", "Improve CTR on top landing pages", "Reduce unused JavaScript"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-700">{item}</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">High impact</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <p className="text-sm font-semibold text-slate-900">How it works</p>
            <ol className="mt-4 space-y-3 text-sm text-slate-600">
              <li>1. Create an organization and add your first site.</li>
              <li>2. Connect Google once to enable GA4 + Search Console.</li>
              <li>3. Run snapshots and track improvements over time.</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-sky-50 p-6">
            <p className="text-sm font-semibold text-slate-900">Get started in minutes</p>
            <p className="mt-2 text-sm text-slate-600">
              Invite your team, connect Google, and start collecting trend data across every site you own.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a className="rounded-[10px] bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600" href="/sign-up">
                Start free
              </a>
              <a className="rounded-[10px] bg-white px-5 py-2.5 text-sm font-medium text-slate-900" href="/sign-in">
                Sign in
              </a>
            </div>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500">
          <span>© 2026 MetriCore. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a className="hover:text-slate-900" href="/privacy-policy">
              Privacy Policy
            </a>
            <a className="hover:text-slate-900" href="/terms-of-service">
              Terms of Service
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
