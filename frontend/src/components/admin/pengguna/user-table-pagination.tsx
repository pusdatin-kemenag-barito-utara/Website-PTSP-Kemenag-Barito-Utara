import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export function UserTablePagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const generatePagination = (currentPage: number, totalPages: number) => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    
    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const pages = generatePagination(page, totalPages);

  return (
    <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3 flex items-center justify-between overflow-x-auto">
      <p className="text-[11px] text-slate-500 whitespace-nowrap mr-4">
        Halaman <span className="font-bold text-slate-700">{page}</span> dari{" "}
        <span className="font-bold text-slate-700">{totalPages}</span>
      </p>
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
                  ? "bg-gradient-to-r from-[#059669] to-[#047857] text-white shadow-sm shadow-emerald-500/20"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
