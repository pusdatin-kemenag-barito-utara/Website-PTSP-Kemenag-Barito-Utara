import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Printer, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  ListOrdered,
  Users,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LaporanFilterState, LaporanKinerjaItem } from "./types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";

interface LaporanFilterBarProps {
  filters: LaporanFilterState;
  onFilterChange: (newFilters: Partial<LaporanFilterState>) => void;
  onResetFilters: () => void;
  unitKerjaOptions: string[];
  activeTab: "laporan" | "rekap";
  onTabChange: (tab: "laporan" | "rekap") => void;
  filteredItems: LaporanKinerjaItem[];
}

const BULAN_NAMES = [
  "Semua Bulan",
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const LaporanFilterBar: React.FC<LaporanFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  unitKerjaOptions,
  activeTab,
  onTabChange,
  filteredItems,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  const handleExportPDF = () => {
    if (!filteredItems || filteredItems.length === 0) {
      toast.error("Tidak ada data laporan untuk dicetak.");
      return;
    }

    setIsExporting(true);
    try {
      const doc = new jsPDF("l", "mm", "a4"); // Landscape for wider table

      // Kop Surat Kemenag Barito Utara
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("KEMENTERIAN AGAMA REPUBLIK INDONESIA", 148, 14, { align: "center" });
      doc.setFontSize(11);
      doc.text("KANTOR KEMENTERIAN AGAMA KABUPATEN BARITO UTARA", 148, 20, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text("Jl. Yetro Sinseng No. 04 Muara Teweh 73812 Kalimantan Tengah", 148, 25, { align: "center" });

      // Line Divider
      doc.setLineWidth(0.8);
      doc.line(14, 28, 282, 28);
      doc.setLineWidth(0.2);
      doc.line(14, 29, 282, 29);

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      const bulanLabel = filters.month > 0 ? BULAN_NAMES[filters.month] : "Semua Bulan";
      doc.text(
        `REKAPITULASI LAPORAN KINERJA HARIAN (E-LK) PEGAWAI – ${bulanLabel.toUpperCase()} ${filters.year}`,
        148,
        36,
        { align: "center" }
      );

      const tableColumn = [
        "No",
        "Nama Pegawai & NIP",
        "Unit Kerja / Seksi",
        "Tanggal & Jam",
        "Kegiatan Tugas Jabatan",
        "Kuantitas / Hasil",
        "Status",
        "Catatan Pimpinan",
      ];

      const tableRows: any[] = [];

      filteredItems.forEach((item, index) => {
        let tglStr = item.tanggal;
        try {
          tglStr = format(new Date(item.tanggal), "d MMM yyyy", { locale: localeId });
        } catch (e) {}

        const statusLabel =
          item.status === "approved"
            ? "Disetujui"
            : item.status === "revision"
            ? "Revisi"
            : "Pending";

        tableRows.push([
          (index + 1).toString(),
          `${item.pegawaiNama || "-"}\nNIP: ${item.pegawaiNip || "-"}`,
          item.pegawaiUnitKerja || "-",
          `${tglStr}\n${item.waktuPelaksanaan || "-"}`,
          item.kegiatanTugasJabatan || "-",
          item.hasil || "-",
          statusLabel,
          item.komentarPimpinan || "-",
        ]);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 42,
        margin: { left: 14, right: 14 },
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
          font: "helvetica",
          valign: "middle",
        },
        headStyles: {
          fillColor: [15, 138, 84], // PTSP Green
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 10 },
          1: { cellWidth: 45 },
          2: { cellWidth: 35 },
          3: { halign: "center", cellWidth: 26 },
          4: { cellWidth: 70 },
          5: { halign: "center", cellWidth: 26 },
          6: { halign: "center", cellWidth: 24 },
          7: { cellWidth: 32 },
        },
      });

      // Signature Block
      const finalY = (doc as any).lastAutoTable.finalY || 140;
      const pageHeight = doc.internal.pageSize.height;

      if (finalY + 40 > pageHeight) {
        doc.addPage();
      }

      const sigY = finalY + 40 > pageHeight ? 25 : finalY + 10;
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Muara Teweh, ${format(new Date(), "d MMMM yyyy", { locale: localeId })}`,
        220,
        sigY
      );
      doc.text("Kepala Kantor Kementerian Agama", 220, sigY + 5);
      doc.text("Kabupaten Barito Utara,", 220, sigY + 9);
      doc.text("( ..................................................... )", 220, sigY + 28);

      doc.save(`Rekap_LKH_${bulanLabel}_${filters.year}.pdf`);
      toast.success("Rekap laporan kinerja berhasil dicetak ke PDF!");
    } catch (err: any) {
      console.error("Gagal cetak PDF:", err);
      toast.error("Gagal mencetak PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.unitKerja !== "all" ||
    filters.status !== "all" ||
    filters.month !== 0 ||
    filters.date !== "";

  return (
    <div className="space-y-3">
      {/* Top Bar: Tabs & Cetak Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            type="button"
            onClick={() => onTabChange("laporan")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "laporan"
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <ListOrdered className="h-3.5 w-3.5" />
            <span>Log Aktivitas Harian</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
              {filteredItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("rekap")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "rekap"
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Rekap Keaktifan Pegawai</span>
          </button>
        </div>

        {/* Action Button: Cetak Draf PDF */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold gap-1.5 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={handleExportPDF}
            disabled={isExporting || filteredItems.length === 0}
            className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Printer className="h-3.5 w-3.5" />
            )}
            <span>{isExporting ? "Mencetak..." : "Cetak Rekap PDF"}</span>
          </Button>
        </div>
      </div>

      {/* Filter Inputs Grid */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* 1. Search Bar */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="Cari nama pegawai, NIP, atau kegiatan..."
              className="w-full h-10 pl-9.5 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* 2. Unit Kerja Dropdown */}
          <div className="lg:col-span-3 relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              value={filters.unitKerja}
              onChange={(e) => onFilterChange({ unitKerja: e.target.value })}
              className="w-full h-10 pl-9.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
            >
              <option value="all">Semua Unit Kerja</option>
              {unitKerjaOptions.map((unit, idx) => (
                <option key={idx} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Bulan Dropdown */}
          <div className="lg:col-span-2 relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <select
              value={filters.month}
              onChange={(e) => onFilterChange({ month: parseInt(e.target.value, 10) })}
              className="w-full h-10 pl-8 pr-7 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
            >
              {BULAN_NAMES.map((name, idx) => (
                <option key={idx} value={idx}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Tahun Dropdown */}
          <div className="lg:col-span-1.5 relative">
            <select
              value={filters.year}
              onChange={(e) => onFilterChange({ year: parseInt(e.target.value, 10) })}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
            >
              {yearOptions.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Status Dropdown */}
          <div className="lg:col-span-1.5 relative">
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu Review</option>
              <option value="approved">Disetujui</option>
              <option value="revision">Perlu Revisi</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
