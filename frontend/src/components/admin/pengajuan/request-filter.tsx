import { Search, Filter } from "lucide-react";
import { ModernSelect } from "@/components/ui/modern-select";

export function AdminRequestFilter({
  q,
  status,
  serviceId,
  services,
  type = "public",
}: {
  q: string;
  status: string;
  serviceId: string;
  services: any[] | null;
  type?: string;
}) {
  const isASN = type === "asn";
  const defaultLabel = isASN ? "Semua Layanan Pegawai (ASN)" : "Semua Layanan Masyarakat";

  const serviceOptions = [
    { value: "", label: defaultLabel },
    ...(services || []).map((s: any) => ({
      value: String(s.id),
      label: s.name,
      badge: s.category === "asn" ? "ASN" : "Masyarakat",
    })),
  ];

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "submitted", label: "Diajukan" },
    { value: "under_review", label: "Diproses" },
    { value: "revision_required", label: "Revisi" },
    { value: "rejected", label: "Ditolak" },
    { value: "approved", label: "Disetujui" },
    { value: "completed", label: "Selesai" },
    { value: "spam", label: "Spam / Palsu" },
  ];

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-4 py-2">
        <p className="text-xs font-bold text-slate-700">Filter & Pencarian</p>
      </div>
      <div className="p-3">
        <form className="flex flex-col gap-2.5 sm:flex-row sm:items-end flex-wrap">
          <input type="hidden" name="type" value={type} />
          <div className="flex-1 min-w-[180px]">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pencarian
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Nomor pengajuan atau nama..."
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 shadow-2xs placeholder:text-slate-400 transition-all hover:border-slate-400 focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 outline-none"
              />
            </div>
          </div>

          <div className="w-full sm:w-80 md:w-96 shrink-0">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Layanan
            </label>
            <ModernSelect
              name="serviceId"
              defaultValue={serviceId}
              options={serviceOptions}
              placeholder={defaultLabel}
              searchable={true}
              searchPlaceholder="Cari layanan..."
              clearable={Boolean(serviceId)}
            />
          </div>

          <div className="w-full sm:w-44 shrink-0">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Status
            </label>
            <ModernSelect
              name="status"
              defaultValue={status}
              options={statusOptions}
              placeholder="Semua Status"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#059669] to-[#047857] px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition-all hover:shadow-xs active:scale-[0.98] cursor-pointer h-9"
          >
            <Filter className="h-3.5 w-3.5" />
            Filter
          </button>
        </form>
      </div>
    </div>
  );
}
