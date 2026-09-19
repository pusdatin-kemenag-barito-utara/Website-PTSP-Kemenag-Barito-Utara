import { ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface RequestAnswersCardProps {
  requestId: string;
  answers: any[];
  documents: any[];
  status: string;
}

export function RequestAnswersCard({
  requestId,
  answers,
  documents,
  status,
}: RequestAnswersCardProps) {
  // Helper to format date strings like "2026-06-29" or "2026-06-29,2026-06-30"
  const formatValue = (value: string, fieldName: string = "") => {
    if (!value) return "-";
    
    if (value.includes(",")) {
      const parts = value.split(",").map(p => p.trim());
      const allDates = parts.every(p => /^\d{4}-\d{2}-\d{2}$/.test(p));
      if (allDates) {
        return `${parts.length} Hari`;
      }
    }
    
    // Format single date (e.g. "2026-06-29")
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      if (fieldName.toLowerCase().includes("mulai cuti") || fieldName.toLowerCase().includes("tanggal cuti")) {
        return "1 Hari";
      }
      return format(new Date(value), "dd MMMM yyyy", { locale: localeId });
    }
    
    return value;
  };

  const rawAnswers = Array.isArray(answers) ? answers : [];

  // We want to hide "Tanggal Selesai Cuti" if it's empty AND "Tanggal Mulai Cuti" is a range
  // Let's check if there's a range in the answers
  const hasDateRange = rawAnswers.some(a => {
    const val = (a.fieldValue || a.field_value || "").toString();
    return val && val.includes(",") && /^\d{4}-\d{2}-\d{2}$/.test(val.split(",")[0].trim());
  });

  const displayAnswers = rawAnswers.filter((a) => {
    const fn = (a.fieldName || a.field_name || "").toLowerCase();
    const fv = (a.fieldValue || a.field_value || "").toString();
    if (hasDateRange && fn.includes("selesai cuti") && (!fv || fv === "-")) {
      return false; // hide empty "selesai cuti" if we already show the range in "mulai cuti"
    }
    return true;
  });

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ClipboardList className="h-4 w-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100">
            Formulir Isian Permohonan
          </h3>
        </div>
        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
          {displayAnswers.length} Data
        </span>
      </div>

      {displayAnswers.length === 0 ? (
        <div className="py-8 px-4 text-center">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Tidak ada data isian formulir khusus untuk layanan ini.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {displayAnswers.map((answer: any, idx: number) => {
            const label = answer.fieldName || answer.field_name || answer.name || `Data #${idx + 1}`;
            const val = answer.fieldValue ?? answer.field_value ?? answer.value ?? "";

            return (
              <div
                key={answer.id || answer.fieldId || answer.field_id || `${label}-${idx}`}
                className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 sm:col-span-1">
                  {label}
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 sm:col-span-2 break-words">
                  {formatValue(String(val), label)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
