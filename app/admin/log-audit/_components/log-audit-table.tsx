"use client";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Calendar, ShieldCheck, MapPin, Activity, ExternalLink } from "lucide-react";
import { AdminPagination } from "@/components/admin/pengajuan/admin-pagination";

interface LogAuditTableProps {
  logs: any[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

import { useState } from "react";
import { LogDetailsModal } from "./log-details-modal";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

function getEntityLink(entityType?: string | null, entityId?: string | null): string | null {
  if (!entityType || !entityId) return null;
  const map: Record<string, string> = {
    service_request: `/admin/pengajuan/${entityId}`,
    guest_book: "/admin/buku-tamu",
    appointments: "/admin/janji-temu",
    feedbacks: "/admin/e-pengaduan",
    pengajuan_cuti: "/pegawai/cuti",
  };
  const base = map[entityType];
  if (!base) return null;
  return base;
}

export function LogAuditTable({
  logs,
  currentPage,
  totalPages,
  totalCount,
}: LogAuditTableProps) {
  const [selectedLog, setSelectedLog] = useState<any>(null);

  return (
    <>
      <LogDetailsModal
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-500">
                Waktu
              </th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-500">
                Petugas
              </th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-500">
                Aksi
              </th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-500">
                Objek
              </th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-500">
                Detail
              </th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-500 text-right">
                IP Address
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Activity className="h-10 w-10 opacity-20" />
                    <p className="text-sm font-medium">
                      Belum ada catatan aktivitas.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log: any) => {
                const entityLink = getEntityLink(log.entityType, log.entityId);
                return (
                  <tr
                    key={log.id.toString()}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm", {
                          locale: idLocale,
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[10px] font-black text-[#059669]">
                          {log.profile?.fullName?.[0] ||
                            log.profile?.email?.[0] ||
                            "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {log.profile?.fullName || "Petugas"}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-500 truncate">
                            {log.profile?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                        <ShieldCheck className="h-3 w-3" />
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                        {log.entityType || "-"}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        {entityLink ? (
                          <a
                            href={entityLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-800 hover:underline inline-flex items-center gap-0.5"
                          >
                            {log.entityId ? log.entityId.slice(0, 8) + "..." : "-"}
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        ) : (
                          <span>{log.entityId ? log.entityId.slice(0, 8) + "..." : "-"}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        className="h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold text-[10px] uppercase tracking-wider"
                      >
                        <Eye className="h-3 w-3 mr-1.5" />
                        Lihat Detail
                      </Button>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 text-[11px] font-mono font-bold text-slate-400">
                        <MapPin className="h-3 w-3" />
                        {log.ipAddress || "0.0.0.0"}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="border-t border-slate-50 bg-slate-50/30">
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
          />
        </div>
      )}
    </>
  );
}
