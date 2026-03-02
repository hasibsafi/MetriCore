import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "../../src/lib/auth-guards";
import { getUserOrganizations } from "../../src/services/tenant-service";
import { CreateOrgButton } from "./create-org-button";

export default async function SelectOrgPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/sign-in?callbackUrl=/select-org");
  }

  const orgs = await getUserOrganizations(user.id);

  if (orgs.length === 1) {
    redirect(`/org/${orgs[0].orgId}/overview`);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl p-6 sm:p-8">
      <div className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Select organization</h1>
        <p className="mt-2 text-sm text-slate-600">Signed in as {user.email ?? "unknown user"}.</p>

        {orgs.length === 0 ? (
          <div className="mt-5 rounded-md border border-dashed border-slate-300 p-4">
            <p className="text-sm text-slate-700">You are not a member of any organization yet.</p>
            <CreateOrgButton />
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {orgs.map((org) => (
              <li key={org.orgId}>
                <Link
                  href={`/org/${org.orgId}/overview`}
                  className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3 hover:bg-slate-50"
                >
                  <span className="text-sm font-medium text-slate-900">{org.orgName}</span>
                  <span className="text-xs uppercase tracking-wide text-slate-500">{org.role}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
