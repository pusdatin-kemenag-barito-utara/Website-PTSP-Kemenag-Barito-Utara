import type { ReactNode } from "react";
import { requireAuth } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { PageTransition } from "@/components/ui/page-transition";

export default async function PegawaiLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuth();

  return (
    <div className="mx-auto w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="flex flex-col md:flex-row items-start gap-5 lg:gap-6">
        <div className="w-full md:w-[240px] lg:w-[260px] flex-shrink-0">
          <DashboardSidebar mode="pegawai" />
        </div>
        <main className="min-w-0 flex-1 w-full">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
