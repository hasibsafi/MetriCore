"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { passwordResetConfirmSchema } from "../../src/lib/validators/auth";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const isTokenMissing = useMemo(() => token.trim().length === 0, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      token,
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? "")
    };

    const parsed = passwordResetConfirmSchema.safeParse(payload);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Please check the form and try again.";
      setErrorMessage(message);
      return;
    }

    setIsPending(true);
    const response = await fetch("/api/auth/password-reset/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(parsed.data)
    });

    const body = (await response.json()) as { message?: string };
    setIsPending(false);

    if (!response.ok) {
      setErrorMessage(body.message ?? "Unable to reset password right now.");
      return;
    }

    setSuccessMessage(body.message ?? "Password reset successful.");
    event.currentTarget.reset();
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Set a new password</h1>
      <p className="mt-1 text-sm text-slate-600">Choose a new password for your account.</p>

      {isTokenMissing && (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800" role="alert">
          This reset link is missing its token. Please request a new link.
        </p>
      )}

      {errorMessage && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {successMessage} You can now sign in.
        </p>
      )}

      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
            New password
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
          disabled={isPending || isTokenMissing}
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isPending ? "Updating password..." : "Update password"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Back to{" "}
        <a className="font-medium text-slate-900 underline" href="/sign-in">
          sign in
        </a>
      </p>
    </div>
  );
}
