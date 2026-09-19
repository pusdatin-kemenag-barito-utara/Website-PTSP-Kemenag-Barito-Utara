import React, { useState, useMemo } from "react";
import { 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Eye, 
  UserCheck, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Inbox,
  MessageSquare,
  Loader2,
  Printer,
  FileSpreadsheet,
  ListFilter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LaporanKinerjaItem } from "./types";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

interface LaporanTableProps {
  items: LaporanKinerjaItem[];
  onReview: (item: LaporanKinerjaItem) => void;
  onDetail: (item: LaporanKinerjaItem) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

interface PegawaiGroup {
  key: string;
  userId: string;
  pegawaiNama: string;
  pegawaiNip: string;
  pegawaiJabatan: string;
  pegawaiUnitKerja: string;
  pegawaiAvatar?: string | null;
  items: LaporanKinerjaItem[];
  totalLkh: number;
  pendingCount: number;
  approvedCount: number;
  revisionCount: number;
}

export const LaporanTable: React.FC<LaporanTableProps> = ({
  items,
  onReview,
  onDetail,
  onDelete,
  deletingId,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isPaging, setIsPaging] = useState(false);
  const [viewMode, setViewMode] = useState<"grouped" | "flat">("grouped");

  // Group items by employee
  const groupedPegawai = useMemo(() => {
    const map = new Map<string, PegawaiGroup>();

    items.forEach((item) => {
      const key = item.pegawaiNip || item.userId || item.pegawaiNama || "unknown";
      if (!map.has(key)) {
        map.set(key, {
          key,
          userId: item.userId,
          pegawaiNama: item.pegawaiNama || "Tanpa Nama",
          pegawaiNip: item.pegawaiNip || "-",
          pegawaiJabatan: item.pegawaiJabatan || "-",
          pegawaiUnitKerja: item.pegawaiUnitKerja || "-",
          pegawaiAvatar: item.pegawaiAvatar,
          items: [],
          totalLkh: 0,
          pendingCount: 0,
          approvedCount: 0,
          revisionCount: 0,
        });
      }

      const group = map.get(key)!;
      group.items.push(item);
      group.totalLkh += 1;
      if (item.status === "approved") group.approvedCount += 1;
      else if (item.status === "revision") group.revisionCount += 1;
      else group.pendingCount += 1;
    });

    // Sort items inside each group by date descending
    map.forEach((grp) => {
      grp.items.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
    });

    return Array.from(map.values());
  }, [items]);

  // Expanded keys state (default: expand all if <= 2 employees, otherwise expand first)
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (groupedPegawai.length > 0) {
      initial.add(groupedPegawai[0].key);
    }
    return initial;
  });

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    if (expandedKeys.size === groupedPegawai.length) {
      setExpandedKeys(new Set());
    } else {
      setExpandedKeys(new Set(groupedPegawai.map((g) => g.key)));
    }
  };

  // Pagination for grouped view
  const totalPages = Math.max(
    1,
    Math.ceil(
      (viewMode === "grouped" ? groupedPegawai.length : items.length) / pageSize
    )
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedGroups = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return groupedPegawai.slice(start, start + pageSize);
  }, [groupedPegawai, safeCurrentPage, pageSize]);

  const paginatedFlatItems = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safeCurrentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage === safeCurrentPage || newPage < 1 || newPage > totalPages) return;
    setIsPaging(true);
    setCurrentPage(newPage);
    setTimeout(() => {
      setIsPaging(false);
    }, 120);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (safeCurrentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  // Export PDF khusus pegawai terpilih
  const handleExportPegawaiPDF = (group: PegawaiGroup) => {
    try {
      const doc = new jsPDF("p", "mm", "a4");

      // Kop Surat Kemenag Barito Utara
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("KEMENTERIAN AGAMA REPUBLIK INDONESIA", 105, 15, { align: "center" });
      doc.setFontSize(11);
      doc.text("KANTOR KEMENTERIAN AGAMA KABUPATEN BARITO UTARA", 105, 21, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text("Jl. Yetro Sinseng No. 04 Muara Teweh 73812 Kalimantan Tengah", 105, 26, { align: "center" });

      // Line Divider
      doc.setLineWidth(0.8);
      doc.line(15, 29, 195, 29);
      doc.setLineWidth(0.2);
      doc.line(15, 30, 195, 30);

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("REKAPITULASI LAPORAN KINERJA HARIAN PEGAWAI (E-LK)", 105, 37, { align: "center" });

      // Info Pegawai
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Nama Pegawai", 15, 45);
      doc.setFont("helvetica", "normal");
      doc.text(`: ${group.pegawaiNama}`, 45, 45);

      doc.setFont("helvetica", "bold");
      doc.text("NIP", 15, 50);
      doc.setFont("helvetica", "normal");
      doc.text(`: ${group.pegawaiNip}`, 45, 50);

      doc.setFont("helvetica", "bold");
      doc.text("Jabatan / Unit", 15, 55);
      doc.setFont("helvetica", "normal");
      doc.text(`: ${group.pegawaiJabatan} / ${group.pegawaiUnitKerja}`, 45, 55);

      const tableColumn = ["No", "Tanggal", "Waktu", "Kegiatan Tugas Jabatan", "Hasil / Output", "Status"];
      const tableRows: any[] = [];

      group.items.forEach((item, index) => {
        let tglStr = item.tanggal;
        try {
          tglStr = format(new Date(item.tanggal), "EEEE, d MMM yyyy", { locale: localeId });
        } catch (e) {}

        const statusLabel =
          item.status === "approved"
            ? "Disetujui"
            : item.status === "revision"
            ? "Perlu Revisi"
            : "Pending";

        tableRows.push([
          (index + 1).toString(),
          tglStr,
          item.waktuPelaksanaan || "-",
          item.kegiatanTugasJabatan || "-",
          item.hasil || "-",
          statusLabel,
        ]);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 60,
        margin: { left: 15, right: 15 },
        theme: "grid",
        styles: {
          fontSize: 8.5,
          cellPadding: 3,
          font: "helvetica",
          valign: "middle",
        },
        headStyles: {
          fillColor: [15, 138, 84],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 10 },
          1: { cellWidth: 38 },
          2: { halign: "center", cellWidth: 24 },
          3: { cellWidth: 64 },
          4: { halign: "center", cellWidth: 26 },
          5: { halign: "center", cellWidth: 22 },
        },
      });

      // Signature Block
      const finalY = (doc as any).lastAutoTable.finalY || 120;
      const pageHeight = doc.internal.pageSize.height;

      if (finalY + 45 > pageHeight) {
        doc.addPage();
      }

      const sigY = finalY + 45 > pageHeight ? 30 : finalY + 12;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      doc.text("Pegawai Yang Melaporkan,", 25, sigY);
      doc.text(group.pegawaiNama, 25, sigY + 22);

      doc.text(`Muara Teweh, ${format(new Date(), "d MMMM yyyy", { locale: localeId })}`, 135, sigY);
      doc.text("Pejabat Penilai / Atasan,", 135, sigY + 5);
      doc.text("( ................................................. )", 135, sigY + 22);

      doc.save(`LKH_${group.pegawaiNama.replace(/\s+/g, "_")}.pdf`);
      toast.success(`Draf LKH untuk ${group.pegawaiNama} berhasil diunduh!`);
    } catch (err) {
      toast.error("Gagal mencetak PDF pegawai.");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden transition-all">
      {/* Subheader: Mode Tampilan & Toggle Expand */}
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-800 dark:text-slate-200">
            {viewMode === "grouped" ? (
              <span>Daftar Pegawai ({groupedPegawai.length} ASN)</span>
            ) : (
              <span>Seluruh Aktivitas Harian ({items.length} Laporan)</span>
            )}
          </span>

          {viewMode === "grouped" && groupedPegawai.length > 0 && (
            <button
              type="button"
              onClick={handleExpandAll}
              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer ml-2"
            >
              {expandedKeys.size === groupedPegawai.length ? "Tutup Semua" : "Buka Semua"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "grouped" ? "flat" : "grouped")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <ListFilter className="h-3.5 w-3.5 text-emerald-600" />
            <span>
              {viewMode === "grouped" ? "Ganti ke Tampilan Baris Flat" : "Ganti ke Tampilan per Pegawai"}
            </span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* MODE 1: GROUPED PER PEGAWAI (REKAP PER PEGAWAI DENGAN ACCORDION LKH) */}
      {/* ───────────────────────────────────────────────────────── */}
      {viewMode === "grouped" ? (
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">No</th>
                <th className="px-4 py-3.5 min-w-[240px]">Pegawai</th>
                <th className="px-4 py-3.5 min-w-[160px]">Unit Kerja</th>
                <th className="px-4 py-3.5 min-w-[140px] text-center">Total LKH</th>
                <th className="px-4 py-3.5 min-w-[180px] text-center">Status Verifikasi</th>
                <th className="px-4 py-3.5 min-w-[160px] text-right">Aksi</th>
              </tr>
            </thead>

            <tbody
              className={`divide-y divide-slate-100 dark:divide-slate-800 font-medium transition-opacity duration-150 ${
                isPaging ? "opacity-40" : "opacity-100"
              }`}
            >
              {paginatedGroups.length > 0 ? (
                paginatedGroups.map((group, groupIndex) => {
                  const globalIndex = (safeCurrentPage - 1) * pageSize + groupIndex + 1;
                  const isExpanded = expandedKeys.has(group.key);

                  return (
                    <React.Fragment key={group.key}>
                      {/* Master Row Pegawai */}
                      <tr
                        onClick={() => toggleExpand(group.key)}
                        className={`cursor-pointer transition-colors ${
                          isExpanded
                            ? "bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/60"
                            : "hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        {/* No */}
                        <td className="px-4 py-4 text-center font-mono font-bold text-slate-400">
                          {globalIndex}
                        </td>

                        {/* Pegawai Info */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {group.pegawaiAvatar ? (
                              <img
                                src={group.pegawaiAvatar}
                                alt={group.pegawaiNama}
                                className="h-10 w-10 rounded-2xl object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center font-black text-xs shrink-0 border border-emerald-200/50">
                                {group.pegawaiNama.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-black text-slate-900 dark:text-white text-sm truncate">
                                {group.pegawaiNama}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                NIP: {group.pegawaiNip} • {group.pegawaiJabatan}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Unit Kerja */}
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {group.pegawaiUnitKerja}
                          </span>
                        </td>

                        {/* Total LKH */}
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-black bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50">
                            {group.totalLkh} Laporan Harian
                          </span>
                        </td>

                        {/* Status Badges */}
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold">
                            {group.pendingCount > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                                {group.pendingCount} Pending
                              </span>
                            )}
                            {group.approvedCount > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                                {group.approvedCount} Disetujui
                              </span>
                            )}
                            {group.revisionCount > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
                                {group.revisionCount} Revisi
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Aksi */}
                        <td className="px-4 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {/* Tombol Cetak PDF Pegawai */}
                            <button
                              type="button"
                              onClick={() => handleExportPegawaiPDF(group)}
                              title="Cetak Rekap Draf LKH Pegawai Ini"
                              className="h-8 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 hover:text-emerald-700 font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
                            >
                              <Printer className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="hidden sm:inline">Cetak PDF</span>
                            </button>

                            {/* Tombol Toggle Buka/Tutup Accordion */}
                            <button
                              type="button"
                              onClick={() => toggleExpand(group.key)}
                              className={`h-8 px-3 rounded-xl font-black text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                                isExpanded
                                  ? "bg-emerald-600 text-white"
                                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100"
                              }`}
                            >
                              <span>{isExpanded ? "Tutup" : `Buka (${group.totalLkh})`}</span>
                              {isExpanded ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Detail Accordion Row: Daftar Seluruh LKH Harian Pegawai */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="p-0 bg-slate-50/60 dark:bg-slate-950/50">
                            <div className="p-4 sm:p-5 border-y border-emerald-200/60 dark:border-emerald-900/40 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                  <CalendarDays className="h-4 w-4 text-emerald-600" />
                                  <span>Rincian LKH Harian Pegawai – {group.pegawaiNama}</span>
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px]">
                                    {group.items.length} Laporan Tercatat
                                  </span>
                                </h4>
                              </div>

                              {/* Nested Table for Daily LKH entries */}
                              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead className="bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                                    <tr>
                                      <th className="px-3.5 py-3 w-10 text-center">No</th>
                                      <th className="px-3.5 py-3 min-w-[150px]">Tanggal & Jam</th>
                                      <th className="px-3.5 py-3 min-w-[280px]">Kegiatan Tugas Jabatan</th>
                                      <th className="px-3.5 py-3 min-w-[120px] text-center">Hasil</th>
                                      <th className="px-3.5 py-3 min-w-[90px] text-center">Bukti</th>
                                      <th className="px-3.5 py-3 min-w-[160px]">Status & Catatan</th>
                                      <th className="px-3.5 py-3 min-w-[130px] text-right">Aksi</th>
                                    </tr>
                                  </thead>

                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                    {group.items.map((item, itemIdx) => {
                                      let formattedDate = item.tanggal;
                                      try {
                                        formattedDate = format(new Date(item.tanggal), "EEEE, d MMM yyyy", {
                                          locale: localeId,
                                        });
                                      } catch (e) {}

                                      return (
                                        <tr
                                          key={item.id}
                                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                        >
                                          {/* Sub No */}
                                          <td className="px-3.5 py-3 text-center font-mono font-bold text-slate-400">
                                            {itemIdx + 1}
                                          </td>

                                          {/* Tanggal & Jam */}
                                          <td className="px-3.5 py-3 whitespace-nowrap">
                                            <div className="space-y-1">
                                              <div className="inline-flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                                                <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
                                                <span>{formattedDate}</span>
                                              </div>
                                              {item.waktuPelaksanaan && (
                                                <div>
                                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200/50 dark:border-teal-800/40">
                                                    <Clock className="h-2.5 w-2.5" />
                                                    <span>{item.waktuPelaksanaan}</span>
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </td>

                                          {/* Kegiatan */}
                                          <td className="px-3.5 py-3">
                                            <div className="max-w-md">
                                              <p className="text-slate-800 dark:text-slate-200 font-semibold leading-relaxed whitespace-pre-line">
                                                {item.kegiatanTugasJabatan}
                                              </p>
                                            </div>
                                          </td>

                                          {/* Hasil */}
                                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
                                              {item.hasil}
                                            </span>
                                          </td>

                                          {/* Bukti Dukung */}
                                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                                            {item.buktiDukungUrl ? (
                                              <a
                                                href={item.buktiDukungUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50 transition-colors"
                                                title="Lihat Berkas Bukti Dukung"
                                              >
                                                <ExternalLink className="h-3 w-3" />
                                                <span>Lihat</span>
                                              </a>
                                            ) : (
                                              <span className="text-slate-400 text-xs">-</span>
                                            )}
                                          </td>

                                          {/* Status & Catatan */}
                                          <td className="px-3.5 py-3">
                                            <div className="space-y-1 min-w-[130px]">
                                              <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                                  item.status === "approved"
                                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                                                    : item.status === "revision"
                                                    ? "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300"
                                                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                                                }`}
                                              >
                                                {item.status === "approved" ? (
                                                  <CheckCircle2 className="h-3 w-3" />
                                                ) : item.status === "revision" ? (
                                                  <AlertCircle className="h-3 w-3" />
                                                ) : (
                                                  <Clock className="h-3 w-3" />
                                                )}
                                                <span>
                                                  {item.status === "approved"
                                                    ? "Disetujui"
                                                    : item.status === "revision"
                                                    ? "Perlu Revisi"
                                                    : "Menunggu Review"}
                                                </span>
                                              </span>

                                              {item.komentarPimpinan && (
                                                <div
                                                  onClick={() => onDetail(item)}
                                                  className="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-200/50 line-clamp-2 cursor-pointer hover:bg-amber-100 transition-colors flex items-start gap-1"
                                                  title={item.komentarPimpinan}
                                                >
                                                  <MessageSquare className="h-3 w-3 shrink-0 mt-0.5 text-amber-600" />
                                                  <span>{item.komentarPimpinan}</span>
                                                </div>
                                              )}
                                            </div>
                                          </td>

                                          {/* Aksi */}
                                          <td className="px-3.5 py-3 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                              <button
                                                type="button"
                                                onClick={() => onReview(item)}
                                                title="Tinjau & Beri Evaluasi"
                                                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-2xs"
                                              >
                                                <UserCheck className="h-3 w-3" />
                                                <span>Tinjau</span>
                                              </button>

                                              <button
                                                type="button"
                                                onClick={() => onDetail(item)}
                                                title="Lihat Detail Lengkap"
                                                className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                                              >
                                                <Eye className="h-3 w-3" />
                                              </button>

                                              <button
                                                type="button"
                                                onClick={() => onDelete(item.id)}
                                                disabled={deletingId === item.id}
                                                title="Hapus Laporan Kinerja"
                                                className="h-7 w-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-600 text-rose-600 hover:text-white dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/50 flex items-center justify-center transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                                              >
                                                {deletingId === item.id ? (
                                                  <Loader2 className="h-3 w-3 animate-spin text-rose-600" />
                                                ) : (
                                                  <Trash2 className="h-3 w-3 text-rose-600" />
                                                )}
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="h-14 w-14 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <Inbox className="h-7 w-7" />
                      </div>
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                        Tidak Ada Data Pegawai
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Belum ada data laporan kinerja harian yang sesuai dengan kriteria pencarian dan filter yang dipilih.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* ───────────────────────────────────────────────────────── */
        /* MODE 2: FLAT VIEW (SETIAP BARIS HARIAN TAMPIL TERPISAH)   */
        /* ───────────────────────────────────────────────────────── */
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">No</th>
                <th className="px-4 py-3.5 min-w-[220px]">Pegawai</th>
                <th className="px-4 py-3.5 min-w-[150px]">Tanggal & Waktu</th>
                <th className="px-4 py-3.5 min-w-[280px]">Kegiatan Tugas Jabatan</th>
                <th className="px-4 py-3.5 min-w-[120px] text-center">Hasil</th>
                <th className="px-4 py-3.5 min-w-[100px] text-center">Bukti</th>
                <th className="px-4 py-3.5 min-w-[150px]">Status & Catatan</th>
                <th className="px-4 py-3.5 min-w-[120px] text-right">Aksi</th>
              </tr>
            </thead>

            <tbody
              className={`divide-y divide-slate-100 dark:divide-slate-800 font-medium transition-opacity duration-150 ${
                isPaging ? "opacity-40" : "opacity-100"
              }`}
            >
              {paginatedFlatItems.length > 0 ? (
                paginatedFlatItems.map((item, index) => {
                  const globalIndex = (safeCurrentPage - 1) * pageSize + index + 1;

                  let formattedDate = item.tanggal;
                  try {
                    formattedDate = format(new Date(item.tanggal), "d MMM yyyy", {
                      locale: localeId,
                    });
                  } catch (e) {}

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-400">
                        {globalIndex}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {item.pegawaiAvatar ? (
                            <img
                              src={item.pegawaiAvatar}
                              alt={item.pegawaiNama}
                              className="h-8 w-8 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center font-black text-[11px] shrink-0 border border-emerald-200/50">
                              {item.pegawaiNama ? item.pegawaiNama.slice(0, 2).toUpperCase() : "ASN"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 dark:text-white truncate">
                              {item.pegawaiNama || "Pegawai ASN"}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              NIP: {item.pegawaiNip || "-"}
                            </p>
                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 truncate">
                              {item.pegawaiUnitKerja || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                            <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{formattedDate}</span>
                          </div>
                          {item.waktuPelaksanaan && (
                            <div>
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200/50 dark:border-teal-800/40">
                                <Clock className="h-2.5 w-2.5" />
                                <span>{item.waktuPelaksanaan}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="max-w-md">
                          <p className="text-slate-800 dark:text-slate-200 font-semibold line-clamp-2 leading-relaxed whitespace-pre-line">
                            {item.kegiatanTugasJabatan}
                          </p>
                          {item.kegiatanTugasJabatan?.length > 90 && (
                            <button
                              type="button"
                              onClick={() => onDetail(item)}
                              className="text-[11px] text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-bold hover:underline mt-0.5 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Baca selengkapnya</span>
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
                          {item.hasil}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {item.buktiDukungUrl ? (
                          <a
                            href={item.buktiDukungUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50 transition-colors"
                            title="Lihat Berkas Bukti Dukung"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Lihat</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-1 min-w-[130px]">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              item.status === "approved"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                                : item.status === "revision"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                            }`}
                          >
                            {item.status === "approved" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : item.status === "revision" ? (
                              <AlertCircle className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            <span>
                              {item.status === "approved"
                                ? "Disetujui"
                                : item.status === "revision"
                                ? "Perlu Revisi"
                                : "Menunggu Review"}
                            </span>
                          </span>

                          {item.komentarPimpinan && (
                            <div 
                              onClick={() => onDetail(item)}
                              className="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-200/50 line-clamp-2 cursor-pointer hover:bg-amber-100 transition-colors flex items-start gap-1"
                              title={item.komentarPimpinan}
                            >
                              <MessageSquare className="h-3 w-3 shrink-0 mt-0.5 text-amber-600" />
                              <span>{item.komentarPimpinan}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onReview(item)}
                            title="Tinjau & Beri Evaluasi"
                            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-2xs"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Tinjau</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onDetail(item)}
                            title="Lihat Detail Lengkap"
                            className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDelete(item.id)}
                            disabled={deletingId === item.id}
                            title="Hapus Laporan Kinerja"
                            className="h-8 w-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-600 text-rose-600 hover:text-white dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/50 flex items-center justify-center transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-600" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5 text-rose-600 group-hover:text-white" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="h-14 w-14 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <Inbox className="h-7 w-7" />
                      </div>
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                        Tidak Ada Laporan Kinerja
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Belum ada data laporan kinerja harian yang sesuai dengan kriteria pencarian dan filter yang dipilih.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modern Numbered Pagination */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-slate-500 font-semibold">
          <span>
            Menampilkan{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              {(viewMode === "grouped" ? groupedPegawai : items).length === 0
                ? 0
                : (safeCurrentPage - 1) * pageSize + 1}
            </span>{" "}
            -{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              {Math.min(
                safeCurrentPage * pageSize,
                (viewMode === "grouped" ? groupedPegawai : items).length
              )}
            </span>{" "}
            dari{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              {(viewMode === "grouped" ? groupedPegawai : items).length}
            </span>{" "}
            {viewMode === "grouped" ? "pegawai" : "laporan"}
          </span>

          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-400">Per hal:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage <= 1}
              className="h-8 w-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {getPageNumbers().map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="h-8 w-8 flex items-center justify-center text-slate-400 font-black text-xs"
                  >
                    ...
                  </span>
                );
              }
              const pageNum = Number(p);
              const isActive = pageNum === safeCurrentPage;
              return (
                <button
                  key={`page-${pageNum}`}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  className={`h-8 min-w-[32px] px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-xs scale-105"
                      : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage >= totalPages}
              className="h-8 w-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
