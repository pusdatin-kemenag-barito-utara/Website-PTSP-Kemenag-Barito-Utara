import { getMyRequests } from "@/lib/actions/pegawai/requests";
import { RiwayatTable } from "./_components/riwayat-table";
import { ScrollText } from "lucide-react";

export const metadata = {
  title: "Riwayat Pengajuan | PTSP Kemenag Barito Utara",
  description: "Lihat seluruh riwayat pengajuan layanan ASN Anda.",
};

export default async function RiwayatLayananPage() {
  const requests = await getMyRequests();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5 flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
          <ScrollText className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Riwayat Pengajuan Layanan</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Semua pengajuan layanan yang pernah Anda kirimkan.
          </p>
        </div>
      </div>

      {/* Table */}
      <RiwayatTable requests={requests} />
    </div>
  );
}
