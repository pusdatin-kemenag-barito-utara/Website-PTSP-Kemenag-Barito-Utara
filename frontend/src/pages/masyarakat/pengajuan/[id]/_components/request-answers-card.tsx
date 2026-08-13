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

  // We want to hide "Tanggal Selesai Cuti" if it's empty AND "Tanggal Mulai Cuti" is a range
  // Let's check if there's a range in the answers
  const hasDateRange = answers.some(a => a.fieldValue && a.fieldValue.includes(",") && /^\d{4}-\d{2}-\d{2}$/.test(a.fieldValue.split(",")[0].trim()));

  const displayAnswers = answers.filter((a) => {
    if (hasDateRange && a.fieldName.toLowerCase().includes("selesai cuti") && (!a.fieldValue || a.fieldValue === "-")) {
      return false; // hide empty "selesai cuti" if we already show the range in "mulai cuti"
    }
    return true;
  });

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 px-5 py-4 flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <ClipboardList className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
          Formulir Isian Permohonan
        </h3>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {displayAnswers.map((answer: any) => (
          <div
            key={answer.id}
            className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
          >
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 sm:col-span-1">
              {answer.fieldName}
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 sm:col-span-2 break-words">
              {formatValue(answer.fieldValue, answer.fieldName)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
