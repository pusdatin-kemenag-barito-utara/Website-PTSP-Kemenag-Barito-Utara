import { Card } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";

export function FormAnswersCard({ request }: { request: any }) {
  const rawAnswers = (request.serviceRequestAnswers && request.serviceRequestAnswers.length > 0)
    ? request.serviceRequestAnswers
    : (request.answers && request.answers.length > 0)
      ? request.answers
      : (request.service_request_answers ?? []);

  const answers = Array.isArray(rawAnswers) ? rawAnswers : [];

  return (
    <Card title="Data Isian Formulir" icon={ClipboardCheck}>
      <div className="space-y-3">
        {answers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <ClipboardCheck className="h-7 w-7 text-slate-300 mb-1.5" />
            <p className="text-xs text-slate-500 font-semibold">
              Tidak ada data isian formulir khusus untuk layanan ini.
            </p>
          </div>
        )}

        <div className="grid gap-2 sm:gap-2.5 grid-cols-1 sm:grid-cols-2">
          {answers.map((answer: any, index: number) => {
            const label = answer.fieldName || answer.field_name || answer.name || `Data #${index + 1}`;
            const rawVal = answer.fieldValue ?? answer.field_value ?? answer.value ?? "";
            const val = String(rawVal);
            const isLongText = val.length > 60 || val.includes("\n");

            return (
              <div
                key={answer.id || answer.fieldId || answer.field_id || label || `answer-${index}`}
                className={`rounded-lg bg-slate-50 border border-slate-100 p-2.5 sm:p-3 transition-colors hover:bg-slate-100/80 overflow-hidden min-w-0 ${
                  isLongText ? "sm:col-span-2" : ""
                }`}
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 break-words">
                  {label}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 break-all sm:break-words whitespace-pre-wrap max-w-full min-w-0">
                  {val || "-"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
