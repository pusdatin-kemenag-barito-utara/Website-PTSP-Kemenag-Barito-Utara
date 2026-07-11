import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { dataCutiPegawai } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { DataCutiClient } from "@/components/admin/data-cuti/data-cuti-client";
import { PageHeader } from "@/components/admin/page-header";
import { CalendarCheck } from "lucide-react";

export default async function ManajemenCutiPage() {
  await requireAuth();

  const dataCuti = await db.query.dataCutiPegawai.findMany({
    orderBy: [asc(dataCutiPegawai.no)],
    with: { rekapCutiTahunan: true },
  });

  return (
    <div className="space-y-6 w-full mx-auto pb-10 px-2 sm:px-4">
      <PageHeader
        title="Manajemen Cuti"
        description="Kelola hak cuti dan saldo cuti tahunan pegawai"
        icon={CalendarCheck}
      />
      <DataCutiClient initialData={dataCuti} />
    </div>
  );
}
