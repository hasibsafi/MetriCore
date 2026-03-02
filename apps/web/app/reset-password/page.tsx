import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-4 sm:p-6">
      <Suspense fallback={<div className="text-sm text-slate-600">Loading reset form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
