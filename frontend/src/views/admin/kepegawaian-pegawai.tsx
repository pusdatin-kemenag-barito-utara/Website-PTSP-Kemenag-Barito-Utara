import { DataCutiClient } from "@/components/admin/data-cuti/data-cuti-client";
import { PageHeader } from "@/components/admin/page-header";
import { CalendarCheck } from "lucide-react";

export function ManajemenCutiView({ dataCuti }: { dataCuti: any[] }) {
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

export default ManajemenCutiView;
