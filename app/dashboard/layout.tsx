import type { ReactNode } from "react";
import { requireAuth } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuth();

  return (
    <div className="mx-auto w-full px-2 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="grid items-start gap-5 md:grid-cols-[220px,1fr] lg:gap-6 lg:grid-cols-[240px,1fr] xl:grid-cols-[260px,1fr]">
        <DashboardSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
