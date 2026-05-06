import { Card } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export function FormAnswersCard({ request }: { request: any }) {
  return (
    <Card title="Data Isian Form" icon={ClipboardList}>
      <div className="space-y-4">
        {(request.service_request_answers ?? []).length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <ClipboardList className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-500 font-semibold">
              Tidak ada isian form.
            </p>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {(request.service_request_answers ?? []).map((answer: any) => (
            <div
              key={answer.id}
              className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#1f4bb7]/30 hover:bg-blue-50/20 transition-colors group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[#1f4bb7]/20 rounded-l-2xl group-hover:bg-[#1f4bb7] transition-colors" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                {answer.field_name}
              </p>
              <p className="mt-1.5 text-sm font-bold text-slate-800 pl-2 break-words">
                {answer.field_value || "-"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
