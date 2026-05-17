"use client";

import * as React from "react";
import { Activity, Server, Database, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SystemHealthBadge() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/system/storage-stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="relative mt-auto p-4 border-t border-slate-100 bg-slate-50/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full group"
      >
        <div className="relative">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping opacity-20" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-emerald-600 transition-colors">
          Sistem Online
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-4 right-4 mb-2 p-5 rounded-3xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 space-y-4 z-50 min-w-[240px]"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Infrastruktur Live</p>
              {loading && <Loader2 className="h-3 w-3 animate-spin text-emerald-500" />}
            </div>
            
            <div className="space-y-3">
              <HealthItem 
                icon={<Database className="h-3.5 w-3.5" />} 
                label="Postgres DB" 
                status="Connected" 
                color="text-emerald-500" 
              />

              <div className="pt-1">
                <HealthItem 
                  icon={<Server className="h-3.5 w-3.5" />} 
                  label="Cloudflare R2" 
                  status={stats ? formatBytes(stats.cloudflareR2?.usage || 0) : "..."} 
                  color="text-emerald-500" 
                />
                <p className="text-[8px] font-bold text-slate-400 text-right uppercase">
                  {stats ? `${stats.cloudflareR2?.fileCount || 0} File Tersimpan` : ""}
                </p>
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-50 mt-1 flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-emerald-500" />
                <span>Status Aktif</span>
              </div>
              <span className="text-emerald-500">R2 Only</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HealthItem({ icon, label, status, color }: { icon: React.ReactNode, label: string, status: string, color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5 text-[10px] font-bold text-slate-700">
        <span className="text-slate-400">{icon}</span>
        {label}
      </div>
      <span className={`text-[9px] font-black uppercase ${color}`}>{status}</span>
    </div>
  );
}
