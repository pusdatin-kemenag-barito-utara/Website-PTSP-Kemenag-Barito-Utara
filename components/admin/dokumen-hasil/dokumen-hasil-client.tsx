"use client";

import { DokumenHasilFilter } from "./dokumen-hasil-filter";
import { DokumenHasilTable } from "./dokumen-hasil-table";

export function DokumenHasilClient({
  requests,
  urlMap,
  services,
  q,
  serviceId,
}: {
  requests: any[];
  urlMap: Record<string, string | null>;
  services: { id: string; name: string }[];
  q: string;
  serviceId: string;
}) {
  return (
    <div className="space-y-6">
      <DokumenHasilFilter
        searchQuery={q}
        serviceFilter={serviceId}
        services={services}
      />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <DokumenHasilTable paginatedRequests={requests} urlMap={urlMap} />
      </div>
    </div>
  );
}
