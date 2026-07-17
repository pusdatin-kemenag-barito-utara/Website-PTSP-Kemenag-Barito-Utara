"use client";

import { X, Download, Maximize, ZoomIn, ZoomOut, FileText, CalendarDays } from "lucide-react";
import { useState, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { SuratPelaksanaanCutiDocument } from "./surat-pelaksanaan-cuti-document";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";

interface SuratPelaksanaanCutiModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    nama: string;
    nip: string;
    pangkatGolongan?: string;
    jabatan: string;
    unitKerja: string;
    jenisCuti: string;
    jenisPegawai?: string;
    alasan: string;
    tanggalMulai: string;
    tanggalSelesai: string;
    alamatCuti: string;
    nomorNaskah?: string;
    tanggalNaskah?: string;
  };
  pejabatList?: any[];
}

function formatDateDisplay(isoDate: string) {
  if (!isoDate) return "";
  try {
    const d = new Date(isoDate);
    return format(d, "dd/MM/yyyy");
  } catch {
    return isoDate;
  }
}

export function SuratPelaksanaanCutiModal({ isOpen, onClose, data, pejabatList = [] }: SuratPelaksanaanCutiModalProps) {
  const [zoom, setZoom] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tanggalNaskah, setTanggalNaskah] = useState(
    () => data.tanggalNaskah?.slice(0, 10) || new Date().toISOString().slice(0, 10)
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleFit = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      if (containerWidth < 800) {
        setZoom((containerWidth - 32) / 800);
      } else {
        setZoom(1);
      }
    }
  };

  const handleDownloadWord = async () => {
    if (isDownloading) return;
    try {
      setIsDownloading(true);
      const toastId = toast.loading("Menyiapkan dokumen Word...");

      const {
        Document, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell,
        WidthType, BorderStyle, Packer, VerticalAlign, TableBorders,
      } = await import("docx");
      const { saveAs } = await import("file-saver");
      const { countDaysBetween, terbilang } = await import("@/lib/utils");

      const lamaCuti = countDaysBetween(data.tanggalMulai, data.tanggalSelesai);
      const lamaTerbilang = terbilang(lamaCuti)
        .split(" ")
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");

      const formatTgl = (tgl: string) => {
        try { return format(new Date(tgl), "dd MMMM yyyy", { locale: localeId }); } catch { return tgl; }
      };
      const formatNamaCapital = (s: string | null | undefined) =>
        s ? s.split(" ").map((w: string) => w.toUpperCase()).join(" ") : "...............................";

      const tanggalNaskahStr = tanggalNaskah
        ? format(new Date(tanggalNaskah), "dd MMMM yyyy", { locale: localeId })
        : "...............";
      const jenisCutiBersih = data.jenisCuti ? data.jenisCuti.replace("Cuti ", "") : "Tahunan";
      const titleCuti = `SURAT PELAKSANAAN CUTI ${jenisCutiBersih.toUpperCase()}`;

      // Helper creators
      const a = (text: string, size = 22, bold = false, underline = false) =>
        new TextRun({ text, font: "Arial", size, bold, ...(underline ? { underline: {} } : {}) });

      const noBorder = {
        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      };

      const cell = (children: any[], widthPct: number) => new TableCell({
        width: { size: `${widthPct}%`, type: WidthType.PERCENTAGE },
        borders: noBorder,
        verticalAlign: VerticalAlign.CENTER,
        children,
      });

      const lampiranLines = data.jenisPegawai === "PPPK"
        ? ["LAMPIRAN II", "PERATURAN BADAN KEPEGAWAIAN NEGARA", "REPUBLIK INDONESIA", "NOMOR 7 TAHUN 2022", "TATA CARA PEMBERIAN CUTI PEGAWAI", "PEMERINTAH DENGAN PERJANJIAN KERJA"]
        : ["ANAK LAMPIRAN I.c", "PERATURAN BADAN KEPEGAWAIAN", "NEGARA REPUBLIK INDONESIA", "NOMOR 24 TAHUN 2017", "TATA CARA PEMBERIAN CUTI PEGAWAI", "NEGERI SIPIL"];

      // ── KOP Table (logo placeholder + teks KOP + garis bawah) ──────────────────
      const kopTable = new Table({
        width: { size: "100%", type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          bottom: { style: BorderStyle.DOUBLE, size: 6, color: "000000", space: 4 },
        },
        rows: [
          new TableRow({
            children: [
              // Logo placeholder (kosong)
              cell([new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [a("🕌", 60)] })], 12),
              // Teks KOP
              cell([
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [a("KEMENTERIAN AGAMA REPUBLIK INDONESIA", 28, true)] }),
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [a("KANTOR KEMENTERIAN AGAMA KABUPATEN BARITO UTARA", 24, true)] }),
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 }, children: [a("Jalan Ahmad Yani Nomor 126 Muara Teweh 73811", 18)] }),
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 }, children: [a("Telepon/Faximili (0519) 21269, 21047, 21772, 21894", 18)] }),
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [a("e-mail: baritoutara@kemenag.go.id   website: https://baritoutara.kemenag.go.id", 18)] }),
              ], 88),
            ],
          }),
        ],
      });

      // ── Lampiran Table (kiri kosong | kanan teks lampiran) ─────────────────────
      const lampiranTable = new Table({
        width: { size: "100%", type: WidthType.PERCENTAGE },
        borders: { top: noBorder.top, bottom: noBorder.bottom, left: noBorder.left, right: noBorder.right, insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } },
        rows: [
          new TableRow({
            children: [
              cell([new Paragraph({ children: [] })], 50),
              cell([
                ...lampiranLines.map(line =>
                  new Paragraph({ spacing: { after: 20 }, children: [a(line)] })
                ),
                new Paragraph({ spacing: { after: 20 }, children: [] }),
                new Paragraph({ spacing: { after: 60 }, children: [a(`Muara Teweh, ${tanggalNaskahStr}`)] }),
              ], 50),
            ],
          }),
        ],
      });

      // ── Identitas Table (label | colon | value) ────────────────────────────────
      const identRows = [
        ["Nama", formatNamaCapital(data.nama)],
        ["NIP", data.nip || "..............................."],
        ["Pangkat, Gol.Ruang", data.pangkatGolongan || "..............................."],
        ["Jabatan", data.jabatan || "..............................."],
        ["Unit Kerja", `${data.unitKerja || "..............................."}`],
        ["", "Lingkup Kantor Kementerian Agama Kab. Barito Utara"],
      ];
      const identTable = new Table({
        width: { size: "85%", type: WidthType.PERCENTAGE },
        indent: { size: 720, type: WidthType.DXA },
        borders: { top: noBorder.top, bottom: noBorder.bottom, left: noBorder.left, right: noBorder.right, insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } },
        rows: identRows.map(([label, value]) =>
          new TableRow({
            children: [
              new TableCell({ width: { size: "30%", type: WidthType.PERCENTAGE }, borders: noBorder, children: [new Paragraph({ spacing: { after: 40 }, children: [a(label)] })] }),
              new TableCell({ width: { size: "5%", type: WidthType.PERCENTAGE }, borders: noBorder, children: [new Paragraph({ spacing: { after: 40 }, children: [a(label ? ":" : "")] })] }),
              new TableCell({ width: { size: "65%", type: WidthType.PERCENTAGE }, borders: noBorder, children: [new Paragraph({ spacing: { after: 40 }, children: [a(value)] })] }),
            ],
          })
        ),
      });

      // ── Ketentuan a/b Table ────────────────────────────────────────────────────
      const ketentuanTable = new Table({
        width: { size: "85%", type: WidthType.PERCENTAGE },
        indent: { size: 1080, type: WidthType.DXA },
        borders: { top: noBorder.top, bottom: noBorder.bottom, left: noBorder.left, right: noBorder.right, insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } },
        rows: [
          new TableRow({
            children: [
              new TableCell({ width: { size: "5%", type: WidthType.PERCENTAGE }, borders: noBorder, verticalAlign: VerticalAlign.TOP, children: [new Paragraph({ children: [a("a.")] })] }),
              new TableCell({ width: { size: "95%", type: WidthType.PERCENTAGE }, borders: noBorder, children: [new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 80 }, children: [a(`Sebelum menjalankan Cuti ${jenisCutiBersih}, wajib menyerahkan pekerjaannya kepada atasan langsungnya atau pejabat lain yang ditunjuk;`)] })] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ width: { size: "5%", type: WidthType.PERCENTAGE }, borders: noBorder, verticalAlign: VerticalAlign.TOP, children: [new Paragraph({ children: [a("b.")] })] }),
              new TableCell({ width: { size: "95%", type: WidthType.PERCENTAGE }, borders: noBorder, children: [new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 40 }, children: [a(`Setelah selesai menjalankan Cuti ${jenisCutiBersih}, `), a("Wajib", 22, true), a(` melaporkan diri kepada atasan langsungnya dan bekerja kembali sebagaimana mestinya.`)] })] }),
            ],
          }),
        ],
      });

      // ── Point 1 Table (angka | teks) ──────────────────────────────────────────
      const makePointTable = (num: string, text: any[]) => new Table({
        width: { size: "100%", type: WidthType.PERCENTAGE },
        borders: { top: noBorder.top, bottom: noBorder.bottom, left: noBorder.left, right: noBorder.right, insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } },
        rows: [new TableRow({
          children: [
            new TableCell({ width: { size: "5%", type: WidthType.PERCENTAGE }, borders: noBorder, verticalAlign: VerticalAlign.TOP, children: [new Paragraph({ children: [a(num)] })] }),
            new TableCell({ width: { size: "95%", type: WidthType.PERCENTAGE }, borders: noBorder, children: [new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 60 }, children: text })] }),
          ],
        })],
      });

      const doc = new Document({
        styles: { default: { document: { run: { font: "Arial", size: 22 } } } },
        sections: [{
          properties: {
            page: {
              size: { width: 12240, height: 15840 },
              margin: { top: 1080, right: 1080, bottom: 1080, left: 1260 },
            },
          },
          children: [
            kopTable,
            new Paragraph({ children: [] }),

            lampiranTable,

            // Judul
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [a(titleCuti, 24, true, true)] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [a("Nomor : ${nomor_naskah}")] }),

            // Point 1
            makePointTable("1.", [a(`Diberikan Izin sementara untuk melaksanakan Cuti ${jenisCutiBersih} Kepada Pegawai Negeri Sipil :`)]),

            // Identitas
            identTable,

            // Selama paragraph
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              indent: { left: 720 },
              spacing: { before: 80, after: 80 },
              children: [
                a("Selama "),
                a(`${lamaCuti} (${lamaTerbilang}) hari kerja terhitung mulai Tanggal ${formatTgl(data.tanggalMulai)} s.d ${formatTgl(data.tanggalSelesai)}`, 22, true),
                a(", dengan ketentuan sebagai berikut :"),
              ],
            }),

            // Ketentuan a/b
            ketentuanTable,

            // Point 2, 3, 4
            makePointTable("2.", [a(`Alasan melaksanakan cuti, ${data.alasan};`)]),
            makePointTable("3.", [a(`Alamat selama cuti berlangsung, ${data.alamatCuti};`)]),
            makePointTable("4.", [a(`Demikian surat pelaksanaan Cuti ${jenisCutiBersih} ini dibuat untuk dapat dipergunakan sebagaimana mestinya.`)]),

            new Paragraph({ children: [] }),
            new Paragraph({ children: [] }),

            // Tanda Tangan (tabel kosong | TTD kanan)
            new Table({
              width: { size: "100%", type: WidthType.PERCENTAGE },
              borders: { top: noBorder.top, bottom: noBorder.bottom, left: noBorder.left, right: noBorder.right, insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } },
              rows: [new TableRow({
                children: [
                  cell([new Paragraph({ children: [] })], 55),
                  cell([
                    new Paragraph({ children: [a("Kepala Kantor Kabupaten,")] }),
                    new Paragraph({ children: [] }),
                    new Paragraph({ children: [] }),
                    new Paragraph({ children: [] }),
                    new Paragraph({ children: [] }),
                    new Paragraph({ indent: { left: 500 }, children: [a("${ttd_pengirim}")] }),
                    new Paragraph({ children: [] }),
                    new Paragraph({ children: [] }),
                    new Paragraph({ children: [] }),
                    new Paragraph({ children: [a("${nama_pengirim}")] }),
                  ], 45),
                ],
              })],
            }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Surat_Pelaksanaan_Cuti_${data.nama}_${data.nip}.docx`);
      toast.success("Dokumen Word berhasil diunduh!", { id: toastId });
    } catch (error) {
      console.error("Word generation failed:", error);
      toast.error("Gagal membuat dokumen Word.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-hidden">
        <m.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-100 w-full max-w-6xl h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-slate-200 shrink-0 gap-3">
            <div className="shrink-0">
              <h2 className="text-sm font-bold text-slate-800 leading-tight">
                Generate Surat Pelaksanaan Cuti
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pratinjau dokumen sebelum diunduh
              </p>
            </div>

            {/* Modern Date Picker */}
            <div className="relative hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 cursor-pointer hover:border-slate-300 transition-colors"
              onClick={() => {
                const input = document.getElementById("tanggal-naskah-input") as HTMLInputElement;
                if (input) input.showPicker?.();
              }}
            >
              <CalendarDays className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-slate-400 leading-none">Tanggal Naskah</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{formatDateDisplay(tanggalNaskah)}</p>
              </div>
              <input
                id="tanggal-naskah-input"
                type="date"
                value={tanggalNaskah}
                onChange={(e) => setTanggalNaskah(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadWord}
                disabled={isDownloading}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                {isDownloading ? "Memproses..." : "Download Word"}
              </button>

              <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block" />

              <button
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-center gap-2 shrink-0 overflow-x-auto">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
              className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              title="Perkecil"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-slate-600 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
              className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              title="Perbesar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-300 mx-1" />
            <button
              onClick={handleFit}
              className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              title="Sesuaikan Layar"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>

          {/* Document Container */}
          <div
            ref={containerRef}
            className="flex-1 overflow-auto bg-slate-100/50 relative p-4 sm:p-8"
          >
            <div
              className="mx-auto transition-transform origin-top flex items-start justify-center"
              style={{
                transform: `scale(${zoom})`,
                width: "max-content",
              }}
            >
              <div className="shadow-2xl ring-1 ring-slate-900/5 bg-white">
                <SuratPelaksanaanCutiDocument
                  ref={contentRef}
                  data={{ ...data, tanggalNaskah }}
                  pejabatList={pejabatList}
                />
              </div>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="p-4 bg-white border-t border-slate-200 sm:hidden flex flex-col gap-2 shrink-0">
            {/* Mobile date picker */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 relative"
              onClick={() => {
                const input = document.getElementById("tanggal-naskah-mobile") as HTMLInputElement;
                if (input) input.showPicker?.();
              }}
            >
              <CalendarDays className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-slate-400 leading-none">Tanggal Naskah</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{formatDateDisplay(tanggalNaskah)}</p>
              </div>
              <input
                id="tanggal-naskah-mobile"
                type="date"
                value={tanggalNaskah}
                onChange={(e) => setTanggalNaskah(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full"
              />
            </div>
            <button
              onClick={handleDownloadWord}
              disabled={isDownloading}
              className="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium"
            >
              <Download className="w-4 h-4" />
              Download Word
            </button>
          </div>
        </m.div>
      </div>
    </AnimatePresence>
  );
}
