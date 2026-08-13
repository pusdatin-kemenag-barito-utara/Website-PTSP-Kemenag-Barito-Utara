import Link from "@/lib/next-compat/link";
import { ChevronLeft, Compass } from "lucide-react";

export function TrackHeader() {
  return (
    <div className="mb-8 text-center space-y-4">
      <Link
        href="/"
        className="group inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#059669] bg-white hover:bg-slate-50 px-4 py-2 rounded-full border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 active:scale-95"
      >
        <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:text-[#059669] group-hover:-translate-x-0.5 transition-all" />
        <span>Kembali ke Beranda</span>
      </Link>
      
      {/* Premium Badge */}
      <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-emerald-50/80 border border-emerald-100/50 px-4 py-1.5 backdrop-blur-md">
        <Compass className="h-3.5 w-3.5 text-[#059669] animate-spin-[spin_8s_linear_infinite]" style={{ animation: 'spin 8s linear infinite' }} />
        <span className="text-[10px] font-black uppercase tracking-wider text-[#059669]">
          Portal Pelacakan Publik
        </span>
      </div>

      <h1 className="text-3xl font-black text-slate-900 md:text-4xl tracking-tight leading-tight">
        Lacak <span className="bg-gradient-to-r from-[#059669] to-[#047857] bg-clip-text text-transparent">Permohonan Anda</span>
      </h1>
      <p className="mt-2 text-xs md:text-sm font-medium text-slate-400 max-w-lg mx-auto leading-relaxed">
        Masukkan kode pendaftaran unik Anda untuk mengetahui status progres terbaru, riwayat peninjauan berkas, serta mengunduh hasil layanan secara instan.
      </p>
    </div>
  );
}
