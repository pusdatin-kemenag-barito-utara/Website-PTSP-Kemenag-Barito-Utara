import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { FileText } from "lucide-react";
import { getLaporanKinerjaAction } from "@/lib/actions/admin/kepegawaian";
import { LaporanKinerjaManager } from "@/components/admin/kepegawaian/laporan-manager";

export default async function ELaporanKinerjaPage() {
  await requireAuth();
  
  const result = await getLaporanKinerjaAction();
  
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <PageHeader
        title="E-Laporan Kinerja Harian"
        description="Pantau dan kelola laporan kinerja harian pegawai"
        icon={FileText}
      />

      {result.error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm">{result.error}</div>
      ) : (
        <LaporanKinerjaManager 
          initialData={result.data || []} 
          isPemimpin={result.isPemimpin || false} 
        />
      )}
    </div>
  );
}
