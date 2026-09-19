import { DokumenHasilFilter } from "./dokumen-hasil-filter";
import { DokumenHasilTable } from "./dokumen-hasil-table";

export function DokumenHasilClient({
  requests,
  urlMap,
  services,
  q,
  serviceId,
  type = "public",
}: {
  requests: any[];
  urlMap: Record<string, string | null>;
  services: { id: string; name: string; category?: string }[];
  q: string;
  serviceId: string;
  type?: string;
}) {
  return (
    <div className="space-y-4">
      <DokumenHasilFilter
        searchQuery={q}
        serviceFilter={serviceId}
        services={services}
        type={type}
      />

      <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <DokumenHasilTable 
          paginatedRequests={requests} 
          urlMap={urlMap} 
        />
      </div>
    </div>
  );
}
