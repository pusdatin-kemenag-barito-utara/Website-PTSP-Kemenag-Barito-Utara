import { Card } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";

export function FormAnswersCard({ request }: { request: any }) {
  return (
    <Card title="Data Isian Form" icon={ClipboardCheck}>
      <div className="space-y-4">
        {(request.serviceRequestAnswers ?? []).length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <ClipboardCheck className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-500 font-medium">
              Tidak ada isian form.
            </p>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {(request.serviceRequestAnswers ?? []).map((answer: any) => (
            <div
              key={answer.id}
              className="rounded-xl bg-slate-50 p-4 transition-colors hover:bg-slate-100/80"
            >
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {answer.fieldName}
              </p>
              <p className="text-sm font-semibold text-slate-800 break-words">
                {answer.fieldValue || "-"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
