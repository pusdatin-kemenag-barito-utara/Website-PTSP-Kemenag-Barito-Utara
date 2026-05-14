import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import prisma, { serializeBigInt } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { EditAnswersDialog } from "@/components/dashboard/edit-answers-dialog";
import { DeleteRequestButton } from "@/components/dashboard/delete-request-button";
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Calendar, 
  ExternalLink,
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default async function UserRequestsPage() {
  const profile = await requireAuth();

  const data = await prisma.service_requests.findMany({
    where: { user_id: profile.id },
    include: {
      services: {
        select: { name: true },
      },
      service_items: {
        select: { name: true },
      },
      service_request_answers: true,
      service_request_documents: {
        include: {
          service_requirements: {
            select: { document_name: true },
          },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const requests = serializeBigInt(data);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      {/* Header Section with Glassmorphism */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#064e3b] via-[#059669] to-[#047857] p-8 md:p-12 shadow-[0_20px_50px_-20px_rgba(4,120,87,0.4)]">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 backdrop-blur-md">
              <ClipboardList className="h-3.5 w-3.5 text-emerald-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Manajemen Dokumen</span>
            </div>
            <h1 className="mt-6 text-3xl font-black text-white md:text-5xl tracking-tighter">
              Riwayat Pengajuan
            </h1>
            <p className="mt-4 text-sm font-medium text-emerald-50/70 max-w-lg leading-relaxed">
              Pantau seluruh progres layanan Anda secara transparan. Klik "Lihat Detail" untuk informasi lengkap.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href="/dashboard/pengajuan/baru"
              className="group inline-flex items-center justify-center gap-3 h-14 px-8 rounded-2xl bg-white text-[#064e3b] font-black text-sm shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
              Buat Pengajuan Baru
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Table */}
      <Card className="overflow-hidden border-none shadow-2xl shadow-slate-200/60 rounded-[2rem] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Nomor & Tanggal</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Layanan</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-400">
                      <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center">
                        <Inbox className="h-10 w-10 opacity-20" />
                      </div>
                      <p className="text-sm font-bold text-slate-600">Belum ada pengajuan layanan.</p>
                      <Link href="/dashboard/pengajuan/baru" className="text-xs font-black uppercase tracking-wider text-[#059669] hover:underline underline-offset-4">
                        Mulai Pengajuan Pertama Anda
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((request: any) => (
                  <tr key={request.id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-black text-slate-900 tracking-tight group-hover:text-[#059669] transition-colors">
                          {request.request_number}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                          <Calendar className="h-3 w-3" />
                          {formatDate(request.created_at)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 max-w-[300px]">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800 line-clamp-1">
                          {request.services?.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 line-clamp-1 mt-0.5">
                          {request.service_items?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                       <StatusBadge status={request.status} />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <EditAnswersDialog
                          requestId={request.id}
                          answers={request.service_request_answers ?? []}
                          documents={request.service_request_documents ?? []}
                          disabled={
                            ![
                              "submitted",
                              "under_review",
                              "revision_required",
                            ].includes(request.status)
                          }
                        />
                        <DeleteRequestButton
                          requestId={request.id}
                          status={request.status}
                        />
                        <Link
                          href={`/dashboard/pengajuan/${request.id}`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#059669] hover:bg-[#059669] hover:text-white transition-all shadow-sm hover:shadow-emerald-500/20 active:scale-95"
                          title="Lihat Detail"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modern Info Footer */}
      <div className="grid gap-4 sm:grid-cols-3">
         <div className="flex items-center gap-4 rounded-3xl bg-white border border-slate-100 p-6 shadow-sm">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
               <Clock className="h-5 w-5" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Layanan Cepat</p>
               <p className="text-xs font-bold text-slate-700">Verifikasi 1-3 Hari Kerja</p>
            </div>
         </div>
         <div className="flex items-center gap-4 rounded-3xl bg-white border border-slate-100 p-6 shadow-sm">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
               <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Legalitas</p>
               <p className="text-xs font-bold text-slate-700">Dokumen Berbarcode Resmi</p>
            </div>
         </div>
         <div className="flex items-center gap-4 rounded-3xl bg-white border border-slate-100 p-6 shadow-sm">
            <div className="h-10 w-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
               <AlertCircle className="h-5 w-5" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Support</p>
               <p className="text-xs font-bold text-slate-700">Helpdesk Siap Membantu</p>
            </div>
         </div>
      </div>
    </div>
  );
}
