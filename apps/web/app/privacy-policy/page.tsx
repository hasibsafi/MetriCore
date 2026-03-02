export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">MetriCore</p>
          <h1 className="text-3xl font-semibold">Privacy Policy</h1>
          <p className="text-sm text-slate-600">Last updated: March 2, 2026</p>
        </header>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold">Overview</h2>
          <p className="text-sm text-slate-600">
            This Privacy Policy explains how MetriCore collects, uses, and protects information when you use the
            MetriCore dashboard and related services.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold">Information We Collect</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Account details such as name, email, and organization membership.</li>
            <li>Site configuration details that you provide (site URLs, display names).</li>
            <li>Analytics data pulled from Google APIs (GA4, Search Console) when you connect them.</li>
            <li>Usage and audit logs for security and operational visibility.</li>
          </ul>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold">How We Use Information</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Provide and operate the MetriCore service.</li>
            <li>Authenticate users and enforce organization access controls.</li>
            <li>Generate dashboards, reports, and recommendations.</li>
            <li>Maintain security, prevent abuse, and debug issues.</li>
          </ul>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold">Google API Data</h2>
          <p className="text-sm text-slate-600">
            If you connect Google services, MetriCore accesses Google Analytics and Search Console data on your behalf
            using read-only scopes. We do not sell Google user data or use it for advertising. Data retrieved from
            Google APIs is used only to display analytics, generate reports, and create recommendations inside your
            organization.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold">Data Sharing</h2>
          <p className="text-sm text-slate-600">
            We do not share your data with third parties except as necessary to operate the service (for example,
            infrastructure providers) or when required by law.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold">Security</h2>
          <p className="text-sm text-slate-600">
            We use industry-standard safeguards, including encryption for sensitive data and access controls, to protect
            your information. No method of transmission or storage is 100% secure.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="text-sm text-slate-600">
            If you have questions about this policy, contact us at <span className="font-medium">support@getmetricore.com</span>.
          </p>
        </section>
      </div>
    </main>
  );
}
