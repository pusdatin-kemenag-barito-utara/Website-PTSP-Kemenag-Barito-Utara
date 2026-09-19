import { useRouter, useSearchParams } from "@/lib/next-compat/navigation";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ModernSelect } from "@/components/ui/modern-select";

export function DokumenHasilFilter({
  searchQuery,
  serviceFilter,
  services,
  type = "public",
}: {
  searchQuery: string;
  serviceFilter: string;
  services: { id: string; name: string; category?: string }[];
  type?: string;
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

  const isASN = type === "asn";
  const defaultLabel = isASN ? "Semua Layanan Pegawai (ASN)" : "Semua Layanan Masyarakat";

  const serviceOptions = [
    { value: "", label: defaultLabel },
    ...services.map((svc) => ({
      value: svc.id,
      label: svc.name,
      badge: svc.category === "asn" ? "ASN" : "Masyarakat",
    })),
  ];

  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-2.5 sm:flex-row sm:items-center justify-between">
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <Input
          type="text"
          placeholder="Cari no permohonan, nama pemohon..."
          defaultValue={searchQuery}
          onChange={(e) => handleUpdateParam("q", e.target.value)}
          className="pl-8.5 h-9 text-xs rounded-lg border-slate-200 bg-white shadow-xs focus:border-[#059669] focus:ring-[#059669]/20"
        />
      </div>

      <div className="w-full sm:w-80 md:w-96 shrink-0">
        <ModernSelect
          options={serviceOptions}
          value={serviceFilter}
          onChange={(val) => handleUpdateParam("serviceId", val)}
          icon={Filter}
          placeholder={defaultLabel}
          searchable={true}
          searchPlaceholder="Cari nama layanan..."
          clearable={Boolean(serviceFilter)}
          triggerClassName="h-9 px-3 text-xs"
          align="right"
        />
      </div>
    </div>
  );
}
