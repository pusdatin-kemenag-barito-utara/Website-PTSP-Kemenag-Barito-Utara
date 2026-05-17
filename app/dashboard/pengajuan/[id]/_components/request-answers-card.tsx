"use client";

import { ClipboardList } from "lucide-react";
import { EditAnswersDialog } from "@/components/dashboard/edit-answers-dialog";

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
  return (
    <div className="rounded-2xl sm:rounded-[2.5rem] bg-white p-5 sm:p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ClipboardList className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Jawaban Form
          </h3>
        </div>
        <EditAnswersDialog
          requestId={requestId}
          answers={answers}
          documents={documents}
          disabled={
            !["submitted", "under_review", "revision_required"].includes(status)
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {answers.map((answer: any) => (
          <div
            key={answer.id}
            className="rounded-xl bg-slate-50 p-3.5 sm:p-5 group hover:bg-slate-100 transition-colors"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 group-hover:text-slate-500 transition-colors">
              {answer.fieldName}
            </p>
            <p className="text-sm font-bold text-slate-800 break-words leading-relaxed">
              {answer.fieldValue || "-"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
