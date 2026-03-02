"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";

type LinkGoogleClientProps = {
  returnTo: string;
};

function sanitizeReturnTo(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/select-org";
  }

  return value;
}

export function LinkGoogleClient({ returnTo }: LinkGoogleClientProps) {
  const [error, setError] = useState<string | null>(null);
  const safeReturnTo = useMemo(() => sanitizeReturnTo(returnTo), [returnTo]);

  useEffect(() => {
    let active = true;

    async function linkAccount() {
      try {
        await signIn("google", { callbackUrl: safeReturnTo });
      } catch {
        if (active) {
          setError("Unable to start Google linking. Please try again.");
        }
      }
    }

    void linkAccount();

    return () => {
      active = false;
    };
  }, [safeReturnTo]);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Linking your Google account</h1>
        <p className="mt-2 text-sm text-slate-600">
          We are redirecting you to Google to link this account. You will return once the link is complete.
        </p>
        {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: safeReturnTo })}
          className="mt-4 w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
        >
          Continue to Google
        </button>
        <p className="mt-3 text-xs text-slate-500">If nothing happens, click the button above.</p>
      </div>
    </main>
  );
}
