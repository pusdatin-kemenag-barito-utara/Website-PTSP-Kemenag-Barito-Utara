import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/lib/next-compat/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { 
  createLaporanKinerjaAction, 
  updateLaporanKinerjaAction,
  bulkCreateLaporanKinerjaAction 
} from "@/lib/actions/pegawai/e-lk";
import { toast } from "sonner";
import { Loader2, X, CheckCircle2, ClipboardList, Download, FileSpreadsheet, UploadCloud, FileText } from "lucide-react";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface LkhModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  onSuccess?: () => void;
}

export function LkhModal({ isOpen, onClose, initialData, onSuccess }: LkhModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"form" | "excel">("form");
  const [loading, setLoading] = useState(false);
  const [workDaysOption, setWorkDaysOption] = useState<"5" | "6">("5");

  // Form states
  const [tanggal, setTanggal] = useState("");
  const [waktuPelaksanaan, setWaktuPelaksanaan] = useState("");
  const [kegiatan, setKegiatan] = useState("");
  const [hasil, setHasil] = useState("");

  // Excel import states
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [excelPreview, setExcelPreview] = useState<Array<{
    tanggal: string;
    waktuPelaksanaan?: string;
    kegiatanTugasJabatan: string;
    hasil: string;
  }>>([]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      if (
        droppedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        droppedFile.type === "application/vnd.ms-excel" ||
        droppedFile.name.endsWith(".xlsx") ||
        droppedFile.name.endsWith(".xls")
      ) {
        // Trigger parsing process directly for dropped file
        const dummyEvent = {
          target: { files: [droppedFile] }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleFileUpload(dummyEvent);
      } else {
        toast.error("Format file tidak didukung. Mohon unggah file Excel (.xlsx atau .xls).");
      }
    }
  };

  const handleKegiatanKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = textarea.value;

      const newValue = currentValue.substring(0, start) + "\n- " + currentValue.substring(end);
      setKegiatan(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (initialData) {
        const formattedDate = initialData.tanggal
          ? new Date(initialData.tanggal).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];

        setTanggal(formattedDate);
        setWaktuPelaksanaan(initialData.waktuPelaksanaan || "");
        setKegiatan(initialData.kegiatanTugasJabatan || "");
        setHasil(initialData.hasil || "");
        setActiveTab("form");
      } else {
        setTanggal(new Date().toISOString().split("T")[0]);
        setWaktuPelaksanaan("");
        setKegiatan("- ");
        setHasil("");
        setSelectedFile(null);
        setExcelPreview([]);
        setActiveTab("form");
      }
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // Function to download formatted Excel template
  const handleDownloadTemplate = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Template LKH Harian");

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-indexed
      const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const monthLabel = `${monthNames[currentMonth]} ${currentYear}`;
      const schemeLabel = workDaysOption === "5" ? "5 HARI KERJA (SENIN - JUMAT)" : "6 HARI KERJA (SENIN - SABTU)";

      // Title header styling
      worksheet.mergeCells("A1:D1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = `TEMPLATE INPUT LAPORAN KINERJA HARIAN (E-LK) KEMENAG BARITO UTARA - BULAN ${monthLabel.toUpperCase()}`;
      titleCell.font = { name: "Arial", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
      titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF065F46" } };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      worksheet.getRow(1).height = 30;

      // Notice subheader
      worksheet.mergeCells("A2:D2");
      const noteCell = worksheet.getCell("A2");
      noteCell.value = `*Skema ${schemeLabel}. Tanggal di bawah diisi otomatis. Kolom berwarna MERAH adalah Hari Libur. Silakan isi kolom Kegiatan & Hasil pada hari kerja.`;
      noteCell.font = { name: "Arial", size: 8.5, italic: true, color: { argb: "FF065F46" } };
      noteCell.alignment = { horizontal: "left", vertical: "middle" };
      worksheet.getRow(2).height = 20;

      // Guidelines Panel Title (Column F & G)
      worksheet.mergeCells("F1:G1");
      const guideTitleCell = worksheet.getCell("F1");
      guideTitleCell.value = "📌 PETUNJUK & PANDUAN TEKNIS PENGISIAN LKH";
      guideTitleCell.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
      guideTitleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } }; // Dark Blue
      guideTitleCell.alignment = { horizontal: "center", vertical: "middle" };

      // Table headers
      const headers = [
        "Tanggal (DD-MM-YYYY)",
        "Waktu Pelaksanaan (Opsional)",
        "Kegiatan Tugas Jabatan *",
        "Kuantitas / Output Hasil *"
      ];

      const headerRow = worksheet.addRow(headers);
      headerRow.height = 25;
      headerRow.eachCell((cell) => {
        cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF047857" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin", color: { argb: "FFCBD5E1" } },
          bottom: { style: "medium", color: { argb: "FF047857" } },
          left: { style: "thin", color: { argb: "FFCBD5E1" } },
          right: { style: "thin", color: { argb: "FFCBD5E1" } },
        };
      });

      // Generate all dates for current month
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      let isFirstWorkDayProcessed = false;

      for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(currentYear, currentMonth, day);
        const dayOfWeek = dateObj.getDay(); // 0 = Minggu, 6 = Sabtu
        const formattedDay = String(day).padStart(2, "0");
        const formattedMonth = String(currentMonth + 1).padStart(2, "0");
        
        // Format Tanggal: DD-MM-YYYY
        const dateStr = `${formattedDay}-${formattedMonth}-${currentYear}`;

        // Determine off day based on 5 vs 6 work days option
        const isSunday = dayOfWeek === 0;
        const isSaturday = dayOfWeek === 6;
        const isOffDay = workDaysOption === "5" ? (isSunday || isSaturday) : isSunday;

        let offText = "LIBUR HARI MINGGU";
        if (isSaturday) offText = "LIBUR HARI SABTU";

        let sampleWaktu = "";
        if (!isOffDay) {
          if (!isFirstWorkDayProcessed) {
            sampleWaktu = "07.30 - 16.00 WIB";
            isFirstWorkDayProcessed = true;
          } else {
            sampleWaktu = "";
          }
        }

        const rowData = [
          dateStr,
          isOffDay ? "LIBUR" : sampleWaktu,
          isOffDay ? offText : "'- ", // Preset tanda petik 1 ' + tanda strip - ('- ) otomatis di awal penulisan
          isOffDay ? "-" : ""
        ];

        const row = worksheet.addRow(rowData);

        row.eachCell((cell, colNumber) => {
          if (isOffDay) {
            cell.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FF991B1B" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } }; // Soft Red background
            cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
          } else {
            cell.font = { name: "Arial", size: 10, bold: colNumber === 1 }; // Tanggal diset bold
            cell.alignment = {
              horizontal: colNumber === 1 || colNumber === 2 ? "center" : "left",
              vertical: "middle",
              wrapText: colNumber === 3 || colNumber === 4
            };
          }

          cell.border = {
            top: { style: "thin", color: { argb: "FFE2E8F0" } },
            bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
            left: { style: "thin", color: { argb: "FFE2E8F0" } },
            right: { style: "thin", color: { argb: "FFE2E8F0" } },
          };
        });
      }

      // Add Technical Guidelines content in Column F & G (Semua teks dibuat BOLD)
      const guidelines = [
        ["1. Format File & Kolom", "Format tabel & urutan kolom JANGAN diubah/dihapus agar sistem dapat membaca data."],
        ["2. Kolom Tanggal", "Tanggal diisi otomatis format DD-MM-YYYY. DILARANG mengubah format penulisan."],
        ["3. Waktu Pelaksanaan", "Opsional. Hanya diberi contoh di tanggal awal hari kerja, sisa nya diisi sendiri."],
        ["4. Penulisan Kegiatan", "Tanda `- ` sudah otomatis terisi di kolom C! Pegawai tinggal langsung mengetik kegiatan."],
        ["5. Kuantitas / Hasil", "Wajib diisi. Contoh: '1 Dokumen', '5 Berkas', '1 Laporan', '2 Kegiatan', dll."],
        ["6. Hari Libur", `Skema ${schemeLabel}. Baris berwarna MERAH (Libur) otomatis dilewati oleh sistem saat diunggah.`],
        ["7. Pengunggahan File", "Setelah selesai mengisi, simpan file lalu unggah kembali via menu 'Import Excel'."],
      ];

      guidelines.forEach((g, idx) => {
        const startRowIndex = 3 + (idx * 2);
        worksheet.mergeCells(`F${startRowIndex}:F${startRowIndex + 1}`);
        worksheet.mergeCells(`G${startRowIndex}:G${startRowIndex + 1}`);

        const numCell = worksheet.getCell(`F${startRowIndex}`);
        numCell.value = g[0];
        numCell.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FF1E3A8A" } }; // BOLD
        numCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFF6FF" } };
        numCell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
        numCell.border = {
          top: { style: "thin", color: { argb: "FFBFDBFE" } },
          bottom: { style: "thin", color: { argb: "FFBFDBFE" } },
          left: { style: "thin", color: { argb: "FFBFDBFE" } },
          right: { style: "thin", color: { argb: "FFBFDBFE" } },
        };

        const descCell = worksheet.getCell(`G${startRowIndex}`);
        descCell.value = g[1];
        descCell.font = { name: "Arial", size: 9, bold: true, color: { argb: "FF1E293B" } }; // BOLD agar sangat jelas
        descCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
        descCell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
        descCell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      });

      // Column widths
      worksheet.getColumn(1).width = 24; // Tanggal
      worksheet.getColumn(2).width = 28; // Waktu
      worksheet.getColumn(3).width = 50; // Kegiatan
      worksheet.getColumn(4).width = 30; // Hasil
      worksheet.getColumn(5).width = 5;  // Spacing column
      worksheet.getColumn(6).width = 25; // Guide Rule Title
      worksheet.getColumn(7).width = 65; // Guide Description (Perlebar dari 48 ke 65)

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, `Template_LKH_Harian_${workDaysOption}HariKerja_${monthNames[currentMonth]}_${currentYear}.xlsx`);
      toast.success(`Template Excel LKH (${workDaysOption} Hari Kerja) Bulan ${monthLabel} berhasil diunduh!`);
    } catch (err: any) {
      toast.error("Gagal mengunduh template Excel.");
    }
  };

  // Function to process uploaded Excel file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setLoading(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        toast.error("File Excel tidak memiliki worksheet yang valid.");
        setLoading(false);
        return;
      }

      const parsedItems: Array<{
        tanggal: string;
        waktuPelaksanaan?: string;
        kegiatanTugasJabatan: string;
        hasil: string;
      }> = [];

      // Read rows starting after header (row 4)
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 3) return; // Skip title and headers

        const col1 = row.getCell(1).text?.trim();
        const col2 = row.getCell(2).text?.trim();
        const col3 = row.getCell(3).text?.trim();
        const col4 = row.getCell(4).text?.trim();

        if (col1 && col3 && col4) {
          // Skip Sunday / Holiday Rows or empty work rows
          if (col3.toUpperCase().includes("LIBUR") || col4 === "-" || col3 === "-") {
            return;
          }

          // Parse DD-MM-YYYY to YYYY-MM-DD for database storing
          let formattedDate = col1;
          if (col1.includes("-")) {
            const parts = col1.split("-");
            if (parts.length === 3) {
              if (parts[0].length === 2 && parts[2].length === 4) {
                // DD-MM-YYYY -> YYYY-MM-DD
                formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
              }
            }
          } else if (col1.includes("T")) {
            formattedDate = col1.split("T")[0];
          }

          // Clean leading single quote if present in col3
          let cleanedKegiatan = col3;
          if (cleanedKegiatan.startsWith("'")) {
            cleanedKegiatan = cleanedKegiatan.substring(1).trim();
          }

          // Skip if empty or just strip
          if (cleanedKegiatan === "" || cleanedKegiatan === "-") {
            return;
          }

          parsedItems.push({
            tanggal: formattedDate,
            waktuPelaksanaan: col2 || undefined,
            kegiatanTugasJabatan: cleanedKegiatan,
            hasil: col4,
          });
        }
      });

      if (parsedItems.length === 0) {
        toast.error("Tidak ditemukan data LKH yang valid di dalam file Excel.");
      } else {
        setExcelPreview(parsedItems);
        toast.success(`Berhasil membaca ${parsedItems.length} data LKH dari Excel!`);
      }
    } catch (err: any) {
      toast.error("Gagal membaca file Excel. Pastikan format file sesuai.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async () => {
    if (excelPreview.length === 0) {
      toast.error("Tidak ada data LKH untuk diimpor.");
      return;
    }

    setLoading(true);
    try {
      const res = await bulkCreateLaporanKinerjaAction(excelPreview);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Berhasil mengimpor ${res.insertedCount} data LKH harian!`);
        onClose();
        if (onSuccess) onSuccess();
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat mengimpor LKH.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal || !kegiatan || !hasil) {
      toast.error("Mohon lengkapi semua field yang wajib diisi.");
      return;
    }

    setLoading(true);
    
    try {
      const data = {
        tanggal,
        waktuPelaksanaan: waktuPelaksanaan || undefined,
        kegiatanTugasJabatan: kegiatan,
        hasil,
      };

      const res = initialData?.id 
        ? await updateLaporanKinerjaAction(initialData.id, data)
        : await createLaporanKinerjaAction(data);

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(initialData?.id ? "LKH berhasil diubah!" : "LKH berhasil disimpan!");
        onClose();
        if (onSuccess) {
          onSuccess();
        }
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3.5 sm:p-6 md:p-8 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-y-auto animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header & Tabs */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/70">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                  {initialData ? "Ubah Laporan Kinerja Harian" : "Input Laporan Kinerja Harian"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Catat kegiatan tugas jabatan Anda secara manual atau impor via Excel.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Switcher Navigation Tab */}
          {!initialData && (
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab("form")}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "form"
                    ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Form Manual</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("excel")}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "excel"
                    ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Import Excel</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: Form Manual */}
        {activeTab === "form" && (
          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Tanggal Kegiatan" required>
                <ModernDatePicker 
                  value={tanggal} 
                  onChange={(val) => setTanggal(val)} 
                  required
                  name="tanggal"
                />
              </Field>

              <Field label="Waktu Pelaksanaan (Opsional)" hint="Misal: 07.30 - 16.00 WIB / 2 Jam">
                <Input 
                  type="text" 
                  value={waktuPelaksanaan} 
                  onChange={(e) => setWaktuPelaksanaan(e.target.value)} 
                  placeholder="Contoh: 07.30 - 16.00 WIB / 2 Jam"
                  className="h-12 rounded-2xl text-xs sm:text-sm font-semibold"
                />
              </Field>
            </div>

            <Field label="Kegiatan Tugas Jabatan" required hint="Deskripsikan kegiatan yang Anda lakukan hari ini">
              <textarea 
                value={kegiatan}
                onChange={(e) => setKegiatan(e.target.value)}
                onKeyDown={handleKegiatanKeyDown}
                placeholder="- Contoh: Menyusun laporan keuangan..."
                required
                className="w-full rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-xs placeholder:text-slate-400 transition-all duration-200 hover:border-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[100px] resize-y"
              />
            </Field>

            <Field label="Kuantitas/Output (Hasil)" required hint="Tuliskan jumlah hasil dari kegiatan tersebut">
              <Input 
                type="text" 
                value={hasil}
                onChange={(e) => setHasil(e.target.value)}
                placeholder="Contoh: 1 Dokumen, 5 Lembar, dll."
                required
                className="h-11 rounded-2xl text-xs sm:text-sm font-semibold"
              />
            </Field>

            {/* Modal Footer Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={loading}
                className="h-11 rounded-xl sm:rounded-2xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-extrabold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 gap-2"
              >
                <X className="h-4 w-4 text-slate-400" />
                <span>Batal</span>
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="h-11 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-black gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-95 border-0"
              >
                {loading ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4.5 w-4.5" />
                )}
                <span>{loading ? "Menyimpan..." : "Simpan LKH"}</span>
              </Button>
            </div>
          </form>
        )}

        {/* Tab 2: Upload Excel Template */}
        {activeTab === "excel" && (
          <div className="p-4 sm:p-7 space-y-4 sm:space-y-5">
            {/* Step 1: Unduh Template Excel */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-extrabold text-emerald-900 dark:text-emerald-200">
                    Langkah 1: Unduh Format Template Excel
                  </h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    Pilih skema hari kerja kantor Anda sebelum mengunduh template.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2 h-9 rounded-xl shadow-xs gap-1.5 shrink-0 cursor-pointer justify-center"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Unduh Template</span>
                </Button>
              </div>

              {/* Selector 5 vs 6 Hari Kerja */}
              <div className="pt-2.5 border-t border-emerald-200/60 dark:border-emerald-800/50 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <span className="text-[11px] font-extrabold text-emerald-900 dark:text-emerald-300 shrink-0">
                  Skema Kerja:
                </span>
                <div className="grid grid-cols-2 gap-1.5 w-full">
                  <button
                    type="button"
                    onClick={() => setWorkDaysOption("5")}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer text-center ${
                      workDaysOption === "5"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white/90 dark:bg-slate-900/90 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800"
                    }`}
                  >
                    5 Hari Kerja
                    <span className="block text-[9px] opacity-85 font-semibold">(Sabtu-Minggu Libur)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkDaysOption("6")}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer text-center ${
                      workDaysOption === "6"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white/90 dark:bg-slate-900/90 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800"
                    }`}
                  >
                    6 Hari Kerja
                    <span className="block text-[9px] opacity-85 font-semibold">(Minggu Libur)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Upload File Excel */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                Langkah 2: Unggah File Excel Yang Telah Diisi
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-100/60 dark:bg-emerald-900/40 scale-[1.01] shadow-lg shadow-emerald-500/10"
                    : "border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20"
                }`}
              >
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                  isDragging 
                    ? "bg-emerald-600 text-white scale-110" 
                    : "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-110"
                }`}>
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="text-xs">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 block mb-0.5">
                    {isDragging
                      ? "Lepaskan File Excel Di Sini!"
                      : selectedFile
                      ? selectedFile.name
                      : "Tarik & Lepas File Excel Ke Sini atau Klik Untuk Memilih"}
                  </span>
                  <span className="text-slate-400 font-medium">Format didukung: .xlsx atau .xls</span>
                </div>
              </div>
            </div>

            {/* Excel Preview Table */}
            {excelPreview.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">
                    Preview Data Excel ({excelPreview.length} Item Siap Diimpor):
                  </span>
                </div>
                <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {excelPreview.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-white dark:bg-slate-900 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{item.kegiatanTugasJabatan}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Hasil: {item.hasil} {item.waktuPelaksanaan ? `• Waktu: ${item.waktuPelaksanaan}` : ""}</p>
                      </div>
                      <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-mono text-[10px] shrink-0 font-bold">
                        {item.tanggal}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer Bulk Submit */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={loading}
                className="h-11 rounded-xl sm:rounded-2xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-extrabold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 gap-2"
              >
                <X className="h-4 w-4 text-slate-400" />
                <span>Batal</span>
              </Button>
              <Button 
                type="button"
                onClick={handleBulkSubmit}
                disabled={loading || excelPreview.length === 0}
                className="h-11 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-black gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-95 border-0 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4.5 w-4.5" />
                )}
                <span>{loading ? "Mengimpor..." : `Impor ${excelPreview.length} Data LKH`}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
