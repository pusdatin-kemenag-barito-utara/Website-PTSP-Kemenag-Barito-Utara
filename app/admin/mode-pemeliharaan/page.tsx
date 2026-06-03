import { Construction } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { getMaintenanceStatus } from "@/lib/actions/system/maintenance";
import { MaintenanceToggle } from "@/components/admin/dashboard/maintenance-toggle";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function AdminMaintenanceModePage() {
  await requirePermission("mode_pemeliharaan");

  const status = await getMaintenanceStatus();

  // Get the name of who started maintenance
  let startedByName: string | null = null;
  if (status.startedBy) {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, status.startedBy),
      columns: { fullName: true, email: true },
    });
    startedByName = profile?.fullName || profile?.email || null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mode Pemeliharaan"
        description="Aktifkan mode pemeliharaan untuk menampilkan halaman maintenance kepada pengunjung."
        icon={Construction}
      />

      <MaintenanceToggle
        initialEnabled={status.enabled}
        initialMessage={status.message}
        startedAt={status.startedAt?.toISOString() ?? null}
        startedByName={startedByName}
      />
    </div>
  );
}
