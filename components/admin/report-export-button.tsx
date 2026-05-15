"use client";

import { useState } from "react";
import { FileDown, FileText, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getRequestsForExport,
  getDocumentsForExport,
} from "@/lib/actions/export";

interface ReportExportButtonProps {
  type: "requests" | "documents";
  where: any;
  fileName: string;
}

export function ReportExportButton({
  type,
  where,
  fileName,
}: ReportExportButtonProps) {
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const fetchData = async () => {
    if (type === "requests") {
      return await getRequestsForExport(where);
    } else {
      return await getDocumentsForExport(where);
    }
  };

  const handleExportExcel = async () => {
    setLoadingExcel(true);
    try {
      const data = await fetchData();
      if (!data || data.length === 0) {
        toast.error("Tidak ada data untuk di-export.");
        return;
      }

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan");

      const colWidths = Object.keys(data[0]).map((key: string) => ({
        wch:
          Math.max(
            key.length,
            ...data.map((row: any) => (row[key] || "").toString().length),
          ) + 2,
      }));
      ws["!cols"] = colWidths;

      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const dataBlob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });

      saveAs(dataBlob, `${fileName}_${new Date().getTime()}.xlsx`);
      toast.success(`Excel berhasil diunduh.`);
    } catch (error) {
      console.error("Excel error:", error);
      toast.error("Gagal export Excel.");
    } finally {
      setLoadingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    setLoadingPdf(true);
    try {
      const data = await fetchData();
      if (!data || data.length === 0) {
        toast.error("Tidak ada data untuk di-export.");
        return;
      }

      const doc = new jsPDF({ orientation: "landscape" });

      // Header
      doc.setFontSize(14);
      doc.text("LAPORAN LAYANAN PTSP KEMENAG BARITO UTARA", 14, 15);
      doc.setFontSize(10);
      doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 22);

      const columns = Object.keys(data[0]);
      const rows = data.map((item: any) =>
        columns.map((col: string) => item[col]),
      );

      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 28,
        theme: "striped",
        headStyles: { fillColor: [5, 150, 105] }, // Emerald Green
        styles: { fontSize: 8, cellPadding: 2 },
      });

      doc.save(`${fileName}_${new Date().getTime()}.pdf`);
      toast.success(`PDF berhasil diunduh.`);
    } catch (error) {
      console.error("PDF error:", error);
      toast.error("Gagal export PDF.");
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        onClick={handleExportExcel}
        disabled={loadingExcel || loadingPdf}
        size="sm"
        className="h-9 px-3 flex items-center gap-2 rounded-xl font-bold uppercase tracking-wider text-[10px] bg-[#059669] hover:bg-[#047857] text-white border-none shadow-md transition-all active:scale-95"
      >
        {loadingExcel ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <FileDown className="h-3.5 w-3.5" />
        )}
        {loadingExcel ? "..." : "Excel"}
      </Button>

      <Button
        onClick={handleExportPdf}
        disabled={loadingExcel || loadingPdf}
        size="sm"
        className="h-9 px-3 flex items-center gap-2 rounded-xl font-bold uppercase tracking-wider text-[10px] bg-rose-600 hover:bg-rose-700 text-white border-none shadow-md transition-all active:scale-95"
      >
        {loadingPdf ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <FileText className="h-3.5 w-3.5" />
        )}
        {loadingPdf ? "..." : "PDF"}
      </Button>
    </div>
  );
}
