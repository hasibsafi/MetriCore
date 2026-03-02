export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">MetriCore</p>
          <h1 className="text-3xl font-semibold">Terms of Service</h1>
          <p className="text-sm text-slate-600">Last updated: March 2, 2026</p>
        </header>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold">Acceptance of Terms</h2>
          <p className="text-sm text-slate-600">
            By accessing or using MetriCore, you agree to these Terms of Service. If you do not agree, do not use the
            service.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold">Account Responsibilities</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You are responsible for activity that occurs under your account and organization.</li>
            <li>You must provide accurate information when creating an account or organization.</li>
          </ul>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold">Acceptable Use</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Do not misuse the service, attempt unauthorized access, or interfere with operations.</li>
            <li>Do not upload or transmit harmful code or engage in abusive behavior.</li>
            <li>Comply with applicable laws when using the service.</li>
          </ul>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold">Service Availability</h2>
          <p className="text-sm text-slate-600">
            We strive to keep MetriCore available, but the service is provided "as is" and may be interrupted for
            maintenance, updates, or unforeseen issues.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold">Data and Privacy</h2>
          <p className="text-sm text-slate-600">
            Your use of MetriCore is also governed by the Privacy Policy. You retain ownership of your data and grant
            MetriCore permission to process it to provide the service.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold">Termination</h2>
          <p className="text-sm text-slate-600">
            We may suspend or terminate access to the service if these terms are violated. You may stop using the service
            at any time.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold">Changes</h2>
          <p className="text-sm text-slate-600">
            We may update these Terms of Service from time to time. Continued use of the service after changes become
            effective means you accept the updated terms.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="text-sm text-slate-600">
            If you have questions about these terms, contact us at <span className="font-medium">support@getmetricore.com</span>.
          </p>
        </section>
      </div>
    </main>
  );
}
