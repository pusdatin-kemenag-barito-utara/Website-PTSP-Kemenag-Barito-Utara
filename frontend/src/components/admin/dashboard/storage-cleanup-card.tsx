import { useState, useEffect } from "react";
import { Trash2, ShieldAlert, CheckCircle2, Loader2, Database } from "lucide-react";
import { cleanupOldStorageAction, getCleanupStats } from "@/lib/actions/system/cleanup";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function StorageCleanupCard() {
  const [stats, setStats] = useState<{ eligibleRequests: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      const data = await getCleanupStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCleanup() {
    if (!stats || stats.eligibleRequests === 0) return;

    const confirm = window.confirm(
      `Peringatan: Tindakan ini akan menghapus permanen file permohonan (Requirements) dari ${stats.eligibleRequests} pengajuan lama. Dokumen Hasil tetap aman. Lanjutkan?`
    );

    if (!confirm) return;

    setCleaning(true);
    try {
      const result = await cleanupOldStorageAction();
      if (result.success) {
        toast.success(result.message);
        fetchStats();
      }
    } catch (err) {
      toast.error("Gagal melakukan pembersihan.");
      console.error(err);
    } finally {
      setCleaning(false);
    }
  }

  if (loading) return (
    <Card className="p-12 flex items-center justify-center border-none shadow-sm bg-white rounded-2xl">
      <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
    </Card>
  );

  const hasData = stats && stats.eligibleRequests > 0;

  return (
    <Card className={`overflow-hidden border-none shadow-lg bg-white rounded-2xl ring-1 ${hasData ? 'ring-amber-100' : 'ring-slate-100'}`}>
      <div className={`${hasData ? 'bg-amber-50' : 'bg-slate-50/50'} px-5 py-4 border-b ${hasData ? 'border-amber-100' : 'border-slate-100'} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 ${hasData ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'} rounded-lg`}>
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className={`text-sm font-black uppercase tracking-wide ${hasData ? 'text-amber-900' : 'text-slate-700'}`}>Pemeliharaan Storage</h3>
            <p className={`text-[11px] font-bold ${hasData ? 'text-amber-700/80' : 'text-slate-400'}`}>Optimalisasi ruang penyimpanan cloud</p>
          </div>
        </div>
        {hasData && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-200/50 text-[10px] font-black text-amber-800 border border-amber-200">
            <Database className="h-3 w-3" />
            {stats.eligibleRequests} Data Lama
          </div>
        )}
      </div>
      
      <div className="p-5 space-y-4">
        {hasData ? (
          <>
            <div className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Terdapat <span className="font-bold text-slate-900">{stats.eligibleRequests} berkas permohonan</span> yang sudah selesai lebih dari 3 bulan. 
                Menghapus file lama akan mengosongkan ruang di Cloudflare R2 Anda.
              </p>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Data riwayat di database tetap tersimpan
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Dokumen Hasil (Output Admin) TIDAK dihapus
                </div>
            </div>

            <Button
              onClick={handleCleanup}
              disabled={cleaning}
              className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md shadow-amber-900/20 font-black text-xs uppercase tracking-wider transition-all active:scale-[0.98]"
            >
              {cleaning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membersihkan...
                </>
              ) : (
                "Bersihkan File Lama Sekarang"
              )}
            </Button>
          </>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="flex justify-center">
               <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
               </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Storage Optimal</p>
              <p className="text-[11px] font-medium text-slate-500 mt-1">
                Tidak ada berkas lama yang perlu dibersihkan saat ini. Semua data tersusun rapi.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchStats}
              className="mt-2 text-[10px] font-bold uppercase tracking-tight h-8 border-slate-200 text-slate-500 hover:bg-slate-50"
            >
               Cek Ulang
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
