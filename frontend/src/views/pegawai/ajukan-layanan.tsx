import { useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Search,
  PlusCircle,
  History,
  FileText,
  CalendarDays,
  TrendingUp,
  DollarSign,
  Users,
  GraduationCap,
  Award,
  UserCheck,
} from "lucide-react";
import Link from "@/lib/next-compat/link";

// Pemetaan ikon tematik yang elegan & profesional (tanpa warna-warni pelangi)
function getServiceIcon(name: string, slug: string) {
  const lower = (name + " " + slug).toLowerCase();
  if (lower.includes("cuti")) return CalendarDays;
  if (lower.includes("pangkat") || lower.includes("karir")) return TrendingUp;
  if (lower.includes("gaji") || lower.includes("kgb")) return DollarSign;
  if (lower.includes("mutasi") || lower.includes("rotasi")) return Users;
  if (lower.includes("belajar") || lower.includes("pendidikan")) return GraduationCap;
  if (lower.includes("pensiun")) return Award;
  if (lower.includes("pemberhentian") || lower.includes("pengunduran")) return UserCheck;
  return FileText;
}

// Kategori layanan yang rapi dan konsisten
function getServiceCategory(name: string, slug: string) {
  const lower = (name + " " + slug).toLowerCase();
  if (lower.includes("cuti")) return "Cuti Pegawai";
  if (lower.includes("pangkat")) return "Kepangkatan & Karir";
  if (lower.includes("gaji") || lower.includes("kgb")) return "Kesejahteraan";
  if (lower.includes("mutasi")) return "Mutasi & Penugasan";
  if (lower.includes("belajar")) return "Pengembangan SDM";
  if (lower.includes("pensiun")) return "Purnabakti";
  return "Administrasi ASN";
}

export function AjukanLayananView({ services }: { services: any[] }) {
  const [search, setSearch] = useState("");
  const data = services || [];

  const filtered = data.filter((item) => {
    const term = search.toLowerCase();
    return (
      (item.name || "").toLowerCase().includes(term) ||
      (item.description || "").toLowerCase().includes(term) ||
      (item.slug || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header Ringkas & Formal */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Pengajuan Layanan ASN
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-xs sm:text-sm font-medium">
            Pilih layanan kepegawaian mandiri untuk diproses secara digital dan terintegrasi.
          </p>
        </div>

        {/* Lencana Statistik Layanan */}
        <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 self-start sm:self-auto">
          <span className="font-bold text-emerald-700 dark:text-emerald-400">{data.length}</span>
          <span>Layanan Tersedia</span>
        </div>
      </div>

      {/* Tab Navigasi Standar (Border-b) & Search Input */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 -mt-1">
        <div className="flex items-center gap-6 text-xs sm:text-sm">
          <span className="pb-3 border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold">
            Katalog Layanan ASN
          </span>
          <Link
            href="/pegawai/layanan/riwayat"
            className="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors"
          >
            Riwayat Pengajuan
          </Link>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64 pb-2 sm:pb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari jenis layanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 sm:py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-colors"
          />
        </div>
      </div>

      {/* Grid Katalog Layanan - Desain Profesional & Bersih */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <p className="text-slate-800 dark:text-slate-200 font-bold text-sm">Layanan Tidak Ditemukan</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs max-w-xs font-medium">
            Tidak ada layanan kepegawaian yang cocok dengan kata kunci &ldquo;{search}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filtered.map((item) => {
            const Icon = getServiceIcon(item.name, item.slug);
            const category = getServiceCategory(item.name, item.slug);
            const targetHref = item.slug === "cuti" ? "/pegawai/cuti" : `/pegawai/layanan/ajukan/${item.slug}`;

            return (
              <Link
                key={item.id.toString()}
                href={targetHref}
                className="group relative bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-600/40 hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar: Icon & Category Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md shrink-0">
                      {category}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed font-medium">
                      {item.description || "Pengajuan layanan kepegawaian mandiri secara online dan terintegrasi."}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Layanan Mandiri
                  </span>
                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
                    <span>Mulai Ajukan</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AjukanLayananView;
