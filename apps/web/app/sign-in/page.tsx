import { Suspense } from "react";
import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-4 sm:p-6">
      <Suspense fallback={<div className="text-sm text-slate-600">Loading sign in…</div>}>
        <SignInForm />
      </Suspense>
    </main>
  );
}
