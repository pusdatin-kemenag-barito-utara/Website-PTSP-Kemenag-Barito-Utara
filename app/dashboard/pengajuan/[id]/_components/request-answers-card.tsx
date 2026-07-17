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
    <div className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
        <ClipboardList className="h-5 w-5 text-slate-500" />
        <h3 className="text-base font-semibold text-slate-900">
          Formulir Isian
        </h3>
      </div>

      <div className="divide-y divide-slate-100">
        {displayAnswers.map((answer: any) => (
          <div
            key={answer.id}
            className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors"
          >
            <p className="text-sm font-medium text-slate-500 md:col-span-1">
              {answer.fieldName}
            </p>
            <p className="text-sm font-semibold text-slate-900 md:col-span-2 break-words">
              {formatValue(answer.fieldValue, answer.fieldName)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
