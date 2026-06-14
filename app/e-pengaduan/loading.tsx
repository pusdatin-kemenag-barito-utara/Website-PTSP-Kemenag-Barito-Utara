import PageBanner from "@/components/common/PageBanner";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <PageBanner
        title="Memuat Formulir"
        description="Mohon tunggu sebentar..."
      />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="font-medium animate-pulse">Menyiapkan sistem e-pengaduan...</p>
        </div>
      </div>
    </main>
  );
}
