import React, { useState, useMemo } from "react";
import { ClipboardList, Sparkles } from "lucide-react";
import { LaporanKpiCards } from "./laporan-kpi-cards";
import { LaporanFilterBar } from "./laporan-filter-bar";
import { LaporanTable } from "./laporan-table";
import { LaporanReviewModal } from "./laporan-review-modal";
import { LaporanDetailModal } from "./laporan-detail-modal";
import { LaporanRekapPegawai } from "./laporan-rekap-pegawai";
import type { LaporanKinerjaItem, LaporanFilterState } from "./types";
import { deleteLaporanKinerjaAdminAction } from "@/lib/actions/admin/kepegawaian";
import { toast } from "sonner";

interface LaporanManagerClientProps {
  initialData: LaporanKinerjaItem[];
  masterOptions: any[];
  profile?: any;
}

export const LaporanManagerClient: React.FC<LaporanManagerClientProps> = ({
  initialData,
  masterOptions,
  profile,
}) => {
  const [items, setItems] = useState<LaporanKinerjaItem[]>(initialData || []);
  const [activeTab, setActiveTab] = useState<"laporan" | "rekap">("laporan");
  
  // Modals state
  const [reviewItem, setReviewItem] = useState<LaporanKinerjaItem | null>(null);
  const [detailItem, setDetailItem] = useState<LaporanKinerjaItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters state
  const currentDate = new Date();
  const [filters, setFilters] = useState<LaporanFilterState>({
    search: "",
    unitKerja: "all",
    status: "all",
    month: 0, // 0 = Semua Bulan
    year: currentDate.getFullYear(),
    date: "",
  });

  // Extract unit kerja options from master options or existing items
  const unitKerjaOptions = useMemo(() => {
    const fromMaster = (masterOptions || [])
      .filter((opt) => opt.category === "unit_kerja" || opt.kategori === "unit_kerja")
      .map((opt) => opt.value || opt.label || opt.nama)
      .filter(Boolean);

    const fromItems = items.map((i) => i.pegawaiUnitKerja).filter(Boolean);
    const combined = Array.from(new Set([...fromMaster, ...fromItems]));
    return combined.sort();
  }, [masterOptions, items]);

  const handleFilterChange = (newFilters: Partial<LaporanFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      unitKerja: "all",
      status: "all",
      month: 0,
      year: currentDate.getFullYear(),
      date: "",
    });
  };

  // Filter items based on state
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Search filter
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const nama = (item.pegawaiNama || "").toLowerCase();
        const nip = (item.pegawaiNip || "").toLowerCase();
        const kegiatan = (item.kegiatanTugasJabatan || "").toLowerCase();
        if (!nama.includes(query) && !nip.includes(query) && !kegiatan.includes(query)) {
          return false;
        }
      }

      // 2. Unit Kerja filter
      if (filters.unitKerja !== "all") {
        if (item.pegawaiUnitKerja !== filters.unitKerja) {
          return false;
        }
      }

      // 3. Status filter
      if (filters.status !== "all") {
        if (item.status !== filters.status) {
          return false;
        }
      }

      // 4. Date filter
      if (filters.date) {
        if (item.tanggal !== filters.date && !item.tanggal?.startsWith(filters.date)) {
          return false;
        }
      }

      // 5. Month filter
      if (filters.month > 0) {
        try {
          const itemMonth = new Date(item.tanggal).getMonth() + 1;
          if (itemMonth !== filters.month) return false;
        } catch (e) {}
      }

      // 6. Year filter
      if (filters.year > 0) {
        try {
          const itemYear = new Date(item.tanggal).getFullYear();
          if (itemYear !== filters.year) return false;
        } catch (e) {}
      }

      return true;
    });
  }, [items, filters]);

  // Handlers for Review & Delete
  const handleReviewSuccess = (updatedItem: LaporanKinerjaItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data laporan kinerja ini?")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await deleteLaporanKinerjaAdminAction(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Laporan kinerja berhasil dihapus!");
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err: any) {
      toast.error("Gagal menghapus laporan kinerja.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectPegawaiFromRekap = (nama: string) => {
    setFilters((prev) => ({ ...prev, search: nama }));
    setActiveTab("laporan");
  };

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/50 px-3 py-0.5 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 mb-2">
            <ClipboardList className="h-3.5 w-3.5" />
            <span>Manajemen Kepegawaian & Kinerja ASN</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            E-Laporan Kinerja Harian (E-LK)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-xs sm:text-sm max-w-xl font-medium leading-relaxed">
            Pantau, evaluasi, dan verifikasi seluruh aktivitas kerja harian ASN Kemenag Barito Utara secara transparan dan akuntabel.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-3.5 py-2 shadow-xs shrink-0 self-start sm:self-auto">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <div className="text-xs">
            <span className="font-extrabold text-slate-500 dark:text-slate-400 mr-1.5">Sistem E-LK:</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400">Aktif & Terintegrasi</span>
          </div>
        </div>
      </div>

      {/* 1. KPI Statistics Cards */}
      <LaporanKpiCards items={filteredItems} />

      {/* 2. Filter Bar & Navigation Tabs */}
      <LaporanFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        unitKerjaOptions={unitKerjaOptions}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        filteredItems={filteredItems}
      />

      {/* 3. Main Content: Table View vs Rekap View */}
      {activeTab === "laporan" ? (
        <LaporanTable
          items={filteredItems}
          onReview={(item) => setReviewItem(item)}
          onDetail={(item) => setDetailItem(item)}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      ) : (
        <LaporanRekapPegawai
          items={filteredItems}
          onSelectPegawai={handleSelectPegawaiFromRekap}
          selectedMonth={filters.month}
          selectedYear={filters.year}
        />
      )}

      {/* 4. Modals */}
      <LaporanReviewModal
        isOpen={Boolean(reviewItem)}
        onClose={() => setReviewItem(null)}
        laporan={reviewItem}
        onSuccess={handleReviewSuccess}
      />

      <LaporanDetailModal
        isOpen={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        laporan={detailItem}
        onOpenReview={(item) => setReviewItem(item)}
      />
    </div>
  );
};
