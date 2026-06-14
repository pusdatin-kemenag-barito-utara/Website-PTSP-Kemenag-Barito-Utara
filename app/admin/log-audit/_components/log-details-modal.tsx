"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ExternalLink } from "lucide-react";

interface LogDetailsModalProps {
  log: any;
  isOpen: boolean;
  onClose: () => void;
}

function getEntityLink(entityType?: string | null, entityId?: string | null): string | null {
  if (!entityType || !entityId) return null;
  const map: Record<string, string> = {
    service_request: `/admin/pengajuan/${entityId}`,
    guest_book: "/admin/buku-tamu",
    appointments: "/admin/janji-temu",
    feedbacks: "/admin/e-pengaduan",
    surat_masuk: "/admin/persuratan/surat-masuk",
    surat_keluar: "/admin/persuratan/surat-keluar",
    pengajuan_cuti: "/pegawai/cuti",
  };
  const base = map[entityType];
  if (!base) return null;
  return base;
}

export function LogDetailsModal({ log, isOpen, onClose }: LogDetailsModalProps) {
  if (!log) return null;

  const entityLink = getEntityLink(log.entityType, log.entityId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white border-none shadow-2xl rounded-2xl overflow-hidden p-0">
        <DialogHeader className="p-6 bg-slate-50 border-b">
          <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              {log.action[0].toUpperCase()}
            </div>
            Detail Aktivitas Sistem
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Waktu Kejadian</p>
              <p className="text-sm font-bold text-slate-700">
                {format(new Date(log.createdAt), "EEEE, dd MMMM yyyy - HH:mm:ss", { locale: idLocale })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">IP Address</p>
              <p className="text-sm font-mono font-bold text-emerald-600">{log.ipAddress || "0.0.0.0"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aksi</p>
              <p className="text-sm font-black text-blue-600 uppercase">{log.action.replace(/_/g, " ")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Objek Target</p>
              <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
                {log.entityType}
                {entityLink ? (
                  <a href={entityLink} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-800 inline-flex items-center gap-0.5 ml-1">
                    ({log.entityId?.slice(0, 8)})
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span>({log.entityId?.slice(0, 8)})</span>
                )}
              </p>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* User Info */}
          <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4 border border-slate-100">
            <div className="h-12 w-12 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-sm font-black text-emerald-600">
              {log.profile?.fullName?.[0] || "?"}
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-tight">Pelaksana</p>
              <p className="text-sm font-bold text-slate-900">{log.profile?.fullName}</p>
              <p className="text-[10px] font-semibold text-slate-500">{log.profile?.email}</p>
            </div>
          </div>

          {/* JSON Data */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data Perubahan (JSON)</p>
            <div className="bg-[#1e293b] rounded-xl p-4 overflow-x-auto border border-slate-800 shadow-inner">
              <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
