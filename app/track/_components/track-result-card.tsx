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
  Bookmark
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";

interface TrackResultCardProps {
  data: any;
}

export function TrackResultCard({ data }: TrackResultCardProps) {
  // Ultra-premium gradient schemes based on status
  const getGradient = (color: string) => {
    switch (color) {
      case "blue":
        return "from-blue-600 via-indigo-500 to-indigo-700 shadow-blue-500/20";
      case "amber":
        return "from-amber-500 via-amber-500 to-amber-600 shadow-amber-500/20";
      case "rose":
        return "from-rose-600 via-rose-500 to-rose-700 shadow-rose-500/20";
      case "emerald":
        return "from-emerald-600 via-[#059669] to-[#047857] shadow-emerald-500/20";
      default:
        return "from-slate-700 via-slate-600 to-slate-800 shadow-slate-500/20";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="overflow-hidden rounded-[2.5rem] bg-white border border-slate-200/50 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.04)]">
        
        {/* Modern Glowing Status Header */}
        <div
          className={`relative p-8 md:p-12 text-center bg-gradient-to-br ${getGradient(data.statusColor)} overflow-hidden`}
        >
          {/* Decorative Pattern & Blurs */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60 pointer-events-none" />
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 backdrop-blur-md border border-white/10 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
                Status Saat Ini
              </span>
            </div>
            
            <h2 className="text-4xl font-extrabold text-white md:text-5xl uppercase tracking-tight leading-none drop-shadow-sm">
              {data.status}
            </h2>
            
            <p className="mx-auto max-w-lg text-xs md:text-sm font-semibold text-white/90 leading-relaxed">
              {data.statusDescription}
            </p>
          </div>
        </div>

        {/* Beautiful Organized Info Grid */}
        <div className="p-6 md:p-10 space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Card 1: Nomor Permohonan & Layanan */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 space-y-5 transition-all hover:bg-slate-50">
              <div className="flex gap-4.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#059669] border border-emerald-100/50">
                  <Hash className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Nomor Permohonan
                  </span>
                  <p className="text-lg font-black text-slate-800 tracking-tight">
                    {data.requestNumber}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100/80 pt-4 flex gap-4.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#059669] border border-emerald-100/50">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Nama Layanan
                  </span>
                  <p className="text-sm font-bold text-slate-800 leading-snug truncate">
                    {data.serviceName}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 truncate">
                    {data.itemName}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Pemohon & Tanggal */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 space-y-5 transition-all hover:bg-slate-50">
              <div className="flex gap-4.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#059669] border border-emerald-100/50">
                  <User className="h-5 w-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Pemohon / Pengaju
                  </span>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {data.isOwner
                      ? data.applicantName
                      : data.applicantName.charAt(0) +
                        "****" +
                        data.applicantName.charAt(
                          data.applicantName.length - 1,
                        )}
                  </p>
                  {!data.isOwner ? (
                    <p className="text-[10px] text-slate-400 font-medium leading-none">
                      *Nama disamarkan untuk privasi
                    </p>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 leading-none">
                      <ShieldCheck className="h-3 w-3" />
                      INI PENGAJUAN ANDA
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100/80 pt-4 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                    Diajukan Pada
                  </span>
                  <p className="text-xs font-bold text-slate-700">
                    {format(new Date(data.createdAt), "dd MMM yyyy", {
                      locale: localeId,
                    })}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                    Pembaruan
                  </span>
                  <p className="text-xs font-bold text-slate-700">
                    {format(new Date(data.updatedAt), "dd MMM yyyy, HH:mm", {
                      locale: localeId,
                    })}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Action Box at the bottom */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all hover:border-[#059669]/25 hover:bg-slate-50/60">
            <div className="flex items-center gap-4.5 text-center sm:text-left">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  data.isOwner 
                    ? "bg-emerald-50 text-[#059669] border border-emerald-100/40" 
                    : "bg-slate-100 text-slate-500 border border-slate-200/40"
                }`}
              >
                {data.isOwner ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <MapPin className="h-6 w-6" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  {data.isOwner
                    ? "Lihat Detail Lengkap?"
                    : "Butuh Informasi Lebih Lanjut?"}
                </p>
                <p className="text-xs font-medium text-slate-400 max-w-sm">
                  {data.isOwner
                    ? "Klik tombol untuk melihat status persyaratan dan dokumen hasil."
                    : "Kunjungi kantor Kemenag Barito Utara atau hubungi helpdesk kami."}
                </p>
              </div>
            </div>
            
            <Link
              href={
                data.isOwner
                  ? `/dashboard/pengajuan/${data.id}`
                  : `/login?callbackUrl=${encodeURIComponent(`/dashboard/pengajuan/${data.id}`)}`
              }
              className={`group w-full sm:w-auto h-12 px-6 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                data.isOwner
                  ? "bg-[#059669] hover:bg-[#047857] text-white shadow-[0_8px_20px_-6px_rgba(5,150,105,0.4)] hover:shadow-[0_10px_25px_-5px_rgba(5,150,105,0.5)]"
                  : "bg-white border border-slate-200 hover:border-[#059669]/30 hover:bg-slate-50 text-slate-700 hover:text-[#059669]"
              }`}
            >
              <span>{data.isOwner ? "Buka Detail Pengajuan" : "Login ke Akun"}</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
