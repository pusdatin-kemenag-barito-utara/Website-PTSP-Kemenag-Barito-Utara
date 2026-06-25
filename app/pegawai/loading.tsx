import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
        <div className="relative bg-white p-4 rounded-full shadow-sm border border-emerald-100 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-lg font-bold text-slate-700">Memuat Data...</p>
        <p className="text-sm text-slate-500">Mohon tunggu sebentar.</p>
      </div>
    </div>
  );
}
