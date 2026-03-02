"use client";

import { FormEvent, useState } from "react";
import { passwordResetRequestSchema } from "../../src/lib/validators/auth";

export function ForgotPasswordForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setResetUrl(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? "")
    };

    const parsed = passwordResetRequestSchema.safeParse(payload);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Please enter a valid email address.";
      setErrorMessage(message);
      return;
    }

    setIsPending(true);
    const response = await fetch("/api/auth/password-reset/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(parsed.data)
    });

    const body = (await response.json()) as { message?: string; resetUrl?: string };
    setIsPending(false);

    if (!response.ok) {
      setErrorMessage(body.message ?? "Unable to request a reset link right now.");
      return;
    }

    setSuccessMessage(body.message ?? "If an account exists, a reset link has been sent.");
    if (body.resetUrl) {
      setResetUrl(body.resetUrl);
    }
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Reset your password</h1>
      <p className="mt-1 text-sm text-slate-600">We will email a secure link to reset your password.</p>

      {errorMessage && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <div className="mt-4 space-y-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <p>{successMessage}</p>
          {resetUrl && (
            <a className="font-medium text-emerald-900 underline" href={resetUrl}>
              Open reset link
            </a>
          )}
        </div>
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

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isPending ? "Sending link..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Remembered your password?{" "}
        <a className="font-medium text-slate-900 underline" href="/sign-in">
          Sign in
        </a>
      </p>
    </div>
  );
}
