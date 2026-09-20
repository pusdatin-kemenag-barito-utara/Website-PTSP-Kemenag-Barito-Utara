import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "@/lib/next-compat/navigation";
import { 
  Search, 
  Layers3, 
  FileText, 
  X, 
  ExternalLink,
  CalendarClock,
  UserCheck,
  ArrowRightLeft,
  Coins,
  GraduationCap,
  Award,
  Briefcase,
  Clock,
  ArrowRight
} from "lucide-react";
import { motion as m, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

type Requirement = {
  id: string;
  documentName: string;
};

type ServiceItem = {
  id: number;
  name: string;
  serviceRequirements?: Requirement[];
};

type Service = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  requirementsText?: string | null;
  sopUrl?: string | null;
  serviceItems?: ServiceItem[];
};

function getServiceMeta(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("cuti")) {
    return {
      icon: CalendarClock,
      category: "Cuti & Izin",
      categoryColor: "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/80",
      description: "Pengajuan hak cuti tahunan, cuti sakit, cuti bersalin, atau cuti alasan penting bagi ASN Kemenag.",
      sla: "1 - 2 Hari Kerja",
    };
  }
  if (lower.includes("pensiun")) {
    return {
      icon: UserCheck,
      category: "Kesejahteraan",
      categoryColor: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800/80",
      description: "Pemberkasan usulan pensiun BUP, janda/duda, dan penetapan surat keputusan pensiun.",
      sla: "3 - 7 Hari Kerja",
    };
  }
  if (lower.includes("mutasi")) {
    return {
      icon: ArrowRightLeft,
      category: "Karier & Mutasi",
      categoryColor: "text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border-sky-200/80 dark:border-sky-800/80",
      description: "Permohonan perpindahan tugas antar unit kerja di lingkungan Kantor Kementerian Agama.",
      sla: "5 - 14 Hari Kerja",
    };
  }
  if (lower.includes("gaji") || lower.includes("kgb")) {
    return {
      icon: Coins,
      category: "Kesejahteraan",
      categoryColor: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800/80",
      description: "Pemberkasan berkala kenaikan gaji bagi ASN yang telah memenuhi masa kerja golongan.",
      sla: "2 - 3 Hari Kerja",
    };
  }
  if (lower.includes("belajar") || lower.includes("tugas belajar") || lower.includes("izin belajar")) {
    return {
      icon: GraduationCap,
      category: "Pengembangan Diri",
      categoryColor: "text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/80 dark:border-indigo-800/80",
      description: "Pengajuan surat rekomendasi izin belajar atau tugas belajar peningkatan jenjang pendidikan formal.",
      sla: "3 - 5 Hari Kerja",
    };
  }
  if (lower.includes("pangkat") || lower.includes("kenaikan pangkat")) {
    return {
      icon: Award,
      category: "Karier & Mutasi",
      categoryColor: "text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border-sky-200/80 dark:border-sky-800/80",
      description: "Usulan kenaikan pangkat reguler maupun struktural bagi Pegawai Negeri Sipil.",
      sla: "Sesuai Periode BKN",
    };
  }
  return {
    icon: Briefcase,
    category: "Administrasi ASN",
    categoryColor: "text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
    description: "Layanan administrasi kepegawaian internal Kantor Kementerian Agama Kabupaten Barito Utara.",
    sla: "1 - 3 Hari Kerja",
  };
}

