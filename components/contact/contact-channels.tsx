import Link from "next/link";
import {
  ShieldAlert,
  ExternalLink,
  ArrowRight,
  Search,
  HelpCircle,
  Mail,
} from "lucide-react";

export function ContactChannels() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Kanal Pengaduan */}
      <div className="rounded-[2rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50">
            <ShieldAlert className="h-6 w-6 text-rose-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Kanal Pengaduan</h2>
        </div>
        <p className="text-sm leading-relaxed text-slate-600 mb-6">
          Untuk pelaporan dugaan pelanggaran layanan atau penyimpangan prosedur,
          gunakan kanal resmi Whistle Blowing System (WBS) Kementerian Agama.
        </p>
        <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-100/50 p-5">
          <p className="font-bold text-amber-900 text-sm">
            Whistle Blowing System (WBS)
          </p>
          <p className="mt-1 text-xs text-amber-800/80">
            Laporan Anda akan dijaga kerahasiaannya dan diproses sesuai
            mekanisme yang berlaku.
          </p>
          <a
            href="https://wbs.kemenag.go.id"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-amber-700 hover:-translate-y-0.5 shadow-md"
          >
            Buka WBS Kemenag
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Quick Links */}
      <div className="rounded-[2rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
            <ArrowRight className="h-6 w-6 text-[#1f4bb7]" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Akses Cepat</h2>
        </div>
        <p className="text-sm leading-relaxed text-slate-600 mb-6">
          Gunakan tautan di bawah ini untuk navigasi langsung ke fitur utama
          portal PTSP.
        </p>
        <div className="space-y-3">
          <Link
            href="/track"
            className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-[#1f4bb7]/20 hover:bg-[#1f4bb7]/5"
          >
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-[#1f4bb7]" />
              <span className="text-sm font-bold text-slate-800 group-hover:text-[#1f4bb7]">
                Lacak Pengajuan
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#1f4bb7]" />
          </Link>
          <Link
            href="/layanan"
            className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-[#1f4bb7]/20 hover:bg-[#1f4bb7]/5"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-bold text-slate-800 group-hover:text-[#1f4bb7]">
                Katalog Layanan
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#1f4bb7]" />
          </Link>
          <Link
            href="/dashboard/pengajuan/baru"
            className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-[#1f4bb7]/20 hover:bg-[#1f4bb7]/5"
          >
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-bold text-slate-800 group-hover:text-[#1f4bb7]">
                Ajukan Permohonan Baru
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#1f4bb7]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
