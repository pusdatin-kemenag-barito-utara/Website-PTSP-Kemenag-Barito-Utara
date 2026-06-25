"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface CetakDrafButtonProps {
  rekap: any[];
  monthName: string;
  year: number;
  userName: string;
}

export function CetakDrafButton({ rekap, monthName, year, userName }: CetakDrafButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF("p", "pt", "a4");

      // Kop Surat Header
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("KEMENTERIAN AGAMA KABUPATEN BARITO UTARA", 40, 40);
      
      doc.setFontSize(12);
      doc.text("LAPORAN KINERJA HARIAN (DRAF)", 40, 60);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Nama Pegawai : ${userName}`, 40, 85);
      doc.text(`Bulan/Tahun  : ${monthName} ${year}`, 40, 100);

      const tableColumn = ["No", "Tanggal", "Jumlah Kegiatan"];
      const tableRows: any[] = [];

      if (rekap && rekap.length > 0) {
        rekap.forEach((item, index) => {
          const tanggalFormat = format(new Date(item.tanggal), "EEEE, d MMMM yyyy", { locale: id });
          const rowData = [
            index + 1,
            tanggalFormat,
            item.totalKegiatan.toString()
          ];
          tableRows.push(rowData);
        });
      }

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 120,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [5, 150, 105], textColor: 255 },
      });

      doc.save(`Draf_LKH_${userName.replace(/\s+/g, "_")}_${monthName}_${year}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="h-8 text-xs font-bold gap-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
      onClick={handleExportPDF}
      disabled={isExporting || !rekap || rekap.length === 0}
    >
      <Download className={`h-3.5 w-3.5 ${isExporting ? "animate-bounce" : ""}`} /> 
      {isExporting ? "Mencetak..." : "Cetak Draf"}
    </Button>
  );
}
