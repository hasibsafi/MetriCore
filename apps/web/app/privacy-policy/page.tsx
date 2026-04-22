import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — MetriCore",
  description:
    "How MetriCore collects, uses, stores, and protects your information, including data accessed through Google APIs."
};

const LAST_UPDATED = "April 22, 2026";
const SUPPORT_EMAIL = "support@getmetricore.com";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">MetriCore</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Privacy Policy</h1>
          <p className="text-sm text-slate-600">Last updated: {LAST_UPDATED}</p>
        </header>

        <Card>
          <H2>Overview</H2>
          <P>
            This Privacy Policy describes how MetriCore (&ldquo;MetriCore,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo;
            &ldquo;our&rdquo;) collects, uses, stores, shares, and protects information when you use the MetriCore web
            application, related services, and our website at{" "}
            <a className="font-medium text-sky-700 underline underline-offset-2" href="https://getmetricore.com">
              getmetricore.com
            </a>{" "}
            (collectively, the &ldquo;Service&rdquo;).
          </P>
          <P>
            By using the Service you agree to the collection and use of information in accordance with this policy.
          </P>
        </Card>

        <Card>
          <H2>Information We Collect</H2>
          <UL>
            <li>
              <strong className="font-semibold text-slate-900">Account information</strong> — your name, email address,
              password hash, and organization membership.
            </li>
            <li>
              <strong className="font-semibold text-slate-900">Site configuration</strong> — the URLs, display names,
              and settings you add to MetriCore for sites you want to monitor.
            </li>
            <li>
              <strong className="font-semibold text-slate-900">Google API data</strong> — analytics and search metrics
              retrieved from Google Analytics and Google Search Console when you explicitly connect those services
              (see &ldquo;Google API Services&rdquo; below).
            </li>
            <li>
              <strong className="font-semibold text-slate-900">Usage and audit logs</strong> — request logs, sign-in
              events, and feature usage for security, reliability, and troubleshooting.
            </li>
            <li>
              <strong className="font-semibold text-slate-900">Cookies</strong> — a first-party session cookie used for
              authentication. We do not use advertising or cross-site tracking cookies.
            </li>
          </UL>
        </Card>

        <Card>
          <H2>How We Use Information</H2>
          <UL>
            <li>To provide, operate, and improve the MetriCore Service.</li>
            <li>To authenticate you and enforce organization-level access controls.</li>
            <li>To generate dashboards, reports, and recommendations inside your organization.</li>
            <li>To detect, prevent, and respond to security incidents and abuse.</li>
            <li>To communicate with you about the Service, including account and support messages.</li>
          </UL>
        </Card>

        <Card>
          <H2>Google API Services</H2>
          <P>
            If you connect your Google account, MetriCore accesses data on your behalf using the following OAuth
            scopes, all of which are <em>read-only</em>:
          </P>
          <UL>
            <li>
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-slate-800">
                https://www.googleapis.com/auth/analytics.readonly
              </code>{" "}
              — retrieve Google Analytics (GA4) metrics such as sessions, users, and engagement for sites you own or
              administer.
            </li>
            <li>
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-slate-800">
                https://www.googleapis.com/auth/webmasters.readonly
              </code>{" "}
              — retrieve Google Search Console performance data (clicks, impressions, queries, pages) for sites you
              own or administer.
            </li>
            <li>
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-slate-800">openid</code>,{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-slate-800">
                userinfo.email
              </code>
              ,{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-slate-800">
                userinfo.profile
              </code>{" "}
              — verify your identity for sign-in and associate fetched data with your MetriCore account.
            </li>
          </UL>
          <P>
            MetriCore&rsquo;s use and transfer of information received from Google APIs to any other app will adhere
            to the{" "}
            <a
              className="font-medium text-sky-700 underline underline-offset-2"
              href="https://developers.google.com/terms/api-services-user-data-policy"
            >
              Google API Services User Data Policy
            </a>
            , including the <strong className="font-semibold text-slate-900">Limited Use</strong> requirements.
            Specifically, we:
          </P>
          <UL>
            <li>Use Google user data only to provide user-facing features of MetriCore.</li>
            <li>Do not transfer Google user data to third parties except as necessary to run the Service.</li>
            <li>Do not use Google user data to serve advertisements.</li>
            <li>
              Do not allow humans to read Google user data, except with your explicit consent, when required for
              security, to comply with applicable law, or when the data has been aggregated and anonymized.
            </li>
            <li>Do not use Google user data to develop, improve, or train generalized AI or machine learning models.</li>
          </UL>
        </Card>

        <Card>
          <H2>Data Storage, Retention, and Deletion</H2>
          <P>
            Tokens issued by Google are stored encrypted at rest. Analytics metrics are stored in our primary database
            and retained while your MetriCore account is active. You can disconnect Google at any time from the
            Settings page in MetriCore, which revokes our stored refresh token and stops further data collection.
          </P>
          <P>
            You can delete your account by contacting{" "}
            <a
              className="font-medium text-sky-700 underline underline-offset-2"
              href={`mailto:${SUPPORT_EMAIL}`}
            >
              {SUPPORT_EMAIL}
            </a>
            . On deletion we remove your account data, stored Google tokens, and associated site data within 30 days,
            except where we are required to retain records to meet legal or accounting obligations.
          </P>
          <P>
            You may also revoke MetriCore&rsquo;s access directly from your Google Account at{" "}
            <a
              className="font-medium text-sky-700 underline underline-offset-2"
              href="https://myaccount.google.com/permissions"
            >
              myaccount.google.com/permissions
            </a>
            .
          </P>
        </Card>

        <Card>
          <H2>Data Sharing</H2>
          <P>
            We do not sell or rent your data. We share information only with infrastructure providers that process
            data on our behalf (hosting, database, email delivery) under contractual confidentiality and security
            obligations, or when required to comply with applicable law.
          </P>
        </Card>

        <Card>
          <H2>Security</H2>
          <P>
            We use industry-standard safeguards including TLS in transit, encryption for sensitive fields at rest,
            scoped access controls, and audit logging. No method of transmission or storage is 100% secure; in the
            event of a breach we will notify affected users consistent with applicable law.
          </P>
        </Card>

        <Card>
          <H2>Children&rsquo;s Privacy</H2>
          <P>
            MetriCore is intended for business users and is not directed to children under 13. We do not knowingly
            collect personal information from children.
          </P>
        </Card>

        <Card>
          <H2>Changes to This Policy</H2>
          <P>
            We may update this Privacy Policy from time to time. We will post the updated version on this page and
            revise the &ldquo;Last updated&rdquo; date above. Material changes will be communicated to account holders
            by email.
          </P>
        </Card>

        <Card>
          <H2>Contact</H2>
          <P>
            Questions or requests about this Privacy Policy or your data can be sent to{" "}
            <a
              className="font-medium text-sky-700 underline underline-offset-2"
              href={`mailto:${SUPPORT_EMAIL}`}
            >
              {SUPPORT_EMAIL}
            </a>
            .
          </P>
        </Card>
      </div>
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_4px_18px_rgba(15,23,42,0.05)]">
      {children}
    </section>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] leading-relaxed text-slate-700">{children}</p>;
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-700">{children}</ul>;
}
