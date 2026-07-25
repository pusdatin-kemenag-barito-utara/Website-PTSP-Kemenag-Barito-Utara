"use client";

import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  Hash, 
  Layers, 
  User, 
  ShieldCheck, 
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";

interface TrackResultCardProps {
  data: any;
}

export function TrackResultCard({ data }: TrackResultCardProps) {
  const getHeaderStyle = (color: string) => {
    switch (color) {
      case "blue": return "bg-blue-600 text-white";
      case "amber": return "bg-amber-600 text-white";
      case "rose": return "bg-rose-600 text-white";
      case "emerald": return "bg-emerald-600 text-white";
      default: return "bg-slate-700 text-white";
    }
  };

  const detailHref = data.isOwner
    ? data.requestType === "asn"
      ? `/pegawai/layanan/riwayat/${data.id}`
      : `/masyarakat/pengajuan/${data.id}`
    : data.requestType === "asn"
      ? `/login/pegawai?callbackUrl=${encodeURIComponent(`/pegawai/layanan/riwayat/${data.id}`)}`
      : `/login/masyarakat?callbackUrl=${encodeURIComponent(`/masyarakat/pengajuan/${data.id}`)}`;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">

        {/* ── Status Header ── */}
        <div className={`px-6 py-8 md:px-10 md:py-10 ${getHeaderStyle(data.statusColor)} flex flex-col md:flex-row md:items-center justify-between gap-6`}>
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/10 px-3 py-1 border border-white/20">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Status Saat Ini
              </span>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">
                {data.status}
              </h2>
              <p className="mt-2 max-w-2xl text-sm md:text-base font-medium opacity-90 leading-relaxed">
                {data.statusDescription}
              </p>
            </div>
          </div>
        </div>

        {/* ── Info Grid ── */}
        <div className="p-6 md:p-10">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Nomor */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" /> Nomor Tiket
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono break-all">
                {data.requestNumber}
              </p>
            </div>

            {/* Layanan */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" /> Layanan
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                {data.serviceName}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {data.itemName}
              </p>
            </div>

            {/* Pemohon */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Pemohon
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {data.isOwner
                  ? data.applicantName
                  : data.applicantName.charAt(0) +
                    "****" +
                    data.applicantName.charAt(data.applicantName.length - 1)}
              </p>
              {!data.isOwner ? (
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  *Nama disamarkan untuk privasi
                </p>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50 mt-0.5">
                  <ShieldCheck className="h-3 w-3" /> INI PENGAJUAN ANDA
                </span>
              )}
            </div>

            {/* Tanggal */}
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Diajukan
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {format(new Date(data.createdAt), "dd MMM yyyy", { locale: localeId })}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Diperbarui
                </span>
                <p className="text-[12px] font-medium text-slate-600 dark:text-slate-400">
                  {format(new Date(data.updatedAt), "dd MMM yyyy, HH:mm", { locale: localeId })}
                </p>
              </div>
            </div>
          </div>

          {/* ── Action Box ── */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                data.isOwner
                  ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}>
                {data.isOwner ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <MapPin className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {data.isOwner
                    ? "Lihat Detail Lengkap Pengajuan"
                    : data.requestType === "asn"
                      ? "Pengajuan Pegawai — Login Diperlukan"
                      : "Ingin Melihat Detail Pengajuan?"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {data.isOwner
                    ? "Akses status persyaratan dan unduh dokumen hasil."
                    : "Login dengan akun Anda untuk mengakses detail secara lengkap."}
                </p>
              </div>
            </div>

            <Link
              href={detailHref}
              className={`w-full sm:w-auto shrink-0 h-10 px-5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                data.isOwner
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white"
              }`}
            >
              <span>
                {data.isOwner
                  ? "Buka Detail Pengajuan"
                  : "Login Akun"}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
