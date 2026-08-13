import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
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
      const doc = new jsPDF("p", "mm", "a4");

      // Header Kop Surat Kemenag Barito Utara
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
      doc.text("DRAF LAPORAN KINERJA HARIAN (E-LK)", 105, 37, { align: "center" });

      // Metadata Info Box
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Nama Pegawai", 15, 45);
      doc.setFont("helvetica", "normal");
      doc.text(`: ${userName}`, 45, 45);

      doc.setFont("helvetica", "bold");
      doc.text("Bulan / Tahun", 15, 50);
      doc.setFont("helvetica", "normal");
      doc.text(`: ${monthName} ${year}`, 45, 50);

      doc.setFont("helvetica", "bold");
      doc.text("Instansi", 15, 55);
      doc.setFont("helvetica", "normal");
      doc.text(": Kantor Kementerian Agama Kab. Barito Utara", 45, 55);

      const tableColumn = ["No", "Tanggal", "Waktu", "Kegiatan Tugas Jabatan", "Kuantitas / Output"];
      const tableRows: any[] = [];

      if (rekap && rekap.length > 0) {
        rekap.forEach((item, index) => {
          let tglStr = item.tanggal;
          try {
            tglStr = format(new Date(item.tanggal), "EEEE, d MMMM yyyy", { locale: id });
          } catch (e) {}

          const rowData = [
            (index + 1).toString(),
            tglStr,
            item.waktuPelaksanaan || "-",
            item.kegiatanTugasJabatan || "-",
            item.hasil || "-"
          ];
          tableRows.push(rowData);
        });
      }

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
          valign: "middle"
        },
        headStyles: { 
          fillColor: [4, 120, 87], // Emerald 700
          textColor: 255,
          fontStyle: "bold",
          halign: "center"
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 10 },
          1: { cellWidth: 38 },
          2: { halign: "center", cellWidth: 28 },
          3: { cellWidth: 74 },
          4: { halign: "center", cellWidth: 30 }
        }
      });

      // Signature Block
      const finalY = (doc as any).lastAutoTable.finalY || 120;
      const pageHeight = doc.internal.pageSize.height;

      // Check page space for signatures
      if (finalY + 45 > pageHeight) {
        doc.addPage();
      }

      const sigY = finalY + 45 > pageHeight ? 30 : finalY + 12;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      // Left Signature (Pegawai)
      doc.text("Pegawai Yang Melaporkan,", 25, sigY);
      doc.text(userName, 25, sigY + 22);

      // Right Signature (Pejabat Penilai)
      doc.text(`Muara Teweh, ${format(new Date(), "d MMMM yyyy", { locale: id })}`, 135, sigY);
      doc.text("Pejabat Penilai / Atasan,", 135, sigY + 5);
      doc.text("( ................................................. )", 135, sigY + 22);

      doc.save(`Draf_LKH_${userName.replace(/\s+/g, "_")}_${monthName}_${year}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      type="button"
      onClick={handleExportPDF}
      disabled={isExporting || !rekap || rekap.length === 0}
      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 h-9 rounded-xl shadow-xs gap-2 shrink-0 cursor-pointer border-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Printer className="h-4 w-4" />
      )}
      <span>{isExporting ? "Mencetak Draf..." : "Cetak Draf LK Harian"}</span>
    </Button>
  );
}
