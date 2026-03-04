"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { signInSchema } from "../../src/lib/validators/auth";

export function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/select-org";
  const queryError = searchParams.get("error");
  const isLinkingFlow = queryError === "OAuthAccountNotLinked";
  const linkCallbackUrl = `/link-google?returnTo=${encodeURIComponent(callbackUrl)}`;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const mappedQueryError = useMemo(() => {
    if (queryError === "CredentialsSignin") {
      return "Invalid credentials. Please check your email and password.";
    }

    if (queryError === "OAuthAccountNotLinked") {
      return "This Google account is linked to an existing user. Sign in with your email and password to link it.";
    }

    if (queryError) {
      return "Unable to sign in right now. Please try again.";
    }

    return null;
  }, [queryError]);

  async function handleCredentialsSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? "")
    };

    const parsed = signInSchema.safeParse(payload);
    if (!parsed.success) {
      setErrorMessage("Please provide both email and password.");
      return;
    }

    setIsPending(true);
    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      callbackUrl: isLinkingFlow ? linkCallbackUrl : callbackUrl,
      redirect: false
    });
    setIsPending(false);

    if (!result || result.error || !result.ok) {
      setErrorMessage("Invalid credentials. Please check your email and password.");
      return;
    }

    window.location.assign(result.url ?? callbackUrl);
  }

  async function handleGoogleSignIn() {
    setErrorMessage(null);
    await signIn("google", { callbackUrl });
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Sign in</h1>
      <p className="mt-1 text-sm text-slate-600">Use your email/password or Google account.</p>
      <Link className="mt-2 inline-block text-xs font-medium text-slate-900 underline" href="/">
        Back to homepage
      </Link>

      {(errorMessage || mappedQueryError) && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {errorMessage ?? mappedQueryError}
        </p>
      )}

      <form className="mt-4 space-y-3" onSubmit={handleCredentialsSignIn}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          />
          <div className="mt-2 text-right text-xs">
            <a className="font-medium text-slate-900 underline" href="/forgot-password">
              Forgot password?
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900"
      >
        Sign in with Google
      </button>

      <p className="mt-4 text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <a className="font-medium text-slate-900 underline" href="/sign-up">
          Sign up
        </a>
      </p>
    </div>
  );
}
