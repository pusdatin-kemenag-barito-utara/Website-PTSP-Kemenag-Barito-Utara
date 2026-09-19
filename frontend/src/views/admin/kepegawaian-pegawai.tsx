import { DataCutiClient } from "@/components/admin/data-cuti/data-cuti-client";

export function ManajemenCutiView({ dataCuti }: { dataCuti: any[] }) {
  return (
    <div className="space-y-4 pb-6">
      <DataCutiClient initialData={dataCuti} />
    </div>
  );
}

export default ManajemenCutiView;
