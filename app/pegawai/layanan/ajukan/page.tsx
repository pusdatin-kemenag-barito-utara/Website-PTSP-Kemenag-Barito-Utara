import PageBanner from "@/components/common/PageBanner";
import { 
  ArrowRight, 
  Briefcase, 
  TrendingUp, 
  Award, 
  UserMinus, 
  CalendarDays,
  GraduationCap,
  DollarSign,
  Users,
  Sparkles,
  FileText as DefaultIcon 
} from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { services as servicesTable } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export default async function AjukanLayananPage() {
  const user = await getCurrentUser();
  
  const data = await db.query.services.findMany({
    where: eq(servicesTable.category, "asn"),
    orderBy: [asc(servicesTable.sortOrder)],
  });

  // Pemetaan Ikon & Tema Warna Kontekstual Berdasarkan Nama/Slug Layanan ASN
  const getLayananTheme = (name: string, slug: string, index: number) => {
    const lowerName = name.toLowerCase();
    const lowerSlug = slug.toLowerCase();

    if (lowerName.includes("cuti") || lowerSlug.includes("cuti")) {
      return {
        icon: CalendarDays,
        bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "hover:border-emerald-500/40 dark:hover:border-emerald-500/40",
        arrowBg: "group-hover:bg-emerald-500 group-hover:text-white",
        badge: "Cuti ASN",
        badgeColor: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300",
      };
    }
    if (lowerName.includes("pangkat") || lowerSlug.includes("pangkat")) {
      return {
        icon: TrendingUp,
        bg: "bg-blue-500/10 dark:bg-blue-500/20",
        text: "text-blue-600 dark:text-blue-400",
        border: "hover:border-blue-500/40 dark:hover:border-blue-500/40",
        arrowBg: "group-hover:bg-blue-500 group-hover:text-white",
        badge: "Karir & Jabatan",
        badgeColor: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
      };
    }
    if (lowerName.includes("gaji") || lowerSlug.includes("kgb") || lowerSlug.includes("gaji")) {
      return {
        icon: DollarSign,
        bg: "bg-amber-500/10 dark:bg-amber-500/20",
        text: "text-amber-600 dark:text-amber-400",
        border: "hover:border-amber-500/40 dark:hover:border-amber-500/40",
        arrowBg: "group-hover:bg-amber-500 group-hover:text-white",
        badge: "Kenaikan Gaji",
        badgeColor: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300",
      };
    }
    if (lowerName.includes("mutasi") || lowerSlug.includes("mutasi")) {
      return {
        icon: Users,
        bg: "bg-purple-500/10 dark:bg-purple-500/20",
        text: "text-purple-600 dark:text-purple-400",
        border: "hover:border-purple-500/40 dark:hover:border-purple-500/40",
        arrowBg: "group-hover:bg-purple-500 group-hover:text-white",
        badge: "Rotasi / Penugasan",
        badgeColor: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300",
      };
    }
    if (lowerName.includes("belajar") || lowerSlug.includes("belajar")) {
      return {
        icon: GraduationCap,
        bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
        text: "text-indigo-600 dark:text-indigo-400",
        border: "hover:border-indigo-500/40 dark:hover:border-indigo-500/40",
        arrowBg: "group-hover:bg-indigo-500 group-hover:text-white",
        badge: "Pendidikan ASN",
        badgeColor: "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300",
      };
    }
    if (lowerName.includes("pensiun") || lowerSlug.includes("pensiun")) {
      return {
        icon: Award,
        bg: "bg-teal-500/10 dark:bg-teal-500/20",
        text: "text-teal-600 dark:text-teal-400",
        border: "hover:border-teal-500/40 dark:hover:border-teal-500/40",
        arrowBg: "group-hover:bg-teal-500 group-hover:text-white",
        badge: "Purnabakti",
        badgeColor: "bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300",
      };
    }
    if (lowerName.includes("pemberhentian") || lowerName.includes("pengunduran")) {
      return {
        icon: UserMinus,
        bg: "bg-rose-500/10 dark:bg-rose-500/20",
        text: "text-rose-600 dark:text-rose-400",
        border: "hover:border-rose-500/40 dark:hover:border-rose-500/40",
        arrowBg: "group-hover:bg-rose-500 group-hover:text-white",
        badge: "Administrasi Pegawai",
        badgeColor: "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300",
      };
    }

    // Default Fallback Themes
    const fallbacks = [
      { icon: Briefcase, bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", border: "hover:border-slate-400/40", arrowBg: "group-hover:bg-slate-700 group-hover:text-white", badge: "Layanan ASN", badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" },
      { icon: Sparkles, bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "hover:border-emerald-400/40", arrowBg: "group-hover:bg-emerald-600 group-hover:text-white", badge: "Layanan ASN", badgeColor: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" },
    ];
    return fallbacks[index % fallbacks.length];
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Ringkas Header Minimalis */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/50 px-3 py-0.5 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 mb-2">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Portal Layanan ASN</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Ajukan Layanan ASN
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-xs sm:text-sm max-w-xl font-medium leading-relaxed">
            Pilih jenis layanan kepegawaian mandiri yang ingin Anda ajukan.
          </p>
        </div>

        {/* Badge Jumlah Layanan dengan Animasi Pulse */}
        <div className="inline-flex items-center gap-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-3.5 py-2 shadow-xs shrink-0 self-start sm:self-auto transition-all hover:scale-105">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div className="text-xs">
            <span className="font-black text-slate-900 dark:text-slate-100 text-sm mr-1">{data.length}</span>
            <span className="font-extrabold text-slate-500 dark:text-slate-400">Layanan Tersedia</span>
          </div>
        </div>
      </div>

      {/* Grid List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {data.map((item, index) => {
          const theme = getLayananTheme(item.name, item.slug, index);
          const Icon = theme.icon || DefaultIcon;
          const targetHref = item.slug === "cuti" ? "/pegawai/cuti" : `/pegawai/layanan/ajukan/${item.slug}`;

          return (
            <Link
              key={item.id.toString()}
              href={targetHref}
              className={`group relative bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 ${theme.border} transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col justify-between`}
            >
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl ${theme.bg} ${theme.text} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className={`text-[9px] sm:text-xs font-extrabold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full ${theme.badgeColor} shrink-0`}>
                    {theme.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-sm line-clamp-2 leading-relaxed font-medium">
                    {item.description || "Pengajuan layanan kepegawaian mandiri secara online."}
                  </p>
                </div>
              </div>

              <div className="pt-3 sm:pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Mulai Pengajuan
                </span>
                <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ${theme.arrowBg} flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 shrink-0`}>
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
