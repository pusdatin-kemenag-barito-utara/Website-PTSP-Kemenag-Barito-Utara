import { Search, Filter } from "lucide-react";

export function AdminRequestFilter({
  q,
  status,
  service_id,
  services,
}: {
  q: string;
  status: string;
  service_id: string;
  services: any[] | null;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-5 py-3">
        <p className="text-sm font-medium text-slate-700">Filter & Pencarian</p>
      </div>
      <div className="p-4">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Pencarian
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Nomor pengajuan atau nama..."
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-all hover:border-slate-400 focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 outline-none"
              />
            </div>
          </div>
          <div className="w-full sm:w-56 shrink-0">
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Layanan
            </label>
            <select
              name="service_id"
              defaultValue={service_id}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-all hover:border-slate-400 focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_10px_center] bg-no-repeat pr-9 outline-none truncate"
            >
              <option value="">Semua Layanan</option>
              {services?.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-48 shrink-0">
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Status
            </label>
            <select
              name="status"
              defaultValue={status}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-all hover:border-slate-400 focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_10px_center] bg-no-repeat pr-9 outline-none"
            >
              <option value="">Semua status</option>
              <option value="submitted">Diajukan</option>
              <option value="under_review">Diproses</option>
              <option value="revision_required">Revisi</option>
              <option value="rejected">Ditolak</option>
              <option value="approved">Disetujui</option>
              <option value="completed">Selesai</option>
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#059669] to-[#047857] px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-emerald-500/20 transition-all hover:shadow-md hover:shadow-emerald-500/30 active:scale-[0.98]"
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </form>
      </div>
    </div>
  );
}
