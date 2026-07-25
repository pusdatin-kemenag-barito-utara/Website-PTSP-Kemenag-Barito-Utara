import type { ReactNode } from "react";
import { requireAuth } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { PageTransition } from "@/components/ui/page-transition";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/constants";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Super admin can bypass all checks — render dashboard directly
  if (user && isSuperAdmin(user.email ?? "")) {
    return (
      <div className="mx-auto w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col md:flex-row items-start gap-5 lg:gap-6">
          <div className="w-full md:w-[240px] lg:w-[260px] shrink-0 sticky top-0 md:top-20 z-40 self-start">
            <DashboardSidebar />
          </div>
          <main className="min-w-0 flex-1 w-full">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    );
  }

  // For regular users
  await requireAuth();

  return (
    <div className="mx-auto w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="flex flex-col md:flex-row items-start gap-5 lg:gap-6">
        <div className="w-full md:w-[240px] lg:w-[260px] shrink-0 sticky top-0 md:top-20 z-40 self-start">
          <DashboardSidebar />
        </div>
        <main className="min-w-0 flex-1 w-full">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
