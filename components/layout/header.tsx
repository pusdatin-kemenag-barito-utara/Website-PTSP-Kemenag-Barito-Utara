import { getCurrentProfile } from "@/lib/auth";
import { SiteHeaderClient } from "@/components/site-header-client";

export async function SiteHeader() {
  const profile = await getCurrentProfile();

  return <SiteHeaderClient profile={profile} />;
}
