"use client";

import { useState } from "react";
import { DokumenHasilFilter } from "./dokumen-hasil-filter";
import { DokumenHasilTable } from "./dokumen-hasil-table";

export function DokumenHasilClient({
  requests,
  urlMap,
  services,
}: {
  requests: any[];
  urlMap: Record<string, string | null>;
  services: { id: string; name: string }[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      (r.request_number || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (r.profiles?.full_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (r.services?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesService = serviceFilter
      ? r.services?.id === serviceFilter
      : true;

    return matchesSearch && matchesService;
  });

  const totalPages = Math.ceil(filteredRequests.length / PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE,
  );

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setPage(1);
  };

  const handleFilterChange = (svc: string) => {
    setServiceFilter(svc);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <DokumenHasilFilter
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        serviceFilter={serviceFilter}
        onFilterChange={handleFilterChange}
        services={services}
      />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <DokumenHasilTable
          paginatedRequests={paginatedRequests}
          urlMap={urlMap}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3">
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan{" "}
              {Math.min((page - 1) * PER_PAGE + 1, filteredRequests.length)} -{" "}
              {Math.min(page * PER_PAGE, filteredRequests.length)} dari{" "}
              {filteredRequests.length}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
