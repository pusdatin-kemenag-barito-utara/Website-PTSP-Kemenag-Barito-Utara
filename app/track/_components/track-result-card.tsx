"use client";

import { CheckCircle2, Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";

interface TrackResultCardProps {
  data: any;
}

export function TrackResultCard({ data }: TrackResultCardProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50">
        <div
          className={`p-8 md:p-12 text-center bg-gradient-to-br ${
            data.statusColor === "blue"
              ? "from-blue-600 to-blue-700"
              : data.statusColor === "amber"
                ? "from-amber-500 to-amber-600"
                : data.statusColor === "rose"
                  ? "from-rose-500 to-rose-600"
                  : data.statusColor === "emerald"
                    ? "from-emerald-600 to-emerald-700"
                    : "from-slate-600 to-slate-700"
          }`}
        >
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 backdrop-blur-md">
            <CheckCircle2 className="h-3 w-3 text-white" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">
              Status Saat Ini
            </span>
          </div>
          <h2 className="text-4xl font-black text-white md:text-5xl uppercase tracking-tighter">
            {data.status}
          </h2>
          <p className="mx-auto mt-6 max-w-md text-sm font-bold text-white/80 leading-relaxed">
            {data.statusDescription}
          </p>
        </div>

        <div className="p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Nomor Permohonan
                </span>
                <p className="mt-1 text-lg font-black text-slate-900">
                  {data.requestNumber}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Nama Layanan
                </span>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  {data.serviceName}
                </p>
                <p className="text-xs font-medium text-slate-500">
                  {data.itemName}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Pemohon
                </span>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  {data.isOwner
                    ? data.applicantName
                    : data.applicantName.charAt(0) +
                      "****" +
                      data.applicantName.charAt(
                        data.applicantName.length - 1,
                      )}
                </p>
                {!data.isOwner && (
                  <p className="text-[10px] text-slate-400 font-medium">
                    *Nama disamarkan untuk privasi
                  </p>
                )}
                {data.isOwner && (
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-1">
                    ✓ Ini Pengajuan Anda
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Diajukan Pada
                  </span>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {format(new Date(data.createdAt), "dd MMM yyyy", {
                      locale: localeId,
                    })}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Pembaruan Terakhir
                  </span>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {format(new Date(data.updatedAt), "dd MMM yyyy, HH:mm", {
                      locale: localeId,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-2xl bg-slate-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${data.isOwner ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"}`}
              >
                {data.isOwner ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <MapPin className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {data.isOwner
                    ? "Lihat Detail Lengkap?"
                    : "Butuh Informasi Lebih Lanjut?"}
                </p>
                <p className="text-xs font-medium text-slate-500">
                  {data.isOwner
                    ? "Klik tombol untuk melihat dokumen hasil dan detail lainnya."
                    : "Kunjungi kantor kami atau hubungi helpdesk."}
                </p>
              </div>
            </div>
            <Link
              href={
                data.isOwner
                  ? `/dashboard/pengajuan/${data.id}`
                  : `/login?callbackUrl=${encodeURIComponent(`/dashboard/pengajuan/${data.id}`)}`
              }
              className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-black transition-all text-center ${
                data.isOwner
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700"
                  : "bg-white border border-slate-200 text-slate-900 hover:border-emerald-600"
              }`}
            >
              {data.isOwner ? "Buka Detail Pengajuan" : "Login ke Akun"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
