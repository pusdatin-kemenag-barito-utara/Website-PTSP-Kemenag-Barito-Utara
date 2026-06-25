"use client";

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
  const formatValue = (value: string) => {
    if (!value) return "-";
    
    // Format date range (e.g. "2026-06-29,2026-06-30")
    if (value.includes(",")) {
      const parts = value.split(",").map(p => p.trim());
      if (parts.length === 2 && /^\d{4}-\d{2}-\d{2}$/.test(parts[0]) && /^\d{4}-\d{2}-\d{2}$/.test(parts[1])) {
        const d1 = format(new Date(parts[0]), "dd MMMM yyyy", { locale: localeId });
        const d2 = format(new Date(parts[1]), "dd MMMM yyyy", { locale: localeId });
        return `${d1} s/d ${d2}`;
      }
    }
    
    // Format single date (e.g. "2026-06-29")
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
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
    <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ClipboardList className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Jawaban Form
          </h3>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {displayAnswers.map((answer: any) => (
          <div
            key={answer.id}
            className="rounded-xl bg-slate-50 p-3.5 sm:p-5 group hover:bg-slate-100 transition-colors"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 group-hover:text-slate-500 transition-colors">
              {answer.fieldName}
            </p>
            <p className="text-sm font-bold text-slate-800 break-words leading-relaxed">
              {formatValue(answer.fieldValue)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
