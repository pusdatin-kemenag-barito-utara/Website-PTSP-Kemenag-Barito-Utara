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
  const getGradient = (color: string) => {
    switch (color) {
      case "blue":
        return "from-blue-600 via-indigo-500 to-indigo-700";
      case "amber":
        return "from-amber-500 via-amber-500 to-amber-600";
      case "rose":
        return "from-rose-600 via-rose-500 to-rose-700";
      case "emerald":
        return "from-emerald-600 via-[#059669] to-[#047857]";
      default:
        return "from-slate-700 via-slate-600 to-slate-800";
    }
  };

  // Route detail berbeda berdasarkan jenis layanan dan status login
  const detailHref = data.isOwner
    ? data.requestType === "asn"
      ? `/pegawai/layanan/riwayat/${data.id}`     // Pegawai ASN → route pegawai
      : `/dashboard/pengajuan/${data.id}`           // Pemohon publik → route pemohon
    : data.requestType === "asn"
      ? `/login?callbackUrl=${encodeURIComponent(`/pegawai/layanan/riwayat/${data.id}`)}` // Belum login ASN
      : `/login?callbackUrl=${encodeURIComponent(`/dashboard/pengajuan/${data.id}`)}`; // Belum login publik
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-white border border-slate-200/50 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.06)]">

        {/* ── Status Header ── */}
        <div className={`relative px-5 py-7 sm:p-12 text-center bg-gradient-to-br ${getGradient(data.statusColor)} overflow-hidden`}>
          {/* Decorative blurs */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60 pointer-events-none" />
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-black/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-2.5 sm:space-y-4">
            {/* Status badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 backdrop-blur-md border border-white/10">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/90">
                Status Saat Ini
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white uppercase tracking-tight leading-none drop-shadow-sm">
              {data.status}
            </h2>

            <p className="mx-auto max-w-xs sm:max-w-lg text-[11px] sm:text-sm font-medium text-white/85 leading-relaxed">
              {data.statusDescription}
            </p>
          </div>
        </div>

        {/* ── Info Grid ── */}
        <div className="p-4 sm:p-6 md:p-10 space-y-4 sm:space-y-6">

          {/* Mobile: compact single-column list | Desktop: 2-col cards */}
          <div className="grid gap-3 sm:gap-5 sm:grid-cols-2">

            {/* Card 1: Nomor & Layanan */}
            <div className="rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5 space-y-3 sm:space-y-4">
              {/* Nomor */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-50 text-[#059669] border border-emerald-100/50">
                  <Hash className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Nomor Tiket
                  </span>
                  <p className="text-sm sm:text-base font-black text-slate-800 tracking-tight font-mono break-all">
                    {data.requestNumber}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100/80 pt-3 flex items-center gap-3">
                <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-50 text-[#059669] border border-emerald-100/50">
                  <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Nama Layanan
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug truncate">
                    {data.serviceName}
                  </p>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">
                    {data.itemName}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Pemohon & Tanggal */}
            <div className="rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5 space-y-3 sm:space-y-4">
              {/* Pemohon */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-50 text-[#059669] border border-emerald-100/50">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Pemohon / Pengaju
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                    {data.isOwner
                      ? data.applicantName
                      : data.applicantName.charAt(0) +
                        "****" +
                        data.applicantName.charAt(data.applicantName.length - 1)}
                  </p>
                  {!data.isOwner ? (
                    <p className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">
                      *Nama disamarkan untuk privasi
                    </p>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100 leading-none mt-0.5">
                      <ShieldCheck className="h-2.5 w-2.5" />
                      INI PENGAJUAN ANDA
                    </span>
                  )}
                </div>
              </div>

              {/* Tanggal */}
              <div className="border-t border-slate-100/80 pt-3 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-0.5">
                    <Calendar className="h-2.5 w-2.5 shrink-0" />
                    Diajukan
                  </span>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-700">
                    {format(new Date(data.createdAt), "dd MMM yyyy", { locale: localeId })}
                  </p>
                </div>

                <div>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-0.5">
                    <Clock className="h-2.5 w-2.5 shrink-0" />
                    Diperbarui
                  </span>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-700">
                    {format(new Date(data.updatedAt), "dd MMM yyyy, HH:mm", { locale: localeId })}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* ── Action Box ── */}
          <div className="rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/30 p-4 sm:p-5 flex flex-col xs:flex-row sm:flex-row items-start xs:items-center sm:items-center justify-between gap-4 transition-all hover:border-[#059669]/25 hover:bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                data.isOwner
                  ? "bg-emerald-50 text-[#059669] border border-emerald-100/40"
                  : "bg-amber-50 text-amber-600 border border-amber-100/40"
              }`}>
                {data.isOwner ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <MapPin className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                  {data.isOwner
                    ? "Lihat Detail Lengkap?"
                    : data.requestType === "asn"
                      ? "Pengajuan ASN — Login Diperlukan"
                      : "Ingin Melihat Detail Pengajuan?"}
                </p>
                <p className="text-[10px] sm:text-xs font-medium text-slate-400 max-w-xs leading-relaxed mt-0.5">
                  {data.isOwner
                    ? "Lihat status persyaratan dan dokumen hasil."
                    : data.requestType === "asn"
                      ? "Login dengan akun pegawai untuk mengakses detail."
                      : "Login ke akun Anda untuk mengakses detail pengajuan."}
                </p>
              </div>
            </div>

            <Link
              href={detailHref}
              className={`w-full xs:w-auto sm:w-auto shrink-0 h-11 px-5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                data.isOwner
                  ? "bg-[#059669] hover:bg-[#047857] text-white shadow-[0_6px_16px_-4px_rgba(5,150,105,0.4)]"
                  : "bg-amber-500 hover:bg-amber-600 text-white shadow-[0_6px_16px_-4px_rgba(245,158,11,0.4)]"
              }`}
            >
              <span>
                {data.isOwner
                  ? "Buka Detail Pengajuan"
                  : data.requestType === "asn"
                    ? "Login Akun Pegawai"
                    : "Login untuk Detail"}
              </span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