export function ServicesGridPegawai({ services, totalItems = 0 }: { services: Service[], totalItems?: number }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  
  // Modal state
  const [selectedRequirements, setSelectedRequirements] = useState<Service | null>(null);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  const filteredServices = useMemo(() => {
    const keyword = query.toLowerCase().trim();
    if (!keyword) return services;

    const orGroups = keyword.split(",").map((g) => g.trim()).filter(Boolean);

    return services.filter((service) => {
      const meta = getServiceMeta(service.name);
      return orGroups.some((group) => {
        const andKeywords = group.split(/\s+/).filter(Boolean);
        return andKeywords.every(
          (k) =>
            service.name.toLowerCase().includes(k) ||
            meta.category.toLowerCase().includes(k) ||
            meta.description.toLowerCase().includes(k) ||
            (service.description && service.description.toLowerCase().includes(k)) ||
            (service.serviceItems ?? []).some(
              (item) =>
                item.name.toLowerCase().includes(k) ||
                (item.serviceRequirements ?? []).some((r) =>
                  r.documentName.toLowerCase().includes(k)
                )
            )
        );
      });
    });
  }, [services, query]);

  const handleApply = (service: Service) => {
    localStorage.setItem("selectedPegawaiServiceId", String(service.id));
    router.push("/login/pegawai?callbackUrl=/pegawai/layanan/ajukan");
  };

  return (
    <div className="space-y-8">
      {/* ── Top Bar: Stats and Search ── */}
      <section className="relative z-10 w-full flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        {/* Stats Section */}
        <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/10 dark:border-slate-800 bg-emerald-50/20 dark:bg-slate-900/60 p-4 shadow-sm backdrop-blur-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white shadow-md">
            <Layers3 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Layanan</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{totalItems || services.length}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="group relative flex items-center">
            <div className="pointer-events-none absolute left-4 sm:left-6 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-[#059669]">
              <Search className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari layanan (contoh: Cuti, Pangkat, Pensiun)..."
              className="h-14 w-full rounded-2xl sm:rounded-3xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/90 pl-12 sm:pl-16 pr-10 sm:pr-12 text-sm sm:text-base font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="mt-2 px-2">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {query ? (
                <span>
                  Hasil: <span className="text-emerald-600 dark:text-emerald-400">{filteredServices.length} Layanan</span>
                </span>
              ) : (
                `Menampilkan ${services.length} Kategori Utama`
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ── Grid of Services (Clean, Modern, Non-AI, No Top Gradient Bar) ── */}
      <section>
        {filteredServices.length === 0 ? (
          <div className="py-16 sm:py-20 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-400 dark:text-slate-500">
              <Search className="h-6 w-6" />
            </div>
            <p className="text-slate-800 dark:text-slate-200 font-bold text-sm sm:text-base">
              Layanan tidak ditemukan
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 max-w-sm mx-auto">
              Coba gunakan kata kunci yang lebih umum atau periksa ejaan kata kunci pencarian Anda.
            </p>
            <button
              onClick={() => setQuery("")}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200/80 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredServices.map((service, index) => {
              const meta = getServiceMeta(service.name);
              const IconComponent = meta.icon;
              const displayDesc = service.description || meta.description;

              return (
                <m.div
                  key={service.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
                  className="group flex flex-col rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:border-emerald-400/80 dark:hover:border-emerald-500/50 hover:shadow-lg hover:shadow-slate-900/5 transition-all duration-200 relative"
                >
                  {/* Top Row: Icon + Category Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-105">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${meta.categoryColor}`}>
                        {meta.category}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Online
                      </span>
                    </div>
                  </div>

                  {/* Service Title */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2">
                    {service.name}
                  </h3>

                  {/* Service Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-5 flex-1">
                    {displayDesc}
                  </p>

                  {/* Meta Info: SLA & Biaya */}
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 py-3 border-t border-slate-100 dark:border-slate-800/80 mb-4">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{meta.sla}</span>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      Gratis (Rp 0)
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1 mt-auto">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedRequirements(service);
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      <span>Syarat & SOP</span>
                    </button>
                    
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleApply(service);
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <span>Ajukan</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </m.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Modern Modal for Requirements & SOP ── */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {selectedRequirements && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <m.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedRequirements(null)}
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
              />
              <m.div
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] z-10"
              >
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 sticky top-0 z-10">
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                      Persyaratan Dokumen & SOP
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-md">
                      {selectedRequirements.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedRequirements(null)}
                    className="p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                  {!selectedRequirements.requirementsText && !selectedRequirements.sopUrl ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm">
                        Belum ada dokumen persyaratan khusus yang dilampirkan untuk layanan ini. Anda dapat langsung melanjutkan ke pengajuan formulir.
                      </p>
                    </div>
                  ) : (
                    <>
                      {selectedRequirements.requirementsText && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                            <FileText className="h-4 w-4" />
                            <span>Berkas Persyaratan yang Diperlukan</span>
                          </h4>
                          <div className="whitespace-pre-line text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/70 dark:border-slate-800">
                            {selectedRequirements.requirementsText}
                          </div>
                        </div>
                      )}

                      {selectedRequirements.sopUrl && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Layers3 className="h-4 w-4 text-emerald-600" />
                            <span>Standar Operasional Prosedur (SOP)</span>
                          </h4>
                          <a 
                            href={selectedRequirements.sopUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 font-bold text-xs hover:bg-emerald-100 transition-colors"
                          >
                            <span>Buka Dokumen SOP Resmi</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-end gap-2.5 mt-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedRequirements(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleApply(selectedRequirements);
                    }}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Lanjutkan Ajukan Layanan</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </m.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
