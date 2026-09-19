import { ChevronLeft, ChevronRight, MoreHorizontal, ChevronDown } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  rowsPerPage: number;
  totalData: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

export function DataCutiPagination({
  page,
  totalPages,
  rowsPerPage,
  totalData,
  onPageChange,
  onRowsPerPageChange,
}: Props) {
  if (totalData === 0) return null;

  const start = totalData === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, totalData);
  const isAll = rowsPerPage >= totalData;

  function generatePagination(currentPage: number, totalPages: number) {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  }

  const pages = generatePagination(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/90 px-5 py-3.5 border-t border-slate-200/80 rounded-b-2xl">
      <div className="flex items-center gap-3">
        <div className="relative inline-flex items-center">
          <select
            value={isAll ? "all" : String(rowsPerPage)}
            onChange={(e) => {
              const val = e.target.value;
              const newRows = val === "all" ? totalData : Number(val);
              onRowsPerPageChange(newRows);
              onPageChange(1);
            }}
            className="h-8.5 pl-3 pr-8 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 cursor-pointer appearance-none shadow-2xs transition-all"
            aria-label="Pilih jumlah baris per halaman"
          >
            <option value="10">10 Baris</option>
            <option value="25">25 Baris</option>
            <option value="50">50 Baris</option>
            <option value="100">100 Baris</option>
            <option value="all">Semua Baris</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Menampilkan <span className="font-bold text-slate-800">{start}</span>–<span className="font-bold text-slate-800">{end}</span> dari <span className="font-bold text-slate-800">{totalData}</span> data
        </span>
      </div>

      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/70 shadow-2xs">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
          title="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) => {
          if (p === "...") {
            return (
              <div
                key={`ellipsis-${i}`}
                className="flex h-7 min-w-[26px] items-center justify-center text-slate-300 text-xs"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </div>
            );
          }

          const pageNum = p as number;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[30px] h-7 px-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
                pageNum === page
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
          title="Halaman berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
