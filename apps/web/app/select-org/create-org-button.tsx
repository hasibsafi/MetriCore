"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateOrgButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateOrg() {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/orgs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "My Organization"
      })
    });

    if (!response.ok) {
      const body = (await response.json()) as { message?: string };
      setLoading(false);
      setError(body.message ?? "Unable to create organization right now.");
      return;
    }

    const org = (await response.json()) as { id: string };
    router.push(`/org/${org.id}/overview`);
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleCreateOrg}
        disabled={loading}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create Organization"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
