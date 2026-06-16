import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { masterOptions } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { PageHeader } from "@/components/admin/page-header";
import { Settings2 } from "lucide-react";
import MasterCutiClient from "@/components/admin/master-cuti/master-cuti-client";

export default async function MasterCutiPage() {
  await requireAdmin();

  // Fetch all options
  const options = await db.query.masterOptions.findMany({
    orderBy: [asc(masterOptions.sortOrder), asc(masterOptions.label)],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Layanan Cuti"
        description="Kelola master data untuk opsi-opsi pada form layanan cuti pegawai."
        icon={Settings2}
      />
      <MasterCutiClient initialData={options} />
    </div>
  );
}
