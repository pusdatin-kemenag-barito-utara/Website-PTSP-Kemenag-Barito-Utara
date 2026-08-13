import { useRouter, useSearchParams } from "@/lib/next-compat/navigation";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export function DokumenHasilFilter({
  searchQuery,
  serviceFilter,
  services,
}: {
  searchQuery: string;
  serviceFilter: string;
  services: { id: string; name: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleUpdateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Always reset page when filter changes
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder="Cari no permohonan, nama pemohon..."
          defaultValue={searchQuery}
          onChange={(e) => handleUpdateParam("q", e.target.value)}
          className="pl-9 h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#059669] focus:ring-[#059669]/20"
        />
      </div>
      <div className="w-full sm:w-64 shrink-0 relative">
        <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <select
          value={serviceFilter}
          onChange={(e) => handleUpdateParam("serviceId", e.target.value)}
          className="w-full h-11 pl-9 pr-9 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 shadow-sm focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 appearance-none outline-none transition-all cursor-pointer hover:border-slate-300 truncate bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat"
        >
          <option value="">Semua Layanan</option>
          {services.map((svc) => (
            <option key={svc.id} value={svc.id}>
              {svc.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
