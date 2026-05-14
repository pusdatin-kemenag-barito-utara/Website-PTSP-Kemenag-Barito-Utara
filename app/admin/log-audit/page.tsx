import { History, ShieldCheck, User, Calendar, MapPin, Activity } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import prisma, { serializeBigInt } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { isSuperAdmin } from "@/lib/constants";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { AdminPagination } from "@/components/admin/pengajuan/admin-pagination";
import { LogAuditFilter } from "@/components/admin/log-audit/log-filter";

export default async function AdminLogAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; action?: string }>;
}) {
  const profile = await requireAdmin();

  // Only Super Admin can see audit logs
  if (profile.role !== "super_admin" && !isSuperAdmin(profile.email)) {
    redirect("/admin");
  }

  const { page = "1", q = "", action = "" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page));
  const pageSize = 50;
  const skip = (currentPage - 1) * pageSize;

  const where: any = {};
  if (q) {
    where.OR = [
      { profiles: { full_name: { contains: q, mode: 'insensitive' } } },
      { profiles: { email: { contains: q, mode: 'insensitive' } } },
      { entity_type: { contains: q, mode: 'insensitive' } },
      { action: { contains: q, mode: 'insensitive' } }
    ];
  }
  if (action && action !== 'all') {
    where.action = { contains: action, mode: 'insensitive' };
  }

  const [logsRaw, totalCount] = await Promise.all([
    prisma.audit_logs.findMany({
      where,
      include: {
        profiles: {
          select: {
            full_name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: pageSize,
    }),
    prisma.audit_logs.count({ where }),
  ]);

  const logs = serializeBigInt(logsRaw);
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sistem Audit Log"
        description="Rekam jejak aktivitas administratif untuk transparansi dan keamanan sistem."
        icon={History}
      />

      <LogAuditFilter initialQ={q} initialAction={action} />

      <div className="grid grid-cols-1 gap-6">
        <Card className="overflow-hidden border-none shadow-sm bg-white rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-500">Waktu</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-500">Petugas</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-500">Aksi</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-500">Objek</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-500">Detail</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-500 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Activity className="h-10 w-10 opacity-20" />
                        <p className="text-sm font-medium">Belum ada catatan aktivitas.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log: any) => (
                    <tr key={log.id.toString()} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {format(new Date(log.created_at), "dd MMM yyyy, HH:mm", { locale: id })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[10px] font-black text-[#059669]">
                            {log.profiles?.full_name?.[0] || log.profiles?.email?.[0] || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {log.profiles?.full_name || "Petugas"}
                            </p>
                            <p className="text-[10px] font-semibold text-slate-500 truncate">
                              {log.profiles?.email}
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
                          {log.entity_type || "-"}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {log.entity_id ? log.entity_id.slice(0, 8) + "..." : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[200px]">
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {JSON.stringify(log.details) === "{}" ? "-" : JSON.stringify(log.details)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 text-[11px] font-mono font-bold text-slate-400">
                          <MapPin className="h-3 w-3" />
                          {log.ip_address || "0.0.0.0"}
                        </div>
                      </td>
                    </tr>
                  ))
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
        </Card>
      </div>
    </div>
  );
}
