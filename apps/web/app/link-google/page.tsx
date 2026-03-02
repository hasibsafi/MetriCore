import { redirect } from "next/navigation";
import { getSessionUser } from "../../src/lib/auth-guards";
import { LinkGoogleClient } from "./link-google-client";

type Props = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function LinkGooglePage({ searchParams }: Props) {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/link-google")}`);
  }
  const { returnTo } = await searchParams;

  return <LinkGoogleClient returnTo={returnTo ?? "/select-org"} />;
}
