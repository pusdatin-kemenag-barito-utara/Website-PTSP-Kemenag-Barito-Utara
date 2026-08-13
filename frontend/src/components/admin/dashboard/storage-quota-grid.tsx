import { useState, useEffect } from "react";
import { Server, Info, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { SystemService } from "@/lib/services/system-service";

export function StorageQuotaGrid() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await SystemService.getStorageStats();
        setStats(data);
      } catch (err) {
        console.error("Gagal memuat statistik storage:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
    );
  }

  return (
    <Card className="p-5 border-none shadow-sm bg-white rounded-2xl ring-1 ring-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Cloudflare R2</h3>
            <p className="text-[10px] font-bold text-slate-400">Penyimpanan Utama Berkas</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-slate-900">{stats?.cloudflareR2?.fileCount || 0}</span>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Total File</p>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <span className="text-lg font-black text-emerald-700">{formatBytes(stats?.cloudflareR2?.usage || 0)}</span>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Total Volume Data</p>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
          <Info className="h-3 w-3" />
          Pay-As-You-Go
        </div>
      </div>
    </Card>
  );
}
