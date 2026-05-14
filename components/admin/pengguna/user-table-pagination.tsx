import { ChevronLeft, ChevronRight } from "lucide-react";

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

  return (
    <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3 flex items-center justify-between">
      <p className="text-[11px] text-slate-500">
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
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[28px] h-7 rounded-lg text-[11px] font-bold transition-all duration-200 ${
              p === page
                ? "bg-gradient-to-r from-[#059669] to-[#047857] text-white shadow-sm shadow-emerald-500/20"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            {p}
          </button>
        ))}
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
