import { requireAuth } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { DataCutiClient } from "@/components/admin/data-cuti/data-cuti-client";
import { PageHeader } from "@/components/admin/page-header";
import { CalendarCheck } from "lucide-react";

export default async function ManajemenCutiPage() {
  await requireAuth();

  let dataCuti: any[] = [];
  try {
    const res = await fetchAPI<any>("/admin/cuti/pegawai");
    if (res && res.data && Array.isArray(res.data)) {
      dataCuti = res.data;
    }
  } catch (err) {
    console.error("Failed to fetch data cuti from Golang API:", err);
  }

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
