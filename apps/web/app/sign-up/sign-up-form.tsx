"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { signUpSchema } from "../../src/lib/validators/auth";

export function SignUpForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? "")
    };

    const parsed = signUpSchema.safeParse(payload);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Please fill in all required fields.";
      setErrorMessage(message);
      return;
    }

    setIsPending(true);
    const response = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(parsed.data)
    });

    const body = (await response.json()) as { message?: string };
    if (!response.ok) {
      setIsPending(false);
      setErrorMessage(body.message ?? "Unable to create account right now.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      callbackUrl: "/select-org",
      redirect: false
    });
    setIsPending(false);

    if (!signInResult || signInResult.error || !signInResult.ok) {
      window.location.assign("/sign-in");
      return;
    }

    window.location.assign(signInResult.url ?? "/select-org");
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Create account</h1>
      <p className="mt-1 text-sm text-slate-600">Set up your portal login using email and password.</p>

      {errorMessage && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      )}

      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
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
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="confirmPassword">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isPending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{" "}
        <a className="font-medium text-slate-900 underline" href="/sign-in">
          Sign in
        </a>
      </p>
    </div>
  );
}
