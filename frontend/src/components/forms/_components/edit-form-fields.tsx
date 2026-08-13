import { Input } from "@/components/ui/input";

export function EditFormFields({ answers }: { answers: any[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Data Formulir
        </h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {answers.map((answer: any) => (
          <div key={answer.id} className="space-y-1.5">
            <label
              htmlFor={`answer_${answer.id}`}
              className="text-xs font-bold text-slate-600 uppercase tracking-tight"
            >
              {answer.fieldName}
            </label>
            <Input
              id={`answer_${answer.id}`}
              name={`answer_${answer.id}`}
              defaultValue={answer.fieldValue || ""}
              className="bg-slate-50/50 focus:bg-white transition-colors"
              required
            />
          </div>
        ))}
      </div>
    </div>
  );
}
