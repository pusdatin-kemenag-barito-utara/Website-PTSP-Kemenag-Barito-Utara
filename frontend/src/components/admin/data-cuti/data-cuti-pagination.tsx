import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 border-t border-slate-200">
      <div className="flex items-center gap-3">
        <select
          value={isAll ? "all" : rowsPerPage}
          onChange={(e) => {
            const val = e.target.value;
            onRowsPerPageChange(val === "all" ? totalData : Number(val));
            onPageChange(1);
          }}
          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-sm"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value="all">Semua</option>
        </select>
        <span className="text-xs font-medium text-slate-500">
          Menampilkan {start} - {end} dari {totalData} data
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) => {
          if (p === "...") {
            return (
              <div
                key={`ellipsis-${i}`}
                className="flex h-7 min-w-[28px] items-center justify-center text-slate-400"
              >
                <MoreHorizontal className="h-4 w-4" />
              </div>
            );
          }

          const pageNum = p as number;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[28px] h-7 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                pageNum === page
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
